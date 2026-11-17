// Test helpers: open the real .mmap through src/core/bundle.js with a file range reader.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openBundle } from '../../src/core/bundle.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const DEFAULT_MMAP = path.join(ROOT, 'data/out/manila.mmap');

export function fileRangeReader(file) {
  const fd = fs.openSync(file, 'r');
  const size = fs.fstatSync(fd).size;
  return {
    key: file,
    size,
    async read(offset, length) {
      const buf = Buffer.alloc(length);
      let got = 0;
      while (got < length) {
        const n = fs.readSync(fd, buf, got, length - got, offset + got);
        if (n <= 0) throw new Error('short read');
        got += n;
      }
      return new Uint8Array(buf.buffer, buf.byteOffset, length);
    },
  };
}

export async function openMmap(file = DEFAULT_MMAP) {
  return openBundle(fileRangeReader(file));
}
