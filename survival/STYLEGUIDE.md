# Writer's Guide: "30 Years, No Power"

Read this file in full before you write or edit a chapter. Every chapter must follow it exactly. The validator enforces most of it:

```
node survival/tools/validate.mjs survival/src/chapters/<id>.html
```

Exit code 0 means it passes. Fix every ERROR. Read every WARNING and fix it unless you have a good reason.

---

## 1. Who the reader is

- A parent, partner or dog owner preparing their household for a grid-down life that could last **30 years**. They may be reading in a crisis, by candlelight, tired and stressed.
- **Write as if every reader has ADHD.** Short chunks. One idea per paragraph. Lots of visual structure. Bold the key fact in a sentence. Get to the point in the first line.
- The reader may have babies, children, elderly relatives, women and girls with specific health needs, and dogs. Mention them wherever they are affected.
- Use **American English spelling** (color, liter, diarrhea, organize, center, gray).
- The reader may be outside the US (the author is in the Philippines). Give metric **and** US units (e.g. "4 liters (1 gallon)"; "60°C (140°F)").

## 2. FACTS ONLY: the non-negotiable rules

1. **Every factual claim needs a source.** Numbers, durations, doses, temperatures, percentages, death tolls, dates, health effects, "X works / X doesn't work". Put a citation right after the claim: `<sup class="cite"><a href="#s3">3</a></sup>`.
2. **Sources must be authoritative.** In order of preference:
   - Government and intergovernmental bodies: WHO, CDC, FDA, USDA, EPA, NIH/MedlinePlus, FEMA/Ready.gov, NOAA/NWS, NREL, DOE, USGS, UK NHS, UNICEF, UNHCR, FAO, the Sphere Handbook, ICRC
   - Professional bodies: American Heart Association, American Red Cross, AAP, ACOG, Wilderness Medical Society, ASPCA, AVMA, WSAVA, NFPA
   - Peer-reviewed research: Cochrane reviews, NEJM, Lancet, JAMA, BMJ, and journals indexed on PubMed
   - University extension services (e.g. NCHFP at the University of Georgia, Penn State, Utah State, BYU studies)
   - Reputable reference sources such as Britannica, and major news outlets (AP, Reuters, BBC) **only** for recent event facts (dates, durations, death tolls)
   - **Never cite**: prepper blogs, product sellers, Wikipedia, YouTube channels, forums, AI-generated sites, content farms.
3. **No theories, speculation or predictions.** Do not write "experts believe", "it is thought", "could possibly", "some say", or "in a collapse, X will happen". Write what is **documented**: what happened in real events, what studies measured, what official guidance says.
   - Scenario planning is allowed only when it is framed as arithmetic or guidance, e.g. "At 1 gallon per person per day, a family of 4 needs 1,460 gallons a year".
4. **Myths must be debunked with a source.** Use the Myth vs Fact component.
5. **Use recent facts.** Search for the latest guidance and data (2023–2026). If a guideline was updated (e.g. the AHA 2025 CPR Guidelines, the WHO Essential Medicines List 2025, the EPA 2024 PFAS rule), use the current version and say so. When a number changes over time, give the year: "(CDC, 2025)".
6. **Research with the WebSearch tool.** Verify every number before you write it. **Only use URLs that came back in your search results.** Never invent or guess a URL. Prefer the most specific page (e.g. the CDC page on boiling water, not cdc.gov).
7. If you cannot verify a claim, **leave it out**. A shorter true chapter is better than a longer one with guesses.

## 3. Safety and content boundaries

- **Medical:** follow WHO / CDC / AHA / Red Cross / AAP / ACOG / NHS guidance. Give over-the-counter doses only as written on the product label or by official sources. **Never** tell readers to take veterinary, fish or aquarium antibiotics, or to self-prescribe prescription drugs. State the FDA facts instead. Always say to use professional care whenever it exists.
- **Security:** prevention, deterrence, awareness, de-escalation, community organization, safe storage and the law. **No** weapon making, explosives, booby traps, improvised weapons, attack tactics or instructions for hurting people.
- **Scavenging:** lawful salvage only (abandoned or ownerless items, permission, community agreements). State plainly that looting is a crime with harsher penalties in declared emergencies in many places. Focus on value, hazards and ethics.
- **Hunting, trapping, fishing:** obey the law and use humane methods. Name legality as a requirement.
- **Foraging and mushrooms:** stress the identification risks. Do not present the "universal edibility test" as safe.
- **Chemistry:** soap, lye, lime, charcoal, vinegar and glue are fine. **No** energetic materials, gunpowder, toxic gases or drugs.
- **Children:** give the safety points for every topic where children are at risk.

## 4. Length and voice

- **2,500–4,000 words** of visible text per chapter (the validator counts). Target ≈3,000.
- **Paragraphs: 1–3 sentences, at most 70 words.** The validator errors at 110 words.
- Plain English, around grade 8. Active voice. Second person ("you").
- Spell out an abbreviation the first time, e.g. "oral rehydration solution (ORS)".
- Lead with the action, then the reason: "**Boil water for 1 minute.** That kills bacteria, viruses and protozoa."
- No filler, no hype, no fear-mongering, no "in today's world". Calm, direct, kind.
- Do not use em dashes (—) or en dashes as punctuation (ranges like 100–120 are fine). Use a colon, a comma, parentheses or a new sentence.

## 5. File format

- Write **one HTML fragment** to `survival/src/chapters/<id>.html`. The `<id>` comes from `survival/src/outline.json`.
- Only the content goes in the file. **No** `<html>`, `<head>`, `<body>`, `<h1>`, `<script>`, `<style>`, `<link>`, `<img>`, `<iframe>`, `<form>`, `<input>` or `<button>`. **No** `style=""` attributes outside SVG. **No** `on*=""` attributes.
- The build adds the chapter title, number, part color, reading time, navigation and so on. Do not repeat the title at the top.
- Use only the components below. Unknown classes produce a warning.

## 6. Required chapter skeleton (in this order)

```html
<aside class="tldr">
  <ul>
    <li><b>Key action or fact.</b> One short sentence of why.<sup class="cite"><a href="#s1">1</a></sup></li>
    <!-- 3 to 6 bullets. "If you read nothing else" -->
  </ul>
</aside>

<div class="stats"> ... 2 to 4 big numbers ... </div>

<h2>⚡ First section heading</h2>
<p>...</p>
<!-- 5 to 10 h2 sections, each starting with an emoji. Use h3 inside sections. -->

<h2>✅ Do this now</h2>
<ul class="checklist" data-id="<id>-now"> ... 5 to 12 items ... </ul>

<h2>🧠 Remember this</h2>
<div class="cards"> ... 4 to 8 flashcards ... </div>

<h2>📚 Sources</h2>
<ol class="sources"> ... at least 6 sources, ideally 10 to 25 ... </ol>
```

Rules:
- The **first element** must be `aside.tldr`. The **last element** must be `ol.sources`.
- **At least 5 `h2` sections** of real content between the stats and "Do this now".
- **At least 1 `figure.diagram`** with an inline SVG. 2 or 3 is better.
- **At least 4 different "visual" components** from: `stats`, `steps`, `box`, `mythfact`, `compare`, `table-wrap`, `timeline`, `figure.diagram`, `widget`.
- **Citations:** at least 15 `sup.cite` per chapter, and on average at least one every 150 words. Every `#sN` must exist in the source list, and every source should be cited.

## 7. Components (copy these exactly)

### TL;DR (required, first)
```html
<aside class="tldr"><ul>
  <li><b>Store 4 liters (1 gallon) per person per day.</b> That is the CDC minimum for drinking and basic hygiene.<sup class="cite"><a href="#s1">1</a></sup></li>
</ul></aside>
```

### Big numbers
```html
<div class="stats">
  <div class="stat"><b>1 min</b><span>rolling boil kills germs in water<sup class="cite"><a href="#s2">2</a></sup></span></div>
  <div class="stat"><b>3 min</b><span>boil time above 2,000 m (6,500 ft)<sup class="cite"><a href="#s2">2</a></sup></span></div>
</div>
```
Keep `<b>` short (under about 10 characters): "48 h", "1 in 4", "70°C", "20 sec".

### Callout boxes
```html
<aside class="box danger"><h4>Never run a generator indoors</h4><p>...</p></aside>
```
Box types. Pick the one that fits:
| class | Meaning (the build adds the icon and label) |
|---|---|
| `danger` | ☠️ Can kill or seriously injure |
| `warn` | ⚠️ Caution or common mistake |
| `tip` | 💡 Practical tip |
| `fact` | 📊 Key fact with a number |
| `baby` | 👶 Babies and children |
| `dog` | 🐕 Dogs and pets |
| `women` | 🌸 Women and girls |
| `elder` | 🧓 Elderly and disabled people |
| `long` | ⏳ The 30-year view: how this changes over years |
| `practice` | 🎯 Practice this now while help still exists |
| `buy` | 🛒 Get this before you need it |
| `watch` | ▶️ Official videos and pages to watch or download while the internet works (links must come from search results) |

### Numbered steps (for any procedure; the build adds a "▶ Play steps" slideshow)
```html
<ol class="steps">
  <li><h4>Check the scene is safe</h4><p>One or two short sentences.</p></li>
  <li><h4>...</h4><p>...</p></li>
</ol>
```
Each `li` has exactly one `h4` and 1–2 short `p`s (or a short `ul`).

### Checklist (interactive, saved on the device)
```html
<ul class="checklist" data-id="water-storage-now">
  <li>Buy two 25 L (7 gal) food-grade water containers</li>
</ul>
```
`data-id` must be unique in the book. Use `<chapter-id>-<word>`.

### Myth vs Fact
```html
<div class="mythfact">
  <div class="myth"><p>Butter on a burn helps it heal.</p></div>
  <div class="fact"><p>Cool running water for 20 minutes is the proven first aid.<sup class="cite"><a href="#s4">4</a></sup> Butter holds heat in and raises infection risk.</p></div>
</div>
```

### Do / Don't comparison
```html
<div class="compare">
  <div class="col good"><h4>Do</h4><ul><li>...</li></ul></div>
  <div class="col bad"><h4>Don't</h4><ul><li>...</li></ul></div>
</div>
```

### Tables (always wrap them)
```html
<div class="table-wrap"><table>
  <caption>Bleach per volume of clear water (EPA)</caption>
  <thead><tr><th>Water</th><th>6% bleach</th><th>8.25% bleach</th></tr></thead>
  <tbody><tr><td>1 gallon (3.8 L)</td><td>8 drops</td><td>6 drops</td></tr></tbody>
</table></div>
```
Keep tables to 2–5 columns so they work on phones.

### Timeline
```html
<ol class="timeline">
  <li><b>Hour 0</b><p>Power fails ...</p></li>
  <li><b>Day 2</b><p>...</p></li>
</ol>
```

### Diagram figure (inline SVG, required at least once)
```html
<figure class="diagram">
  <svg viewBox="0 0 640 360" role="img" aria-labelledby="t-water-1">
    <title id="t-water-1">Layers of a biosand filter</title>
    <rect x="200" y="40" width="240" height="280" rx="12" class="d-line" fill="none"/>
    <rect x="204" y="220" width="232" height="60" class="d-fill-sand"/>
    <text x="460" y="255" class="d-text">Fine sand</text>
  </svg>
  <figcaption>The biological layer forms in the top 2 cm of sand within about 30 days.<sup class="cite"><a href="#s3">3</a></sup></figcaption>
</figure>
```
SVG rules:
- Use `viewBox` (width 480–800) and no fixed width or height. Every SVG needs a `<title>` with a unique id. Use `aria-labelledby`.
- **Color only through these classes** so the diagram works in light, dark and print:
  - Strokes: `d-line` (ink), `d-line-muted`, `d-line-red`, `d-line-blue`, `d-line-green`, `d-line-orange`
  - Fills: `d-fill-paper`, `d-fill-muted`, `d-fill-blue`, `d-fill-green`, `d-fill-red`, `d-fill-orange`, `d-fill-yellow`, `d-fill-brown`, `d-fill-purple`, `d-fill-teal`, `d-fill-sand`, `d-fill-ink`
  - Text: `d-text` (normal), `d-text-sm`, `d-text-lg` (bold title), `d-text-muted`, `d-text-red`, `d-text-on` (white text on a dark fill)
  - You may also use `fill="none"`, `stroke-width`, `stroke-dasharray`, `stroke-linecap`, `opacity`, `transform`, `marker-end`, and so on. **Do not** hard-code colors (`fill="#..."`, `fill="red"`).
- Allowed elements: `svg g path rect circle ellipse line polyline polygon text tspan title desc defs marker use symbol clipPath pattern linearGradient radialGradient stop animate animateTransform animateMotion set`.
- **Animation is welcome** for processes (water flowing, compressions, a step-by-step loop) using SMIL `<animate>` / `<animateTransform>` with `repeatCount="indefinite"`. Add `class="diagram anim"` to the figure. Keep it subtle and slow.
- Text in the SVG: `font-size` is set by the classes (≈16px at 640 width). Keep labels short. Leave margins. No text may overflow the viewBox.
- Draw **clear schematic diagrams**: cross-sections, flowcharts, decision trees, labelled parts, bar charts of real sourced numbers, timelines, body outlines and layouts. Clean beats detailed. Check your coordinates so that nothing overlaps.
- Bar charts and graphs must use real, cited numbers.

### Interactive widgets (optional; the build makes them work)
```html
<div class="widget" data-widget="metronome" data-bpm="110" data-label="CPR compressions: 100–120 per minute"></div>
<div class="widget" data-widget="timer" data-seconds="20" data-label="Handwashing: 20 seconds"></div>
<div class="widget" data-widget="calc-water"></div>
<div class="widget" data-widget="calc-bleach"></div>
<div class="widget" data-widget="calc-food"></div>
<div class="widget" data-widget="calc-ors"></div>
```

### Flashcards (required, near the end)
```html
<div class="cards">
  <div class="card"><p class="q">How long do you boil water?</p><p class="a">1 minute at a rolling boil (3 minutes above 2,000 m).</p></div>
</div>
```

### Cross-references to other chapters
`<a class="xref" href="disinfecting-water.html">Disinfecting Water</a>` uses the chapter id from the outline plus `.html`. Only link to ids that exist in `outline.json`. Add 3–8 relevant cross-references per chapter.

### Sources (required, last)
```html
<ol class="sources">
  <li id="s1"><a href="https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html">CDC: How to Create an Emergency Water Supply</a> (2024). <span class="src-note">1 gallon per person per day; 2-week supply if possible.</span></li>
</ol>
```
- `id="s1"`, `s2`, ... in order. Each has exactly one `<a href="https://...">` with **Organization: Title**, then the year in brackets, then a `src-note` that says what the source supports.
- At least 6 sources; 10–25 is typical. At least 60% should be the authoritative types listed in section 2.

### Inline text
- `<b>` for key facts (use it a lot, but at most once or twice per paragraph). `<em>` sparingly.
- `<span class="tag t-72h">First 72 h</span>`, `t-30d` (first 30 days), `t-1y` (year 1), `t-30y` (long haul) are allowed in text or headings.
- `<kbd>`, `<abbr title="...">`, `<code>` are allowed. `<br>` sparingly.
- Lists: `<ul>` and `<ol>` with short items.

## 8. Working rules for agents

- Edit **only** your own chapter file. Do not touch other files. Do not run git.
- Research with WebSearch (load it with ToolSearch `select:WebSearch` if it is not already available). Do 10–25 searches. Record each URL exactly as it appears in the results.
- `survival/src/chapters/_example.html` shows the syntax of every component. It is deliberately short and is **not** a model for length.
- Read `survival/src/outline.json` for neighboring chapters. Cover **your** scope in depth and cross-link (`a.xref`) to other chapters for their topics instead of repeating them.

## 9. Quality bar checklist (self-review before finishing)

- [ ] Every number has a citation, and the cited page actually says it (you saw it in search results).
- [ ] No speculation or theory words. Nothing invented.
- [ ] A frightened, distracted reader can find the key action in under 10 seconds.
- [ ] Babies, children, women, elderly and dogs are covered where relevant.
- [ ] Metric and US units.
- [ ] Diagrams are clean, labelled, use the class palette and do not overlap.
- [ ] The validator passes with 0 errors.
