#!/usr/bin/env python3
"""Build sea + Laguna de Bay polygons for the tile build.

The OSM extract is clipped to the NCR polygon, so there is no ready-made water
polygon for Manila Bay. We take the `natural=coastline` ways in the extract
(OSM convention: land on the left, water on the right), merge them and close the
open ends with an approximate outline of the coasts outside Metro Manila
(Bulacan in the north, Cavite in the south). Laguna de Bay's multipolygon is
incomplete in the extract, so its shoreline ways are closed the same way.

Output: GeoJSON FeatureCollection with properties {class, name}.
usage: water.py <input.osm.pbf> <out.geojson>
"""
import json
import sys

import osmium
from shapely.geometry import LineString, MultiLineString, Polygon, mapping
from shapely.ops import linemerge, unary_union
from shapely.validation import make_valid

# Approximate coast outside the extract, used only to close the polygons.
# Cavite coast from the Zapote river mouth (Las Pinas/Bacoor) round Bacoor Bay,
# Cavite City (Sangley Point) and down to Naic/Ternate, then far west.
CAVITE = [
    (120.945, 14.462), (120.925, 14.455), (120.905, 14.450), (120.890, 14.455),
    (120.893, 14.470), (120.900, 14.485), (120.908, 14.497), (120.895, 14.503),
    (120.880, 14.490), (120.868, 14.475), (120.858, 14.452), (120.848, 14.428),
    (120.835, 14.395), (120.800, 14.355), (120.750, 14.320), (120.700, 14.290),
    (120.600, 14.290),
]
# Bulacan / Pampanga coast from far west back to the Navotas/Obando boundary.
BULACAN = [
    (120.600, 14.780), (120.700, 14.785), (120.780, 14.775), (120.840, 14.750),
    (120.875, 14.730), (120.893, 14.716),
]
# Laguna de Bay: the extract has the Muntinlupa/Taguig shore; close it through
# the lake towards the Rizal and Laguna shores (outside the map bounds).
LAGUNA_EAST = [
    (121.140, 14.533), (121.200, 14.520), (121.300, 14.480), (121.300, 14.250),
    (121.200, 14.250), (121.150, 14.290), (121.120, 14.320), (121.095, 14.340),
    (121.078, 14.358),
]
LAGUNA_REL = 79348


def collect(path):
    coast, lake_ways, lake_ids = [], [], set()
    for o in osmium.FileProcessor(path, osmium.osm.RELATION):
        if o.id == LAGUNA_REL:
            lake_ids = {m.ref for m in o.members if m.type == 'w'}
    fp = osmium.FileProcessor(path, osmium.osm.NODE | osmium.osm.WAY).with_locations()
    for w in fp:
        if not w.is_way():
            continue
        try:
            coords = [(n.lon, n.lat) for n in w.nodes]
        except osmium.InvalidLocationError:
            continue
        if len(coords) < 2:
            continue
        if w.tags.get('natural') == 'coastline':
            coast.append(LineString(coords))
        if w.id in lake_ids:
            lake_ways.append(LineString(coords))
    return coast, lake_ways


def parts(g):
    return list(g.geoms) if hasattr(g, 'geoms') else [g]


def polys(g):
    return [p for p in parts(make_valid(g)) if p.geom_type == 'Polygon' and p.area > 0] + \
        [q for p in parts(make_valid(g)) if p.geom_type in ('MultiPolygon', 'GeometryCollection')
         for q in parts(p) if q.geom_type == 'Polygon']


def main(src, out):
    coast, lake = collect(src)
    features = []
    merged = parts(linemerge(MultiLineString(coast)))
    open_lines = [g for g in merged if not g.is_ring]
    rings = [g for g in merged if g.is_ring]
    main_line = max(open_lines, key=lambda g: g.length)
    c = list(main_line.coords)
    # Water is on the right; Manila Bay coast runs north -> south.
    if c[0][1] < c[-1][1]:
        raise SystemExit('unexpected coastline direction')
    ring = c + CAVITE + BULACAN + [c[0]]
    sea = unary_union(polys(Polygon(ring)))
    # Coastline rings: counter-clockwise = island (land on the left), subtract.
    for r in rings:
        p = Polygon(r.coords)
        if p.exterior.is_ccw:
            sea = sea.difference(p)
        else:
            sea = sea.union(p)
    for g in sorted(open_lines, key=lambda g: -g.length)[1:]:
        print('warning: ignoring extra open coastline piece', g.length, file=sys.stderr)
    print(f'sea: {len(c)} coast pts, area {sea.area:.4f} deg2, bounds {sea.bounds}', file=sys.stderr)
    features.append({'type': 'Feature', 'properties': {'class': 'sea', 'name': 'Manila Bay'},
                     'geometry': mapping(sea)})

    if lake:
        lm = parts(linemerge(MultiLineString(lake)))
        line = max(lm, key=lambda g: g.length)
        lc = list(line.coords)
        # Start at the southern end, go north along the shore, then close east/south.
        if lc[0][1] > lc[-1][1]:
            lc.reverse()
        lake_poly = unary_union(polys(Polygon(lc + LAGUNA_EAST + [lc[0]])))
        print(f'laguna: {len(lc)} shore pts, area {lake_poly.area:.4f}', file=sys.stderr)
        features.append({'type': 'Feature', 'properties': {'class': 'lake', 'name': 'Laguna de Bay'},
                         'geometry': mapping(lake_poly)})

    with open(out, 'w') as f:
        json.dump({'type': 'FeatureCollection', 'features': features}, f)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
