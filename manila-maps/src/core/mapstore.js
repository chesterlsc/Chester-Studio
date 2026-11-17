// Where the map bundle lives and how it is installed, backed up, imported and updated.
//
// Android: the native MapStore plugin keeps the bundle in the app's permanent
// files directory (filesDir/maps/current.mmap — never the cache). The WebView
// reads it by byte range from https://localhost/_mapdata/current.mmap, which
// MainActivity serves straight from that file.
//
// Web (offline zip / dev): the bundle is read from ./mapdata/manila.mmap when
// served over http(s); when opened from Files (file://) the user picks the
// .mmap once and it is kept in the browser's persistent origin storage (OPFS).
import { Capacitor, registerPlugin } from '@capacitor/core';
import { openBundle, httpRangeReader, httpSize, blobRangeReader, verifyBundle } from './bundle.js';

const Native = registerPlugin('MapStore');
const isNative = Capacitor.isNativePlatform();
const NATIVE_URL = '/_mapdata/current.mmap';
const DEV_URL = './mapdata/manila.mmap';
const OPFS_NAME = 'manila.mmap';
const LS_UPDATE_URL = 'mm.updateUrl';

export const DEFAULT_UPDATE_URL =
  'https://github.com/chesterlsc/chester-studio/releases/latest/download/manila-latest.json';

function needFileError() {
  const e = new Error('Choose your Manila map file (.mmap) to start.');
  e.code = 'NEED_FILE';
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
let sessionBlob = null; // fallback when OPFS is unavailable

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

async function webOpen() {
  if (location.protocol.startsWith('http')) {
    try {
      const size = await httpSize(DEV_URL);
      return await openBundle(httpRangeReader(DEV_URL, size));
    } catch { /* fall through to stored copy */ }
  }
  const f = (await opfsFile()) || sessionBlob;
  if (f) return openBundle(blobRangeReader(f, 'opfs'));
  throw needFileError();
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
    try {
      const b = await webOpen();
      return { installed: true, sizeBytes: b.reader.size, manifest: b.manifest, location: 'Browser storage' };
    } catch {
      return { installed: false, sizeBytes: 0, manifest: null, location: 'Browser storage' };
    }
  },

  /** "Save backup to Files". */
  async exportBackup() {
    if (isNative) {
      try { return await Native.exportBackup(); } catch (e) { return { ok: false, error: e.message }; }
    }
    const f = (await opfsFile()) || sessionBlob;
    let blob = f;
    if (!blob) {
      try { const size = await httpSize(DEV_URL); blob = await (await fetch(DEV_URL)).blob(); void size; } catch { /* none */ }
    }
    if (!blob) return { ok: false, error: 'No map data to back up yet.' };
    const st = await this.status();
    const fileName = `manila-map-${st.manifest?.id || 'backup'}.mmap`;
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
      const root = await opfsRoot();
      if (root) {
        try { await navigator.storage.persist?.(); } catch { /* ignore */ }
        const tmp = await root.getFileHandle(OPFS_NAME + '.incoming', { create: true });
        const w = await tmp.createWritable();
        await w.write(file);
        await w.close();
        // Swap only after the new copy is complete.
        const finalH = await root.getFileHandle(OPFS_NAME, { create: true });
        const w2 = await finalH.createWritable();
        await w2.write(await tmp.getFile());
        await w2.close();
        await root.removeEntry(OPFS_NAME + '.incoming');
      } else {
        sessionBlob = file;
      }
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
    return { ok: false, error: 'In the browser version, download the new .mmap file and use “Import from Files”.' };
  },

  getUpdateUrl() { return lsGet(LS_UPDATE_URL) || DEFAULT_UPDATE_URL; },
  setUpdateUrl(url) { lsSet(LS_UPDATE_URL, url || DEFAULT_UPDATE_URL); },
};
