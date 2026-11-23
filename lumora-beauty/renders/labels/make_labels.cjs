// make_labels.cjs - Lumora (Golden Hour) label artwork for the six products.
//
//   node make_labels.cjs [labels.json]
//
// Label system (brand/concepts/golden-hour.md 5): wordmark with the cut "o", the step's sun mark,
// product name in Fraunces 72pt SuperSoft Light Italic, format in Figtree 600 caps (+25%),
// descriptor in caps, size at the foot. Every label is drawn at its printed size in millimetres
// and exported at px_per_mm (40 = ~1000 dpi), so PNG aspect = physical aspect and the rig's wrap is
// undistorted (arc = width / radius). Ink/foil labels are one-colour alpha artwork (the rig colours
// them); "print" labels carry their own colours. Fonts: Fraunces + Figtree (SIL OFL) from Google Fonts.
const path = require('path');
const fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  ({ chromium } = require(path.join(process.env.NODE_PATH || '/opt/node22/lib/node_modules', 'playwright')));
}
const here = __dirname;
const spec = JSON.parse(fs.readFileSync(process.argv[2] || path.join(here, 'labels.json'), 'utf8'));

const FONTS = 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600' +
  '&family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..400,0..100,0..1;1,9..144,300..400,0..100,0..1&display=block';

const CSS = `
html, body { margin: 0; padding: 0; background: transparent; }
#label { box-sizing: border-box; position: relative; display: flex; flex-direction: column; align-items: center;
  text-align: center; color: var(--ink); overflow: hidden; }
.wm { font-family: 'Fraunces'; font-weight: 380; font-variation-settings: 'SOFT' 100, 'WONK' 0, 'opsz' 144;
  letter-spacing: -0.01em; line-height: 1; white-space: nowrap; }
.wm .o { display: inline-block; }
.name { font-family: 'Fraunces'; font-style: italic; font-weight: 300;
  font-variation-settings: 'SOFT' 100, 'WONK' 1, 'opsz' 72; line-height: 1.04; letter-spacing: -0.005em; white-space: nowrap; }
.lex { font-family: 'Fraunces'; font-style: italic; font-weight: 300; font-variation-settings: 'SOFT' 100, 'WONK' 1, 'opsz' 24;
  line-height: 1.2; white-space: nowrap; }
.fmt { font-family: 'Figtree'; font-weight: 600; text-transform: uppercase; letter-spacing: 0.25em; margin-right: -0.25em;
  line-height: 1.2; white-space: nowrap; }
.desc { font-family: 'Figtree'; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; margin-right: -0.12em;
  line-height: 1.45; }
.size { font-family: 'Figtree'; font-weight: 500; letter-spacing: 0.06em; margin-right: -0.06em; line-height: 1.2; white-space: nowrap; }
.rule { background: var(--ink); }
.body { font-family: 'Figtree'; font-weight: 400; line-height: 1.38; text-align: left; }
.h { font-family: 'Figtree'; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em; line-height: 1.3; }
.row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.pao { display: inline-flex; align-items: center; justify-content: center; border: solid var(--ink); border-radius: 50% 50% 45% 45%; }
`;

// sun mark for step n (1..6): horizon line, the sun's arc, a dot sinking from left (01) to half set (06)
function sunMark(step, wpx, ink, dotColor) {
  const ang = { 1: 160, 2: 128, 3: 90, 4: 54, 5: 24, 6: 0 }[step];
  const R = 34, cx = 50, cy = 50, sw = 3.4, dr = 8.2;
  const a = ang * Math.PI / 180;
  const dx = cx + R * Math.cos(a), dy = cy - R * Math.sin(a);
  const hpx = wpx * 56 / 100;
  const id = 'm' + step + Math.random().toString(36).slice(2, 7);
  return `<svg width="${wpx}" height="${hpx}" viewBox="0 0 100 56" style="display:block">
    <defs><mask id="${id}"><rect x="0" y="0" width="100" height="56" fill="#fff"/>
      <circle cx="${dx}" cy="${dy}" r="${dr + 3.2}" fill="#000"/></mask>
      <clipPath id="${id}c"><rect x="0" y="0" width="100" height="${cy - sw / 2 - 1.6}"/></clipPath></defs>
    <g mask="url(#${id})" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round">
      <path d="M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}"/>
      <line x1="${2 + sw / 2}" y1="${cy}" x2="${98 - sw / 2}" y2="${cy}"/>
    </g>
    <circle cx="${dx}" cy="${dy}" r="${dr}" fill="${dotColor || ink}" ${step === 6 ? `clip-path="url(#${id}c)"` : ''}/>
  </svg>`;
}

// the low-sun monogram: a disc cut by the horizon gap one third up
function monogram(wpx, ink) {
  const id = 'g' + Math.random().toString(36).slice(2, 7);
  return `<svg width="${wpx}" height="${wpx}" viewBox="0 0 100 100" style="display:block">
    <defs><mask id="${id}"><rect width="100" height="100" fill="#fff"/><rect x="0" y="65.5" width="100" height="7" fill="#000"/></mask></defs>
    <circle cx="50" cy="50" r="49" fill="${ink}" mask="url(#${id})"/></svg>`;
}

function labelHtml(l, k) {
  const u = v => (v * k).toFixed(2) + 'px';
  const ink = l.ink || '#000000';
  const s = l.scale || 1;
  if (l.style === 'monogram') {
    return `<div id="label" style="--ink:${ink};width:${u(l.width_mm)};height:${u(l.width_mm)};">${monogram(l.width_mm * k, ink)}</div>`;
  }
  const g = l.gap || {};
  const gap = (key, d) => u((g[key] ?? d) * s);
  const wm = `<div class="wm" data-w="${(l.wm_mm || 13) * k}" style="font-size:${u(5)};margin-top:${gap('wm', 1.3)}">lum<span class="o" data-sliver="${l.sliver || ''}">o</span>ra</div>`;
  const rule = `<div class="rule" style="width:${u((l.rule_mm || 6) * s)};height:${u(0.15)};margin:${gap('rule', 1.5)} 0 ${gap('rule2', 1.4)}"></div>`;
  const lines = (txt, cls, size, mt) => txt ? `<div class="${cls}" style="font-size:${u(size * s)};margin-top:${u(mt * s)}">${txt}</div>` : '';
  if (l.style === 'back') {
    return `<div id="label" style="--ink:${ink};width:${u(l.width_mm)};height:${u(l.height_mm)};padding:${u(0.6)} ${u(1.6)};">
      ${wm.replace('margin-top:' + gap('wm', 1.3), 'margin-top:0')}
      ${rule}
      <div class="h" style="font-size:${u(0.95)};align-self:flex-start">How to use</div>
      <div class="body" style="font-size:${u(1.02)};margin-top:${u(0.35)}">${l.how}</div>
      <div class="h" style="font-size:${u(0.95)};align-self:flex-start;margin-top:${u(1.2)}">Ingredients</div>
      <div class="body" style="font-size:${u(0.98)};margin-top:${u(0.35)}">${l.inci}</div>
      <div class="row" style="margin-top:auto">
        <div class="size" style="font-size:${u(1.0)}">${l.left}</div>
        <div class="pao" style="font-family:Figtree;font-weight:600;font-size:${u(0.85)};width:${u(3.0)};height:${u(2.6)};border-width:${u(0.16)}">6M</div>
        <div class="size" style="font-size:${u(1.0)}">${l.size}</div>
      </div></div>`;
  }
  const sun = `<div style="margin-top:${gap('sun', 0)}">${sunMark(l.step, (l.sun_mm || 6) * s * k, l.mark_ink || ink, l.dot_ink)}</div>`;
  const desc = (l.desc || []).map((t, i) => lines(t, 'desc', l.desc_mm || 1.12, i ? 0 : (g.desc ?? 1.0))).join('');
  return `<div id="label" style="--ink:${ink};width:${u(l.width_mm)};height:${u(l.height_mm)};padding:${u(l.pad_top || 0)} 0 ${u(l.pad_bottom || 0.4)};">
    ${sun}${wm}${rule}
    ${lines(l.name, 'name', l.name_mm || 4.6, 0)}
    ${lines(l.format, 'fmt', l.fmt_mm || 1.4, g.fmt ?? 1.2)}
    ${desc}
    ${lines(l.lex, 'lex', l.lex_mm || 1.5, g.lex ?? 1.6)}
    <div class="size" style="font-size:${u((l.size_mm || 1.2) * s)};margin-top:auto">${l.size}</div></div>`;
}

(async () => {
  const launch = {};
  if (process.env.HTTPS_PROXY) launch.proxy = { server: process.env.HTTPS_PROXY };
  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const l of spec.labels) {
    const k = l.px_per_mm || spec.px_per_mm || 40;
    const hmm = l.style === 'monogram' ? l.width_mm : l.height_mm;
    await page.setViewportSize({ width: Math.ceil(l.width_mm * k) + 40, height: Math.ceil(hmm * k) + 40 });
    await page.setContent(`<!doctype html><html><head><link rel="stylesheet" href="${FONTS}"><style>${CSS}</style></head>
      <body>${labelHtml(l, k)}</body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await Promise.all(['380 40px Fraunces', 'italic 300 40px Fraunces', '600 40px Figtree', '500 40px Figtree', '400 40px Figtree']
        .map(f => document.fonts.load(f)));
      await document.fonts.ready;
    });
    const ok = await page.evaluate(() => document.fonts.check('italic 300 40px Fraunces') && document.fonts.check('600 40px Figtree'));
    if (!ok) throw new Error('web fonts did not load');
    await page.evaluate(() => {
      const box = document.getElementById('label');
      // wordmark: fit to its target width, then cut the "o" with the horizon gap (66% to 71.5% of the o)
      for (const wm of box.querySelectorAll('.wm')) {
        const target = parseFloat(wm.dataset.w);
        let f = parseFloat(getComputedStyle(wm).fontSize);
        f *= target / wm.getBoundingClientRect().width;
        wm.style.fontSize = f + 'px';
        const o = wm.querySelector('.o');
        const probe = document.createElement('span');
        probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        o.parentNode.insertBefore(probe, o);
        const baseY = probe.getBoundingClientRect().top;
        probe.remove();
        const c = document.createElement('canvas').getContext('2d');
        c.font = `380 ${f}px Fraunces`;
        const m = c.measureText('o');
        const r = o.getBoundingClientRect();
        const top = baseY - m.actualBoundingBoxAscent, H = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
        const g0 = top + 0.655 * H - r.top, g1 = top + 0.715 * H - r.top;
        o.style.webkitMaskImage = o.style.maskImage =
          `linear-gradient(to bottom, #000 ${g0}px, transparent ${g0}px, transparent ${g1}px, #000 ${g1}px)`;
        if (o.dataset.sliver) {   // two-colour logo on light print grounds: the sliver below the horizon
          o.style.backgroundImage = `linear-gradient(to bottom, currentColor ${g1}px, ${o.dataset.sliver} ${g1}px)`;
          o.style.webkitBackgroundClip = 'text';
          o.style.color = 'transparent';
          o.style.backgroundColor = 'transparent';
          o.style.setProperty('-webkit-text-fill-color', 'transparent');
          o.style.backgroundImage = `linear-gradient(to bottom, ${getComputedStyle(wm).color} ${g1}px, ${o.dataset.sliver} ${g1}px)`;
        }
      }
      // keep every line inside the die line
      const max = box.clientWidth * 0.92;
      for (const el of box.querySelectorAll('.name, .fmt, .desc, .size, .lex')) {
        let fs = parseFloat(getComputedStyle(el).fontSize);
        while (el.scrollWidth > max && fs > 4) { fs *= 0.97; el.style.fontSize = fs + 'px'; }
      }
      if (box.scrollHeight > box.clientHeight + 1) console.log('OVERFLOW');
    });
    page.removeAllListeners('console');
    const over = await page.evaluate(() => { const b = document.getElementById('label'); return b.scrollHeight - b.clientHeight; });
    const out = path.join(here, l.file);
    await (await page.$('#label')).screenshot({ path: out, omitBackground: true });
    console.log('wrote', l.file, over > 1 ? `WARNING overflow ${over}px` : '');
  }
  await browser.close();
})();
