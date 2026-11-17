#!/usr/bin/env bash
# Build the offline map bundle: OSM extract(s) -> data/out/manila.mmap
#
#   data/build.sh [a.osm.pbf b.osm.pbf ...]
#
# Default inputs (Greater Manila): the openstreetmap.fr extracts of Metro Manila,
# Calabarzon and Central Luzon under /home/user/work/osm/. Several inputs are merged
# (de-duplicated) into data/work/merged.osm.pbf. The OSM timestamp / bundle id come
# from the newest matching *.state.txt next to each input. Intermediates go to
# data/work/ (git-ignored). Needs: python3 (venv), Java 21 + Maven (deps from Maven
# Central only), node + `npm install` done in manila-maps/ (for the smp-noto-glyphs
# fonts and the end-to-end test).
set -euo pipefail
export PYTHONDONTWRITEBYTECODE=1

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$HERE")"
OSM_DIR=/home/user/work/osm
if [ $# -eq 0 ]; then
  set -- "$OSM_DIR/metro_manila.osm.pbf" "$OSM_DIR/calabarzon/calabarzon.osm.pbf" \
         "$OSM_DIR/central_luzon/central_luzon.osm.pbf"
fi
INPUTS=()
STATES=()
for f in "$@"; do
  [ -f "$f" ] || { echo "input not found: $f" >&2; exit 1; }
  INPUTS+=("$(realpath "$f")")
  st="${f%.osm.pbf}.state.txt"
  [ -f "$st" ] && STATES+=(--state "$(realpath "$st")")
done
WORK="$HERE/work"
OUT="$HERE/out"
MVN="${MVN:-$(command -v mvn || echo /opt/maven/bin/mvn)}"
GLYPHS="$ROOT/node_modules/smp-noto-glyphs/fixtures/glyphs"
JAVA_MEM="${JAVA_MEM:-8g}"

[ -d "$GLYPHS" ] || { echo "glyphs missing: run 'npm install' in $ROOT" >&2; exit 1; }
mkdir -p "$WORK" "$OUT"
log() { echo "[$(date +%H:%M:%S)] $*"; }

# --- toolchains ------------------------------------------------------------
PY="$WORK/venv/bin/python"
PYI=("$PY" -I)  # isolated mode: the inputs are untrusted downloads
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

# --- merge inputs ------------------------------------------------------------
if [ ${#INPUTS[@]} -eq 1 ]; then
  PBF="${INPUTS[0]}"
else
  log "merge ${#INPUTS[@]} extracts"
  PBF="$WORK/merged.osm.pbf"
  "${PYI[@]}" "$HERE/scripts/merge.py" "$PBF" "${INPUTS[@]}"
fi

# --- data steps (search + route run in parallel with sea + tiles) -------------
log "search index + routing graph (background)"
"${PYI[@]}" "$HERE/scripts/build_search.py" "$PBF" "$WORK/search.bin" > "$WORK/search.log" 2>&1 &
SEARCH_PID=$!
"${PYI[@]}" "$HERE/scripts/build_route.py" "$PBF" "$WORK/route.bin" > "$WORK/route.log" 2>&1 &
ROUTE_PID=$!

log "sea polygon + coverage"
"${PYI[@]}" "$HERE/scripts/water.py" "$PBF" "$WORK/water.geojson" "$WORK/water_boundaries.txt" "$WORK/coverage.json"
BOUNDS="$("${PYI[@]}" -c "import json,sys; b=json.load(open(sys.argv[1]))['bounds']; print(','.join(str(round(v+d,2)) for v,d in zip(b,(-0.1,-0.1,0.1,0.1))))" "$WORK/coverage.json")"

log "vector tiles (bounds $BOUNDS)"
java -Xmx"$JAVA_MEM" -cp "$CP" manila.ManilaProfile \
  --osm_path="$PBF" --water_path="$WORK/water.geojson" \
  --water_boundaries="$WORK/water_boundaries.txt" --output="$WORK/tiles.pmtiles" \
  --bounds="$BOUNDS" --tmpdir="$WORK/tmp" --force \
  > "$WORK/planetiler.log" 2>&1 || { tail -40 "$WORK/planetiler.log"; exit 1; }
rm -rf "$WORK/tmp"

wait $SEARCH_PID || { cat "$WORK/search.log"; exit 1; }
tail -1 "$WORK/search.log"
wait $ROUTE_PID || { cat "$WORK/route.log"; exit 1; }
tail -1 "$WORK/route.log"

log "pack bundle"
"${PYI[@]}" "$HERE/scripts/pack.py" --out "$OUT/manila.mmap" --tiles "$WORK/tiles.pmtiles" \
  --search "$WORK/search.bin" --route "$WORK/route.bin" --glyphs "$GLYPHS" \
  --coverage "$WORK/coverage.json" "${STATES[@]}"

if command -v node > /dev/null && [ "${SKIP_TEST:-0}" != 1 ]; then
  log "end-to-end test"
  node --max-old-space-size=4096 "$HERE/test/run.mjs" "$OUT/manila.mmap" > "$WORK/test.log" 2>&1 \
    && log "test passed (see data/work/test.log)" \
    || { tail -30 "$WORK/test.log"; echo "TEST FAILED" >&2; exit 1; }
fi
log "done: $OUT/manila.mmap"
