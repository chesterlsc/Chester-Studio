// Reader for the map bundle (manila.mmap): a ZIP whose entries are all STORED,
// so any entry can be read by byte range straight out of the one file.

const EOCD_SIG = 0x06054b50;
const CEN_SIG = 0x02014b50;
const LOC_SIG = 0x04034b50;
const ZIP64_EOCD_SIG = 0x06064b50;
const ZIP64_LOC_SIG = 0x07064b50;

const td = new TextDecoder();

/** Range reader over an HTTP(S) URL that honours Range requests. */
export function httpRangeReader(url, size) {
  return {
    key: url,
    size,
    async read(offset, length) {
      if (length <= 0) return new Uint8Array(0);
      const res = await fetch(url, { headers: { Range: `bytes=${offset}-${offset + length - 1}` } });
      if (!res.ok) throw new Error(`Map file read failed (${res.status})`);
      const buf = new Uint8Array(await res.arrayBuffer());
      if (res.status === 200) return buf.subarray(offset, offset + length); // server ignored Range
      if (buf.length !== length) throw new Error(`Short read: wanted ${length}, got ${buf.length}`);
      return buf;
    },
  };
}

/** Find the size of a file served over HTTP. */
export async function httpSize(url) {
  const res = await fetch(url, { headers: { Range: 'bytes=0-0' } });
  if (!res.ok) throw new Error(`Map file not found (${res.status})`);
  const cr = res.headers.get('Content-Range');
  await res.arrayBuffer().catch(() => {});
  if (cr && cr.includes('/')) return Number(cr.split('/').pop());
  const len = res.headers.get('Content-Length');
  if (res.status === 200 && len) return Number(len);
  throw new Error('Could not determine map file size');
}

/** Range reader over a File/Blob (file picker, OPFS). */
export function blobRangeReader(blob, key = 'blob') {
  return {
    key,
    size: blob.size,
    async read(offset, length) {
      return new Uint8Array(await blob.slice(offset, offset + length).arrayBuffer());
    },
  };
}

function u16(b, o) { return b[o] | (b[o + 1] << 8); }
function u32(b, o) { return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16)) + b[o + 3] * 0x1000000; }
function u64(b, o) { return u32(b, o) + u32(b, o + 4) * 0x100000000; }

/** Parse the ZIP central directory. Returns Map name -> { offset (data start), size }. */
export async function readZipIndex(reader) {
  const tailLen = Math.min(reader.size, 65557 + 20);
  const tailStart = reader.size - tailLen;
  const tail = await reader.read(tailStart, tailLen);
  let eocd = -1;
  for (let i = tail.length - 22; i >= 0; i--) {
    if (u32(tail, i) === EOCD_SIG) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a map bundle (no ZIP directory)');
  let count = u16(tail, eocd + 10);
  let cdSize = u32(tail, eocd + 12);
  let cdOffset = u32(tail, eocd + 16);
  if (cdOffset === 0xffffffff || count === 0xffff) {
    const loc = eocd - 20;
    if (loc >= 0 && u32(tail, loc) === ZIP64_LOC_SIG) {
      const z64Off = u64(tail, loc + 8);
      const z = await reader.read(z64Off, 56);
      if (u32(z, 0) !== ZIP64_EOCD_SIG) throw new Error('Broken ZIP64 directory');
      count = u64(z, 32); cdSize = u64(z, 40); cdOffset = u64(z, 48);
    }
  }
  const cd = await reader.read(cdOffset, cdSize);
  const entries = new Map();
  let p = 0;
  for (let i = 0; i < count; i++) {
    if (u32(cd, p) !== CEN_SIG) throw new Error('Broken ZIP directory');
    const method = u16(cd, p + 10);
    let csize = u32(cd, p + 20);
    let usize = u32(cd, p + 24);
    const nameLen = u16(cd, p + 28);
    const extraLen = u16(cd, p + 30);
    const commentLen = u16(cd, p + 32);
    let localOff = u32(cd, p + 42);
    const name = td.decode(cd.subarray(p + 46, p + 46 + nameLen));
    // ZIP64 extra field
    let e = p + 46 + nameLen;
    const eEnd = e + extraLen;
    while (e + 4 <= eEnd) {
      const id = u16(cd, e), len = u16(cd, e + 2);
      if (id === 0x0001) {
        let q = e + 4;
        if (usize === 0xffffffff) { usize = u64(cd, q); q += 8; }
        if (csize === 0xffffffff) { csize = u64(cd, q); q += 8; }
        if (localOff === 0xffffffff) { localOff = u64(cd, q); q += 8; }
      }
      e += 4 + len;
    }
    if (method !== 0) throw new Error(`Bundle entry ${name} is compressed; bundles must be STORED`);
    entries.set(name, { localOff, size: usize, offset: -1 });
    p += 46 + nameLen + extraLen + commentLen;
  }
  // Resolve data offsets from local headers (name/extra lengths can differ from central dir).
  await Promise.all([...entries.values()].map(async (ent) => {
    const h = await reader.read(ent.localOff, 30);
    if (u32(h, 0) !== LOC_SIG) throw new Error('Broken ZIP entry header');
    ent.offset = ent.localOff + 30 + u16(h, 26) + u16(h, 28);
  }));
  return entries;
}

export async function openBundle(reader) {
  const entries = await readZipIndex(reader);
  const get = (name) => {
    const e = entries.get(name);
    if (!e) throw new Error(`Map bundle is missing ${name}`);
    return e;
  };
  const bundle = {
    reader,
    entries,
    manifest: null,
    has: (name) => entries.has(name),
    size: (name) => get(name).size,
    async read(name, offset, length) {
      const e = get(name);
      if (offset < 0 || offset + length > e.size) throw new Error(`Read outside ${name}`);
      return reader.read(e.offset + offset, length);
    },
    async readAll(name) {
      const e = get(name);
      return reader.read(e.offset, e.size);
    },
    async readJSON(name) {
      return JSON.parse(td.decode(await bundle.readAll(name)));
    },
  };
  bundle.manifest = await bundle.readJSON('manifest.json');
  if (bundle.manifest.format !== 'manila-mapbundle') throw new Error('This file is not a Manila map bundle');
  return bundle;
}

/** SHA-256 of an entry, in chunks is not possible with SubtleCrypto, so whole-entry. */
export async function sha256Hex(bytes) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return [...d].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/** Verify every entry listed in the manifest (sizes always; hashes for entries up to maxHashBytes). */
export async function verifyBundle(bundle, { maxHashBytes = Infinity, onProgress } = {}) {
  const files = bundle.manifest.files || {};
  const names = Object.keys(files);
  const total = names.reduce((s, n) => s + files[n].size, 0);
  let done = 0;
  for (const n of names) {
    if (!bundle.has(n)) throw new Error(`Map bundle is missing ${n}`);
    if (bundle.size(n) !== files[n].size) throw new Error(`Map bundle entry ${n} has the wrong size`);
    if (files[n].size <= maxHashBytes && files[n].sha256) {
      const h = await sha256Hex(await bundle.readAll(n));
      if (h !== files[n].sha256) throw new Error(`Map bundle entry ${n} is damaged (checksum mismatch)`);
    }
    done += files[n].size;
    onProgress?.({ phase: 'verify', loaded: done, total });
  }
  return true;
}
