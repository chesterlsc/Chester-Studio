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
from common import (CANON, aliases_for, alt_names, canon, display_name, fold, poi_for,  # noqa: E402
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
        self.rel6 = {}       # admin_level=6 relation tags by id (for cities that fail to assemble)

    def relation(self, r):
        t = r.tags
        if t.get('boundary') == 'administrative' and t.get('admin_level') == '6':
            self.rel6[r.id] = dict(t)

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
        want_admin = ba and lvl in ('3', '4', '6', '8', '10') and not a.from_way()
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
    keys = ('highway', 'place', 'amenity', 'shop', 'tourism', 'leisure', 'aeroway', 'railway',
            'public_transport', 'office', 'historic', 'landuse', 'boundary')
    fp = (osmium.FileProcessor(src)
          .with_locations()
          .with_areas(osmium.filter.KeyFilter(*keys))
          .with_filter(osmium.filter.KeyFilter(*keys)))
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

    # ---- admin hierarchy: regions (3), provinces (4), cities/municipalities (6),
    # districts (8, e.g. Manila's), barangays (10)
    regions = [(name, g) for lvl, name, oid, g, t in c.admin if lvl == 3]
    if regions:
        cover = unary_union([g for _, g in regions]).buffer(0)
    else:
        cover = unary_union([g for lvl, _, _, g, _ in c.admin if lvl in (4, 6)]).buffer(0)
    cover_prep = shapely.prepared.prep(cover.buffer(0.002))
    region_tree = STRtree([g for _, g in regions]) if regions else None
    provinces = [(name, g) for lvl, name, oid, g, t in c.admin if lvl == 4 and cover_prep.contains(g.representative_point())]
    prov_tree = STRtree([g for _, g in provinces])

    cities = {}  # relation id -> dict
    for lvl, name, oid, g, t in c.admin:
        if lvl == 6 and cover_prep.contains(g.representative_point()):
            cities[oid] = dict(name=name, geom=g, tags=t)
    # Cities whose boundary relation is incomplete in the extract (e.g. Taguig): union of
    # their barangays, matched by PSGC code prefix (first 7 digits of `ref`).
    brgy_by_prefix = defaultdict(list)
    for lvl, _, _, g, bt in c.admin:
        if lvl == 10 and len(bt.get('ref', '')) == 10:
            brgy_by_prefix[bt['ref'][:7]].append(g)
    for rid, t in c.rel6.items():
        ref = t.get('ref', '')
        if rid in cities or len(ref) != 10 or not brgy_by_prefix.get(ref[:7]):
            continue
        g = unary_union(brgy_by_prefix[ref[:7]]).buffer(0.0003).buffer(-0.0003)
        if cover_prep.contains(g.representative_point()):
            cities[rid] = dict(name=display_name(t) or t.get('name'), geom=g, tags=t)
            log(f'  {cities[rid]["name"]}: built from {len(brgy_by_prefix[ref[:7]])} barangays')
    city_ids = list(cities)
    city_geoms = [cities[i]['geom'] for i in city_ids]
    city_tree = STRtree(city_geoms)

    def region_of(pt):
        if region_tree is None:
            return None
        for i in region_tree.query(pt, predicate='intersects'):
            return regions[i][0]
        return None

    def province_of(pt, near=0.0):
        for i in prov_tree.query(pt, predicate='intersects'):
            return provinces[i][0]
        if near and provinces:
            # independent cities (e.g. Angeles) are not part of their province's polygon
            i = prov_tree.nearest(pt)
            if i is not None and provinces[i][1].distance(pt) < near:
                return provinces[i][0]
        return None

    for rid, ci in cities.items():
        pt = ci['geom'].representative_point()
        reg = region_of(pt)
        prov = province_of(pt, near=0 if reg == 'Metro Manila' else 0.08)
        if not prov and reg and reg != 'Metro Manila':
            prov = reg
        ci['province'] = prov
        ci['ncr'] = reg == 'Metro Manila'
        ci['label'] = f'{ci["name"]}, {prov}' if prov else ci['name']
    log(f'regions {len(regions)} provinces {len(provinces)} cities/municipalities {len(cities)}')

    districts = [(name, g) for lvl, name, oid, g, t in c.admin if lvl == 8 and cover_prep.contains(g.representative_point())]
    dist_tree = STRtree([g for _, g in districts])
    brgys = [(name, oid, g, t) for lvl, name, oid, g, t in c.admin if lvl == 10 and cover_prep.contains(g.representative_point())]
    brgy_tree = STRtree([g for _, _, g, _ in brgys])
    log(f'districts {len(districts)} barangay polygons {len(brgys)}')

    def city_at(pt):
        """Relation id of the city/municipality at pt (or None)."""
        for i in city_tree.query(pt, predicate='intersects'):
            return city_ids[i]
        # nearest within ~300 m (coast / boundary slivers)
        i = city_tree.nearest(pt)
        if i is not None and city_geoms[i].distance(pt) < 0.003:
            return city_ids[i]
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
        """("Barangay X, City, Province", city id) for a point."""
        cid = city_at(pt)
        if not cid:
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
        parts.append(cities[cid]['label'])
        return ', '.join(parts), cid

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

    # ---- regions, provinces, cities/municipalities
    for name, g in regions:
        add(name, 'place', 'region', 'Region', label_point(g), 90)
    for name, g in provinces:
        reg = region_of(g.representative_point())
        add(name, 'place', 'province', f'Province, {reg}' if reg else 'Province', label_point(g), 93,
            [f'{name} Province'])
    city_label_nodes = {}
    for name, p, g, t in c.places:
        if p in ('city', 'town', 'municipality') and g.geom_type == 'Point':
            cid = city_at(g)
            if cid and fold(cities[cid]['name']).endswith(fold(name)) or (cid and fold(name).endswith(fold(cities[cid]['name']))):
                city_label_nodes[cid] = g
    big = {'Manila', 'Quezon City', 'Makati'}
    for cid, ci in cities.items():
        name, t = ci['name'], ci['tags']
        pt = city_label_nodes.get(cid) or label_point(ci['geom'])
        alts = alt_names(t, name)
        bt = t.get('border_type', '')
        is_city = 'city' in bt or (not bt and (name.endswith('City') or (t.get('official_name') or '').startswith('City of')
                                               or name.startswith('City of')))
        if is_city and not name.endswith('City') and not name.startswith('City of'):
            alts.append(f'{name} City')
        kind_label = 'City' if is_city else 'Municipality'
        where = 'Metro Manila' if ci['ncr'] else (ci['province'] or '')
        imp = 100 if name in big and ci['ncr'] else 95 if ci['ncr'] or 'highly' in bt else 90 if is_city else 84
        add(name, 'city', 'city', f'{kind_label}, {where}' if where else kind_label, pt, imp, alts)
    # districts (Manila districts, QC districts)
    for name, g in districts:
        pt = label_point(g)
        cid = city_at(pt)
        if not cid:
            continue
        add(name, 'place', 'district', cities[cid]['label'], pt, 78)
    # barangays (polygons)
    brgy_seen = set()
    for name, oid, g, t in brgys:
        pt = label_point(g)
        cid = city_at(pt)
        if not cid:
            continue
        d = district_at(pt)
        where = f'{d}, {cities[cid]["label"]}' if d and cities[cid]['name'] == 'Manila' else cities[cid]['label']
        imp = 58 if not numbered.match(name) else 40
        add(name, 'barangay', 'barangay', f'Barangay, {where}', pt, imp, alt_names(t, name) + [brgy_label(name)])
        brgy_seen.add((fold(name), cid))
    log('admin records', len(recs))

    # ---- places (place=* nodes/areas, named residential landuse = subdivisions).
    # Barangays that are only mapped as a node (admin_level=10 or place=village, the usual
    # PH tagging) become barangay records too.
    seen_place = []
    for name, p, g, t in c.places:
        if p not in PLACE_IMP:
            continue
        pt = label_point(g)
        if not cover_prep.contains(pt):
            continue
        sub, cid = subtitle_at(pt, skip_brgy=name)
        if not cid:
            continue
        if p in ('city', 'town', 'municipality') and cid in city_label_nodes and city_label_nodes[cid] is g:
            continue
        is_brgy = t.get('admin_level') == '10' or p == 'village' or t.get('designation') == 'barangay'
        if is_brgy:
            if (fold(name), cid) in brgy_seen:
                continue
            brgy_seen.add((fold(name), cid))
            imp = 55 if not numbered.match(name) else 40
            add(name, 'barangay', 'barangay', f'Barangay, {cities[cid]["label"]}', pt, imp,
                alt_names(t, name) + [brgy_label(name)])
            continue
        if p in ('quarter',) and (fold(name), cid) in brgy_seen:
            continue
        add(name, 'place', p, sub, pt, PLACE_IMP[p] + (15 if 'wikidata' in t else 0), alt_names(t, name))
        seen_place.append((fold(name), pt))
    seen_by_name = defaultdict(list)
    for n_, p_ in seen_place:
        seen_by_name[n_].append(p_)
    for name, g, t, m2 in c.landuse_named:
        pt = label_point(g)
        if not cover_prep.contains(pt):
            continue
        if any(dist_m((p.x, p.y), (pt.x, pt.y)) < 800 for p in seen_by_name.get(fold(name), ())):
            continue
        sub, cid = subtitle_at(pt)
        if not cid:
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
        if not cover_prep.contains(pt):
            continue
        key = (fold(name), cls)
        if any(dist_m((pt.x, pt.y), q) < 250 for q in kept[key]):
            continue
        kept[key].append((pt.x, pt.y))
        sub, cid = subtitle_at(pt)
        if not cid:
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
        if not cover_prep.contains(mid):
            continue
        cid = city_at(mid)
        if not cid:
            continue
        groups[(fold(name), cid)].append(i)
    nstreet = 0
    street_lines = []  # (rec index, LineString) for reverse geocoding
    poi_pts = defaultdict(list)
    for r in recs:
        if r['kind'] in ('poi', 'station'):
            poi_pts[fold(r['name'])].append((r['lon'], r['lat']))
    for (fname, cid), idx in groups.items():
        city = cities[cid]['label']
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
        cid = city_at(pt)
        if not cid:
            continue
        city = cities[cid]['label']
        d = district_at(pt)
        lab = f'{d}, {city}' if (numbered.match(name) and d) else f'{brgy_label(name)}, {city}'
        polys.append((lab, 0, g))
    for name, g in districts:
        cid = city_at(g.representative_point())
        if cid:
            polys.append((f'{name}, {cities[cid]["label"]}', 1, g))
    for ci in cities.values():
        polys.append((ci['label'], 2, ci['geom']))
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
