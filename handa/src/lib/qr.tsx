/**
 * Minimal QR code encoder (byte mode, EC level L, versions 1–40) + React <QR/> renderer.
 * No dependencies. Based on the ISO 18004 reference algorithm.
 */
const ECC_PER_BLOCK = [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30];
const NUM_BLOCKS = [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25];

function rawDataModules(v: number): number {
  let r = (16 * v + 128) * v + 64;
  if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
  return r;
}
function dataCapacityBytes(v: number): number {
  const total = Math.floor(rawDataModules(v) / 8) - ECC_PER_BLOCK[v] * NUM_BLOCKS[v];
  const countBits = v <= 9 ? 8 : 16;
  return Math.floor((total * 8 - 4 - countBits) / 8);
}
function gfMul(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; }
  return z;
}
function rsDivisor(degree: number): number[] {
  const res = new Array<number>(degree).fill(0); res[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) { res[j] = gfMul(res[j], root); if (j + 1 < degree) res[j] ^= res[j + 1]; }
    root = gfMul(root, 2);
  }
  return res;
}
function rsRemainder(data: number[], div: number[]): number[] {
  const res = new Array<number>(div.length).fill(0);
  for (const b of data) { const f = b ^ res.shift()!; res.push(0); div.forEach((c, i) => { res[i] ^= gfMul(c, f); }); }
  return res;
}

export function encodeQR(text: string): { size: number; modules: boolean[][] } {
  const bytes = Array.from(new TextEncoder().encode(text));
  let v = 1;
  while (v < 40 && dataCapacityBytes(v) < bytes.length) v++;
  if (dataCapacityBytes(v) < bytes.length) throw new Error('QR: too long');
  const size = v * 4 + 17;
  // --- bit stream
  const bits: number[] = [];
  const push = (val: number, n: number) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  push(4, 4); push(bytes.length, v <= 9 ? 8 : 16); bytes.forEach((b) => push(b, 8));
  const totalCw = Math.floor(rawDataModules(v) / 8);
  const dataCw = totalCw - ECC_PER_BLOCK[v] * NUM_BLOCKS[v];
  push(0, Math.min(4, dataCw * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  for (let pad = 0xec; bits.length < dataCw * 8; pad ^= 0xec ^ 0x11) push(pad, 8);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  // --- blocks + ECC
  const nb = NUM_BLOCKS[v], ecl = ECC_PER_BLOCK[v];
  const shortLen = Math.floor(totalCw / nb) - ecl, numLong = totalCw % nb;
  const div = rsDivisor(ecl);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < nb; i++) {
    const len = shortLen + (i < nb - numLong ? 0 : 1);
    const d = data.slice(k, k + len); k += len;
    const ecc = rsRemainder(d, div);
    if (i < nb - numLong) d.push(0); // placeholder for alignment
    blocks.push([...d, ...ecc]);
  }
  const all: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== shortLen || j >= nb - numLong) all.push(b[i]); });
  // --- matrix
  const m: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const fn: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const set = (x: number, y: number, dark: boolean) => { m[y][x] = dark; fn[y][x] = true; };
  const finder = (cx: number, cy: number) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)); const x = cx + dx, y = cy + dy; if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4); } };
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
  for (let i = 8; i < size - 8; i++) { set(i, 6, i % 2 === 0); set(6, i, i % 2 === 0); }
  if (v >= 2) {
    const n = Math.floor(v / 7) + 2;
    const step = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2;
    const pos = [6]; for (let p = size - 7; pos.length < n; p -= step) pos.splice(1, 0, p);
    for (const a of pos) for (const b of pos) {
      if ((a === 6 && b === 6) || (a === 6 && b === size - 7) || (a === size - 7 && b === 6)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(a + dx, b + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
  const drawFormat = (mask: number) => {
    const d = (1 << 3) | mask; // ECL L = 01
    let rem = d; for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const f = ((d << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((f >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
    set(8, size - 8, true);
  };
  drawFormat(0);
  if (v >= 7) {
    let rem = v; for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const vb = (v << 12) | rem;
    for (let i = 0; i < 18; i++) { const b = ((vb >>> i) & 1) === 1; const a = size - 11 + (i % 3), c = Math.floor(i / 3); set(a, c, b); set(c, a, b); }
  }
  // --- place data
  let bi = 0;
  const dataBits = all.flatMap((b) => Array.from({ length: 8 }, (_, i) => (b >>> (7 - i)) & 1));
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j; const up = ((right + 1) & 2) === 0; const y = up ? size - 1 - vert : vert;
        if (!fn[y][x] && bi < dataBits.length) { m[y][x] = dataBits[bi++] === 1; }
      }
    }
  }
  // --- mask: pick lowest penalty
  const maskFn = (k: number, x: number, y: number) => [() => (x + y) % 2 === 0, () => y % 2 === 0, () => x % 3 === 0, () => (x + y) % 3 === 0, () => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, () => ((x * y) % 2) + ((x * y) % 3) === 0, () => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, () => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0][k]();
  const apply = (k: number) => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && maskFn(k, x, y)) m[y][x] = !m[y][x]; };
  const penalty = () => {
    let p = 0;
    const run = (line: boolean[]) => { let r = 1; for (let i = 1; i <= line.length; i++) { if (i < line.length && line[i] === line[i - 1]) r++; else { if (r >= 5) p += r - 2; r = 1; } } };
    for (let y = 0; y < size; y++) run(m[y]);
    for (let x = 0; x < size; x++) run(m.map((row) => row[x]));
    for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) { const c = m[y][x]; if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) p += 3; }
    let dark = 0; for (const row of m) for (const c of row) if (c) dark++;
    p += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
    return p;
  };
  let best = 0, bestP = Infinity;
  for (let k = 0; k < 8; k++) { apply(k); drawFormat(k); const p = penalty(); if (p < bestP) { bestP = p; best = k; } apply(k); }
  apply(best); drawFormat(best);
  return { size, modules: m };
}

export function QR({ text, size = 128, dark = '#111', light = '#fff' }: { text: string; size?: number; dark?: string; light?: string }) {
  let q: { size: number; modules: boolean[][] } | null = null;
  try { q = encodeQR(text); } catch { return null; }
  const n = q.size, cell = size / (n + 8);
  const path = q.modules.map((row, y) => row.map((v, x) => (v ? `M${(x + 4) * cell} ${(y + 4) * cell}h${cell}v${cell}h-${cell}z` : '')).join('')).join('');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="QR code" shapeRendering="crispEdges">
      <rect width={size} height={size} fill={light} />
      <path d={path} fill={dark} />
    </svg>
  );
}
