"""Derive the shortened, visual-first homepage (index-short.html) from index.html.

Client feedback: keep the depth but shorten, keep visuals, avoid stacked text-heavy sections.
Cuts: every-skin tiles, slow hour, formulator note, testimonials, FAQ, the proof timeline and lead,
the ingredients statement. Adds: "Shop by moment" image cards. Trims "Start here".
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(HERE, "index.html"), encoding="utf-8").read()


def section(pattern):
    """Return (start, end) of the first top-level <section ...> whose opening tag matches pattern."""
    m = re.search(r"<section\b[^>]*" + pattern + r"[^>]*>", s)
    if not m:
        raise SystemExit("section not found: " + pattern)
    end = s.find("</section>", m.start()) + len("</section>")
    return m.start(), end


def cut(pattern):
    global s
    a, b = section(pattern)
    s = s[:a] + s[b:]


def replace_in(pattern, old, new, count=1):
    global s
    a, b = section(pattern)
    block = s[a:b]
    if old not in block:
        raise SystemExit(f"not found in {pattern}: {old[:60]}")
    s = s[:a] + block.replace(old, new, count) + s[b:]


# 1. Remove the text-heavy or redundant sections.
for pat in [r'aria-labelledby="skin-title"', r'id="slow-hour"', r'id="formulator"',
            r'aria-labelledby="voices-title"', r'aria-labelledby="faq-title"']:
    cut(pat)

# 2. Start here: one sentence, ticks, CTAs; reassurance + footnote move to the footer block.
replace_in(r'id="start-here"',
           '10% stable vitamin C and 2% sea buckthorn oil in a water-light serum. Skin looks warmer, more even and quietly lit by week four<sup class="fn">2</sup>.',
           'Vitamin C and sea buckthorn in a water-light serum. Skin looks warmer and more even by week four<sup class="fn">2</sup>.')
a, b = section(r'id="start-here"')
block = s[a:b]
block = re.sub(r'\s*<p class="reassure">.*?</p>', '', block, flags=re.S)
block = re.sub(r'\s*<p class="footnotes">.*?</p>', '', block, flags=re.S)
s = s[:a] + block + s[b:]

# 3. Ingredients: tiles only, no statement block.
a, b = section(r'id="glow"')
block = s[a:b]
block = re.sub(r'\s*<div class="statement">.*?</div>', '', block, flags=re.S)
block = block.replace('class="ingr rail"', 'class="ingr ingr--short rail"')
s = s[:a] + block + s[b:]

# 4. Proof: three big numbers only, slimmer band.
a, b = section(r'aria-labelledby="proof-title"')
block = s[a:b]
block = re.sub(r'\s*<p class="lead">.*?</p>', '', block, flags=re.S)
block = re.sub(r'\s*<ol class="timeline">.*?</ol>', '', block, flags=re.S)
block = re.sub(r'\s*<div class="footnotes">.*?</div>', '', block, flags=re.S)
block = block.replace('section section--feature scheme-honey-wash proof', 'section scheme-honey-wash proof proof--slim')
block = block.replace('Proof, with the method <em>attached.</em>', 'Four weeks, in <em>numbers.</em>')
s = s[:a] + block + s[b:]

# 5. New: Shop by moment, right after Start here.
MOMENTS = """
<section id="moments" class="section scheme-travertine" data-minimog="image-cards" aria-labelledby="moments-title">
  <div class="container">
    <header class="section-head">
      <div class="section-head__text">
        <p class="eyebrow">Shop by moment</p>
        <h2 id="moments-title" class="h2">Two moments, <em>one ritual.</em></h2>
      </div>
    </header>
    <div class="moments">
      <a class="moment" href="#ritual" data-minimog="image-cards:card">
        <img src="../products/long-light-serum/long-light-serum-in-light.jpg" alt="Long Light Serum on travertine in raking morning sun with leaf shadows" style="--pos: 50% 55%">
        <div class="moment__text">
          <p class="eyebrow">Morning</p>
          <div class="moment__steps"><span>01</span><span>02</span><span>03</span><span>04</span></div>
          <h3>First light, <em>bottled.</em></h3>
          <span class="text-link">Shop the morning ritual</span>
        </div>
      </a>
      <a class="moment" href="#ritual" data-minimog="image-cards:card">
        <img src="../renders/scenes/evening-4x5.jpg" alt="Gloaming Body Oil and the Slow Hour canister on stone in deep dusk light" style="--pos: 50% 55%">
        <div class="moment__text">
          <p class="eyebrow">Evening</p>
          <div class="moment__steps"><span>01</span><span>02</span><span>03</span><span>05</span><span>06</span></div>
          <h3>The slow <em>hour.</em></h3>
          <span class="text-link">Shop the evening ritual</span>
        </div>
      </a>
    </div>
  </div>
</section>
"""
a, b = section(r'id="start-here"')
s = s[:b] + "\n" + MOMENTS + s[b:]

# 6. Stylesheet + title.
s = s.replace('<link rel="stylesheet" href="css/placeholders.css">',
              '<link rel="stylesheet" href="css/placeholders.css">\n<link rel="stylesheet" href="css/home-short.css">', 1)
s = re.sub(r"<title>(.*?)</title>", r"<title>\1 (shortened)</title>", s, count=1)

open(os.path.join(HERE, "index-short.html"), "w", encoding="utf-8").write(s)
print("index-short.html written,", len(s), "chars,", s.count("<section"), "sections")
