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
cp "$MMAP" "$OUT/mapdata/manila.mmap"
python3 -I - "$MMAP" > "$OUT/mapdata/manila-latest.json" <<'PY'
import hashlib, json, os, sys, zipfile
p = sys.argv[1]
m = json.loads(zipfile.ZipFile(p).read("manifest.json"))
h = hashlib.sha256()
with open(p, 'rb') as f:
    for b in iter(lambda: f.read(1 << 20), b''):
        h.update(b)
print(json.dumps({"id": m["id"], "url": "manila.mmap", "size": os.path.getsize(p), "sha256": h.hexdigest(), "osmTimestamp": m.get("osmTimestamp")}, indent=2))
PY
echo "Web app ready in $(cd "$OUT" && pwd):"
ls -la "$OUT" "$OUT/mapdata"
