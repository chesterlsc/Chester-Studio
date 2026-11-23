"""Derive the shortened, visual-first Long Light product page from product-long-light-serum.html.

Cuts: why-amber, ingredients decoded (already in the accordion), who it's for, formulator note,
guarantee band, the At-a-glance rows, the results method panel and timeline, layering notes,
review filters and extra reviews, FAQ beyond five. Adds: three visual benefit tiles.
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(HERE, "product-long-light-serum.html"), encoding="utf-8").read()


def section(pattern):
    m = re.search(r"<section\b[^>]*" + pattern + r"[^>]*>", s)
    if not m:
        raise SystemExit("section not found: " + pattern)
    return m.start(), s.find("</section>", m.start()) + len("</section>")


def find_element(block, cls, start=0):
    m = re.compile(r'<(\w+)\b[^>]*class="(?:[^"]*\s)?' + re.escape(cls) + r'(?:\s[^"]*)?"[^>]*>').search(block, start)
    if not m:
        return None
    tag, depth = m.group(1), 1
    for t in re.compile(r"<(/?)" + tag + r"\b[^>]*?(/?)>").finditer(block, m.end()):
        if t.group(1) == "/":
            depth -= 1
        elif t.group(2) != "/":
            depth += 1
        if depth == 0:
            return m.start(), t.end()
    return None


def drop(block, cls, keep=0):
    """Remove elements with class `cls`, keeping the first `keep` of them."""
    pos, kept = 0, 0
    while True:
        span = find_element(block, cls, pos)
        if not span:
            return block
        if kept < keep:
            kept += 1
            pos = span[1]
            continue
        block = block[:span[0]] + block[span[1]:]
        pos = span[0]


def edit(pattern, fn):
    global s
    a, b = section(pattern)
    s = s[:a] + fn(s[a:b]) + s[b:]


def cut(pattern):
    global s
    a, b = section(pattern)
    s = s[:a] + s[b:]


for pat in [r'id="why-amber"', r'id="ingredients"', r'id="how-to-use"', r'id="who"', r'id="formulator"', r'class="closing scheme-dusk pdp-closing"']:
    cut(pat)

edit(r'class="pdp-main', lambda b: drop(b, "pdp-glance"))
# how-to-use is cut (its content lives in the buy-box accordion)
edit(r'id="results"', lambda b: drop(drop(drop(b, "pdp-method"), "timeline"), "pdp-results__fn")
     .replace("section section--feature scheme-honey-wash", "section scheme-honey-wash"))
edit(r'id="faq"', lambda b: drop(b, "faq__item", keep=5))
edit(r'id="reviews"', lambda b: drop(drop(drop(b, "pdp-filters"), "pdp-revlist__more"), "pdp-review", keep=3))

TILES = """
<section id="benefits" class="section scheme-sand" data-minimog="multicolumn / custom-content" aria-labelledby="benefits-title">
  <div class="container">
    <header class="section-head">
      <div class="section-head__text">
        <p class="eyebrow">Why it works</p>
        <h2 id="benefits-title" class="h2">Three reasons, <em>one glow.</em></h2>
      </div>
    </header>
    <div class="ingr ingr--three">
      <article class="ingr__card"><div class="media"><img src="../products/long-light-serum/long-light-serum-detail.jpg" alt="Close-up of the champagne collar and amber glass of Long Light Serum" style="--pos: 50% 40%"></div><h3>Amber glass</h3><p>Keeps the vitamin C from the light, so the last drop works like the first.</p></article>
      <article class="ingr__card"><div class="media"><img src="placeholders/photo-oil-drop.jpg" alt="A golden drop of serum"></div><h3>Vitamin C <span>10%</span></h3><p>A stable form that brightens the look of dull skin.</p></article>
      <article class="ingr__card"><div class="media"><img src="placeholders/photo-sea-buckthorn.jpg" alt="Sea buckthorn berries on the branch"></div><h3>Sea buckthorn <span>2%</span></h3><p>Carotenoid-rich. The apricot color is the ingredient.</p></article>
    </div>
  </div>
</section>
"""
a, b = section(r'class="pdp-main')
s = s[:b] + "\n" + TILES + s[b:]

s = s.replace("</head>", '<link rel="stylesheet" href="css/pdp-short.css">\n</head>', 1)
s = re.sub(r"<title>(.*?)</title>", r"<title>\1 (shortened)</title>", s, count=1)
open(os.path.join(HERE, "product-long-light-serum-short.html"), "w", encoding="utf-8").write(s)
print("product-long-light-serum-short.html written,", len(s), "chars,", s.count("<section"), "sections")
