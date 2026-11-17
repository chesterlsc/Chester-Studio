// Small geodesy helpers (good enough at city scale).
const R = 6371008.8;
const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

export function distance(a, b) {
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const la1 = toRad(a[1]), la2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function bearing(a, b) {
  const la1 = toRad(a[1]), la2 = toRad(b[1]);
  const dLon = toRad(b[0] - a[0]);
  const y = Math.sin(dLon) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function destination(p, brg, dist) {
  const d = dist / R, b = toRad(brg);
  const la1 = toRad(p[1]), lo1 = toRad(p[0]);
  const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(b));
  const lo2 = lo1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(la1), Math.cos(d) - Math.sin(la1) * Math.sin(la2));
  return [toDeg(lo2), toDeg(la2)];
}

export function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

/** Shortest signed difference b - a in degrees, in (-180, 180]. */
export function angleDiff(a, b) {
  let d = ((b - a) % 360 + 540) % 360 - 180;
  if (d === -180) d = 180;
  return d;
}
export function lerpAngle(a, b, t) { return (a + angleDiff(a, b) * t + 360) % 360; }

/** Cumulative distances along a polyline. */
export function cumulative(coords) {
  const cum = new Float64Array(coords.length);
  for (let i = 1; i < coords.length; i++) cum[i] = cum[i - 1] + distance(coords[i - 1], coords[i]);
  return cum;
}

/**
 * Project point p onto the polyline, searching segments [from, to).
 * Returns { index (segment start), t, point, dist (m from p), along (m from start) }.
 */
export function project(coords, cum, p, from = 0, to = coords.length - 1) {
  const kx = Math.cos(toRad(p[1])) * 111320, ky = 110540;
  let best = null;
  from = Math.max(0, from);
  to = Math.min(coords.length - 1, to);
  for (let i = from; i < to; i++) {
    const a = coords[i], b = coords[i + 1];
    const ax = (a[0] - p[0]) * kx, ay = (a[1] - p[1]) * ky;
    const bx = (b[0] - p[0]) * kx, by = (b[1] - p[1]) * ky;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let t = len2 > 0 ? -(ax * dx + ay * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    const x = ax + dx * t, y = ay + dy * t;
    const d = Math.sqrt(x * x + y * y);
    if (!best || d < best.dist) best = { index: i, t, dist: d };
  }
  if (!best) return { index: 0, t: 0, point: coords[0], dist: distance(p, coords[0]), along: 0 };
  const a = coords[best.index], b = coords[best.index + 1];
  best.point = lerp(a, b, best.t);
  best.along = cum[best.index] + (cum[best.index + 1] - cum[best.index]) * best.t;
  return best;
}

/** Point at a given distance along the polyline, plus the segment bearing there. */
export function pointAlong(coords, cum, along) {
  const n = coords.length;
  if (along <= 0) return { point: coords[0], bearing: bearing(coords[0], coords[1] || coords[0]), index: 0 };
  if (along >= cum[n - 1]) return { point: coords[n - 1], bearing: bearing(coords[Math.max(0, n - 2)], coords[n - 1]), index: n - 2 };
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= along) lo = mid; else hi = mid; }
  const seg = cum[hi] - cum[lo];
  const t = seg > 0 ? (along - cum[lo]) / seg : 0;
  return { point: lerp(coords[lo], coords[hi], t), bearing: bearing(coords[lo], coords[hi]), index: lo };
}

/** Polyline slice from `along` to the end. */
export function sliceFrom(coords, cum, along) {
  const p = pointAlong(coords, cum, along);
  return [p.point, ...coords.slice(p.index + 1)];
}
export function sliceTo(coords, cum, along) {
  const p = pointAlong(coords, cum, along);
  return [...coords.slice(0, p.index + 1), p.point];
}

/** Circle polygon (GeoJSON ring) around a point. */
export function circle(center, radius, steps = 48) {
  const ring = [];
  for (let i = 0; i <= steps; i++) ring.push(destination(center, (i / steps) * 360, radius));
  return ring;
}

export function bounds(coords) {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const [x, y] of coords) { if (x < w) w = x; if (x > e) e = x; if (y < s) s = y; if (y > n) n = y; }
  return [[w, s], [e, n]];
}

// ---- formatting ----
export function fmtDistance(m) {
  if (m == null || !isFinite(m)) return '';
  if (m < 50) return `${Math.max(5, Math.round(m / 5) * 5)} m`;
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  if (m < 10000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m / 1000)} km`;
}
export function fmtDuration(s) {
  if (s == null || !isFinite(s)) return '';
  const min = Math.max(1, Math.round(s / 60));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
export function fmtClock(date) {
  try { return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); } catch { return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`; }
}
/** Spoken distance ("200 meters", "1.5 kilometers"). */
export function sayDistance(m) {
  if (m < 1000) {
    const r = m < 100 ? Math.round(m / 10) * 10 : Math.round(m / 50) * 50;
    return `${Math.max(10, r)} meters`;
  }
  const km = Math.round(m / 100) / 10;
  return `${km % 1 === 0 ? km.toFixed(0) : km} kilometer${km === 1 ? '' : 's'}`;
}
