#!/usr/bin/env bash
# Download (or refresh) the default Greater Manila OSM extracts from openstreetmap.fr,
# each into its own directory, and verify their md5 sums. Then run data/build.sh.
#
#   data/fetch.sh [dest_dir]     (default /home/user/work/osm)
set -euo pipefail
DEST="${1:-/home/user/work/osm}"
BASE=https://download.openstreetmap.fr/extracts/asia/philippines
fetch() {  # fetch <url-prefix> <dir> <name>
  local dir="$DEST/$2" name="$3"
  mkdir -p "$dir"
  for ext in osm.pbf osm.pbf.md5 state.txt; do
    curl -sS -f -o "$dir/$name.$ext.part" "$1/$name.$ext"
    mv "$dir/$name.$ext.part" "$dir/$name.$ext"
  done
  (cd "$dir" && md5sum -c "$name.osm.pbf.md5")
}
fetch "$BASE" . metro_manila
fetch "$BASE" calabarzon calabarzon
fetch "$BASE" central_luzon central_luzon
