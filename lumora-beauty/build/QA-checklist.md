# Lumora × Minimog: QA checklist (live build)

The polish scorecard (`research/polish-checklist.md`) turned into pass/fail checks for the preview theme. Test in
Chrome's device toolbar at **1440 x 900, 1280 x 800, 390 x 844 and 360 x 780**, then once on a real phone. Pages:
**Home**, **Long Light Serum** (signature template), **Haze Soft-Focus Cream** (default template), **/collections/the-six**,
the **cart drawer** (empty and with items), **search**. Mark each line `[x]` pass or write what failed. Compare
against `mockup/delivered/homepage-v1/` and `mockup/exports/lumora-pdp-*.jpg`.

## A. Before anything else (2 min)

- [ ] Browser console on Home and Long Light: no red errors from `lu-` scripts.
- [ ] DevTools > Network > Font: `Fraunces_72pt_SuperSoft-Light`, `-Regular` and `-LightItalic` load from cdn.shopify.com (no 404); Figtree loads (500 and 600 present, else 600 falls back to 700: acceptable).
- [ ] Italic accent words are a true italic (the "b" and "h" in *bottled.* / *hour.* lean and curl), not a slanted roman.
- [ ] Every Custom Liquid section shows content in the editor and on the storefront (none printed raw Liquid or "Liquid error").
- [ ] Theme preview is the duplicate "Lumora · Golden Hour · v1", not the client's live theme.

## B. System (scorecard 1 to 14)

- [ ] 1 Tokens: no colour on the page outside the palette (spot-check eyebrows, prices, borders, buttons, cart bubble).
- [ ] 2 Two families only: Fraunces (headings, card titles, prices on PDP) and Figtree (everything else).
- [ ] 3 One section-header anatomy: eyebrow 12 px caps → H2 52 px (34 px phone), line-height ≈ 1.02 → lead ≤ 54ch → actions; identical on Home and PDP (compare "Six steps…" and "Every ingredient…" in DevTools: same computed size and line-height).
- [ ] 4 Eyebrows only on story sections (2 to 4 words); the shelf and "Its place on the shelf." have none.
- [ ] 5 One radius family: 14 px media/cards, 999 px buttons/inputs/chips, 50 % dots.
- [ ] 6 Buttons: 52 px desktop / 48 px phone, pill, Figtree 600 15 px; hover lifts 1 px with the Honey halo, the arrow nudges 3 px; keyboard focus shows a 2 px ring.
- [ ] 7 Shadows: only the card lift, the button halo and the floating cards (pin, popover).
- [ ] 8 Icons: one monoline family; no emoji anywhere.
- [ ] 9 One left edge at 1440: logo, hero copy, every section heading and the footer brand all start at x = 72 px (± 1). At 390: x = 20 px.
- [ ] 10 Rhythm: standard sections ≈ 115 px top/bottom at 1440, 64 px on phones; proof ≈ 158 px; no stray gaps (especially above the footer: #MainContent bottom padding is 0).
- [ ] 11 Background ladder in order, no two neighbours alike: Dusk bar → hero → Linen → Travertine → Sand → Travertine (leaf) → Linen → Honey wash → Honey → Apricot wash → Rose wash → Apricot wash (leaf) → Terracotta → Clay → Dusk. Leaf texture on exactly two sections.
- [ ] 12 Horizon arc exactly twice: under the hero (promise strip) and closing band → footer; same curve, Honey hairline.
- [ ] 13 Motion: reveal fade-in-up only; card zoom ≤ 1.04; one marquee; with "Emulate prefers-reduced-motion" on, the marquee, leaf drift, wordmark sink and pin pulse all stop.
- [ ] 14 Contrast (DevTools > Inspect > contrast): eyebrows on Sand/washes are Clay (≥ 4.5:1), Rose wash accents are Dusk italic, Honey text only ≥ 24 px on Terracotta/Clay, footnotes ≥ 4.5:1, hero copy over the scrim ≥ 4.5:1 at 1280 and 1440.

## C. Imagery (15 to 18)

- [ ] 15 Every image reads as one grade (renders + illustrations; no stock photos).
- [ ] 16 Six packshots: same sand sweep, 4:5, labels legible, all say lumora.
- [ ] 17 Long Light appears in hero, start here, ritual, PDP gallery; the phone hero uses `lu-hero-mobile.jpg`.
- [ ] 18 Alt text on every image (Long Light gallery: 8 alts from `products.md`; decorative images empty alt).

## D. Header and hero (19 to 22)

- [ ] 19 Announcement fits on one line at 360 ("Ships free over $65 · 30-day returns"), Honey dot between the two promises.
- [ ] 20 Header: logo left, five links in tracked caps with the Terracotta wipe-in underline; transparent over the hero, Travertine with a hairline once scrolled; sticky on scroll-up; Shop opens the mega menu with product tiles and the full-sunset banner; cart count bubble Terracotta.
- [ ] 21 Desktop hero: H1 "Late light, *bottled.*" (italic word on its own line), lead, two CTAs, clock line, pin card on the bottle with live price $54 → Long Light; hero fills the first 900 px with the promise strip in view; hero image ≤ 200 KB at 1920 w.
- [ ] 21b Clock: shows "Golden hour in [your city] today: … pm" (or "Next golden hour… tomorrow") and never shows a broken line; changing the computer's time zone changes the city.
- [ ] 22 Phone hero: copy above the 4:5 image, H1 and "Shop the ritual" visible within 390 x 844; no pin on phones.

## E. Commerce modules (23 to 27, 32)

- [ ] 23 Cards identical on Home, PDP recommendations and /collections/the-six: sand tile, step chip (sun mark + 01…06), title 2-line clamp, price on the title's baseline, one-line descriptor, Apricity shows three swatches; hover = lift + zoom + "Quick add · $54"; phone = "+" button; no wishlist/compare/vendor/badges.
- [ ] 24 Shelf 3 x 2 on desktop, swipe rail with a peek on phones; each product appears at most twice on Home.
- [ ] 25 Ritual: six Honey pins on the right products (re-tune `lu_px`/`lu_py` in `lu-ritual-arc.liquid` if any drifts), Long Light popover at rest, hover shows each popover; phone crop shows pins 02 to 04; list of six stays visible on phones.
- [ ] 25b "Add the full sunset · $197" adds six items, the drawer opens, the cart total is $197 after the automatic discount; "Add the golden pair · $92" gives $92.
- [ ] 26 At least one full-bleed dark band: Terracotta and Clay (home), Clay FAQ and Dusk guarantee band (PDP).
- [ ] 27 Footer: Linen logo + one-line promise, three menus, "The Low Sun Letter" with its value line, monochrome payment icons shown once, policy links, the setting-sun wordmark above the copyright row, no "Powered by Shopify"; phones: newsletter first, menus as accordions.
- [ ] 32 Cart drawer: Linen panel, translucent overlay, free-shipping bar filling with the golden-hour gradient ($54 shows "$11 from free shipping"; $65+ shows "Free shipping, unlocked."), empty state "Your bag is empty…", checkout button pill.

## F. Product page (28 to 31)

- [ ] 28 Above the fold at 1440 x 900: breadcrumb, eyebrow "Step 02 · Glow" with sun mark, rating "4.7 · 52 reviews · SAMPLE", H1 + $54 on one row, lexicon line, three icon benefits with footnote 2 line, at a glance, size pills (30 ml selected), **Add to bag · $54** (the strongest element), the free-shipping and delivery lines.
- [ ] 28b Switching to 15 ml travel changes the button to "Add to bag · $29" and the shipping line to "You're $36 from free US shipping. A Gloaming would do it."; switching back restores $54.
- [ ] 28c Delivery date skips weekends and Thanksgiving (on Mon 23 Nov 2026 it reads "Mon, Nov 30 – Wed, Dec 2").
- [ ] 29 Buy-box trust row = the homepage promise strip (same icons and wording), footnote 1 beneath.
- [ ] 30 Depth below the fold, in order: Why amber (chart, fn 3) → Ingredients decoded (INCI matches the back label) → How to use → Results (93/87/96 % with counts, method panel) → Glow check → Who it's for → Complete the ritual → Formulator → FAQ (9, first open, footnotes 1 and 2 under it) → Reviews (filters work) → Pairs well with (homepage card system) → Guarantee band → Footnotes block (3 = stability test).
- [ ] 31 Sticky add to bag on phones only: appears after the main button scrolls away, glass Linen bar, reads "Add to bag · $54", never overlaps the cookie banner or another bar; no desktop bar.
- [ ] 31b Haze (default template): eyebrow "Step 03 · Moisturize", lexicon, benefits, at a glance, accordions all filled from metafields; no Long Light copy anywhere; the golden pair card shows; no empty block or "0" price.
- [ ] 31c Slow Hour: trust row shows only shipping and guarantee; accordion title "Ingredients and allergens"; no health claims anywhere.

## G. Copy (33 to 35)

- [ ] 33 US spelling; every H1/H2 ≤ 6 words with exactly one italic accent word, always last.
- [ ] 34 Eyebrows 2 to 4 words; CTAs are specific verb phrases (no bare "Shop now"); risk reversal beside the main CTAs.
- [ ] 35 Every statistic has a sun-dot marker whose footnote sits directly under its module (tap a marker: it jumps to the note) and again in the footnotes block, labelled illustrative placeholder data; reviews, testers and Mara are labelled sample/illustrative; no never-say words (search the page for: treat, heal, repair, flawless, clean, tan, sun-kissed, anti-aging, detox, miracle).

## H. Hygiene (36) and links

- [ ] 36a Exactly one H1 per page (Home: "Late light, bottled."; PDP: "Long Light Serum"). DevTools: `document.querySelectorAll('h1').length === 1`.
- [ ] 36b Meta title and description set (Home and Long Light), social share image set (paste the preview URL into a link-preview checker or check `og:image` in the page source).
- [ ] 36c Favicon is the Honey sun on Dusk, not Shopify's default.
- [ ] 36d No leftover theme defaults: demo sections, "Lorem", sample products, default social icons, "Powered by Shopify".
- [ ] 36e The Fraunces Light WOFF2 is preloaded (`<link rel="preload" … Fraunces_72pt_SuperSoft-Light.woff2>` in the page source).
- [ ] Links: click every link and button on Home and Long Light at 1440 and 390: nav (incl. anchors #ritual, #ingredients, #slow-hour, #our-story), hero CTAs, pin, shelf cards, "Shop all six", "See the details", ritual pins and steps, "Start with one step", "Shop the slow hour", "Write to us", footer menus, policies, golden pair links, "How returns work". None 404s; anchors land with the heading below the sticky header.
- [ ] Empty states: cart drawer empty; search with no results ("wxyz"); a sold-out state never appears (inventory untracked).
- [ ] 404 page renders in the skin (Minimog default page with Lumora type and colours).
- [ ] Horizontal scroll: none at 360 (DevTools: `document.documentElement.scrollWidth === innerWidth`).
- [ ] Performance sanity: Lighthouse mobile on Home ≥ 70 performance, no CLS from the hero pin or the clock (both are absolutely positioned or reserve their line).

## I. Hand-off

- [ ] Preview link (and password) copied; time spent noted; the client's live theme untouched.
