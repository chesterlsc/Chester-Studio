// Usage: node board_shot.cjs <file-url> <out.jpg> <width> <height> <scale>
// Renders a fixed-size presentation board to JPEG (waits for web fonts and images).
const { chromium } = require('playwright');
(async () => {
  const [url, out, w, h, scale] = process.argv.slice(2);
  const launch = process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } } : {};
  const browser = await chromium.launch(launch);
  const page = await (await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: +scale })).newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: out, type: 'jpeg', quality: 90 });
  await browser.close();
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
