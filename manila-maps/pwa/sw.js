// Manila Maps service worker. Keeps the app files on the device so the
// installed app opens with no internet. This file never changes between
// versions, so the browser has nothing to auto-update; new app files are
// fetched only when the user taps "Update map" (message 'refresh-app').
// The map itself is not cached here: it is stored in the app's own storage
// by the app, and /mapdata/ requests always go to the network (user tap only).
const CACHE = 'manila-maps-app';
const SHELL = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Keep any files already cached; add what is missing.
    for (const url of SHELL) {
      if (!(await cache.match(url))) {
        try { await cache.add(new Request(url, { cache: 'reload' })); } catch { /* retry next launch */ }
      }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.includes('/mapdata/')) return; // map downloads: network, only when the user asks
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    let hit = await cache.match(req, { ignoreSearch: true });
    if (!hit && req.mode === 'navigate') hit = await cache.match('./');
    if (hit) return hit;
    const res = await fetch(req);
    if (res.ok && SHELL.some((u) => new URL(u, self.location.href).href === url.href.split('?')[0])) {
      cache.put(req, res.clone());
    }
    return res;
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'refresh-app') return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const url of SHELL) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) await cache.put(url, res);
      } catch { /* offline: keep the current files */ }
    }
    event.ports[0]?.postMessage('done');
  })());
});
