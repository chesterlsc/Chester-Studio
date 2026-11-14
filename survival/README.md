# 30 Years, No Power

**The Visual, Fact-Checked Survival Field Manual** for families, babies, women and girls, elderly people and dogs who have to keep living when the grid does not come back.

Live at `/survival/` on the studio site. It works offline after the first visit and prints as a book (≈1,000+ pages).

## What is in it

- **173 chapters in 17 parts**: Start Here, Mind & Plan, Water, Food, Medicine & First Aid, Women's & Girls' Health, Babies & Children, Dogs & Animals, Shelter/Heat/Light, Tools & Skills, Hygiene & Sanitation, Security & Community, Scavenging & Salvage, Navigation/Comms/Travel, Disasters & Hazards, The 30-Year Plan, Reference.
- **Facts only.** Every claim is cited to an official or peer-reviewed source (WHO, CDC, FDA, USDA, EPA, FEMA, NOAA, AHA, Red Cross, Cochrane, PubMed journals and so on). There are no theories and no predictions. Each chapter was researched by one agent and then checked by a second, adversarial fact-checking agent.
- **Built for ADHD brains:** a 30-second TL;DR first, big-number tiles, color-coded parts, short paragraphs, callout boxes (danger, baby, dog, women, elder, 30-year view…), Myth vs Fact, Do/Don't, step cards, timelines, SVG diagrams (some animated), checklists that save your progress, and flip flashcards.

## Reader features

| Feature | What it does |
|---|---|
| ⚡ Skim mode | Hides long paragraphs and keeps boxes, steps, tables and diagrams |
| 🔊 Read aloud | Reads the chapter with the browser's speech engine and highlights each block |
| ▶ Play steps | Turns any procedure into a full-screen slideshow with auto-play |
| 🔍 Search | Offline full-text search (`/` or `Ctrl/⌘ K`) |
| ✅ Checklists | Saved on the device, with progress bars |
| 🧠 Flashcards | Tap to flip, shuffle, flip all |
| 🧮 Calculators | Water, bleach dose, food calories, ORS recipe, CPR metronome, timers |
| Aa Settings | Light/dark, text size, wide spacing, read-aloud speed |
| 📥 Offline | A service worker caches the whole book |
| 🖨️ Print / PDF | `print.html` holds the whole book on one page, with part openers and contents |

## Folder layout

```
survival/
  src/outline.json         parts, chapters, scope (the master plan)
  src/chapters/<id>.html   chapter source fragments (one per chapter)
  src/tools-page.html      calculators page content
  STYLEGUIDE.md            the writing and fact contract every chapter follows
  tools/validate.mjs       checks every chapter against the style guide
  tools/build.mjs          generates the site (c/, p/, index, print, sources, tools, search index, sw.js)
  tools/pdf.mjs            renders print.html to a paginated PDF with bookmarks
  assets/                  book.css, book.js, fonts (Atkinson Hyperlegible, SIL OFL), icon
  c/ p/ index.html …       generated output (commit it; GitHub Pages serves it)
```

## Build

```bash
cd survival/tools && npm install          # one-time: node-html-parser
node survival/tools/validate.mjs --summary  # check all chapters
node survival/tools/build.mjs               # generate the site
python3 -m http.server 8765 --directory survival &   # serve locally
node survival/tools/pdf.mjs survival/30-years-no-power.pdf   # optional PDF (Playwright)
```

## Disclaimer

This book is general information. It is not a substitute for professional medical care, hands-on first-aid and CPR training, or local emergency services. The research, writing and fact-checking were done with AI assistance, and every fact is tied to a public source so readers can check it themselves.
