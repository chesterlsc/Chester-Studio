// make_labels.cjs - render placeholder label artwork (transparent PNGs) for the rig examples.
//
//   node make_labels.cjs [labels.json]
//
// Each entry in labels.json describes one label in millimetres; the PNG is rendered at
// `px_per_mm` (default 40 = ~1000 dpi) so it stays sharp in 2048 px packshots. Styles:
//   ink    one-colour artwork on transparent (the rig colours it: white / black / foil)
//   paper  full-colour label on a paper ground (rig mode "paper")
//   seal   round lid / cap-top mark
// Fonts are vendored in ./fonts (SIL OFL): Marcellus (wordmark), Cormorant Garamond, Jost.
// PLACEHOLDER ARTWORK: the brand team's final label files drop straight into the job JSON.
const path = require('path');
const fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  ({ chromium } = require(path.join(process.env.NODE_PATH || '/opt/node22/lib/node_modules', 'playwright')));
}

const here = __dirname;
const specFile = process.argv[2] || path.join(here, 'labels.json');
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
// fonts are inlined as data: URIs (pages built with setContent cannot fetch file:// fonts)
const fontUrl = f => 'data:font/woff2;base64,' + fs.readFileSync(path.join(here, 'fonts', f)).toString('base64');

const css = `
@font-face { font-family: 'Marcellus'; src: url('${fontUrl('marcellus-latin-400-normal.woff2')}') format('woff2'); }
@font-face { font-family: 'Cormorant'; font-style: italic; font-weight: 500; src: url('${fontUrl('cormorant-garamond-latin-500-italic.woff2')}') format('woff2'); }
@font-face { font-family: 'Cormorant'; font-style: normal; font-weight: 500; src: url('${fontUrl('cormorant-garamond-latin-500-normal.woff2')}') format('woff2'); }
@font-face { font-family: 'Jost'; font-weight: 400; src: url('${fontUrl('jost-latin-400-normal.woff2')}') format('woff2'); }
@font-face { font-family: 'Jost'; font-weight: 500; src: url('${fontUrl('jost-latin-500-normal.woff2')}') format('woff2'); }
html, body { margin: 0; padding: 0; background: transparent; }
#label { box-sizing: border-box; display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; color: var(--ink); overflow: hidden; }
.mark { font-family: 'Marcellus'; letter-spacing: 0.36em; margin-right: -0.36em; line-height: 1; }
.rule { background: var(--ink); }
.name { font-family: 'Cormorant'; font-style: italic; font-weight: 500; line-height: 1.05; }
.sub, .size { font-family: 'Jost'; font-weight: 500; text-transform: uppercase; letter-spacing: 0.2em;
  margin-right: -0.2em; line-height: 1.25; }
.size { font-weight: 400; letter-spacing: 0.12em; margin-right: -0.12em; text-transform: none; }
.seal { border-radius: 50%; border-style: solid; border-color: var(--ink); }
`;

function html(l, k) {
  // k = px per mm; every size below is in mm
  const u = v => (v * k).toFixed(2) + 'px';
  const w = l.width_mm, h = l.height_mm;
  const ink = l.ink || '#1F1B18';
  const s = l.scale || 1;
  if (l.style === 'seal') {
    return `<div id="label" class="seal" style="--ink:${ink};width:${u(w)};height:${u(w)};border-width:${u(0.22)};">
      <div class="mark" style="font-size:${u(4.2 * s)}">${l.wordmark || 'LUMORA'}</div>
      <div class="rule" style="width:${u(6 * s)};height:${u(0.18)};margin:${u(1.6 * s)} 0;"></div>
      <div class="sub" style="font-size:${u(1.25 * s)}">${l.sub || ''}</div></div>`;
  }
  const bg = l.style === 'paper' ? `background:${l.paper || '#F2EBDF'};border-radius:${u(l.radius_mm || 1.2)};` : '';
  const pad = l.style === 'paper' ? `padding:${u(2.5)} ${u(2)};` : '';
  return `<div id="label" style="--ink:${ink};width:${u(w)};height:${u(h)};${bg}${pad}">
    <div class="mark" style="font-size:${u(4.6 * s)}">${l.wordmark || 'LUMORA'}</div>
    <div class="rule" style="width:${u(7 * s)};height:${u(0.16)};margin:${u(2.4 * s)} 0 ${u(2.0 * s)};"></div>
    <div class="name" style="font-size:${u(5.2 * s)}">${l.name || ''}</div>
    <div class="sub" style="font-size:${u(1.35 * s)};margin-top:${u(2.1 * s)}">${l.sub || ''}</div>
    <div class="size" style="font-size:${u(1.45 * s)};margin-top:${u(0.9 * s)}">${l.size || ''}</div></div>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const l of spec.labels) {
    const k = l.px_per_mm || spec.px_per_mm || 40;
    await page.setViewportSize({ width: Math.ceil(l.width_mm * k) + 40, height: Math.ceil((l.style === 'seal' ? l.width_mm : l.height_mm) * k) + 40 });
    await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body>${html(l, k)}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    // shrink any line that is wider than the label (keeps the artwork inside its die line)
    await page.evaluate(() => {
      const box = document.getElementById('label');
      const max = box.clientWidth * 0.9;
      for (const el of box.querySelectorAll('.mark, .name, .sub, .size')) {
        let fs = parseFloat(getComputedStyle(el).fontSize);
        el.style.whiteSpace = 'nowrap';
        while (el.scrollWidth > max && fs > 4) { fs *= 0.97; el.style.fontSize = fs + 'px'; }
        if (el.classList.contains('name')) el.style.whiteSpace = 'normal';
      }
    });
    const out = path.join(here, l.file);
    await (await page.$('#label')).screenshot({ path: out, omitBackground: true });
    console.log('wrote', out);
  }
  await browser.close();
})();
