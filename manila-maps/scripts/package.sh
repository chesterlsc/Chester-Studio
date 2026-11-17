#!/usr/bin/env bash
# Builds the release outputs into release/:
#   ManilaMaps-<id>.apk           Android app with the offline map inside
#   ManilaMaps-offline-<id>.zip   index.html + manila.mmap, opens from Files with no internet
#   manila-latest.json + manila.mmap   files to host for the in-app "Update map" button
#
# Env: ANDROID_HOME (default /home/user/android-sdk), GRADLE (default /opt/gradle-8.14.3/bin/gradle),
#      MM_KEYSTORE / MM_KEYSTORE_PASSWORD / MM_KEY_ALIAS for release signing (a debug-signed APK is built otherwise).
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$PWD
export ANDROID_HOME=${ANDROID_HOME:-/home/user/android-sdk}
GRADLE=${GRADLE:-/opt/gradle-8.14.3/bin/gradle}
MMAP=data/out/manila.mmap
[ -f "$MMAP" ] || { echo "Missing $MMAP — run data/build.sh first" >&2; exit 1; }

ID=$(python3 -I -c 'import zipfile,json,sys;print(json.loads(zipfile.ZipFile(sys.argv[1]).read("manifest.json"))["id"])' "$MMAP")
VER=${ID#manila-}
echo "Bundle: $ID ($(du -h "$MMAP" | cut -f1))"
mkdir -p release

echo "== web build"
npm run -s build
npm run -s build:web-offline

echo "== android"
mkdir -p android/app/src/main/assets/mapdata
cp "$MMAP" android/app/src/main/assets/mapdata/manila.mmap
npx cap sync android >/dev/null
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
(cd android && "$GRADLE" --no-daemon -q assembleRelease)
APK_DIR=android/app/build/outputs/apk/release
if [ -n "${MM_KEYSTORE:-}" ]; then
  APK=$APK_DIR/app-release.apk
else
  # No release key given: sign with the debug key so it still installs.
  (cd android && "$GRADLE" --no-daemon -q assembleDebug)
  APK=android/app/build/outputs/apk/debug/app-debug.apk
fi
cp "$APK" "release/ManilaMaps-$VER.apk"

echo "== offline zip"
STAGE=$(mktemp -d)
mkdir -p "$STAGE/Manila Maps"
cp dist-offline/index.html "$STAGE/Manila Maps/Manila Maps.html"
cp "$MMAP" "$STAGE/Manila Maps/manila.mmap"
cp scripts/OFFLINE-README.txt "$STAGE/Manila Maps/READ ME.txt"
rm -f "release/ManilaMaps-offline-$VER.zip"
(cd "$STAGE" && zip -q -0 -r "$ROOT/release/ManilaMaps-offline-$VER.zip" "Manila Maps")
rm -rf "$STAGE"

echo "== update files"
cp "$MMAP" release/manila.mmap
python3 -I - "$MMAP" "$ID" > release/manila-latest.json <<'PY'
import hashlib, json, os, sys
p, i = sys.argv[1], sys.argv[2]
h = hashlib.sha256()
with open(p, 'rb') as f:
    for b in iter(lambda: f.read(1 << 20), b''):
        h.update(b)
print(json.dumps({"id": i, "url": "manila.mmap", "size": os.path.getsize(p), "sha256": h.hexdigest()}, indent=2))
PY
ls -la release
