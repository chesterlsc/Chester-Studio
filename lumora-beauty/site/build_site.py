"""Build the deployable Lumora mockup site from the mockup sources.

    python3 lumora-beauty/site/build_site.py [--site-url https://example.vercel.app]

Output (lumora-beauty/site/public/):
  index.html                          homepage mockup
  products/long-light-serum/index.html product page mockup
  css/ fonts/ img/ placeholders/       copied from mockup/
  products/ renders/scenes/ brand/logo/ the images the pages use
  og.jpg                              1200x630 link-preview image
  vercel.json                         clean URLs, long cache for assets
Paths are rewritten to site-root URLs. Images still missing at build time are swapped for
their on-brand placeholder, so every browser shows the same picture (the mockup's CSS
::after fallback only works in some browsers).
"""
import json
import os
import re
import shutil
import sys

from PIL import Image

WORK = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(WORK, "site", "public")
SITE_URL = sys.argv[sys.argv.index("--site-url") + 1].rstrip("/") if "--site-url" in sys.argv else ""

PAGES = {
    "mockup/index.html": "index.html",
    "mockup/product-long-light-serum.html": "products/long-light-serum/index.html",
}
COPY_DIRS = {"mockup/css": "css", "mockup/fonts": "fonts", "mockup/img": "img", "mockup/placeholders": "placeholders"}
MOCKUP_MAP = {"mockup/css/": "css/", "mockup/fonts/": "fonts/", "mockup/img/": "img/", "mockup/placeholders/": "placeholders/"}
PDP = "/products/long-light-serum"

# placeholder per ph--key, read from the mockup's fallback stylesheet
ph_map = {}
for key, url in re.findall(r'\.(ph--[a-z0-9-]+)::after\s*\{[^}]*url\("([^"]+)"\)', open(os.path.join(WORK, "mockup/css/placeholders.css")).read()):
    ph_map[key] = "/placeholders/" + os.path.basename(url)

if os.path.isdir(OUT):
    shutil.rmtree(OUT)
os.makedirs(OUT)
for src, dst in COPY_DIRS.items():
    shutil.copytree(os.path.join(WORK, src), os.path.join(OUT, dst))

used = set()


def site_path(page_src, url):
    """Map a URL written relative to the source page to a site-root URL."""
    if not url or url.startswith(("#", "http:", "https:", "mailto:", "tel:", "data:", "/")):
        return url
    path, frag = (url.split("#", 1) + [""])[:2]
    rel = os.path.normpath(os.path.join(os.path.dirname(page_src), path)).replace(os.sep, "/")
    for a, b in MOCKUP_MAP.items():
        if rel.startswith(a):
            rel = b + rel[len(a):]
            break
    else:
        if rel.startswith("mockup/"):
            rel = rel[len("mockup/"):]
        else:
            used.add(rel)
    return "/" + rel + ("#" + frag if frag else "")


def fix_img(tag, page_src):
    m = re.search(r'src="([^"]+)"', tag)
    if not m:
        return tag
    new = site_path(page_src, m.group(1))
    rel = new.lstrip("/")
    if new.startswith("/") and not os.path.exists(os.path.join(WORK, rel)) and not os.path.exists(os.path.join(OUT, rel)):
        key = next((c for c in re.findall(r"ph--[a-z0-9-]+", tag) if c in ph_map), None)
        if key:
            used.discard(rel)
            new = ph_map[key]
    return tag.replace(m.group(0), f'src="{new}"')


SWITCHER = """
<nav class="lu-mock-switch" aria-label="Mockup pages">
  <span>Lumora · design mockup</span>
  <a href="/"{home}>Homepage</a>
  <a href="/products/long-light-serum"{pdp}>Product page</a>
</nav>
<style>
.lu-mock-switch{position:fixed;left:16px;bottom:16px;z-index:9999;display:flex;align-items:center;gap:4px;padding:5px 5px 5px 14px;
  background:rgba(53,33,31,.92);color:#FBF6EF;border-radius:999px;font:500 12px/1 Figtree,system-ui,sans-serif;letter-spacing:.02em;
  box-shadow:0 12px 30px -12px rgba(53,33,31,.5);backdrop-filter:blur(6px)}
.lu-mock-switch span{opacity:.7;margin-right:6px}
.lu-mock-switch a{color:#FBF6EF;text-decoration:none;padding:7px 11px;border-radius:999px}
.lu-mock-switch a[aria-current]{background:#E8B566;color:#35211F}
@media (max-width:600px){.lu-mock-switch span{display:none}.lu-mock-switch{left:50%;transform:translateX(-50%);bottom:84px}}
</style>
"""


def head_meta(title, desc, path):
    og_img = f"{SITE_URL}/og.jpg" if SITE_URL else "/og.jpg"
    url = f"{SITE_URL}{path}" if SITE_URL else path
    return (f'\n<meta name="robots" content="noindex">'
            f'\n<meta property="og:type" content="website">'
            f'\n<meta property="og:title" content="{title}">'
            f'\n<meta property="og:description" content="{desc}">'
            f'\n<meta property="og:image" content="{og_img}">'
            f'\n<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
            f'\n<meta property="og:url" content="{url}">'
            f'\n<meta name="twitter:card" content="summary_large_image">\n')


for src, dst in PAGES.items():
    html = open(os.path.join(WORK, src), encoding="utf-8").read()
    html = re.sub(r"<img\b[^>]*>", lambda m: fix_img(m.group(0), src), html)
    html = re.sub(r'\b(href|src|poster)="([^"]*)"', lambda m: f'{m.group(1)}="{site_path(src, m.group(2))}"', html)
    html = re.sub(r"url\((['\"]?)([^'\")]+)\1\)", lambda m: f"url({m.group(1)}{site_path(src, m.group(2))}{m.group(1)})", html)
    is_pdp = "product" in src
    if is_pdp:
        # logo and breadcrumb back to the homepage
        html = re.sub(r'(<a class="logo" href=")[^"]*(")', r"\1/\2", html, count=1)
        html = re.sub(r'(<a[^>]*href=")#?(top|home)?("[^>]*>\s*Home\s*</a>)', r"\1/\3", html)
        title = "Lumora Beauty: Long Light Serum (product page mockup)"
        desc = "Product page mockup for Lumora Beauty's Long Light Serum, designed for the Minimog Shopify theme."
        path = PDP
    else:
        # every "Long Light" entry point on the homepage opens the product page
        html = re.sub(r'href="#(long-light[a-z-]*|start-here|details|pdp)"', f'href="{PDP}"', html)
        html = re.sub(r'(<a[^>]*href=")#[^"]*("[^>]*>\s*See the details)', rf"\1{PDP}\2", html)
        title = "Lumora Beauty: homepage mockup"
        desc = "Golden-hour skincare: homepage mockup for Lumora Beauty, designed for the Minimog Shopify theme."
        path = "/"
    html = html.replace("</head>", head_meta(title, desc, path) + "</head>", 1)
    switcher = SWITCHER.replace("{home}", "" if is_pdp else ' aria-current="page"').replace(
        "{pdp}", ' aria-current="page"' if is_pdp else "")
    html = html.replace("</body>", switcher + "</body>", 1)
    out = os.path.join(OUT, dst)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf-8").write(html)

# copy every referenced asset that lives outside mockup/
missing = []
for rel in sorted(used):
    src = os.path.join(WORK, rel)
    if os.path.isfile(src):
        dst = os.path.join(OUT, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
    elif not rel.endswith((".html", "/")) and "." in os.path.basename(rel):
        missing.append(rel)

# link-preview image from the hero render
hero = Image.open(os.path.join(WORK, "mockup/delivered/homepage-v3/lumora-homepage-hero.jpg")).convert("RGB")
w, h = hero.size
ch = round(w / 1.905)
hero.crop((0, 0, w, min(ch, h))).resize((1200, 630), Image.LANCZOS).save(os.path.join(OUT, "og.jpg"), quality=86, optimize=True)

json.dump({
    "cleanUrls": True,
    "trailingSlash": False,
    "headers": [{"source": "/(css|fonts|img|placeholders|products|renders|brand)/(.*)",
                 "headers": [{"key": "Cache-Control", "value": "public, max-age=86400"}]}],
}, open(os.path.join(OUT, "vercel.json"), "w"), indent=1)

size = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(OUT) for f in fs)
print(f"site built: {OUT} ({size / 1e6:.1f} MB), assets copied: {len(used) - len(missing)}")
print("missing (left as-is):", missing)
