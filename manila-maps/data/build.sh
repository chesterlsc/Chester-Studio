#!/usr/bin/env bash
# Build the offline map bundle: OSM .pbf -> data/out/manila.mmap
#
#   data/build.sh [input.osm.pbf] [state.txt]
#
# input defaults to /home/user/work/osm/metro_manila.osm.pbf; the OSM timestamp is
# read from the matching *.state.txt (osmosis/openstreetmap.fr replication state).
# Intermediates go to data/work/ (git-ignored). Needs: python3 (venv), Java 21 +
# Maven (deps from Maven Central only), node + `npm install` done in manila-maps/
# (for the smp-noto-glyphs fonts and the end-to-end test).
set -euo pipefail
export PYTHONDONTWRITEBYTECODE=1

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$HERE")"
PBF="$(realpath "${1:-/home/user/work/osm/metro_manila.osm.pbf}")"
STATE="${2:-${PBF%.osm.pbf}.state.txt}"
WORK="$HERE/work"
OUT="$HERE/out"
MVN="${MVN:-$(command -v mvn || echo /opt/maven/bin/mvn)}"
GLYPHS="$ROOT/node_modules/smp-noto-glyphs/fixtures/glyphs"
JAVA_MEM="${JAVA_MEM:-6g}"

[ -f "$PBF" ] || { echo "input not found: $PBF" >&2; exit 1; }
[ -d "$GLYPHS" ] || { echo "glyphs missing: run 'npm install' in $ROOT" >&2; exit 1; }
mkdir -p "$WORK" "$OUT"
log() { echo "[$(date +%H:%M:%S)] $*"; }

# --- toolchains ------------------------------------------------------------
PY="$WORK/venv/bin/python"
if [ ! -x "$PY" ] || ! cmp -s "$HERE/requirements.txt" "$WORK/venv/.requirements"; then
  log "python venv"
  python3 -m venv "$WORK/venv"
  "$WORK/venv/bin/pip" install -q -r "$HERE/requirements.txt"
  cp "$HERE/requirements.txt" "$WORK/venv/.requirements"
fi
log "compile tile profile (Planetiler)"
"$MVN" -q -B -f "$HERE/tiles/pom.xml" compile dependency:build-classpath \
  -Dmdep.outputFile="$HERE/tiles/target/classpath.txt" 2>&1 | grep -v '^Picked up JAVA_TOOL_OPTIONS' || true
[ -f "$HERE/tiles/target/classpath.txt" ] || { echo "maven build failed" >&2; exit 1; }
CP="$HERE/tiles/target/classes:$(cat "$HERE/tiles/target/classpath.txt")"

# --- data steps (search + route run in parallel with the tiles) -------------
log "search index + routing graph (background)"
"$PY" "$HERE/scripts/build_search.py" "$PBF" "$WORK/search.bin" > "$WORK/search.log" 2>&1 &
SEARCH_PID=$!
"$PY" "$HERE/scripts/build_route.py" "$PBF" "$WORK/route.bin" > "$WORK/route.log" 2>&1 &
ROUTE_PID=$!

log "sea / lake polygons"
"$PY" "$HERE/scripts/water.py" "$PBF" "$WORK/water.geojson" "$WORK/water_boundaries.txt"

log "vector tiles"
java -Xmx"$JAVA_MEM" -cp "$CP" manila.ManilaProfile \
  --osm_path="$PBF" --water_path="$WORK/water.geojson" \
  --water_boundaries="$WORK/water_boundaries.txt" --output="$WORK/tiles.pmtiles" \
  --bounds=120.55,14.25,121.35,14.90 --tmpdir="$WORK/tmp" --force \
  > "$WORK/planetiler.log" 2>&1 || { tail -40 "$WORK/planetiler.log"; exit 1; }
rm -rf "$WORK/tmp"

wait $SEARCH_PID || { cat "$WORK/search.log"; exit 1; }
tail -1 "$WORK/search.log"
wait $ROUTE_PID || { cat "$WORK/route.log"; exit 1; }
tail -1 "$WORK/route.log"

log "pack bundle"
"$PY" "$HERE/scripts/pack.py" --out "$OUT/manila.mmap" --tiles "$WORK/tiles.pmtiles" \
  --search "$WORK/search.bin" --route "$WORK/route.bin" --glyphs "$GLYPHS" --state "$STATE"

if command -v node > /dev/null && [ "${SKIP_TEST:-0}" != 1 ]; then
  log "end-to-end test"
  node "$HERE/test/run.mjs" "$OUT/manila.mmap" > "$WORK/test.log" 2>&1 \
    && log "test passed (see data/work/test.log)" \
    || { tail -30 "$WORK/test.log"; echo "TEST FAILED" >&2; exit 1; }
fi
log "done: $OUT/manila.mmap"
