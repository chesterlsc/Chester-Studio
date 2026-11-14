#!/usr/bin/env node
// Renders print.html to a PDF with page numbers, using Playwright's Chromium.
// Usage: node survival/tools/pdf.mjs [out.pdf] [--a4]
// Needs a local web server on the survival folder, e.g.  python3 -m http.server 8765 --directory survival
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { statSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv.find(a => a.endsWith('.pdf')) || join(ROOT, '30-years-no-power.pdf');
const a4 = process.argv.includes('--a4');
const base = process.env.BOOK_URL || 'http://127.0.0.1:8765/';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.emulateMedia({ media: 'print', colorScheme: 'light' });
await page.goto(base + 'print.html', { waitUntil: 'networkidle', timeout: 300000 });
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: out,
  format: a4 ? 'A4' : 'Letter',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: '<div style="width:100%;font-size:8px;color:#666;padding:0 14mm;display:flex;justify-content:space-between;font-family:Arial,sans-serif"><span>30 Years, No Power · The Visual, Fact-Checked Survival Field Manual</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' },
  outline: true,
  tagged: true,
  timeout: 0,
});
await browser.close();
console.log(`PDF written: ${out} (${(statSync(out).size / 1e6).toFixed(1)} MB)`);
