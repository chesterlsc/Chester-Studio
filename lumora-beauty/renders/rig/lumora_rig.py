"""
lumora_rig.py - a parametric Blender (Cycles) rig for premium cosmetics packshots and still lifes.

Use it from Blender's Python (the ``bpy`` module), normally through ``render_job.py``::

    <venv>/bin/python render_job.py examples/b_dropper_packshot.json

or as a library::

    import lumora_rig as rig
    rig.reset()
    p = rig.make_dropper(d=32, h=72, materials={"body": "glass_frosted"})
    rig.add_label(p, "label.png", mode="ink", ink="#2E2925")
    ...

Conventions
-----------
* Scene units are real-world metres (1 Blender unit = 1 m). Every *public* length argument is in
  millimetres; angles are degrees; colours are sRGB hex strings ("#E9DFD3").
* Every product is built in its own local space, sits on z = 0 and faces -Y (towards the default
  camera). Its root is an Empty; move/rotate the root to place it.
* Materials are described by *specs*: a preset name ("glass_frosted") or a dict that starts from a
  preset and overrides parameters ({"preset": "glass_tinted", "color": "#E7BFB2"}). See PRESETS.
* Geometry is built from 2D (r, z) control polygons with per-corner fillet radii that are sampled
  finely and revolved, so every edge is rounded and catches light (no faceting at 2048 px).
  Glass has real wall thickness; liquids are separate inner meshes that overlap the glass by 0.08 mm.
"""
from __future__ import annotations

import json
import math
import os
import time

import bpy
import numpy as np
from mathutils import Matrix, Vector

MM = 0.001
OVERLAP = 0.08 * MM          # liquid/glass overlap so refraction has no air gap
VERSION = "1.0"


def _log(*a):
    print("[lumora_rig]", *a, flush=True)


# =============================================================================================
# colour helpers
# =============================================================================================

def _srgb2lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgb(h, linear=True):
    """'#RRGGBB' (or 'RGB') -> (r, g, b) floats, linear by default. Lists pass through unchanged."""
    if isinstance(h, (list, tuple)):
        return tuple(float(x) for x in h[:3])
    s = str(h).strip().lstrip("#")
    if len(s) == 3:
        s = "".join(ch * 2 for ch in s)
    r, g, b = (int(s[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
    return tuple(_srgb2lin(c) for c in (r, g, b)) if linear else (r, g, b)


def rgba(h, a=1.0):
    return (*hex_rgb(h), a)


def _kelvin_srgb(k):
    t = max(10.0, min(400.0, k / 100.0))
    r = 255.0 if t <= 66 else 329.698727446 * ((t - 60) ** -0.1332047592)
    g = (99.4708025861 * math.log(t) - 161.1195681661) if t <= 66 else 288.1221695283 * ((t - 60) ** -0.0755148492)
    b = 255.0 if t >= 66 else (0.0 if t <= 19 else 138.5177312231 * math.log(t - 10) - 305.0447927307)
    return [min(max(x, 0.0), 255.0) / 255.0 for x in (r, g, b)]


def kelvin_rgb(k, white=5600.0):
    """Linear RGB of a black-body light at ``k`` kelvin, white-balanced so ``white`` K is neutral."""
    c = [_srgb2lin(x) for x in _kelvin_srgb(k)]
    w = [_srgb2lin(x) for x in _kelvin_srgb(white)]
    c = [a / max(b, 1e-6) for a, b in zip(c, w)]
    m = max(c)
    return tuple(x / m for x in c)


# =============================================================================================
# scene helpers
# =============================================================================================

_MAT_CACHE = {}
_COLLS = {}


def reset():
    """Empty the file, set metric units and clear rig caches."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _MAT_CACHE.clear()
    _COLLS.clear()
    sc = bpy.context.scene
    sc.unit_settings.system = "METRIC"
    sc.unit_settings.scale_length = 1.0
    sc.unit_settings.length_unit = "MILLIMETERS"
    return sc


def collection(name):
    c = _COLLS.get(name)
    if c is None or c.name not in bpy.data.collections:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
        _COLLS[name] = c
    return c


def _smoothstep(e0, e1, x):
    if e1 == e0:
        return 1.0 if x >= e1 else 0.0
    t = min(max((x - e0) / (e1 - e0), 0.0), 1.0)
    return t * t * (3 - 2 * t)


def _set_visibility(ob, camera=True, diffuse=True, glossy=True, transmission=True, shadow=True, volume=True):
    ob.visible_camera = camera
    ob.visible_diffuse = diffuse
    ob.visible_glossy = glossy
    ob.visible_transmission = transmission
    ob.visible_shadow = shadow
    ob.visible_volume_scatter = volume


# =============================================================================================
# 2D profile geometry
# =============================================================================================

def _unit(v):
    n = math.hypot(v[0], v[1])
    return (v[0] / n, v[1] / n) if n > 1e-15 else (0.0, 0.0)


def fillet(points, radii=None, closed=False, step_deg=4.0, tags=None):
    """Round the corners of a 2D polyline.

    points: [(x, y)] (metres); radii: per-vertex fillet radius (0 = sharp; endpoints of an open
    polyline are never rounded); tags: per-vertex tag carried to every output point produced from that
    vertex (the segment that *starts* at a vertex inherits its tag when revolved).
    Fillets are clamped so neighbouring arcs never overlap. Returns (points, tags).
    """
    n = len(points)
    P = [(float(x), float(y)) for x, y in points]
    R = [float(r) for r in (radii if radii is not None else [0.0] * n)]
    T = list(tags) if tags is not None else [None] * n
    tl = [0.0] * n
    geo = [None] * n
    for i in (range(n) if closed else range(1, n - 1)):
        r = R[i]
        if r <= 0:
            continue
        a, b, c = P[i - 1], P[i], P[(i + 1) % n]
        u = (a[0] - b[0], a[1] - b[1])
        v = (c[0] - b[0], c[1] - b[1])
        lu, lv = math.hypot(*u), math.hypot(*v)
        if lu < 1e-12 or lv < 1e-12:
            continue
        u, v = (u[0] / lu, u[1] / lu), (v[0] / lv, v[1] / lv)
        theta = math.acos(max(-1.0, min(1.0, u[0] * v[0] + u[1] * v[1])))
        if theta < 1e-3 or theta > math.pi - 1e-3:
            continue
        tl[i] = r / math.tan(theta / 2)
        geo[i] = (u, v, theta)
    scale = [1.0] * n
    for i in (range(n) if closed else range(n - 1)):
        j = (i + 1) % n
        L = math.hypot(P[j][0] - P[i][0], P[j][1] - P[i][1])
        s = tl[i] + tl[j]
        if s > 0.998 * L and s > 0:
            f = 0.998 * L / s
            scale[i] = min(scale[i], f)
            scale[j] = min(scale[j], f)
    out, otags = [], []

    def emit(p, t):
        if out and math.hypot(p[0] - out[-1][0], p[1] - out[-1][1]) < 1e-7:
            return
        out.append((float(p[0]), float(p[1])))
        otags.append(t)

    for i in range(n):
        if geo[i] is None:
            emit(P[i], T[i])
            continue
        u, v, theta = geo[i]
        t = tl[i] * scale[i]
        r = t * math.tan(theta / 2)
        b = P[i]
        t1 = (b[0] + u[0] * t, b[1] + u[1] * t)
        t2 = (b[0] + v[0] * t, b[1] + v[1] * t)
        w = _unit((u[0] + v[0], u[1] + v[1]))
        h = r / math.sin(theta / 2)
        cx, cy = b[0] + w[0] * h, b[1] + w[1] * h
        a1 = math.atan2(t1[1] - cy, t1[0] - cx)
        a2 = math.atan2(t2[1] - cy, t2[0] - cx)
        d = (a2 - a1 + math.pi) % (2 * math.pi) - math.pi
        steps = max(2, int(math.ceil(abs(d) / math.radians(step_deg))))
        for k in range(steps + 1):
            ang = a1 + d * k / steps
            emit((cx + r * math.cos(ang), cy + r * math.sin(ang)), T[i])
    if closed and len(out) > 2 and math.hypot(out[0][0] - out[-1][0], out[0][1] - out[-1][1]) < 1e-7:
        out.pop()
        otags.pop()
    return out, otags


def _isect(l1, l2):
    (p, d), (q, e) = l1, l2
    den = d[0] * e[1] - d[1] * e[0]
    if abs(den) < 1e-12:
        return None
    t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / den
    return (p[0] + d[0] * t, p[1] + d[1] * t)


def offset_left(points, dists):
    """Offset an open (r, z) control polyline to its left (the material side) by a per-segment
    distance. A first point on the axis stays on the axis; the last point stays on its z plane."""
    P = [(float(x), float(y)) for x, y in points]
    n = len(P)
    lines = []
    for i in range(n - 1):
        e = _unit((P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]))
        nl = (-e[1], e[0])
        d = dists[i]
        lines.append(((P[i][0] + nl[0] * d, P[i][1] + nl[1] * d), e))
    Q = []
    p0, e0 = lines[0]
    if abs(P[0][0]) < 1e-9 and abs(e0[0]) > 1e-9:
        t = -p0[0] / e0[0]
        Q.append((0.0, p0[1] + e0[1] * t))
    else:
        Q.append(p0)
    for i in range(1, n - 1):
        q = _isect(lines[i - 1], lines[i])
        Q.append(q if q is not None else lines[i][0])
    pl, el = lines[-1]
    if abs(el[1]) > 1e-9:
        t = (P[-1][1] - pl[1]) / el[1]
        Q.append((pl[0] + el[0] * t, P[-1][1]))
    else:
        Q.append((pl[0] + el[0] * ((P[-1][0] - pl[0]) * el[0] + (P[-1][1] - pl[1]) * el[1]), pl[1]))
    return Q


def _offset_radii(points, radii, dists, min_r=0.25 * MM):
    """Fillet radii for an offset polyline: convex corners shrink, concave corners grow."""
    n = len(points)
    out = [0.0] * n
    for i in range(1, n - 1):
        if radii[i] <= 0:
            continue
        e1 = _unit((points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]))
        e2 = _unit((points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]))
        turn = e1[0] * e2[1] - e1[1] * e2[0]
        d = 0.5 * (dists[i - 1] + dists[i])
        out[i] = max(radii[i] - d, min_r) if turn > 0 else radii[i] + d
    return out


def shell_profile(ctrl, radii, walls, lip_r, step_deg=4.0):
    """Closed glass-shell profile: outer control polygon (axis-bottom ... lip) + its inward offset.
    Returns (points, tags) with tags 'outer' / 'inner'."""
    Q = offset_left(ctrl, walls)
    qr = _offset_radii(ctrl, radii, walls)
    n = len(ctrl)
    pts = list(ctrl) + list(Q[::-1])
    rad = list(radii[:-1]) + [lip_r, lip_r] + list(qr[::-1][1:])
    tags = ["outer"] * n + ["inner"] * n
    return fillet(pts, rad, tags=tags, step_deg=step_deg)


def clip_ctrl(Q, qr, z_cut, top_r):
    """Cut an (axis-bottom -> up) control polyline at height z_cut and close it back to the axis."""
    out, orad = [Q[0]], [0.0]
    for i in range(1, len(Q)):
        a, b = Q[i - 1], Q[i]
        if b[1] >= z_cut > a[1] - 1e-12:
            t = 0.0 if abs(b[1] - a[1]) < 1e-12 else (z_cut - a[1]) / (b[1] - a[1])
            out.append((a[0] + t * (b[0] - a[0]), z_cut))
            orad.append(top_r)
            out.append((0.0, z_cut))
            orad.append(0.0)
            return out, orad
        out.append(b)
        orad.append(qr[i])
    out.append((0.0, Q[-1][1]))
    orad.append(0.0)
    return out, orad


def profile_radius_at(profile, z):
    """Largest radius of an (r, z) polyline at height z (0 if the height is outside it)."""
    best = 0.0
    for (r0, z0), (r1, z1) in zip(profile[:-1], profile[1:]):
        if min(z0, z1) - 1e-9 <= z <= max(z0, z1) + 1e-9:
            r = max(r0, r1) if abs(z1 - z0) < 1e-12 else r0 + (r1 - r0) * (z - z0) / (z1 - z0)
            best = max(best, r)
    return best


def rest_height(profile, r):
    """Height at which a ring of radius r rests on a (shoulder) profile: the highest z where the
    profile reaches out to at least r."""
    best = 0.0
    for (r0, z0), (r1, z1) in zip(profile[:-1], profile[1:]):
        if max(r0, r1) < r - 1e-9:
            continue
        if min(r0, r1) >= r - 1e-9:
            best = max(best, z0, z1)
        else:
            t = (r - r0) / (r1 - r0)
            best = max(best, z0 + t * (z1 - z0))
    return best


# =============================================================================================
# mesh builders
# =============================================================================================

def _mesh_object(name, verts, faces, coll, uvs=None, mats=None, fmat=None, sharp_deg=40.0, smooth=True):
    me = bpy.data.meshes.new(name)
    v = verts.tolist() if isinstance(verts, np.ndarray) else verts
    me.from_pydata(v, [], faces)
    if uvs is not None:
        uvl = me.uv_layers.new(name="UVMap")
        uvl.data.foreach_set("uv", np.asarray(uvs, np.float32).ravel())
    if smooth:
        me.polygons.foreach_set("use_smooth", np.ones(len(me.polygons), dtype=bool))
    for m in mats or []:
        me.materials.append(m)
    if fmat is not None and len(fmat) == len(me.polygons):
        me.polygons.foreach_set("material_index", np.asarray(fmat, np.int32))
    if sharp_deg is not None and smooth:
        me.set_sharp_from_angle(angle=math.radians(sharp_deg))
    me.validate(clean_customdata=False)
    me.update()
    ob = bpy.data.objects.new(name, me)
    coll.objects.link(ob)
    return ob


def _rib_offset(th, z, ribs):
    w = _smoothstep(ribs["z0"], ribs["z0"] + ribs["fade"], z) * (1.0 - _smoothstep(ribs["z1"] - ribs["fade"], ribs["z1"], z))
    if w <= 0:
        return 0.0
    x = (((th - ribs.get("phase", 0.0)) * ribs["count"] / (2 * np.pi)) % 1.0) * 2.0 - 1.0
    style = ribs.get("style", "reeded")
    if style == "fluted":            # concave channels with crisp ridges
        prof = np.sqrt(np.clip(1.0 - x * x, 0.0, 1.0))
    elif style == "knurl":           # fine v-grooves (caps, collars)
        prof = np.abs(x) ** 1.5
    else:                             # reeded: convex half-round ribs
        prof = 1.0 - np.sqrt(np.clip(1.0 - x * x, 0.0, 1.0))
    return ribs["depth"] * w * prof


def _ribs_m(spec, z_lo, z_hi, tags=("outer",)):
    """Convert a user rib/flute spec (mm) to internal metres with defaults."""
    if not spec:
        return None
    if spec is True:
        spec = {}
    s = dict(spec)
    out = {
        "count": int(s.get("count", 32)),
        "depth": s.get("depth", 0.6) * MM,
        "z0": s["z0"] * MM if "z0" in s else z_lo,
        "z1": s["z1"] * MM if "z1" in s else z_hi,
        "fade": s.get("fade", 2.0) * MM,
        "style": s.get("style", "reeded"),
        "phase": math.radians(s.get("phase", 0.0)),
        "tags": tuple(s.get("tags", tags)),
    }
    return out


def revolve(name, prof, coll, segments=160, closed=False, tags=None, mats=None, slot_of=None,
            ribs=None, deform=None, sharp_deg=40.0, theta0=math.pi / 2):
    """Revolve an (r, z) profile around +Z.

    The profile must keep the solid on its *left* (e.g. axis-bottom -> out -> up -> axis-top), which
    gives outward normals. Points with r == 0 become poles. ``tags`` select material slots through
    ``slot_of`` and limit ``ribs``. UV: u = angle (0 at the back, 0.5 at the front, -Y), v = arc length
    along the profile in metres.
    """
    K = len(prof)
    tags = list(tags) if tags is not None else [None] * K
    if ribs:
        per = max(8, int(math.ceil(segments / ribs["count"])))
        segments = ribs["count"] * per
    th = theta0 + 2 * np.pi * np.arange(segments) / segments
    ct, st = np.cos(th), np.sin(th)
    chunks, ring, nv = [], [], 0
    for k, (r, z) in enumerate(prof):
        if r < 1e-7:
            chunks.append(np.array([[0.0, 0.0, float(z)]]))
            ring.append((True, nv))
            nv += 1
            continue
        rr = np.full(segments, float(r))
        if ribs and tags[k] in ribs["tags"]:
            rr = rr - _rib_offset(th, z, ribs)
        x, y, zz = rr * ct, rr * st, np.full(segments, float(z))
        if deform is not None:
            x, y, zz = deform(x, y, zz, tags[k], k)
        chunks.append(np.stack([x, y, zz], 1))
        ring.append((False, nv))
        nv += segments
    verts = np.concatenate(chunks, 0)
    s = [0.0]
    for k in range(1, K):
        s.append(s[-1] + math.hypot(prof[k][0] - prof[k - 1][0], prof[k][1] - prof[k - 1][1]))
    pairs = [(k, k + 1) for k in range(K - 1)]
    if closed:
        pairs.append((K - 1, 0))
    faces, uvs, fmat = [], [], []
    for a, b in pairs:
        pa, ia = ring[a]
        pb, ib = ring[b]
        if pa and pb:
            continue
        va = s[a]
        vb = s[b] if b != 0 else s[-1] + math.hypot(prof[0][0] - prof[-1][0], prof[0][1] - prof[-1][1])
        slot = slot_of.get(tags[a], 0) if slot_of else 0
        for j in range(segments):
            j1 = (j + 1) % segments
            u0, u1 = j / segments, (j + 1) / segments
            if not pa and not pb:
                faces.append((ia + j, ia + j1, ib + j1, ib + j))
                uvs.extend(((u0, va), (u1, va), (u1, vb), (u0, vb)))
            elif pa:
                faces.append((ia, ib + j1, ib + j))
                uvs.extend((((u0 + u1) / 2, va), (u1, vb), (u0, vb)))
            else:
                faces.append((ia + j, ia + j1, ib))
                uvs.extend(((u0, va), (u1, va), ((u0 + u1) / 2, vb)))
            fmat.append(slot)
    return _mesh_object(name, verts, faces, coll, uvs=uvs, mats=mats, fmat=fmat, sharp_deg=sharp_deg)


def _ctrl_mm(pts, radii):
    return [(x * MM, y * MM) for x, y in pts], [r * MM for r in radii]


def _revolve_ctrl(name, pts_mm, radii_mm, coll, mats, segments=160, closed=False, tags=None, ribs=None,
                  slot_of=None, step_deg=4.0, deform=None, transform=None):
    """Fillet an (r, z) control polygon given in mm and revolve it."""
    ctrl, rad = _ctrl_mm(pts_mm, radii_mm)
    prof, ptags = fillet(ctrl, rad, closed=closed, tags=tags, step_deg=step_deg)
    ob = revolve(name, prof, coll, segments=segments, closed=closed, tags=ptags, mats=mats,
                 slot_of=slot_of, ribs=ribs, deform=deform)
    if transform is not None:
        ob.data.transform(transform)
        ob.data.update()
    return ob, prof, ptags


def rounded_box_object(name, size, radius, coll, mats=None, segments=6):
    """Box with rounded edges (bevel + weighted normals so flat faces shade perfectly flat)."""
    sx, sy, sz = size
    v = [(-sx / 2, -sy / 2, 0), (sx / 2, -sy / 2, 0), (sx / 2, sy / 2, 0), (-sx / 2, sy / 2, 0),
         (-sx / 2, -sy / 2, sz), (sx / 2, -sy / 2, sz), (sx / 2, sy / 2, sz), (-sx / 2, sy / 2, sz)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    ob = _mesh_object(name, v, f, coll, mats=mats, sharp_deg=None, smooth=True)
    _bevel_modifiers(ob, radius, segments)
    return ob


def _bevel_modifiers(ob, radius, segments=6):
    if radius > 0:
        bev = ob.modifiers.new("bevel", "BEVEL")
        bev.width = radius
        bev.segments = segments
        bev.limit_method = "ANGLE"
        bev.angle_limit = math.radians(30)
        bev.use_clamp_overlap = True
    wn = ob.modifiers.new("weighted_normals", "WEIGHTED_NORMAL")
    wn.mode = "FACE_AREA"
    wn.keep_sharp = True
    wn.weight = 100


def extrude_outline_object(name, outline_xz, thickness, coll, mats=None, radius=0.0, segments=6):
    """Extrude a closed 2D outline drawn in the XZ plane by ``thickness`` along Y (centred)."""
    n = len(outline_xz)
    v = [(x, -thickness / 2, z) for x, z in outline_xz] + [(x, thickness / 2, z) for x, z in outline_xz]
    # winding: make the front face (-Y) point towards -Y
    area = sum(outline_xz[i][0] * outline_xz[(i + 1) % n][1] - outline_xz[(i + 1) % n][0] * outline_xz[i][1] for i in range(n))
    front = list(range(n)) if area < 0 else list(range(n))[::-1]
    back = [i + n for i in front[::-1]]
    faces = [tuple(front), tuple(back)]
    for i in range(n):
        j = (i + 1) % n
        if area > 0:
            faces.append((i, j, j + n, i + n))
        else:
            faces.append((j, i, i + n, j + n))
    ob = _mesh_object(name, v, faces, coll, mats=mats, sharp_deg=None, smooth=True)
    _bevel_modifiers(ob, radius, segments)
    return ob


def uv_sphere_object(name, radius, coll, mats=None, seg=96, rings=48):
    prof = [(radius * math.sin(math.pi * i / rings), -radius * math.cos(math.pi * i / rings)) for i in range(rings + 1)]
    prof[0] = (0.0, -radius)
    prof[-1] = (0.0, radius)
    return revolve(name, prof, coll, segments=seg, mats=mats, sharp_deg=None)


# =============================================================================================
# materials
# =============================================================================================

METALS = {
    "gold": "#F2D08C", "champagne": "#EAD8B8", "silver": "#E3E5E7", "rose": "#F1C5B2",
    "chrome": "#F3F4F5", "bronze": "#CFA57C", "gunmetal": "#7F8184", "brass": "#E8CB7E",
    "copper": "#EFB599", "pewter": "#B9B6B0",
}

PRESETS = {
    # glass (real thickness; colour = what the glass looks like through `tint_mm` of material)
    "glass_clear": {"kind": "glass", "color": "#F3F3F2", "tint_mm": 80.0, "roughness": 0.0},
    "glass_frosted": {"kind": "glass", "color": "#F3F3F2", "tint_mm": 80.0, "roughness": 0.24, "inner_roughness": 0.0},
    "glass_amber": {"kind": "glass", "color": "#B26A20", "tint_mm": 3.0, "roughness": 0.0},
    "glass_amber_frosted": {"kind": "glass", "color": "#B26A20", "tint_mm": 3.0, "roughness": 0.28, "inner_roughness": 0.0},
    "glass_tinted": {"kind": "glass", "color": "#E7BBAE", "tint_mm": 4.0, "roughness": 0.0},
    "glass_tinted_frosted": {"kind": "glass", "color": "#E7BBAE", "tint_mm": 4.0, "roughness": 0.3, "inner_roughness": 0.0},
    "glass_smoke": {"kind": "glass", "color": "#7A7470", "tint_mm": 3.0, "roughness": 0.0},
    "glass_opal": {"kind": "opal", "color": "#F4F0EA", "roughness": 0.1, "sss_mm": 2.5, "coat": 0.35},
    "plastic_clear": {"kind": "glass", "color": "#F5F8F8", "tint_mm": 80.0, "roughness": 0.02, "ior": 1.49},
    "plastic_frosted": {"kind": "glass", "color": "#F5F6F4", "tint_mm": 40.0, "roughness": 0.45, "ior": 1.49},
    # plastics
    "plastic_matte": {"kind": "plastic", "color": "#EDE6DC", "roughness": 0.5, "sheen": 0.15},
    "plastic_softtouch": {"kind": "plastic", "color": "#EDE6DC", "roughness": 0.62, "sheen": 0.35, "specular": 0.35},
    "plastic_satin": {"kind": "plastic", "color": "#EDE6DC", "roughness": 0.3},
    "plastic_gloss": {"kind": "plastic", "color": "#EDE6DC", "roughness": 0.08, "coat": 0.7},
    # metals
    "metal_gold_polished": {"kind": "metal", "metal": "gold", "roughness": 0.08},
    "metal_gold_brushed": {"kind": "metal", "metal": "gold", "roughness": 0.24, "brushed": True},
    "metal_champagne_polished": {"kind": "metal", "metal": "champagne", "roughness": 0.08},
    "metal_champagne_brushed": {"kind": "metal", "metal": "champagne", "roughness": 0.24, "brushed": True},
    "metal_silver_polished": {"kind": "metal", "metal": "silver", "roughness": 0.06},
    "metal_silver_brushed": {"kind": "metal", "metal": "silver", "roughness": 0.24, "brushed": True},
    "metal_rose_polished": {"kind": "metal", "metal": "rose", "roughness": 0.08},
    "metal_rose_brushed": {"kind": "metal", "metal": "rose", "roughness": 0.24, "brushed": True},
    "metal_chrome": {"kind": "metal", "metal": "chrome", "roughness": 0.03},
    # ceramic / stone / rubber
    "ceramic_glazed": {"kind": "ceramic", "color": "#F1EBE3", "roughness": 0.12, "coat": 0.5},
    "ceramic_matte": {"kind": "ceramic", "color": "#E9E1D6", "roughness": 0.62, "coat": 0.0},
    "stone": {"kind": "plaster", "color": "#CFC6BA", "roughness": 0.75, "bump": 0.25},
    "rubber": {"kind": "rubber", "color": "#2B2826", "roughness": 0.5, "sheen": 0.2},
    "silicone": {"kind": "rubber", "color": "#EEE4D9", "roughness": 0.4, "sheen": 0.25, "sss": 0.3},
    # contents
    "liquid": {"kind": "liquid", "color": "#EDCB9C", "tint_mm": 25.0, "ior": 1.38},
    "oil": {"kind": "liquid", "color": "#E3B460", "tint_mm": 16.0, "ior": 1.47},
    "water": {"kind": "liquid", "color": "#F2FAF9", "tint_mm": 500.0, "ior": 1.333},
    "gel": {"kind": "liquid", "color": "#EEF4F2", "tint_mm": 60.0, "ior": 1.35, "roughness": 0.03},
    "cream": {"kind": "cream", "color": "#F4EEE6"},
    "lotion": {"kind": "cream", "color": "#F1E9DF", "roughness": 0.22, "sss_mm": 1.5},
    # set materials
    "travertine": {"kind": "travertine"},
    "marble": {"kind": "marble"},
    "plaster": {"kind": "plaster", "color": "#E7DED2"},
    "leaf": {"kind": "leaf", "color": "#77845A"},
    "eucalyptus": {"kind": "leaf", "color": "#8FA09A", "back": "#B4C0BA", "roughness": 0.62, "sheen": 0.4},
}


def _resolve(spec):
    """Spec -> merged parameter dict (preset + overrides)."""
    if isinstance(spec, str):
        if spec.startswith("#"):
            spec = {"preset": "plastic_matte", "color": spec}
        else:
            spec = {"preset": spec}
    spec = dict(spec)
    preset = spec.pop("preset", None)
    if preset is not None and preset not in PRESETS:
        raise KeyError(f"unknown material preset '{preset}' (known: {', '.join(sorted(PRESETS))})")
    base = dict(PRESETS[preset]) if preset else {}
    base.update(spec)
    base.setdefault("kind", "plastic")
    base["_name"] = preset or base["kind"]
    return base


def material(spec):
    """Return a (cached) bpy material for a spec (preset name, '#hex' or dict)."""
    if spec is None:
        return None
    if isinstance(spec, bpy.types.Material):
        return spec
    params = _resolve(spec)
    key = json.dumps(params, sort_keys=True, default=str)
    m = _MAT_CACHE.get(key)
    if m is not None and m.name in bpy.data.materials:
        return m
    kind = params.pop("kind")
    name = params.pop("_name")
    builder = _BUILDERS.get(kind)
    if builder is None:
        raise KeyError(f"unknown material kind '{kind}'")
    m = builder(name, **params)
    _MAT_CACHE[key] = m
    return m


def glass_pair(spec):
    """(outer, inner) materials for a glass body: frosted glass is etched outside, smooth inside."""
    m_out = material(spec)
    p = _resolve(spec)
    if p.get("kind") == "glass" and p.get("roughness", 0.0) > 0.05:
        q = dict(p)
        q["roughness"] = p.get("inner_roughness", 0.0)
        q.pop("_name", None)
        q["preset"] = None
        q = {k: v for k, v in q.items() if k != "preset"}
        return m_out, material(q)
    return m_out, m_out


class _NT:
    def __init__(self, mat):
        self.mat = mat
        self.tree = mat.node_tree
        self.nodes = self.tree.nodes
        self.links = self.tree.links
        self.out = next(n for n in self.nodes if n.type == "OUTPUT_MATERIAL")
        self.bsdf = next((n for n in self.nodes if n.type == "BSDF_PRINCIPLED"), None)

    def new(self, kind, **props):
        n = self.nodes.new(kind)
        for k, v in props.items():
            setattr(n, k, v)
        return n

    def link(self, a, b):
        self.links.new(a, b)

    def feed(self, socket, src):
        if isinstance(src, bpy.types.NodeSocket):
            self.links.new(src, socket)
        else:
            socket.default_value = src


def _new_material(name):
    m = bpy.data.materials.new(name)
    if m.node_tree is None:  # older Blender
        m.use_nodes = True
    return m


def _p(p, **inputs):
    """Set Principled BSDF inputs by python-friendly names."""
    names = {
        "base": "Base Color", "metallic": "Metallic", "roughness": "Roughness", "ior": "IOR",
        "alpha": "Alpha", "sss": "Subsurface Weight", "sss_radius": "Subsurface Radius",
        "sss_scale": "Subsurface Scale", "specular": "Specular IOR Level", "spec_tint": "Specular Tint",
        "aniso": "Anisotropic", "aniso_rot": "Anisotropic Rotation", "transmission": "Transmission Weight",
        "coat": "Coat Weight", "coat_roughness": "Coat Roughness", "coat_tint": "Coat Tint",
        "sheen": "Sheen Weight", "sheen_roughness": "Sheen Roughness", "sheen_tint": "Sheen Tint",
        "emission": "Emission Color", "emission_strength": "Emission Strength",
        "dispersion": "Transmission Dispersion Scale", "thin_film": "Thin Film Thickness",
    }
    for k, v in inputs.items():
        sock = p.inputs[names[k]]
        if isinstance(v, str):
            v = rgba(v)
        if isinstance(v, bpy.types.NodeSocket):
            p.id_data.links.new(v, sock)
        else:
            sock.default_value = v


def _sock(coll, identifier):
    return next(s for s in coll if s.identifier == identifier)


def _mix_rgb(nt, fac, a, b, blend="MIX"):
    n = nt.new("ShaderNodeMix", data_type="RGBA", blend_type=blend)
    nt.feed(_sock(n.inputs, "Factor_Float"), fac)
    nt.feed(_sock(n.inputs, "A_Color"), rgba(a) if isinstance(a, str) else a)
    nt.feed(_sock(n.inputs, "B_Color"), rgba(b) if isinstance(b, str) else b)
    return _sock(n.outputs, "Result_Color")


def _math(nt, op, a, b=None, clamp=False):
    n = nt.new("ShaderNodeMath", operation=op, use_clamp=clamp)
    nt.feed(n.inputs[0], a)
    if b is not None:
        nt.feed(n.inputs[1], b)
    return n.outputs[0]


def _maprange(nt, value, fmin, fmax, tmin, tmax, interp="LINEAR", clamp=True):
    n = nt.new("ShaderNodeMapRange", interpolation_type=interp, clamp=clamp)
    nt.feed(n.inputs["Value"], value)
    n.inputs["From Min"].default_value = fmin
    n.inputs["From Max"].default_value = fmax
    n.inputs["To Min"].default_value = tmin
    n.inputs["To Max"].default_value = tmax
    return n.outputs["Result"]


def _shadow_trick(nt, surface, strength=0.86, color=(1, 1, 1)):
    """Make shadow rays see a transparent, edge-darkened surface: clean, light, glass-like shadows
    instead of black ones (fast stand-in for refractive caustics)."""
    lp = nt.new("ShaderNodeLightPath")
    lw = nt.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.4
    trans = _maprange(nt, lw.outputs["Facing"], 0.0, 1.0, strength, 0.1, interp="SMOOTHSTEP")
    tcol = _mix_rgb(nt, trans, (0, 0, 0, 1), (*color, 1))
    tr = nt.new("ShaderNodeBsdfTransparent")
    nt.link(tcol, tr.inputs["Color"])
    mix = nt.new("ShaderNodeMixShader")
    nt.link(lp.outputs["Is Shadow Ray"], mix.inputs["Fac"])
    nt.link(surface, mix.inputs[1])
    nt.link(tr.outputs[0], mix.inputs[2])
    return mix.outputs[0]


def _volume_absorb(nt, color, tint_mm):
    if not color or not tint_mm or tint_mm <= 0:
        return
    T = hex_rgb(color)
    sig = [-math.log(max(c, 1e-4)) / (tint_mm * MM) for c in T]
    dens = max(sig)
    if dens < 1e-3:
        return
    col = [max(0.0, 1.0 - s / dens) for s in sig]
    va = nt.new("ShaderNodeVolumeAbsorption")
    va.inputs["Color"].default_value = (*col, 1.0)
    va.inputs["Density"].default_value = dens
    nt.link(va.outputs[0], nt.out.inputs["Volume"])


def _b_glass(name, color="#F1F7F4", tint_mm=40.0, roughness=0.0, ior=1.5, shadow=True, shadow_strength=0.86,
             dispersion=0.0, specular=0.5, base=None, inner_roughness=None, volume=None, **kw):
    """Dielectric (glass / clear plastic / liquid). `color` is what the material looks like through
    `tint_mm` of thickness. Smooth coloured glass uses true volume absorption (thick bases read darker);
    rough (frosted) or colourless glass is tinted per interface instead, because Cycles darkens rough
    glass with volume absorption in proportion to the distance to the lights (shadow rays leaving a
    rough glass surface keep the glass volume), which made frosted bottles turn muddy in large sets."""
    m = _new_material(name)
    nt = _NT(m)
    p = nt.bsdf
    T = hex_rgb(color) if color else (1.0, 1.0, 1.0)
    colourless = min(T) > 0.85 and (max(T) - min(T)) < 0.03
    use_volume = volume if volume is not None else (roughness <= 0.05 and not colourless)
    if base is None:
        if use_volume or colourless or not tint_mm:
            base_rgba = (1.0, 1.0, 1.0, 1.0)
        else:  # per-interface tint: two crossings of a ~2.5 mm wall reproduce the colour at tint_mm
            e = min(1.0, 1.25 / max(tint_mm, 0.1))
            base_rgba = (*(max(c, 1e-4) ** e for c in T), 1.0)
    else:
        base_rgba = rgba(base)
    _p(p, base=base_rgba, roughness=roughness, ior=ior, transmission=1.0, specular=specular)
    if dispersion:
        _p(p, dispersion=dispersion)
    if use_volume:
        _volume_absorb(nt, color, tint_mm)
    surf = p.outputs[0]
    if shadow:
        surf = _shadow_trick(nt, surf, shadow_strength)
    nt.link(surf, nt.out.inputs["Surface"])
    return m


def _b_liquid(name, color="#EDCB9C", tint_mm=25.0, ior=1.38, roughness=0.0, shadow=True, **kw):
    return _b_glass(name, color=color, tint_mm=tint_mm, roughness=roughness, ior=ior, shadow=shadow, shadow_strength=0.9)


def _b_opal(name, color="#F4F0EA", roughness=0.1, sss_mm=2.5, coat=0.35, ior=1.5, radius=(1.0, 0.82, 0.66), **kw):
    m = _new_material(name)
    nt = _NT(m)
    _p(nt.bsdf, base=color, roughness=roughness, sss=1.0, sss_radius=radius, sss_scale=sss_mm * MM, ior=ior,
       coat=coat, coat_roughness=0.04)
    return m


def _b_plastic(name, color="#EDE6DC", roughness=0.5, coat=0.0, coat_roughness=0.04, sheen=0.0,
               sheen_roughness=0.45, specular=0.5, sss=0.0, **kw):
    m = _new_material(name)
    nt = _NT(m)
    _p(nt.bsdf, base=color, roughness=roughness, specular=specular, coat=coat, coat_roughness=coat_roughness,
       sheen=sheen, sheen_roughness=sheen_roughness)
    if sss:
        _p(nt.bsdf, sss=sss, sss_radius=(1.0, 0.8, 0.6), sss_scale=1.0 * MM)
    return m


def _b_metal(name, metal="gold", color=None, roughness=0.24, brushed=False, anisotropy=0.65, brush_scale=9000.0,
             edge="#FFFFFF", **kw):
    m = _new_material(name)
    nt = _NT(m)
    p = nt.bsdf
    col = color or METALS.get(metal, METALS["gold"])
    _p(p, base=col, metallic=1.0, spec_tint=edge)
    if brushed:
        tc = nt.new("ShaderNodeTexCoord")
        sep = nt.new("ShaderNodeSeparateXYZ")
        nt.link(tc.outputs["Object"], sep.inputs[0])
        rad = _math(nt, "SQRT", _math(nt, "ADD", _math(nt, "MULTIPLY", sep.outputs[0], sep.outputs[0]),
                                       _math(nt, "MULTIPLY", sep.outputs[1], sep.outputs[1])))
        q = _math(nt, "ADD", rad, sep.outputs[2])
        noise = nt.new("ShaderNodeTexNoise", noise_dimensions="1D")
        nt.link(q, noise.inputs["W"])
        noise.inputs["Scale"].default_value = brush_scale
        noise.inputs["Detail"].default_value = 3.0
        rough = _maprange(nt, noise.outputs["Factor"], 0.3, 0.7, roughness * 0.75, roughness * 1.25)
        nt.link(rough, p.inputs["Roughness"])
        tan = nt.new("ShaderNodeTangent", direction_type="RADIAL", axis="Z")
        nt.link(tan.outputs[0], p.inputs["Tangent"])
        p.inputs["Anisotropic"].default_value = anisotropy
        bump = nt.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.03
        bump.inputs["Distance"].default_value = 0.00001
        nt.link(noise.outputs["Factor"], bump.inputs["Height"])
        nt.link(bump.outputs[0], p.inputs["Normal"])
    else:
        p.inputs["Roughness"].default_value = roughness
    return m


def _b_ceramic(name, color="#F1EBE3", roughness=0.12, coat=0.5, speckle=0.0, speckle_color="#6E6259", **kw):
    m = _new_material(name)
    nt = _NT(m)
    base = rgba(color)
    if speckle > 0:
        tc = nt.new("ShaderNodeTexCoord")
        v = nt.new("ShaderNodeTexVoronoi")
        nt.link(tc.outputs["Object"], v.inputs["Vector"])
        v.inputs["Scale"].default_value = 900.0
        dots = _maprange(nt, v.outputs["Distance"], 0.0, 0.12 * speckle, 1.0, 0.0)
        base = _mix_rgb(nt, dots, color, speckle_color)
    _p(nt.bsdf, base=base, roughness=roughness, coat=coat, coat_roughness=0.05)
    return m


def _b_rubber(name, color="#2B2826", roughness=0.5, sheen=0.2, sss=0.0, **kw):
    m = _new_material(name)
    nt = _NT(m)
    _p(nt.bsdf, base=color, roughness=roughness, sheen=sheen, sheen_roughness=0.5, specular=0.45)
    if sss:
        _p(nt.bsdf, sss=sss, sss_radius=(1.0, 0.75, 0.6), sss_scale=1.2 * MM)
    return m


def _b_cream(name, color="#F4EEE6", roughness=0.3, sss_mm=2.0, coat=0.2, **kw):
    m = _new_material(name)
    nt = _NT(m)
    _p(nt.bsdf, base=color, roughness=roughness, sss=1.0, sss_radius=(1.0, 0.78, 0.6), sss_scale=sss_mm * MM,
       coat=coat, coat_roughness=0.12)
    return m


def _obj_coords(nt, scale=1.0, stretch=(1.0, 1.0, 1.0)):
    tc = nt.new("ShaderNodeTexCoord")
    mp = nt.new("ShaderNodeMapping")
    nt.link(tc.outputs["Object"], mp.inputs["Vector"])
    mp.inputs["Scale"].default_value = (scale * stretch[0], scale * stretch[1], scale * stretch[2])
    return mp.outputs[0]


def _ridge(nt, value, width):
    """1 on the thin line where ``value`` crosses 0.5, falling to 0 at +-width (vein / strata lines)."""
    d = _math(nt, "ABSOLUTE", _math(nt, "SUBTRACT", value, 0.5))
    return _maprange(nt, d, 0.0, width, 1.0, 0.0, "SMOOTHSTEP")


def _b_travertine(name, color="#DBCCB5", color2="#CDB99B", line="#BBA27D", pore="#97805F", roughness=0.56, scale=1.0,
                  pores=1.0, banding=1.0, **kw):
    """Honed travertine: soft tonal strata, fine wandering horizontal veins and sparse elongated pits.
    `scale` multiplies the pattern frequency (1 = real-world size)."""
    m = _new_material(name)
    nt = _NT(m)
    p = nt.bsdf
    co = _obj_coords(nt, scale)
    sep = nt.new("ShaderNodeSeparateXYZ")
    nt.link(co, sep.inputs[0])
    warp = nt.new("ShaderNodeTexNoise")
    nt.link(co, warp.inputs["Vector"])
    warp.inputs["Scale"].default_value = 5.0
    warp.inputs["Detail"].default_value = 3.0
    zq = _math(nt, "ADD", sep.outputs[2], _math(nt, "MULTIPLY", warp.outputs["Factor"], 0.02))

    def strata(sc, det):
        n = nt.new("ShaderNodeTexNoise", noise_dimensions="1D")
        nt.link(zq, n.inputs["W"])
        n.inputs["Scale"].default_value = sc
        n.inputs["Detail"].default_value = det
        n.inputs["Roughness"].default_value = 0.55
        return n.outputs["Factor"]
    tone = _maprange(nt, strata(11.0, 2.0), 0.3, 0.7, 0.0, 0.8 * banding)
    base = _mix_rgb(nt, tone, color, color2)
    cloud = nt.new("ShaderNodeTexNoise")
    nt.link(co, cloud.inputs["Vector"])
    cloud.inputs["Scale"].default_value = 7.0
    cloud.inputs["Detail"].default_value = 5.0
    base = _mix_rgb(nt, _maprange(nt, cloud.outputs["Factor"], 0.4, 0.75, 0.0, 0.35), base, color2)
    # sediment lines: few, wavy and discontinuous (faded along their length), never a regular grain
    lines = _ridge(nt, strata(24.0, 4.0), 0.022)
    lines2 = _ridge(nt, strata(75.0, 3.0), 0.03)
    brk = nt.new("ShaderNodeTexNoise")
    nt.link(_obj_coords(nt, scale, (1.0, 1.0, 6.0)), brk.inputs["Vector"])
    brk.inputs["Scale"].default_value = 9.0
    brk.inputs["Detail"].default_value = 3.0
    gate = _maprange(nt, brk.outputs["Factor"], 0.42, 0.62, 0.0, 1.0, "SMOOTHSTEP")
    lm = _math(nt, "ADD", _math(nt, "MULTIPLY", lines, 0.34 * banding), _math(nt, "MULTIPLY", lines2, 0.1 * banding))
    lm = _math(nt, "MULTIPLY", lm, gate)
    base = _mix_rgb(nt, _math(nt, "MINIMUM", lm, 1.0), base, line)
    # pits: a minority of Voronoi cells (random per cell) carry a small horizontal void
    pco = _obj_coords(nt, scale, (1.0, 1.0, 3.4))
    jit = nt.new("ShaderNodeTexNoise", noise_dimensions="3D")
    nt.link(pco, jit.inputs["Vector"])
    jit.inputs["Scale"].default_value = 260.0
    jit.inputs["Detail"].default_value = 2.0
    jv = nt.new("ShaderNodeVectorMath", operation="SCALE")
    nt.link(jit.outputs["Color"], jv.inputs[0])
    jv.inputs["Scale"].default_value = 0.006
    pco2 = nt.new("ShaderNodeVectorMath", operation="ADD")
    nt.link(pco, pco2.inputs[0])
    nt.link(jv.outputs[0], pco2.inputs[1])
    vor = nt.new("ShaderNodeTexVoronoi", feature="F1")
    nt.link(pco2.outputs[0], vor.inputs["Vector"])
    vor.inputs["Scale"].default_value = 34.0
    vor.inputs["Randomness"].default_value = 1.0
    cellsep = nt.new("ShaderNodeSeparateColor")
    nt.link(vor.outputs["Color"], cellsep.inputs[0])
    chosen = _maprange(nt, cellsep.outputs[0], 1.0 - 0.3 * pores, 1.0 - 0.28 * pores, 0.0, 1.0)
    size = _maprange(nt, _math(nt, "POWER", cellsep.outputs[1], 2.0), 0.0, 1.0, 0.06, 0.32)
    pit = _maprange(nt, _math(nt, "DIVIDE", vor.outputs["Distance"], size), 0.5, 1.0, 1.0, 0.0, "SMOOTHSTEP")
    pmask = _math(nt, "MULTIPLY", pit, chosen)
    base = _mix_rgb(nt, _math(nt, "MULTIPLY", pmask, 0.62), base, pore)
    fine = nt.new("ShaderNodeTexNoise")
    nt.link(co, fine.inputs["Vector"])
    fine.inputs["Scale"].default_value = 1200.0
    fine.inputs["Detail"].default_value = 3.0
    base = _mix_rgb(nt, _math(nt, "MULTIPLY", fine.outputs["Factor"], 0.1), base, "#7D6A52", "OVERLAY")
    _p(p, base=base, specular=0.4)
    nt.link(_maprange(nt, pmask, 0.0, 1.0, roughness, min(1.0, roughness + 0.3)), p.inputs["Roughness"])
    bump = nt.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.6
    bump.inputs["Distance"].default_value = 0.0007
    h = _math(nt, "SUBTRACT", _math(nt, "MULTIPLY", fine.outputs["Factor"], 0.1), _math(nt, "MULTIPLY", pmask, 1.2))
    nt.link(h, bump.inputs["Height"])
    nt.link(bump.outputs[0], p.inputs["Normal"])
    return m


def _b_marble(name, color="#EFECE8", vein="#8E8780", roughness=0.1, scale=1.0, coat=0.35, veins=1.0, **kw):
    """Polished marble: thin, branching, wandering veins (ridged noise) over faint grey clouding."""
    m = _new_material(name)
    nt = _NT(m)
    p = nt.bsdf
    co = _obj_coords(nt, scale)
    n1 = nt.new("ShaderNodeTexNoise")
    nt.link(co, n1.inputs["Vector"])
    n1.inputs["Scale"].default_value = 3.2
    n1.inputs["Detail"].default_value = 9.0
    n1.inputs["Roughness"].default_value = 0.6
    n1.inputs["Distortion"].default_value = 0.5
    n2 = nt.new("ShaderNodeTexNoise")
    nt.link(co, n2.inputs["Vector"])
    n2.inputs["Scale"].default_value = 9.0
    n2.inputs["Detail"].default_value = 8.0
    n2.inputs["Distortion"].default_value = 0.4
    v1 = _ridge(nt, n1.outputs["Factor"], 0.014)
    v2 = _ridge(nt, n2.outputs["Factor"], 0.008)
    cloud = nt.new("ShaderNodeTexNoise")
    nt.link(co, cloud.inputs["Vector"])
    cloud.inputs["Scale"].default_value = 2.5
    cloud.inputs["Detail"].default_value = 4.0
    base = _mix_rgb(nt, _maprange(nt, cloud.outputs["Factor"], 0.35, 0.75, 0.0, 0.1), color, vein)
    vm = _math(nt, "ADD", _math(nt, "MULTIPLY", v1, 0.75 * veins), _math(nt, "MULTIPLY", v2, 0.35 * veins))
    base = _mix_rgb(nt, _math(nt, "MINIMUM", vm, 1.0), base, vein)
    _p(p, base=base, roughness=roughness, coat=coat, coat_roughness=0.03, sss=0.12, sss_radius=(1, 0.9, 0.8),
       sss_scale=0.003)
    return m


def _b_plaster(name, color="#E7DED2", roughness=0.88, bump=0.15, scale=1.0, variation=0.05, **kw):
    m = _new_material(name)
    nt = _NT(m)
    p = nt.bsdf
    co = _obj_coords(nt, scale)
    n1 = nt.new("ShaderNodeTexNoise")
    nt.link(co, n1.inputs["Vector"])
    n1.inputs["Scale"].default_value = 18.0
    n1.inputs["Detail"].default_value = 5.0
    n2 = nt.new("ShaderNodeTexNoise")
    nt.link(co, n2.inputs["Vector"])
    n2.inputs["Scale"].default_value = 420.0
    n2.inputs["Detail"].default_value = 8.0
    dark = tuple(c * (1 - variation * 2.5) for c in hex_rgb(color)) + (1.0,)
    base = _mix_rgb(nt, _maprange(nt, n1.outputs["Factor"], 0.35, 0.7, 0.0, 1.0), rgba(color), dark)
    _p(p, base=base, roughness=roughness, specular=0.35)
    b = nt.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = bump
    b.inputs["Distance"].default_value = 0.0006
    nt.link(_math(nt, "ADD", n2.outputs["Factor"], _math(nt, "MULTIPLY", n1.outputs["Factor"], 0.4)), b.inputs["Height"])
    nt.link(b.outputs[0], p.inputs["Normal"])
    return m


def _b_leaf(name, color="#77845A", back="#A3AE88", roughness=0.45, translucency=0.3, sheen=0.0, **kw):
    m = _new_material(name)
    nt = _NT(m)
    p = nt.bsdf
    geo = nt.new("ShaderNodeNewGeometry")
    col = _mix_rgb(nt, geo.outputs["Backfacing"], color, back)
    _p(p, base=col, roughness=roughness, sheen=sheen, sheen_roughness=0.5, specular=0.45)
    tl = nt.new("ShaderNodeBsdfTranslucent")
    nt.link(col, tl.inputs["Color"])
    mix = nt.new("ShaderNodeMixShader")
    mix.inputs["Fac"].default_value = translucency
    nt.link(p.outputs[0], mix.inputs[1])
    nt.link(tl.outputs[0], mix.inputs[2])
    nt.link(mix.outputs[0], nt.out.inputs["Surface"])
    return m


def _b_backdrop(name, color="#EAE2D8", wall_color=None, roughness=0.92, blend_lo=0.0, blend_hi=0.6, grain=0.0, **kw):
    m = _new_material(name)
    nt = _NT(m)
    p = nt.bsdf
    if wall_color:
        tc = nt.new("ShaderNodeTexCoord")
        sep = nt.new("ShaderNodeSeparateXYZ")
        nt.link(tc.outputs["Object"], sep.inputs[0])
        f = _maprange(nt, sep.outputs[2], blend_lo, blend_hi, 0.0, 1.0, "SMOOTHERSTEP")
        base = _mix_rgb(nt, f, color, wall_color)
    else:
        base = rgba(color)
    _p(p, base=base, roughness=roughness, specular=0.3)
    if grain > 0:
        co = _obj_coords(nt, 1.0)
        n = nt.new("ShaderNodeTexNoise")
        nt.link(co, n.inputs["Vector"])
        n.inputs["Scale"].default_value = 1500.0
        n.inputs["Detail"].default_value = 3.0
        b = nt.new("ShaderNodeBump")
        b.inputs["Strength"].default_value = grain
        b.inputs["Distance"].default_value = 0.0003
        nt.link(n.outputs["Factor"], b.inputs["Height"])
        nt.link(b.outputs[0], p.inputs["Normal"])
    return m


_BUILDERS = {
    "glass": _b_glass, "liquid": _b_liquid, "opal": _b_opal, "plastic": _b_plastic, "metal": _b_metal,
    "ceramic": _b_ceramic, "rubber": _b_rubber, "cream": _b_cream, "travertine": _b_travertine,
    "marble": _b_marble, "plaster": _b_plaster, "leaf": _b_leaf, "backdrop": _b_backdrop,
}


# =============================================================================================
# products
# =============================================================================================

class Product:
    """A packaged product: an Empty root with named parts, plus data the label tools need."""

    def __init__(self, kind, name):
        self.kind = kind
        self.name = name
        self.coll = collection("Products")
        self.root = bpy.data.objects.new(name, None)
        self.root.empty_display_size = 0.02
        self.coll.objects.link(self.root)
        self.parts = {}
        self.labels = []
        self.body_profile = None      # outer (r, z) polyline of the labelable body (metres)
        self.label_band = None        # (z0, z1) default label zone (metres)
        self.anchors = {}             # named spots for decals: name -> (x, y, z, usable_radius)
        self.height = 0.0
        self.radius = 0.0

    def add(self, role, ob):
        ob.parent = self.root
        self.parts[role] = ob
        return ob

    def objects(self):
        return list(self.parts.values()) + list(self.labels)

    def place(self, x_mm=0.0, y_mm=0.0, z_mm=0.0, rot_deg=0.0, z_m=None):
        self.root.location = (x_mm * MM, y_mm * MM, (z_m if z_m is not None else z_mm * MM) - 0.02 * MM)
        self.root.rotation_euler = (0.0, 0.0, math.radians(rot_deg))


def _mats_for(kind, overrides):
    m = dict(DEFAULT_MATERIALS.get(kind, {}))
    for k, v in (overrides or {}).items():
        m[k] = v
    return m


DEFAULT_MATERIALS = {
    "dropper": {"body": "glass_frosted", "liquid": "liquid", "collar": "metal_champagne_brushed",
                "bulb": "silicone", "pipette": "glass_clear", "pipette_liquid": None},
    "pump": {"body": "glass_amber", "liquid": "liquid", "collar": "plastic_matte", "head": "plastic_matte",
             "nozzle": None, "stem": "plastic_satin", "dip_tube": "plastic_frosted"},
    "mist": {"body": "glass_clear", "liquid": "water", "ferrule": "metal_champagne_polished",
             "actuator": "plastic_matte", "overcap": "plastic_clear", "orifice": "rubber", "dip_tube": "plastic_frosted"},
    "cylinder": {"body": "glass_clear", "liquid": "liquid", "cap": "metal_champagne_brushed"},
    "jar": {"body": "glass_opal", "contents": "cream", "lid": "metal_champagne_brushed"},
    "tube": {"body": "plastic_softtouch", "cap": "plastic_gloss", "shoulder": None},
    "stick": {"base": "plastic_softtouch", "cap": "metal_champagne_brushed"},
    "compact": {"base": "metal_champagne_brushed", "lid": "metal_champagne_brushed"},
}


def _bottle_ctrl(d, h, shoulder_r, neck_d, neck_h, base_r, punt, shoulder="round", shoulder_angle=32.0):
    """Outer control polygon (mm) of a bottle: axis-bottom -> base -> wall -> shoulder -> neck lip."""
    R, rn = d / 2.0, neck_d / 2.0
    zs = h - neck_h
    pts, rad = [], []
    if punt > 0:
        pts += [(0.0, punt), (R * 0.78, 0.0)]
        rad += [0.0, min(R * 0.25, 4.0)]
    else:
        pts += [(0.0, 0.0)]
        rad += [0.0]
    pts += [(R, 0.0)]
    rad += [base_r]
    if shoulder == "slope":
        zb = zs - (R - rn) * math.tan(math.radians(shoulder_angle))
        pts += [(R, zb), (rn, zs)]
        rad += [shoulder_r, 1.2]
    else:
        pts += [(R, zs), (rn, zs)]
        rad += [shoulder_r, 1.0]
    pts += [(rn, h)]
    rad += [0.0]
    return pts, rad, zs


def _glass_bottle(prod, d, h, shoulder_r, neck_d, neck_h, wall, base_t, neck_wall, shoulder, shoulder_angle,
                  punt, base_r, flutes, segments, body_spec, liquid_spec, fill):
    """Body (real wall thickness) + liquid for every bottle type. Returns geometry info (mm)."""
    coll = prod.coll
    ctrl, rad, zs = _bottle_ctrl(d, h, shoulder_r, neck_d, neck_h, base_r, punt, shoulder, shoulder_angle)
    nbase = 2 if punt > 0 else 1
    walls = [base_t] * nbase + [wall, wall * 1.15, neck_wall]
    lip = neck_wall * 0.45
    ctrl_m, rad_m = _ctrl_mm(ctrl, rad)
    walls_m = [w * MM for w in walls]
    prof, tags = shell_profile(ctrl_m, rad_m, walls_m, lip * MM)
    outer_m, inner_m = glass_pair(body_spec)
    z_wall_lo = (base_r + 1.0) * MM
    z_wall_hi = (zs - (shoulder_r if shoulder != "slope" else 0) - 1.0) * MM
    if shoulder == "slope":
        z_wall_hi = (zs - (d / 2 - neck_d / 2) * math.tan(math.radians(shoulder_angle)) - shoulder_r - 1.0) * MM
    ribs = _ribs_m(flutes, z_wall_lo + 1 * MM, z_wall_hi - 1 * MM) if flutes else None
    body = revolve(prod.name + "_body", prof, coll, segments=segments, tags=tags, mats=[outer_m, inner_m],
                   slot_of={"outer": 0, "inner": 1}, ribs=ribs)
    prod.add("body", body)
    prod.body_profile = [p for p, t in zip(prof, tags) if t == "outer"]
    prod.label_band = (z_wall_lo, z_wall_hi)
    prod.radius = d / 2 * MM
    info = {"zs": zs, "R": d / 2, "rn": neck_d / 2, "bore": neck_d / 2 - neck_wall, "base_t": base_t + punt,
            "z_wall_hi": z_wall_hi / MM}
    if liquid_spec and fill > 0:
        lw = [max(w * MM - OVERLAP, 0.2 * MM) for w in walls]
        Ql = offset_left(ctrl_m, lw)
        qr = _offset_radii(ctrl_m, rad_m, lw)
        z_lo = Ql[1][1] if len(Ql) > 1 else Ql[0][1]
        z_fill = z_lo + fill * (z_wall_hi + 1.0 * MM - z_lo)
        lctrl, lrad = clip_ctrl(Ql, qr, z_fill, 1.2 * MM)
        lprof, _ = fillet(lctrl, lrad)
        liq = revolve(prod.name + "_liquid", lprof, coll, segments=segments, mats=[material(liquid_spec)])
        prod.add("liquid", liq)
        info["z_fill"] = z_fill / MM
    return info


def _closure_shell(name, coll, mats, r_in, r_out, z0, height, hole_r, top_t, segments=160, top_r=1.4, bottom_r=0.5,
                   ribs=None, inner_wall=None, ribs_tags=("side",)):
    """Ring-shaped closure (collar, ferrule, screw cap with a hole): open bottom, top plate with a hole.
    r_in: skirt inner radius; hole_r: top hole radius (0 = closed top)."""
    z1 = z0 + height
    if hole_r and hole_r > 0:
        pts = [(r_in, z0), (r_out, z0), (r_out, z1), (hole_r, z1), (hole_r, z1 - top_t), (r_in, z1 - top_t)]
        rad = [0.25, bottom_r, top_r, 0.45, 0.3, 0.3]
        tags = ["bottom", "side", "top", "hole", "under", "inside"]
        closed = True
    else:
        pts = [(0.0, z1 - top_t), (r_in, z1 - top_t), (r_in, z0), (r_out, z0), (r_out, z1), (0.0, z1)]
        rad = [0.0, 0.6, 0.25, bottom_r, top_r, 0.0]
        tags = ["under", "inside", "bottom", "side", "top", "top"]
        closed = False
    rb = None
    if ribs:
        rb = _ribs_m(ribs, (z0 + bottom_r + 0.6) * MM, (z1 - top_r - 0.6) * MM, tags=ribs_tags)
        rb["fade"] = min(rb["fade"], 0.8 * MM)
    ob, prof, ptags = _revolve_ctrl(name, pts, rad, coll, mats, segments=segments, closed=closed, tags=tags, ribs=rb)
    return ob


def _solid(name, coll, mats, pts, rad, segments=160, tags=None, ribs=None, deform=None, transform=None, step_deg=4.0):
    ob, prof, ptags = _revolve_ctrl(name, pts, rad, coll, mats, segments=segments, tags=tags, ribs=ribs,
                                    deform=deform, transform=transform, step_deg=step_deg)
    return ob


def make_dropper(name="dropper", d=32.0, h=72.0, shoulder_r=7.5, neck_d=18.0, neck_h=9.5, wall=2.2, base_t=6.5,
                 neck_wall=2.4, shoulder="round", shoulder_angle=32.0, punt=0.8, base_r=2.5,
                 collar_d=22.5, collar_h=15.0, collar_top_r=1.6, collar_ribs=None,
                 bulb_d=14.0, bulb_h=21.0, flange_d=17.0, flange_h=2.6, bulb_waist=0.5,
                 pipette=True, pipette_d=7.0, fill=0.78, flutes=None, segments=160, materials=None):
    """Glass dropper bottle: thick-walled body + liquid, collar, silicone bulb and a glass pipette
    (with liquid inside) visible through the glass. All dimensions in mm."""
    prod = Product("dropper", name)
    mats = _mats_for("dropper", materials)
    info = _glass_bottle(prod, d, h, shoulder_r, neck_d, neck_h, wall, base_t, neck_wall, shoulder, shoulder_angle,
                         punt, base_r, flutes, segments, mats["body"], mats["liquid"], fill)
    coll = prod.coll
    zs, rn = info["zs"], info["rn"]
    Rc = collar_d / 2.0
    z0 = rest_height([(r / MM, z / MM) for r, z in prod.body_profile], rn + 0.3) + 0.35
    z1 = z0 + collar_h
    top_t = 1.6
    hole = bulb_d / 2.0 * 0.62
    prod.add("collar", _closure_shell(name + "_collar", coll, [material(mats["collar"])], rn + 0.3, Rc, z0, collar_h,
                                      hole, top_t, segments, top_r=collar_top_r, bottom_r=0.6, ribs=collar_ribs))
    # bulb: stem through the collar hole, flange on top, gently waisted body, domed top
    fr, br = flange_d / 2.0, bulb_d / 2.0
    zf = z1 + 0.05
    pts = [(0.0, z1 - 3.5), (hole - 0.15, z1 - 3.5), (hole - 0.15, zf), (fr, zf), (fr, zf + flange_h), (br, zf + flange_h)]
    rad = [0.0, 0.3, 0.3, 0.6, 0.9, 0.7]
    if bulb_waist > 0:
        pts += [(br - bulb_waist, zf + flange_h + (bulb_h - flange_h) * 0.42)]
        rad += [bulb_h * 0.6]
    pts += [(br, z1 + bulb_h), (0.0, z1 + bulb_h)]
    rad += [br * 0.92, 0.0]
    prod.add("bulb", _solid(name + "_bulb", coll, [material(mats["bulb"])], pts, rad, segments))
    if pipette:
        rp = pipette_d / 2.0
        rpi = rp - 1.0
        z_top = z1 - 2.5
        z_tip = info["base_t"] + 4.0
        z_tap = z_tip + 11.0
        rt, rti = 1.25, 0.5
        pts = [(rpi, z_top), (rpi, z_tap), (rti, z_tip), (rt, z_tip), (rp, z_tap), (rp, z_top)]
        rad = [0.2, 3.0, 0.3, 0.4, 3.0, 0.2]
        ob, _, _ = _revolve_ctrl(name + "_pipette", pts, rad, coll, [material(mats["pipette"])], segments=96, closed=True)
        prod.add("pipette", ob)
        zf_l = info.get("z_fill")
        if zf_l and zf_l > z_tip + 1.0 and mats.get("liquid"):
            zl = min(zf_l, z_top - 1.0)
            pts = [(0.0, z_tip + 0.6), (rti + 0.05, z_tip + 0.6), (rpi + 0.05, z_tap), (rpi + 0.05, zl), (0.0, zl)]
            rad = [0.0, 0.0, 2.5, 0.6, 0.0]
            prod.add("pipette_liquid", _solid(name + "_pipette_liquid", coll,
                                              [material(mats.get("pipette_liquid") or mats["liquid"])], pts, rad, 64))
    prod.height = (z1 + bulb_h) * MM
    return prod


def make_pump(name="pump", d=44.0, h=112.0, shoulder_r=6.0, neck_d=20.0, neck_h=9.0, wall=2.6, base_t=7.0,
              neck_wall=2.4, shoulder="round", shoulder_angle=32.0, punt=0.8, base_r=3.0,
              collar_d=25.0, collar_h=12.0, collar_ribs=None, head_d=21.0, head_h=15.0, stem_d=6.5, stem_h=5.0,
              nozzle_len=15.0, nozzle_d=5.6, nozzle_angle=0.0, fill=0.85, dip_tube=True, flutes=None,
              segments=160, materials=None):
    """Pump bottle: body + liquid, (optionally knurled) screw collar, stem, actuator head with nozzle,
    dip tube. nozzle_angle rotates the nozzle around the bottle axis (0 = pointing to +X / right)."""
    prod = Product("pump", name)
    mats = _mats_for("pump", materials)
    if collar_ribs is None:
        collar_ribs = {"count": 72, "depth": 0.35, "style": "knurl"}
    info = _glass_bottle(prod, d, h, shoulder_r, neck_d, neck_h, wall, base_t, neck_wall, shoulder, shoulder_angle,
                         punt, base_r, flutes, segments, mats["body"], mats["liquid"], fill)
    coll = prod.coll
    rn = info["rn"]
    Rc = collar_d / 2.0
    z0 = rest_height([(r / MM, z / MM) for r, z in prod.body_profile], rn + 0.3) + 0.35
    z1 = z0 + collar_h
    rs = stem_d / 2.0
    prod.add("collar", _closure_shell(name + "_collar", coll, [material(mats["collar"])], rn + 0.3, Rc, z0, collar_h,
                                      rs + 0.6, 2.0, segments, top_r=1.0, bottom_r=0.5, ribs=collar_ribs or None))
    zh0 = z1 + stem_h
    zh1 = zh0 + head_h
    prod.add("stem", _solid(name + "_stem", coll, [material(mats["stem"])],
                            [(0.0, z1 - 2.0), (rs, z1 - 2.0), (rs, zh0 + 2.0), (0.0, zh0 + 2.0)], [0, 0.2, 0.2, 0], 96))
    Rh = head_d / 2.0
    head_m = material(mats["head"])
    prod.add("head", _solid(name + "_head", coll, [head_m],
                            [(0.0, zh0), (Rh, zh0), (Rh, zh1), (Rh * 0.55, zh1), (0.0, zh1 - 0.3)],
                            [0, 0.8, 2.6, 3.0, 0], segments))
    # nozzle: tube revolved around its own axis, then laid along +X
    L = nozzle_len
    ro = nozzle_d / 2.0
    rb = 1.15
    zn = zh0 + head_h * 0.58
    M = (Matrix.Rotation(math.radians(nozzle_angle), 4, "Z") @ Matrix.Translation(((Rh - 3.0) * MM, 0, zn * MM))
         @ Matrix.Rotation(math.radians(90), 4, "Y"))
    nz, _, _ = _revolve_ctrl(name + "_nozzle", [(rb, 0.0), (ro, 0.0), (ro * 0.9, L), (rb, L)], [0.2, 0.2, 0.9, 0.35],
                             coll, [material(mats.get("nozzle") or mats["head"])], segments=64, closed=True, transform=M)
    prod.add("nozzle", nz)
    if dip_tube and mats.get("dip_tube"):
        rdt = 1.9
        prod.add("dip_tube", _solid(name + "_dip_tube", coll, [material(mats["dip_tube"])],
                                    [(0.0, info["base_t"] + 1.6), (rdt, info["base_t"] + 1.6), (rdt, z1 - 1.0), (0.0, z1 - 1.0)],
                                    [0, 0.8, 0.0, 0], 48))
    prod.height = zh1 * MM
    return prod


def make_mist(name="mist", d=40.0, h=106.0, shoulder_r=7.0, neck_d=17.0, neck_h=8.0, wall=2.4, base_t=6.5,
              neck_wall=2.2, shoulder="round", shoulder_angle=32.0, punt=0.8, base_r=2.5,
              ferrule_d=20.0, ferrule_h=9.5, ferrule_ribs=None, actuator_d=12.5, actuator_h=11.0,
              overcap=True, overcap_d=27.0, overcap_h=42.0, overcap_wall=1.4, overcap_top_r=3.5,
              fill=0.8, dip_tube=True, flutes=None, segments=160, materials=None):
    """Fine-mist spray bottle: body + liquid, crimped ferrule, actuator with orifice, optional overcap."""
    prod = Product("mist", name)
    mats = _mats_for("mist", materials)
    info = _glass_bottle(prod, d, h, shoulder_r, neck_d, neck_h, wall, base_t, neck_wall, shoulder, shoulder_angle,
                         punt, base_r, flutes, segments, mats["body"], mats["liquid"], fill)
    coll = prod.coll
    rn = info["rn"]
    prof_mm = [(r / MM, z / MM) for r, z in prod.body_profile]
    z0 = rest_height(prof_mm, rn + 0.3) + 0.3
    z1 = z0 + ferrule_h
    prod.add("ferrule", _closure_shell(name + "_ferrule", coll, [material(mats["ferrule"])], rn + 0.3, ferrule_d / 2.0,
                                       z0, ferrule_h, 2.6, 1.4, segments, top_r=1.2, bottom_r=0.4, ribs=ferrule_ribs))
    Ra = actuator_d / 2.0
    za0 = z1 + 1.2
    za1 = za0 + actuator_h
    prod.add("stem", _solid(name + "_stem", coll, [material(mats["actuator"])],
                            [(0.0, z1 - 1.0), (2.1, z1 - 1.0), (2.1, za0 + 1.0), (0.0, za0 + 1.0)], [0, 0.2, 0.2, 0], 64))
    prod.add("actuator", _solid(name + "_actuator", coll, [material(mats["actuator"])],
                                [(0.0, za0), (Ra, za0), (Ra, za1), (0.0, za1)], [0, 0.6, 2.4, 0], segments))
    zo = za0 + actuator_h * 0.56
    M = Matrix.Translation((0, (-Ra + 0.25) * MM, zo * MM)) @ Matrix.Rotation(math.radians(90), 4, "X")
    orf, _, _ = _revolve_ctrl(name + "_orifice", [(0.0, 0.0), (0.55, 0.0), (0.55, 0.35), (0.0, 0.35)], [0, 0.1, 0.1, 0],
                              coll, [material(mats["orifice"])], segments=32, transform=M)
    prod.add("orifice", orf)
    top = za1
    if overcap:
        Ro = overcap_d / 2.0
        zc0 = rest_height(prof_mm, Ro - overcap_wall) + 0.25
        zc1 = zc0 + overcap_h
        pts = [(0.0, zc1 - 2.0), (Ro - overcap_wall, zc1 - 2.0), (Ro - overcap_wall, zc0), (Ro, zc0), (Ro, zc1), (0.0, zc1)]
        rad = [0.0, 1.2, 0.35, 0.5, overcap_top_r, 0.0]
        prod.add("overcap", _solid(name + "_overcap", coll, [material(mats["overcap"])], pts, rad, segments))
        top = max(top, zc1)
    if dip_tube and mats.get("dip_tube"):
        prod.add("dip_tube", _solid(name + "_dip_tube", coll, [material(mats["dip_tube"])],
                                    [(0.0, info["base_t"] + 1.6), (1.4, info["base_t"] + 1.6), (1.4, z1 - 1.0), (0.0, z1 - 1.0)],
                                    [0, 0.6, 0.0, 0], 48))
    prod.height = top * MM
    return prod


def make_cylinder(name="cylinder", d=40.0, h=128.0, shoulder_r=3.5, neck_d=22.0, neck_h=11.0, wall=2.4, base_t=7.0,
                  neck_wall=2.4, shoulder="round", shoulder_angle=32.0, punt=0.8, base_r=2.0,
                  cap_d=30.0, cap_h=32.0, cap_top_r=1.8, cap_bottom_r=0.6, cap_ribs=None, fill=0.86, flutes=None,
                  segments=160, materials=None):
    """Tall cylinder bottle (oils, toners, essences) with a screw cap."""
    prod = Product("cylinder", name)
    mats = _mats_for("cylinder", materials)
    info = _glass_bottle(prod, d, h, shoulder_r, neck_d, neck_h, wall, base_t, neck_wall, shoulder, shoulder_angle,
                         punt, base_r, flutes, segments, mats["body"], mats["liquid"], fill)
    rn = info["rn"]
    Rc = cap_d / 2.0
    zb = rest_height([(r / MM, z / MM) for r, z in prod.body_profile], rn + 0.4) + 0.35
    prod.add("cap", _closure_shell(name + "_cap", prod.coll, [material(mats["cap"])], rn + 0.4, Rc, zb, cap_h, 0.0,
                                   3.0, segments, top_r=cap_top_r, bottom_r=cap_bottom_r, ribs=cap_ribs))
    prod.anchors["cap_top"] = (0.0, 0.0, (zb + cap_h) * MM, (Rc - cap_top_r) * MM)
    prod.height = (zb + cap_h) * MM
    return prod


def make_jar(name="jar", d=64.0, body_h=40.0, neck_h=7.0, neck_inset=2.8, bottom=11.0, neck_wall=4.5,
             base_r=4.0, shoulder_r=1.2, punt=0.6, lid_d=None, lid_h=22.0, lid_top_r=2.8, lid_bottom_r=0.8,
             lid_wall=2.2, lid_top_t=3.0, lid_ribs=None, lid="on", fill=0.9, swirl=True, segments=180, materials=None):
    """Wide cream jar: very thick glass/ceramic base, cream fill (with a swirl when open), lid.
    Side wall = neck_inset + neck_wall (7.3 mm by default); bottom = base thickness.
    lid = "on" | "off" | "beside" (upside-down next to the jar)."""
    prod = Product("jar", name)
    mats = _mats_for("jar", materials)
    coll = prod.coll
    R = d / 2.0
    rn = R - neck_inset
    rc = rn - neck_wall
    zt = body_h + neck_h
    lip = 1.4
    outer = [(0.0, punt), (R * 0.86, 0.0), (R, 0.0), (R, body_h), (rn, body_h), (rn, zt)]
    orad = [0.0, 2.5, base_r, shoulder_r, 0.5, lip]
    inner = [(rc, zt), (rc, bottom), (0.0, bottom + punt * 0.5)]
    irad = [lip, 6.0, 0.0]
    pts_m, rad_m = _ctrl_mm(outer + inner, orad + irad)
    tags = ["outer"] * len(outer) + ["inner"] * len(inner)
    prof, ptags = fillet(pts_m, rad_m, tags=tags)
    om, im = glass_pair(mats["body"])
    prod.add("body", revolve(name + "_body", prof, coll, segments=segments, tags=ptags, mats=[om, im],
                             slot_of={"outer": 0, "inner": 1}))
    prod.body_profile = [p for p, t in zip(prof, ptags) if t == "outer"]
    prod.label_band = ((base_r + 2.0) * MM, (body_h - shoulder_r - 1.5) * MM)
    prod.radius = R * MM
    if mats.get("contents") and fill > 0:
        zf = bottom + fill * (zt - bottom)
        ro = rc + OVERLAP / MM
        pts = [(0.0, bottom + punt * 0.5 - 0.08), (ro, bottom - 0.08), (ro, zf), (0.0, zf + 0.6)]
        rad = [0.0, 6.0, 2.2, 0.0]
        deform = None
        if swirl and lid != "on":
            amp, pitch = 1.6, 5.5

            def deform(x, y, z, tag, k, _zf=zf * MM, _rc=rc * MM):
                r = np.sqrt(x * x + y * y)
                th = np.arctan2(y, x)
                top = np.clip((z - (_zf - 1.5 * MM)) / (2.1 * MM), 0.0, 1.0)
                env = np.clip(1.0 - r / _rc, 0.0, 1.0)
                peak = 2.4 * MM * env ** 2.2
                spiral = amp * MM * np.sin(2 * np.pi * r / (pitch * MM) + th) * np.sin(np.pi * np.clip(r / _rc, 0, 1)) ** 1.2
                return x, y, z + top * (peak + spiral * 0.5)
        ob, cprof, _ = _revolve_ctrl(name + "_contents", pts, rad, coll, [material(mats["contents"])], segments=segments,
                                     deform=deform, step_deg=3.0)
        if deform is not None:
            # densify the top so the swirl reads: rebuild with many rings across the surface
            bpy.data.objects.remove(ob)
            ctrl, crad = _ctrl_mm(pts, rad)
            p2, _ = fillet(ctrl, crad, step_deg=3.0)
            dense = []
            for i in range(len(p2) - 1):
                a, b = p2[i], p2[i + 1]
                n = max(1, int(math.hypot(b[0] - a[0], b[1] - a[1]) / (0.5 * MM)))
                for k in range(n):
                    dense.append((a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n))
            dense.append(p2[-1])
            ob = revolve(name + "_contents", dense, coll, segments=segments, mats=[material(mats["contents"])], deform=deform)
        prod.add("contents", ob)
    RL = (lid_d / 2.0) if lid_d else R + 0.25
    if lid in ("on", "beside"):
        zb = body_h + 0.3
        zl = zb + lid_h
        if zl - lid_top_t < zt + 0.5:
            zl = zt + 0.5 + lid_top_t
        pts = [(0.0, zl - lid_top_t), (RL - lid_wall, zl - lid_top_t), (RL - lid_wall, zb), (RL, zb), (RL, zl), (0.0, zl)]
        rad = [0.0, 1.0, 0.4, lid_bottom_r, lid_top_r, 0.0]
        tags = ["under", "inside", "bottom", "side", "top", "top"]
        rb = _ribs_m(lid_ribs, (zb + 1.5) * MM, (zl - lid_top_r - 0.5) * MM, tags=("side",)) if lid_ribs else None
        T = None
        if lid == "beside":
            T = Matrix.Translation(((R + RL + 8.0) * MM, 6.0 * MM, zl * MM)) @ Matrix.Rotation(math.pi, 4, "X")
        lob, _, _ = _revolve_ctrl(name + "_lid", pts, rad, coll, [material(mats["lid"])], segments=segments, tags=tags,
                                  ribs=rb, transform=T)
        prod.add("lid", lob)
        if lid == "on":
            prod.anchors["lid_top"] = (0.0, 0.0, zl * MM, (RL - lid_top_r) * MM)
            prod.height = zl * MM
        else:
            prod.height = zt * MM
    else:
        prod.height = zt * MM
    return prod


def _ellipse_perimeter(a, b):
    return math.pi * (3 * (a + b) - math.sqrt(max((3 * a + b) * (a + 3 * b), 0.0)))


def _solve_a(b, perim):
    lo, hi = b, perim / 2.0
    for _ in range(60):
        mid = 0.5 * (lo + hi)
        if _ellipse_perimeter(mid, b) < perim:
            lo = mid
        else:
            hi = mid
    return 0.5 * (lo + hi)


def make_tube(name="tube", d=36.0, length=150.0, cap_d=None, cap_h=18.0, cap_floor_r=1.6, cap_join_r=0.6,
              cap_ribs=None, shoulder_h=5.0, crimp_h=9.0, flat_start=0.3, end_thickness=0.9, segments=128,
              rings=120, materials=None, print_spec=None):
    """Squeeze tube standing on its cap: round-to-flat lofted body (constant perimeter), crimped seal,
    shoulder and cap. The body's UVs run u: around (0.5 = front centre), v: 0..1 shoulder -> crimp,
    which ``print_spec`` uses to print artwork directly on the tube."""
    prod = Product("tube", name)
    mats = _mats_for("tube", materials)
    coll = prod.coll
    R = d / 2.0
    Rc = (cap_d or d) / 2.0
    rnk = R * 0.42
    zb0 = cap_h + shoulder_h
    zc = length - crimp_h
    cap_m = material(mats["cap"])
    rb = _ribs_m(cap_ribs, (cap_floor_r + 0.8) * MM, (cap_h - cap_join_r - 0.8) * MM, tags=("side",)) if cap_ribs else None
    prod.add("cap", _solid(name + "_cap", coll, [cap_m], [(0.0, 0.0), (Rc, 0.0), (Rc, cap_h), (0.0, cap_h)],
                           [0.0, cap_floor_r, cap_join_r, 0.0], segments, tags=["bottom", "side", "top", "top"], ribs=rb))
    sh_m = material(mats.get("shoulder") or mats["body"]) if not print_spec else None
    # body loft
    perim = 2 * math.pi * R * MM
    b_end = end_thickness / 2.0 * MM
    M = segments
    phis = np.pi / 2 + 2 * np.pi * np.arange(M) / M
    ring_pts, ring_u, zs_list = [], [], []
    ks = np.linspace(0.0, 1.0, rings)
    for t in ks:
        u = min(max((t - flat_start) / (1.0 - flat_start), 0.0), 1.0)
        s = u * u * u * (u * (u * 6 - 15) + 10)
        s = s ** 0.85
        b = R * MM * (1 - s) + b_end * s
        a = _solve_a(b, perim)
        x, y = a * np.cos(phis), b * np.sin(phis)
        ring_pts.append((x, y))
        z = (zb0 + t * (zc - zb0)) * MM
        zs_list.append(z)
    a_end, b_e = ring_pts[-1][0].max(), b_end
    for zz, bscale in ((zc + 0.6, 1.0), (zc + crimp_h * 0.5, 1.0), (length - 0.45, 1.0), (length - 0.12, 0.55), (length, 0.25)):
        ring_pts.append((a_end * np.cos(phis) * (1 if bscale > 0.5 else 0.998), b_e * bscale * np.sin(phis)))
        zs_list.append(zz * MM)
    verts = []
    uvs_ring = []
    for (x, y), z in zip(ring_pts, zs_list):
        verts.extend(zip(x.tolist(), y.tolist(), [z] * M))
        seg = np.hypot(np.diff(np.append(x, x[0])), np.diff(np.append(y, y[0])))
        cum = np.concatenate([[0.0], np.cumsum(seg)])
        uvs_ring.append(cum / cum[-1])
    n_r = len(ring_pts)
    vcoord = [(z / MM - zb0) / (zc - zb0) for z in zs_list]
    faces, uvs = [], []
    for k in range(n_r - 1):
        A, B = k * M, (k + 1) * M
        for j in range(M):
            j1 = (j + 1) % M
            faces.append((A + j, A + j1, B + j1, B + j))
            ua0, ua1 = uvs_ring[k][j], uvs_ring[k][j + 1]
            ub0, ub1 = uvs_ring[k + 1][j], uvs_ring[k + 1][j + 1]
            uvs.extend(((ua0, vcoord[k]), (ua1, vcoord[k]), (ub1, vcoord[k + 1]), (ub0, vcoord[k + 1])))
    c0 = len(verts)
    verts.append((0.0, 0.0, zs_list[0]))
    c1 = len(verts)
    verts.append((0.0, 0.0, zs_list[-1]))
    top = (n_r - 1) * M
    for j in range(M):
        j1 = (j + 1) % M
        faces.append((c0, j1, j))
        uvs.extend(((0.5, vcoord[0]), (uvs_ring[0][j + 1], vcoord[0]), (uvs_ring[0][j], vcoord[0])))
        faces.append((top + j, top + j1, c1))
        uvs.extend(((uvs_ring[-1][j], vcoord[-1]), (uvs_ring[-1][j + 1], vcoord[-1]), (0.5, vcoord[-1])))
    body_mat = material(mats["body"])
    if print_spec:
        body_mat = _tube_print_material(name + "_print", mats["body"], print_spec, perim / MM, zb0, zc)
    body = _mesh_object(name + "_body", verts, faces, coll, uvs=uvs, mats=[body_mat], sharp_deg=60.0)
    prod.add("body", body)
    # shoulder (round dome from the neck to the body)
    pts = [(0.0, cap_h - 1.0), (rnk, cap_h - 1.0), (rnk, cap_h + 0.8), (R, zb0), (R, zb0 + 0.3), (0.0, zb0 + 0.3)]
    rad = [0.0, 0.2, 1.0, 2.5, 0.0, 0.0]
    prod.add("shoulder", _solid(name + "_shoulder", coll, [sh_m or material(mats["body"])], pts, rad, segments))
    prod.crimp = (zc * MM, length * MM)
    prod.height = length * MM
    prod.radius = a_end
    prod.label_band = (zb0 * MM, zc * MM)
    return prod


def make_stick(name="stick", d=22.0, h=78.0, cap_h=30.0, seam=0.35, top_r=2.0, base_r=1.2, segments=128, materials=None):
    """Balm / lipstick-style twist stick: base tube and cap with a fine seam."""
    prod = Product("stick", name)
    mats = _mats_for("stick", materials)
    R = d / 2.0
    zsplit = h - cap_h
    prod.add("base", _solid(name + "_base", prod.coll, [material(mats["base"])],
                            [(0.0, 0.0), (R, 0.0), (R, zsplit), (0.0, zsplit)], [0, base_r, 0.35, 0], segments))
    prod.add("cap", _solid(name + "_cap", prod.coll, [material(mats["cap"])],
                           [(0.0, zsplit + seam), (R, zsplit + seam), (R, h), (0.0, h)], [0, 0.35, top_r, 0], segments))
    prod.body_profile = [(R * MM, 0.0), (R * MM, zsplit * MM)]
    prod.label_band = (base_r * MM + 2 * MM, (zsplit - 2) * MM)
    prod.anchors["cap_top"] = (0.0, 0.0, h * MM, (R - top_r) * MM)
    prod.height = h * MM
    prod.radius = R * MM
    return prod


def make_compact(name="compact", d=72.0, h=16.0, split=0.48, top_r=3.0, base_r=2.0, seam=0.4, segments=180, materials=None):
    """Round compact: base and domed-edge lid with a fine seam; decal anchor on the lid."""
    prod = Product("compact", name)
    mats = _mats_for("compact", materials)
    R = d / 2.0
    zs = h * split
    prod.add("base", _solid(name + "_base", prod.coll, [material(mats["base"])],
                            [(0.0, 0.0), (R, 0.0), (R, zs), (0.0, zs)], [0, base_r, 0.4, 0], segments))
    prod.add("lid", _solid(name + "_lid", prod.coll, [material(mats["lid"])],
                           [(0.0, zs + seam), (R, zs + seam), (R, h), (0.0, h)], [0, 0.4, top_r, 0], segments))
    prod.anchors["lid_top"] = (0.0, 0.0, h * MM, (R - top_r) * MM)
    prod.body_profile = [(R * MM, 0.0), (R * MM, h * MM)]
    prod.label_band = (base_r * MM, (h - top_r) * MM)
    prod.height = h * MM
    prod.radius = R * MM
    return prod


GENERATORS = {
    "dropper": make_dropper, "pump": make_pump, "mist": make_mist, "cylinder": make_cylinder,
    "jar": make_jar, "tube": make_tube, "stick": make_stick, "compact": make_compact,
}


# =============================================================================================
# labels and printing
# =============================================================================================

INKS = {"white": "#F5F2ED", "black": "#211E1C", "espresso": "#3A2F29", "gold": "#E7C98F"}


def _load_image(path):
    img = bpy.data.images.load(os.path.abspath(path), check_existing=True)
    img.colorspace_settings.name = "sRGB"
    img.alpha_mode = "STRAIGHT"
    return img


def _ink_bsdf(nt, mode, tex, ink="#2E2925", foil="gold", roughness=None, emboss=0.25):
    p = nt.new("ShaderNodeBsdfPrincipled")
    if mode == "foil":
        col = METALS.get(foil, foil) if isinstance(foil, str) else foil
        _p(p, base=col, metallic=1.0, roughness=0.14 if roughness is None else roughness)
    elif mode == "print":
        _p(p, base=tex.outputs["Color"], roughness=0.38 if roughness is None else roughness, specular=0.5)
    else:
        _p(p, base=INKS.get(ink, ink), roughness=0.42 if roughness is None else roughness, specular=0.5)
    if emboss:
        b = nt.new("ShaderNodeBump")
        b.inputs["Strength"].default_value = emboss
        b.inputs["Distance"].default_value = 0.00004
        nt.link(tex.outputs["Alpha"], b.inputs["Height"])
        nt.link(b.outputs[0], p.inputs["Normal"])
    return p


def label_material(name, image, mode="ink", ink="#2E2925", foil="gold", roughness=None, paper="#F4EFE8",
                   opacity=1.0, emboss=0.25):
    """Material for a label sleeve or decal.
    mode: 'ink' (one-colour screen print from the image alpha), 'print' (full-colour ink from the image),
    'foil' (hot-foil metal from the alpha) or 'paper' (opaque paper label, white on the back)."""
    img = _load_image(image)
    m = _new_material(name)
    nt = _NT(m)
    nt.nodes.remove(nt.bsdf)
    tex = nt.new("ShaderNodeTexImage", image=img, interpolation="Cubic", extension="CLIP")
    alpha = tex.outputs["Alpha"]
    if opacity != 1.0:
        alpha = _math(nt, "MULTIPLY", alpha, opacity)
    tr = nt.new("ShaderNodeBsdfTransparent")
    if mode == "paper":
        geo = nt.new("ShaderNodeNewGeometry")
        col = _mix_rgb(nt, geo.outputs["Backfacing"], tex.outputs["Color"], rgba(paper))
        p = nt.new("ShaderNodeBsdfPrincipled")
        _p(p, base=col, roughness=0.55 if roughness is None else roughness, specular=0.4)
        n = nt.new("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = 2500.0
        tc = nt.new("ShaderNodeTexCoord")
        nt.link(tc.outputs["Object"], n.inputs["Vector"])
        b = nt.new("ShaderNodeBump")
        b.inputs["Strength"].default_value = 0.05
        b.inputs["Distance"].default_value = 0.00003
        nt.link(n.outputs["Factor"], b.inputs["Height"])
        nt.link(b.outputs[0], p.inputs["Normal"])
        surf = p
    else:
        surf = _ink_bsdf(nt, mode, tex, ink, foil, roughness, emboss)
    mix = nt.new("ShaderNodeMixShader")
    nt.link(alpha, mix.inputs["Fac"])
    nt.link(tr.outputs[0], mix.inputs[1])
    nt.link(surf.outputs[0], mix.inputs[2])
    nt.link(mix.outputs[0], nt.out.inputs["Surface"])
    return m, img


def add_label(prod, image, mode="ink", z_mm=None, height_mm=None, arc_deg=None, angle_deg=0.0, offset_mm=0.05,
              thickness_mm=0.12, ink="#2E2925", foil="gold", roughness=None, paper="#F4EFE8", opacity=1.0, emboss=0.25,
              name=None):
    """Wrap a PNG (with alpha) around a product body as a conforming sleeve.

    The sleeve follows the body's outer profile between z_mm +- height_mm/2 (measured from the base),
    centred on angle_deg (0 = facing -Y / camera). If arc_deg is omitted it is derived from the image
    aspect ratio so the artwork is never stretched. Modes: see label_material()."""
    if prod.body_profile is None:
        raise ValueError(f"{prod.kind} has no wrap surface; use add_decal()")
    mat, img = label_material(name or f"{prod.name}_label", image, mode, ink, foil, roughness, paper, opacity, emboss)
    w, h = img.size
    aspect = w / max(h, 1)
    zb0, zb1 = prod.label_band
    height = (height_mm * MM) if height_mm else 0.62 * (zb1 - zb0)
    zc = (z_mm * MM) if z_mm is not None else 0.5 * (zb0 + zb1)
    z0, z1 = zc - height / 2, zc + height / 2
    nz = max(8, int(height / (0.4 * MM)))
    zs = np.linspace(z0, z1, nz + 1)
    rs = np.array([profile_radius_at(prod.body_profile, z) for z in zs]) + offset_mm * MM
    if np.any(rs <= offset_mm * MM + 1e-6):
        raise ValueError(f"label band {z0 / MM:.1f}-{z1 / MM:.1f} mm leaves the body of {prod.name}")
    s = np.concatenate([[0.0], np.cumsum(np.hypot(np.diff(rs), np.diff(zs)))])
    S = s[-1]
    rmid = float(rs[len(rs) // 2])
    arc = math.radians(arc_deg) if arc_deg else S * aspect / rmid
    if arc > math.radians(350):
        _log(f"warning: label on {prod.name} wraps {math.degrees(arc):.0f} deg; clamped to 350")
        arc = math.radians(350)
    nu = max(24, int(math.degrees(arc) / 0.8))
    thc = -math.pi / 2 + math.radians(angle_deg)
    ths = thc - arc / 2 + arc * np.arange(nu + 1) / nu
    verts, faces, uvs = [], [], []
    for i in range(nz + 1):
        for j in range(nu + 1):
            verts.append((rs[i] * math.cos(ths[j]), rs[i] * math.sin(ths[j]), zs[i]))
    for i in range(nz):
        for j in range(nu):
            a, b = i * (nu + 1) + j, (i + 1) * (nu + 1) + j
            faces.append((a, a + 1, b + 1, b))
            uvs.extend(((j / nu, s[i] / S), ((j + 1) / nu, s[i] / S), ((j + 1) / nu, s[i + 1] / S), (j / nu, s[i + 1] / S)))
    ob = _mesh_object(name or f"{prod.name}_label", verts, faces, collection("Labels"), uvs=uvs, mats=[mat], sharp_deg=None)
    if mode == "paper" and thickness_mm > 0:
        so = ob.modifiers.new("paper", "SOLIDIFY")
        so.thickness = thickness_mm * MM
        so.offset = 1.0
        so.use_rim = True
        so.use_even_offset = True
    ob.parent = prod.root
    prod.labels.append(ob)
    return ob


def add_decal(prod, image, anchor=None, center_mm=(0.0, 0.0, 0.0), width_mm=None, normal="+Z", rotation_deg=0.0,
              mode="ink", offset_mm=0.05, ink="#2E2925", foil="gold", roughness=None, paper="#F4EFE8", emboss=0.25,
              name=None):
    """Flat label / print (jar lids, cap tops, compacts, tube fronts). ``anchor`` names a product spot
    ('lid_top', 'cap_top'); otherwise centre_mm is in product space. normal: '+Z' or '-Y' (front)."""
    mat, img = label_material(name or f"{prod.name}_decal", image, mode, ink, foil, roughness, paper, 1.0, emboss)
    w, h = img.size
    if anchor:
        if anchor not in prod.anchors:
            raise KeyError(f"{prod.name} has no anchor '{anchor}' (has {list(prod.anchors)})")
        ax, ay, az, ar = prod.anchors[anchor]
        c = Vector((ax, ay, az))
        width = (width_mm * MM) if width_mm else ar * 1.6
    else:
        c = Vector(center_mm) * MM
        width = (width_mm or 20.0) * MM
    height = width * h / max(w, 1)
    v = [(-width / 2, -height / 2, 0), (width / 2, -height / 2, 0), (width / 2, height / 2, 0), (-width / 2, height / 2, 0)]
    ob = _mesh_object(name or f"{prod.name}_decal", v, [(0, 1, 2, 3)], collection("Labels"),
                      uvs=[(0, 0), (1, 0), (1, 1), (0, 1)], mats=[mat], sharp_deg=None)
    R = Matrix.Rotation(math.radians(rotation_deg), 4, "Z")
    if normal == "-Y":
        R = Matrix.Rotation(math.radians(90), 4, "X") @ R
    ob.matrix_world = Matrix.Translation(c + Vector((0, 0, offset_mm * MM)) if normal == "+Z" else c + Vector((0, -offset_mm * MM, 0))) @ R
    ob.parent = prod.root
    prod.labels.append(ob)
    return ob


def _tube_print_material(name, body_spec, spec, perim_mm, zb0, zc):
    """Tube body material with artwork printed through the body UVs (u around, v along)."""
    p = dict(spec)
    img = _load_image(p["image"])
    w, h = img.size
    height = p.get("height_mm", 0.45 * (zc - zb0))
    zc_mm = p.get("z_mm", zb0 + 0.42 * (zc - zb0))
    width = p.get("width_mm", height * w / max(h, 1))
    du = width / perim_mm
    v0 = (zc_mm - height / 2 - zb0) / (zc - zb0)
    dv = height / (zc - zb0)
    u0 = 0.5 + p.get("angle_deg", 0.0) / 360.0 - du / 2
    base = _resolve(body_spec)
    m = _new_material(name)
    nt = _NT(m)
    nt.nodes.remove(nt.bsdf)
    bp = nt.new("ShaderNodeBsdfPrincipled")
    _p(bp, base=base.get("color", "#EDE6DC"), roughness=base.get("roughness", 0.5), sheen=base.get("sheen", 0.0),
       sheen_roughness=0.45, specular=base.get("specular", 0.5), coat=base.get("coat", 0.0), coat_roughness=0.04)
    uv = nt.new("ShaderNodeUVMap")
    sub = nt.new("ShaderNodeVectorMath", operation="SUBTRACT")
    nt.link(uv.outputs[0], sub.inputs[0])
    sub.inputs[1].default_value = (u0, v0, 0.0)
    div = nt.new("ShaderNodeVectorMath", operation="DIVIDE")
    nt.link(sub.outputs[0], div.inputs[0])
    div.inputs[1].default_value = (du, dv, 1.0)
    tex = nt.new("ShaderNodeTexImage", image=img, interpolation="Cubic", extension="CLIP")
    nt.link(div.outputs[0], tex.inputs["Vector"])
    mode = p.get("mode", "ink")
    ink = _ink_bsdf(nt, mode, tex, p.get("ink", "#2E2925"), p.get("foil", "gold"), p.get("roughness"), p.get("emboss", 0.15))
    mix = nt.new("ShaderNodeMixShader")
    nt.link(tex.outputs["Alpha"], mix.inputs["Fac"])
    nt.link(bp.outputs[0], mix.inputs[1])
    nt.link(ink.outputs[0], mix.inputs[2])
    # crimp ridges: fine horizontal lines above v = 1
    sep = nt.new("ShaderNodeSeparateXYZ")
    nt.link(uv.outputs[0], sep.inputs[0])
    _add_crimp_bump(nt, sep.outputs[1], [bp, ink])
    nt.link(mix.outputs[0], nt.out.inputs["Surface"])
    return m


def _add_crimp_bump(nt, v_socket, bsdfs):
    in_crimp = _maprange(nt, v_socket, 1.01, 1.03, 0.0, 1.0)
    ridges = _math(nt, "SINE", _math(nt, "MULTIPLY", v_socket, 520.0))
    b = nt.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.35
    b.inputs["Distance"].default_value = 0.0002
    nt.link(_math(nt, "MULTIPLY", ridges, in_crimp), b.inputs["Height"])
    for p in bsdfs:
        if not p.inputs["Normal"].is_linked:
            nt.link(b.outputs[0], p.inputs["Normal"])


# =============================================================================================
# studio: backdrop, world, lights, sun + gobo
# =============================================================================================

def add_sweep(color="#EAE2D8", wall_color=None, width_mm=6000.0, floor_mm=3000.0, height_mm=2500.0, radius_mm=700.0,
              wall_y_mm=700.0, roughness=0.92, grain=0.0, center_x_mm=0.0):
    """Seamless paper sweep: floor curving up into a back wall at y = wall_y_mm."""
    coll = collection("Studio")
    wy, r, H = wall_y_mm * MM, radius_mm * MM, height_mm * MM
    prof = [(wy - r - floor_mm * MM, 0.0), (wy - r, 0.0)]
    for i in range(1, 48):
        a = -math.pi / 2 + (math.pi / 2) * i / 48
        prof.append((wy - r + r * math.cos(a), r + r * math.sin(a)))
    prof += [(wy, r), (wy, H)]
    xs = np.linspace(-width_mm / 2, width_mm / 2, 9) * MM + center_x_mm * MM
    verts = [(x, y, z) for (y, z) in prof for x in xs]
    nx = len(xs)
    faces = []
    for k in range(len(prof) - 1):
        for i in range(nx - 1):
            a, b = k * nx + i, (k + 1) * nx + i
            faces.append((a, a + 1, b + 1, b))
    m = material({"kind": "backdrop", "color": color, "wall_color": wall_color, "roughness": roughness,
                  "blend_lo": 0.0, "blend_hi": r * 1.1, "grain": grain})
    ob = _mesh_object("sweep", verts, faces, coll, mats=[m], sharp_deg=None)
    return ob


def add_floor(color="#EAE2D8", size_mm=8000.0, roughness=0.92, shadow_catcher=False):
    coll = collection("Studio")
    s = size_mm * MM / 2
    m = material({"kind": "backdrop", "color": color, "roughness": roughness})
    ob = _mesh_object("floor", [(-s, -s, 0), (s, -s, 0), (s, s, 0), (-s, s, 0)], [(0, 1, 2, 3)], coll, mats=[m], sharp_deg=None)
    if shadow_catcher:
        ob.is_shadow_catcher = True
    return ob


def set_world(color="#6F6A66", strength=0.08, hdri=None, hdri_strength=0.4, hdri_rotation_deg=0.0, camera_color=None):
    """World light: flat colour, optionally plus one of Blender's bundled studio HDRIs (reflections)."""
    sc = bpy.context.scene
    w = bpy.data.worlds.new("World")
    sc.world = w
    nt = w.node_tree
    bg = next(n for n in nt.nodes if n.type == "BACKGROUND")
    out = next(n for n in nt.nodes if n.type == "OUTPUT_WORLD")
    bg.inputs["Color"].default_value = rgba(color)
    bg.inputs["Strength"].default_value = strength
    shader = bg.outputs[0]
    if hdri:
        path = hdri
        if not os.path.isfile(path):
            path = os.path.join(bpy.utils.system_resource("DATAFILES", path="studiolights/world"), f"{hdri}.exr")
        env = nt.nodes.new("ShaderNodeTexEnvironment")
        env.image = bpy.data.images.load(path, check_existing=True)
        tc = nt.nodes.new("ShaderNodeTexCoord")
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Rotation"].default_value = (0, 0, math.radians(hdri_rotation_deg))
        nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
        nt.links.new(mp.outputs[0], env.inputs["Vector"])
        bg2 = nt.nodes.new("ShaderNodeBackground")
        bg2.inputs["Strength"].default_value = hdri_strength
        nt.links.new(env.outputs["Color"], bg2.inputs["Color"])
        add = nt.nodes.new("ShaderNodeAddShader")
        nt.links.new(shader, add.inputs[0])
        nt.links.new(bg2.outputs[0], add.inputs[1])
        shader = add.outputs[0]
    if camera_color is not None:
        lp = nt.nodes.new("ShaderNodeLightPath")
        bgc = nt.nodes.new("ShaderNodeBackground")
        bgc.inputs["Color"].default_value = rgba(camera_color)
        mix = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs[0])
        nt.links.new(shader, mix.inputs[1])
        nt.links.new(bgc.outputs[0], mix.inputs[2])
        shader = mix.outputs[0]
    nt.links.new(shader, out.inputs["Surface"])
    return w


def _dir(az_deg, el_deg):
    az, el = math.radians(az_deg), math.radians(el_deg)
    return Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))


def add_area_light(name, target, az_deg, el_deg, dist, size, size_y=None, power=None, irradiance=None, kelvin=5600.0,
                   color=None, spread_deg=180.0, shape="RECTANGLE", glossy=True, white=5600.0):
    """Area light placed on a sphere around ``target`` (metres), aimed at it. az 0 = camera side,
    positive = camera right; el = elevation. Give ``irradiance`` (W/m^2 at the target) or ``power`` (W)."""
    coll = collection("Lights")
    ld = bpy.data.lights.new(name, "AREA")
    ld.shape = shape
    ld.size = size
    ld.size_y = size_y if size_y is not None else size
    if power is None:
        power = (irradiance or 5.0) * math.pi * dist * dist
    ld.energy = power
    ld.color = hex_rgb(color) if color else kelvin_rgb(kelvin, white)
    ld.spread = math.radians(spread_deg)
    ob = bpy.data.objects.new(name, ld)
    coll.objects.link(ob)
    loc = Vector(target) + _dir(az_deg, el_deg) * dist
    ob.location = loc
    ob.rotation_euler = (Vector(target) - loc).to_track_quat("-Z", "Y").to_euler()
    ob.visible_camera = False
    ob.visible_glossy = glossy
    return ob


def add_area_light_at(name, location, aim, size, size_y=None, irradiance=5.0, kelvin=5600.0, color=None,
                      spread_deg=180.0, glossy=False, white=5600.0):
    """Area light at an explicit location (metres) aimed at ``aim``; irradiance is measured at the aim."""
    loc, aim = Vector(location), Vector(aim)
    dist = (aim - loc).length
    ob = add_area_light(name, aim, 0, 0, dist, size, size_y, power=irradiance * math.pi * dist * dist, kelvin=kelvin,
                        color=color, spread_deg=spread_deg, glossy=glossy, white=white)
    ob.location = loc
    ob.rotation_euler = (aim - loc).to_track_quat("-Z", "Y").to_euler()
    return ob


def add_flag(name, target, az_deg, el_deg, dist, size, size_y, color="#0B0B0B"):
    """Black card ('flag' / negative fill): seen only in reflections and refractions, it gives glass and
    metal dark edges that describe their shape. Never seen by the camera, never blocks light."""
    coll = collection("Lights")
    w, h = size / 2, size_y / 2
    m = material({"kind": "plastic", "color": color, "roughness": 0.9, "specular": 0.0})
    ob = _mesh_object(name, [(-w, -h, 0), (w, -h, 0), (w, h, 0), (-w, h, 0)], [(0, 1, 2, 3)], coll, mats=[m], sharp_deg=None)
    loc = Vector(target) + _dir(az_deg, el_deg) * dist
    ob.location = loc
    ob.rotation_euler = (Vector(target) - loc).to_track_quat("Z", "Y").to_euler()
    _set_visibility(ob, camera=False, diffuse=False, glossy=True, transmission=True, shadow=False, volume=False)
    return ob


def add_sun(az_deg=-55.0, el_deg=32.0, strength=4.5, angle_deg=1.2, kelvin=4300.0, white=5600.0):
    coll = collection("Lights")
    ld = bpy.data.lights.new("sun", "SUN")
    ld.energy = strength
    ld.angle = math.radians(angle_deg)
    ld.color = kelvin_rgb(kelvin, white)
    ob = bpy.data.objects.new("sun", ld)
    coll.objects.link(ob)
    d = _dir(az_deg, el_deg)
    ob.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler()
    ob["dir"] = list(d)
    return ob


def _bezier(p0, p1, p2, n):
    t = np.linspace(0, 1, n)[:, None]
    return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t * t * p2


def _stamp(mask, alpha_fn, bbox):
    res = mask.shape[0]
    x0, y0, x1, y1 = [int(v) for v in bbox]
    x0, y0 = max(x0, 0), max(y0, 0)
    x1, y1 = min(x1, res - 1), min(y1, res - 1)
    if x1 <= x0 or y1 <= y0:
        return
    yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1].astype(np.float32)
    a = alpha_fn(xx + 0.5, yy + 0.5)
    np.maximum(mask[y0:y1 + 1, x0:x1 + 1], a, out=mask[y0:y1 + 1, x0:x1 + 1])


def gobo_mask(pattern="leaves", res=1536, seed=1, coverage=1.0, leaf_scale=1.0, panes=(3, 2), slats=14, angle_deg=0.0):
    """Procedural light-blocking mask (1 = blocks light). Patterns: leaves, window, blinds, palm."""
    rng = np.random.default_rng(seed)
    mask = np.zeros((res, res), np.float32)
    if pattern in ("leaves", "palm"):
        nb = max(1, int(round((4 if pattern == "leaves" else 3) * coverage)))
        for _ in range(nb):
            side = rng.integers(4)
            e = rng.uniform(0.1, 0.9)
            starts = [(e, -0.05), (1.05, e), (e, 1.05), (-0.05, e)]
            p0 = np.array(starts[side]) * res
            p2 = np.array([rng.uniform(0.25, 0.75), rng.uniform(0.25, 0.75)]) * res
            mid = (p0 + p2) / 2
            perp = np.array([-(p2 - p0)[1], (p2 - p0)[0]])
            p1 = mid + perp * rng.uniform(-0.35, 0.35)
            path = _bezier(p0, p1, p2, 80)
            sw = 0.0035 * res

            def stem_alpha(xx, yy, path=path, sw=sw):
                d = np.full(xx.shape, 1e9, np.float32)
                for k in range(0, len(path) - 1, 2):
                    a, b = path[k], path[min(k + 2, len(path) - 1)]
                    ab = b - a
                    t = np.clip(((xx - a[0]) * ab[0] + (yy - a[1]) * ab[1]) / max(ab @ ab, 1e-9), 0, 1)
                    d = np.minimum(d, np.hypot(xx - (a[0] + t * ab[0]), yy - (a[1] + t * ab[1])))
                return np.clip(sw - d + 0.5, 0, 1)
            bb = (path[:, 0].min() - sw - 2, path[:, 1].min() - sw - 2, path[:, 0].max() + sw + 2, path[:, 1].max() + sw + 2)
            _stamp(mask, stem_alpha, bb)
            nl = int(rng.integers(12, 20) if pattern == "leaves" else rng.integers(16, 26))
            for i in range(nl):
                t = min(0.999, (i + rng.uniform(0.2, 0.8)) / nl)
                k = int(t * (len(path) - 1))
                pos = path[k]
                tan = path[min(k + 1, len(path) - 1)] - path[max(k - 1, 0)]
                ang = math.atan2(tan[1], tan[0])
                sgn = 1 if i % 2 else -1
                if pattern == "leaves":
                    ang += sgn * rng.uniform(0.45, 0.95)
                    L = rng.uniform(0.075, 0.13) * res * leaf_scale * (1.15 - 0.35 * t)
                    W = L * rng.uniform(0.26, 0.36)
                else:
                    ang += sgn * rng.uniform(1.0, 1.35)
                    L = rng.uniform(0.16, 0.26) * res * leaf_scale
                    W = L * rng.uniform(0.07, 0.1)
                ca, sa = math.cos(ang), math.sin(ang)

                def leaf_alpha(xx, yy, pos=pos, ca=ca, sa=sa, L=L, W=W):
                    dx, dy = xx - pos[0], yy - pos[1]
                    u = (dx * ca + dy * sa) / L
                    v = (-dx * sa + dy * ca) / (W / 2)
                    uc = np.clip(u, 0, 1)
                    shape = np.sin(np.pi * uc ** 0.85) ** 0.8
                    dist = (np.abs(v) - shape) * (W / 2)
                    inside = np.clip(0.5 - dist, 0, 1)
                    ends = np.clip(np.minimum(u, 1 - u) * L + 0.5, 0, 1)
                    return inside * ends
                r = L + 2
                _stamp(mask, leaf_alpha, (pos[0] - r, pos[1] - r, pos[0] + r, pos[1] + r))
    elif pattern == "window":
        cols, rows = panes
        m = np.ones((res, res), np.float32)
        x0, x1, y0, y1 = 0.18 * res, 0.82 * res, 0.12 * res, 0.88 * res
        mull = 0.022 * res
        yy, xx = np.mgrid[0:res, 0:res].astype(np.float32)
        inside = (xx > x0) & (xx < x1) & (yy > y0) & (yy < y1)
        cw, rh = (x1 - x0) / cols, (y1 - y0) / rows
        fx = np.abs(((xx - x0) % cw) - cw / 2) < (cw / 2 - mull / 2)
        fy = np.abs(((yy - y0) % rh) - rh / 2) < (rh / 2 - mull / 2)
        m[inside & fx & fy] = 0.0
        mask = m
    elif pattern == "blinds":
        yy = np.mgrid[0:res, 0:res][0].astype(np.float32)
        per = res / slats
        mask = (((yy % per) / per) < 0.55).astype(np.float32)
    if angle_deg:
        from math import cos, sin
        # rotate by resampling (nearest) around the centre
        a = math.radians(angle_deg)
        yy, xx = np.mgrid[0:res, 0:res].astype(np.float32) - res / 2
        sx = (cos(a) * xx + sin(a) * yy + res / 2).astype(int) % res
        sy = (-sin(a) * xx + cos(a) * yy + res / 2).astype(int) % res
        mask = mask[sy, sx]
    return mask


def add_gobo(sun, target, pattern="leaves", distance_mm=900.0, size_mm=2600.0, seed=1, coverage=1.0, leaf_scale=1.0,
             res=1536, rotation_deg=0.0, cache_dir=None, other_lights=()):
    """Plane between the sun and the scene carrying a procedural alpha mask; invisible to the camera
    and to reflections, it only casts the (sun's) shadow pattern."""
    coll = collection("Gobo")
    key = f"gobo_{pattern}_{seed}_{res}_{coverage:.2f}_{leaf_scale:.2f}"
    path = os.path.join(cache_dir, key + ".png") if cache_dir else None
    if path and os.path.isfile(path):
        img = bpy.data.images.load(path, check_existing=True)
    else:
        mask = gobo_mask(pattern, res, seed, coverage, leaf_scale)
        img = bpy.data.images.new(key, res, res, alpha=True)
        pix = np.ones((res, res, 4), np.float32)
        pix[..., 0] = pix[..., 1] = pix[..., 2] = 1.0 - mask
        pix[..., 3] = mask
        img.pixels.foreach_set(pix.ravel())
        if path:
            os.makedirs(cache_dir, exist_ok=True)
            img.filepath_raw = path
            img.file_format = "PNG"
            img.save()
        else:
            img.pack()
    img.colorspace_settings.name = "Non-Color"
    m = _new_material("gobo")
    nt = _NT(m)
    nt.nodes.remove(nt.bsdf)
    tex = nt.new("ShaderNodeTexImage", image=img, interpolation="Linear", extension="REPEAT")
    tr = nt.new("ShaderNodeBsdfTransparent")
    df = nt.new("ShaderNodeBsdfDiffuse")
    df.inputs["Color"].default_value = (0, 0, 0, 1)
    mix = nt.new("ShaderNodeMixShader")
    nt.link(tex.outputs["Alpha"], mix.inputs["Fac"])
    nt.link(tr.outputs[0], mix.inputs[1])
    nt.link(df.outputs[0], mix.inputs[2])
    nt.link(mix.outputs[0], nt.out.inputs["Surface"])
    s = size_mm * MM / 2
    ob = _mesh_object("gobo", [(-s, -s, 0), (s, -s, 0), (s, s, 0), (-s, s, 0)], [(0, 1, 2, 3)], coll,
                      uvs=[(0, 0), (1, 0), (1, 1), (0, 1)], mats=[m], sharp_deg=None)
    d = Vector(sun["dir"])
    ob.location = Vector(target) + d * distance_mm * MM
    ob.rotation_euler = (d.to_track_quat("Z", "Y") @ Matrix.Rotation(math.radians(rotation_deg), 4, "Z").to_quaternion()).to_euler()
    _set_visibility(ob, camera=False, diffuse=False, glossy=False, transmission=False, shadow=True, volume=False)
    # shadow linking: the gobo blocks only the sun, never the soft lights
    try:
        gc = bpy.data.collections.new("gobo_excluded")
        gc.objects.link(ob)
        gc.collection_objects[0].light_linking.link_state = "EXCLUDE"
        for lo in other_lights:
            lo.light_linking.blocker_collection = gc
    except Exception as exc:  # pragma: no cover - older Blender
        _log("shadow linking unavailable:", exc)
    return ob


LIGHT_PRESETS = {
    # distances/sizes are multiples of the subject scale S (metres); E = irradiance at the subject.
    # "aim": "backdrop" lights sit above the set and light the sweep behind the subject (the glow
    # behind frosted glass and the soft hot-spot that separates product from background).
    "soft_studio": {
        "world": {"color": "#6E6863", "strength": 0.05},
        "lights": [
            {"name": "key", "az": -52, "el": 26, "dist": 5.5, "size": [3.0, 3.6], "E": 8.0, "kelvin": 5300},
            {"name": "strip", "az": -30, "el": 8, "dist": 4.5, "size": [0.32, 3.6], "E": 1.2, "kelvin": 5600},
            {"name": "fill", "az": 62, "el": 14, "dist": 6.0, "size": [4.0, 4.0], "E": 0.9, "kelvin": 5700},
            {"name": "rim_l", "az": -126, "el": 14, "dist": 4.0, "size": [0.5, 4.5], "E": 3.0, "kelvin": 5600},
            {"name": "rim_r", "az": 128, "el": 14, "dist": 4.0, "size": [0.5, 4.5], "E": 2.6, "kelvin": 5600},
            {"name": "top", "az": 0, "el": 80, "dist": 5.0, "size": [3.0, 3.0], "E": 1.0, "kelvin": 5600},
            {"name": "background", "aim": "backdrop", "size": [4.0, 1.8], "E": 6.0, "kelvin": 5500},
        ],
        "flags": [
            {"name": "flag_l", "az": -96, "el": 10, "dist": 2.4, "size": [1.1, 3.2]},
            {"name": "flag_r", "az": 98, "el": 10, "dist": 2.4, "size": [1.1, 3.2]},
        ],
    },
    "high_key": {
        "world": {"color": "#9A9590", "strength": 0.12},
        "lights": [
            {"name": "key", "az": -38, "el": 32, "dist": 5.5, "size": [4.0, 4.5], "E": 7.0, "kelvin": 5600},
            {"name": "fill", "az": 50, "el": 18, "dist": 5.5, "size": [4.5, 4.5], "E": 3.2, "kelvin": 5600},
            {"name": "rim_l", "az": -125, "el": 14, "dist": 4.0, "size": [0.6, 4.5], "E": 2.4, "kelvin": 5600},
            {"name": "rim_r", "az": 125, "el": 14, "dist": 4.0, "size": [0.6, 4.5], "E": 2.4, "kelvin": 5600},
            {"name": "top", "az": 0, "el": 82, "dist": 5.0, "size": [4.0, 4.0], "E": 2.0, "kelvin": 5600},
            {"name": "background", "aim": "backdrop", "size": [4.5, 2.5], "E": 11.0, "kelvin": 5600},
        ],
    },
    "sunlit": {   # soft ambient + fill; pair with "sun" (+ "gobo") for hard warm sunlight
        "world": {"color": "#B8C3CC", "strength": 0.22},
        "lights": [
            {"name": "fill", "az": 25, "el": 18, "dist": 6.0, "size": [4.5, 4.5], "E": 1.2, "kelvin": 6500},
            {"name": "rim_r", "az": 135, "el": 16, "dist": 4.0, "size": [0.6, 4.5], "E": 1.2, "kelvin": 5600},
            {"name": "bounce", "az": -150, "el": 10, "dist": 4.5, "size": [3.0, 3.0], "E": 0.6, "kelvin": 4200},
        ],
        "sun": {"az": -58, "el": 30, "strength": 5.5, "angle": 1.4, "kelvin": 4300},
    },
    "window": {
        "world": {"color": "#8C8C8C", "strength": 0.08},
        "lights": [
            {"name": "window", "az": -78, "el": 22, "dist": 5.0, "size": [3.5, 5.0], "E": 7.5, "kelvin": 6000},
            {"name": "fill", "az": 70, "el": 12, "dist": 6.0, "size": [4.0, 4.0], "E": 1.0, "kelvin": 5200},
            {"name": "rim_r", "az": 130, "el": 14, "dist": 4.0, "size": [0.5, 4.5], "E": 1.4, "kelvin": 5600},
            {"name": "background", "aim": "backdrop", "size": [3.5, 2.2], "E": 3.0, "kelvin": 5600},
        ],
    },
    "dramatic": {
        "world": {"color": "#3A3633", "strength": 0.02},
        "lights": [
            {"name": "key", "az": -60, "el": 25, "dist": 5.0, "size": [1.6, 2.4], "E": 6.0, "kelvin": 5000},
            {"name": "rim_l", "az": -135, "el": 12, "dist": 3.5, "size": [0.35, 4.5], "E": 4.5, "kelvin": 5600},
            {"name": "rim_r", "az": 135, "el": 12, "dist": 3.5, "size": [0.35, 4.5], "E": 4.5, "kelvin": 5600},
        ],
    },
}


def apply_lighting(preset="soft_studio", target=(0, 0, 0.05), scale=0.25, intensity=1.0, mirror=False, kelvin_shift=0.0,
                   lights=None, world=None, sun=None, gobo=None, cache_dir=None, white=5600.0, backdrop=None, flags=None):
    """Build a lighting preset around ``target`` (metres) for a subject of size ``scale`` (metres).
    ``lights``: list of dicts overriding preset lights by name (or adding new ones); ``sun``/``gobo``:
    dicts (or False) overriding the preset's sun; ``world``: dict overriding the world."""
    P = json.loads(json.dumps(LIGHT_PRESETS[preset]))
    for ov in lights or []:
        hit = next((l for l in P["lights"] if l["name"] == ov.get("name")), None)
        if hit is not None:
            if ov.get("enabled", True) is False:
                P["lights"].remove(hit)
            else:
                hit.update(ov)
        elif ov.get("enabled", True) is not False:
            P["lights"].append(dict(ov))
    wspec = dict(P.get("world", {}))
    wspec.update(world or {})
    set_world(**{k: v for k, v in wspec.items() if k in ("color", "strength", "hdri", "hdri_strength", "hdri_rotation_deg", "camera_color")})
    made = []
    for L in P["lights"]:
        sx, sy = L.get("size", [1.0, 1.0])
        if L.get("aim") == "backdrop":
            if not backdrop:
                continue
            t = Vector(target)
            # aim at the point of the cove `phi` degrees up its quarter circle (0 = floor, 90 = wall),
            # i.e. the band of sweep the camera sees *through* the glass, behind the products
            # Glass shows what lies directly *behind* it - mostly the floor just behind the products - so
            # this light pools on the sweep from just behind the products up into the cove.
            R, wy = backdrop["radius"], backdrop["wall_y"]
            back = backdrop.get("back_y", t.y)
            ya = back + L.get("behind", 0.7) * scale
            y0 = wy - R
            za = 0.0 if ya <= y0 else R - math.sqrt(max(R * R - (ya - y0) ** 2, 0.0))
            aim = Vector((t.x + L.get("dx", 0.0) * scale, ya, za))
            loc = Vector((t.x, back + L.get("dy", 0.2) * scale, L.get("h", 3.0) * scale))
            made.append(add_area_light_at(L["name"], loc, aim, sx * scale, sy * scale, L.get("E", 5.0) * intensity,
                                          L.get("kelvin", 5600) + kelvin_shift, L.get("color"), L.get("spread", 180),
                                          glossy=False, white=white))
            continue
        az = -L["az"] if mirror else L["az"]
        made.append(add_area_light(L["name"], target, az, L.get("el", 20), L.get("dist", 5.0) * scale, sx * scale, sy * scale,
                                   power=L.get("power"), irradiance=L.get("E", 2.0) * intensity,
                                   kelvin=L.get("kelvin", 5600) + kelvin_shift, color=L.get("color"),
                                   spread_deg=L.get("spread", 180), shape=L.get("shape", "RECTANGLE"), white=white))
    for F in P.get("flags", []) if flags is not False else []:
        add_flag(F["name"], target, -F["az"] if mirror else F["az"], F.get("el", 10), F.get("dist", 2.4) * scale,
                 F["size"][0] * scale, F["size"][1] * scale, F.get("color", "#0B0B0B"))
    sspec = P.get("sun")
    if sun is False:
        sspec = None
    elif sun:
        sspec = dict(sspec or {"az": -58, "el": 30, "strength": 5.0, "angle": 1.4, "kelvin": 4300})
        sspec.update(sun)
    sun_ob = None
    if sspec:
        az = -sspec.get("az", -58) if mirror else sspec.get("az", -58)
        sun_ob = add_sun(az, sspec.get("el", 30), sspec.get("strength", 5.0) * intensity, sspec.get("angle", 1.4),
                         sspec.get("kelvin", 4300) + kelvin_shift, white)
    if gobo and sun_ob is not None:
        g = dict(gobo)
        k = (scale / 0.25) if g.get("scale_with_scene", False) else 1.0
        add_gobo(sun_ob, target, g.get("pattern", "leaves"), g.get("distance", 650.0) * k, g.get("size", 1500.0) * k,
                 g.get("seed", 1), g.get("coverage", 1.0), g.get("leaf_scale", 1.0), g.get("res", 1536),
                 g.get("rotation", 0.0), cache_dir, other_lights=made)
    return made, sun_ob


# =============================================================================================
# props
# =============================================================================================

class Prop:
    def __init__(self, name, obj, top_z, kind):
        self.name, self.obj, self.top_z, self.kind = name, obj, top_z, kind

    def objects(self):
        return [self.obj] + list(self.obj.children)


def add_plinth(shape="cylinder", d=160.0, h=120.0, w=None, depth=None, edge_r=2.5, material_spec="travertine",
               x=0.0, y=0.0, z=0.0, rot=0.0, name="plinth", arch_t=None):
    """Plinths / pedestals (mm): cylinder (d, h), block (w, depth, h), sphere (d), arch (w, h, depth),
    step (block alias), dome (half sphere, d)."""
    coll = collection("Props")
    m = material(material_spec)
    if shape == "cylinder":
        R = d / 2.0
        ob = _solid(name, coll, [m], [(0.0, 0.0), (R, 0.0), (R, h), (0.0, h)], [0, min(1.0, edge_r), edge_r, 0], 192, step_deg=3.0)
        top = h
    elif shape in ("block", "step"):
        ob = rounded_box_object(name, ((w or d) * MM, (depth or d) * MM, h * MM), edge_r * MM, coll, mats=[m])
        top = h
    elif shape == "sphere":
        ob = uv_sphere_object(name, d / 2 * MM, coll, mats=[m])
        ob.data.transform(Matrix.Translation((0, 0, d / 2 * MM)))
        top = d
    elif shape == "dome":
        R = d / 2.0
        ob = _solid(name, coll, [m], [(0.0, 0.0), (R, 0.0), (0.0001, R)], [0, edge_r, 0], 192, step_deg=2.0)
        prof = [(R * math.cos(a) * MM, R * math.sin(a) * MM) for a in np.linspace(0, math.pi / 2, 48)]
        bpy.data.objects.remove(ob)
        ob = revolve(name, [(0.0, 0.0)] + prof[:-1] + [(0.0, R * MM)], coll, segments=192, mats=[m], sharp_deg=50)
        top = R
    elif shape == "arch":
        W = (w or d)
        r = W / 2.0
        outline = [(-r, 0.0), (r, 0.0), (r, h - r)]
        for a in np.linspace(0, math.pi, 64)[1:-1]:
            outline.append((r * math.cos(a), h - r + r * math.sin(a)))
        outline += [(-r, h - r)]
        ob = extrude_outline_object(name, [(px * MM, pz * MM) for px, pz in outline], (arch_t or depth or 40.0) * MM, coll,
                                    mats=[m], radius=edge_r * MM)
        top = h
    else:
        raise KeyError(f"unknown plinth shape '{shape}'")
    ob.location = (x * MM, y * MM, z * MM)
    ob.rotation_euler = (0, 0, math.radians(rot))
    return Prop(name, ob, (z + top) * MM, "plinth")


def add_glass_sphere(d=60.0, x=0.0, y=0.0, z=0.0, material_spec="glass_clear", name="glass_sphere"):
    coll = collection("Props")
    ob = uv_sphere_object(name, d / 2 * MM, coll, mats=[material(material_spec)], seg=128, rings=64)
    ob.location = (x * MM, y * MM, (z + d / 2) * MM)
    return Prop(name, ob, (z + d) * MM, "sphere")


def add_water(w=900.0, depth=700.0, level=3.0, x=0.0, y=0.0, z=0.0, ripple_center=(0.0, 0.0), ripple_scale=1.0,
              ripple_strength=1.0, caustics=True, tint="#DCD2C6", name="water"):
    """Shallow water surface (a level plane ``level`` mm above z) with rings rippling out from
    ripple_center (mm, world) and an optional fake caustic pattern cast into its shadows."""
    coll = collection("Props")
    m = _new_material("water_surface")
    nt = _NT(m)
    p = nt.bsdf
    # `tint` darkens what is seen through the water a little: the wet-floor cue that makes water read
    _p(p, base=tint or "#FFFFFF", roughness=0.0, ior=1.333, transmission=1.0, specular=0.5)
    tc = nt.new("ShaderNodeTexCoord")
    sub = nt.new("ShaderNodeVectorMath", operation="SUBTRACT")
    nt.link(tc.outputs["Object"], sub.inputs[0])
    sub.inputs[1].default_value = ((ripple_center[0] - x) * MM, (ripple_center[1] - y) * MM, 0.0)
    rings = nt.new("ShaderNodeTexWave", wave_type="RINGS", rings_direction="SPHERICAL", wave_profile="SIN")
    nt.link(sub.outputs[0], rings.inputs["Vector"])
    rings.inputs["Scale"].default_value = 34.0 / ripple_scale
    rings.inputs["Distortion"].default_value = 2.5
    rings.inputs["Detail"].default_value = 1.5
    dist = nt.new("ShaderNodeVectorMath", operation="LENGTH")
    nt.link(sub.outputs[0], dist.inputs[0])
    # a few rings that die out quickly away from the source (a drop's ripple), not a record groove
    fall = _maprange(nt, dist.outputs["Value"], 0.015 * ripple_scale, 0.2 * ripple_scale, 1.0, 0.0, "SMOOTHSTEP")
    micro = nt.new("ShaderNodeTexNoise")
    nt.link(tc.outputs["Object"], micro.inputs["Vector"])
    micro.inputs["Scale"].default_value = 40.0
    micro.inputs["Detail"].default_value = 6.0
    h = _math(nt, "ADD", _math(nt, "MULTIPLY", rings.outputs["Factor"], fall), _math(nt, "MULTIPLY", micro.outputs["Factor"], 0.25))
    b = nt.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.45 * ripple_strength
    b.inputs["Distance"].default_value = 0.0006
    nt.link(h, b.inputs["Height"])
    nt.link(b.outputs[0], p.inputs["Normal"])
    surf = p.outputs[0]
    lp = nt.new("ShaderNodeLightPath")
    tr = nt.new("ShaderNodeBsdfTransparent")
    if caustics:
        # pool-caustic stand-in: a noise-warped Voronoi edge network, fine and soft, cast into the
        # water's own (transparent) shadows so the floor below shimmers
        wn = nt.new("ShaderNodeTexNoise")
        nt.link(tc.outputs["Object"], wn.inputs["Vector"])
        wn.inputs["Scale"].default_value = 18.0
        wn.inputs["Detail"].default_value = 3.0
        wv = nt.new("ShaderNodeVectorMath", operation="SCALE")
        nt.link(wn.outputs["Color"], wv.inputs[0])
        wv.inputs["Scale"].default_value = 0.012
        wco = nt.new("ShaderNodeVectorMath", operation="ADD")
        nt.link(tc.outputs["Object"], wco.inputs[0])
        nt.link(wv.outputs[0], wco.inputs[1])
        vor = nt.new("ShaderNodeTexVoronoi", feature="DISTANCE_TO_EDGE")
        nt.link(wco.outputs[0], vor.inputs["Vector"])
        vor.inputs["Scale"].default_value = 70.0 / ripple_scale
        vor.inputs["Randomness"].default_value = 1.0
        net = _maprange(nt, vor.outputs["Distance"], 0.0, 0.06, 1.0, 0.0, "SMOOTHSTEP")
        tval = _math(nt, "ADD", 0.82, _math(nt, "MULTIPLY", net, 0.4))
        nt.link(_mix_rgb(nt, tval, (0, 0, 0, 1), (1, 1, 1, 1)), tr.inputs["Color"])
    mix = nt.new("ShaderNodeMixShader")
    nt.link(lp.outputs["Is Shadow Ray"], mix.inputs["Fac"])
    nt.link(surf, mix.inputs[1])
    nt.link(tr.outputs[0], mix.inputs[2])
    nt.link(mix.outputs[0], nt.out.inputs["Surface"])
    sx, sy = w / 2 * MM, depth / 2 * MM
    ob = _mesh_object(name, [(-sx, -sy, 0), (sx, -sy, 0), (sx, sy, 0), (-sx, sy, 0)], [(0, 1, 2, 3)], coll, mats=[m], sharp_deg=None)
    ob.location = (x * MM, y * MM, (z + level) * MM)
    return Prop(name, ob, (z + level) * MM, "water")


def add_sprig(kind="olive", length=220.0, x=0.0, y=0.0, z=0.0, rot=0.0, seed=3, leaves=None, name="sprig",
              stem_color="#6B5B45", leaf_material=None):
    """Simple botanical sprig lying on a surface: tapered stem with lens (olive) or round (eucalyptus)
    leaves that curl up slightly. Length in mm along +X before rotation."""
    rng = np.random.default_rng(seed)
    coll = collection("Props")
    L = length * MM
    n_path = 40
    bend = rng.uniform(-0.12, 0.12)
    path = np.array([[t * L, bend * L * math.sin(math.pi * t), 0.0] for t in np.linspace(0, 1, n_path)])
    r0, r1 = 1.6 * MM, 0.5 * MM
    verts, faces = [], []
    M = 10
    for i, p in enumerate(path):
        t = i / (n_path - 1)
        tan = path[min(i + 1, n_path - 1)] - path[max(i - 1, 0)]
        tan = tan / np.linalg.norm(tan)
        nrm = np.array([-tan[1], tan[0], 0.0])
        up = np.array([0.0, 0.0, 1.0])
        r = r0 + (r1 - r0) * t
        for j in range(M):
            a = 2 * math.pi * j / M
            verts.append(tuple(p + (nrm * math.cos(a) + up * math.sin(a)) * r + up * r0))
    for i in range(n_path - 1):
        for j in range(M):
            j1 = (j + 1) % M
            a, b = i * M, (i + 1) * M
            faces.append((a + j, b + j, b + j1, a + j1))
    stem = _mesh_object(name + "_stem", verts, faces, coll, mats=[material({"kind": "plastic", "color": stem_color, "roughness": 0.6})], sharp_deg=None)
    lm = material(leaf_material or ("eucalyptus" if kind == "eucalyptus" else "leaf"))
    lv, lf = [], []
    nleaf = leaves or (14 if kind == "olive" else 10)
    for i in range(nleaf):
        t = 0.12 + 0.88 * (i + 0.5) / nleaf
        k = int(t * (n_path - 1))
        p = path[k]
        tan = path[min(k + 1, n_path - 1)] - path[max(k - 1, 0)]
        tan = tan / np.linalg.norm(tan)
        sgn = 1 if i % 2 else -1
        if kind == "eucalyptus":
            ll = rng.uniform(22, 30) * MM * (1.1 - 0.4 * t)
            ww = ll * 0.92
            ang = sgn * rng.uniform(1.2, 1.5)
        else:
            ll = rng.uniform(38, 52) * MM * (1.05 - 0.35 * t)
            ww = ll * 0.24
            ang = sgn * rng.uniform(0.5, 0.85)
        ca, sa = math.cos(ang), math.sin(ang)
        d = np.array([tan[0] * ca - tan[1] * sa, tan[0] * sa + tan[1] * ca, 0.0])
        side = np.array([-d[1], d[0], 0.0])
        nu, nv = 14, 6
        base = len(lv)
        for a in range(nu + 1):
            u = a / nu
            half = ww / 2 * (np.sin(np.pi * u ** 0.85) ** (0.55 if kind == "eucalyptus" else 0.8))
            for b in range(-nv, nv + 1):
                v = b / nv
                lift = abs(v) * half * 0.22 + (u ** 2) * ll * rng.uniform(0.08, 0.16) + r0 * 1.2
                q = p + d * (u * ll + 2.0 * MM) + side * v * half + np.array([0, 0, lift])
                lv.append(tuple(q))
        row = 2 * nv + 1
        for a in range(nu):
            for b in range(2 * nv):
                i0 = base + a * row + b
                lf.append((i0, i0 + 1, i0 + row + 1, i0 + row))
    leaves_ob = _mesh_object(name + "_leaves", lv, lf, coll, mats=[lm], sharp_deg=None)
    leaves_ob.parent = stem
    stem.location = (x * MM, y * MM, z * MM)
    stem.rotation_euler = (0, 0, math.radians(rot))
    return Prop(name, stem, (z * MM) + 4 * MM, "sprig")


# =============================================================================================
# camera
# =============================================================================================

CAMERA_PRESETS = {
    "packshot_1x1": {"aspect": [1, 1], "focal": 100.0, "elevation": 5.0, "fill": 0.74, "offset": [0.0, 0.0]},
    "pdp_4x5": {"aspect": [4, 5], "focal": 90.0, "elevation": 6.0, "fill": 0.72, "offset": [0.0, -0.01]},
    "lineup_3x2": {"aspect": [3, 2], "focal": 85.0, "elevation": 6.0, "fill": [0.84, 0.66], "offset": [0.0, -0.02]},
    "hero_16x9": {"aspect": [16, 9], "focal": 60.0, "elevation": 9.0, "fill": [0.5, 0.66], "offset": [0.2, -0.03]},
    "hero_21x9": {"aspect": [21, 9], "focal": 50.0, "elevation": 8.0, "fill": [0.42, 0.68], "offset": [0.22, -0.03]},
    "mobile_hero_4x5": {"aspect": [4, 5], "focal": 50.0, "elevation": 10.0, "fill": [0.86, 0.5], "offset": [0.0, -0.17]},
}


def subject_points(objects, max_points=40000):
    """World-space vertices of objects (evaluated, so modifiers count)."""
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for ob in objects:
        if ob.type != "MESH":
            continue
        ev = ob.evaluated_get(dg)
        me = ev.to_mesh()
        n = len(me.vertices)
        if n:
            co = np.empty(n * 3, np.float32)
            me.vertices.foreach_get("co", co)
            co = co.reshape(-1, 3)
            M = np.array(ob.matrix_world)
            co = co @ M[:3, :3].T + M[:3, 3]
            pts.append(co)
        ev.to_mesh_clear()
    if not pts:
        return np.zeros((1, 3))
    P = np.concatenate(pts, 0)
    if len(P) > max_points:
        P = P[np.random.default_rng(0).choice(len(P), max_points, replace=False)]
    return P


def setup_camera(objects, preset="packshot_1x1", resolution=1200, focal=None, elevation=None, azimuth=0.0, fill=None,
                 offset=None, keep_verticals=True, dof=None, roll=0.0, aspect=None, ref_height_mm=None):
    """Frame ``objects`` with a preset. Verticals stay vertical (view-camera style: the camera is level
    and the frame is shifted), the subject is fitted to ``fill`` of the frame and positioned at ``offset``
    (fractions of the frame, +x right, +y up). ``ref_height_mm`` fixes the scale instead (consistent
    product scale across a line). ``resolution`` = long edge in px, or [w, h]."""
    P = dict(CAMERA_PRESETS[preset])
    focal = focal or P["focal"]
    elevation = P["elevation"] if elevation is None else elevation
    fill = fill if fill is not None else P["fill"]
    fw, fh = (fill, fill) if isinstance(fill, (int, float)) else fill
    ox, oy = offset if offset is not None else P["offset"]
    ax, ay = aspect or P["aspect"]
    if isinstance(resolution, (list, tuple)):
        rx, ry = int(resolution[0]), int(resolution[1])
    elif ax >= ay:
        rx, ry = int(resolution), int(round(resolution * ay / ax))
    else:
        rx, ry = int(round(resolution * ax / ay)), int(resolution)
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = rx, ry
    sc.render.resolution_percentage = 100
    cd = bpy.data.cameras.new("Camera")
    cd.lens = focal
    cd.sensor_width = 36.0
    cd.sensor_fit = "AUTO"
    cd.clip_start = 0.005
    cd.clip_end = 200.0
    cam = bpy.data.objects.new("Camera", cd)
    collection("Studio").objects.link(cam)
    sc.camera = cam
    bpy.context.view_layer.update()
    pts = subject_points(objects)
    lo, hi = pts.min(0), pts.max(0)
    center = (lo + hi) / 2
    dvec = np.array(_dir(azimuth, elevation))
    frame_w, frame_h = (36.0, 36.0 * ry / rx) if rx >= ry else (36.0 * rx / ry, 36.0)

    def basis(cpos):
        F = center - cpos
        if keep_verticals:
            F[2] = 0.0
        F = F / np.linalg.norm(F)
        Rv = np.cross(F, [0.0, 0.0, 1.0])
        Rv /= np.linalg.norm(Rv)
        U = np.cross(Rv, F)
        if roll:
            a = math.radians(roll)
            Rv, U = Rv * math.cos(a) + U * math.sin(a), -Rv * math.sin(a) + U * math.cos(a)
        return F, Rv, U

    def project(cpos):
        F, Rv, U = basis(cpos)
        rel = pts - cpos
        zc = rel @ F
        return focal * (rel @ Rv) / zc, focal * (rel @ U) / zc

    ext = float(np.linalg.norm(hi - lo))
    d = ext * focal / 36.0 * 1.5 + 0.05
    for _ in range(12):
        xs, ys = project(center + dvec * d)
        k = max((xs.max() - xs.min()) / (fw * frame_w), (ys.max() - ys.min()) / (fh * frame_h))
        d *= k
        if abs(k - 1) < 1e-4:
            break
    if ref_height_mm:
        xs, ys = project(center + dvec * d)
        real_h = (ys.max() - ys.min()) / (fh * frame_h)
        d *= (ref_height_mm * MM) / max(hi[2] - lo[2], 1e-6) * real_h
    cpos = center + dvec * d
    xs, ys = project(cpos)
    cx, cy = (xs.max() + xs.min()) / 2, (ys.max() + ys.min()) / 2
    big = max(frame_w, frame_h)
    cd.shift_x = (cx - ox * frame_w) / big
    cd.shift_y = (cy - oy * frame_h) / big
    F, Rv, U = basis(cpos)
    rot = Matrix(((Rv[0], U[0], -F[0]), (Rv[1], U[1], -F[1]), (Rv[2], U[2], -F[2])))
    cam.matrix_world = Matrix.Translation(Vector(cpos)) @ rot.to_4x4()
    if dof:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = dof.get("f_stop", 8.0)
        cd.dof.aperture_blades = dof.get("blades", 7)
        focus = dof.get("focus_mm")
        if focus is not None:
            fp = np.array(focus, float) * MM
        else:
            fp = center.copy()
            fp[1] = lo[1] + (hi[1] - lo[1]) * dof.get("depth_bias", 0.35)
        cd.dof.focus_distance = float((fp - cpos) @ F)
    return cam, {"distance": d, "center": center, "lo": lo, "hi": hi, "res": (rx, ry)}


# =============================================================================================
# render settings
# =============================================================================================

def configure_render(samples=96, adaptive_threshold=0.015, seed=7, transparent=False, exposure=0.0,
                     view_transform="AgX", look="AgX - Medium High Contrast", denoise=True, threads=3,
                     clamp_indirect=10.0, caustics=False, filter_glossy=0.6, guiding=False, bounces=None,
                     time_limit=0.0):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    cy = sc.cycles
    cy.device = "CPU"
    cy.samples = int(samples)
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = adaptive_threshold
    cy.adaptive_min_samples = 0
    cy.time_limit = time_limit
    cy.seed = int(seed)
    cy.use_animated_seed = False
    cy.use_denoising = bool(denoise)
    cy.denoiser = "OPENIMAGEDENOISE"
    cy.denoising_input_passes = "RGB_ALBEDO_NORMAL"
    cy.denoising_prefilter = "ACCURATE"
    try:
        cy.denoising_quality = "HIGH"
        bpy.context.view_layer.cycles.denoising_pass_follow_reflections = True
    except Exception:
        pass
    b = {"max": 24, "diffuse": 4, "glossy": 8, "transmission": 24, "transparent": 24, "volume": 2}
    b.update(bounces or {})
    cy.max_bounces = b["max"]
    cy.diffuse_bounces = b["diffuse"]
    cy.glossy_bounces = b["glossy"]
    cy.transmission_bounces = b["transmission"]
    cy.transparent_max_bounces = b["transparent"]
    cy.volume_bounces = b["volume"]
    cy.caustics_reflective = caustics
    cy.caustics_refractive = caustics
    cy.blur_glossy = filter_glossy
    cy.sample_clamp_direct = 0.0
    cy.sample_clamp_indirect = clamp_indirect
    cy.use_light_tree = True
    cy.use_guiding = guiding
    cy.film_exposure = 1.0
    cy.pixel_filter_type = "BLACKMAN_HARRIS"
    cy.filter_width = 1.5
    sc.render.film_transparent = transparent
    cy.film_transparent_glass = transparent
    sc.render.threads_mode = "FIXED"
    sc.render.threads = int(threads)
    sc.render.use_persistent_data = False
    sc.display_settings.display_device = "sRGB"
    sc.view_settings.view_transform = view_transform
    try:
        sc.view_settings.look = look if view_transform == "AgX" else "None"
    except TypeError:
        sc.view_settings.look = "None"
    sc.view_settings.exposure = exposure
    sc.view_settings.gamma = 1.0
    return sc


def render_still(path, transparent=False, color_depth="8"):
    sc = bpy.context.scene
    ext = os.path.splitext(path)[1].lower()
    fmt = {".png": "PNG", ".jpg": "JPEG", ".jpeg": "JPEG", ".webp": "WEBP", ".exr": "OPEN_EXR", ".tif": "TIFF", ".tiff": "TIFF"}.get(ext, "PNG")
    ims = sc.render.image_settings
    ims.file_format = fmt
    ims.color_mode = "RGBA" if (transparent and fmt in ("PNG", "WEBP", "OPEN_EXR", "TIFF")) else "RGB"
    if fmt in ("PNG", "TIFF"):
        ims.color_depth = str(color_depth)
    if fmt == "PNG":
        ims.compression = 15
    if fmt in ("JPEG", "WEBP"):
        ims.quality = 92
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    sc.render.filepath = os.path.abspath(path)
    t = time.time()
    bpy.ops.render.render(write_still=True)
    dt = time.time() - t
    _log(f"rendered {path} {sc.render.resolution_x}x{sc.render.resolution_y} in {dt:.1f}s")
    return dt


def _lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def match_backdrop(target_hex, iters=7, res=144, samples=16, regions=None, max_albedo=0.95, tolerance=1.6):
    """Colour-lock the sweep: iteratively adjust its albedo (and, if it runs out of headroom, the
    'background' light) until the *rendered* backdrop around the frame edges equals ``target_hex``
    under the current lighting and view transform. Products are hidden from camera rays while
    measuring (they still cast light and shadow). Returns the final albedo hex."""
    sc = bpy.context.scene
    sweep = bpy.data.objects.get("sweep")
    if sweep is None:
        return None
    mat = sweep.active_material
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    sock = bsdf.inputs["Base Color"]
    if sock.is_linked:
        _log("backdrop match skipped (two-tone sweep)")
        return None
    regions = regions or [(0.0, 0.0, 1.0, 0.12), (0.0, 0.0, 0.07, 0.6), (0.93, 0.0, 1.0, 0.6)]
    target = hex_rgb(target_hex, linear=False)
    saved = dict(rx=sc.render.resolution_x, ry=sc.render.resolution_y, samples=sc.cycles.samples,
                 adapt=sc.cycles.use_adaptive_sampling, path=sc.render.filepath, fmt=sc.render.image_settings.file_format,
                 mode=sc.render.image_settings.color_mode, depth=sc.render.image_settings.color_depth)
    hidden = [o for o in sc.objects if o.type == "MESH" and o.name != "sweep" and o.visible_camera]
    for o in hidden:
        o.visible_camera = False
    bg_light = bpy.data.objects.get("background")
    aspect = saved["ry"] / saved["rx"]
    sc.render.resolution_x, sc.render.resolution_y = res, max(16, int(res * aspect))
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = False
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    sc.render.image_settings.color_depth = "8"   # 8-bit PNG pixels load as raw display values (16-bit would be linearised)
    tmp = os.path.join(bpy.app.tempdir or "/tmp", f"lumora_match_{os.getpid()}.png")
    alb = list(sock.default_value[:3])
    err = None
    try:
        for it in range(iters):
            sc.render.filepath = tmp
            bpy.ops.render.render(write_still=True)
            img = bpy.data.images.load(tmp)
            w, h = img.size
            px = np.array(img.pixels[:], np.float32).reshape(h, w, 4)[::-1, :, :3]
            bpy.data.images.remove(img)
            vals = []
            for (x0, y0, x1, y1) in regions:
                sub = px[int(y0 * h):max(int(y1 * h), int(y0 * h) + 1), int(x0 * w):max(int(x1 * w), int(x0 * w) + 1)]
                vals.append(sub.reshape(-1, 3))
            meas = np.median(np.concatenate(vals, 0), axis=0)
            err = float(np.abs(meas - np.array(target)).max() * 255)
            _log(f"backdrop match {it}: rendered #{''.join(f'{int(round(c * 255)):02X}' for c in meas)} "
                 f"target {target_hex} (max err {err:.1f}/255)")
            if err <= tolerance:
                break
            gain = [(_lin(t) / max(_lin(m), 1e-4)) ** 1.7 for t, m in zip(target, meas)]
            new = [a * g for a, g in zip(alb, gain)]
            over = max(new) / max_albedo
            if over > 1.0:
                new = [v / over for v in new]
                for lo in ([bg_light] if bg_light is not None else [o for o in sc.objects if o.type == "LIGHT"]):
                    lo.data.energy *= over ** 1.3
            alb = [min(max(v, 0.005), max_albedo) for v in new]
            sock.default_value = (*alb, 1.0)
    finally:
        for o in hidden:
            o.visible_camera = True
        sc.render.resolution_x, sc.render.resolution_y = saved["rx"], saved["ry"]
        sc.cycles.samples = saved["samples"]
        sc.cycles.use_adaptive_sampling = saved["adapt"]
        sc.render.filepath = saved["path"]
        sc.render.image_settings.file_format = saved["fmt"]
        sc.render.image_settings.color_mode = saved["mode"]
        sc.render.image_settings.color_depth = saved["depth"]
        if os.path.exists(tmp):
            os.remove(tmp)
    srgb = [(c * 12.92 if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055) for c in alb]
    return "#" + "".join(f"{int(round(min(max(c, 0), 1) * 255)):02X}" for c in srgb), err


# =============================================================================================
# job runner (JSON -> scene)
# =============================================================================================

QUALITY = {
    "draft": {"samples": 24, "adaptive_threshold": 0.05, "resolution": 560},
    "preview": {"samples": 64, "adaptive_threshold": 0.02, "resolution": 900},
    "final": {"samples": 512, "adaptive_threshold": 0.006, "resolution": 2048},
}


def build_scene(job, base_dir="."):
    """Build a complete scene from a job dict (see README). Returns a context dict."""
    reset()
    ctx = {"products": {}, "props": {}, "job": job}

    def rel(p):
        return p if os.path.isabs(p) else os.path.normpath(os.path.join(base_dir, p))

    # ---- props (in order; "on" may reference an earlier prop)
    for i, ps in enumerate(job.get("props", [])):
        pid = ps.get("id", f"prop{i}")
        t = ps.get("type", "plinth")
        pos = ps.get("position", [0, 0])
        z = 0.0
        if ps.get("on"):
            z = ctx["props"][ps["on"]].top_z / MM
        if t == "plinth":
            dims = dict(ps.get("dims", {}))
            pr = add_plinth(ps.get("shape", "cylinder"), dims.get("d", 160.0), dims.get("h", 120.0), dims.get("w"),
                            dims.get("depth"), dims.get("edge_r", 2.5), ps.get("material", "travertine"),
                            pos[0], pos[1], z, ps.get("rotation", 0.0), name=pid)
        elif t == "glass_sphere":
            pr = add_glass_sphere(ps.get("d", 60.0), pos[0], pos[1], z, ps.get("material", "glass_clear"), name=pid)
        elif t == "water":
            pr = add_water(ps.get("w", 900.0), ps.get("depth", 700.0), ps.get("level", 3.0), pos[0], pos[1], z,
                           ps.get("ripple_center", [0, 0]), ps.get("ripple_scale", 1.0), ps.get("ripple_strength", 1.0),
                           ps.get("caustics", True), ps.get("tint", "#DCD2C6"), name=pid)
        elif t == "sprig":
            pr = add_sprig(ps.get("kind", "olive"), ps.get("length", 220.0), pos[0], pos[1], z, ps.get("rotation", 0.0),
                           ps.get("seed", 3), ps.get("leaves"), name=pid, leaf_material=ps.get("material"))
        else:
            raise KeyError(f"unknown prop type '{t}'")
        pr.frame = ps.get("frame", t not in ("water",))
        ctx["props"][pid] = pr
    # ---- products
    for i, ps in enumerate(job.get("products", [])):
        pid = ps.get("id", f"product{i}")
        kind = ps["type"]
        if kind not in GENERATORS:
            raise KeyError(f"product '{pid}': unknown type '{kind}' (known: {', '.join(GENERATORS)})")
        gen = GENERATORS[kind]
        kw = dict(ps.get("dims", {}))
        if kind == "tube" and ps.get("print"):
            pr_spec = dict(ps["print"])
            pr_spec["image"] = rel(pr_spec["image"])
            kw["print_spec"] = pr_spec
        prod = gen(name=pid, materials=ps.get("materials"), **kw)
        for lab in ps.get("labels", []) + ([ps["label"]] if ps.get("label") else []):
            lab = dict(lab)
            ltype = lab.pop("type", "wrap")
            img = rel(lab.pop("image"))
            if ltype == "decal":
                add_decal(prod, img, **lab)
            else:
                add_label(prod, img, **lab)
        pos = ps.get("position", [0, 0])
        z_m = ctx["props"][ps["on"]].top_z if ps.get("on") else None
        prod.place(pos[0], pos[1], 0.0, ps.get("rotation", 0.0), z_m=z_m)
        ctx["products"][pid] = prod
    bpy.context.view_layer.update()
    # ---- framing subjects & scene scale
    cam_spec = dict(job.get("camera", {}))
    subj = cam_spec.get("subjects", "products")
    objs = []
    if subj in ("products", "all"):
        for p in ctx["products"].values():
            objs += [o for o in p.objects() if o.type == "MESH"]
    if subj == "all":
        for p in ctx["props"].values():
            if p.frame:
                objs += p.objects()
    if isinstance(subj, list):
        for sid in subj:
            if sid in ctx["products"]:
                objs += ctx["products"][sid].objects()
            elif sid in ctx["props"]:
                objs += ctx["props"][sid].objects()
    allobjs = [o for p in ctx["products"].values() for o in p.objects()] + [o for p in ctx["props"].values() if p.frame for o in p.objects()]
    P = subject_points(allobjs or objs)
    lo, hi = P.min(0), P.max(0)
    size = float(max(hi - lo))
    S = min(max(size, 0.12), 3.0) if not job.get("scale_mm") else job["scale_mm"] * MM
    target = Vector(((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, lo[2] + (hi[2] - lo[2]) * 0.45))
    ctx.update(scale=S, target=target, lo=lo, hi=hi)
    # ---- backdrop
    bd = dict(job.get("backdrop", {"type": "sweep"}))
    btype = bd.pop("type", "sweep")
    if btype == "sweep":
        # the cove always starts behind the products (never under them): wall = back of set + gap + radius
        auto = {"width_mm": 30 * S / MM, "floor_mm": 14 * S / MM, "height_mm": 12 * S / MM, "radius_mm": 2.6 * S / MM}
        auto.update({k: v for k, v in bd.items() if k in ("width_mm", "floor_mm", "height_mm", "radius_mm")})
        auto["wall_y_mm"] = bd.get("wall_y_mm", hi[1] / MM + bd.get("gap_mm", 0.45 * S / MM) + auto["radius_mm"])
        auto.update({k: v for k, v in bd.items() if k in ("width_mm", "floor_mm", "height_mm", "radius_mm", "wall_y_mm")})
        add_sweep(bd.get("color", "#EAE2D8"), bd.get("wall_color"), auto["width_mm"], auto["floor_mm"], auto["height_mm"],
                  auto["radius_mm"], auto["wall_y_mm"], bd.get("roughness", 0.92), bd.get("grain", 0.0), target[0] / MM)
        ctx["backdrop"] = {"wall_y": auto["wall_y_mm"] * MM, "radius": auto["radius_mm"] * MM, "back_y": float(hi[1])}
    elif btype in ("floor", "shadow_catcher"):
        add_floor(bd.get("color", "#EAE2D8"), bd.get("size_mm", 40 * S / MM), bd.get("roughness", 0.92), btype == "shadow_catcher")
    # ---- lighting
    lt = dict(job.get("lighting", {}))
    cache = rel(job.get("cache_dir", "cache"))
    apply_lighting(lt.get("preset", "soft_studio"), target, lt["scale_mm"] * MM if lt.get("scale_mm") else S, lt.get("intensity", 1.0),
                   lt.get("mirror", False), lt.get("kelvin_shift", 0.0), lt.get("lights"), job.get("world"),
                   job.get("sun"), job.get("gobo"), cache, lt.get("white_balance", 5600.0), ctx.get("backdrop"),
                   lt.get("flags"))
    if btype == "shadow_catcher":
        # cut-outs keep one soft grounding shadow: rims/strips/background lights cast none
        for lname in bd.get("shadowless_lights", ["rim_l", "rim_r", "strip", "background", "fill"]):
            lo = bpy.data.objects.get(lname)
            if lo is not None and lo.type == "LIGHT":
                lo.data.use_shadow = False
    # ---- camera
    rnd = dict(job.get("render", {}))
    cam, info = setup_camera(objs, cam_spec.get("preset", "packshot_1x1"), job.get("resolution", 900),
                             cam_spec.get("focal_length"), cam_spec.get("elevation"), cam_spec.get("azimuth", 0.0),
                             cam_spec.get("fill"), cam_spec.get("offset"), cam_spec.get("keep_verticals", True),
                             cam_spec.get("dof"), cam_spec.get("roll", 0.0), cam_spec.get("aspect"),
                             cam_spec.get("ref_height_mm"))
    ctx["camera"] = cam
    configure_render(rnd.get("samples", 64), rnd.get("adaptive_threshold", 0.02), rnd.get("seed", 7),
                     rnd.get("transparent", False), rnd.get("exposure", 0.0), rnd.get("view_transform", "AgX"),
                     rnd.get("look", "AgX - Medium High Contrast"), rnd.get("denoise", True), rnd.get("threads", 3),
                     rnd.get("clamp_indirect", 10.0), rnd.get("caustics", False), rnd.get("filter_glossy", 0.6),
                     rnd.get("guiding", False), rnd.get("bounces"), rnd.get("time_limit", 0.0))
    # ---- colour-lock the backdrop (default on for sweeps without hard sun, where edges must match the page)
    if btype == "sweep" and not bd.get("wall_color") and bd.get("match", not job.get("sun")) and not rnd.get("transparent"):
        mt = bd.get("match_color", bd.get("color", "#EAE2D8"))
        res = match_backdrop(mt, regions=bd.get("match_regions"))
        if res:
            ctx["backdrop_albedo"] = res[0]
            _log(f"backdrop albedo set to {res[0]} to render as {mt}")
    return ctx


def run_job(job, base_dir=".", output=None, quality=None, resolution=None, samples=None, save_blend=None):
    """Build and render a job dict. ``quality`` ('draft' | 'preview' | 'final') overrides resolution,
    samples and noise threshold; explicit resolution/samples override that."""
    job = json.loads(json.dumps(job))
    rnd = job.setdefault("render", {})
    if quality:
        q = QUALITY[quality]
        rnd["samples"] = q["samples"]
        rnd["adaptive_threshold"] = q["adaptive_threshold"]
        job["resolution"] = q["resolution"] if not isinstance(job.get("resolution"), list) else job["resolution"]
    if resolution:
        job["resolution"] = resolution
    if samples:
        rnd["samples"] = samples
    t0 = time.time()
    ctx = build_scene(job, base_dir)
    _log(f"scene built in {time.time() - t0:.1f}s (scale {ctx['scale']:.3f} m)")
    out = output or job.get("output", "render.png")
    if not os.path.isabs(out):
        out = os.path.normpath(os.path.join(base_dir, out))
    if save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(save_blend))
    dt = render_still(out, rnd.get("transparent", False), str(rnd.get("color_depth", 8)))
    return out, dt
