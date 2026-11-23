"""
make_jobs.py - write the Lumora (Golden Hour) render jobs for the rig.

    python3 make_jobs.py            # writes packshot-*.json and scene jobs next to this file

One product library (brand/concepts/golden-hour.md 5.1), one packshot recipe (4.1) and the
low-sun scenes (4.2, 4.3). Paths in the jobs are relative to this folder. Final outputs are the
JPEGs in products/<handle>/ and renders/scenes/; run.sh renders a job and finishes it (JPEG q90,
sRGB profile, scene grade, manifest update).
"""
import copy
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
L = "../labels/"

# ---- palette
SAND, LINEN_INK, DUSK = "#E9D9C5", "#F6E8D6", "#35211F"
WALL_SHADE = "#E7D2BC"

# ---- the line (5.1). Heights: 150, 115, 65(+lid), 82, 166, 94 mm
PRODUCTS = {
    "sunmelt-cleansing-balm": {
        "type": "tube",
        "dims": {"d": 40, "length": 150, "cap_d": 34, "cap_h": 20, "shoulder_h": 5, "crimp_h": 9},
        "materials": {"body": {"preset": "plastic_softtouch", "color": "#D9C09F", "sheen": 0.12},
                      "shoulder": {"preset": "plastic_softtouch", "color": "#D9C09F", "sheen": 0.12},
                      "cap": {"preset": "plastic_gloss", "color": "#D6BC9A"}},
        "print": {"image": L + "sunmelt-cleansing-balm-front.png", "mode": "print", "height_mm": 70, "z_mm": 88},
    },
    "long-light-serum": {
        "type": "dropper",
        "dims": {"d": 34, "h": 74, "shoulder_r": 7.5, "neck_d": 18, "collar_d": 23.5, "collar_h": 15.5,
                 "bulb_d": 15, "bulb_h": 22, "fill": 0.8},
        "materials": {"body": "glass_amber", "liquid": {"preset": "liquid", "color": "#E9A54E", "tint_mm": 18},
                      "pipette": "glass_clear", "collar": "metal_champagne_brushed",
                      "bulb": {"preset": "silicone", "color": "#D99A48", "sheen": 0.05}},
        "labels": [{"image": L + "long-light-serum-front.png", "mode": "ink", "ink": LINEN_INK, "height_mm": 30}],
    },
    "haze-soft-focus-cream": {
        "type": "jar",
        "dims": {"d": 66, "body_h": 42, "neck_h": 7, "bottom": 11, "lid_h": 22, "lid": "on"},
        "materials": {"body": {"preset": "glass_opal", "color": "#B4733F", "roughness": 0.4, "coat": 0.12, "sss_mm": 1.2},
                      "contents": {"preset": "cream", "color": "#F3E6D6"},
                      "lid": {"preset": "plastic_softtouch", "color": "#E0936B", "sheen": 0.08}},
        "labels": [{"image": L + "haze-soft-focus-cream-front.png", "mode": "ink", "ink": LINEN_INK, "height_mm": 20},
                   {"type": "decal", "image": L + "monogram.png", "anchor": "lid_top", "mode": "ink", "ink": DUSK,
                    "width_mm": 16}],
    },
    "apricity-lip-cheek-balm": {
        "type": "stick",
        "dims": {"d": 24, "h": 82, "cap_h": 34},
        "materials": {"base": {"preset": "plastic_softtouch", "color": "#9E4535", "sheen": 0.06}, "cap": "metal_champagne_brushed"},
        "labels": [{"image": L + "apricity-lip-cheek-balm-front.png", "mode": "ink", "ink": LINEN_INK, "height_mm": 30}],
    },
    "gloaming-body-oil": {
        "type": "cylinder",
        "dims": {"d": 42, "h": 130, "shoulder_r": 3.5, "neck_d": 22, "cap_d": 30, "cap_h": 30,
                 "cap_ribs": {"count": 48, "depth": 0.4}, "fill": 0.86},
        "materials": {"body": "glass_amber", "liquid": {"preset": "oil", "color": "#E8B25E", "tint_mm": 16},
                      "cap": {"preset": "plastic_softtouch", "color": "#7E3529", "sheen": 0.06}},
        "labels": [{"image": L + "gloaming-body-oil-front.png", "mode": "ink", "ink": LINEN_INK, "height_mm": 44}],
    },
    "slow-hour-golden-milk": {
        "type": "jar",
        "dims": {"d": 80, "body_h": 70, "neck_h": 6, "neck_inset": 2.2, "neck_wall": 3.8, "bottom": 9, "lid_h": 24},
        "materials": {"body": {"preset": "ceramic_glazed", "color": "#3D2321", "speckle": 0.35, "speckle_color": "#C9A486"},
                      "contents": {"preset": "cream", "color": "#E0A53A"}, "lid": "metal_champagne_brushed"},
        "labels": [{"image": L + "slow-hour-golden-milk-front.png", "mode": "foil", "foil": "gold", "height_mm": 40},
                   {"type": "decal", "image": L + "monogram.png", "anchor": "lid_top", "mode": "foil", "foil": "gold",
                    "width_mm": 20}],
    },
}
ORDER = list(PRODUCTS)
SHORT = {"sunmelt-cleansing-balm": "sunmelt", "long-light-serum": "long_light", "haze-soft-focus-cream": "haze",
         "apricity-lip-cheek-balm": "apricity", "gloaming-body-oil": "gloaming", "slow-hour-golden-milk": "slow_hour"}


def product(handle, position=(0, 0), rotation=0, on=None, **over):
    p = copy.deepcopy(PRODUCTS[handle])
    p["id"] = SHORT[handle]
    p["position"] = list(position)
    p["rotation"] = rotation
    if on:
        p["on"] = on
    for k, v in over.items():
        if k == "dims":
            p["dims"].update(v)
        else:
            p[k] = v
    return p


def block(pid, w, depth, h, pos, rot=0, on=None, mat="travertine", edge_r=2.5, frame=True):
    b = {"id": pid, "type": "plinth", "shape": "block", "dims": {"w": w, "depth": depth, "h": h, "edge_r": edge_r},
         "material": mat, "position": list(pos), "rotation": rot}
    if on:
        b["on"] = on
    if not frame:
        b["frame"] = False
    return b


# ---- 4.1 packshot recipe: Sand sweep (colour-locked), soft studio at ~4,800 K, pdp_4x5
def packshot(handle, rotation=0, labels=None, output=None):
    p = product(handle, rotation=rotation)
    if labels is not None:
        p["labels"] = labels
    return {
        "_comment": f"Packshot recipe (golden-hour.md 4.1): {handle}. Sand sweep colour-locked to {SAND}.",
        "output": output or f"../../products/{handle}/{handle}-packshot.jpg",
        "resolution": [1600, 2000],
        "backdrop": {"type": "sweep", "color": SAND, "match": True},
        "lighting": {"preset": "soft_studio", "kelvin_shift": -500},
        "products": [p],
        "camera": {"preset": "pdp_4x5", "fill": [0.6, 0.72], "offset": [0.0, -0.02]},
        "render": {"samples": 128, "adaptive_threshold": 0.015, "seed": 7, "threads": 4},
    }


# ---- 4.2 low-sun look
def low_sun(el=12, az=-60, kelvin=3300, strength=5.5, seed=4, coverage=0.7, leaf_scale=1.1, rotation=0,
            distance=600, size=1400):
    return ({"az": az, "el": el, "kelvin": kelvin, "angle": 1.2, "strength": strength},
            {"pattern": "leaves", "seed": seed, "coverage": coverage, "leaf_scale": leaf_scale, "rotation": rotation,
             "distance": distance, "size": size})


def scene(output, resolution, props, products, camera, sun, gobo, backdrop=None, lighting=None, world=None,
          samples=128, comment=""):
    return {
        "_comment": comment,
        "output": output,
        "resolution": resolution,
        "backdrop": backdrop or {"type": "sweep", "color": WALL_SHADE, "radius_mm": 170, "gap_mm": 80, "match": False},
        "lighting": lighting or {"preset": "sunlit", "lights": [{"name": "fill", "E": 0.75, "kelvin": 5600},
                                                                {"name": "bounce", "E": 0.8, "kelvin": 3600}]},
        "world": world or {"color": "#D8C1A8", "strength": 0.18},
        "sun": sun, "gobo": gobo,
        "props": props, "products": products, "camera": camera,
        "render": {"samples": samples, "adaptive_threshold": 0.015, "seed": 7, "threads": 4},
    }


def hero_set():
    props = [block("base", 380, 170, 62, (70, 0)),
             block("riser", 104, 92, 74, (-38, 6), on="base")]
    prods = [product("long-light-serum", (-38, 4), rotation=0, on="riser"),
             product("haze-soft-focus-cream", (66, -20), rotation=-12, on="base")]
    return props, prods


def jobs():
    J = {}
    for h in ORDER:
        J[f"packshot-{h}"] = packshot(h)

    # hero desktop 2880x1620: left 45% calm wall for the H1
    sun, gobo = low_sun(el=12, seed=4, coverage=0.75, leaf_scale=1.1)
    props, prods = hero_set()
    J["scene-hero-desktop"] = scene(
        "../scenes/hero-desktop.jpg", [2880, 1620], props, prods,
        {"preset": "hero_16x9", "subjects": ["long_light", "haze", "riser"], "focal_length": 60, "elevation": 7,
         "fill": [0.36, 0.6], "offset": [0.25, -0.03]},
        sun, gobo, comment="Hero 'Late light on travertine' (4.3): Long Light on a riser, Haze on the base block; left 45% calm.")

    # hero mobile 1170x1460: same set, products centred low, calm top
    J["scene-hero-mobile"] = scene(
        "../scenes/hero-mobile.jpg", [1170, 1460], props, prods,
        {"preset": "mobile_hero_4x5", "subjects": ["long_light", "haze", "riser"], "focal_length": 55,
         "elevation": 7, "fill": [0.78, 0.44], "offset": [0.0, -0.2]},
        sun, gobo, comment="Hero recomposed for phones: products centred low, calm upper area for the H1.")

    # ritual 2400x1350: six on a stepped travertine shelf that steps down like the setting sun
    sun_r, gobo_r = low_sun(el=13, seed=11, coverage=0.55, leaf_scale=1.1)
    tiers = [block("tier1", 236, 150, 84, (-236, 10)), block("tier2", 236, 150, 56, (0, 10)),
             block("tier3", 236, 150, 28, (236, 10))]
    ritual_prods = [product("sunmelt-cleansing-balm", (-290, 14), on="tier1"),
                    product("long-light-serum", (-182, 4), on="tier1"),
                    product("haze-soft-focus-cream", (-54, 6), rotation=-8, on="tier2"),
                    product("apricity-lip-cheek-balm", (58, 0), on="tier2"),
                    product("gloaming-body-oil", (180, 8), on="tier3"),
                    product("slow-hour-golden-milk", (296, 6), rotation=-6, on="tier3")]
    J["scene-ritual"] = scene(
        "../scenes/ritual.jpg", [2400, 1350], tiers, ritual_prods,
        {"preset": "lineup_3x2", "subjects": "all", "focal_length": 85, "elevation": 7, "fill": [0.84, 0.66],
         "offset": [0.0, -0.04]},
        sun_r, gobo_r, comment="Ritual: 01-06 on a travertine shelf stepping down left to right (late light to dusk).")

    # golden pair 1600x2000
    sun_g, gobo_g = low_sun(el=13, seed=7, coverage=0.6, leaf_scale=1.15)
    J["scene-golden-pair"] = scene(
        "../scenes/golden-pair.jpg", [1600, 2000],
        [{"id": "plinth", "type": "plinth", "shape": "cylinder", "dims": {"d": 210, "h": 56, "edge_r": 2.5},
          "material": "travertine", "position": [0, 0]}],
        [product("long-light-serum", (-34, 18), on="plinth"),
         product("haze-soft-focus-cream", (40, -30), rotation=-10, on="plinth")],
        {"preset": "pdp_4x5", "subjects": "all", "focal_length": 85, "elevation": 8, "fill": [0.74, 0.6],
         "offset": [0.0, -0.1]},
        sun_g, gobo_g, comment="The golden pair bundle card: Long Light + Haze.")

    # closing 2880x1100: dusk, last light, Gloaming + Slow Hour on plaster
    sun_c, gobo_c = low_sun(el=7, az=-64, kelvin=2700, strength=4.2, seed=21, coverage=0.5, leaf_scale=1.2)
    J["scene-closing"] = scene(
        "../scenes/closing.jpg", [2880, 1100],
        [{"id": "plinth", "type": "plinth", "shape": "cylinder", "dims": {"d": 240, "h": 70, "edge_r": 2.5},
          "material": {"preset": "plaster", "color": "#B98670"}, "position": [0, 0]}],
        [product("gloaming-body-oil", (-40, 20), on="plinth"),
         product("slow-hour-golden-milk", (52, -24), rotation=-8, on="plinth")],
        {"preset": "hero_21x9", "subjects": "all", "focal_length": 50, "elevation": 7, "fill": [0.3, 0.7],
         "offset": [0.27, -0.05], "aspect": [2880, 1100]},
        sun_c, gobo_c,
        backdrop={"type": "sweep", "color": "#9A5A47", "radius_mm": 200, "gap_mm": 90, "match": False},
        lighting={"preset": "sunlit", "lights": [{"name": "fill", "E": 0.45, "kelvin": 7800, "az": 40},
                                                 {"name": "bounce", "E": 0.5, "kelvin": 3000},
                                                 {"name": "rim_r", "E": 0.8, "kelvin": 8000}]},
        world={"color": "#5C4A5A", "strength": 0.14},
        comment="Closing band: dusk mood (Clay/Dusk), last light, cool blue-hour fill from the right.")

    # PDP extras for Long Light (1600x2000)
    sun_p, gobo_p = low_sun(el=11, seed=5, coverage=0.6, leaf_scale=1.1)
    J["pdp-long-light-serum-in-light"] = scene(
        "../../products/long-light-serum/long-light-serum-in-light.jpg", [1600, 2000],
        [block("block", 150, 110, 70, (0, 0))],
        [product("long-light-serum", (0, -4), rotation=0, on="block")],
        {"preset": "pdp_4x5", "subjects": "all", "focal_length": 90, "elevation": 7, "fill": [0.7, 0.56],
         "offset": [-0.06, -0.14]},
        sun_p, gobo_p, comment="PDP: Long Light on travertine in raking sun; shadow climbs the wall.")

    J["pdp-long-light-serum-detail"] = scene(
        "../../products/long-light-serum/long-light-serum-detail.jpg", [1600, 2000],
        [block("block", 160, 120, 60, (0, 0), frame=False)],
        [product("long-light-serum", (0, 0), rotation=-8, on="block")],
        {"preset": "pdp_4x5", "subjects": ["long_light"], "focal_length": 100, "elevation": 10, "fill": 1.9,
         "offset": [0.0, -0.46], "dof": {"f_stop": 4.0, "focus_mm": [0, -14, 140]}},
        sun_p, gobo_p, comment="PDP macro: collar, bulb and shoulder in raking sun.")

    back_labels = [{"image": L + "long-light-serum-back.png", "mode": "ink", "ink": LINEN_INK, "height_mm": 34,
                    "angle_deg": 180},
                   {"image": L + "long-light-serum-front.png", "mode": "ink", "ink": LINEN_INK, "height_mm": 30}]
    J["pdp-long-light-serum-back"] = packshot("long-light-serum", rotation=180, labels=back_labels,
                                             output="../../products/long-light-serum/long-light-serum-back.jpg")

    J["pdp-long-light-serum-with-haze"] = scene(
        "../../products/long-light-serum/long-light-serum-with-haze.jpg", [1600, 2000],
        [block("slab", 260, 170, 40, (0, 0))],
        [product("long-light-serum", (-50, 30), on="slab"),
         product("haze-soft-focus-cream", (46, -20), rotation=-14, on="slab",
                 dims={"lid": "beside"})],
        {"preset": "pdp_4x5", "subjects": "all", "focal_length": 85, "elevation": 12, "fill": [0.8, 0.6],
         "offset": [0.0, -0.1]},
        sun_p, gobo_p, comment="PDP: routine pairing, Haze open beside Long Light.")
    return J


if __name__ == "__main__":
    for name, job in jobs().items():
        with open(os.path.join(HERE, name + ".json"), "w") as fh:
            json.dump(job, fh, indent=2)
        print("wrote", name + ".json")
