"""Find and download freely licensed ingredient photos from Wikimedia Commons via its public API.

Usage: python3 commons_fetch.py <out_dir> "<search terms>" [more terms ...]
For each search, it takes the best few results from Commons' "Quality images"/"Featured pictures"
first, downloads a 1600 px rendition and records title, author, licence and page URL in
<out_dir>/candidates.json (used later for CREDITS.md). Nothing is downloaded from anywhere else.
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "LumoraMockupBot/1.0 (design concept mockup; low volume)"}
ALLOWED = ("CC0", "Public domain", "CC BY 2.0", "CC BY 3.0", "CC BY 4.0", "CC BY-SA 2.0", "CC BY-SA 3.0", "CC BY-SA 4.0")


def api(params):
    params = {**params, "format": "json", "formatversion": "2"}
    req = urllib.request.Request(API + "?" + urllib.parse.urlencode(params), headers=UA)
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)


def strip(html):
    return re.sub(r"<[^>]+>", "", html or "").strip()


def search(term, n=4):
    hits = []
    for extra in (" incategory:Quality_images", " incategory:Featured_pictures_on_Wikimedia_Commons", ""):
        d = api({"action": "query", "generator": "search", "gsrsearch": f"filetype:bitmap {term}{extra}",
                 "gsrnamespace": 6, "gsrlimit": n, "prop": "imageinfo",
                 "iiprop": "url|extmetadata|size", "iiurlwidth": 1600})
        for p in d.get("query", {}).get("pages", []):
            ii = (p.get("imageinfo") or [{}])[0]
            md = ii.get("extmetadata", {})
            lic = strip(md.get("LicenseShortName", {}).get("value"))
            if not any(lic.startswith(a) for a in ALLOWED):
                continue
            if ii.get("width", 0) < 1200:
                continue
            hits.append({"term": term, "title": p["title"], "thumb": ii.get("thumburl"), "page": ii.get("descriptionurl"),
                         "author": strip(md.get("Artist", {}).get("value"))[:120], "license": lic,
                         "license_url": md.get("LicenseUrl", {}).get("value", ""), "w": ii.get("width"), "h": ii.get("height")})
        if len(hits) >= n:
            break
    seen, out = set(), []
    for h in hits:
        if h["title"] not in seen:
            seen.add(h["title"])
            out.append(h)
    return out[:n]


def main():
    out_dir = sys.argv[1]
    os.makedirs(out_dir, exist_ok=True)
    found = []
    for term in sys.argv[2:]:
        for i, h in enumerate(search(term)):
            slug = re.sub(r"[^a-z0-9]+", "-", term.lower()).strip("-") + f"-{i + 1}"
            path = os.path.join(out_dir, slug + ".jpg")
            req = urllib.request.Request(h["thumb"], headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
                f.write(r.read())
            h["file"] = path
            found.append(h)
            print(f"{slug}: {h['title']} | {h['license']} | {h['author'][:50]}")
    json.dump(found, open(os.path.join(out_dir, "candidates.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
