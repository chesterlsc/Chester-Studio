"""
finish.py - turn a rig PNG into a deliverable JPEG and record it in renders/manifest.json.

    python3 finish.py in.png out.jpg [--grade] [--id hero-desktop --use "..." --status preview|final]

* JPEG quality 90, 4:4:4, sRGB ICC profile embedded.
* --grade applies the "Lumora Golden Hour" grade (golden-hour.md 4.5) for scenes: highlights toward
  Honey #F2CB8C (12%), shadows toward Dusk plum #3A2422 (15%), black point #2A1A18, white point
  #FBF3EA, saturation -8% with the orange band protected, fine 35 mm-style grain (~2%).
  Packshots are NOT graded: their Sand sweep is colour-locked to the card tile (#E9D9C5).
* --id updates (or adds) the manifest entry {id, path, use, width, height, status}.
"""
import argparse
import datetime
import json
import os

import numpy as np
from PIL import Image, ImageCms, ImageFilter

MANIFEST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "manifest.json")


def hexf(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)])


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def grade(im, seed=7):
    a = np.asarray(im.convert("RGB")).astype(np.float32) / 255.0
    lum = a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    for tint, w, lo, hi in ((hexf("#F2CB8C"), 0.12, 0.45, 1.0), (hexf("#3A2422"), 0.15, None, None)):
        d = tint / (tint @ np.array([0.2126, 0.7152, 0.0722]))
        wt = smooth(lo, hi, lum) * w if lo is not None else (1 - smooth(0.0, 0.5, lum)) * w
        a = a * (1 + wt[..., None] * (d[None, None, :] - 1))
    # saturation -8%, orange-red band (skin, amber glass) protected
    mx, mn = a.max(-1), a.min(-1)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    hue = np.degrees(np.arctan2(np.sqrt(3) * (g - b), 2 * r - g - b)) % 360
    prot = smooth(0, 12, hue) * (1 - smooth(48, 62, hue)) + (1 - smooth(345, 359, hue)) * (hue > 300)
    k = 1 - 0.08 * (1 - np.clip(prot, 0, 1))
    l2 = a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    a = l2[..., None] + (a - l2[..., None]) * k[..., None]
    # black and white points
    bp, wp = hexf("#2A1A18"), hexf("#FBF3EA")
    a = bp + np.clip(a, 0, 1) * (wp - bp)
    # grain: fine, luminance-weighted (strongest in the mid-tones), softened one pixel
    rng = np.random.default_rng(seed)
    n = rng.normal(0, 1, a.shape[:2]).astype(np.float32)
    n = np.asarray(Image.fromarray(((n * 40) + 128).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)),
                   dtype=np.float32)
    n = (n - 128) / 40 * 0.9
    mid = 4 * l2 * (1 - l2)
    a = a + (n * 0.022 * (0.35 + 0.65 * mid))[..., None]
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))


def update_manifest(entry):
    items = []
    if os.path.exists(MANIFEST):
        with open(MANIFEST) as fh:
            items = json.load(fh)
    items = [e for e in items if e.get("id") != entry["id"]] + [entry]
    with open(MANIFEST + ".tmp", "w") as fh:
        json.dump(items, fh, indent=2)
    os.replace(MANIFEST + ".tmp", MANIFEST)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--grade", action="store_true")
    ap.add_argument("--id")
    ap.add_argument("--use", default="")
    ap.add_argument("--status", default="final", choices=["preview", "final"])
    a = ap.parse_args()
    im = Image.open(a.src).convert("RGB")
    if a.grade:
        im = grade(im)
    srgb = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
    os.makedirs(os.path.dirname(os.path.abspath(a.dst)), exist_ok=True)
    tmp = a.dst + ".tmp.jpg"
    im.save(tmp, "JPEG", quality=90, subsampling=0, optimize=True, progressive=True, icc_profile=srgb)
    os.replace(tmp, a.dst)
    print(f"wrote {a.dst} {im.size[0]}x{im.size[1]}{' graded' if a.grade else ''}")
    if a.id:
        update_manifest({"id": a.id, "path": os.path.abspath(a.dst), "use": a.use, "width": im.size[0],
                         "height": im.size[1], "status": a.status,
                         "updated": datetime.datetime.now().isoformat(timespec="seconds")})


if __name__ == "__main__":
    main()
