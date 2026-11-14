#!/usr/bin/env node
// Validates chapter fragments against STYLEGUIDE.md.
// Usage: node survival/tools/validate.mjs <file.html> [more files]   |   --all   |   --summary
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CH_DIR = join(ROOT, 'src', 'chapters');
const outline = JSON.parse(readFileSync(join(ROOT, 'src', 'outline.json'), 'utf8'));
const IDS = new Set(outline.chapters.map(c => c.id));

const HTML_TAGS = new Set('aside ul ol li p b strong em i h2 h3 h4 div span sup sub a table caption thead tbody tfoot tr th td figure figcaption kbd abbr code br hr small blockquote dl dt dd mark svg'.split(' '));
const SVG_TAGS = new Set('svg g path rect circle ellipse line polyline polygon text tspan title desc defs marker use symbol clippath pattern lineargradient radialgradient stop animate animatetransform animatemotion set mpath'.split(' '));
const BOX_TYPES = new Set('danger warn tip fact baby dog women elder long practice buy watch'.split(' '));
const KNOWN_CLASSES = new Set([
  'tldr', 'stats', 'stat', 'box', ...BOX_TYPES, 'steps', 'checklist', 'mythfact', 'myth', 'fact', 'compare', 'col', 'good', 'bad',
  'table-wrap', 'timeline', 'diagram', 'anim', 'widget', 'cards', 'card', 'q', 'a', 'sources', 'src-note', 'cite', 'xref',
  'tag', 't-72h', 't-30d', 't-1y', 't-30y', 'num', 'lead', 'note', 'wide',
  'd-line', 'd-line-muted', 'd-line-red', 'd-line-blue', 'd-line-green', 'd-line-orange',
  'd-fill-paper', 'd-fill-muted', 'd-fill-blue', 'd-fill-green', 'd-fill-red', 'd-fill-orange', 'd-fill-yellow', 'd-fill-brown', 'd-fill-purple', 'd-fill-teal', 'd-fill-sand', 'd-fill-ink',
  'd-text', 'd-text-sm', 'd-text-lg', 'd-text-muted', 'd-text-red', 'd-text-on', 'd-text-mid', 'd-text-end'
]);
const VISUALS = ['stats', 'steps', 'box', 'mythfact', 'compare', 'table-wrap', 'timeline', 'diagram', 'widget'];
const WIDGETS = new Set(['metronome', 'timer', 'calc-water', 'calc-bleach', 'calc-food', 'calc-ors']);
const BAD_DOMAINS = [/wikipedia\.org/i, /reddit\.com/i, /quora\.com/i, /pinterest\./i, /facebook\.com/i, /tiktok\.com/i, /medium\.com/i, /blogspot\./i, /wordpress\.com/i, /amazon\./i, /ebay\./i, /chatgpt|openai\.com/i];
const SPECULATION = [/experts believe/i, /it is (thought|believed|said)/i, /some (people )?(say|believe|claim)/i, /could possibly/i, /\bwill likely\b/i, /\bin a collapse,? .* will\b/i, /\bconspirac/i, /\bsheeple\b/i, /\bSHTF\b/, /\bTEOTWAWKI\b/];
const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|(red|blue|green|black|white|gray|grey|orange|yellow|purple|brown|pink|navy|teal|maroon|olive|silver|gold|cyan|magenta|lime|tan|beige|darkred|darkblue|darkgreen|lightblue|lightgray|lightgrey|darkgray|darkgrey)$)/i;

const words = s => (s.match(/[A-Za-z0-9°%$£€][^\s]*/g) || []).length;
const textOf = el => el.textContent.replace(/\s+/g, ' ').trim();

function allChecklistIds(except) {
  const map = new Map();
  if (!existsSync(CH_DIR)) return map;
  for (const f of readdirSync(CH_DIR)) {
    if (!f.endsWith('.html') || f.startsWith('_') || f === except) continue;
    const html = readFileSync(join(CH_DIR, f), 'utf8');
    for (const m of html.matchAll(/class="checklist"[^>]*data-id="([^"]+)"|data-id="([^"]+)"[^>]*class="checklist"/g)) map.set(m[1] || m[2], f);
  }
  return map;
}

export function validate(file) {
  const errors = [], warns = [];
  const E = m => errors.push(m), W = m => warns.push(m);
  const id = basename(file, '.html');
  const src = readFileSync(file, 'utf8');
  if (!IDS.has(id) && !id.startsWith('_')) E(`file name "${id}" is not a chapter id in outline.json`);
  if (/<!DOCTYPE|<html|<head|<body/i.test(src)) E('fragment must not contain <!DOCTYPE>, <html>, <head> or <body>');

  const root = parse(src, { comment: false, lowerCaseTagName: false, blockTextElements: { script: true, style: true } });
  const top = root.childNodes.filter(n => n.nodeType === 1);
  if (!top.length) { E('file is empty'); return { errors, warns, stats: {} }; }
  const isCls = (el, c) => (el.classList && el.classList.contains(c));
  if (!(top[0].rawTagName?.toLowerCase() === 'aside' && isCls(top[0], 'tldr'))) E('first element must be <aside class="tldr">');
  const last = top[top.length - 1];
  if (!(last.rawTagName?.toLowerCase() === 'ol' && isCls(last, 'sources'))) E('last element must be <ol class="sources">');

  // Walk all elements
  const all = root.querySelectorAll('*');
  const unknownClasses = new Set();
  for (const el of all) {
    const tag = (el.rawTagName || '').toLowerCase();
    const inSvg = tag === 'svg' || !!el.closest?.('svg');
    if (inSvg) {
      if (!SVG_TAGS.has(tag)) E(`<${tag}> is not allowed inside SVG`);
    } else if (!HTML_TAGS.has(tag)) E(`<${tag}> is not allowed`);
    for (const [k, v] of Object.entries(el.attributes || {})) {
      const key = k.toLowerCase();
      if (key.startsWith('on')) E(`event attribute ${k} is not allowed`);
      if (key === 'style') {
        if (!inSvg) E(`style="" attribute is not allowed outside SVG (on <${tag}>)`);
        else if (/(fill|stroke|color)\s*:/i.test(v)) E(`hard-coded colour in SVG style attribute: "${v.slice(0, 60)}"; use d-* classes`);
      }
      if ((key === 'href' || key === 'xlink:href') && /^\s*javascript:/i.test(v)) E('javascript: links are not allowed');
      if (inSvg && (key === 'href' || key === 'xlink:href') && !v.startsWith('#')) E(`SVG ${k} must point to an internal #id`);
      if (inSvg && (key === 'fill' || key === 'stroke' || key === 'stop-color' || key === 'color') && COLOR_RE.test(v.trim())) E(`hard-coded SVG colour ${k}="${v}" on <${tag}>; use d-* classes`);
      if (inSvg && (key === 'width' || key === 'height') && tag === 'svg') W('SVG should not set width/height; use viewBox only');
    }
    const cls = el.getAttribute?.('class');
    if (cls) for (const c of cls.split(/\s+/).filter(Boolean)) if (!KNOWN_CLASSES.has(c)) unknownClasses.add(c);
  }
  if (unknownClasses.size) W(`unknown classes: ${[...unknownClasses].join(', ')}`);

  const h1 = root.querySelectorAll('h1');
  if (h1.length) E('do not use <h1>; the build adds the title');

  // Sections
  const h2s = root.querySelectorAll('h2');
  if (h2s.length < 8) E(`need at least 8 <h2> (5+ content sections + Do this now + Remember this + Sources); found ${h2s.length}`);
  const h2text = h2s.map(textOf);
  if (!h2text.some(t => /do this now/i.test(t))) E('missing <h2>✅ Do this now</h2> section');
  if (!h2text.some(t => /remember this/i.test(t))) E('missing <h2>🧠 Remember this</h2> section');
  if (!h2text.some(t => /sources/i.test(t))) E('missing <h2>📚 Sources</h2> section');
  for (const t of h2text) if (!/^\P{L}/u.test(t)) W(`h2 should start with an emoji: "${t}"`);

  // TL;DR
  const tldrItems = root.querySelectorAll('aside.tldr li');
  if (tldrItems.length < 3 || tldrItems.length > 6) E(`TL;DR needs 3-6 bullets; found ${tldrItems.length}`);

  // Visual components
  const present = VISUALS.filter(v => root.querySelector('.' + v));
  if (present.length < 4) E(`need at least 4 different visual components; found ${present.length} (${present.join(', ')})`);
  const figs = root.querySelectorAll('figure.diagram');
  if (figs.length < 1) E('need at least 1 <figure class="diagram"> with an inline SVG');
  const svgTitleIds = new Set();
  for (const f of figs) {
    const svg = f.querySelector('svg');
    if (!svg) { E('figure.diagram without <svg>'); continue; }
    if (!svg.getAttribute('viewBox')) E('SVG is missing viewBox');
    const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    if (vb.length === 4 && (vb[2] < 300 || vb[2] > 1000)) W(`SVG viewBox width ${vb[2]} outside 480-800 guidance`);
    const t = svg.querySelector('title');
    if (!t) E('SVG needs a <title>');
    else if (t.id) { if (svgTitleIds.has(t.id)) E(`duplicate SVG title id ${t.id}`); svgTitleIds.add(t.id); }
    if (!f.querySelector('figcaption')) W('figure.diagram should have a <figcaption>');
    const shapes = svg.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon,text').length;
    if (shapes < 6) W(`SVG "${t ? textOf(t) : '?'}" looks too simple (${shapes} shapes)`);
  }
  for (const b of root.querySelectorAll('aside.box')) {
    const types = (b.getAttribute('class') || '').split(/\s+/).filter(c => BOX_TYPES.has(c));
    if (types.length !== 1) E(`aside.box needs exactly one type class (${[...BOX_TYPES].join('/')})`);
    if (!b.querySelector('h4')) W('aside.box should start with an <h4> title');
  }
  for (const w of root.querySelectorAll('.widget')) {
    const t = w.getAttribute('data-widget');
    if (!WIDGETS.has(t)) E(`unknown widget "${t}"`);
  }
  for (const s of root.querySelectorAll('ol.steps > li')) if (!s.querySelector('h4')) E('each ol.steps <li> needs an <h4>');
  for (const t of root.querySelectorAll('.table-wrap')) if (!t.querySelector('table')) E('.table-wrap without <table>');
  for (const t of root.querySelectorAll('table')) if (!t.closest('.table-wrap')) E('every <table> must be inside <div class="table-wrap">');
  for (const m of root.querySelectorAll('.mythfact')) if (!m.querySelector('.myth') || !m.querySelector('.fact')) E('.mythfact needs .myth and .fact');

  // Checklists
  const lists = root.querySelectorAll('ul.checklist');
  if (!lists.length) E('need at least one <ul class="checklist" data-id="...">');
  const others = allChecklistIds(basename(file));
  const seen = new Set();
  for (const l of lists) {
    const d = l.getAttribute('data-id');
    if (!d) E('checklist missing data-id');
    else {
      if (!d.startsWith(id)) W(`checklist data-id "${d}" should start with the chapter id "${id}"`);
      if (seen.has(d)) E(`duplicate checklist data-id "${d}"`);
      if (others.has(d)) E(`checklist data-id "${d}" already used in ${others.get(d)}`);
      seen.add(d);
    }
    const n = l.querySelectorAll('li').length;
    if (n < 3) W(`checklist "${d}" has only ${n} items`);
  }

  // Flashcards
  const cards = root.querySelectorAll('.cards .card');
  if (cards.length < 4) E(`need at least 4 flashcards in .cards; found ${cards.length}`);
  for (const c of cards) if (!c.querySelector('.q') || !c.querySelector('.a')) E('each .card needs p.q and p.a');

  // Sources
  const srcItems = root.querySelectorAll('ol.sources > li');
  if (srcItems.length < 6) E(`need at least 6 sources; found ${srcItems.length}`);
  const srcIds = new Set();
  srcItems.forEach((li, i) => {
    const want = 's' + (i + 1);
    if (li.id !== want) E(`source #${i + 1} must have id="${want}" (found "${li.id || ''}")`);
    srcIds.add(li.id);
    const links = li.querySelectorAll('a');
    if (links.length !== 1) E(`source ${li.id} must contain exactly one <a>`);
    const href = links[0]?.getAttribute('href') || '';
    if (!/^https?:\/\/[^\s/]+\.[^\s]+/.test(href)) E(`source ${li.id} has an invalid URL "${href}"`);
    if (BAD_DOMAINS.some(r => r.test(href))) E(`source ${li.id} uses a non-authoritative domain: ${href}`);
    if (!li.querySelector('.src-note')) W(`source ${li.id} should have a <span class="src-note">`);
    if (!/\((19|20)\d\d[^)]*\)|\(n\.d\.\)|\(undated\)/.test(textOf(li))) W(`source ${li.id} should include a year in brackets, e.g. (2025)`);
  });

  // Citations
  const cites = root.querySelectorAll('sup.cite a');
  const cited = new Set();
  for (const a of cites) {
    const h = (a.getAttribute('href') || '').replace('#', '');
    if (!srcIds.has(h)) E(`citation to missing source "#${h}"`);
    cited.add(h);
  }
  for (const s of srcIds) if (!cited.has(s)) W(`source ${s} is never cited`);
  const badSup = root.querySelectorAll('sup').filter(s => !s.classList.contains('cite'));
  if (badSup.length) W(`${badSup.length} <sup> without class="cite"`);

  // Text metrics (exclude svg + sources)
  const clone = parse(src);
  clone.querySelectorAll('svg').forEach(n => n.remove());
  clone.querySelectorAll('ol.sources').forEach(n => n.remove());
  const bodyText = textOf(clone);
  const wc = words(bodyText);
  if (wc < 2000) E(`too short: ${wc} words (need 2,500-4,000)`);
  else if (wc < 2500) W(`a bit short: ${wc} words (target 2,500-4,000)`);
  if (wc > 5500) W(`long: ${wc} words (target 2,500-4,000)`);
  if (cites.length < 12) E(`too few citations: ${cites.length} (need at least 15)`);
  else if (cites.length < 15) W(`only ${cites.length} citations (target 15+)`);
  if (cites.length && wc / cites.length > 150) W(`citation density low: one per ${Math.round(wc / cites.length)} words (target <= 150)`);

  for (const p of root.querySelectorAll('p')) {
    const n = words(textOf(p));
    if (n > 110) E(`paragraph too long (${n} words): "${textOf(p).slice(0, 70)}..."`);
    else if (n > 75) W(`paragraph long (${n} words): "${textOf(p).slice(0, 60)}..."`);
  }
  const dashes = (bodyText.match(/—/g) || []).length;
  if (dashes) W(`${dashes} em dash(es) found; use a colon, comma or new sentence`);
  for (const r of SPECULATION) { const m = bodyText.match(r); if (m) W(`speculative wording: "${m[0]}"`); }

  // Links
  for (const a of root.querySelectorAll('a')) {
    const href = a.getAttribute('href') || '';
    if (a.closest('ol.sources') || a.closest('sup.cite')) continue;
    if (/^https?:/.test(href)) { if (!a.closest('aside.box.watch')) W(`external link outside sources/watch box: ${href}`); continue; }
    if (href.startsWith('#')) continue;
    const m = href.match(/^([a-z0-9-]+)\.html(#.*)?$/);
    if (!m) E(`bad internal link "${href}" (use "<chapter-id>.html")`);
    else if (!IDS.has(m[1])) E(`link to unknown chapter "${m[1]}"`);
    else if (m[1] === id) W('link to the same chapter');
  }
  const xrefs = root.querySelectorAll('a.xref').length;
  if (xrefs < 3) W(`only ${xrefs} cross-references (a.xref); add 3-8`);

  return { errors, warns, stats: { words: wc, cites: cites.length, sources: srcItems.length, figures: figs.length, visuals: present.length, h2: h2s.length, xrefs } };
}

// CLI
const argv = process.argv.slice(2);
if (argv.length) {
  let files = argv.filter(a => !a.startsWith('--'));
  const summary = argv.includes('--summary');
  if (argv.includes('--all') || summary) files = readdirSync(CH_DIR).filter(f => f.endsWith('.html') && !f.startsWith('_')).map(f => join(CH_DIR, f));
  let failed = 0, totalWords = 0;
  for (const f of files) {
    const { errors, warns, stats } = validate(f);
    totalWords += stats.words || 0;
    if (errors.length) failed++;
    if (summary) { console.log(`${errors.length ? 'FAIL' : 'ok  '} ${basename(f).padEnd(34)} ${String(stats.words).padStart(5)}w ${String(stats.cites).padStart(3)}c ${String(stats.sources).padStart(3)}s ${stats.figures}f  E${errors.length} W${warns.length}`); continue; }
    console.log(`\n== ${basename(f)}  ${JSON.stringify(stats)}`);
    errors.forEach(e => console.log('  ERROR: ' + e));
    warns.forEach(w => console.log('  WARN:  ' + w));
    if (!errors.length) console.log('  PASS (0 errors)');
  }
  if (summary) console.log(`\n${files.length} chapters, ${failed} failing, ${totalWords.toLocaleString()} words`);
  process.exit(failed ? 1 : 0);
}
