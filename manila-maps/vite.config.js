import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'node:fs';
import path from 'node:path';

// Serves data/out/*.mmap at /mapdata/ during dev and preview (with Range support),
// so the bundle never gets copied into the web build output.
function mapDataServer() {
  const dir = path.resolve(import.meta.dirname, 'data/out');
  const handler = (req, res, next) => {
    if (!req.url.startsWith('/mapdata/')) return next();
    const file = path.join(dir, path.basename(decodeURIComponent(req.url.split('?')[0])));
    if (!fs.existsSync(file)) { res.statusCode = 404; return res.end('not found'); }
    const size = fs.statSync(file).size;
    const range = req.headers.range && /bytes=(\d+)-(\d*)/.exec(req.headers.range);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', 'application/octet-stream');
    if (range) {
      const start = Number(range[1]);
      const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
      res.setHeader('Content-Length', end - start + 1);
      fs.createReadStream(file, { start, end }).pipe(res);
    } else {
      res.setHeader('Content-Length', size);
      fs.createReadStream(file).pipe(res);
    }
  };
  return {
    name: 'mapdata-server',
    configureServer(server) { server.middlewares.use(handler); },
    configurePreviewServer(server) { server.middlewares.use(handler); },
  };
}

// Installable web app (iPhone/iPad "Add to Home Screen", Mac "Add to Dock"): manifest + icons.
function pwaHead() {
  return {
    name: 'pwa-head',
    transformIndexHtml(html) {
      return html.replace('</head>', `  <link rel="manifest" href="./manifest.webmanifest" />
  <link rel="icon" type="image/png" href="./icon-192.png" />
  <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content="Manila Maps" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
</head>`);
    },
  };
}

const OUT = { offline: 'dist-offline', pwa: 'dist-pwa' };

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    mapDataServer(),
    ...(mode === 'offline' || mode === 'pwa' ? [viteSingleFile()] : []),
    ...(mode === 'pwa' ? [pwaHead()] : []),
  ],
  build: {
    outDir: OUT[mode] || 'dist',
    target: 'es2020',
    chunkSizeWarningLimit: 4000,
    assetsInlineLimit: mode === 'offline' || mode === 'pwa' ? 100000000 : 4096,
  },
  worker: { format: 'es' },
  server: { host: true },
}));
