#!/usr/bin/env bash
# Builds the installable web app (iPhone/iPad "Add to Home Screen", Mac "Add to Dock")
# into ../maps/ at the root of the studio site, so it is served at
#   https://chesterstudio.space/maps/
# together with the map file the app downloads once (and on "Update map").
set -euo pipefail
cd "$(dirname "$0")/.."
MMAP=data/out/manila.mmap
[ -f "$MMAP" ] || { echo "Missing $MMAP — run data/build.sh first" >&2; exit 1; }
OUT=../maps
npm run -s build:web-app
rm -rf "$OUT"
mkdir -p "$OUT/mapdata"
cp dist-pwa/index.html "$OUT/index.html"
cp pwa/sw.js pwa/manifest.webmanifest pwa/*.png "$OUT/"
python3 -I scripts/split_bundle.py "$MMAP" "$OUT/mapdata"
echo "Web app ready in $(cd "$OUT" && pwd):"
ls -la "$OUT" "$OUT/mapdata"
