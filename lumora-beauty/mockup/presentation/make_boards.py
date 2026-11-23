"""Build the 5 presentation images for the Lumora mockups.

    python3 lumora-beauty/mockup/presentation/make_boards.py
Writes HTML boards + screen crops to this folder's build/, then renders
01..05 JPEGs into this folder with board_shot.cjs (Playwright).
"""
import os
import subprocess

from PIL import Image

Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.abspath(os.path.join(HERE, "..", ".."))
B = os.path.join(HERE, "build")
os.makedirs(B, exist_ok=True)
SP = "/tmp/claude-0/-home-user-Chester-Studio/c51c471c-f281-5048-b5b7-f7b60a856929/scratchpad"

import json
import sys

# Optional config JSON (see v2-config.json); without it the v1 boards are rebuilt.
CFG = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else {}
HOME_DIR = f"{WORK}/mockup/delivered/" + CFG.get("home_dir", "homepage-v3")
PDP_DIR = f"{WORK}/mockup/delivered/" + CFG.get("pdp_dir", "pdp-v2")
HP = CFG.get("home_prefix", "lumora-homepage")
PP = CFG.get("pdp_prefix", "lumora-pdp")
HOME_D1 = f"{HOME_DIR}/{HP}-desktop-1x.jpg"
HOME_HERO = f"{HOME_DIR}/{HP}-hero.jpg"
HOME_M = f"{HOME_DIR}/{HP}-mobile.jpg"
PDP_D1 = f"{PDP_DIR}/{PP}-desktop-1x.jpg"
PDP_M = f"{PDP_DIR}/{PP}-mobile.jpg"
PDP_STICKY = f"{PDP_DIR}/{PP}-mobile-sticky.jpg"
OUTDIR = os.path.join(HERE, CFG.get("out_subdir", ""))
os.makedirs(OUTDIR, exist_ok=True)
NCOLS = CFG.get("columns", 3)


def columns(src, n, name):
    im = Image.open(src).convert("RGB")
    h = (im.height + n - 1) // n
    paths = []
    for i in range(n):
        p = f"{B}/{name}-col{i + 1}.jpg"
        im.crop((0, i * h, im.width, min((i + 1) * h, im.height))).save(p, quality=90)
        paths.append((p, im.width, min(h, im.height - i * h)))
    return paths, h


def top_color(im):
    row = im.crop((0, 0, im.width, 6)).resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    lum = 0.2126 * row[0] + 0.7152 * row[1] + 0.0722 * row[2]
    return "#%02x%02x%02x" % row[:3], ("#FBF6EF" if lum < 140 else "#35211F")


def screens(src, tops_css, name):
    """Crop 390x800 CSS-px windows (2x) so a 44 px status bar can sit above each one."""
    im = Image.open(src).convert("RGB")
    out = []
    for i, t in enumerate(tops_css):
        y = int(t * 2)
        p = f"{B}/{name}-s{i + 1}.jpg"
        c = im.crop((0, y, 780, y + 1600))
        c.save(p, quality=92)
        out.append((p,) + top_color(c))
    return out


def sticky_screen(src, name):
    im = Image.open(src).convert("RGB")
    c = im.crop((0, im.height - 1600, 780, im.height))
    p = f"{B}/{name}.jpg"
    c.save(p, quality=92)
    return (p,) + top_color(c)


HEAD = """<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..400,100,0;1,9..144,300,100,1&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--trav:#F3E7DA;--linen:#FBF6EF;--sand:#E9D9C5;--dusk:#35211F;--dusk72:#6E554C;--terra:#A8473B;--honey:#E8B566}
*{box-sizing:border-box;margin:0}
html,body{width:%(w)dpx;height:%(h)dpx;overflow:hidden}
body{background:radial-gradient(120%% 80%% at 85%% 0%%,#F7E3CC 0%%,var(--trav) 55%%) ;color:var(--dusk);font-family:Figtree,system-ui,sans-serif;padding:%(pad)dpx}
.cap{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:%(capgap)dpx}
.eyebrow{font:600 %(eb)dpx/1 Figtree;letter-spacing:.2em;text-transform:uppercase;color:var(--terra);margin-bottom:%(ebgap)dpx}
h1{font-family:Fraunces;font-variation-settings:"SOFT" 100,"opsz" 72;font-weight:300;font-size:%(h1)dpx;line-height:1;letter-spacing:-.02em}
h1 em{font-style:italic;color:var(--terra);font-variation-settings:"SOFT" 100,"WONK" 1,"opsz" 72}
.sub{font-size:%(sub)dpx;color:var(--dusk72);margin-top:%(subgap)dpx;max-width:70ch;line-height:1.45}
.sig{font-size:%(sig)dpx;color:var(--dusk72);text-align:right;line-height:1.5}
.sig b{color:var(--dusk);font-weight:600}
.browser{background:var(--linen);border-radius:16px;overflow:hidden;box-shadow:0 50px 90px -40px rgba(53,33,31,.45),0 0 0 1px rgba(53,33,31,.08)}
.bar{height:44px;display:flex;align-items:center;gap:8px;padding:0 18px;background:#EFE3D5;border-bottom:1px solid rgba(53,33,31,.08)}
.bar i{width:11px;height:11px;border-radius:50%%;background:#D9C6B3}
.bar span{margin-left:18px;font-size:13px;color:var(--dusk72);background:var(--linen);border-radius:999px;padding:6px 16px}
.browser img{display:block}
.cols{display:flex;gap:%(colgap)dpx;align-items:flex-start}
.col{background:var(--linen);border-radius:10px;overflow:hidden;box-shadow:0 40px 70px -40px rgba(53,33,31,.45),0 0 0 1px rgba(53,33,31,.07)}
.col img{display:block}
.phones{display:flex;gap:56px;justify-content:center}
.phone{position:relative;width:418px;padding:14px;border-radius:62px;background:#24160F;box-shadow:0 60px 90px -45px rgba(53,33,31,.6),inset 0 0 0 2px #4A3028}
.phone .scr{border-radius:48px;overflow:hidden;background:#000}
.phone img{display:block;width:390px;height:800px}
.status{height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 30px 0 34px;font:600 15px/1 Figtree,system-ui;letter-spacing:.01em}
.status svg{height:12px;margin-left:6px;fill:currentColor}
.phone .island{position:absolute;top:22px;left:50%%;transform:translateX(-50%%);width:118px;height:33px;border-radius:20px;background:#0c0705}
.label{text-align:center;margin-top:22px;font:500 15px/1.3 Figtree;color:var(--dusk72)}
.label b{display:block;font:400 22px/1.2 Fraunces;color:var(--dusk);font-variation-settings:"SOFT" 100;margin-bottom:4px}
</style></head><body>"""

STATUS = '<div class="status" style="background:{bg};color:{fg}"><span>9:41</span><span><svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg viewBox="0 0 27 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5"/><rect x="2.5" y="2.5" width="16" height="7" rx="1.6"/><rect x="24" y="4" width="2" height="4" rx="1" opacity=".5"/></svg></span></div>'
SIG = '<div class="sig"><b>Lumora Beauty</b> · concept store for Minimog<br>Design by Chester Studio</div>'


def board(name, w, h, body, pad=110, scale=2, size=None):
    s = dict(w=w, h=h, pad=pad, capgap=56, eb=15, ebgap=16, h1=64, sub=19, subgap=14, sig=15, colgap=56)
    if size:
        s.update(size)
    html = (HEAD % s) + body + "</body></html>"
    p = f"{B}/{name}.html"
    open(p, "w", encoding="utf-8").write(html)
    out = f"{OUTDIR}/{name}.jpg"
    subprocess.run(["node", f"{HERE}/board_shot.cjs", f"file://{p}", out, str(w), str(h), str(scale)], check=True)
    return out


def cap(eyebrow, title, sub):
    return f'<div class="cap"><div><div class="eyebrow">{eyebrow}</div><h1>{title}</h1><div class="sub">{sub}</div></div>{SIG}</div>'


outs = []
# 01 hero in a browser frame
w = 1440 + 220
body = cap("Lumora Beauty · homepage mockup", "Homepage, <em>first screen.</em>",
           "Desktop, 1440 px. Golden-hour hero rendered in 3D, a shoppable pin on the hero product and the promise strip.")
body += f'<div class="browser"><div class="bar"><i></i><i></i><i></i><span>lumora-beauty.myshopify.com</span></div><img src="file://{HOME_HERO}" width="1440" height="900"></div>'
outs.append(board("01-homepage-desktop-hero", w, 110 + 250 + 44 + 900 + 110, body))

# 02 + 03 full pages in 3 columns at 1x
for idx, (src, name, eyebrow, title, sub) in enumerate([
    (HOME_D1, "02-homepage-desktop-full", "Lumora Beauty · homepage mockup", *CFG.get("cap02", ["Homepage, <em>full scroll.</em>",
     "Fifteen sections, each mapped to a Minimog section or a small Custom Liquid block. The page warms from travertine to dusk as you scroll."])),
    (PDP_D1, "03-product-page-desktop", "Lumora Beauty · product page mockup", *CFG.get("cap03", ["Long Light Serum, <em>built to convert.</em>",
     "Buy box above the fold, the golden pair bundle, every ingredient decoded, results with the method, a glow check on every skin tone, FAQ and reviews."])),
]):
    cols, colh = columns(src, NCOLS, name)
    pad = 120
    W = NCOLS * 1440 + (NCOLS - 1) * 70 + 2 * pad
    body = cap(eyebrow, title, sub)
    body += '<div class="cols">' + "".join(f'<div class="col"><img src="file://{p}" width="{cw}" height="{ch}"></div>' for p, cw, ch in cols) + "</div>"
    size = dict(h1=110, eb=24, ebgap=24, sub=30, subgap=22, sig=24, capgap=80, colgap=70)
    outs.append(board(name, W, pad + 390 + colh + pad, body, pad=pad, scale=1, size=size))

# 04 + 05 mobile phones
home_s = screens(HOME_M, CFG.get("home_tops", [0, 1000, 5640, 10571]), "home-m")
pdp_s = screens(PDP_M, CFG.get("pdp_tops", [0, 540, 9530]), "pdp-m") + [sticky_screen(PDP_STICKY, "pdp-m-s4")]
for name, shots, eyebrow, title, sub, labels in [
    ("04-homepage-mobile", home_s, "Lumora Beauty · homepage mockup", "Homepage, <em>on mobile.</em>",
     "Designed for 390 px, not shrunk: its own hero crop, headline and button in the first screen, swipeable product rail, the ritual bundle and the closing promise.",
     CFG.get("home_labels", [("First screen", "Hero, headline and CTA"), ("The sunset shelf", "Swipe rail with peeking cards"), ("The ritual", "Numbered bundle, save 15%"), ("Closing band", "30-day promise into the footer")])),
    ("05-product-page-mobile", pdp_s, "Lumora Beauty · product page mockup", "Product page, <em>on mobile.</em>",
     "The buy box stacks under a swipe gallery, the glow check shows the finish on every skin tone, and add to bag stays one tap away.",
     CFG.get("pdp_labels", [("Gallery", "Swipe, with dots"), ("Buy box", "Benefits, sizes, add to bag"), ("Glow check", "Fitzpatrick I to VI"), ("Sticky add to bag", "Always one tap away")])),
]:
    W = 4 * 418 + 3 * 56 + 2 * 110
    body = cap(eyebrow, title, sub)
    body += '<div class="phones">' + "".join(
        f'<div><div class="phone"><div class="scr">' + STATUS.format(bg=bg, fg=fg) + f'<img src="file://{p}"></div><div class="island"></div></div><div class="label"><b>{a}</b>{b}</div></div>'
        for (p, bg, fg), (a, b) in zip(shots, labels)) + "</div>"
    outs.append(board(name, W, 110 + 250 + 872 + 100 + 110, body))

for o in outs:
    im = Image.open(o)
    print(o, im.size, os.path.getsize(o) // 1024, "KB")
