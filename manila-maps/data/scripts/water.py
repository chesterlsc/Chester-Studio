#!/usr/bin/env python3
"""Build the sea polygon (and coverage info) for the tile build.

There is no ready-made water-polygon dataset offline, so the sea is built from the
`natural=coastline` ways in the (merged) extract. The regional extracts are clipped
to their admin polygons, so coastlines end wherever a region boundary leaves the
coverage. The coverage area C is the union of the admin_level=3 regions that are
complete in the data (Philippine region polygons include their municipal waters, so
C reaches ~15 km out to sea). Inside C the coastline is complete:

  1. clip the coastline to C and polygonize it together with C's boundary;
  2. classify every face by the coastline direction (OSM: land on the left, water on
     the right), voting with points just right/left of each coastline segment,
     weighted by segment length;
  3. sea = union of the water faces.

Outside C nothing is mapped, but leaving it blank would show land-coloured gaps
(e.g. the middle of Manila Bay is outside every region's municipal waters, and the
open sea beyond them). So the area outside C is classified by the nearest point of
C's boundary: next to water -> sea, next to land -> land (a Voronoi split of samples
along C's boundary), clipped to the coverage bbox (+0.1 deg). Islands of other
regions that are only reached across water (northern Mindoro, Marinduque, Lubang)
therefore show as sea: they are outside the data. Lakes (Laguna de Bay, Taal) are
ordinary OSM water polygons and handled by the tile profile.

Outputs:
  <out.geojson>              FeatureCollection {class: sea}
  <out_water_boundaries.txt> admin-boundary way ids running through the sea (not drawn)
  <out_coverage.json>        {"bounds": [w, s, e, n], "regions": [...]}

usage: water.py <input.osm.pbf> <out.geojson> <out_water_boundaries.txt> <out_coverage.json>
"""
import json
import math
import sys
import time

import numpy as np
import osmium
import shapely
from shapely import wkb as wkblib
from shapely.geometry import LineString, MultiLineString, mapping
from shapely.ops import unary_union

t0 = time.time()


def log(*a):
    print(f'[water {time.time() - t0:5.0f}s]', *a, file=sys.stderr)


def collect(path):
    admin_ids = set()
    for o in osmium.FileProcessor(path, osmium.osm.RELATION):
        t = o.tags
        if t.get('boundary') == 'administrative' and t.get('admin_level') in ('6', '10'):
            admin_ids.update(m.ref for m in o.members if m.type == 'w')
    fab = osmium.geom.WKBFactory()
    coast, admin_ways, regions, provinces = [], {}, [], []
    fp = (osmium.FileProcessor(path)
          .with_locations()
          .with_areas(osmium.filter.TagFilter(('boundary', 'administrative'))))
    for o in fp:
        if o.is_way():
            t = o.tags
            is_coast = t.get('natural') == 'coastline'
            if not is_coast and o.id not in admin_ids:
                continue
            try:
                coords = [(n.lon, n.lat) for n in o.nodes]
            except osmium.InvalidLocationError:
                continue
            if len(coords) < 2:
                continue
            if is_coast:
                coast.append(LineString(coords))
            else:
                admin_ways[o.id] = LineString(coords)
        elif o.is_area() and not o.from_way():
            lvl = o.tags.get('admin_level')
            if lvl not in ('3', '4'):
                continue
            try:
                g = wkblib.loads(fab.create_multipolygon(o), hex=True)
            except Exception:
                continue
            g = shapely.make_valid(g)
            (regions if lvl == '3' else provinces).append((o.tags.get('name'), g))
    return coast, admin_ways, regions, provinces


def extend_outside(sea, cover, step=0.004, pad=0.1):
    """Sea outside the coverage: Voronoi cells of boundary samples that touch the sea."""
    w, s, e, n = cover.bounds
    bbox = shapely.box(w - pad, s - pad, e + pad, n + pad)
    outside = bbox.difference(cover)
    if outside.is_empty:
        return sea
    rings = []
    for poly in (cover.geoms if hasattr(cover, 'geoms') else [cover]):
        rings.append(poly.exterior)
        rings.extend(poly.interiors)
    pts = []
    for r in rings:
        k = max(4, int(r.length / step))
        pts.extend(shapely.line_interpolate_point(r, np.linspace(0, r.length, k, endpoint=False)))
    pts = np.array(pts)
    near_sea = shapely.prepared.prep(sea.buffer(2e-4))
    is_water = np.array([near_sea.contains(p) for p in pts])
    cells = shapely.voronoi_polygons(shapely.MultiPoint(list(pts)), extend_to=bbox)
    tree = shapely.STRtree(pts)
    water_cells = []
    for c in cells.geoms:
        idx = tree.query(c, predicate='contains')
        if len(idx) and is_water[idx[0]]:
            water_cells.append(c)
    ext = unary_union(water_cells).intersection(outside)
    log(f'outside coverage: {len(pts)} boundary samples ({int(is_water.sum())} at sea), '
        f'adds {ext.area:.3f} deg2 of sea')
    return unary_union([sea, ext]).buffer(0)


def main(src, out, out_ways, out_cov):
    coast, admin_ways, regions, provinces = collect(src)
    log(f'{len(coast)} coastline ways, {len(admin_ways)} admin ways, regions {[n for n, _ in regions]}')
    if not regions:  # fall back to provinces if no region is complete in the data
        regions = provinces
    cover = unary_union([g for _, g in regions]).buffer(0)
    w, s, e, n = cover.bounds
    with open(out_cov, 'w') as f:
        json.dump({'bounds': [math.floor(w * 100) / 100, math.floor(s * 100) / 100,
                              math.ceil(e * 100) / 100, math.ceil(n * 100) / 100],
                   'regions': [nm for nm, _ in regions]}, f)

    features = []
    if coast:
        merged = shapely.line_merge(MultiLineString(coast), directed=True)
        parts = list(merged.geoms) if hasattr(merged, 'geoms') else [merged]
        log(f'coastline merged into {len(parts)} lines')
        # 1. faces of C cut by the coastline
        clipped = shapely.intersection(MultiLineString(parts), cover)
        noded = unary_union([clipped, cover.boundary])
        faces = list(shapely.polygonize(list(noded.geoms) if hasattr(noded, 'geoms') else [noded]).geoms)
        faces = [f for f in faces if cover.intersects(f.representative_point())]
        log(f'{len(faces)} faces')
        # 2. vote with points 2 m right (water) / left (land) of each coastline segment
        xy = [np.asarray(p.coords) for p in parts]
        a = np.concatenate([c[:-1] for c in xy])
        b = np.concatenate([c[1:] for c in xy])
        mid = (a + b) / 2
        coslat = np.cos(np.radians(mid[:, 1]))
        dx = (b[:, 0] - a[:, 0]) * coslat
        dy = b[:, 1] - a[:, 1]
        ln = np.hypot(dx, dy)
        ok = ln > 1e-9
        mid, dx, dy, ln, coslat = mid[ok], dx[ok], dy[ok], ln[ok], coslat[ok]
        eps = 2e-5
        rx = dy / ln * eps / coslat  # right-hand normal (in degrees)
        ry = -dx / ln * eps
        right = shapely.points(mid[:, 0] + rx, mid[:, 1] + ry)
        left = shapely.points(mid[:, 0] - rx, mid[:, 1] - ry)
        tree = shapely.STRtree(faces)
        water = np.zeros(len(faces))
        land = np.zeros(len(faces))
        for pts, acc in ((right, water), (left, land)):
            pi, fi = tree.query(pts, predicate='within')
            np.add.at(acc, fi, ln[pi])
        sea_faces = [f for i, f in enumerate(faces) if water[i] > land[i]]
        log(f'{len(sea_faces)} sea faces, {len(faces) - len(sea_faces)} land faces')
        sea = unary_union(sea_faces)
        log(f'sea inside coverage {sea.area:.3f} deg2')
        sea = extend_outside(sea, cover)
        log(f'sea area {sea.area:.3f} deg2, bounds {[round(v, 3) for v in sea.bounds]}')
        features.append({'type': 'Feature', 'properties': {'class': 'sea'}, 'geometry': mapping(sea)})
    else:
        sea = None
        log('no coastline in input: no sea polygon')

    with open(out, 'w') as f:
        json.dump({'type': 'FeatureCollection', 'features': features}, f)

    skip = []
    if sea is not None and not sea.is_empty:
        inner = sea.buffer(-0.0004)  # keep boundaries that follow the shore itself
        prep = shapely.prepared.prep(inner)
        skip = [wid for wid, line in admin_ways.items()
                if prep.intersects(line) and line.intersection(inner).length > 0.5 * line.length]
    with open(out_ways, 'w') as f:
        f.write('\n'.join(str(x) for x in sorted(skip)) + '\n')
    log(f'boundary ways in the sea: {len(skip)} of {len(admin_ways)}')


if __name__ == '__main__':
    main(*sys.argv[1:5])
