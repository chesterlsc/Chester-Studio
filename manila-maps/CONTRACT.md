# Manila Offline Maps — build contract

This file is the single source of truth for folder layout, file names, data
formats and module interfaces. Each role owns its folders; do not edit files
owned by another role — ask the Lead instead.

## Roles and ownership

| Role | Owns |
|------|------|
| **Lead / QA** | `CONTRACT.md`, `README.md`, `package.json`, `vite.config.js`, `capacitor.config.json`, `index.html` (shell only), `src/core/**`, `android/**`, `scripts/**` |
| **Data** | `data/**`, `src/engine/**` |
| **App** | `src/main.js`, `src/ui/**`, `src/map/**`, `src/nav/**`, `src/styles/**`, `src/assets/**` |

## Folder layout

```
manila-maps/
  CONTRACT.md  README.md  package.json  vite.config.js  capacitor.config.json  index.html
  src/
    main.js            App entry (App)
    core/              bundle reader, MapLibre protocols, native storage API (Lead)
    engine/            search.js, router.js (+ workers) (Data)
    map/ ui/ nav/ styles/ assets/   (App)
  data/                pipeline (Data)
    build.sh           one command: OSM .pbf -> data/out/manila.mmap
    out/               build output, git-ignored
  android/             Capacitor Android project + native MapStore plugin (Lead)
  scripts/             packaging: APK + offline zip (Lead)
  release/             final APK + zip, git-ignored
```

Source data: `/home/user/work/osm/metro_manila.osm.pbf` (openstreetmap.fr
extract of Metro Manila, OSM timestamp in `metro_manila.state.txt`). Never
commit `.pbf`, `.pmtiles` or `.mmap` files.

## The map bundle: `manila.mmap`

One file holds all map data. It is a ZIP with **every entry STORED (no
compression)** so any entry can be read by byte range without unpacking.

| Entry | Content |
|-------|---------|
| `manifest.json` | first entry, see below |
| `tiles.pmtiles` | PMTiles v3 vector tiles (MVT, gzip tile compression is fine), z0–14 |
| `search.bin` | search index, format private to `src/engine/search.js` |
| `route.bin` | routing graph, format private to `src/engine/router.js` |
| `glyphs/Noto Sans Regular/<start>-<end>.pbf` | SDF glyph PBFs, **uncompressed** (from npm `smp-noto-glyphs`, gunzip them) |

`manifest.json`:

```json
{
  "format": "manila-mapbundle",
  "formatVersion": 1,
  "id": "manila-20261117",
  "title": "Metro Manila",
  "osmTimestamp": "2026-11-17T00:11:34Z",
  "builtAt": "2026-11-17T12:00:00Z",
  "bounds": [120.90, 14.34, 121.14, 14.79],
  "center": [121.02, 14.58],
  "minzoom": 0, "maxzoom": 14,
  "attribution": "© OpenStreetMap contributors",
  "fonts": ["Noto Sans Regular"],
  "files": { "tiles.pmtiles": { "size": 123, "sha256": "hex…" }, "…": {} }
}
```

`files` lists every other entry with its byte size and SHA-256. The app
refuses any bundle whose entries do not match (import, update, first install).

Build target: keep the whole `.mmap` as small as is reasonable (aim < 120 MB).

## Vector tile schema (source id `osm` in the style)

All names are in the `name` property (OSM `name`, fallback `name:en`).

| Layer | Geometry | Properties | Min zoom |
|-------|----------|------------|----------|
| `water` | polygon | `class`: `sea` `river` `lake` `pond` `reservoir` `canal` `other` | 0 (sea/big lakes), 10 others |
| `waterway` | line | `class`: `river` `canal` `stream` `drain`; `name` | 9 river, 12 others |
| `landuse` | polygon | `class`: `park` `garden` `grass` `forest` `cemetery` `hospital` `school` `university` `commercial` `retail` `industrial` `residential` `military` `airport` `pitch` `golf` `sand` `wetland` `farmland` `parking` | 10 (large), 13 all |
| `building` | polygon | `height` (m, number), `min_height` (m, number), `name` (only for notable buildings) | 13 |
| `road` | line | `class`: `motorway` `trunk` `primary` `secondary` `tertiary` `minor` `service` `path` `track` `steps`; `ramp` 1/absent; `oneway` 1/-1/absent; `bridge` 1/absent; `tunnel` 1/absent; `layer` int; `name`; `ref`; `toll` 1/absent | motorway/trunk 5, primary 8, secondary 9, tertiary 11, minor 12, service/path/track/steps 13 |
| `rail` | line | `class`: `rail` `subway` `light_rail` `monorail` `tram`; `name`; `bridge`, `tunnel` | 9 |
| `aeroway` | line+polygon | `class`: `runway` `taxiway` `apron` | 11 |
| `boundary` | line | `level`: `city` or `barangay`; | city 9, barangay 13 |
| `place` | point | `class`: `city` `town` `suburb` `quarter` `neighbourhood` `barangay` `village` `locality`; `name`; `rank` (int, lower = more important) | city 8, suburb 11, barangay 13 |
| `poi` | point | `class` (icon category, below); `subclass` (raw OSM value); `name`; `rank` (int, lower = more important) | rank-based: 12 for big malls, stations, hospitals, airports; 14 for everything |

`poi.class` values: `mall` `shop` `supermarket` `convenience` `market` `food`
`cafe` `bar` `bank` `atm` `hospital` `clinic` `pharmacy` `school` `university`
`church` `mosque` `temple` `park` `hotel` `fuel` `charging` `parking` `bus`
`train` `airport` `ferry` `government` `police` `fire` `post` `museum`
`attraction` `cinema` `gym` `sports` `library` `toilet` `other`.

## JavaScript interfaces

### `src/core/bundle.js` (Lead)

```js
openBundle(rangeReader) -> Promise<Bundle>
// rangeReader: { size: number, read(offset, length) -> Promise<Uint8Array>, key: string }
Bundle = {
  manifest,                         // parsed manifest.json
  has(name), size(name),
  read(name, offset, length) -> Promise<Uint8Array>,
  readAll(name) -> Promise<Uint8Array>,
  readJSON(name) -> Promise<any>,
}
httpRangeReader(url) / blobRangeReader(fileOrBlob)   // helpers
```

### `src/core/protocol.js` (Lead)

```js
registerBundle(maplibregl, bundle) -> { sources, glyphs }
// sources = { osm: { type:'vector', url:'pmtiles://manila', attribution:'© OpenStreetMap contributors' } }
// glyphs  = 'mmap://glyphs/{fontstack}/{range}.pbf'
```
The App builds its style with `sources` and `glyphs` from this call and only
uses the font stack `["Noto Sans Regular"]`.

### `src/core/mapstore.js` (Lead)

```js
MapStore.platform            // 'android' | 'web'
MapStore.open(onProgress)    -> Promise<Bundle>   // installs on first run, then opens the permanent copy
MapStore.status()            -> Promise<{ installed, sizeBytes, manifest, location }>
MapStore.exportBackup()      -> Promise<{ ok, fileName, error? }>   // "Save backup to Files"
MapStore.importBackup(onProgress) -> Promise<{ ok, manifest?, error? }>  // "Import from Files"
MapStore.update(onProgress)  -> Promise<{ ok, manifest?, upToDate?, error? }>  // "Update map"
MapStore.getUpdateUrl() / setUpdateUrl(url)
```
After a successful import or update the App calls `location.reload()`.
`onProgress({ phase, loaded, total })`, phase ∈ `copy` `download` `verify` `install`.

### `src/engine/search.js` (Data)

```js
createSearch(bundle) -> Promise<Search>
Search.search(query, { near: [lon, lat] | null, limit = 20 }) -> Result[]   // synchronous, < 30 ms
Search.reverse(lon, lat) -> { name, subtitle } | null                     // nearest street/place label
Result = { id, name, kind, category, subtitle, lon, lat }
// kind ∈ 'street' 'poi' 'barangay' 'city' 'place' 'station'
// category = poi.class for POIs (for the icon); subtitle e.g. "Barangay San Lorenzo, Makati"
```
Case- and accent-insensitive, prefix matching per word, handles common
abbreviations (ave/avenue, st/street, blvd, brgy/barangay, sm, mt), ranks by
text match, importance and distance to `near`.

### `src/engine/router.js` (Data)

```js
createRouter(bundle) -> Promise<Router>
Router.route({ from: [lon, lat], to: [lon, lat], mode }) -> Promise<Route | null>
// mode ∈ 'car' 'motorcycle' 'walk'; must not freeze the UI (use a Worker or yield)
Router.snap([lon, lat], mode) -> Promise<{ lon, lat, name, distance } | null>
Route = {
  mode, distance /* m */, duration /* s */,
  geometry: [[lon, lat], ...],
  steps: [{
    maneuver,   // 'depart' 'turn' 'continue' 'fork' 'merge' 'ramp' 'roundabout' 'uturn' 'arrive'
    modifier,   // 'left' 'right' 'slight left' 'slight right' 'sharp left' 'sharp right' 'straight' 'uturn' | null
    name, ref,
    distance, duration,          // of the stretch that follows the maneuver
    location: [lon, lat],
    geometryIndex,               // index in geometry where the maneuver happens
    instruction                  // "Turn left onto Ayala Avenue"
  }]
}
```
Rules: car = motor vehicles (respect oneway, access, `motor_vehicle`/`motorcar`
tags). Motorcycle = like car but avoids expressways/motorways unless tagged
`motorcycle=yes` (PH rule for small bikes) and respects `motorcycle=*`. Walk =
ignores oneway, uses footways, steps, pedestrian streets, avoids motorways.

## Offline rules (all roles)

- No network request of any kind at runtime except the user tapping **Update map**.
  No CDNs, web fonts, remote styles, analytics. Everything ships in the APK.
- Map data lives in app permanent storage (Android `filesDir`), never in cache.
  Nothing ever deletes it except replacing it with a verified newer/imported bundle.
- Only our own branding. No Grab names or logos. Show "© OpenStreetMap contributors" on the map.
