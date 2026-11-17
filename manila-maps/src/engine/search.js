// Offline search over search.bin (built by data/scripts/build_search.py).
//
// search.bin = gzip( "MMSEARCH" u32 headerLen  headerJSON  sections... )
// Records are sorted by importance (record id 0 = most important). Tokens are
// folded ASCII words, sorted; postings map each token to record ids.

const td = new TextDecoder();

/** Accent/case folding (must match data/scripts/common.py fold()). */
export function fold(s) {
  return String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/['’`´]/g, '');
}

/** Words of a folded string: [a-z0-9]+ runs. */
function words(s) {
  const out = [];
  for (const w of fold(s).split(/\s+/)) {
    for (const p of w.split(/[^a-z0-9]+/)) if (p) out.push(p);
  }
  return out;
}

async function gunzip(bytes) {
  if (typeof DecompressionStream === 'undefined') throw new Error('DecompressionStream not supported');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const TYPED = { uint8: Uint8Array, uint16: Uint16Array, uint32: Uint32Array, int32: Int32Array };

function emptySearch() {
  return { count: 0, search: () => [], reverse: () => null };
}

export async function createSearch(bundle) {
  if (!bundle.has('search.bin') || bundle.size('search.bin') === 0) return emptySearch();
  let raw = await bundle.readAll('search.bin');
  if (raw[0] === 0x1f && raw[1] === 0x8b) raw = await gunzip(raw);
  return new Search(raw);
}

class Search {
  constructor(raw) {
    const magic = td.decode(raw.subarray(0, 8));
    if (magic !== 'MMSEARCH') throw new Error('Bad search index');
    const dv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
    const hlen = dv.getUint32(8, true);
    const header = JSON.parse(td.decode(raw.subarray(12, 12 + hlen)));
    const base = 12 + hlen;
    // copy into an aligned buffer if needed
    let buf = raw.buffer;
    let off0 = raw.byteOffset + base;
    if (off0 % 8) {
      const c = raw.slice(base);
      buf = c.buffer;
      off0 = 0;
    }
    const sec = (name) => {
      const s = header.sections[name];
      if (s.type === 'utf8') return td.decode(new Uint8Array(buf, off0 + s.offset, s.length));
      return new TYPED[s.type](buf, off0 + s.offset, s.length);
    };
    this.count = header.count;
    this.kinds = header.kinds;
    this.canon = header.canon || {};
    this.names = sec('names').split('\n');
    this.altsRaw = sec('alts').split('\n');
    this.subs = sec('subs').split('\n');
    this.cats = sec('cats').split('\n');
    this.kind = sec('kind');
    this.cat = sec('cat');
    this.sub = sec('sub');
    this.lon = sec('lon');
    this.lat = sec('lat');
    this.imp = sec('imp');
    this.tokens = sec('tokens').split('\n');
    this.tokOff = sec('tokOff');
    this.postings = sec('postings');
    this.lineRec = sec('lineRec');
    this.lineOff = sec('lineOff');
    this.lineXY = sec('lineXY');
    this.polyLabel = sec('polyLabel').split('\n');
    this.polyLevel = sec('polyLevel');
    this.polyBBox = sec('polyBBox');
    this.polyRingOff = sec('polyRingOff');
    this.ringOff = sec('ringOff');
    this.polyXY = sec('polyXY');
    const n = this.count;
    this._cnt = new Uint8Array(n);
    this._last = new Int16Array(n).fill(-1);
    this._nameToks = new Array(n); // lazy cache
    this._grid = null;
  }

  canonOf(t) {
    return this.canon[t] || t;
  }

  /** Index of first token >= s. */
  lowerBound(s) {
    let lo = 0;
    let hi = this.tokens.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.tokens[mid] < s) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  /** Token id ranges matching query word q (prefix of q, exact/prefix of its canonical form). */
  tokenRanges(q) {
    const ranges = [];
    const addPrefix = (p) => {
      const a = this.lowerBound(p);
      let b = a;
      // tokens with prefix p are contiguous
      const hiKey = p + '￿';
      let lo = a;
      let hi = this.tokens.length;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (this.tokens[mid] < hiKey) lo = mid + 1;
        else hi = mid;
      }
      b = lo;
      if (b > a) ranges.push([a, b]);
    };
    addPrefix(q);
    const c = this.canonOf(q);
    if (c !== q) addPrefix(c);
    return ranges;
  }

  recordToks(i) {
    let t = this._nameToks[i];
    if (!t) {
      const nameW = words(this.names[i]);
      const alts = this.altsRaw[i] ? words(this.altsRaw[i].replace(/\|/g, ' ')) : [];
      t = this._nameToks[i] = {
        name: nameW,
        nameC: nameW.map((w) => this.canonOf(w)),
        alt: alts,
        altC: alts.map((w) => this.canonOf(w)),
        folded: nameW.join(' '),
        altFolded: [],
        nickFolded: [],
      };
      if (this.altsRaw[i]) {
        for (const a of this.altsRaw[i].split(' | ')) {
          (a.startsWith('*') ? t.nickFolded : t.altFolded).push(words(a).join(' '));
        }
      }
    }
    return t;
  }

  /** How well query word q (canonical qc) matches a list of record words. 1 exact, <1 prefix, 0 none. */
  static wordScore(q, qc, list, listC) {
    let best = 0;
    for (let j = 0; j < list.length; j++) {
      const w = list[j];
      if (w === q || listC[j] === qc) return 1;
      if (w.startsWith(q)) best = Math.max(best, 0.55 + 0.35 * (q.length / w.length));
      else if (listC[j].startsWith(qc)) best = Math.max(best, 0.5 + 0.3 * (qc.length / listC[j].length));
    }
    return best;
  }

  search(query, opts = {}) {
    const limit = opts.limit ?? 20;
    const near = opts.near || null;
    const qw = words(query || '');
    if (!qw.length || !this.count) return [];
    const qwords = qw.slice(0, 12);
    const qc = qwords.map((w) => this.canonOf(w));
    const kindHint = qc.includes('brgy') ? 'barangay'
      : (qc.includes('stn') || qwords.includes('lrt') || qwords.includes('mrt')) ? 'station'
        : qc.includes('city') ? 'city' : null;
    const k = qwords.length;
    const cnt = this._cnt;
    const last = this._last;
    const touched = [];
    const { tokOff, postings } = this;
    for (let i = 0; i < k; i++) {
      for (const [a, b] of this.tokenRanges(qwords[i])) {
        for (let t = a; t < b; t++) {
          const e = tokOff[t + 1];
          for (let p = tokOff[t]; p < e; p++) {
            const r = postings[p];
            if (last[r] !== i) {
              if (last[r] === -1) touched.push(r);
              last[r] = i;
              cnt[r]++;
            }
          }
        }
      }
    }
    // candidates: all words matched; if too few, allow one missing word (k >= 2)
    let full = [];
    let partial = [];
    for (const r of touched) {
      if (cnt[r] === k) full.push(r);
      else if (k >= 2 && cnt[r] === k - 1) partial.push(r);
    }
    for (const r of touched) { cnt[r] = 0; last[r] = -1; }
    full.sort((a, b) => a - b);
    // ids are importance-ordered: cap the candidates we score (short prefixes match a lot)
    const MAX = k === 1 && qwords[0].length <= 2 ? 300 : 1500;
    if (full.length > MAX) full = full.slice(0, MAX);
    let cands = full.map((r) => [r, 0]);
    if (full.length < limit && partial.length) {
      partial.sort((a, b) => a - b);
      cands = cands.concat(partial.slice(0, MAX).map((r) => [r, 1]));
    }
    const qFolded = qwords.join(' ');
    let nearLon = 0;
    let nearLat = 0;
    let cosLat = 1;
    if (near) {
      nearLon = near[0];
      nearLat = near[1];
      cosLat = Math.cos((nearLat * Math.PI) / 180);
    }
    const scored = [];
    for (const [r, missing] of cands) {
      const rt = this.recordToks(r);
      let text = 0;
      let altOnly = false;
      for (let i = 0; i < k; i++) {
        let s = Search.wordScore(qwords[i], qc[i], rt.name, rt.nameC);
        if (s < 1) {
          const sa = Search.wordScore(qwords[i], qc[i], rt.alt, rt.altC) * 0.85;
          if (sa > s) { s = sa; altOnly = true; }
        }
        text += s;
      }
      text = (text / k) * 100;
      if (rt.nickFolded.includes(qFolded)) text += 60; // curated nickname, e.g. "moa", "bgc"
      else if (rt.folded === qFolded) text += 40;
      else if (rt.altFolded.includes(qFolded)) text += 34;
      else if (rt.folded.startsWith(qFolded)) text += 22;
      else if (rt.nickFolded.some((a) => a.startsWith(qFolded))) text += 18;
      else if (rt.altFolded.some((a) => a.startsWith(qFolded))) text += 12;
      if (!altOnly) text -= Math.min(20, Math.max(0, rt.name.length - k) * 3);
      if (missing) text -= 45;
      let score = text + this.imp[r] * 0.55;
      const kind = this.kinds[this.kind[r]];
      if (kindHint && kind === kindHint) score += 25;
      if (near) {
        const dx = (this.lon[r] / 1e6 - nearLon) * 111.32 * cosLat;
        const dy = (this.lat[r] / 1e6 - nearLat) * 110.54;
        const dkm = Math.sqrt(dx * dx + dy * dy);
        score -= 9 * Math.log2(1 + dkm);
      }
      scored.push([score, r]);
    }
    scored.sort((a, b) => b[0] - a[0]);
    const out = [];
    const seen = new Set();
    for (const [, r] of scored) {
      const key = `${this.names[r]}|${this.kind[r]}|${this.sub[r]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(this.result(r));
      if (out.length >= limit) break;
    }
    return out;
  }

  result(r) {
    return {
      id: `r${r}`,
      name: this.names[r],
      kind: this.kinds[this.kind[r]],
      category: this.cats[this.cat[r]] || null,
      subtitle: this.subs[this.sub[r]] || '',
      lon: this.lon[r] / 1e6,
      lat: this.lat[r] / 1e6,
    };
  }

  // ------------------------------------------------------------- reverse

  buildGrid() {
    const xy = this.lineXY;
    const off = this.lineOff;
    const nl = this.lineRec.length;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < xy.length; i += 2) {
      if (xy[i] < minX) minX = xy[i];
      if (xy[i] > maxX) maxX = xy[i];
      if (xy[i + 1] < minY) minY = xy[i + 1];
      if (xy[i + 1] > maxY) maxY = xy[i + 1];
    }
    const cell = 2000; // 0.002 deg
    const nx = Math.max(1, Math.ceil((maxX - minX) / cell) + 1);
    const ny = Math.max(1, Math.ceil((maxY - minY) / cell) + 1);
    const counts = new Uint32Array(nx * ny + 1);
    const forEachCell = (s, fn) => {
      const x1 = xy[2 * s];
      const y1 = xy[2 * s + 1];
      const x2 = xy[2 * s + 2];
      const y2 = xy[2 * s + 3];
      const cx0 = Math.floor((Math.min(x1, x2) - minX) / cell);
      const cx1 = Math.floor((Math.max(x1, x2) - minX) / cell);
      const cy0 = Math.floor((Math.min(y1, y2) - minY) / cell);
      const cy1 = Math.floor((Math.max(y1, y2) - minY) / cell);
      for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) fn(cy * nx + cx);
    };
    // segment s = vertex index s .. s+1 within a line
    for (let l = 0; l < nl; l++) {
      for (let s = off[l]; s < off[l + 1] - 1; s++) forEachCell(s, (c) => counts[c + 1]++);
    }
    for (let i = 1; i < counts.length; i++) counts[i] += counts[i - 1];
    const fill = counts.slice();
    const segs = new Uint32Array(counts[counts.length - 1]);
    const segLine = new Uint32Array(xy.length / 2);
    for (let l = 0; l < nl; l++) {
      for (let s = off[l]; s < off[l + 1] - 1; s++) {
        segLine[s] = l;
        forEachCell(s, (c) => { segs[fill[c]++] = s; });
      }
    }
    this._grid = { minX, minY, nx, ny, cell, counts, segs, segLine };
  }

  /** Nearest named street within maxM metres: { rec, dist }. */
  nearestStreet(lon, lat, maxM = 80) {
    if (!this.lineRec.length) return null;
    if (!this._grid) this.buildGrid();
    const g = this._grid;
    const xy = this.lineXY;
    const X = lon * 1e6;
    const Y = lat * 1e6;
    const cosLat = Math.cos((lat * Math.PI) / 180);
    const mx = 0.11132 * cosLat; // metres per 1e-6 deg
    const my = 0.11054;
    const cx = Math.floor((X - g.minX) / g.cell);
    const cy = Math.floor((Y - g.minY) / g.cell);
    let best = Infinity;
    let bestSeg = -1;
    for (let y = cy - 1; y <= cy + 1; y++) {
      if (y < 0 || y >= g.ny) continue;
      for (let x = cx - 1; x <= cx + 1; x++) {
        if (x < 0 || x >= g.nx) continue;
        const c = y * g.nx + x;
        for (let i = g.counts[c]; i < g.counts[c + 1]; i++) {
          const s = g.segs[i];
          const ax = (xy[2 * s] - X) * mx;
          const ay = (xy[2 * s + 1] - Y) * my;
          const bx = (xy[2 * s + 2] - X) * mx;
          const by = (xy[2 * s + 3] - Y) * my;
          const dx = bx - ax;
          const dy = by - ay;
          const len2 = dx * dx + dy * dy;
          let t = len2 > 0 ? -(ax * dx + ay * dy) / len2 : 0;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const px = ax + t * dx;
          const py = ay + t * dy;
          const d = px * px + py * py;
          if (d < best) { best = d; bestSeg = s; }
        }
      }
    }
    if (bestSeg < 0) return null;
    const dist = Math.sqrt(best);
    if (dist > maxM) return null;
    return { rec: this.lineRec[g.segLine[bestSeg]], dist };
  }

  /** Admin label at a point: { label, level } (0 barangay, 1 district, 2 city) or null. */
  adminAt(lon, lat) {
    const X = Math.round(lon * 1e6);
    const Y = Math.round(lat * 1e6);
    let found = null;
    const bb = this.polyBBox;
    for (let p = 0; p < this.polyLabel.length; p++) {
      if (X < bb[4 * p] || Y < bb[4 * p + 1] || X > bb[4 * p + 2] || Y > bb[4 * p + 3]) continue;
      if (found && found.level <= this.polyLevel[p]) continue;
      if (this.pointInPoly(p, X, Y)) found = { label: this.polyLabel[p], level: this.polyLevel[p] };
    }
    return found;
  }

  pointInPoly(p, X, Y) {
    const xy = this.polyXY;
    let inside = false;
    for (let r = this.polyRingOff[p]; r < this.polyRingOff[p + 1]; r++) {
      const a = this.ringOff[r];
      const b = this.ringOff[r + 1];
      for (let i = a, j = b - 1; i < b; j = i++) {
        const xi = xy[2 * i];
        const yi = xy[2 * i + 1];
        const xj = xy[2 * j];
        const yj = xy[2 * j + 1];
        if ((yi > Y) !== (yj > Y) && X < ((xj - xi) * (Y - yi)) / (yj - yi) + xi) inside = !inside;
      }
    }
    return inside;
  }

  reverse(lon, lat) {
    if (!this.count) return null;
    const st = this.nearestStreet(lon, lat);
    const adm = this.adminAt(lon, lat);
    if (st) {
      return { name: this.names[st.rec], subtitle: adm ? adm.label : this.subs[this.sub[st.rec]] || '' };
    }
    if (adm) {
      const parts = adm.label.split(', ');
      if (parts.length > 1) return { name: parts.slice(0, -1).join(', '), subtitle: parts[parts.length - 1] };
      return { name: adm.label, subtitle: 'Metro Manila' };
    }
    return null;
  }
}
