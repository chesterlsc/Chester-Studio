#!/usr/bin/env python3
"""Build search.bin (format read by src/engine/search.js).

usage: build_search.py <input.osm.pbf> <out search.bin>

Records: cities (17 NCR LGUs), districts, barangays, places/subdivisions, streets
(same-name segments merged per city and proximity cluster), named POIs/stations.
Subtitles come from point-in-polygon against the admin boundaries.
"""
import gzip
import json
import math
import re
import struct
import sys
import time
from collections import defaultdict

import numpy as np
import osmium
import shapely
from shapely import wkb as wkblib
from shapely.geometry import LineString, MultiLineString, Point
from shapely.ops import nearest_points, unary_union
from shapely.strtree import STRtree

sys.path.insert(0, __import__('os').path.dirname(__file__))
from common import (CANON, NCR_CITIES, aliases_for, alt_names, canon, display_name, fold, poi_for,  # noqa: E402
                    tokens)

KINDS = ['street', 'poi', 'barangay', 'city', 'place', 'station']
ROAD_CLASS = {
    'motorway': 'motorway', 'motorway_link': 'motorway', 'trunk': 'trunk', 'trunk_link': 'trunk',
    'primary': 'primary', 'primary_link': 'primary', 'secondary': 'secondary', 'secondary_link': 'secondary',
    'tertiary': 'tertiary', 'tertiary_link': 'tertiary', 'residential': 'minor', 'unclassified': 'minor',
    'living_street': 'minor', 'road': 'minor', 'service': 'service', 'pedestrian': 'path', 'footway': 'path',
    'path': 'path', 'cycleway': 'path', 'steps': 'steps', 'track': 'track', 'busway': 'service',
}
ROAD_IMP = {'motorway': 70, 'trunk': 70, 'primary': 60, 'secondary': 52, 'tertiary': 45, 'minor': 30,
            'service': 18, 'path': 15, 'steps': 8, 'track': 10}
PLACE_IMP = {'suburb': 62, 'quarter': 50, 'neighbourhood': 40, 'village': 45, 'locality': 32, 'hamlet': 30,
             'subdivision': 40, 'gated_community': 38, 'borough': 60, 'town': 70, 'city': 80, 'square': 35,
             'island': 30, 'islet': 25}

t0 = time.time()


def log(*a):
    print(f'[{time.time() - t0:6.1f}s]', *a, file=sys.stderr)


class Collector:
    def __init__(self):
        self.fab = osmium.geom.WKBFactory()
        self.admin = []      # (level, name, osm_id, geom, tags)
        self.places = []     # (name, place, point/geom, tags, osm)
        self.pois = []       # (name, poi tuple, geom, tags, area_m2)
        self.roads = []      # (name, cls, LineString, node_ids, tags)
        self.landuse_named = []  # residential/commercial named areas -> places
        self.rel6 = {}       # admin_level=6 relation tags by name (for cities that fail to assemble)

    def relation(self, r):
        t = r.tags
        if t.get('boundary') == 'administrative' and t.get('admin_level') == '6' and t.get('name') in NCR_CITIES:
            self.rel6[t.get('name')] = dict(t)

    def node(self, n):
        t = n.tags
        if not t:
            return
        name = display_name(t)
        if not name:
            if t.get('amenity') not in ('toilets', 'atm'):
                return
        loc = (n.location.lon, n.location.lat)
        p = t.get('place')
        if p and name:
            self.places.append((name, p, Point(loc), dict(t)))
            return
        poi = poi_for(t)
        if poi and name:
            self.pois.append((name, poi, Point(loc), dict(t), 0.0))

    def way(self, w):
        t = w.tags
        hw = t.get('highway')
        if hw and hw in ROAD_CLASS and t.get('area') != 'yes':
            name = t.get('name') or t.get('name:en')
            if name:
                try:
                    coords = [(nd.lon, nd.lat) for nd in w.nodes]
                except osmium.InvalidLocationError:
                    return
                if len(coords) >= 2:
                    self.roads.append((name.strip(), ROAD_CLASS[hw], LineString(coords),
                                       (w.nodes[0].ref, w.nodes[-1].ref), dict(t)))

    def area(self, a):
        t = a.tags
        ba = t.get('boundary') == 'administrative'
        lvl = t.get('admin_level')
        name = display_name(t)
        if not name:
            return
        want_admin = ba and lvl in ('6', '8', '10') and not a.from_way()
        p = t.get('place')
        poi = poi_for(t)
        lu = t.get('landuse')
        named_lu = lu in ('residential',) and t.get('name')
        if not (want_admin or (p and p in PLACE_IMP) or poi or named_lu):
            return
        try:
            g = wkblib.loads(self.fab.create_multipolygon(a), hex=True)
        except Exception:
            return
        if not g.is_valid:
            g = g.buffer(0)
        if g.is_empty:
            return
        if want_admin:
            self.admin.append((int(lvl), name, a.orig_id(), g, dict(t)))
            return
        if p and p in PLACE_IMP:
            self.places.append((name, p, g, dict(t)))
            return
        if poi:
            self.pois.append((name, poi, g, dict(t), area_m2(g)))
            return
        if named_lu:
            self.landuse_named.append((name, g, dict(t), area_m2(g)))


def area_m2(g):
    lat = g.centroid.y
    return g.area * (111320 ** 2) * math.cos(math.radians(lat))


def dist_m(a, b):
    dx = (a[0] - b[0]) * 111320 * math.cos(math.radians(a[1]))
    dy = (a[1] - b[1]) * 110540
    return math.hypot(dx, dy)


def label_point(g):
    if g.geom_type == 'Point':
        return g
    try:
        if g.geom_type in ('Polygon', 'MultiPolygon'):
            c = g.centroid
            if g.contains(c):
                return c
            return g.representative_point()
    except Exception:
        pass
    return g.centroid


def main(src, out):
    c = Collector()
    fp = osmium.FileProcessor(src).with_locations().with_areas()
    for o in fp:
        if o.is_node():
            c.node(o)
        elif o.is_way():
            c.way(o)
        elif o.is_relation():
            c.relation(o)
        elif o.is_area():
            c.area(o)
    log(f'admin {len(c.admin)} places {len(c.places)} pois {len(c.pois)} roads {len(c.roads)} '
        f'landuse {len(c.landuse_named)}')

    # ---- admin hierarchy
    cities = {}
    for lvl, name, oid, g, t in c.admin:
        if lvl == 6 and name in NCR_CITIES:
            if name not in cities or g.area > cities[name][1].area:
                cities[name] = (oid, g, t)
    missing = [n for n in NCR_CITIES if n not in cities]
    log('cities assembled:', len(cities), 'missing:', missing)
    # Fallback for cities whose boundary relation is incomplete in the extract (e.g. Taguig):
    # union of their barangays, matched by PSGC code prefix (first 7 digits of `ref`).
    for name in missing:
        t = c.rel6.get(name)
        ref = (t or {}).get('ref', '')
        if len(ref) != 10:
            continue
        parts = [g for lvl, _, _, g, bt in c.admin if lvl == 10 and bt.get('ref', '')[:7] == ref[:7]]
        if parts:
            g = unary_union(parts).buffer(0.0003).buffer(-0.0003)
            cities[name] = (0, g, t)
            log(f'  {name}: built from {len(parts)} barangays')
    ncr = unary_union([g for _, g, _ in cities.values()]).buffer(0.002)
    ncr_prep = shapely.prepared.prep(ncr)

    city_names = list(cities.keys())
    city_geoms = [cities[n][1] for n in city_names]
    city_tree = STRtree(city_geoms)
    districts = [(name, g) for lvl, name, oid, g, t in c.admin if lvl == 8 and ncr_prep.intersects(g.centroid)]
    dist_tree = STRtree([g for _, g in districts])
    brgys = [(name, oid, g, t) for lvl, name, oid, g, t in c.admin if lvl == 10 and ncr_prep.contains(g.centroid)]
    brgy_tree = STRtree([g for _, _, g, _ in brgys])
    log(f'districts {len(districts)} barangays {len(brgys)}')

    def city_at(pt):
        for i in city_tree.query(pt, predicate='intersects'):
            return city_names[i]
        # nearest within ~300 m (coast / boundary slivers)
        i = city_tree.nearest(pt)
        if i is not None and city_geoms[i].distance(pt) < 0.003:
            return city_names[i]
        return None

    def brgy_at(pt):
        for i in brgy_tree.query(pt, predicate='intersects'):
            return brgys[i][0]
        return None

    def district_at(pt):
        for i in dist_tree.query(pt, predicate='intersects'):
            return districts[i][0]
        return None

    numbered = re.compile(r'^(barangay|brgy\.?|bgy\.?)?\s*\d+[a-z]?$', re.I)

    def brgy_label(b):
        return b if re.match(r'^(barangay|brgy|bgy)\b', b, re.I) else f'Barangay {b}'

    def subtitle_at(pt, skip_brgy=None):
        city = city_at(pt)
        if not city:
            return None, None
        b = brgy_at(pt)
        d = district_at(pt)
        parts = []
        if b and b != skip_brgy:
            if numbered.match(b) and d:
                parts.append(d)
            else:
                parts.append(brgy_label(b))
        elif d and d != skip_brgy:
            parts.append(d)
        parts.append(city)
        return ', '.join(parts), city

    recs = []  # dict(name, kind, category, subtitle, lon, lat, imp, alts)

    def add(name, kind, category, subtitle, pt, imp, alts=()):
        # curated nicknames are marked with a leading '*' (search.js ranks exact hits on them highly)
        al = list(alts)
        for a in [name] + list(alts):
            for nick in aliases_for(a):
                if nick in al:
                    al.remove(nick)
                if nick != name and '*' + nick not in al:
                    al.append('*' + nick)
        recs.append(dict(name=name, kind=kind, category=category or '', subtitle=subtitle or '',
                         lon=pt.x, lat=pt.y, imp=max(0, min(100, int(imp))), alts=al))

    # ---- cities
    city_label_nodes = {}
    for name, p, g, t in c.places:
        if p == 'city' and name in cities and g.geom_type == 'Point':
            city_label_nodes[name] = g
    for name, (oid, g, t) in cities.items():
        pt = city_label_nodes.get(name) or label_point(g)
        alts = alt_names(t, name)
        if name != 'Quezon City' and not name.endswith('City'):
            alts.append(f'{name} City')
        add(name, 'city', 'city', 'City, Metro Manila' if name != 'Pateros' else 'Municipality, Metro Manila',
            pt, 100 if name in ('Manila', 'Quezon City', 'Makati') else 95, alts)
    # districts (Manila districts, QC districts)
    for name, g in districts:
        pt = label_point(g)
        city = city_at(pt)
        if not city:
            continue
        add(name, 'place', 'district', city, pt, 78)
    # barangays
    for name, oid, g, t in brgys:
        pt = label_point(g)
        city = city_at(pt)
        if not city:
            continue
        d = district_at(pt)
        sub = 'Barangay, ' + (f'{d}, {city}' if d and city == 'Manila' else city)
        disp = name
        imp = 58 if not numbered.match(name) else 40
        add(disp, 'barangay', 'barangay', sub, pt, imp, alt_names(t, name) + [brgy_label(name)])
    log('admin records', len(recs))

    # ---- places (place=* nodes/areas, named residential landuse = subdivisions)
    brgy_names_by_city = defaultdict(set)
    for r in recs:
        if r['kind'] == 'barangay':
            brgy_names_by_city[r['subtitle'].split(', ')[-1]].add(fold(r['name']))
    seen_place = []
    for name, p, g, t in c.places:
        if p in ('city', 'town') and name in cities:
            continue
        if p not in PLACE_IMP:
            continue
        pt = label_point(g)
        if not ncr_prep.contains(pt):
            continue
        sub, city = subtitle_at(pt, skip_brgy=name)
        if not city:
            continue
        # skip place nodes duplicating a barangay of the same name in the same city
        if t.get('admin_level') == '10' or (p in ('quarter', 'village') and fold(name) in brgy_names_by_city[city]):
            continue
        add(name, 'place', p, sub, pt, PLACE_IMP[p] + (15 if 'wikidata' in t else 0), alt_names(t, name))
        seen_place.append((fold(name), pt))
    for name, g, t, m2 in c.landuse_named:
        pt = label_point(g)
        if not ncr_prep.contains(pt):
            continue
        if any(n == fold(name) and dist_m((p.x, p.y), (pt.x, pt.y)) < 800 for n, p in seen_place):
            continue
        sub, city = subtitle_at(pt)
        if not city:
            continue
        imp = 30 + min(20, max(0, math.log10(max(m2, 1)) * 5 - 15))
        add(name, 'place', 'neighbourhood', sub, pt, imp, alt_names(t, name))
    log('with places', len(recs))

    # ---- POIs (dedupe same name+class within 250 m; prefer areas / larger)
    pois = sorted(c.pois, key=lambda x: -x[4])
    kept = defaultdict(list)
    npoi = 0
    for name, (cls, sub_cls, rank, kind), g, t, m2 in pois:
        pt = label_point(g)
        if not ncr_prep.contains(pt):
            continue
        key = (fold(name), cls)
        if any(dist_m((pt.x, pt.y), q) < 250 for q in kept[key]):
            continue
        kept[key].append((pt.x, pt.y))
        sub, city = subtitle_at(pt)
        if not city:
            continue
        imp = 70 - rank * 3
        if m2 > 0:
            imp += min(25, max(0, math.log10(m2) * 6 - 14))
        if 'wikidata' in t or 'wikipedia' in t:
            imp += 12
        if 'brand' in t:
            imp -= 2
        if cls == 'bus' and sub_cls == 'bus_stop':
            imp -= 10
        alts = alt_names(t, name)
        if kind == 'station':
            net = ' '.join(x for x in (t.get('network'), t.get('line'), t.get('operator')) if x)
            label = 'Station'
            m = re.search(r'\b(LRT|MRT|PNR)[- ]?(\d)?', net or '', re.I)
            if m:
                label = f'{m.group(1).upper()}{"-" + m.group(2) if m.group(2) else ""} station'
            elif cls == 'bus':
                label = 'Bus terminal'
            elif cls == 'ferry':
                label = 'Ferry terminal'
            sub = f'{label} · {sub}'
            alts.append('station')
            if m:
                alts.append(m.group(1))
        add(name, kind, cls, sub, pt, imp, alts)
        npoi += 1
    log('pois', npoi)

    # ---- streets: group by (folded name, city), cluster by proximity
    groups = defaultdict(list)
    for i, (name, cls, line, ends, t) in enumerate(c.roads):
        mid = line.interpolate(0.5, normalized=True)
        if not ncr_prep.contains(mid):
            continue
        city = city_at(mid)
        if not city:
            continue
        groups[(fold(name), city)].append(i)
    nstreet = 0
    street_lines = []  # (rec index, LineString) for reverse geocoding
    poi_pts = defaultdict(list)
    for r in recs:
        if r['kind'] in ('poi', 'station'):
            poi_pts[fold(r['name'])].append((r['lon'], r['lat']))
    for (fname, city), idx in groups.items():
        # union-find on proximity (< 120 m) / shared end nodes
        parent = list(range(len(idx)))

        def find(a):
            while parent[a] != a:
                parent[a] = parent[parent[a]]
                a = parent[a]
            return a
        lines = [c.roads[i][2] for i in idx]
        if len(idx) > 1:
            tree = STRtree(lines)
            pairs = tree.query(lines, predicate='dwithin', distance=0.0011)
            for a, b in zip(*pairs):
                if a != b:
                    ra, rb = find(a), find(b)
                    if ra != rb:
                        parent[ra] = rb
        clusters = defaultdict(list)
        for k in range(len(idx)):
            clusters[find(k)].append(idx[k])
        for members in clusters.values():
            geoms = [c.roads[i][2] for i in members]
            ml = MultiLineString(geoms) if len(geoms) > 1 else geoms[0]
            length = sum(dist_len(gm) for gm in geoms)
            cent = ml.centroid
            pt = nearest_points(ml, cent)[0]
            best_cls = max((c.roads[i][1] for i in members), key=lambda k: ROAD_IMP[k])
            if best_cls in ('path', 'steps', 'service', 'track') and any(
                    dist_m((pt.x, pt.y), q) < 600 for q in poi_pts.get(fname, ())):
                continue  # e.g. a footway named after the mall it belongs to
            # display name: most common original spelling
            names = defaultdict(float)
            for i in members:
                names[c.roads[i][0]] += dist_len(c.roads[i][2])
            disp = max(names, key=names.get)
            sub, _ = subtitle_at(pt)
            # long streets crossing barangays: subtitle = city only
            if length > 1500:
                sub = city
            alts = []
            refs = set()
            for i in members:
                t = c.roads[i][4]
                for a in alt_names(t, disp):
                    if a not in alts:
                        alts.append(a)
                if t.get('ref'):
                    refs.update(r.strip() for r in t['ref'].split(';'))
            alts += sorted(refs)
            imp = ROAD_IMP[best_cls] + min(25, max(0, math.log10(max(length, 10)) * 9 - 18))
            add(disp, 'street', best_cls, sub or city, pt, imp, alts)
            ri = len(recs) - 1
            for gm in geoms:
                street_lines.append((ri, gm))
            nstreet += 1
    log('streets', nstreet, 'lines', len(street_lines))

    write(out, recs, street_lines, brgys, cities, districts, city_at, district_at, brgy_label, numbered)


def dist_len(line):
    co = list(line.coords)
    return sum(dist_m(co[i], co[i + 1]) for i in range(len(co) - 1))


def write(out, recs, street_lines, brgys, cities, districts, city_at, district_at, brgy_label, numbered):
    # sort by importance (desc) so record ids are importance-ordered
    order = sorted(range(len(recs)), key=lambda i: (-recs[i]['imp'], recs[i]['name']))
    remap = {old: new for new, old in enumerate(order)}
    recs = [recs[i] for i in order]
    street_lines = [(remap[ri], g) for ri, g in street_lines]
    n = len(recs)
    cats = sorted({r['category'] for r in recs})
    subs = sorted({r['subtitle'] for r in recs})
    sub_idx = {s: i for i, s in enumerate(subs)}
    cat_idx = {s: i for i, s in enumerate(cats)}

    # tokens -> postings
    post = defaultdict(set)
    alts_text = []
    for i, r in enumerate(recs):
        toks = set(tokens(r['name']))
        for a in r['alts']:
            toks.update(tokens(a))
        for tk in list(toks):
            toks.add(canon(tk))
        for tk in toks:
            post[tk].add(i)
        alts_text.append(' | '.join(r['alts']))  # '*' marks curated nicknames
    toklist = sorted(post)
    tok_off = [0]
    postings = []
    for tk in toklist:
        ids = sorted(post[tk])
        postings.extend(ids)
        tok_off.append(len(postings))

    # reverse: street polylines (simplified ~3 m)
    l_rec, l_off, coords = [], [0], []
    for ri, g in street_lines:
        g = g.simplify(0.00003)
        co = list(g.coords)
        if len(co) < 2:
            continue
        l_rec.append(ri)
        for x, y in co:
            coords.append(round(x * 1e6))
            coords.append(round(y * 1e6))
        l_off.append(len(coords) // 2)

    # admin polygons for reverse subtitles (level 0=barangay, 1=district, 2=city)
    polys = []  # (label, level, geom)
    for name, oid, g, t in brgys:
        pt = g.representative_point()
        city = city_at(pt)
        if not city:
            continue
        d = district_at(pt)
        lab = f'{d}, {city}' if (numbered.match(name) and d) else f'{brgy_label(name)}, {city}'
        polys.append((lab, 0, g))
    for name, g in districts:
        city = city_at(g.representative_point())
        if city:
            polys.append((f'{name}, {city}', 1, g))
    for name, (oid, g, t) in cities.items():
        polys.append((name, 2, g))
    p_label, p_level, p_bbox, p_ring_off, ring_off, pcoords = [], [], [], [0], [0], []
    for lab, lvl, g in polys:
        g = g.simplify(0.00004)
        if g.is_empty:
            continue
        rings = []
        for poly in (g.geoms if hasattr(g, 'geoms') else [g]):
            if poly.geom_type != 'Polygon':
                continue
            rings.append(poly.exterior)
            rings.extend(poly.interiors)
        if not rings:
            continue
        p_label.append(lab)
        p_level.append(lvl)
        b = g.bounds
        p_bbox.extend(round(v * 1e6) for v in b)
        for ring in rings:
            for x, y in ring.coords:
                pcoords.append(round(x * 1e6))
                pcoords.append(round(y * 1e6))
            ring_off.append(len(pcoords) // 2)
        p_ring_off.append(len(ring_off) - 1)

    sections = []

    def sec(name, arr):
        sections.append((name, arr))

    sec('names', '\n'.join(r['name'] for r in recs).encode())
    sec('alts', '\n'.join(alts_text).encode())
    sec('subs', '\n'.join(subs).encode())
    sec('cats', '\n'.join(cats).encode())
    sec('kind', np.array([KINDS.index(r['kind']) for r in recs], dtype=np.uint8))
    sec('cat', np.array([cat_idx[r['category']] for r in recs], dtype=np.uint8 if len(cats) < 256 else np.uint16))
    sec('sub', np.array([sub_idx[r['subtitle']] for r in recs], dtype=np.uint32))
    sec('lon', np.array([round(r['lon'] * 1e6) for r in recs], dtype=np.int32))
    sec('lat', np.array([round(r['lat'] * 1e6) for r in recs], dtype=np.int32))
    sec('imp', np.array([r['imp'] for r in recs], dtype=np.uint8))
    sec('tokens', '\n'.join(toklist).encode())
    sec('tokOff', np.array(tok_off, dtype=np.uint32))
    sec('postings', np.array(postings, dtype=np.uint32))
    sec('lineRec', np.array(l_rec, dtype=np.uint32))
    sec('lineOff', np.array(l_off, dtype=np.uint32))
    sec('lineXY', np.array(coords, dtype=np.int32))
    sec('polyLabel', '\n'.join(p_label).encode())
    sec('polyLevel', np.array(p_level, dtype=np.uint8))
    sec('polyBBox', np.array(p_bbox, dtype=np.int32))
    sec('polyRingOff', np.array(p_ring_off, dtype=np.uint32))
    sec('ringOff', np.array(ring_off, dtype=np.uint32))
    sec('polyXY', np.array(pcoords, dtype=np.int32))

    body = bytearray()
    meta = {}
    for name, arr in sections:
        while len(body) % 8:
            body.append(0)
        if isinstance(arr, (bytes, bytearray)):
            meta[name] = {'offset': len(body), 'length': len(arr), 'type': 'utf8'}
            body += arr
        else:
            meta[name] = {'offset': len(body), 'length': int(arr.size), 'type': str(arr.dtype)}
            body += arr.astype(arr.dtype.newbyteorder('<')).tobytes()
    header = json.dumps({'version': 1, 'count': n, 'kinds': KINDS, 'canon': CANON, 'sections': meta}).encode()
    hdr = b'MMSEARCH' + struct.pack('<I', len(header)) + header
    while len(hdr) % 8:
        hdr += b' '
    # header length field must cover the padding
    hdr = b'MMSEARCH' + struct.pack('<I', len(hdr) - 12) + hdr[12:]
    raw = hdr + bytes(body)
    data = gzip.compress(raw, compresslevel=9, mtime=0)
    with open(out, 'wb') as f:
        f.write(data)
    kc = defaultdict(int)
    for r in recs:
        kc[r['kind']] += 1
    log(f'search.bin: {n} records {dict(kc)}, {len(toklist)} tokens, {len(postings)} postings, '
        f'{len(l_rec)} lines, {len(p_label)} polys; raw {len(raw):,} gz {len(data):,}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
