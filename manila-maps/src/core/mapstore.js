// Where the map bundle lives and how it is installed, backed up, imported and updated.
//
// Android: the native MapStore plugin keeps the bundle in the app's permanent
// files directory (filesDir/maps/current.mmap — never the cache). The WebView
// reads it by byte range from https://localhost/_mapdata/current.mmap, which
// MainActivity serves straight from that file.
//
// Web — iPhone/iPad (Add to Home Screen), Mac (Add to Dock), the offline zip:
// the map is downloaded (hosted app) or picked from Files once, then kept in
// the app's own device storage (OPFS, else IndexedDB) and marked persistent.
// It stays until the user removes the app; nothing here ever deletes it except
// replacing it with a newer map that has been fully downloaded and verified.
// In dev (vite) with nothing stored, ./mapdata/manila.mmap is read directly.
import { Capacitor, registerPlugin } from '@capacitor/core';
import { openBundle, httpRangeReader, httpSize, blobRangeReader, verifyBundle } from './bundle.js';
import { sha256 } from '@noble/hashes/sha2.js';

const Native = registerPlugin('MapStore');
const isNative = Capacitor.isNativePlatform();
const NATIVE_URL = '/_mapdata/current.mmap';
const DEV_URL = './mapdata/manila.mmap';
const OPFS_NAME = 'manila.mmap';
const LS_UPDATE_URL = 'mm.updateUrl';

// Hosted installable web app (built with `--mode pwa`), published at /maps/ on the studio site.
const IS_PWA = import.meta.env.MODE === 'pwa';
const WEB_LATEST = './mapdata/manila-latest.json';

export const DEFAULT_UPDATE_URL = 'https://chesterstudio.space/maps/mapdata/manila-latest.json';

function needFileError() {
  const e = new Error('Download the Manila map or open a map file (.mmap) to start.');
  e.code = 'NEED_FILE';
  e.canDownload = IS_PWA && location.protocol.startsWith('http');
  return e;
}

function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } }

async function withProgress(fn, onProgress) {
  let handle = null;
  if (onProgress) handle = await Native.addListener('progress', onProgress);
  try { return await fn(); } finally { handle?.remove(); }
}

// ---------- web helpers ----------
async function opfsRoot() {
  if (!navigator.storage?.getDirectory) return null;
  try { return await navigator.storage.getDirectory(); } catch { return null; }
}
async function opfsFile() {
  const root = await opfsRoot();
  if (!root) return null;
  try { return await (await root.getFileHandle(OPFS_NAME)).getFile(); } catch { return null; }
}
let sessionBlob = null; // last-resort fallback for this session only

// IndexedDB fallback: OPFS is blocked on file:// pages, IndexedDB is not.
function idb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) return reject(new Error('no IndexedDB'));
    const req = indexedDB.open('manila-maps', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('files');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbGet(key) {
  try {
    const db = await idb();
    return await new Promise((resolve) => {
      const r = db.transaction('files').objectStore('files').get(key);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => resolve(null);
    });
  } catch { return null; }
}
async function idbDelete(key) {
  const db = await idb();
  await new Promise((resolve) => {
    const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').delete(key);
    tx.oncomplete = resolve;
    tx.onerror = resolve;
  });
}
async function idbPut(key, value) {
  const db = await idb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').put(value, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function pickFile(accept = '.mmap,application/zip,application/octet-stream') {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    input.onchange = () => { resolve(input.files?.[0] || null); input.remove(); };
    document.body.appendChild(input);
    input.click();
  });
}

async function storedBlob() {
  return (await opfsFile()) || (await idbGet(OPFS_NAME)) || sessionBlob;
}

async function webOpen() {
  const f = await storedBlob();
  if (f) {
    persist();
    return openBundle(blobRangeReader(f, 'stored'));
  }
  if (!IS_PWA && location.protocol.startsWith('http')) {
    try {
      const size = await httpSize(DEV_URL);
      return await openBundle(httpRangeReader(DEV_URL, size));
    } catch { /* no dev server copy */ }
  }
  throw needFileError();
}

/** Ask the browser to protect this app's storage from automatic cleanup. */
async function persist() {
  try {
    if (await navigator.storage?.persisted?.()) return true;
    return !!(await navigator.storage?.persist?.());
  } catch { return false; }
}

/** Keep a verified bundle on the device; replaces the old copy only once the new one is written. */
async function storeBlob(blob) {
  await persist();
  const root = await opfsRoot();
  if (root) {
    try {
      const tmp = await root.getFileHandle(OPFS_NAME + '.incoming', { create: true });
      const w = await tmp.createWritable();
      await w.write(blob);
      await w.close();
      const finalH = await root.getFileHandle(OPFS_NAME, { create: true });
      const w2 = await finalH.createWritable();
      await w2.write(await tmp.getFile());
      await w2.close();
      await root.removeEntry(OPFS_NAME + '.incoming');
      try { await idbDelete(OPFS_NAME); } catch { /* none */ }
      sessionBlob = null;
      return 'opfs';
    } catch { /* OPFS not writable here (e.g. file:// or older Safari): use IndexedDB */ }
  }
  // Copy into memory so IndexedDB keeps real bytes, not a reference to a picked file.
  const copy = blob instanceof File ? new Blob([await blob.arrayBuffer()], { type: 'application/octet-stream' }) : blob;
  sessionBlob = copy;
  await idbPut(OPFS_NAME, copy);
  if (root) { try { await root.removeEntry(OPFS_NAME); } catch { /* none */ } }
  return 'idb';
}

/** Fetch the small description of the published map (id, size, parts, sha256). */
export async function fetchLatest() {
  const res = await fetch(WEB_LATEST, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Map server answered ${res.status}`);
  return res.json();
}

/**
 * Download the published map, verify it, then store it (hosted web app).
 * The map may be split into parts (GitHub Pages caps files at 100 MB). The whole
 * file is hashed incrementally while it streams in, so memory stays ~1x the map.
 */
async function downloadLatest(onProgress, { currentId } = {}) {
  const latest = await fetchLatest();
  if (currentId && latest.id === currentId) return { ok: true, upToDate: true };
  const base = new URL(WEB_LATEST, location.href);
  const parts = latest.parts?.length ? latest.parts : [{ url: latest.url, size: latest.size }];
  const total = latest.size || parts.reduce((t, p) => t + (p.size || 0), 0);
  const hasher = sha256.create();
  const partBlobs = [];
  let loaded = 0;
  for (const part of parts) {
    const res = await fetch(new URL(part.url, base).href, { cache: 'no-store' });
    if (!res.ok || !res.body) throw new Error(`Map download failed (${res.status})`);
    const reader = res.body.getReader();
    const chunks = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      hasher.update(value);
      chunks.push(value);
      got += value.length;
      loaded += value.length;
      onProgress?.({ phase: 'download', loaded, total });
    }
    if (part.size && got !== part.size) throw new Error('Download was incomplete. Please try again.');
    partBlobs.push(new Blob(chunks, { type: 'application/octet-stream' }));
  }
  const blob = new Blob(partBlobs, { type: 'application/octet-stream' });
  partBlobs.length = 0;
  if (total && blob.size !== total) throw new Error('Download was incomplete. Please try again.');
  onProgress?.({ phase: 'verify', loaded: total, total });
  if (latest.sha256) {
    const h = [...hasher.digest()].map((x) => x.toString(16).padStart(2, '0')).join('');
    if (h !== latest.sha256) throw new Error('Download is damaged (checksum mismatch). Please try again.');
  }
  const b = await openBundle(blobRangeReader(blob, 'download'));
  await verifyBundle(b, { maxHashBytes: 0 });
  onProgress?.({ phase: 'install', loaded: 0, total: blob.size });
  await storeBlob(blob);
  return { ok: true, manifest: b.manifest };
}

/** Ask the service worker to refresh the cached app files (only when the user taps Update). */
async function refreshAppShell() {
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    const sw = reg?.active;
    if (!sw) return;
    await new Promise((resolve) => {
      const ch = new MessageChannel();
      ch.port1.onmessage = () => resolve();
      sw.postMessage({ type: 'refresh-app' }, [ch.port2]);
      setTimeout(resolve, 15000);
    });
  } catch { /* keep the current app files */ }
}

export const MapStore = {
  platform: isNative ? 'android' : 'web',

  /** Open the installed bundle; on Android installs it from the APK on first run. */
  async open(onProgress) {
    if (!isNative) return webOpen();
    let st = await Native.status();
    if (!st.installed) {
      await withProgress(() => Native.install(), onProgress);
      st = await Native.status();
      if (!st.installed) throw new Error('Could not install the map data');
    }
    return openBundle(httpRangeReader(NATIVE_URL, st.sizeBytes));
  },

  async status() {
    if (isNative) {
      const st = await Native.status();
      return { ...st, manifest: st.manifest ? JSON.parse(st.manifest) : null };
    }
    let persisted = false;
    try { persisted = !!(await navigator.storage?.persisted?.()); } catch { /* unknown */ }
    const where = `On this device, in the app's own storage${persisted ? ' (protected from automatic cleanup)' : ''}. Kept until you remove the app.`;
    try {
      const b = await webOpen();
      return { installed: true, sizeBytes: b.reader.size, manifest: b.manifest, location: where, persisted };
    } catch {
      return { installed: false, sizeBytes: 0, manifest: null, location: where, persisted };
    }
  },

  /** "Save backup to Files". */
  async exportBackup() {
    if (isNative) {
      try { return await Native.exportBackup(); } catch (e) { return { ok: false, error: e.message }; }
    }
    let blob = await storedBlob();
    if (!blob) {
      try { const size = await httpSize(DEV_URL); blob = await (await fetch(DEV_URL)).blob(); void size; } catch { /* none */ }
    }
    if (!blob) return { ok: false, error: 'No map data to back up yet.' };
    const st = await this.status();
    const fileName = `manila-map-${st.manifest?.id || 'backup'}.mmap`;
    // iPhone/iPad: the share sheet offers "Save to Files".
    try {
      const file = new File([blob], fileName, { type: 'application/octet-stream' });
      if (navigator.canShare?.({ files: [file] }) && /iPhone|iPad|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document) {
        await navigator.share({ files: [file], title: fileName });
        return { ok: true, fileName };
      }
    } catch (e) {
      if (e?.name === 'AbortError') return { ok: false, cancelled: true, error: 'Backup cancelled' };
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 10000);
    return { ok: true, fileName };
  },

  /** "Import from Files": the current map stays until the picked file is fully copied and verified. */
  async importBackup(onProgress) {
    if (isNative) {
      try {
        const r = await withProgress(() => Native.importBackup(), onProgress);
        return { ...r, manifest: r.manifest ? JSON.parse(r.manifest) : undefined };
      } catch (e) { return { ok: false, error: e.message }; }
    }
    const file = await pickFile();
    if (!file) return { ok: false, cancelled: true, error: 'No file chosen' };
    try {
      const b = await openBundle(blobRangeReader(file, 'picked'));
      await verifyBundle(b, { maxHashBytes: 64 * 1024 * 1024, onProgress });
      onProgress?.({ phase: 'install', loaded: 0, total: file.size });
      await storeBlob(file);
      return { ok: true, manifest: b.manifest };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  /** "Update map": only ever runs when the user taps it. Old map stays until the new one is verified. */
  async update(onProgress) {
    const url = this.getUpdateUrl();
    if (isNative) {
      try {
        const r = await withProgress(() => Native.update({ url }), onProgress);
        return { ...r, manifest: r.manifest ? JSON.parse(r.manifest) : undefined };
      } catch (e) { return { ok: false, error: e.message }; }
    }
    if (!IS_PWA || !location.protocol.startsWith('http')) {
      return { ok: false, error: 'In this offline copy, get the new .mmap file and use “Import from Files”.' };
    }
    try {
      let currentId = null;
      try { currentId = (await webOpen()).manifest?.id; } catch { /* none installed */ }
      const r = await downloadLatest(onProgress, { currentId });
      await refreshAppShell();
      return r;
    } catch (e) {
      return { ok: false, error: /fetch|network|load failed/i.test(e.message) ? 'No internet connection.' : e.message };
    }
  },

  /** First download of the map in the hosted web app (iPhone/iPad/Mac). */
  async download(onProgress) {
    try { return await downloadLatest(onProgress); } catch (e) {
      return { ok: false, error: /fetch|network|load failed/i.test(e.message) ? 'No internet connection. Connect once to download the map.' : e.message };
    }
  },

  /** Ask for persistent storage (also called after every successful store). */
  persist,

  getUpdateUrl() { return lsGet(LS_UPDATE_URL) || DEFAULT_UPDATE_URL; },
  setUpdateUrl(url) { lsSet(LS_UPDATE_URL, url || DEFAULT_UPDATE_URL); },
};
