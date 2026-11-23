#!/bin/bash
# Renders every Lumora final in priority order (homepage first, PDP extras last).
# Each final goes through finish.py, which writes the JPEG to the asset-contract path
# and records it in renders/manifest.json.
set -u
SP=/tmp/claude-0/-home-user-Chester-Studio/c51c471c-f281-5048-b5b7-f7b60a856929/scratchpad
PY=$SP/blender-venv/bin/python
WORK=/home/user/Chester-Studio/lumora-beauty
R=$WORK/renders
OUT=$SP/render-finals
LOG=$OUT/queue.log
mkdir -p "$OUT" "$R/scenes"
cd "$R" || exit 1

render() { # id job long_edge samples destination grade(yes|no) use
  local id=$1 job=$2 res=$3 samples=$4 dst=$5 grade=$6 use=$7
  local g=""
  [ "$grade" = "yes" ] && g="--grade"
  mkdir -p "$(dirname "$dst")"
  echo "START $id $(date +%T)" >> "$LOG"
  if "$PY" rig/render_job.py "jobs/$job.json" --res "$res" --samples "$samples" --threads 4 --out "$OUT/$id.png" >> "$LOG" 2>&1; then
    python3 jobs/finish.py "$OUT/$id.png" "$dst" $g --id "$id" --use "$use" --status final >> "$LOG" 2>&1
    echo "DONE $id $(date +%T)" >> "$LOG"
  else
    echo "FAILED $id $(date +%T)" >> "$LOG"
  fi
}

render ritual scene-ritual 2400 64 "$R/scenes/ritual.jpg" yes "Ritual hotspot scene"
render hero-mobile scene-hero-mobile 1460 64 "$R/scenes/hero-mobile.jpg" yes "Homepage hero, mobile"
for h in haze-soft-focus-cream apricity-lip-cheek-balm gloaming-body-oil slow-hour-golden-milk; do
  render "packshot-$h" "packshot-$h" 1500 64 "$WORK/products/$h/$h-packshot.jpg" no "Packshot, $h"
done
render golden-pair scene-golden-pair 1500 64 "$R/scenes/golden-pair.jpg" yes "Golden pair bundle card"
render closing scene-closing 2880 48 "$R/scenes/closing.jpg" yes "Closing band"
for x in in-light detail with-haze back; do
  render "long-light-serum-$x" "pdp-long-light-serum-$x" 1500 64 "$WORK/products/long-light-serum/long-light-serum-$x.jpg" yes "PDP gallery, $x"
done
echo "ALLDONE $(date +%T)" >> "$LOG"
