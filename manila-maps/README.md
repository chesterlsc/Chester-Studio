# Manila Maps — offline maps for Metro Manila

A clean, green-accented map app for Metro Manila that works **100% offline**
after one download: every street, alley and landmark from OpenStreetMap, 3D
buildings, live GPS follow mode, offline search and offline turn-by-turn
routing for car, motorcycle and walking.

By Chester Studio. Map data © OpenStreetMap contributors (ODbL).

## What you get (`release/`)

| File | What it is |
|------|------------|
| `ManilaMaps-<id>.apk` | Android app. The full map is inside; on first launch it is copied to the app's permanent storage. |
| `ManilaMaps-offline-<id>.zip` | Browser version: unzip into Files, open `Manila Maps.html`, pick `manila.mmap` once. |
| `manila.mmap` + `manila-latest.json` | Files to publish for the in-app **Update map** button (see below). |

## How the data is kept

- One file, `manila.mmap`, holds everything: vector tiles (`tiles.pmtiles`),
  search index, routing graph and fonts. See `CONTRACT.md` for the format.
- Android keeps it at `filesDir/maps/current.mmap` — internal app storage, not
  cache, so "Clear cache" and phone cleaners do not remove it. The app never
  deletes or expires it. When you uninstall, Android asks whether to keep the
  app's data.
- **Save backup to Files** copies the map file anywhere you choose.
- **Import from Files** restores a backup. The current map stays until the new
  file is fully copied and every part has passed its SHA-256 check.
- **Update map** runs only when you tap it. It downloads the new file next to
  the current one, verifies it, then swaps it in. A failed or cancelled update
  leaves your current map untouched.
- The only network access in the app is that button.

## Publishing a map update

1. Rebuild the data: download a fresh `metro_manila.osm.pbf`
   (download.openstreetmap.fr/extracts/asia/philippines/) and run
   `data/build.sh <path-to.pbf>`.
2. `scripts/package.sh` writes `release/manila.mmap` and `release/manila-latest.json`.
3. Create a GitHub release on `chesterlsc/chester-studio` and attach both files.
   The app's default update address is
   `https://github.com/chesterlsc/chester-studio/releases/latest/download/manila-latest.json`
   (changeable in Settings).

## Building

```bash
npm install
data/build.sh                      # OSM .pbf -> data/out/manila.mmap
npm run dev                        # browser dev server, serves data/out at /mapdata/
MM_KEYSTORE=/path/manilamaps.jks MM_KEYSTORE_PASSWORD=... scripts/package.sh   # APK + zip
```

Requirements: Node 22, Java 21, Maven, Python 3.11+, Android SDK (platform 36,
build-tools 36), Gradle 8.14. Keep the release keystore safe: every future APK
must be signed with the same key to install over the old one.

## Layout

See `CONTRACT.md` (folders, file formats, module interfaces).
