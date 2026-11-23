#!/usr/bin/env python3
"""The "Lumora Golden Hour" grade (brand/concepts/golden-hour.md, section 4.5).

One look for every photo and every render, applied identically:

    white balance  warm by ~+500 K (CIE daylight 6500 K -> 6000 K), tint +4 toward magenta
    highlights     tinted toward Honey #F2CB8C at 12%   (luminance-preserving)
    shadows        tinted toward Dusk plum #3A2422 at 15% (luminance-preserving)
    black point    lifted to #2A1A18  (nothing is pure black)   } as a toe/shoulder curve, so the ends
    white point    capped at #FBF3EA  (nothing is pure white)   } are exact but midtones keep their color
    contrast       gentle S-curve
    clipped whites WB and Honey ease off above ~85% so whites land on #FBF3EA, not butter-cream
    saturation     -8% overall; the orange-red band (skin, amber glass) is protected
    orange luma    +6%
    clarity        -5 (soft focus: midtone local contrast eased toward a wide blur)
    halation       faint warm bloom on speculars only
    grain          35 mm-style monochrome grain as a 2.5% layer (~0.8% sigma), strongest in midtones

Black and white points are applied last, so every output pixel lies inside
#2A1A18..#FBF3EA per channel, grain included.

Usage
    python3 grade.py IN OUT                    grade one image
    python3 grade.py --dir SRC --out DST       grade every jpg/png/webp in SRC into DST/<stem>.jpg
Options
    --max 2400      long-side cap in px (downscale only; grain is added at the final size)
    --quality 88    JPEG quality
    --label-safe    skip clarity (for renders with product labels; section 4.5 "never on labels")

Import
    from grade import grade_image, grade_file   (Pillow + numpy only)
"""
from __future__ import annotations

import argparse
import sys
import zlib
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

# ---- brand constants (section 4.5) ------------------------------------------------------------
HONEY = np.array([0xF2, 0xCB, 0x8C]) / 255.0
DUSK_PLUM = np.array([0x3A, 0x24, 0x22]) / 255.0
BLACK_POINT = np.array([0x2A, 0x1A, 0x18]) / 255.0
WHITE_POINT = np.array([0xFB, 0xF3, 0xEA]) / 255.0

WB_SHIFT_K = 500        # warmer by ~500 K
WB_TINT = 4             # toward magenta
HIGHLIGHT_TINT = 0.12
SHADOW_TINT = 0.15
SATURATION = -0.08
ORANGE_LUMA = 0.06
CLARITY = 0.08          # "-5": share of midtone local contrast removed
CONTRAST = 0.08         # gentle S (midtone slope 1 + CONTRAST)
LEVELS_K = 2.5          # toe/shoulder exponent of the black/white point curve
HALATION = 0.10
GRAIN_SIGMA = 0.008     # a full-range grain plate at ~2.5% opacity (brief: grain at 2 to 3%)
HALATION_TINT = np.array([0xF2, 0x9E, 0x6E]) / 255.0  # warm apricot-red bloom

LUMA = np.array([0.2126, 0.7152, 0.0722])
_XYZ_TO_SRGB = np.array([[3.2406, -1.5372, -0.4986],
                         [-0.9689, 1.8758, 0.0415],
                         [0.0557, -0.2040, 1.0570]])


def _daylight_rgb(kelvin: float) -> np.ndarray:
    """Linear sRGB of the CIE daylight locus at `kelvin` (Y = 1)."""
    t = float(kelvin)
    if t <= 7000:
        x = -4.6070e9 / t**3 + 2.9678e6 / t**2 + 0.09911e3 / t + 0.244063
    else:
        x = -2.0064e9 / t**3 + 1.9018e6 / t**2 + 0.24748e3 / t + 0.237040
    y = -3.000 * x * x + 2.870 * x - 0.275
    return _XYZ_TO_SRGB @ np.array([x / y, 1.0, (1 - x - y) / y])


def white_balance_gains(shift_k: float = WB_SHIFT_K, tint: float = WB_TINT, base_k: float = 6500) -> np.ndarray:
    """Per-channel linear gains that warm the image by `shift_k` and push `tint` toward magenta."""
    g = _daylight_rgb(base_k - shift_k) / _daylight_rgb(base_k)
    g[1] *= 1.0 - 0.003 * tint
    return g / float(LUMA @ g)  # luminance-neutral


def _srgb_to_linear(c: np.ndarray) -> np.ndarray:
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _linear_to_srgb(c: np.ndarray) -> np.ndarray:
    c = np.clip(c, 0.0, None)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def _smoothstep(e0: float, e1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def _hue_sat(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = mx - mn + 1e-8
    h = np.where(mx == r, ((g - b) / d) % 6.0, np.where(mx == g, (b - r) / d + 2.0, (r - g) / d + 4.0)) * 60.0
    return h, (mx - mn) / (mx + 1e-8)


def _hue_window(h: np.ndarray, center: float, full: float, zero: float) -> np.ndarray:
    """1 within +-full degrees of center, fading linearly to 0 at +-zero."""
    d = np.abs(h - center)
    d = np.minimum(d, 360.0 - d)
    return np.clip((zero - d) / (zero - full), 0.0, 1.0)


def _chroma_of(c: np.ndarray) -> np.ndarray:
    return c / float(LUMA @ c)


def grade_color(rgb: np.ndarray) -> np.ndarray:
    """Per-pixel part of the grade (no spatial effects, no output levels). rgb: float sRGB 0..1."""
    # 1. white balance in linear light
    lin = _srgb_to_linear(np.clip(rgb, 0.0, 1.0))
    ease = _smoothstep(0.70, 1.0, lin @ LUMA)[..., None]   # clipped whites stay on the white point
    lin = lin * (1.0 + (white_balance_gains() - 1.0) * (1.0 - ease))
    rgb = np.clip(_linear_to_srgb(lin), 0.0, 1.0)

    # 2. gentle S-curve (ends fixed at 0 and 1)
    rgb = rgb - CONTRAST * np.sin(2 * np.pi * rgb) / (2 * np.pi)

    # 3. saturation -8% with the orange-red band protected; orange luminance +6%
    h, s = _hue_sat(rgb)
    protect = _hue_window(h, 20.0, 20.0, 40.0)          # 0..40 deg fully protected (skin, amber)
    y = (rgb @ LUMA)[..., None]
    k = (1.0 + SATURATION * (1.0 - protect))[..., None]
    rgb = y + k * (rgb - y)
    orange = _hue_window(h, 30.0, 10.0, 25.0) * np.clip(s / 0.25, 0.0, 1.0)
    rgb = rgb * (1.0 + ORANGE_LUMA * orange)[..., None]

    # 4. split tone, luminance-preserving: highlights to Honey, shadows to Dusk plum
    y = np.clip(rgb @ LUMA, 0.0, 1.0)
    wh = (_smoothstep(0.50, 0.90, y) * (1.0 - _smoothstep(0.90, 1.0, y)))[..., None]
    ws = (1.0 - _smoothstep(0.08, 0.50, y))[..., None]
    rgb = rgb * (1.0 + HIGHLIGHT_TINT * wh * (_chroma_of(HONEY) - 1.0))
    rgb = rgb * (1.0 + SHADOW_TINT * ws * (_chroma_of(DUSK_PLUM) - 1.0))
    return np.clip(rgb, 0.0, 1.0)


def apply_levels(rgb: np.ndarray) -> np.ndarray:
    """Black/white points per channel: 0 -> #2A1A18 and 1 -> #FBF3EA exactly, monotonic in between.
    The lift is a toe and the cap a shoulder (exponent LEVELS_K), so midtones are not hazed or cast."""
    x = np.clip(rgb, 0.0, 1.0)
    return x + BLACK_POINT * (1.0 - x) ** LEVELS_K - (1.0 - WHITE_POINT) * x ** LEVELS_K


def _blur(arr: np.ndarray, radius: float) -> np.ndarray:
    """Gaussian blur of a float array (H, W) or (H, W, 3). Pillow blurs 8-bit only, so each plane is
    range-normalized to 0..255 first; the blurred layers are blended at <=10%, so 8-bit steps vanish."""
    if arr.ndim == 3:
        return np.stack([_blur(arr[..., i], radius) for i in range(arr.shape[-1])], axis=-1)
    lo, hi = float(arr.min()), float(arr.max())
    span = (hi - lo) or 1.0
    u8 = np.round((arr - lo) / span * 255.0).astype(np.uint8)
    out = np.asarray(Image.fromarray(u8, "L").filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32)
    return out / 255.0 * span + lo


def grade_image(img: Image.Image, *, seed: int = 0, label_safe: bool = False, grain: bool = True) -> Image.Image:
    """Grade a PIL image and return an 8-bit RGB PIL image."""
    img = ImageOps.exif_transpose(img).convert("RGB")
    rgb = np.asarray(img, dtype=np.float32) / 255.0
    long_side = max(rgb.shape[:2])

    rgb = grade_color(rgb)

    # clarity -5: ease midtone local contrast toward a wide blur (soft focus)
    if not label_safe and CLARITY > 0:
        y = rgb @ LUMA
        mid = (4.0 * y * (1.0 - y))[..., None]
        rgb = rgb + CLARITY * mid * (_blur(rgb, 0.012 * long_side) - rgb)

    # faint warm halation on speculars (screen blend)
    y = rgb @ LUMA
    spec = _smoothstep(0.80, 0.98, y) ** 2
    if spec.max() > 0:
        bloom = _blur(spec, 0.006 * long_side)[..., None] * HALATION_TINT
        rgb = 1.0 - (1.0 - rgb) * (1.0 - HALATION * bloom)

    # 35 mm grain: monochrome, slightly clumped, strongest in the midtones, deterministic per seed
    if grain and GRAIN_SIGMA > 0:
        rng = np.random.default_rng(seed)
        n = _blur(rng.standard_normal(rgb.shape[:2]).astype(np.float32), 0.55)
        n = (n - n.mean()) / (n.std() + 1e-8)
        y = rgb @ LUMA
        weight = 0.45 + 0.55 * 4.0 * y * (1.0 - y)
        rgb = rgb + (GRAIN_SIGMA * weight * n)[..., None]

    out = apply_levels(rgb)
    return Image.fromarray(np.round(out * 255.0).astype(np.uint8), "RGB")


def grade_file(src: Path, dst: Path, *, max_side: int = 2400, quality: int = 88, label_safe: bool = False) -> tuple[int, int]:
    """Load, downscale to max_side, grade and save as JPEG. Returns (width, height)."""
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        if max(im.size) > max_side:
            scale = max_side / max(im.size)
            im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        out = grade_image(im, seed=zlib.crc32(Path(dst).stem.encode()), label_safe=label_safe)
    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)
    return out.size


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Apply the Lumora Golden Hour grade.")
    ap.add_argument("src", nargs="?", help="input image")
    ap.add_argument("dst", nargs="?", help="output .jpg")
    ap.add_argument("--dir", help="grade every image in this folder")
    ap.add_argument("--out", help="output folder for --dir")
    ap.add_argument("--max", type=int, default=2400)
    ap.add_argument("--quality", type=int, default=88)
    ap.add_argument("--label-safe", action="store_true", help="skip clarity (renders with labels)")
    a = ap.parse_args(argv)
    if a.dir:
        if not a.out:
            ap.error("--dir needs --out")
        files = sorted(p for p in Path(a.dir).iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"})
        for p in files:
            size = grade_file(p, Path(a.out) / f"{p.stem}.jpg", max_side=a.max, quality=a.quality, label_safe=a.label_safe)
            print(f"{p.name} -> {a.out}/{p.stem}.jpg {size[0]}x{size[1]}")
        return 0
    if not (a.src and a.dst):
        ap.error("give IN OUT, or --dir SRC --out DST")
    size = grade_file(Path(a.src), Path(a.dst), max_side=a.max, quality=a.quality, label_safe=a.label_safe)
    print(f"{a.src} -> {a.dst} {size[0]}x{size[1]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
