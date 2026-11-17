#!/usr/bin/env python3
"""Pack the map bundle (manila.mmap): a STORED zip, manifest.json first.

usage: pack.py --out data/out/manila.mmap --tiles T --search S --route R \
               --glyphs DIR --state metro_manila.state.txt
"""
import argparse
import datetime as dt
import gzip
import hashlib
import json
import os
import re
import sys
import zipfile

BOUNDS = [120.90, 14.34, 121.14, 14.79]
CENTER = [121.02, 14.58]
FONT = 'Noto Sans Regular'


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def osm_timestamp(state_path):
    if not state_path or not os.path.exists(state_path):
        return None
    txt = open(state_path).read()
    m = re.search(r'timestamp=([0-9T:\\\-]+Z)', txt)
    return m.group(1).replace('\\', '') if m else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    ap.add_argument('--tiles', required=True)
    ap.add_argument('--search', required=True)
    ap.add_argument('--route', required=True)
    ap.add_argument('--glyphs', required=True, help='dir with <range>.pbf.gz (or .pbf)')
    ap.add_argument('--state', help='osm state.txt with timestamp=')
    ap.add_argument('--timestamp', help='override OSM timestamp (ISO, Z)')
    a = ap.parse_args()

    ts = a.timestamp or osm_timestamp(a.state)
    if not ts:
        ts = dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        print('warning: no OSM timestamp, using now', file=sys.stderr)
    day = ts[:10].replace('-', '')

    entries = []  # (name, bytes)
    for name, path in (('tiles.pmtiles', a.tiles), ('search.bin', a.search), ('route.bin', a.route)):
        with open(path, 'rb') as f:
            entries.append((name, f.read()))
    glyphs = []
    for fn in os.listdir(a.glyphs):
        m = re.fullmatch(r'(\d+-\d+)\.pbf(\.gz)?', fn)
        if not m:
            continue
        raw = open(os.path.join(a.glyphs, fn), 'rb').read()
        if m.group(2):
            raw = gzip.decompress(raw)
        glyphs.append((int(m.group(1).split('-')[0]), f'glyphs/{FONT}/{m.group(1)}.pbf', raw))
    if not glyphs:
        raise SystemExit('no glyphs found in ' + a.glyphs)
    entries += [(n, b) for _, n, b in sorted(glyphs)]

    manifest = {
        'format': 'manila-mapbundle',
        'formatVersion': 1,
        'id': f'manila-{day}',
        'title': 'Metro Manila',
        'osmTimestamp': ts,
        'builtAt': dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'bounds': BOUNDS,
        'center': CENTER,
        'minzoom': 0,
        'maxzoom': 14,
        'attribution': '© OpenStreetMap contributors',
        'fonts': [FONT],
        'files': {n: {'size': len(b), 'sha256': sha256(b)} for n, b in entries},
    }
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    tmp = a.out + '.tmp'
    with zipfile.ZipFile(tmp, 'w', compression=zipfile.ZIP_STORED, allowZip64=True) as z:
        def add(name, data):
            zi = zipfile.ZipInfo(name, date_time=(int(day[:4]), int(day[4:6]), int(day[6:8]), 0, 0, 0))
            zi.compress_type = zipfile.ZIP_STORED
            zi.external_attr = 0o644 << 16
            z.writestr(zi, data)
        add('manifest.json', json.dumps(manifest, indent=2, ensure_ascii=False).encode())
        for n, b in entries:
            add(n, b)
    os.replace(tmp, a.out)
    print(f'{a.out}: {os.path.getsize(a.out):,} bytes, id {manifest["id"]}')
    for n, b in entries:
        if not n.startswith('glyphs/'):
            print(f'  {n:16s} {len(b):>12,}')
    print(f'  glyphs ({len(glyphs)} ranges) {sum(len(b) for _, _, b in glyphs):>8,}')


if __name__ == '__main__':
    main()
