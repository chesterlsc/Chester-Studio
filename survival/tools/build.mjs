#!/usr/bin/env node
// Builds the static book: chapter pages, part pages, home, print edition, sources, tools, search index, service worker.
// Usage: node survival/tools/build.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parse } from 'node-html-parser';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const O = JSON.parse(readFileSync(join(SRC, 'outline.json'), 'utf8'));
const BOOK = O.book;
const SITE = 'https://chesterstudio.space/survival/';

const BOX = {
  danger: ['☠️', 'Danger'], warn: ['⚠️', 'Caution'], tip: ['💡', 'Tip'], fact: ['📊', 'Key fact'],
  baby: ['👶', 'Babies & children'], dog: ['🐕', 'Dogs & pets'], women: ['🌸', 'Women & girls'], elder: ['🧓', 'Elderly & disabled'],
  long: ['⏳', 'The 30-year view'], practice: ['🎯', 'Practice now'], buy: ['🛒', 'Get it before you need it'], watch: ['▶️', 'Watch & save while the internet works'],
};
const WHEN = { '72h': ['t-72h', 'First 72 h'], '30d': ['t-30d', 'First 30 days'], '1y': ['t-1y', 'Year 1'], '30y': ['t-30y', 'Long haul'] };
const PRI = O.priorities;
const WIDGET_NAMES = { metronome: 'CPR metronome', timer: 'Timer', 'calc-water': 'Water calculator', 'calc-bleach': 'Bleach calculator', 'calc-food': 'Food calculator', 'calc-ors': 'Oral rehydration calculator' };

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const words = s => (s.match(/[A-Za-z0-9°%$£€][^\s]*/g) || []).length;
const textOf = el => el.textContent.replace(/\s+/g, ' ').trim();
const slug = s => s.toLowerCase().replace(/&[a-z]+;/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'section';
const write = (rel, content) => { const p = join(ROOT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, content); };

// ---------- Load chapters ----------
const parts = O.parts.map(p => ({ ...p, chapters: [] }));
const partById = Object.fromEntries(parts.map(p => [p.id, p]));
const all = O.chapters.map((c, i) => ({ ...c, num: i + 1, partObj: partById[c.part] }));
const numById = Object.fromEntries(all.map(c => [c.id, c.num]));
const chapters = [];
for (const c of all) {
  const f = join(SRC, 'chapters', c.id + '.html');
  if (!existsSync(f)) {
    // DEMO=1 fills a few missing chapters with the component example so the layout can be previewed.
    if (!(process.env.DEMO && !c.partObj.chapters.length)) continue;
    c.src = readFileSync(join(SRC, 'chapters', '_example.html'), 'utf8');
  } else c.src = readFileSync(f, 'utf8');
  chapters.push(c);
  c.partObj.chapters.push(c);
}
const idx = Object.fromEntries(chapters.map((c, i) => [c.id, i]));
const has = id => idx[id] !== undefined;
const partLabel = p => (p.num === 0 ? p.title : `Part ${p.num} · ${p.title}`);

// ---------- Transform a chapter ----------
function transform(c, mode) {
  const root = parse(c.src, { comment: false });
  const headings = [];
  const usedIds = new Set();
  // TL;DR
  const tldr = root.querySelector('aside.tldr');
  if (tldr) tldr.insertAdjacentHTML('afterbegin', '<p class="tldr-h">⚡ The 30-second version</p>');
  // h2 ids
  for (const h of root.querySelectorAll('h2')) {
    const t = textOf(h);
    let id = slug(t.replace(/^[^\p{L}\p{N}]+/u, ''));
    while (usedIds.has(id)) id += '-2';
    usedIds.add(id);
    h.setAttribute('id', id);
    h.insertAdjacentHTML('afterbegin', `<a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>`);
    headings.push({ id, text: t });
  }
  // boxes
  for (const b of root.querySelectorAll('aside.box')) {
    const type = (b.getAttribute('class') || '').split(/\s+/).find(k => BOX[k]);
    if (type) b.insertAdjacentHTML('afterbegin', `<span class="box-label">${BOX[type][0]} ${BOX[type][1]}</span>`);
    if (type === 'watch') for (const a of b.querySelectorAll('a')) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
  }
  // steps
  for (const ol of root.querySelectorAll('ol.steps')) {
    const n = ol.querySelectorAll(':scope > li').length || ol.childNodes.filter(x => x.rawTagName === 'li').length;
    ol.replaceWith(parse(`<div class="steps-wrap"><div class="steps-bar"><span>Step by step · ${n} steps</span><button class="play-btn no-print" type="button" data-play>▶ Play steps</button></div>${ol.toString()}</div>`));
  }
  // checklists
  for (const ul of root.querySelectorAll('ul.checklist')) {
    const did = ul.getAttribute('data-id') || c.id;
    const lis = ul.querySelectorAll('li');
    lis.forEach((li, i) => li.set_content(`<label><input type="checkbox" data-key="${esc(did)}:${i}"><span>${li.innerHTML}</span></label>`));
    ul.replaceWith(parse(`<div class="checklist-wrap" data-list="${esc(did)}"><div class="checklist-head"><span class="cl-count">0 / ${lis.length} done</span><span class="bar"><i></i></span></div>${ul.toString()}</div>`));
  }
  // flashcards
  for (const cards of root.querySelectorAll('.cards')) {
    for (const card of cards.querySelectorAll('.card')) {
      card.set_content(`<div class="card-in">${card.innerHTML}</div>`);
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Flashcard: ' + textOf(card.querySelector('.q') || card).slice(0, 90) + '. Press to flip.');
    }
    cards.insertAdjacentHTML('afterend', '<div class="cards-bar no-print"><button type="button" data-cards="flip">↻ Flip all</button><button type="button" data-cards="shuffle">🔀 Shuffle</button><button type="button" data-cards="reset">Reset</button></div>');
  }
  // figures
  root.querySelectorAll('figure.diagram').forEach((f, i) => f.setAttribute('data-fig', `${c.num}.${i + 1}`));
  // widgets
  for (const w of root.querySelectorAll('.widget')) {
    const name = WIDGET_NAMES[w.getAttribute('data-widget')] || 'Interactive tool';
    w.set_content(`<p class="w-print">${esc(name)}${w.getAttribute('data-label') ? ': ' + esc(w.getAttribute('data-label')) : ''}. Interactive in the digital edition.</p>`);
  }
  // xrefs + internal links
  for (const a of root.querySelectorAll('a')) {
    const href = a.getAttribute('href') || '';
    const m = href.match(/^([a-z0-9-]+)\.html(#.*)?$/);
    if (m) {
      if (!a.classList.contains('xref')) a.classList.add('xref');
      a.setAttribute('data-num', numById[m[1]] || '');
      if (mode === 'print') a.setAttribute('href', `#ch-${m[1]}`);
      else if (!has(m[1])) a.setAttribute('data-missing', '1');
    }
  }
  for (const a of root.querySelectorAll('ol.sources a')) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
  let html = root.toString();
  if (mode === 'print') {
    // Namespace every id in this chapter so the print edition has no collisions.
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
    for (const id of ids) {
      const re = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`(\\sid=")${re}"`, 'g'), `$1${c.id}--${id}"`)
        .replace(new RegExp(`(href="#)${re}"`, 'g'), `$1${c.id}--${id}"`)
        .replace(new RegExp(`(url\\(#)${re}\\)`, 'g'), `$1${c.id}--${id})`)
        .replace(new RegExp(`(aria-labelledby=")${re}"`, 'g'), `$1${c.id}--${id}"`);
    }
  }
  // metrics
  const plain = parse(c.src);
  plain.querySelectorAll('svg').forEach(n => n.remove());
  const srcList = plain.querySelector('ol.sources');
  const sources = srcList ? srcList.querySelectorAll('li').map(li => { const a = li.querySelector('a'); return { title: a ? textOf(a) : textOf(li), url: a ? a.getAttribute('href') : '', note: textOf(li.querySelector('.src-note') || parse('')) }; }) : [];
  plain.querySelectorAll('ol.sources').forEach(n => n.remove());
  const tl = plain.querySelector('aside.tldr');
  const tldrItems = tl ? tl.querySelectorAll('li').map(textOf) : [];
  // search sections
  const sections = [];
  let cur = { h: 'Summary', id: '', t: '' };
  for (const n of plain.childNodes) {
    if (n.nodeType !== 1) continue;
    if (n.rawTagName === 'h2') { if (cur.t) sections.push(cur); const t = textOf(n); cur = { h: t, id: headings.find(h => h.text === t)?.id || '', t: '' }; continue; }
    cur.t += ' ' + textOf(n);
  }
  if (cur.t) sections.push(cur);
  const wc = words(textOf(plain));
  return { html, headings, wc, sources, tldrItems, sections, figures: (c.src.match(/<figure class="diagram/g) || []).length };
}

for (const c of chapters) { c.page = transform(c, 'page'); }
const totals = {
  chapters: chapters.length,
  words: chapters.reduce((s, c) => s + c.page.wc, 0),
  sources: chapters.reduce((s, c) => s + c.page.sources.length, 0),
  uniqueSources: new Set(chapters.flatMap(c => c.page.sources.map(s => s.url))).size,
  figures: chapters.reduce((s, c) => s + c.page.figures, 0),
};
// Printed pages estimate: ~330 words per page plus a third of a page per figure, plus part openers.
totals.pages = Math.round(totals.words / 330 + totals.figures * 0.45 + chapters.length * 1.2 + parts.length);

// ---------- Shared chrome ----------
function head({ title, desc, rel, part, canonical, extraClass = '' }) {
  const color = part ? part.color : '#334155';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#101216">
<link rel="canonical" href="${SITE}${canonical || ''}">
<meta property="og:type" content="book">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<link rel="manifest" href="${rel}manifest.webmanifest">
<link rel="icon" href="${rel}assets/icon.svg" type="image/svg+xml">
<link rel="preload" href="${rel}assets/fonts/atkinson-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${rel}assets/book.css?v=${ASSET_V}">
<script>try{var d=document.documentElement,s=JSON.parse(localStorage.getItem('fm30:prefs')||'{}');if(s.theme&&s.theme!=='auto')d.dataset.theme=s.theme;if(s.size)d.dataset.size=s.size;if(s.spacing)d.dataset.spacing=s.spacing;}catch(e){}</script>
</head>
<body class="${extraClass}" style="--part:${color}" data-root="${rel}">
<a class="skip" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"><span></span></div>`;
}

function topbar(rel, { reader = false } = {}) {
  return `<header class="topbar">
  <a class="brand" href="${rel}index.html"><span class="brand-mark">30Y</span><span class="brand-name">${esc(BOOK.title)}</span></a>
  <button class="tb-btn" type="button" data-action="toc" aria-label="Contents">☰ <span class="lbl">Contents</span></button>
  <button class="tb-btn" type="button" data-action="search" aria-label="Search">🔍 <span class="lbl">Search</span> <kbd>/</kbd></button>
  ${reader ? `<button class="tb-btn" type="button" data-action="skim" aria-pressed="false" aria-label="Skim mode">⚡ <span class="lbl">Skim</span></button>
  <button class="tb-btn" type="button" data-action="read" aria-label="Read aloud">🔊 <span class="lbl">Read</span></button>` : ''}
  <button class="tb-btn" type="button" data-action="settings" aria-label="Display settings">Aa</button>
</header>`;
}

function drawer(rel, currentId) {
  const groups = parts.filter(p => p.chapters.length).map(p => {
    const open = p.chapters.some(c => c.id === currentId) ? ' open' : '';
    return `<details${open} style="--pc:${p.color}"><summary><span class="dot"></span>${p.icon} ${esc(p.title)}<span class="pcount">${p.chapters.length}</span></summary><ol>${p.chapters.map(c => `<li><a href="${rel}c/${c.id}.html" data-ch="${c.id}"${c.id === currentId ? ' aria-current="page"' : ''}><span class="n">${c.num}</span><span class="t">${esc(c.title)}</span></a></li>`).join('')}</ol></details>`;
  }).join('');
  return `<div class="scrim" data-close></div>
<nav class="drawer" id="drawer" aria-label="Contents" aria-hidden="true">
  <div class="drawer-head"><b>📕 Contents</b><button class="x-btn" type="button" data-close aria-label="Close contents">✕</button></div>
  <div class="drawer-links"><a href="${rel}index.html">🏠 Home & emergency index</a><a href="${rel}tools.html">🧮 Calculators & timers</a><a href="${rel}print.html">🖨️ Print the whole book / save PDF</a><a href="${rel}sources.html">📚 All ${totals.uniqueSources.toLocaleString()} sources</a></div>
  ${groups}
</nav>`;
}

function modals() {
  return `<div class="modal" id="search-modal" role="dialog" aria-modal="true" aria-label="Search the book">
  <div class="modal-card"><div class="modal-head">🔍<input type="search" id="search-input" placeholder="Search ${totals.chapters} chapters… (e.g. bleach, fever baby, dog chocolate)" autocomplete="off"><button class="x-btn" type="button" data-close>Esc</button></div>
  <div class="modal-body" id="search-results"><div class="s-empty">Type at least 2 letters. Works offline.</div></div></div>
</div>
<div class="modal" id="settings-modal" role="dialog" aria-modal="true" aria-label="Display settings">
  <div class="modal-card"><div class="modal-head"><b style="flex:1">Aa Display settings</b><button class="x-btn" type="button" data-close>✕</button></div>
  <div class="set-grid">
    <div class="set-row"><span>Theme</span><div class="seg" data-pref="theme"><button type="button" data-v="auto">Auto</button><button type="button" data-v="light">☀️ Light</button><button type="button" data-v="dark">🌙 Dark</button></div></div>
    <div class="set-row"><span>Text size</span><div class="seg" data-pref="size"><button type="button" data-v="s">A−</button><button type="button" data-v="">A</button><button type="button" data-v="l">A+</button><button type="button" data-v="xl">A++</button></div></div>
    <div class="set-row"><span>Spacing (easier for dyslexia and tired eyes)</span><div class="seg" data-pref="spacing"><button type="button" data-v="">Normal</button><button type="button" data-v="wide">Wide</button></div></div>
    <div class="set-row"><span>Read-aloud speed</span><div class="seg" data-pref="rate"><button type="button" data-v="0.85">Slow</button><button type="button" data-v="1">Normal</button><button type="button" data-v="1.25">Fast</button></div></div>
    <div class="set-row"><span>Your data</span><div class="seg"><button type="button" data-action="reset-progress">Reset reading progress & checklists</button></div></div>
  </div></div>
</div>
<div class="modal player" id="player-modal" role="dialog" aria-modal="true" aria-label="Step player">
  <div class="modal-card"><div class="modal-head"><b style="flex:1" id="player-title">Step by step</b><button class="x-btn" type="button" data-close>✕</button></div>
  <div class="player-bar"><i></i></div>
  <div class="player-stage" id="player-stage" aria-live="polite"></div>
  <div class="player-ctl"><button type="button" data-p="prev">◀ Back</button><button type="button" class="primary" data-p="auto">▶ Auto-play</button><button type="button" data-p="speak">🔊 Say it</button><span class="sp"></span><button type="button" class="primary" data-p="next">Next ▶</button></div></div>
</div>
<div class="speech-bar" id="speech-bar" role="status"><span id="speech-label">Reading aloud…</span><button type="button" data-speech="pause">⏸ Pause</button><button type="button" data-speech="stop">■ Stop</button></div>`;
}

function footer(rel) {
  return `<footer class="foot no-print"><div class="wrap">
  <div><b>${esc(BOOK.title)}</b> · ${esc(BOOK.subtitle)} · ${esc(BOOK.edition)}</div>
  <div>Facts only. Every claim links to its source. This book is general information, not a substitute for medical care, hands-on first-aid training or local emergency services. Use professional help whenever it exists.</div>
  <div><a href="${rel}index.html">Home</a> · <a href="${rel}tools.html">Calculators</a> · <a href="${rel}print.html">Print / PDF</a> · <a href="${rel}sources.html">Sources</a></div>
</div></footer>`;
}

const tail = rel => `${modals()}
<script src="${rel}assets/book.js?v=${ASSET_V}" defer></script>
</body>
</html>
`;

// ---------- Chapter pages ----------
let ASSET_V = createHash('sha1').update(readFileSync(join(ROOT, 'assets', 'book.css')) + readFileSync(join(ROOT, 'assets', 'book.js'))).digest('hex').slice(0, 8);

function chapterPage(c, i) {
  const p = c.partObj, P = c.page;
  const prev = chapters[i - 1], next = chapters[i + 1];
  const read = Math.max(1, Math.round(P.wc / 200));
  const pri = PRI[c.priority];
  const chips = [
    `<span class="chip">${pri.icon} ${pri.label}</span>`,
    `<span class="chip">⏱ ${read} min read</span>`,
    ...(c.when || []).map(w => `<span class="chip">${WHEN[w][1]}</span>`),
    `<span class="chip">📚 ${P.sources.length} sources</span>`,
  ].join('');
  const onpage = P.headings.map(h => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('');
  return `${head({ title: `${c.title} | ${BOOK.title}`, desc: (P.tldrItems[0] || c.title).slice(0, 160), rel: '../', part: p, canonical: `c/${c.id}.html`, extraClass: 'page-chapter' })}
${topbar('../', { reader: true })}
${drawer('../', c.id)}
<div class="ch-layout">
<main id="main" class="ch-main" data-chapter="${c.id}">
  <header class="ch-hero" data-num="${c.num}">
    <div class="crumbs"><a href="../p/${p.id}.html">${p.icon} ${esc(partLabel(p))}</a><span>Chapter ${c.num} of ${all.length}</span></div>
    <div class="ch-icon" aria-hidden="true">${c.icon}</div>
    <h1>${esc(c.title)}</h1>
    <div class="chips">${chips}</div>
  </header>
  <div class="ch-tools no-print"><button class="tb-btn" type="button" data-action="skim" aria-pressed="false">⚡ Skim mode</button><button class="tb-btn" type="button" data-action="read">🔊 Read aloud</button><button class="tb-btn" type="button" data-action="print">🖨️ Print chapter</button></div>
  <div class="skim-note" role="status">⚡ Skim mode: long paragraphs hidden. Boxes, steps, tables and diagrams stay.<button type="button" data-action="skim">Show all</button></div>
  <details class="onpage-inline no-print"><summary>📑 On this page (${P.headings.length} sections)</summary><ol>${onpage}</ol></details>
  <article class="ch-body">
${P.html}
  </article>
  <div class="ch-done"><button class="done-btn" type="button" data-action="done" aria-pressed="false">✓ Mark chapter as read</button><span class="chip light" id="done-note"></span></div>
  <nav class="pager" aria-label="Chapter navigation">${prev ? `<a class="prev" href="${prev.id}.html"><small>◀ Previous · ${prev.num}</small><span>${esc(prev.title)}</span></a>` : '<span></span>'}${next ? `<a class="next" href="${next.id}.html"><small>Next · ${next.num} ▶</small><span>${esc(next.title)}</span></a>` : ''}</nav>
</main>
<nav class="onpage" aria-label="On this page"><b>On this page</b><ol>${onpage}</ol></nav>
</div>
${footer('../')}
${tail('../')}`;
}

// ---------- Part pages ----------
function partPage(p) {
  const cards = p.chapters.map(c => {
    const pri = PRI[c.priority];
    return `<a class="ch-card" href="../c/${c.id}.html" data-ch="${c.id}"><div class="cc-top"><span class="cc-i">${c.icon}</span><span>Chapter ${c.num}</span><span>·</span><span>${pri.icon} ${pri.label}</span><span>·</span><span>⏱ ${Math.max(1, Math.round(c.page.wc / 200))} min</span></div><div class="cc-t">${esc(c.title)}</div><div class="cc-x">${esc((c.page.tldrItems[0] || '').slice(0, 170))}</div></a>`;
  }).join('');
  const i = parts.filter(x => x.chapters.length).indexOf(p);
  const list = parts.filter(x => x.chapters.length);
  const prev = list[i - 1], next = list[i + 1];
  return `${head({ title: `${partLabel(p)} | ${BOOK.title}`, desc: p.intro, rel: '../', part: p, canonical: `p/${p.id}.html`, extraClass: 'page-part' })}
${topbar('../')}
${drawer('../', null)}
<main id="main">
  <section class="part-hero"><div class="wrap"><div class="pi" aria-hidden="true">${p.icon}</div><div class="chip">${p.num === 0 ? 'Front matter' : 'Part ' + p.num} · ${p.chapters.length} chapters</div><h1>${esc(p.title)}</h1><p>${esc(p.intro)}</p></div></section>
  <section class="section"><div class="wrap"><div class="ch-cards">${cards}</div>
  <nav class="pager" aria-label="Part navigation" style="margin-top:2rem">${prev ? `<a class="prev" href="${prev.id}.html"><small>◀ Previous part</small><span>${prev.icon} ${esc(prev.title)}</span></a>` : '<span></span>'}${next ? `<a class="next" href="${next.id}.html"><small>Next part ▶</small><span>${next.icon} ${esc(next.title)}</span></a>` : ''}</nav></div></section>
</main>
${footer('../')}
${tail('../')}`;
}

// ---------- Home ----------
const EMERGENCY = [
  ['cpr-choking', '❤️', 'Not breathing / choking', 'CPR and choking steps'],
  ['severe-bleeding', '🩸', 'Heavy bleeding', 'Pressure, packing, tourniquet'],
  ['carbon-monoxide', '💨', 'Headache near a generator or stove', 'Carbon monoxide: get out'],
  ['sick-child-danger-signs', '🚨', 'Sick baby or child', 'Danger signs to act on'],
  ['childbirth', '👶', 'A baby is coming', 'Emergency birth step by step'],
  ['burns', '🔥', 'Burn', 'Cool water for 20 minutes'],
  ['cold-heat-illness', '🌡️', 'Too cold or overheated', 'Hypothermia, heat stroke'],
  ['dehydration-ors', '🥄', 'Diarrhea, dehydration', 'Oral rehydration recipe'],
  ['bites-stings', '🐍', 'Snakebite, sting, allergy', 'What to do and not do'],
  ['poisoning', '☠️', 'Swallowed something toxic', 'First steps'],
  ['dog-first-aid', '🐕', 'Dog hurt or poisoned', 'Dog first aid'],
  ['first-72-hours', '⏱️', 'The power just went out', 'The first 72 hours, in order'],
  ['disinfecting-water', '♨️', 'Need safe water now', 'Boil, bleach, tablets'],
  ['food-safety-no-fridge', '🧊', 'Is the fridge food safe?', 'Hours and rules'],
  ['floods', '🌊', 'Flood', 'Turn around, don’t drown'],
  ['nuclear-radiation', '☢️', 'Radiation warning', 'Get inside, stay inside'],
];
const ONE_HOUR = ['first-72-hours', 'what-kills-first', 'carbon-monoxide', 'disinfecting-water', 'cpr-choking', 'severe-bleeding', 'warm-without-heat', 'food-safety-no-fridge'];

function homePage() {
  const emerg = EMERGENCY.filter(e => has(e[0])).map(([id, ic, t, s]) => `<a href="c/${id}.html"><span class="e-i" aria-hidden="true">${ic}</span><span class="e-t">${esc(t)}<span class="e-s">${esc(s)} · ch. ${numById[id]}</span></span></a>`).join('');
  const oneHour = ONE_HOUR.filter(has).map(id => `<li><a href="c/${id}.html">${esc(all[numById[id] - 1].title)}</a></li>`).join('');
  const critical = chapters.filter(c => c.priority === 'critical');
  const firstCritical = critical[0];
  const partsGrid = parts.filter(p => p.chapters.length).map(p => `<a class="part-card" href="p/${p.id}.html" style="--pc:${p.color}" data-num="${p.num}" data-part="${p.id}"><span class="pi" aria-hidden="true">${p.icon}</span><span class="pn">${p.num === 0 ? 'Front matter' : 'Part ' + p.num}</span><span class="pt">${esc(p.title)}</span><span class="pc">${p.chapters.length} chapters · <span class="p-read">0</span> read</span><span class="pbar"><i></i></span></a>`).join('');
  const toc = parts.filter(p => p.chapters.length).map(p => `<div class="toc-part" data-part="${p.id}" style="--pc:${p.color}"><h3><span class="dot"></span>${p.icon} ${esc(partLabel(p))}</h3><ol>${p.chapters.map(c => `<li><a href="c/${c.id}.html" data-ch="${c.id}"><span class="n">${c.num}</span><span class="t">${esc(c.title)}</span><span class="pr" title="${PRI[c.priority].label}">${PRI[c.priority].icon}</span></a></li>`).join('')}</ol></div>`).join('');
  const legend = Object.values(PRI).map(p => `<li><b>${p.icon} ${p.label}</b>: ${esc(p.meaning)}</li>`).join('');
  return `${head({ title: `${BOOK.title}: ${BOOK.subtitle}`, desc: `${BOOK.tagline} ${totals.chapters} chapters, ${totals.uniqueSources.toLocaleString()} sources, works offline and prints as a book.`, rel: '', canonical: '', extraClass: 'page-home' })}
${topbar('')}
${drawer('', null)}
<main id="main">
<section class="cover"><div class="wrap cover-grid"><div>
  <div class="kicker">📕 ${esc(BOOK.edition)}</div>
  <h1>30 Years,<br><span>No Power.</span></h1>
  <p class="sub">${esc(BOOK.subtitle)}. ${esc(BOOK.tagline)}</p>
  <div class="cover-stats">
    <div><b>${totals.chapters}</b><span>chapters</span></div>
    <div><b>${(Math.round(totals.words / 1000)).toLocaleString()}k</b><span>words</span></div>
    <div><b>≈${totals.pages.toLocaleString()}</b><span>printed pages</span></div>
    <div><b>${totals.uniqueSources.toLocaleString()}</b><span>sources cited</span></div>
    <div><b>${totals.figures}</b><span>diagrams</span></div>
  </div>
  <div class="cta">
    ${has('introduction') ? '<a class="btn primary" href="c/introduction.html">📖 Start reading</a>' : ''}
    <a class="btn danger" href="#emergency">🚨 Emergency now</a>
    <a class="btn ghost" href="print.html">🖨️ Print / save PDF</a>
    <a class="btn ghost" href="tools.html">🧮 Calculators</a>
  </div>
  <div class="offline-status" id="offline-status">📥 Checking offline copy…</div>
</div>
<nav class="shelf" aria-label="Parts of the book">${parts.filter(p => p.chapters.length).map((p, i) => `<a href="p/${p.id}.html" style="--pc:${p.color};--h:${[86, 78, 92, 100, 96, 82, 88, 84, 90, 80, 76, 86, 74, 82, 90, 94, 72][i % 17]}%" title="${esc(partLabel(p))}"><span class="si">${p.icon}</span><span class="st">${esc(p.title)}</span><span class="sn">${p.num}</span></a>`).join('')}</nav>
</div></section>

<section class="section" id="emergency"><div class="wrap">
  <h2>🚨 Emergency right now?</h2>
  <p class="lede">Tap what is happening. Each page starts with the 30-second version, then step-by-step instructions. If emergency services exist, call them first.</p>
  <div class="emerg">${emerg}</div>
</div></section>

<section class="section" style="background:var(--bg-2)"><div class="wrap">
  <h2>🧭 Pick your path</h2>
  <p class="lede">You do not need to read 1,000 pages today. Start with the life-savers, then build up.</p>
  <div class="paths">
    <div class="path"><span class="when" style="color:var(--c-red)">⏱ 1 hour</span><h3>The life-savers</h3><p>The chapters that prevent the most common deaths in long blackouts.</p><ol>${oneHour}</ol></div>
    <div class="path"><span class="when" style="color:var(--c-orange)">📅 1 weekend</span><h3>Every 🔴 Critical chapter</h3><p>${critical.length} chapters you must know before anything goes wrong: water, first aid, birth, babies, cold, heat, carbon monoxide.</p>${firstCritical ? `<a class="btn line" href="c/${firstCritical.id}.html">Start the Critical path</a>` : ''}<p style="margin-top:.8rem">Tip: switch on ⚡ Skim mode to read only the boxes, steps and tables first.</p></div>
    <div class="path"><span class="when" style="color:var(--c-blue)">🗓 1 month</span><h3>The whole book</h3><p>Read one part a week. Tick the checklists as you go. Your progress is saved on this device.</p><div class="my-progress"><div class="ring" id="ring"><span id="ring-n">0%</span></div><div><b id="read-n">0</b> of ${totals.chapters} chapters read<br><span style="font-size:.8rem;color:var(--muted)" id="check-n">0 checklist items done</span></div></div></div>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <h2>📚 The ${parts.filter(p => p.chapters.length).length} parts</h2>
  <p class="lede">Each part has its own color, used on every page inside it.</p>
  <div class="parts-grid">${partsGrid}</div>
</div></section>

<section class="section" style="background:var(--bg-2)"><div class="wrap">
  <h2>✅ How the facts were checked</h2>
  <p class="lede">This book contains facts only: what official guidance says, what studies measured and what happened in real events. There are no theories and no predictions.</p>
  <div class="method">
    <div><b>1 · Researched</b><p>Each chapter was researched from official and scientific sources: WHO, CDC, FDA, USDA, EPA, FEMA, NOAA, the American Heart Association, Red Cross, Cochrane reviews and peer-reviewed journals, using the latest guidance available in 2026.</p></div>
    <div><b>2 · Fact-checked</b><p>A separate reviewer then re-checked every dose, temperature, time and number against sources, and removed anything that could not be verified.</p></div>
    <div><b>3 · Cited</b><p>Every claim links to its source: ${totals.sources.toLocaleString()} citations to ${totals.uniqueSources.toLocaleString()} sources. Tap a small number to see the source.</p></div>
    <div><b>4 · Honest about how it was made</b><p>The research, writing and checking were done with AI assistance (Claude by Anthropic), with each fact tied to a public source so you can verify it yourself.</p></div>
  </div>
  <div class="note-card" style="margin-top:1rem">⚠️ This is general information, not a substitute for professional medical care, hands-on first-aid and CPR training, or local emergency services. Take a first-aid course now while trainers still exist. Guidance changes: the date on every source tells you how current it is.</div>
</div></section>

<section class="section"><div class="wrap">
  <h2>📖 Full contents</h2>
  <ul class="lede" style="list-style:none;padding:0;display:grid;gap:.2rem">${legend}</ul>
  <div class="toc-full">${toc}</div>
</div></section>
</main>
${footer('')}
${tail('')}`;
}

// ---------- Print edition ----------
function printPage() {
  const toc = parts.filter(p => p.chapters.length).map(p => `<h3>${p.icon} ${esc(partLabel(p))}</h3><ol>${p.chapters.map(c => `<li><span class="n">${c.num}</span><a href="#ch-${c.id}">${esc(c.title)}</a></li>`).join('')}</ol>`).join('');
  const body = parts.filter(p => p.chapters.length).map(p => {
    const opener = `<section class="print-part" style="--part:${p.color}"><div class="pi">${p.icon}</div><div class="chip light">${p.num === 0 ? 'Front matter' : 'Part ' + p.num}</div><h1>${esc(p.title)}</h1><p>${esc(p.intro)}</p></section>`;
    const chs = p.chapters.map(c => {
      const P = transform(c, 'print');
      const pri = PRI[c.priority];
      return `<section class="print-chapter" id="ch-${c.id}" style="--part:${p.color}"><header class="ch-hero" data-num="${c.num}"><div class="crumbs"><span>${p.icon} ${esc(partLabel(p))}</span><span>Chapter ${c.num}</span></div><div class="ch-icon">${c.icon}</div><h1>${esc(c.title)}</h1><div class="chips"><span class="chip">${pri.icon} ${pri.label}</span>${(c.when || []).map(w => `<span class="chip">${WHEN[w][1]}</span>`).join('')}<span class="chip">📚 ${P.sources.length} sources</span></div></header><article class="ch-body">${P.html}</article></section>`;
    }).join('\n');
    return opener + chs;
  }).join('\n');
  return `${head({ title: `Print edition | ${BOOK.title}`, desc: 'The whole book on one page, ready to print or save as PDF.', rel: '', canonical: 'print.html', extraClass: 'print-book' })}
<div class="print-banner no-print"><span>🖨️ Whole book on one page (${totals.chapters} chapters, ≈${totals.pages.toLocaleString()} printed pages). Use your browser's Print → "Save as PDF", or print on paper.</span><button type="button" onclick="window.print()">Print / Save PDF</button><a href="index.html">← Back to the book</a></div>
<main id="main" class="wrap" style="max-width:52rem">
<section class="cover print-cover" style="background:none;color:var(--ink)"><div style="padding:3rem 0 2rem"><div class="kicker" style="color:var(--c-orange)">${esc(BOOK.edition)}</div><h1 style="font-size:3.6rem;line-height:1;margin:.6rem 0">30 Years,<br>No Power.</h1><p style="font-size:1.25rem;color:var(--ink-2)">${esc(BOOK.subtitle)}. ${esc(BOOK.tagline)}</p><p>${totals.chapters} chapters · ${totals.uniqueSources.toLocaleString()} sources · ${totals.figures} diagrams</p><p style="font-size:.85rem;color:var(--muted)">Facts only: every claim is cited with a source link. Research, writing and fact-checking were done with AI assistance and tied to public sources. Not a substitute for professional medical care or hands-on training.</p></div></section>
<section class="print-toc" style="break-before:page"><h2>Contents</h2>${toc}</section>
${body}
</main>
<script src="assets/book.js?v=${ASSET_V}" defer></script>
</body></html>
`;
}

// ---------- Sources page ----------
function sourcesPage() {
  const domains = {};
  for (const c of chapters) for (const s of c.page.sources) { try { const d = new URL(s.url).hostname.replace(/^www\./, ''); domains[d] = (domains[d] || 0) + 1; } catch { } }
  const top = Object.entries(domains).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([d, n]) => `<li>${esc(d)} <span style="color:var(--muted)">(${n})</span></li>`).join('');
  const groups = chapters.map(c => `<div class="src-group" id="src-${c.id}"><h3><a href="c/${c.id}.html">${c.num}. ${esc(c.title)}</a></h3><ol class="sources">${c.page.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>${s.note ? `<span class="src-note">${esc(s.note)}</span>` : ''}</li>`).join('')}</ol></div>`).join('');
  return `${head({ title: `All sources | ${BOOK.title}`, desc: `Every source cited in ${BOOK.title}.`, rel: '', canonical: 'sources.html' })}
${topbar('')}
${drawer('', null)}
<main id="main" class="wrap" style="max-width:56rem;padding-top:1.5rem">
<h1>📚 All sources</h1>
<p class="lede">${totals.sources.toLocaleString()} citations to ${totals.uniqueSources.toLocaleString()} different sources across ${totals.chapters} chapters. Most cited websites:</p>
<ol style="columns:2 14rem;font-size:.85rem">${top}</ol>
${groups}
</main>
${footer('')}
${tail('')}`;
}

// ---------- Tools page ----------
function toolsPage() {
  const tools = readFileSync(join(SRC, 'tools-page.html'), 'utf8');
  return `${head({ title: `Calculators & timers | ${BOOK.title}`, desc: 'Water, food, bleach and oral rehydration calculators, a CPR metronome and timers. Works offline.', rel: '', canonical: 'tools.html', extraClass: 'page-tools' })}
${topbar('')}
${drawer('', null)}
<main id="main" class="wrap" style="padding-top:1.5rem;padding-bottom:2rem">
<h1>🧮 Calculators & timers</h1>
<p class="lede">These work offline. Every number they use comes from the sources listed under each tool.</p>
<div class="ch-body">${tools}</div>
</main>
${footer('')}
${tail('')}`;
}

// ---------- Write everything ----------
rmSync(join(ROOT, 'c'), { recursive: true, force: true });
rmSync(join(ROOT, 'p'), { recursive: true, force: true });
chapters.forEach((c, i) => write(`c/${c.id}.html`, chapterPage(c, i)));
parts.filter(p => p.chapters.length).forEach(p => write(`p/${p.id}.html`, partPage(p)));
write('index.html', homePage());
write('print.html', printPage());
write('sources.html', sourcesPage());
if (existsSync(join(SRC, 'tools-page.html'))) write('tools.html', toolsPage());

// search index
const search = chapters.map(c => ({ id: c.id, n: c.num, t: c.title, p: c.partObj.title, i: c.icon, s: c.page.sections.map(s => ({ h: s.h, a: s.id, x: s.t.trim().slice(0, 2400) })) }));
write('search-index.json', JSON.stringify(search));

// manifest + icon
write('manifest.webmanifest', JSON.stringify({ name: `${BOOK.title}: ${BOOK.subtitle}`, short_name: '30 Years', start_url: './index.html', scope: './', display: 'standalone', background_color: '#101216', theme_color: '#101216', description: BOOK.tagline, icons: [{ src: 'assets/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] }, null, 2));
write('assets/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#101216"/><path d="M256 92c-60 70-96 120-96 170a96 96 0 0 0 192 0c0-50-36-100-96-170z" fill="#fb923c"/><text x="256" y="452" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="92" fill="#f4f1ea">30Y</text></svg>`);

// service worker: precache everything
const files = ['./', 'index.html', 'print.html', 'sources.html', 'tools.html', 'search-index.json', 'manifest.webmanifest', 'assets/book.css', 'assets/book.js', 'assets/icon.svg',
  ...readdirSync(join(ROOT, 'assets', 'fonts')).map(f => 'assets/fonts/' + f),
  ...chapters.map(c => `c/${c.id}.html`), ...parts.filter(p => p.chapters.length).map(p => `p/${p.id}.html`)].filter(f => f === './' || existsSync(join(ROOT, f)));
const hash = createHash('sha1');
for (const f of files) if (f !== './') hash.update(readFileSync(join(ROOT, f)));
const VERSION = hash.digest('hex').slice(0, 10);
write('sw.js', `// Service worker: keeps the whole book available offline. Generated by tools/build.mjs.
const VERSION = 'fm30-${VERSION}';
const FILES = ${JSON.stringify(files)};
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(FILES.map(f => c.add(new Request(f, { cache: 'reload' })).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('fm30-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => {
  if (e.data === 'status') caches.open(VERSION).then(c => c.keys()).then(k => e.source && e.source.postMessage({ type: 'status', cached: k.length, total: FILES.length, version: VERSION }));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
    const net = fetch(req).then(res => { if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
`);

const missing = all.filter(c => !has(c.id)).map(c => c.id);
console.log(`Built ${chapters.length}/${all.length} chapters · ${totals.words.toLocaleString()} words · ≈${totals.pages} printed pages · ${totals.uniqueSources} unique sources · ${totals.figures} diagrams · sw ${VERSION}`);
if (missing.length) console.log(`Missing ${missing.length}: ${missing.slice(0, 20).join(', ')}${missing.length > 20 ? '…' : ''}`);
