# Lumora product page mockup: section map (Long Light Serum)

Golden Hour direction (`brand/brand-book.md` section 12, `brand/concepts/golden-hour.md` section 8). Static
HTML/CSS that mirrors the Minimog product template block by block. Every block or section in
`product-long-light-serum.html` carries `data-minimog="<section>"` or `data-minimog="main-product:<block>"`,
plus `data-settings`, `data-metafield` and `data-app` where they apply.

Status at 23 Nov 2026, 12:20: **every Long Light render is final** (packshot, in light, detail, with Haze,
back). Only the three `photos/graded/` images still show their stand-ins: there is no stock photography, so
these are the same illustrations the homepage uses.

## Files

| Path | What it is |
|---|---|
| `product-long-light-serum.html` | The page. The only JavaScript is two small scripts that also ship in the build: the delivery estimate and the sticky-bar toggle. The copy is complete, including the four closed accordion rows and the eight closed FAQ answers (they are in the source with `hidden`, as in the live theme). |
| `css/lumora.css` | The homepage skin, **unchanged**: tokens, schemes, section-header anatomy, buttons, product card, proof stats, timeline, FAQ, closing band and footer are reused as they are. |
| `css/pdp.css` | PDP components only. It loads after `lumora.css` and adds no new colours, only the skin-tone swatches (illustration) and composites built from the palette. Size: 40 KB raw, 32 KB minified. |
| `css/placeholders.css` | Shared with the homepage. On this page it only paints the three `photos/graded/` stand-ins. |
| `exports/lumora-pdp-*.jpg` | Made with `tools/export_mockup.py` (desktop 1440 and mobile 390, both at 2x, stitched), plus `lumora-pdp-mobile-sticky.jpg` (390 x 844 at 2x, scrolled to the results, with the sticky bar showing). |

## Template strategy (playbook 4.1)

- **`product.signature`** holds every module below and is assigned to Long Light Serum only.
- **`product` (default)** keeps the main product section with all of the metafield-driven blocks (eyebrow, lexicon,
  benefits, at a glance, accordions), plus complete the ritual, pairs well with, the FAQ and the guarantee band. It has
  no Long Light copy, so the other five PDPs are never empty or wrong.
- Fill the metafields below for all six products. Leave inventory untracked and compare-at prices empty.

## Above the fold (measured in the export)

| Viewport | What sits inside the first screen |
|---|---|
| 1440 x 900 | Breadcrumb, gallery (two-up), eyebrow with sun mark, a rating labelled as sample, H1, price, lexicon, 3 icon benefits plus footnote 2, the five at-a-glance rows, size pills, purchase options, **Add to bag · $54 (781 to 833 px)**, the free-shipping line and the calculated delivery date (to 889 px). The trust row starts at 911 px. The info column is sticky, so the trust row, the golden pair and the accordions stay beside the gallery as it scrolls. |
| 390 x 844 | A swipe gallery (4:5, the next image peeks, counter, dots), eyebrow, rating, H1 with price, lexicon, benefits. Add to bag ends at 1,133 px, within 1.5 screens. **On mobile, at a glance moves below the trust row (CSS `order`)** so the buy path stays short. |

## Section and block map

### 1. Main product (`main-product`), scheme travertine

Section settings: container-fluid; media and info split about 7 to 5 (gallery 712 px, info 520 px at 1440); media
layout **Grid 2 columns** on desktop, mobile slider with dots and counter; image zoom on; show featured media first;
**sticky info column** on desktop; sticky add to cart **mobile only**. The header is solid on this template (transparent
is home only).

| # | Block (in order) | Minimog type | Settings and content | Metafields | App |
|---|---|---|---|---|---|
| 1.1 | Media gallery | section media | 8 media, packshot first (table below). Slots 6 to 8 are designed in HTML here and uploaded as images (see Gallery). | none | none |
| 1.2 | Breadcrumb | `breadcrumb` block | Home / The six / Long Light Serum. Hidden on mobile (CSS). | none | none |
| 1.3 | Step eyebrow | `custom_liquid` | "Step 02 · Treat" with the sun mark for the step (symbols m1 to m6, shared with the cards). | `custom.step`, `custom.ritual` | none |
| 1.4 | Rating snippet | `@app` | Star badge restyled to tokens (Dusk stars, no yellow), "4.7 · 52 reviews", with a **Sample** chip and a link to #reviews. Live rule: hide it until there are five reviews. | none | Judge.me (trial: static, labelled) |
| 1.5 | Title | `title` | H1 Fraunces Light, 44 px (34 px on mobile). Vendor and type off. | none | none |
| 1.6 | Price | `price` | Fraunces, right of the title. No compare-at, no installments line, no "tax included" line. | none | none |
| 1.7 | Lexicon line | `custom_liquid` | *long light* (n.) the low, raking light of the last hour of sun. | `custom.lexicon_word`, `custom.lexicon_definition` | none |
| 1.8 | Three benefits | `custom_liquid` | Icon rows (even, absorb, amber), one footnoted (2), with a one-line short footnote directly beneath. | `custom.benefits` (list of metaobject `benefit`) | none |
| 1.9 | At a glance | `custom_liquid` | Suited to · Finish · Scent · Key ingredients · Pairs with (a link). | `custom.suited_to`, `custom.finish`, `custom.scent`, `custom.key_ingredients`, `custom.pairs_with` | none |
| 1.10 | Size pills | `variant_picker` | Picker type **button**. Option "Size": 15 ml travel $24, 30 ml $54 (default). Label shows "30 ml · 1.0 fl oz, about 10 weeks". | variant metafield `custom.size_note` (optional) | none |
| 1.11 | Purchase options | `@app` | Two radio cards, **one-time selected by default** (California ARL: express consent), with subscribe as the highlighted card: "Subscribe, save 15% · $45.90 · Renews every 10 weeks, about one bottle. Skip or cancel anytime." 30 ml only. Side by side on desktop, stacked on mobile. Restyled with CSS. | selling plan group | **Needs a subscription app** (Shopify Subscriptions is free; Recharge, Skio or Loop also work). Minimog has no native subscribe and save. |
| 1.12 | Add to bag | `buy_buttons` | Full-width Terracotta pill, "Add to bag · $54" (theme language: Add to bag; a short script appends the live price and updates it on variant change). **Quantity selector off, dynamic checkout off:** express wallets live in the cart drawer (playbook 4.3 #12, 4.12). | none | none |
| 1.13 | Free-shipping line | `custom_liquid` | "Free US shipping over $65. Any second step gets you there." (the hero plus the cheapest step is $78). | threshold in a theme setting | none |
| 1.14 | Delivery estimate | `shipping` block, or `custom_liquid` | "Order today, arrives Mon, Nov 30 – Wed, Dec 2." Calculated: one working day to dispatch, then 3 to 5 working days, **skipping weekends and US carrier holidays** (it skips Thanksgiving here). The native block counts days; use the Custom Liquid script if the native one can't skip holidays. | none | none |
| 1.15 | Trust row | `custom_liquid` | The homepage promise strip, compact: the same 4 icons and wording, with footnote 1 directly beneath. | none | none |
| 1.16 | The golden pair | `custom_liquid` | Linen card: Long Light + Haze thumbnails, "$92 together, $102 bought separately", "Save $10" chip, outline button "Add the golden pair · $92" (secondary, so Add to bag stays the strongest element). | `custom.pair_bundle` (product reference to the bundle) | Shopify Bundles: a fixed bundle product "The golden pair", $92 (or FoxKit bundles) |
| 1.17 | Accordions | `collapsible_tab` x5 | What it does (open) · Key ingredients · Full ingredients (INCI) · How to use · Shipping and returns. One open at a time, honey toggle when open, the same as the FAQ. | `custom.what_it_does`, `custom.key_ingredients_detail`, `custom.inci`, `custom.how_to_use`; shipping is shared static text | none |
| 1.18 | Help line | `addons` (Ask a question) | "Not sure it's right for your skin? Ask us. A person replies within one working day." | none | none |
| 1.19 | Sticky add to bag | section setting | Mobile only: thumbnail, name, "30 ml · one-time", "Add to bag · $54". Glass Linen bar with a hairline and safe-area padding. It appears once the main button has scrolled away (`html.stick-atc-show`), replaces the bottom nav on the PDP and never stacks with it. On desktop the sticky info column does this job, so there is no desktop bar. | none | none |

### 2 to 14. Below the fold (template sections)

| # | Section | Minimog section | Scheme | Settings and content | Metafields | Custom CSS / Liquid |
|---|---|---|---|---|---|---|
| 2 | Why amber | `image-with-text` (image left) | sand | Eyebrow "Why amber", H2 "The bottle does half the *work.*", body copy, the light-test chart (amber 97% vs clear 82%, footnote 3), two facts (dropper, six months once open). | none | Custom Liquid block for the chart (bars at most 24 px, 4 px round data end, value labels, track in Sand, Terracotta for "ours"). Image: `renders/scenes/hero-desktop.jpg` cropped 4:5 at 61%. |
| 3 | Ingredients, decoded | `custom-liquid` | linen | Two hero cards (10% vitamin C, 2% sea buckthorn: name, INCI, job, "why this %"), then the other thirteen in label order (name, function, job, % or role), then "Formulated without, and why". | `custom.ingredients` (list of metaobject `ingredient`) | About 4 KB of Liquid looping over the metaobjects. Reusable on all six PDPs. |
| 4 | How to use | `icon-box` (3 items) | travertine + leaf light (texture 1 of 2) | Warm · Press · Layer with custom SVG icons; then morning and evening rows (02 highlighted, "your daily SPF" as an unbranded step); then layering notes. | `custom.how_to_steps`, `custom.layering_notes` | Custom Liquid block for the two ritual rows and the notes. |
| 5 | Results, with the method | `custom-liquid` | honey-wash | The homepage proof anatomy: three stats with exact counts (30, 28 and 31 of 32), footnote 2 **directly under the stats**, a method panel (who, how often, how measured, rounding), then the Day 1 / Week 2 / Week 4 timeline. | `custom.results` (JSON) | Reuses `.stats`, `.stat` and `.timeline` from `lumora.css`. |
| 6 | The glow check | `custom-liquid` | linen | Six CSS skin-tone swatches (Fitzpatrick I to VI, labelled as illustrations), the panel score per type (10, 10, 9, 10, 9 and 10 of 10), and a "58 of 60" summary with the three checks. Footnote 1 directly beneath. | `custom.glow_check` (JSON) | Swatch colours are illustration tokens in `pdp.css`. |
| 7 | Who it's for | `custom-liquid` (or Multicolumn) | sand | Skin-type chips, then Made for · Maybe not for you if · Good to know (pregnancy guidance points to a doctor; "it doesn't protect you from the sun: keep your SPF"). | `custom.skin_types`, `custom.made_for`, `custom.not_for`, `custom.good_to_know` | none |
| 8 | Complete the ritual | `product-bundles` (image + list) | apricot-wash (gradient from honey-wash) | `renders/scenes/ritual.jpg` at 3:2 with 6 pins (02 in Terracotta), a checklist of the six with prices, "$197 · Save 15% · for all six, $232 bought separately", "Add the full sunset · $197", a link to the golden pair, and the risk-reversal line. Mobile: the homepage's 4:5 crop with pins 02 to 04. | none | Pins re-mapped for the 3:2 box: 01 16.9/30.1, 02 29.1/38.4, 03 43.9/49.3, 04 56.6/46.75, 05 70.6/39.75, 06 84/48.9 (x/y %). Bundle: Shopify Bundles "The full sunset" $197, or the section's own add-all. |
| 9 | From our formulator | `image-with-text` (image left) | rose-wash + leaf light (texture 2 of 2) | H2 "Why we stopped at *ten.*", a 47-word note, signed Mara, labelled as an illustrative persona. | `custom.formulator_note` | Accent in Dusk italic (Clay fails on Rose wash). |
| 10 | FAQ | `collapsible-tabs` | clay | 9 objection questions, the first open; footnotes 1 and 2 directly under the list; "Write to us" link. | none | FAQPage JSON-LD in Custom Liquid. |
| 11 | Reviews | `product-reviews` / `apps` | linen | Summary (4.7, distribution bars, "what people mention" chips including one negative), skin and tone filter chips, 4 reviews including a 4 and a 3 star with real trade-offs, "Show more reviews". **Labelled sample content in three places** (eyebrow, note beside the H2, disclosure under the list, plus a chip on each review). | none | Judge.me widget restyled to tokens for the live store; in the trial, this static Custom Liquid module. |
| 12 | Pairs well with | `product-recommendations` | travertine | Bare H2 "Its place on the *shelf.*" (product rail, no eyebrow), "Shop all six", 3 cards (01 Sunmelt, 03 Haze, 04 Apricity) in the **homepage card system**. The one-line card descriptors say why each one pairs. | `custom.card_line` (PDP context line, optional) | Complementary products set in Search & Discovery (free Shopify app). |
| 13 | Guarantee band | `custom-liquid` (the homepage closing band) | dusk | "The 30-day promise", H2 "Thirty days, even if *opened.*", Honey pill "Try it for 30 days · $54", link "How returns work". The horizon arc into the footer (signature transition, as on home). | none | `renders/scenes/closing.jpg` zoomed 1.6x from the left so only the leaf-shadowed wall shows: the evening products in that render stay on the homepage. |
| 14 | Footnotes block | `custom-liquid` (a template section, not the footer group) | dusk | Lists only this page's markers 1 to 3, plus the concept-store label. | none | Move the homepage block out of the footer group too, so each template lists its own markers. |
| 15 | Footer | footer group (shared) | dusk | Identical to the homepage: menus, The Low Sun Letter, payment marks, setting-sun wordmark. | none | none |

## Metafields (product, namespace `custom`)

| Key | Type | Long Light value (summary) |
|---|---|---|
| `step` | integer | 2 |
| `ritual` | single line text | Treat |
| `lexicon_word` / `lexicon_definition` | single line text | long light / the low, raking light of the last hour of sun. |
| `benefits` | list of metaobject `benefit` (icon handle, text, footnote number) | even · "More even-looking tone in 4 weeks" · 2; absorb · "Absorbs in seconds, layers under SPF"; amber · "Amber glass keeps the vitamin C from the light" |
| `suited_to`, `finish`, `scent`, `key_ingredients` | single line text | as on the page |
| `pairs_with` | product reference | Haze Soft-Focus Cream |
| `pair_bundle` | product reference | The golden pair (bundle product) |
| `what_it_does`, `key_ingredients_detail`, `how_to_use` | rich text | as in the accordions |
| `inci` | multi-line text | the INCI exactly as on the back label |
| `ingredients` | list of metaobject `ingredient` (name, inci, function, percent or role, job, why_this_percent, image) | 15 entries in label order |
| `how_to_steps`, `layering_notes` | JSON | 3 steps; 6 notes |
| `results`, `glow_check` | JSON | stats with n and counts; six types with scores and notes |
| `skin_types`, `made_for`, `not_for`, `good_to_know` | list of single line text | as on the page |
| `formulator_note` | multi-line text | the note |

## Apps (install only with the client's OK)

| Need | Recommended | Native fallback |
|---|---|---|
| Subscribe and save | Shopify Subscriptions (free) | None in Minimog. Without an app, hide block 1.11; the page still works. |
| Golden pair and full sunset bundles | Shopify Bundles (free), fixed bundle products | Minimog `product-bundles` section with add-all, or FoxKit Product bundles |
| Reviews | Judge.me, widget restyled to tokens | The static, labelled module in this mockup |
| Complementary products | Search & Discovery (free, by Shopify) | Product recommendations with automatic related products |

## Gallery (8 media, 4:5)

| Slot | File | Alt text | Status |
|---|---|---|---|
| 1 | `products/long-light-serum/long-light-serum-packshot.jpg` | Long Light Serum, a 30 ml amber glass dropper with a champagne collar and honey bulb, on a sand backdrop | final |
| 2 | `products/long-light-serum/long-light-serum-in-light.jpg` | Long Light Serum on travertine in low, raking sun, its shadow glowing amber on the wall | final |
| 3 | `products/long-light-serum/long-light-serum-detail.jpg` | Close-up of the champagne collar, honey bulb and amber glass shoulder in raking sun | final |
| 4 | `products/long-light-serum/long-light-serum-with-haze.jpg` | Long Light Serum beside a jar of Haze Soft-Focus Cream in late sun | final (the render job failed, so this is the same frame as `renders/scenes/golden-pair.jpg`; the manifest says so) |
| 5 | `products/long-light-serum/long-light-serum-back.jpg` | The back label: how to use, the full ingredient list, fragrance-free and vegan, 30 ml | final; shown cropped 1.6x toward the label. Upload that crop. |
| 6 | Ingredients card (HTML) | 10% vitamin C and 2% sea buckthorn oil, plus the supporting four; fragrance-free, no mica, no tint, vegan formula | Render to 1600 x 2000 with the export tool and upload it as media. The text is also live on the page. |
| 7 | Results card (HTML, Dusk) | 93%, 87% and 96% after 4 weeks, with footnote 2 legible inside the card | as above |
| 8 | Ritual card (HTML) | Step 02 of 6 on the sun arc: after Sunmelt, before Haze, morning and evening | as above |

Optional slot 9 for the live store: an 8 to 15 second texture video (one drop on the back of a hand, sinking in
clear), muted, looped, captioned, with a poster frame.

## Images still on placeholders

| Final path (relative to `mockup/`) | Stand-in now | Used in |
|---|---|---|
| `../photos/graded/oil-drops.jpg` | `placeholders/photo-oil-drop.jpg` (golden drop illustration) | 3 Vitamin C card |
| `../photos/graded/sea-buckthorn.jpg` | `placeholders/photo-sea-buckthorn.jpg` (berry illustration) | 3 Sea buckthorn card |
| `../photos/graded/formulator-hands.jpg` | `placeholders/photo-formulator.jpg` (Long Light in window light) | 9 Formulator |

Everything else is a final render: the 5 Long Light images, the Sunmelt, Haze and Apricity packshots, and the
`hero-desktop` (for Why amber), `ritual` and `closing` scenes.

## Copy, claims and footnotes

- US English, sentence case, no exclamation marks. Headlines have six words or fewer and one italic accent word, always last (all 12 checked). Eyebrows have 2 to 4 words; the product rail has a bare H2. Exactly one H1.
- Cosmetic claims only: looks, feels, helps, the look of. A script found none of the never-say words (treats, heals, repairs, flawless, clean, tan and so on) apart from the step name "Treat" (see flags). "It doesn't protect you from the sun: keep your SPF" is a deliberate disclaimer.
- Footnotes on this page: **1** the finish panel (60 people, 10 per Fitzpatrick type), **2** the 4-week consumer perception study (n = 32), **3** the stability test (amber vs clear glass). Each sits directly beneath its module (benefits, trust row, Why amber, results, glow check, FAQ) and again in the footnotes block, and each is labelled illustrative placeholder data.
- Percentages are rounded **down** and given with the exact count (93% = 30 of 32, 87% = 28 of 32, 96% = 31 of 32).
- The INCI on the page matches the rendered back label word for word.
- Reviews and tester content are labelled sample content; Mara is labelled an illustrative persona; the rating snippet carries a Sample chip. There is no fake urgency, no strikethrough price, no "Verified buyer" tag and no certification mark.

## Flags for Chester (decisions, not blockers)

1. **"Step 02 · Treat".** The eyebrow follows the brief and brand book. The homepage ritual list labels this step "Glow", and "treats" is on the never-say list. As the name of a routine step it is common and low risk, but the two pages should match: changing it is one metafield (`custom.ritual`).
2. **Travel size pricing.** $24 for 15 ml ($1.60 per ml) is cheaper per ml than 30 ml at $54 ($1.80 per ml), so the larger bottle looks like worse value. The page avoids per-ml prices. Consider $29 for 15 ml, which also stops it matching Apricity's $24.
3. **Homepage, for whoever owns it** (not edited here):
   - `lumora.css` line 682, `.feature__media .media--solo { width: calc(100% - 48px) }`, comes after the mobile rule, so the mobile `width: 100%` never applies. The formulator image is narrower on mobile. `pdp.css` overrides it for this page only.
   - The closing image's alt text still describes the glass sphere, but the final render shows Gloaming and Slow Hour on a plinth.
   - "91% said the finish looked natural" with n = 32 is 29 of 32 (90.6%), so by our round-down rule it should read 90%.
4. **Subscription cadence.** At 3 to 4 drops twice a day, 30 ml lasts about 10 weeks, so the default is every 10 weeks; offer 8, 10 and 12.

## Export

```
python3 <scratchpad>/tools/export_mockup.py mockup/product-long-light-serum.html lumora-pdp
python3 <scratchpad>/pdp/tools/sticky_export.py "#results .stats" -120     # writes exports/lumora-pdp-mobile-sticky.jpg
```

The export tool serves `lumora-beauty/` over local HTTP, so the fonts load, and captures in 1,500 px segments, so
nothing blanks past 16,384 device px. The page was exported three times; every desktop and mobile chunk was checked on
passes 1 and 2, and the regions changed after that were checked on pass 3.
