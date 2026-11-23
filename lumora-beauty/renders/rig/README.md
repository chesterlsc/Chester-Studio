# Lumora packshot rig

A parametric Blender (Cycles) rig for premium cosmetics packshots and still-life scenes. Packaging
is generated from millimetre specs (no modelling), materials and labels are data, and a scene is a
small JSON job file that renders the same way every time.

| (a) line-up, 3:2 | (b) packshot, 1:1 |
|---|---|
| ![line-up](previews/a_lineup.png) | ![packshot](previews/b_dropper_packshot.png) |
| **(c) hero still life, 16:9** | **(d) mobile hero, 4:5 (extra)** |
| ![hero](previews/c_hero_still_life.png) | ![mobile hero](previews/d_mobile_hero_water.png) |
| **(e) material library (extra)** | |
| ![materials](previews/e_material_library.png) | Row 1: clear, frosted, amber, tinted, opal and smoke glass. Row 2: gold polished, champagne brushed, rose polished and silver brushed metal, soft-touch and gloss plastic. Row 3: travertine, marble, plaster, glazed ceramic, silicone, cream. |

Product names and label copy in the examples are **placeholders**; the brand team's artwork PNGs and
specs drop straight into the job files.

## Quick start

```bash
PY=/tmp/claude-0/-home-user-Chester-Studio/c51c471c-f281-5048-b5b7-f7b60a856929/scratchpad/blender-venv/bin/python   # Blender 5.3 as a Python module
cd renders/rig

$PY render_job.py examples/b_dropper_packshot.json                    # preview, as set in the job
$PY render_job.py examples/*.json --quality draft                     # 560 px, 24 spp: layout checks
$PY render_job.py examples/c_hero_still_life.json --quality final     # 2048 px, 512 spp
$PY render_job.py examples/c_hero_still_life.json --quality final --res 3000 --out hero_3000.png
$PY render_job.py job.json --save-blend scene.blend                   # also save the built scene
```

Flags: `--quality draft|preview|final`, `--res <long edge px>`, `--samples <n>`, `--out <path>`,
`--threads <n>`, `--save-blend <path>`. Relative paths inside a job (output, label images, cache)
resolve against the job file's folder. Inside the Blender app (5.x) the same CLI runs as
`blender -b --python render_job.py -- examples/b_dropper_packshot.json --quality final`.

Label artwork for the examples is generated with Playwright (`node examples/labels/make_labels.cjs`,
specs in `examples/labels/labels.json`, fonts vendored under SIL OFL in `examples/labels/fonts/`).

### Rendering at final quality

* `--quality final` = 2048 px long edge, 512 samples max, adaptive noise threshold 0.006, OIDN.
  Adaptive sampling stops early on the backdrop, so glass and frosted surfaces get the samples.
* Homepage banners: `--quality final --res 3000` (16:9 -> 3000x1688; 21:9 -> 3000x1286).
  PDP and collection images: `--quality final --res 2048` (1:1 or 4:5).
* Timing on this 4-core sandbox with 3 threads: previews took 98 s (b, 900x900), 110 s (a, 1200x800),
  166 s (c, 1600x900) and 198 s (d, 1080x1350). Final quality is about 25-45 min per image here and
  roughly 5-10 min on a 16-thread workstation; run finals with `--threads <all cores>` when the
  machine is free.
* Check a `--quality draft` render before every final; the job, the seed and the colour lock make
  draft, preview and final differ only in noise and resolution.

## How it works (and why it looks right)

* **Geometry from 2D profiles.** Every bottle, closure and prop is a control polygon in (r, z)
  with a fillet radius per corner, sampled at 4 degrees and revolved at 160+ segments, so every edge
  is rounded and catches light, and silhouettes stay smooth at 2048 px. Glass has real wall thickness
  (outer profile + an inward offset, a heavy base, rounded lip), liquids are separate inner meshes
  that overlap the glass by 0.08 mm so refraction has no air gap, and a dropper's pipette (with its
  own liquid) is visible through the glass. All meshes are closed and manifold, and products sit on z = 0.
* **Colour-locked backdrop.** With `match` on, a few 144 px pre-renders (products hidden from
  camera) measure the rendered sweep at the frame edges and adjust its albedo (and, if it runs out of
  headroom, the background light) until the backdrop renders as exactly the hex you asked for under
  AgX. Image edges then blend seamlessly into a Shopify section of the same colour. Typical error: 1-2/255.
* **Light where glass needs it.** Glass shows what is directly behind it, which is mostly the floor just
  behind the products. The `background` light pools light there and up the cove, so frosted glass
  glows instead of going grey. Black flags (seen only in reflections and refractions) give glass and
  metal edge definition; strip lights draw the vertical highlights.
* **Clean glass shadows.** Glass and liquids hand shadow rays a transparent, edge-darkened surface
  (bright core, darker rim, tinted by the glass), the fast stand-in for refractive caustics. Real
  caustics stay off by default.
* **Robust glass colour.** Smooth coloured glass (amber, tinted) uses true volume absorption, so
  thick bases read darker. Frosted or colourless glass is tinted per interface instead: Cycles darkens
  rough glass that has volume absorption in proportion to the distance to the lights (shadow rays
  leaving rough glass keep the glass volume). That is what turned frosted serums muddy in large sets,
  so the rig avoids it automatically.
* **Scale-aware studio.** Light distances and sizes, the sweep and the cove are expressed in units of
  the subject size, so a single dropper and a six-piece line-up get the same light quality. The cove
  always starts behind the products, never under them.
* **View-camera framing.** Cameras stay level and shift the frame (as a tilt-shift lens does), so verticals
  stay vertical. Presets fit the actual mesh silhouettes (not bounding boxes) to a fill ratio, which
  gives consistent margins across a range. `ref_height_mm` locks scale across a product line instead.

## Job file reference

All lengths are **millimetres**, angles **degrees**, colours **sRGB hex**. Products face -Y (the
camera) and sit on z = 0. Positions are `[x, y]` in mm (x right, y away from camera).

```jsonc
{
  "output": "../previews/name.png",      // .png .jpg .webp .exr .tif
  "resolution": 1600,                    // long edge in px, or [w, h]
  "scale_mm": null,                      // optional: force the scene scale (default: subject size)
  "cache_dir": "cache",                  // gobo masks are cached here (deterministic per seed)
  "backdrop": { ... }, "lighting": { ... }, "world": { ... }, "sun": { ... }, "gobo": { ... },
  "props": [ ... ], "products": [ ... ], "camera": { ... }, "render": { ... }
}
```

### backdrop

| key | default | meaning |
|---|---|---|
| `type` | `"sweep"` | `sweep` (floor curving into a wall), `floor`, `shadow_catcher` (for transparent renders), `none` |
| `color` | `#EAE2D8` | paper colour; with `match` this is the colour the backdrop *renders* as |
| `wall_color` | none | two-tone set (floor `color`, wall `wall_color`), blended through the cove; disables `match` |
| `match` | `true` unless a `sun` is set | colour-lock the rendered backdrop to `match_color` (default `color`) |
| `match_regions` | frame edges | list of `[x0, y0, x1, y1]` frame fractions (y from top) to measure |
| `radius_mm`, `gap_mm` | 2.6 S, 0.45 S | cove radius; distance from the back of the set to the start of the cove. Heroes with sun: small values (150-200, 60-90) so shadows climb the wall |
| `width_mm`, `floor_mm`, `height_mm` | 30 S, 14 S, 12 S | sweep size (S = subject size) |
| `roughness`, `grain` | 0.92, 0 | paper finish; `grain` adds a fine paper bump (0.01-0.05) |
| `shadowless_lights` | rims, strip, fill, background | lights that cast no shadow on a `shadow_catcher` |

### lighting, world, sun, gobo

```jsonc
"lighting": {
  "preset": "soft_studio",   // soft_studio | high_key | sunlit | window | dramatic
  "intensity": 1.0,          // multiplies every light
  "mirror": false,           // key from the right instead of the left
  "kelvin_shift": 0,         // + warmer/cooler on every light (K)
  "white_balance": 5600,     // the colour temperature that renders neutral
  "scale_mm": null,          // optional light-rig scale (default: subject size)
  "flags": true,             // false removes the black edge cards
  "lights": [                // override preset lights by name, disable them, or add new ones
    {"name": "fill", "E": 0.7},
    {"name": "top", "enabled": false},
    {"name": "kicker", "az": 150, "el": 20, "dist": 4, "size": [0.4, 3], "E": 2.5, "kelvin": 6000}
  ]
},
"world": {"color": "#6E6863", "strength": 0.05, "hdri": "studio", "hdri_strength": 0.3, "hdri_rotation_deg": 0},
"sun":   {"az": -60, "el": 26, "strength": 5.5, "angle": 1.4, "kelvin": 4300},
"gobo":  {"pattern": "leaves", "seed": 5, "distance": 600, "size": 1300, "coverage": 1.8, "leaf_scale": 0.85, "rotation": 0}
```

* Light fields: `az` (0 = camera side, + = camera right), `el`, `dist` and `size [w, h]` in units of
  the scene scale S, `E` = irradiance at the subject (W/m^2; about 8 for a key), or `power` in W,
  `kelvin` or `color`, `spread`, `shape` (`RECTANGLE`, `ELLIPSE`, `DISK`). A light with
  `"aim": "backdrop"` sits above the set and pools on the sweep `behind` x S behind the products.
* Presets. `soft_studio`: key, front strip, fill, two rim strips, top, background pool and flags.
  `high_key`: brighter, lower contrast. `sunlit`: sky fill and bounce, made for `sun` + `gobo`.
  `window`: big side source. `dramatic`: dark set with hard rims.
* `world.hdri` accepts Blender's bundled studio lights (`studio`, `interior`, `courtyard`, `sunrise`,
  `sunset`, `forest`, `city`, `night`) or a path to an .exr/.hdr.
* `sun`: `angle` is the sun's apparent size (softness). Keep `az` between -110 and 110 so the sweep's
  wall does not shadow the set.
* `gobo`: a plane between sun and set with a procedural alpha mask (`leaves`, `palm`, `window`,
  `blinds`), invisible to camera and reflections. Via shadow linking it blocks only the sun.
  `distance` and `size` are in mm (penumbra = distance x sun angle). Change `seed` / `rotation` to
  move the leaves across the products.

### products

```jsonc
{
  "id": "dew_serum",
  "type": "dropper",               // dropper | pump | mist | cylinder | jar | tube | stick | compact
  "dims": {"d": 32, "h": 72, "fill": 0.8},
  "materials": {"body": "glass_frosted", "collar": "metal_champagne_brushed"},
  "labels": [{"image": "labels/dropper_ink.png", "mode": "ink", "ink": "#2C2521", "height_mm": 25}],
  "print": null,                   // tubes only: artwork printed on the tube, see below
  "position": [0, 0], "rotation": 0,
  "on": "plinth_mid"               // stand on a prop (z = its top)
}
```

**Dimensions (mm) and parts** (defaults shown; every value is optional):

| type | dims | parts (material roles) |
|---|---|---|
| `dropper` | `d 32, h 72` (glass incl. neck), `shoulder "round"\|"slope"`, `shoulder_r 7.5`, `shoulder_angle 32`, `neck_d 18, neck_h 9.5`, `wall 2.2, base_t 6.5, neck_wall 2.4`, `punt 0.8, base_r 2.5`, `collar_d 22.5, collar_h 15, collar_top_r 1.6, collar_ribs`, `bulb_d 14, bulb_h 21, flange_d 17, flange_h 2.6, bulb_waist 0.5`, `pipette true, pipette_d 7`, `fill 0.78`, `flutes` | body, liquid, collar, bulb, pipette, pipette_liquid |
| `pump` | `d 44, h 112, shoulder_r 6, neck_d 20, neck_h 9, wall 2.6, base_t 7`, `collar_d 25, collar_h 12, collar_ribs` (knurled by default; `false` = smooth), `head_d 21, head_h 15, stem_d 6.5, stem_h 5`, `nozzle_len 15, nozzle_d 5.6, nozzle_angle 0` (0 = points right), `fill 0.85, dip_tube true` | body, liquid, collar, stem, head, nozzle, dip_tube |
| `mist` | `d 40, h 106, shoulder_r 7, neck_d 17, neck_h 8`, `ferrule_d 20, ferrule_h 9.5, ferrule_ribs`, `actuator_d 12.5, actuator_h 11`, `overcap true, overcap_d 27, overcap_h 42, overcap_wall 1.4, overcap_top_r 3.5`, `fill 0.8` | body, liquid, ferrule, stem, actuator, orifice, overcap, dip_tube |
| `cylinder` | `d 40, h 128, shoulder_r 3.5, neck_d 22, neck_h 11, base_t 7`, `cap_d 30, cap_h 32, cap_top_r 1.8, cap_bottom_r 0.6, cap_ribs`, `fill 0.86` | body, liquid, cap (anchor `cap_top`) |
| `jar` | `d 64, body_h 40, neck_h 7, neck_inset 2.8, neck_wall 4.5, bottom 11, base_r 4`, `lid "on"\|"off"\|"beside"`, `lid_d (d+0.5), lid_h 22, lid_top_r 2.8, lid_wall 2.2, lid_ribs`, `fill 0.9, swirl true` (cream swirl when the lid is off) | body, contents, lid (anchor `lid_top`) |
| `tube` | `d 36, length 150` (stands on its cap), `cap_d (=d), cap_h 18, cap_floor_r 1.6, cap_ribs`, `shoulder_h 5, crimp_h 9, flat_start 0.3, end_thickness 0.9` | body, cap, shoulder |
| `stick` | `d 22, h 78, cap_h 30, seam 0.35, top_r 2` | base, cap (anchor `cap_top`) |
| `compact` | `d 72, h 16, split 0.48, top_r 3, seam 0.4` | base, lid (anchor `lid_top`) |

All bottle types share the body parameters (`shoulder`, `wall`, `base_t`, `neck_wall`, `punt`,
`base_r`, `flutes`, `segments`). Closures rest on the shoulder automatically. `fill` is the liquid
level as a fraction of the straight wall (up to about 1.15 reaches into the shoulder).

**Ribs, flutes and knurling**: `{"count": 28, "depth": 0.7, "style": "reeded"|"fluted"|"knurl",
"z0": 10, "z1": 50, "fade": 2}` on `flutes` (glass body, outer surface only) or on any
`*_ribs` (closures).

### materials

A spec is a preset name, a hex colour (matte plastic in that colour), or a dict starting from a
preset: `{"preset": "glass_tinted", "color": "#E7BBAE", "tint_mm": 5}`.

| family | presets | main parameters |
|---|---|---|
| glass | `glass_clear`, `glass_frosted`, `glass_amber`, `glass_amber_frosted`, `glass_tinted`, `glass_tinted_frosted`, `glass_smoke`, `plastic_clear`, `plastic_frosted` | `color` (look through `tint_mm`), `tint_mm`, `roughness` (frost), `inner_roughness`, `ior`, `dispersion`, `shadow` (glass shadows on/off) |
| opal / milk glass | `glass_opal` | `color`, `roughness`, `sss_mm`, `coat` |
| plastic | `plastic_matte`, `plastic_softtouch`, `plastic_satin`, `plastic_gloss` | `color`, `roughness`, `coat`, `sheen`, `specular` |
| metal | `metal_{gold,champagne,silver,rose}_{brushed,polished}`, `metal_chrome` | `metal` (gold, champagne, silver, rose, chrome, bronze, gunmetal, brass, copper, pewter) or `color`, `roughness`, `brushed`, `anisotropy` |
| ceramic / stone | `ceramic_glazed`, `ceramic_matte`, `stone`, `travertine`, `marble`, `plaster` | `color`, `roughness`, `coat`, `speckle` (ceramic); travertine `color, color2, line, pore, pores, banding, scale`; marble `color, vein, veins, scale` |
| rubber | `rubber`, `silicone` | `color`, `roughness`, `sheen`, `sss` |
| contents | `liquid`, `oil`, `water`, `gel`, `cream`, `lotion` | liquids: `color` + `tint_mm` (colour through that depth), `ior`; creams: `color`, `sss_mm` |
| set | `leaf`, `eucalyptus` | `color`, `back`, `translucency` |

### labels

Wrap labels (`"type": "wrap"`, default) are conforming sleeves 0.05 mm proud of the body. They
follow the outer profile, so they also wrap over tapering shoulders.

| key | default | meaning |
|---|---|---|
| `image` | required | PNG with alpha. Make it at the printed size: 40 px/mm reads crisply at 2048 px |
| `mode` | `ink` | `ink`: one-colour screen print from the alpha (`ink` = hex or `white`/`black`/`espresso`/`gold`). `foil`: hot-foil metal (`foil` = metal name or hex). `print`: full-colour ink from the PNG. `paper`: opaque paper label with a 0.12 mm edge and a white back |
| `z_mm` | centre of the straight wall | label centre height above the base |
| `height_mm` | 62% of the wall | printed height. Width comes from the image aspect (never stretched) unless `arc_deg` is given |
| `arc_deg`, `angle_deg` | auto, 0 | wrap angle; rotation around the bottle (0 = facing camera) |
| `emboss`, `roughness`, `opacity`, `paper`, `thickness_mm` | 0.25, auto, 1, `#F4EFE8`, 0.12 | ink relief, finish, paper back colour, paper thickness |

Decals (`"type": "decal"`) are flat labels for lids, cap tops and compacts: `"anchor": "lid_top"`
(or `cap_top`), or `"center_mm": [x, y, z]` with `"normal": "+Z"|"-Y"`, plus `width_mm` and
`rotation_deg`. Modes are the same.

Tube print (product-level `"print"`): artwork printed through the tube body's UVs (u around the
tube, v along it), so it follows the round-to-flat surface:
`{"image", "mode", "ink", "z_mm" (centre, from the floor), "height_mm", "width_mm", "angle_deg"}`.

### props

| type | keys |
|---|---|
| `plinth` | `shape`: `cylinder` (`d`, `h`), `block`/`step` (`w`, `depth`, `h`), `sphere` (`d`), `dome` (`d`), `arch` (`w`, `h`, `depth`); `edge_r` rounding; `material` (`travertine`, `marble`, `plaster`, `stone`, any spec); `position`, `rotation`, `on` |
| `glass_sphere` | `d`, `material`, `position`, `on` |
| `water` | shallow pool: `w`, `depth`, `level` (mm above the floor), `position`, `ripple_center` [x, y], `ripple_scale`, `ripple_strength`, `caustics`, `tint` (wet-floor darkening). Products inside stand in the water |
| `sprig` | `kind` (`olive`, `eucalyptus`), `length`, `position`, `rotation`, `seed`, `leaves`, `material` |

Every prop takes `"frame": false` to be ignored by camera framing (water is ignored by default).

### camera

| key | default | meaning |
|---|---|---|
| `preset` | `packshot_1x1` | `packshot_1x1` (100 mm, 5 deg), `pdp_4x5` (90 mm), `lineup_3x2` (85 mm), `hero_16x9` (60 mm, subject right), `hero_21x9` (50 mm), `mobile_hero_4x5` (50 mm, subject low, copy space on top) |
| `subjects` | `products` | what to frame: `products`, `all` (products + props), or a list of ids |
| `fill` | per preset | fraction of the frame the subject may fill, number or `[w, h]` |
| `offset` | per preset | subject centre in frame fractions `[x, y]` (+x right, +y up) |
| `focal_length`, `elevation`, `azimuth`, `roll` | per preset, 0, 0 | lens (mm), camera height angle, orbit, tilt |
| `keep_verticals` | `true` | level camera + lens shift (no converging verticals) |
| `ref_height_mm` | none | fixed scale: frame as if the subject were this tall (consistent scale across a range) |
| `dof` | none | `{"f_stop": 5.6, "focus_mm": [x, y, z], "depth_bias": 0.35}` (default focus: front third of the subject) |
| `aspect` | per preset | override, e.g. `[3, 4]` |

### render

| key | default | meaning |
|---|---|---|
| `samples`, `adaptive_threshold` | 64, 0.02 | max samples per pixel; adaptive noise threshold |
| `seed` | 7 | deterministic noise pattern |
| `view_transform`, `look`, `exposure` | `AgX`, `AgX - Medium High Contrast`, 0 | colour management. `Khronos PBR Neutral` is the alternative when product colours must match swatches 1:1 |
| `transparent` | false | transparent film and glass. Pair with `backdrop.type: shadow_catcher` for cut-outs with a soft shadow |
| `denoise`, `threads` | true, 3 | OpenImageDenoise (albedo + normal); CPU threads |
| `clamp_indirect`, `filter_glossy`, `caustics`, `guiding` | 10, 0.6, false, false | firefly control; real caustics; CPU path guiding |
| `bounces` | max 24, transmission 24 | `{"diffuse": 4, "glossy": 8, "transmission": 24, "transparent": 24}` |
| `color_depth` | 8 | 16 for PNG/TIFF masters |

## Python API

```python
import sys; sys.path.insert(0, "renders/rig")
import lumora_rig as rig

rig.reset()
p = rig.make_pump(d=44, h=112, materials={"body": "glass_amber", "head": "#F1EBE3"})
rig.add_label(p, "label.png", mode="paper", height_mm=40)
p.place(0, 0, rot_deg=-10)
rig.add_sweep("#E8DED2")
rig.apply_lighting("soft_studio", target=(0, 0, 0.06), scale=0.15,
                   backdrop={"wall_y": 0.6, "radius": 0.4, "back_y": 0.03})
rig.setup_camera(p.objects(), "pdp_4x5", 1600)
rig.configure_render(samples=128)
rig.render_still("pump.png")
```

Building blocks: `fillet`, `offset_left`, `shell_profile`, `revolve` (profiles -> meshes); `material`,
`glass_pair`, `PRESETS`; `make_*` generators; `add_label`, `add_decal`; `add_sweep`, `set_world`,
`apply_lighting`, `add_area_light`, `add_sun`, `add_gobo`, `gobo_mask`; `add_plinth`,
`add_glass_sphere`, `add_water`, `add_sprig`; `setup_camera`; `configure_render`, `match_backdrop`,
`render_still`; `build_scene` / `run_job` for job dicts.

## Known limitations

* Shapes are rotationally symmetric (plus lofted tubes). Square or oval bottles, faceted
  "perfume" glass and asymmetric pumps need new generators (the profile/loft helpers are the base).
* Glass shadows are a fast approximation (transparent, edge-darkened shadow rays), not real
  caustics; `render.caustics: true` adds true caustic paths at a large noise cost.
* Liquid surfaces are flat with a rounded edge; there is no true meniscus or bubbles. Liquid in
  a pipette is set to the bottle's level. Nested dielectrics use a 0.08 mm overlap (Cycles has no
  priority-based nesting); refraction is plausible but not exact at the glass-liquid interface.
* The water prop is a single rippled surface; its caustics are a procedural pattern in its shadow,
  and the water has no volume.
* The sprig is a simple stylised branch: fine at hero distances, not for macro close-ups.
* The colour lock adjusts single-colour sweeps only (not two-tone or sunlit sets). It costs about
  5 s per job.
* AgX desaturates bright colours by design. The colour lock compensates on the backdrop, but very
  saturated product colours may need `Khronos PBR Neutral` for swatch-accurate reproduction.
* Label artwork must be supplied at physical size: wraps never stretch, so a wrong aspect
  becomes a wrong arc. Very wide wraps (over 200 degrees) show distortion at the sides, as real ones do.
* CPU-only and shared cores: final-quality frames are slow here (see timings above).
