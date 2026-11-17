// End-to-end check of the real bundle: node data/test/run.mjs [path/to/manila.mmap]
// Opens the .mmap through src/core/bundle.js, verifies the manifest, runs searches
// and routes (car / motorcycle / walk) and sanity-checks the results.
import { openMmap, DEFAULT_MMAP } from './lib.mjs';
import { verifyBundle } from '../../src/core/bundle.js';
import { createSearch } from '../../src/engine/search.js';
import { createRouter } from '../../src/engine/router.js';
import { routerCore } from '../../src/engine/router-core.js';
import zlib from 'node:zlib';
import { PMTiles } from 'pmtiles';
import { VectorTile } from '@mapbox/vector-tile';
import * as pbfMod from 'pbf';

const Pbf = pbfMod.default ?? pbfMod.PbfReader;

const file = process.argv[2] || DEFAULT_MMAP;
let failures = 0;
const fail = (msg) => { failures++; console.log(`  FAIL ${msg}`); };
const ms = (t) => `${(performance.now() - t).toFixed(1)} ms`;

const t0 = performance.now();
const bundle = await openMmap(file);
console.log(`bundle ${bundle.manifest.id} (${(bundle.reader.size / 1e6).toFixed(1)} MB) opened in ${ms(t0)}`);
for (const [n, e] of bundle.entries) {
  if (!n.startsWith('glyphs/')) console.log(`  ${n.padEnd(16)} ${(e.size / 1e6).toFixed(2).padStart(8)} MB`);
}
const glyphs = [...bundle.entries.keys()].filter((n) => n.startsWith('glyphs/'));
console.log(`  glyphs: ${glyphs.length} ranges`);
if ([...bundle.entries.keys()][0] !== 'manifest.json') fail('manifest.json is not the first entry');
let t = performance.now();
await verifyBundle(bundle);
console.log(`manifest sizes + sha256 verified in ${ms(t)}`);

// ------------------------------------------------------------------ tiles
console.log('\n== tiles ==');
{
  const pm = new PMTiles({
    getKey: () => 'manila',
    async getBytes(offset, length) {
      const len = Math.max(0, Math.min(length, bundle.size('tiles.pmtiles') - offset));
      return { data: (await bundle.read('tiles.pmtiles', offset, len)).slice().buffer };
    },
  });
  const h = await pm.getHeader();
  const meta = await pm.getMetadata();
  const layers = meta.vector_layers.map((l) => l.id).sort();
  console.log(`pmtiles z${h.minZoom}-${h.maxZoom}, layers: ${layers.join(' ')}`);
  for (const l of ['aeroway', 'boundary', 'building', 'landuse', 'place', 'poi', 'rail', 'road', 'water', 'waterway']) {
    if (!layers.includes(l)) fail(`tile layer ${l} missing`);
  }
  const tileAt = async (z, lon, lat) => {
    const n = 2 ** z;
    const x = Math.floor(((lon + 180) / 360) * n);
    const r = (lat * Math.PI) / 180;
    const y = Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n);
    const t = await pm.getZxy(z, x, y);
    if (!t) return null;
    let d = new Uint8Array(t.data);
    if (d[0] === 0x1f) d = zlib.gunzipSync(d);
    return new VectorTile(new Pbf(d));
  };
  const sea = await tileAt(10, 120.93, 14.57);
  const seaOk = sea && sea.layers.water && [...Array(sea.layers.water.length).keys()].some((i) => sea.layers.water.feature(i).properties.class === 'sea');
  console.log(`Manila Bay z10 has water class=sea: ${!!seaOk}`);
  if (!seaOk) fail('no sea polygon in Manila Bay');
  const mk = await tileAt(14, 121.024, 14.556);
  const summary = Object.entries(mk.layers).map(([k, v]) => `${k}:${v.length}`).join(' ');
  console.log(`Makati z14 tile: ${summary}`);
  let heights = 0;
  for (let i = 0; i < mk.layers.building.length; i++) if (typeof mk.layers.building.feature(i).properties.height === 'number') heights++;
  if (heights !== mk.layers.building.length) fail('buildings without numeric height');
}

// ------------------------------------------------------------------ search
console.log('\n== search ==');
t = performance.now();
const search = await createSearch(bundle);
console.log(`search index loaded in ${ms(t)} (${search.count} records)`);
const near = [121.02, 14.58];
const cases = [
  ['sm megamall', /SM Megamall/],
  ['ayala ave', /Ayala Avenue/],
  ['edsa', /EDSA/],
  ['bgc', /Bonifacio Global City|BGC/],
  ['naia terminal 3', /NAIA Terminal 3|Terminal 3/],
  ['quiapo church', /Quiapo Church/],
  ['brgy san antonio', /San Antonio/],
  ['makati', /^Makati$/],
  ['up diliman', /University of the Philippines Diliman|UP Diliman/],
  ['greenbelt', /Greenbelt/],
  ['moa', /Mall of Asia/],
  ['rizal park', /Rizal Park|Luneta/],
  ['quezon city', /^Quezon City$/],
  ['st lukes bgc', /St\. Luke's Medical Center/],
  ['Paranaque', /Parañaque/],
  ['mrt cubao', /Cubao/],
];
for (const [q, want] of cases) {
  search.search(q, { near, limit: 10 }); // warm
  t = performance.now();
  const res = search.search(q, { near, limit: 10 });
  const took = performance.now() - t;
  const top = res[0];
  console.log(`"${q}" ${took.toFixed(1)} ms -> ${res.slice(0, 3).map((r) => `${r.name} [${r.kind}${r.category ? '/' + r.category : ''}] (${r.subtitle})`).join(' | ')}`);
  if (!top || !want.test(top.name)) fail(`"${q}": top result ${top && top.name} does not match ${want}`);
  if (took > 30) fail(`"${q}" took ${took.toFixed(1)} ms`);
}
for (const [label, lon, lat] of [['Ayala Ave/Makati Ave', 121.0244, 14.5547], ['Quiapo', 120.9837, 14.5987], ['Cubao', 121.0527, 14.6195], ['Manila Bay', 120.93, 14.57]]) {
  t = performance.now();
  const r = search.reverse(lon, lat);
  console.log(`reverse ${label}: ${r ? `${r.name} — ${r.subtitle}` : 'null'} (${ms(t)})`);
}

// ------------------------------------------------------------------ routing
console.log('\n== routing ==');
t = performance.now();
const router = await createRouter(bundle);
console.log(`router ready in ${ms(t)} (${router.mode} thread)`);

// The worker is created from routerCore.toString(); make sure that source runs standalone.
{
  const msgs = [];
  const fakeSelf = { postMessage: (m) => msgs.push(m) };
  // eslint-disable-next-line no-new-func
  new Function('self', `(${routerCore.toString()})(self);`)(fakeSelf);
  if (!msgs.length || msgs[0].type !== 'hello') fail('inline worker source did not start');
  else console.log('inline worker source starts standalone: ok');
}

const P = {
  'QC Memorial Circle': [121.0509, 14.6516],
  'NAIA Terminal 3': [121.0135, 14.5196],
  'Ayala Triangle': [121.0244, 14.5567],
  'Quiapo Church': [120.9838, 14.5988],
  'SM Mall of Asia': [120.9818, 14.5352],
  'BGC High Street': [121.0510, 14.5508],
  'UP Diliman': [121.0639, 14.6535],
  'Intramuros': [120.9750, 14.5895],
};
const pairs = [
  ['QC Memorial Circle', 'NAIA Terminal 3'],
  ['Ayala Triangle', 'Quiapo Church'],
  ['SM Mall of Asia', 'BGC High Street'],
  ['UP Diliman', 'Ayala Triangle'],
  ['Intramuros', 'SM Mall of Asia'],
];
const BITS = { car: [1, 2], motorcycle: [4, 8], walk: [16, 16] };
const MOTORWAY = new Set(['motorway', 'motorway_link']);
let printed = 0;
for (const [a, b] of pairs) {
  for (const mode of ['car', 'motorcycle', 'walk']) {
    t = performance.now();
    const r = await router.route({ from: P[a], to: P[b], mode, debug: true });
    const took = performance.now() - t;
    if (!r) { fail(`${a} -> ${b} (${mode}): no route`); continue; }
    console.log(`${a} -> ${b} [${mode}]: ${(r.distance / 1000).toFixed(1)} km, ${Math.round(r.duration / 60)} min, ${r.steps.length} steps, ${took.toFixed(0)} ms`);
    // sanity: every edge used in an allowed direction for the mode
    const [fb, bb] = BITS[mode];
    let wrong = 0;
    let motorway = 0;
    let oneWayAgainst = 0;
    for (const d of r.debug) {
      const ok = d.forward ? d.flags & fb : d.flags & bb;
      if (!ok) wrong++;
      if (MOTORWAY.has(d.cls)) motorway++;
      if (mode === 'walk' && !(d.forward ? d.flags & 1 : d.flags & 2) && (d.flags & 3)) oneWayAgainst++;
    }
    if (wrong) fail(`${mode} route uses ${wrong} edges against their allowed direction/access`);
    if (mode === 'motorcycle' && motorway) fail(`motorcycle route uses ${motorway} motorway edges`);
    if (mode === 'walk' && motorway) fail(`walk route uses ${motorway} motorway edges`);
    if (mode === 'walk' && oneWayAgainst) console.log(`    (walk goes against car one-way direction on ${oneWayAgainst} edges — allowed)`);
    const stepSum = r.steps.reduce((s, x) => s + x.distance, 0);
    if (Math.abs(stepSum - r.distance) > 5) fail(`step distances ${stepSum} != route distance ${r.distance}`);
    if (r.steps[0].maneuver !== 'depart' || r.steps.at(-1).maneuver !== 'arrive') fail('steps must start with depart and end with arrive');
    for (const s of r.steps) {
      if (s.geometryIndex < 0 || s.geometryIndex >= r.geometry.length) fail(`bad geometryIndex ${s.geometryIndex}`);
    }
    if (a === 'QC Memorial Circle' && took > 1500) fail(`cross-city route took ${took.toFixed(0)} ms`);
    if (printed < 3 && (mode === 'car' || (mode === 'walk' && printed === 2))) {
      printed++;
      for (const s of r.steps) console.log(`      ${s.instruction.padEnd(60)} ${String(Math.round(s.distance)).padStart(6)} m`);
    }
  }
}
// timing of the benchmark route after warm-up
{
  const runs = [];
  for (let i = 0; i < 5; i++) {
    t = performance.now();
    await router.route({ from: P['QC Memorial Circle'], to: P['NAIA Terminal 3'], mode: 'car' });
    runs.push(performance.now() - t);
  }
  console.log(`QC Memorial Circle -> NAIA T3 car, warm: ${runs.map((x) => x.toFixed(0)).join(', ')} ms`);
}
// Robustness: random start/end points across Metro Manila must never throw
// (e.g. starting on a roundabout), and every route must be well-formed.
{
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const [W, S, E, N] = [120.96, 14.40, 121.12, 14.76];
  const pts = [[121.0493, 14.6515], [121.0509, 14.6516]]; // on / next to QC Memorial Circle roundabout
  for (let i = 0; i < 120; i++) pts.push([W + rnd() * (E - W), S + rnd() * (N - S)]);
  let ok = 0, none = 0, threw = 0;
  for (let i = 0; i + 1 < pts.length; i += 1) {
    for (const mode of ['car', 'motorcycle', 'walk']) {
      try {
        const r = await router.route({ from: pts[i], to: pts[(i * 7 + 3) % pts.length], mode });
        if (!r) { none++; continue; }
        if (r.steps[0].maneuver !== 'depart' || r.steps.at(-1).maneuver !== 'arrive') fail('random route: bad steps');
        if (r.steps.some((s) => !s.instruction)) fail('random route: step without instruction');
        ok++;
      } catch (e) {
        threw++;
        fail(`random route ${JSON.stringify(pts[i])} [${mode}] threw: ${e.message}`);
      }
    }
  }
  console.log(`random routes: ${ok} ok, ${none} no route, ${threw} threw`);
}

const sn = await router.snap([121.0244, 14.5567], 'car');
console.log('snap Ayala Triangle (car):', JSON.stringify(sn));

console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL CHECKS PASSED');
process.exit(failures ? 1 : 0);
