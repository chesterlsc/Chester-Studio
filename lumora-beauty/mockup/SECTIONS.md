# Lumora homepage mockup: section map

Golden Hour direction (`brand/concepts/golden-hour.md`). Static HTML/CSS that mirrors the Minimog build one
section at a time. Open `index.html` in a browser, or see `exports/homepage-desktop.png` (1440 at 2x) and
`exports/homepage-mobile.png` (390 at 2x).

Asset status below was computed on 23 Nov 2026, 11:40: **4 final, 19 placeholder.**

## Files

| Path | What it is |
|---|---|
| `index.html` | The page. Every `<section>` carries `data-minimog="<section type>"`. No JavaScript. |
| `css/lumora.css` | The skin: tokens on `:root` (8 palette colours plus derived tints, type scale, one radius, shadows, easing), the colour schemes, one section-header anatomy, one button anatomy, one card system, the mobile layer. In the build this becomes the Custom Liquid "skin" section (section 6 of `research/minimog-capabilities.md`). |
| `css/placeholders.css` | Stand-in images for assets that have not landed yet (see "How placeholders work"). Delete it, and its `<link>`, once every asset is final. |
| `fonts/` | Local WOFF2 from Google Fonts: `fraunces-roman-latin-var.woff2` and `fraunces-italic-latin-var.woff2` (variable: opsz, wght, SOFT, WONK; set to opsz 72, SOFT 100, WONK 0 roman and WONK 1 italic), `figtree-latin-var.woff2` (400 to 600). No runtime call to Google. |
| `img/leaf-light.png` | The leaf-light texture (transparent PNG, Dusk leaves), laid at 6% multiply over sections 6 and 12 only. Swap for the rig's exported gobo mask if preferred. |
| `placeholders/` | On-brand stand-ins drawn from the brand board's product illustrations (correct names, colours and label system), plus abstract graded colour fields for the photos. |
| `exports/` | `homepage-desktop.png`, `homepage-mobile.png` and their slices. |

### How placeholders work (no markup change needed at integration)

Every `<img>` already points at its **final** asset path (`../renders/scenes/...`, `../products/<handle>/...`,
`../photos/graded/<slug>.jpg`). While that file is missing, the browser renders the broken image's `::after`,
which `placeholders.css` paints with the stand-in at the same crop (`--pos`). The moment a final file lands at its
path, it shows instead. So the integration pass is: drop the files in, re-export, check crops and pins, delete
`placeholders.css`.

### Export

`tools/shoot.cjs` (scratchpad) uses one full-page capture, and Chromium blanks anything below 16,384 device
pixels, which at 2x cut this page off after the formulator note. The exports were therefore made with
`shoot-tall.cjs`, the same capture stitched from viewport tiles (nothing on the page is fixed or sticky, so the
seams are invisible):

```
node shoot-tall.cjs file:///home/user/Chester-Studio/lumora-beauty/mockup/index.html exports/homepage-desktop.png desktop --scale=2
node shoot-tall.cjs file:///home/user/Chester-Studio/lumora-beauty/mockup/index.html exports/homepage-mobile.png mobile --scale=2
python3 tools/slice.py exports/homepage-desktop.png 1600 2880
python3 tools/slice.py exports/homepage-mobile.png 1600 780
```

`shoot-tall.cjs` sits next to `shoot.cjs` in the session scratchpad (`tools/shoot-tall.cjs`). Slices are in `exports/slices/`.

## Section map

Schemes follow the sunset ladder (golden-hour.md 2.2). No two neighbours share a background.

| # | Section | Minimog section (`data-minimog`) | Scheme | Key settings | Custom CSS / Liquid needed | Images and sizes |
|---|---|---|---|---|---|---|
| 1 | Announcement | Announcement bar (`announcement-bar`) | dusk | One line, centred. Desktop: "Free US shipping over $65 · 30-day guarantee, even if opened". Mobile: "Free shipping over $65 · 30-day returns" (36 characters). | Two text blocks shown per breakpoint, honey dot separator, 12/11 px Figtree 600 at .16em. | None |
| 1 | Header | Header (`header`) | transparent over the hero, then travertine | `logo-left-menu-center`, transparent on home, sticky on scroll-up, mega menu on Shop (six packshot tiles with step marks plus the "full sunset" set card). Nav: Shop, The ritual, Ingredients, Slow hour, Our story. Icons: search, account, bag with Terracotta count. Mobile: logo left, search, bag, menu. | Nav in tracked caps (12.5 px, 600, .14em) with a Terracotta wipe-in underline; count bubble colours in theme settings. | `brand/logo/lumora-wordmark.svg` at 138 px (108 px mobile) |
| 2 | Hero | Image with text overlay (`video-hero`), hook class `lu-hero` | image | Desktop and mobile images, height 744 px (fills the first 900 px screen with the announcement and the promise strip), content middle-left, eyebrow, H1, text, primary button plus link. | Custom Liquid block: hotspot pin with glass card (desktop x 67.5%, y 56%; thumb, "Start here · Step 02", name, $54) and the golden-hour clock (Appendix B). CSS: left scrim (Travertine 90% to 0 at 56%), mobile layout (copy stacked above the 4:5 image, image top masked into the ground). | `renders/scenes/hero-desktop.jpg` 2880 x 1620; `renders/scenes/hero-mobile.jpg` 1170 x 1460 |
| 3 | Promise strip | Icon box (`icon-box`), 4 items | linen | Icon beside text desktop; 2 x 2 grid on mobile (not a slider). | Horizon arc (signature transition 1 of 2): inline SVG pseudo-element rising 44 px into the hero, honey hairline on the curve. Custom monoline icons (shipping, guarantee with sun dot, drop, three tones) uploaded as SVG. | None |
| 4 | The sunset shelf | Featured collection (`featured-collection`) | travertine | Collection "The six" sorted 01 to 06; 3 per row x 2 rows; mobile: scroll, card 64% wide (peek); view all as link "Shop all six"; bare heading (no eyebrow). Cards: ratio 4:5, second image on hover, quick add, no wishlist, compare, vendor or stars; title clamp 2; colour swatches on (Apricity). | Step chip (sun mark + number) from metafield `custom.step`; one-line descriptor from `custom.card_line`; Sand tile + 14 px radius; hover lift 2 px + shadow + 1.04 zoom + quick-add pill; mobile "+" button. Card 02 is shown in its hover state. | `products/<handle>/<handle>-packshot.jpg` 1600 x 2000 (x6); hover `products/long-light-serum/long-light-serum-in-light.jpg` |
| 5 | Start here: Long Light | Image with text (`image-with-text`), layered second image | sand | Image left (6 of 12 columns), layered image top-right, subheading, heading, text, button "Add to bag · $54", link "See the details". | Ticks list (3 icon rows), footnote 2 directly under the module, reassurance line: Custom Liquid text block. "Add to bag" needs a product form (Custom Liquid) or a link to the PDP. | `renders/scenes/golden-pair.jpg` 1600 x 2000; inset `photos/graded/serum-drop-skin.jpg` |
| 6 | Every skin, in its best light | Image cards (`image-cards`), 4 across, mobile scroll | travertine + leaf light | Eyebrow, H2, description with footnote 1; cards with caption (time of day + light). | Leaf-light overlay (texture 1 of 2, 6% multiply) via hook class; italic time captions; footnote line. | `photos/graded/skin-tone-01-light.jpg` to `-04-deep.jpg`, 4:5 |
| 7 | What's in the glow | Custom content (`custom-content`): 4 image + text blocks and a rich-text row | linen | View all "Read every ingredient"; mobile rail (70% cards). | Percentage tag after each name; statement row in Fraunces 30 px with the "not a coating" accent. | `photos/graded/oil-drops.jpg`, `sea-buckthorn.jpg`, `apricot.jpg`, `cream-swirl.jpg`, 4:5 |
| 8 | Proof, with the method | Custom Liquid (`custom-liquid`) | honey-wash | Three stats (Fraunces 96 px), Day 1 / Week 2 / Week 4 timeline, footnotes 2 and 3 directly beneath, labelled illustrative placeholder data. | Whole section is Custom Liquid (about 3 KB). Sun-dot footnote markers. | `brand/logo/lumora-sun-mark.svg` |
| 9 | Sensory marquee | Scrolling promotion (`scrolling-promotion`) | honey | Announcement blocks, sun-dot icon separators, slow speed, pause on hover, static under reduced motion. | Fraunces 300 at 44 px (28 px mobile), italic "never" phrases. | Sun dot SVG (one-colour monogram, gap widened to 10% for small sizes) |
| 10 | The ritual: sunset in six | Product bundles (`product-bundles`) | apricot-wash (scheme gradient from honey wash) | Image with 6 numbered hotspots (pins float above each product), product list, running total ($197 for all six, $232 separately, save 15%), add-all button "Add the full sunset · $197", link "Start with one step". One popover open (02). Mobile: 4:5 crop on 02 to 04 with three pins, list stays visible. | CSS (about 400 characters): image above, list as 6 centred columns. Custom Liquid block: the sun-arc timeline (dashed arc, sun dots rising from 01 and setting at 06). Pins tuned to the final render (they float above each product, so labels stay readable). | `renders/scenes/ritual.jpg` 2400 x 1350 |
| 11 | The slow hour | Image with text (`image-with-text`), image right, layered second image | rose-wash | Eyebrow, H2 (Dusk italic accent: Clay fails on rose), text, lexicon line, button "Shop the slow hour", food-not-supplement note. | Lexicon line in Fraunces 20 px. | `photos/graded/golden-milk-hands.jpg`; inset `products/slow-hour-golden-milk/slow-hour-golden-milk-packshot.jpg` |
| 12 | A note from our formulator | Image with text (`image-with-text`), image left | apricot-wash + leaf light | Eyebrow, H2, note in Fraunces 24 px, signature "Mara, head of formulation", labelled illustrative persona. | Leaf-light overlay (texture 2 of 2); note and signature styles. | `photos/graded/formulator-hands.jpg` (anonymous hands, no face) |
| 13 | Early voices | Testimonials (`testimonials`), boxed cards | terracotta | 4 per row, mobile swipe (82% cards), no star ratings. Disclosure under the cards: testers received products free, sample content. | Card glass fill (Linen 7%) and hairline; honey quote mark. | None |
| 14 | FAQ | Collapsible tabs (`collapsible-tabs`) | clay | One open at a time, rows 72 px (60 px mobile), heading column 5 of 12 with "Write to us" link. | Two-column layout CSS; honey toggle when open. | None |
| 15 | Closing band | Custom Liquid (`custom-liquid`) (or Image with text overlay) | dusk | Eyebrow "The 30-day promise", H2, guarantee text, honey button "Start with Long Light · $54", link "Shop all six". | Horizon arc into the footer (signature transition 2 of 2), scrims; image stacks above the copy on mobile. | `renders/scenes/closing.jpg` 2880 x 1100 |
| 15 | Footnotes block | Custom Liquid in the footer group | dusk | The three footnotes, "All three are illustrative placeholder data", the concept-store label. Sits above the footer columns. | Static markup. | None |
| 15 | Footer | Footer (`footer`) | dusk | Logo (Linen) + one-line promise; 3 menus (Shop, Help, About); newsletter "The Low Sun Letter" with value line; policy links; payment icons once, monochrome. Mobile: menus become accordions, newsletter first. | Newsletter styling; menu accordions on mobile. | `brand/logo/lumora-wordmark-linen.svg` |
| 15 | Setting-sun wordmark | Custom Liquid in the footer group | dusk | Giant "lumora" in the golden-hour gradient, clipped by a honey horizon line and sunk 8% (scroll-linked sink is a 20-line script, static here and under reduced motion). | Inline SVG of `brand/logo/lumora-wordmark-mono.svg` with a gradient fill. | None |

## Images and placeholders

| Status | Final path (relative to `mockup/`) | Stand-in now | Used in | Size / crop |
|---|---|---|---|---|
| final | `../renders/scenes/hero-desktop.jpg` | none | 2 Hero (desktop) | 2880 x 1620, 16:9; cover-cropped to 1440 x 744, object-position 50% 50% |
| PLACEHOLDER | `../renders/scenes/hero-mobile.jpg` | `placeholders/hero-mobile.jpg` | 2 Hero (mobile) | 1170 x 1460, 4:5; full width under the copy, top 30% masked into the section ground |
| final | `../products/long-light-serum/long-light-serum-packshot.jpg` | none | 2 Hero pin thumb, 4 card 02, 10 popover thumb | 1600 x 2000, 4:5, Sand sweep |
| final | `../products/sunmelt-cleansing-balm/sunmelt-cleansing-balm-packshot.jpg` | none | 4 card 01 | 1600 x 2000, 4:5 |
| PLACEHOLDER | `../products/haze-soft-focus-cream/haze-soft-focus-cream-packshot.jpg` | `placeholders/packshot-haze-soft-focus-cream.jpg` | 4 card 03 | 1600 x 2000, 4:5 |
| PLACEHOLDER | `../products/apricity-lip-cheek-balm/apricity-lip-cheek-balm-packshot.jpg` | `placeholders/packshot-apricity-lip-cheek-balm.jpg` | 4 card 04 | 1600 x 2000, 4:5 |
| PLACEHOLDER | `../products/gloaming-body-oil/gloaming-body-oil-packshot.jpg` | `placeholders/packshot-gloaming-body-oil.jpg` | 4 card 05 | 1600 x 2000, 4:5 |
| PLACEHOLDER | `../products/slow-hour-golden-milk/slow-hour-golden-milk-packshot.jpg` | `placeholders/packshot-slow-hour-golden-milk.jpg` | 4 card 06, 11 inset | 1600 x 2000, 4:5 |
| PLACEHOLDER | `../products/long-light-serum/long-light-serum-in-light.jpg` | the final Long Light packshot (so the hovered card stays photographic until the low-sun render lands) | 4 card 02 hover image ("the light changes") | 1600 x 2000, 4:5, same crop as the packshot in low sun |
| PLACEHOLDER | `../renders/scenes/golden-pair.jpg` | `placeholders/golden-pair.jpg` | 5 Start here, main image | 1600 x 2000, 4:5 |
| PLACEHOLDER | `../photos/graded/serum-drop-skin.jpg` | `placeholders/photo-serum-skin.jpg` | 5 Start here, layered inset | 4:5, min 800 x 1000 |
| PLACEHOLDER | `../photos/graded/skin-tone-01-light.jpg` | `placeholders/photo-skin-1.jpg` | 6 card 1 (7:12 am) | 4:5, min 800 x 1000 |
| PLACEHOLDER | `../photos/graded/skin-tone-02-medium.jpg` | `placeholders/photo-skin-2.jpg` | 6 card 2 (4:47 pm) | 4:5, min 800 x 1000 |
| PLACEHOLDER | `../photos/graded/skin-tone-03-tan.jpg` | `placeholders/photo-skin-3.jpg` | 6 card 3 (5:31 pm) | 4:5, min 800 x 1000 |
| PLACEHOLDER | `../photos/graded/skin-tone-04-deep.jpg` | `placeholders/photo-skin-4.jpg` | 6 card 4 (6:58 pm) | 4:5, min 800 x 1000 |
| PLACEHOLDER | `../photos/graded/oil-drops.jpg` | `placeholders/photo-oil-drop.jpg` | 7 Vitamin C card | 4:5 |
| PLACEHOLDER | `../photos/graded/sea-buckthorn.jpg` | `placeholders/photo-sea-buckthorn.jpg` | 7 Sea buckthorn card | 4:5 |
| PLACEHOLDER | `../photos/graded/apricot.jpg` | `placeholders/photo-apricot.jpg` | 7 Apricot kernel card | 4:5 |
| PLACEHOLDER | `../photos/graded/cream-swirl.jpg` | `placeholders/photo-cream.jpg` | 7 Ceramides + squalane card | 4:5 |
| final | `../renders/scenes/ritual.jpg` | none | 10 Ritual hotspot scene | 2400 x 1600 (3:2 as rendered); desktop box 1296 x 640 at object-position 50% 54%; mobile 4:5 at 33.9% plus scale 1.4 (steps 02 to 04) |
| PLACEHOLDER | `../photos/graded/golden-milk-hands.jpg` | `placeholders/photo-golden-milk.jpg` | 11 Slow hour, main image | 4:5 |
| PLACEHOLDER | `../photos/graded/formulator-hands.jpg` | `placeholders/photo-formulator.jpg` | 12 Formulator note | 4:5 |
| PLACEHOLDER | `../renders/scenes/closing.jpg` | `placeholders/closing.jpg` | 15 Closing band | 2880 x 1100; cover-cropped to 1440 x 560 at 62% (mobile 390 x 300 at 74%) |

## Integration checklist

1. Land the remaining files at the paths above (status PLACEHOLDER), re-run the two exports and look at every slice.
2. Pins are tuned to the final hero and ritual renders that landed during this pass (hero hotspot `--x: 67.5%; --y: 56%`; ritual pins float just above each product). Re-check them only if those renders are re-rendered with a different camera.
3. Check the crops: hero desktop `--pos`, ritual mobile `--pos-m` (36% keeps steps 02 to 04), closing `--pos` / `--pos-m`.
4. Hover image: only Long Light has a low-sun render queued (`long-light-serum-in-light.jpg`). The other five cards need theirs before the build, or the hover setting stays off for them.
5. Delete `css/placeholders.css` and its `<link>` once nothing above reads PLACEHOLDER.
6. For the build, export the hero at 1920 px wide and 200 KB or less (the render is 2880 px and about 600 KB), and preload the Fraunces roman WOFF2 (done here).
7. The mockup shows card 02 in its hover state (lift, zoom, quick add) and the FAQ with its first row open: both are interaction states, not separate settings.

## Copy and compliance notes

- US English, sentence case, no exclamation marks, Oxford comma; curly quotes and apostrophes.
- Headlines are six words or fewer with one italic accent word, always last. Eyebrows are two to four words, on story sections only; the product rail has a bare heading.
- Cosmetic claims only ("looks", "feels", "helps", "the look of"). The ritual step for Long Light is labelled "Glow", not "Treat". No SPF, tanning or after-sun claims: "your daily SPF" is an unbranded morning step.
- Every statistic carries a sun-dot marker, its footnote sits directly under the module, and all three repeat in the footnotes block above the footer, labelled illustrative placeholder data.
- Testimonials are labelled sample content from testers who received products free; the formulator is labelled an illustrative persona.
- No strikethrough prices: the set shows "$197 for all six, $232 bought separately".
