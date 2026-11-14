# OFFGRID 30 — Component guide (for page writers & visual makers)

Reference page (copy its shape): `src/content/pages/04-making-water-safe/03-boiling-the-gold-standard.mdx`
Reference diagram: `src/components/diagrams/ch04/BoilMain.astro`

## Files
- One page = one MDX file: `src/content/pages/<chapter-slug>/<page-slug>.mdx`
  - Slugs come from `src/data/toc.json` (run `npm run toc`), e.g. chapter `01-water-basics-how-much-you-need`, page `03-signs-of-dehydration-at-any-age`, review page `10-review`.
- Template components are injected automatically: **do not import them**. Only import page diagrams.
- Diagrams: `src/components/diagrams/chNN/<Name>.astro` (one SVG per file, themable).

## Front-matter (required)
```yaml
id: "1.3"            # chapter.page
chapter: 1
page: 3
section: water       # section key (see src/data/sections.ts)
title: "Signs of dehydration at any age"   # = TOC title, ≤ 60 chars
why: "One line, ≤ 15 words."               # ≤ 110 chars
tags: [dehydration, thirst, urine]
visual: { type: svg, alt: "What the main visual teaches." }
sources: [ready-water, nhs-dehyd]          # ids from docs/research/chNN-facts.md
seeAlso: ["1.4", "52.2"]                   # page ids; only real TOC ids
status: checked      # draft → checked (after fact-check) → done
lastChecked: 2026-11-14
```

## Block order on every topic page (pages 1–9)
1. `<MainVisual caption legend={[...]}>` + diagram  ← first in the file (visual first on phones)
2. `<DoDont do={[...]} dont={[...]} />` — 3–5 each, ≤ 10 words, `<b>` one key word
3. `<Steps steps={[{ icon, label, title, detail? }]} />` — 3–8 steps. `title` ≤ 15 words, `detail` ≤ 30 words (tap to reveal). If EVERY step has `icon` + 1-word `label`, an icon strip shows on top.
4. `<NeedList items={[{ icon, item, alt }]} />` — `alt` = what to use if you don't have it
5. Optional extras (only if they add something): `<Compare>`, `<BeforeAfter>`, `<Callout>`, `<Checklist>`, `<Video>`
6. `<Scenario when="Day 4 without power" move="The right action in one line.">` 2–3 short paragraphs, "you" voice, present tense, 50–90 words `</Scenario>`
(SeeAlso chips are rendered automatically from front-matter `seeAlso`.)

## Component props
| Component | Props |
|---|---|
| `MainVisual` | `caption` (≤ 15 words), `legend?: LegendItem[]`, children = diagram |
| `LegendItem` | `{ text, icon?, swatch?, num?, tone?: 'ok'|'no'|'warn'|'accent' }` — only symbols that appear on the page |
| `DoDont` | `do: string[]`, `dont: string[]` (HTML allowed: `<b>`) |
| `Steps` | `steps: { title, detail?, icon?, label? }[]`, `heading?` |
| `NeedList` | `items: { item, alt, icon? }[]` |
| `Scenario` | `when?`, `move` (required), children = paragraphs |
| `Callout` | `type: 'caution'|'danger'|'tip'`, `title`, children. Use `danger` for "get help now" red flags |
| `Compare` | `title`, `rows: { label, value: 'yes'|'no'|'partly', note? }[]`, `yesLabel?`, `noLabel?` |
| `BeforeAfter` | `beforeLabel`, `afterLabel`, `label`; children with `slot="before"` / `slot="after"` |
| `Checklist` | `id` (unique, e.g. "ch01-review"), `title`, `items: string[]` |
| `Quiz` | `id` (e.g. "ch01"), `title?`, `questions: { q, options: (string | {text, icon})[], answer (0-based), explain, page? }[]` |
| `References` | `refs: { id, org, title, year, url, checked }[]` |
| `Video` | `href`, `title`, `org`, `minutes?` — official channels of Tier 1–2 orgs only |
| `Model3D` | `model`, `title`, `steps`; children = 2D fallback SVG |

## Icons (use these names only)
Sections: water food cooking shelter fire power tools medicine herbal hygiene kids women elderly pets security salvage trade navigation radio mind community strategy
Signals: do dont caution danger tip
Things: tool material time people skill heat mountain thermometer pot filter cloth jar bubbles settle pour lid hand
Legend/blocks: flow cut measure ground north see-also scenario steps need legend quiz references
UI: bookmark search print lite cube rotate play sun moon menu close arrow-left arrow-right chevron-down check book home external
Need a new icon? Add it to `src/components/icons/paths.ts` (24px grid, 2px stroke, round joins).

## Review page (page 10)
No MainVisual. Order: short intro line → `<Checklist id="chNN-review" title="Chapter N recap" items={[9 lines, one per page]} />` → `<Quiz id="chNN" questions={[5 questions]} />` → `<References refs={[...all sources used in the chapter]} />`. Front-matter `title: "Review: checklist, quiz & references"`, `why: "Check what you learned in Chapter N."`

## Diagram rules (SVG in .astro)
- `<svg class="diagram" viewBox="..." role="img" aria-labelledby="id-t id-d">` with `<title>` + `<desc>` (desc = what it teaches). IDs must be unique per page (prefix with page id, e.g. `c1p3-t`).
- Colors ONLY via CSS variables: `var(--ink)`, `var(--ink-2)`, `var(--card)`, `var(--paper)`, `var(--accent)`, `var(--on-accent)`, `var(--accent-tint)`, `var(--part-1)`…`var(--part-8)`, `var(--part-N-ink)`, `var(--ok)`, `var(--no)`, `var(--warn)`. Fixed neutrals allowed for physical things (e.g. metal `#B9C2CA`, water uses `var(--part-1)` with fill-opacity).
- Fonts: `font-family="var(--font-body)"` (labels) / `var(--font-head)` (big numbers). Label size ≥ 15 units in a ~520-wide viewBox (≥ 14px on phones).
- Labels sit ON the drawing with leader lines. Step numbers in accent circles. Show scale (hand/person) when size matters. Wrong vs right side by side for common mistakes. Never color-only meaning: pair with ✓/✕ shapes or words.
- Units: always both (L + gal, °C + °F, m + ft, kg + lb).
- Page-specific interactive widgets (e.g. a calculator) are `.astro` components with a small `<script>`; must render a sensible static version without JS and print cleanly.
