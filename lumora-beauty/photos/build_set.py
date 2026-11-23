#!/usr/bin/env python3
"""Finish the Lumora editorial photo set from a picks file (photos/shot-list.json is the template).

    python3 build_set.py shot-list.json --orig /path/outside/repo/photos-orig [--out photos/]

Each filled pick needs: slug, slot, subject, alt, photographer, source_url (an Unsplash photo page,
https://unsplash.com/photos/...) and either image_url (https://images.unsplash.com/photo-...) or
local_file (an image already downloaded, e.g. from the photo page's Download button).
Picks without a source are listed as open slots and skipped.

For each pick: original -> ORIG/<slug>.jpg (fetched at ?w=2400&q=85&fm=jpg), graded with grade.py ->
OUT/graded/<slug>.jpg (2400 px long side, q88). Then OUT/manifest.json, OUT/CREDITS.md and
OUT/contact-sheet.jpg are rewritten from the picks that built.

Guards: free Unsplash only (refuses plus.unsplash.com and premium_photo URLs), every image credited,
every image has alt text.
"""
from __future__ import annotations

import argparse
import json
import math
import shutil
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
from grade import grade_file  # noqa: E402

TRAVERTINE, DUSK, DUSK72 = (243, 231, 218), (53, 33, 31), (110, 85, 76)
RATIOS = {"1:1": 1, "4:5": 4 / 5, "3:4": 3 / 4, "2:3": 2 / 3, "9:16": 9 / 16,
          "5:4": 5 / 4, "4:3": 4 / 3, "3:2": 3 / 2, "16:9": 16 / 9, "21:9": 21 / 9}


def check_pick(p: dict) -> str | None:
    for key in ("slug", "slot", "subject", "alt", "photographer", "source_url"):
        if not str(p.get(key, "")).strip():
            return f"missing {key}"
    src = urllib.parse.urlparse(p["source_url"])
    if src.netloc != "unsplash.com" or not src.path.startswith("/photos/"):
        return "source_url must be an https://unsplash.com/photos/... page"
    if p.get("image_url"):
        img = urllib.parse.urlparse(p["image_url"])
        if img.netloc != "images.unsplash.com" or not img.path.startswith("/photo-"):
            return "image_url must be https://images.unsplash.com/photo-... (free licence only)"
    elif not p.get("local_file"):
        return "needs image_url or local_file"
    if "plus.unsplash.com" in json.dumps(p) or "premium" in json.dumps(p).lower():
        return "Unsplash+ / premium image: not allowed"
    return None


def fetch_original(p: dict, orig: Path) -> Path:
    dst = orig / f"{p['slug']}.jpg"
    if dst.exists():
        return dst
    orig.mkdir(parents=True, exist_ok=True)
    if p.get("local_file"):
        shutil.copyfile(p["local_file"], dst)
        return dst
    u = urllib.parse.urlparse(p["image_url"])
    url = urllib.parse.urlunparse(u._replace(query="w=2400&q=85&fm=jpg"))
    with urllib.request.urlopen(url, timeout=60) as r, open(dst, "wb") as f:
        shutil.copyfileobj(r, f)
    return dst


def aspect_label(w: int, h: int) -> str:
    r = w / h
    name, target = min(RATIOS.items(), key=lambda kv: abs(math.log(r / kv[1])))
    return name if abs(math.log(r / target)) < 0.02 else f"{r:.2f}:1"


def contact_sheet(entries: list[dict], out_dir: Path, dst: Path, cols: int = 5) -> None:
    cw, ch, cap, pad = 400, 500, 64, 28
    rows = math.ceil(len(entries) / cols)
    top = 96
    sheet = Image.new("RGB", (pad + cols * (cw + pad), top + rows * (ch + cap + pad) + pad), TRAVERTINE)
    d = ImageDraw.Draw(sheet)
    title, small = ImageFont.load_default(28), ImageFont.load_default(17)
    d.text((pad, 34), f"Lumora Beauty: editorial photography, graded 'Lumora Golden Hour' ({len(entries)} images)",
           fill=DUSK, font=title)
    for i, e in enumerate(entries):
        x = pad + (i % cols) * (cw + pad)
        y = top + (i // cols) * (ch + cap + pad)
        with Image.open(out_dir / e["file"]) as im:
            im = im.convert("RGB")
            im.thumbnail((cw, ch), Image.LANCZOS)
            sheet.paste(im, (x + (cw - im.width) // 2, y + (ch - im.height) // 2))
        d.text((x, y + ch + 8), f"{i + 1:02d}  {e['file'].split('/')[-1]}  ({e['aspect']})", fill=DUSK, font=small)
        d.text((x, y + ch + 32), e["slot"][:52], fill=DUSK72, font=small)
    sheet.save(dst, "JPEG", quality=86, optimize=True)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("picks")
    ap.add_argument("--orig", required=True, help="folder for untouched originals (keep it outside the repo)")
    ap.add_argument("--out", default=str(Path(__file__).resolve().parent))
    a = ap.parse_args(argv)
    data = json.loads(Path(a.picks).read_text())
    picks = data["picks"] if isinstance(data, dict) else data
    out_dir, orig = Path(a.out), Path(a.orig)

    entries, open_slots, errors = [], [], []
    for p in picks:
        if not (p.get("source_url") or p.get("image_url") or p.get("local_file")):
            open_slots.append(p.get("slug", "?"))
            continue
        problem = check_pick(p)
        if problem:
            errors.append(f"{p.get('slug', '?')}: {problem}")
            continue
        src = fetch_original(p, orig)
        w, h = grade_file(src, out_dir / "graded" / f"{p['slug']}.jpg")
        entries.append({
            "file": f"graded/{p['slug']}.jpg", "slot": p["slot"], "subject": p["subject"],
            "aspect": aspect_label(w, h),
            "orientation": "square" if abs(w - h) <= 0.02 * max(w, h) else ("portrait" if h > w else "landscape"),
            "width": w, "height": h,
            "photographer": p["photographer"], "source_url": p["source_url"], "alt": p["alt"],
        })
        print(f"graded {p['slug']} {w}x{h}")

    if errors:
        print("REFUSED:\n  " + "\n  ".join(errors), file=sys.stderr)
    if open_slots:
        print(f"open slots ({len(open_slots)}): {', '.join(open_slots)}")
    if not entries:
        print("nothing built", file=sys.stderr)
        return 1

    (out_dir / "manifest.json").write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n")
    lines = [
        "# Photo credits",
        "",
        "Editorial photography for the Lumora Beauty concept store. All photos are from Unsplash and used under",
        "the [Unsplash License](https://unsplash.com/license) (free photos only, no Unsplash+). Each one is",
        "colour-graded with `photos/grade.py` (\"Lumora Golden Hour\", brand/concepts/golden-hour.md section 4.5).",
        "",
        "| File | Photographer | Unsplash page |",
        "|---|---|---|",
    ]
    lines += [f"| `{e['file']}` | {e['photographer']} | {e['source_url']} |" for e in entries]
    (out_dir / "CREDITS.md").write_text("\n".join(lines) + "\n")
    contact_sheet(entries, out_dir, out_dir / "contact-sheet.jpg")
    print(f"wrote manifest.json, CREDITS.md, contact-sheet.jpg ({len(entries)} images) in {out_dir}")
    return 0 if not errors else 2


if __name__ == "__main__":
    sys.exit(main())
