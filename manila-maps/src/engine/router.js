// Offline router: createRouter(bundle) -> { route, snap }.
// The search runs in a Web Worker created from inline code (Blob URL, then a
// data: URL), so it also works in the single-file offline build opened from
// file://. If no Worker can be started it falls back to the main thread
// (after yielding once so the UI can paint the "routing…" state).
import { routerCore } from './router-core.js';

const WORKER_START_TIMEOUT = 4000;

function workerSource() {
  return `(${routerCore.toString()})(self);`;
}

function startWorker(src) {
  const attempts = [];
  try {
    const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    attempts.push(() => new Worker(url));
  } catch { /* no Blob URLs */ }
  attempts.push(() => new Worker(`data:text/javascript;charset=utf-8,${encodeURIComponent(src)}`));

  const tryOne = (i) => new Promise((resolve, reject) => {
    if (i >= attempts.length) { reject(new Error('no worker')); return; }
    let w;
    try { w = attempts[i](); } catch (e) { resolve(tryOne(i + 1)); return; }
    const timer = setTimeout(() => { w.terminate(); resolve(tryOne(i + 1)); }, WORKER_START_TIMEOUT);
    w.onerror = (ev) => { ev?.preventDefault?.(); clearTimeout(timer); w.terminate(); resolve(tryOne(i + 1)); };
    w.onmessage = (ev) => {
      if (ev.data && ev.data.type === 'hello') { clearTimeout(timer); w.onerror = null; w.onmessage = null; resolve(w); }
    };
  });
  return tryOne(0);
}

function workerClient(w) {
  let seq = 0;
  const pending = new Map();
  w.onmessage = (ev) => {
    const m = ev.data;
    const p = pending.get(m && m.id);
    if (!p) return;
    pending.delete(m.id);
    if (m.ok) p.resolve(m.result);
    else p.reject(new Error(m.error || 'Routing failed'));
  };
  w.onerror = (ev) => {
    ev?.preventDefault?.();
    for (const p of pending.values()) p.reject(new Error('Routing worker crashed'));
    pending.clear();
  };
  return (type, payload, transfer) => new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    w.postMessage({ id, type, ...payload }, transfer || []);
  });
}

function emptyRouter() {
  return { route: async () => null, snap: async () => null, mode: 'none' };
}

/**
 * @param bundle map bundle (src/core/bundle.js)
 * @param opts { worker: boolean } (default true)
 */
export async function createRouter(bundle, opts = {}) {
  if (!bundle.has('route.bin') || bundle.size('route.bin') === 0) return emptyRouter();
  if (opts.worker !== false && typeof Worker !== 'undefined' && typeof Blob !== 'undefined') {
    try {
      const w = await startWorker(workerSource());
      const call = workerClient(w);
      const bytes = (await bundle.readAll('route.bin')).slice(); // own buffer, transferable
      await call('load', { bytes: bytes.buffer }, [bytes.buffer]);
      return {
        mode: 'worker',
        route: (params) => call('route', { params }),
        snap: (lonlat, mode = 'car') => call('snap', { params: { lonlat, mode } }),
        terminate: () => w.terminate(),
      };
    } catch (e) {
      console.warn('Routing worker unavailable, using main thread:', e);
    }
  }
  const core = routerCore(null);
  await core.load(await bundle.readAll('route.bin'));
  const yieldUI = () => new Promise((r) => setTimeout(r, 0));
  return {
    mode: 'main',
    async route(params) { await yieldUI(); return core.route(params); },
    async snap(lonlat, mode = 'car') { return core.snap({ lonlat, mode }); },
    terminate() {},
  };
}
