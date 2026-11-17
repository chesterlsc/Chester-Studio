#!/usr/bin/env python3
"""Build route.bin (format read by src/engine/router.js).

usage: build_route.py <input.osm.pbf> <out route.bin>

Compact node-based graph: graph nodes only at intersections / way ends /
restriction via-nodes; each edge keeps its intermediate geometry. Per-edge
class + flags (per-mode access and direction), speeds are applied in JS.
"""
import gzip
import json
import math
import struct
import sys
import time
from collections import defaultdict

import numpy as np
import osmium

t0 = time.time()


def log(*a):
    print(f'[{time.time() - t0:6.1f}s]', *a, file=sys.stderr)


# Order matters: index stored per edge; router.js has the matching speed tables.
CLASSES = ['motorway', 'motorway_link', 'trunk', 'trunk_link', 'primary', 'primary_link', 'secondary',
           'secondary_link', 'tertiary', 'tertiary_link', 'unclassified', 'residential', 'living_street',
           'service', 'road', 'track', 'pedestrian', 'footway', 'path', 'cycleway', 'steps', 'corridor',
           'platform', 'busway']
CI = {c: i for i, c in enumerate(CLASSES)}

CAR_OK = {'motorway', 'motorway_link', 'trunk', 'trunk_link', 'primary', 'primary_link', 'secondary',
          'secondary_link', 'tertiary', 'tertiary_link', 'unclassified', 'residential', 'living_street',
          'service', 'road', 'track'}
FOOT_OK = CAR_OK - {'motorway', 'motorway_link'} | {'pedestrian', 'footway', 'path', 'cycleway', 'steps',
                                                       'corridor', 'platform'}

# flags (uint16)
F_CAR_F, F_CAR_B, F_MOTO_F, F_MOTO_B, F_WALK = 1, 2, 4, 8, 16
F_ROUNDABOUT, F_LINK, F_TOLL, F_PRIVATE = 32, 64, 128, 256
F_BRIDGE, F_TUNNEL = 512, 1024
F_SNAP_CAR, F_SNAP_MOTO, F_SNAP_WALK = 2048, 4096, 8192
F_MINOR_SERVICE, F_UNPAVED = 16384, 32768

YES = {'yes', 'designated', 'permissive', 'official', 'true', '1'}
NO = {'no', 'false', '0', 'use_sidepath', 'discouraged'}
RESTRICTED = {'private', 'destination', 'customers', 'delivery', 'agricultural', 'forestry', 'permit',
              'residents', 'military', 'emergency'}


def access(tags, keys, base):
    """Return (allowed, restricted) after applying the access tag hierarchy."""
    allowed, restricted = base, False
    for k in keys:
        v = tags.get(k)
        if v is None:
            continue
        v = v.split(';')[0].strip()
        if v in YES:
            allowed, restricted = True, False
        elif v in NO:
            allowed, restricted = False, False
        elif v in RESTRICTED:
            allowed, restricted = True, True
    return allowed, restricted


def way_attrs(t):
    hw = t.get('highway')
    if hw not in CI:
        return None
    if t.get('area') == 'yes':
        return None
    car_base = hw in CAR_OK
    foot_base = hw in FOOT_OK
    car, car_r = access(t, ('access', 'vehicle', 'motor_vehicle', 'motorcar'), car_base)
    moto_base = car_base and hw not in ('motorway', 'motorway_link') and t.get('motorroad') != 'yes'
    moto, moto_r = access(t, ('access', 'vehicle', 'motor_vehicle'), moto_base)
    # motorcycle=* overrides; motorcycle=yes re-allows expressways
    mv = t.get('motorcycle')
    if mv:
        mv = mv.split(';')[0].strip()
        if mv in YES:
            moto, moto_r = True, False
        elif mv in NO:
            moto = False
        elif mv in RESTRICTED:
            moto, moto_r = True, True
    if hw in ('motorway', 'motorway_link') and not (mv and mv in YES):
        moto = False
    foot, foot_r = access(t, ('access', 'foot'), foot_base)
    if t.get('access') in NO and t.get('foot') is None and hw in ('footway', 'pedestrian', 'steps', 'path'):
        foot = False
    if t.get('impassable') == 'yes' or t.get('disused') == 'yes':
        car = moto = foot = False
    if not (car or moto or foot):
        return None
    # oneway
    ow = (t.get('oneway') or '').strip()
    d = 0
    if ow in ('yes', '1', 'true'):
        d = 1
    elif ow in ('-1', 'reverse'):
        d = -1
    elif ow == 'no':
        d = 0
    elif t.get('junction') in ('roundabout', 'circular') or hw in ('motorway', 'motorway_link'):
        d = 1
    if ow == 'reversible':  # direction changes by time of day
        car = moto = False
    fl = 0
    if car:
        fl |= (F_CAR_F if d >= 0 else 0) | (F_CAR_B if d <= 0 else 0)
    if moto:
        dm = d
        om = (t.get('oneway:motorcycle') or '').strip()
        if om == 'no':
            dm = 0
        fl |= (F_MOTO_F if dm >= 0 else 0) | (F_MOTO_B if dm <= 0 else 0)
    if foot:
        fl |= F_WALK
    if t.get('junction') in ('roundabout', 'circular'):
        fl |= F_ROUNDABOUT
    if hw.endswith('_link'):
        fl |= F_LINK
    if t.get('toll') == 'yes':
        fl |= F_TOLL
    if (car and car_r) or (moto and moto_r) or (foot and foot_r and not car):
        fl |= F_PRIVATE
    if t.get('bridge') and t.get('bridge') != 'no':
        fl |= F_BRIDGE
    if t.get('tunnel') and t.get('tunnel') != 'no':
        fl |= F_TUNNEL
    if hw == 'service' and t.get('service') in ('parking_aisle', 'driveway', 'drive-through', 'emergency_access'):
        fl |= F_MINOR_SERVICE
    if t.get('surface') in ('unpaved', 'dirt', 'ground', 'gravel', 'mud', 'sand', 'grass'):
        fl |= F_UNPAVED
    return CI[hw], fl


def hav(lon1, lat1, lon2, lat2):
    r = 6371008.8
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def main(src, out):
    ways = []       # (way id, refs, coords, cls, flags, name, ref)
    restr = []      # (type 'no'/'only', from way, via node, to way, modes)
    fp = osmium.FileProcessor(src).with_locations()
    for o in fp:
        if o.is_way():
            t = o.tags
            if 'highway' not in t:
                continue
            a = way_attrs(t)
            if a is None:
                continue
            try:
                coords = [(n.lon, n.lat) for n in o.nodes]
            except osmium.InvalidLocationError:
                continue
            refs = [n.ref for n in o.nodes]
            if len(refs) < 2:
                continue
            name = (t.get('name') or t.get('name:en') or '').strip()
            ref = (t.get('ref') or '').strip()
            ways.append((o.id, refs, coords, a[0], a[1], name, ref))
        elif o.is_relation():
            t = o.tags
            if t.get('type') != 'restriction':
                continue
            r = t.get('restriction') or t.get('restriction:motorcar') or t.get('restriction:motor_vehicle')
            if not r:
                continue
            exc = t.get('except', '')
            if 'motorcar' in exc or 'motor_vehicle' in exc:
                continue
            kind = 'no' if r.startswith('no_') else 'only' if r.startswith('only_') else None
            if not kind:
                continue
            fr = [m.ref for m in o.members if m.type == 'w' and m.role == 'from']
            to = [m.ref for m in o.members if m.type == 'w' and m.role == 'to']
            via = [m.ref for m in o.members if m.type == 'n' and m.role == 'via']
            if len(fr) == 1 and len(to) == 1 and len(via) == 1:
                restr.append((kind, fr[0], via[0], to[0], r))
    log(f'routable ways {len(ways)}, restrictions {len(restr)}')

    # graph nodes: way ends, shared nodes, restriction vias
    use = defaultdict(int)
    for w in ways:
        for r in w[1]:
            use[r] += 1
    is_gnode = set()
    for w in ways:
        is_gnode.add(w[1][0])
        is_gnode.add(w[1][-1])
    for r, c in use.items():
        if c >= 2:
            is_gnode.add(r)
    for _, _, via, _, _ in restr:
        if via in use:
            is_gnode.add(via)
    gid = {}
    nlon, nlat = [], []

    def node_index(ref, lon, lat):
        i = gid.get(ref)
        if i is None:
            i = gid[ref] = len(nlon)
            nlon.append(lon)
            nlat.append(lat)
        return i

    labels = {'': 0}
    label_list = ['']
    e_from, e_to, e_len, e_cls, e_flags, e_label, g_off, g_xy = [], [], [], [], [], [], [0], []
    way_edges = defaultdict(list)  # way id -> [(edge, from node, to node)]
    for wid, refs, coords, cls, fl, name, ref in ways:
        lab = name + '\t' + ref if (name or ref) else ''
        li = labels.get(lab)
        if li is None:
            li = labels[lab] = len(label_list)
            label_list.append(lab)
        start = 0
        for k in range(1, len(refs)):
            if refs[k] in is_gnode or k == len(refs) - 1:
                if refs[k] == refs[start] and k - start <= 1:
                    start = k
                    continue
                a = node_index(refs[start], *coords[start])
                b = node_index(refs[k], *coords[k])
                length = sum(hav(*coords[j], *coords[j + 1]) for j in range(start, k))
                if length <= 0.01 and a == b:
                    start = k
                    continue
                e = len(e_from)
                e_from.append(a)
                e_to.append(b)
                e_len.append(max(0.1, length))
                e_cls.append(cls)
                e_flags.append(fl)
                e_label.append(li)
                for j in range(start + 1, k):
                    g_xy.append(round(coords[j][0] * 1e6))
                    g_xy.append(round(coords[j][1] * 1e6))
                g_off.append(len(g_xy) // 2)
                way_edges[wid].append((e, a, b))
                start = k
    N, E = len(nlon), len(e_from)
    log(f'graph: {N} nodes, {E} edges, {len(g_xy) // 2} shape points, {len(label_list)} labels')

    e_from = np.array(e_from, dtype=np.uint32)
    e_to = np.array(e_to, dtype=np.uint32)
    e_flags = np.array(e_flags, dtype=np.uint32)

    # connected components per mode (undirected); only big components are snappable
    def components(mask):
        parent = np.arange(N, dtype=np.int64)

        def find(x):
            root = x
            while parent[root] != root:
                root = parent[root]
            while parent[x] != root:
                parent[x], x = root, parent[x]
            return root
        idx = np.nonzero(e_flags & mask)[0]
        for e in idx:
            ra, rb = find(int(e_from[e])), find(int(e_to[e]))
            if ra != rb:
                parent[ra] = rb
        roots = np.array([find(i) for i in range(N)])
        sizes = np.bincount(roots, minlength=N)
        return roots, sizes

    for mask, snap in ((F_CAR_F | F_CAR_B, F_SNAP_CAR), (F_MOTO_F | F_MOTO_B, F_SNAP_MOTO), (F_WALK, F_SNAP_WALK)):
        roots, sizes = components(mask)
        ok = (sizes[roots[e_from]] >= 300) & ((e_flags & mask) != 0)
        e_flags[ok] |= snap
        log(f'  mode mask {mask}: snappable edges {int(ok.sum())} of {int(((e_flags & mask) != 0).sum())}')

    # adjacency (undirected; direction checked with flags at query time)
    deg = np.bincount(np.concatenate([e_from, e_to]), minlength=N)
    adj_off = np.zeros(N + 1, dtype=np.uint32)
    adj_off[1:] = np.cumsum(deg)
    fill = adj_off[:-1].copy()
    adj = np.zeros(2 * E, dtype=np.uint32)
    for e in range(E):
        a, b = int(e_from[e]), int(e_to[e])
        adj[fill[a]] = e
        fill[a] += 1
        adj[fill[b]] = e
        fill[b] += 1

    # restrictions -> (via node, from edge, to edge, type)
    r_via, r_from, r_to, r_type = [], [], [], []
    for kind, fw, via, tw, r in restr:
        v = gid.get(via)
        if v is None:
            continue
        fe = [e for e, a, b in way_edges.get(fw, ()) if a == v or b == v]
        te = [e for e, a, b in way_edges.get(tw, ()) if a == v or b == v]
        if not fe or not te:
            continue
        for f in fe:
            for t_ in te:
                if kind == 'no' and f == t_ and 'u_turn' not in r:
                    continue
                r_via.append(v)
                r_from.append(f)
                r_to.append(t_)
                r_type.append(0 if kind == 'no' else 1)
    log(f'restrictions mapped: {len(r_via)}')

    sections = [
        ('nodeLon', np.array([round(x * 1e6) for x in nlon], dtype=np.int32)),
        ('nodeLat', np.array([round(y * 1e6) for y in nlat], dtype=np.int32)),
        ('adjOff', adj_off),
        ('adj', adj),
        ('edgeFrom', e_from),
        ('edgeTo', e_to),
        ('edgeLen', np.array(e_len, dtype=np.float32)),
        ('edgeClass', np.array(e_cls, dtype=np.uint8)),
        ('edgeFlags', e_flags.astype(np.uint16)),
        ('edgeLabel', np.array(e_label, dtype=np.uint32)),
        ('geomOff', np.array(g_off, dtype=np.uint32)),
        ('geomXY', np.array(g_xy, dtype=np.int32)),
        ('resVia', np.array(r_via, dtype=np.uint32)),
        ('resFrom', np.array(r_from, dtype=np.uint32)),
        ('resTo', np.array(r_to, dtype=np.uint32)),
        ('resType', np.array(r_type, dtype=np.uint8)),
        ('labels', '\n'.join(label_list).encode()),
    ]
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
    header = {'version': 1, 'nodes': N, 'edges': E, 'classes': CLASSES, 'sections': meta}
    hj = json.dumps(header).encode()
    pad = (-(12 + len(hj))) % 8
    hj += b' ' * pad
    raw = b'MMROUTE1' + struct.pack('<I', len(hj)) + hj + bytes(body)
    data = gzip.compress(raw, compresslevel=6, mtime=0)
    with open(out, 'wb') as f:
        f.write(data)
    log(f'route.bin raw {len(raw):,} gz {len(data):,}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
