#!/usr/bin/env python3
"""Merge several OSM extracts (overlapping at their borders) into one sorted,
de-duplicated PBF.

usage: merge.py <out.osm.pbf> <in1.osm.pbf> [in2.osm.pbf ...]
"""
import os
import sys
import time

import osmium


def main(out, inputs):
    t0 = time.time()
    if os.path.exists(out):
        os.remove(out)
    mr = osmium.MergeInputReader()
    for f in inputs:
        mr.add_file(f)
    w = osmium.WriteHandler(out)
    # simplify=True keeps one copy of objects that appear in several extracts
    mr.apply(w, idx='', simplify=True)
    w.close()
    print(f'merged {len(inputs)} files -> {out} ({os.path.getsize(out) / 1e6:.1f} MB) in {time.time() - t0:.0f}s',
          file=sys.stderr)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2:])
