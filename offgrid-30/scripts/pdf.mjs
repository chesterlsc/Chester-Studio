// Renders the whole book (dist/print/) to dist/offgrid-30.pdf with Chromium.
// Usage: npm run build && npm run pdf      (PDF_FORMAT=A4 for A4 paper)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
// Playwright is used from the machine's global install (not a project dependency).
const { chromium } = createRequire(import.meta.url)('playwright');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const base = (process.env.BASE || '/').replace(/\/?$/, '/');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.json': 'application/json' };

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.startsWith(base)) p = '/' + p.slice(base.length);
    let file = join(root, p);
    if (!file.startsWith(root)) throw new Error('outside');
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ colorScheme: 'light' });
await page.goto(`http://localhost:${port}${base}print/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
// Print the static, fully expanded version of every interactive part.
await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
const out = join(root, 'offgrid-30.pdf');
await page.pdf({
  path: out,
  format: process.env.PDF_FORMAT || 'Letter',
  printBackground: true,
  margin: { top: '14mm', bottom: '16mm', left: '12mm', right: '12mm' },
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: '<div style="width:100%;font:9px sans-serif;color:#555;padding:0 12mm;display:flex;justify-content:space-between"><span>OFFGRID 30</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
});
await browser.close();
server.close();
const { size } = await stat(out);
console.log(`PDF: ${out} (${(size / 1024 / 1024).toFixed(1)} MB)`);
