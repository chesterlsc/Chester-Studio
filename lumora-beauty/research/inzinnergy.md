# Reference teardown: inzinnergy.com

> Reference 3 of 3 for the Lumora Beauty trial (with coldbrookoutfitters.com and convenz.com). Goal: understand
> *why* this store feels polished so Lumora can hit the same bar with its own brand, never copy it.
> Captured 2026-11-23 at 1440×900 (desktop) and 390×844 (mobile, 2x) with Playwright, plus raw HTML, the theme's
> bespoke CSS/JS, computed styles, live-state probes (header, sticky bars, cart drawer) and a selector audit.
> Product studied: **Shower Power** (`/products/shower-power`), the hero product: hero hotspot, first card, two
> feature rows, 5 homepage links, 2 colour variants, 8 media.
>
> Screenshots and downloads stay in the session scratchpad (paths in section 14). Nothing third-party is copied
> into this repo.
>
> **Caveat (apps).** The store runs the **Vitals** app embed. Its CDN (`cdn-sf.vitals.app`) and API host
> (`appsolve.io`) are blocked by our research proxy, so whatever Vitals injects client-side (star rating, review
> widget, description tabs, upsell offers) is **absent from our captures**. The embed config proves a reviews
> module is set up (product metafield: **149 reviews, 4.73 average**, also exposed as JSON-LD `AggregateRating`).
> Everything else below is what the theme itself renders.

**How to use this doc:** sections 0, 4, 7, 9 and 15 are the parts to design against. Section 12 is where Lumora
can visibly beat this reference.

---

## 0. TL;DR: where the polish comes from (and where it stops)

**What it sells.** Four products, US market, $15 to $40, every item shown "on sale" against a compare-at price:
two high-pressure handheld shower heads (**Shower Power**, 7 spray modes, Black/Silver; **Shower LUX**, filter in
the handle, 3 modes), a **Microfiber Hair Towel Wrap** (4 colours) and a **Japanese Exfoliating Scrub Sponge**
(in practice a long scrub towel). Palette: deep ink, cool mist, one water-blue accent, one bright aqua.

1. **It is the same house kit as Convenz and Coldbrook.** `iz-motion.js` is 99.3% identical to Convenz's
   `cv-motion.js` once the prefix is swapped; `iz.css` shares 41 class names with `cv.css` (wrap, eyebrow,
   heading scale, highlight, lead, buttons with an arrow chip, reveal, marquee, hero, band, bento, product card,
   wordmark). Coldbrook uses the same architecture under `sp-`. One production line, reskinned per brand with a
   two-letter prefix. **The client will recognise lifted signatures instantly: match the level, change the shapes.**
2. **The homepage is entirely bespoke.** Eight custom sections plus a CSS-only "chrome skin" and a footer
   wordmark. Only the announcement bar, header, footer and mobile bottom bar are stock Minimog (and all four
   are restyled by the skin).
3. **A tonal, one-hue palette.** Every surface is a blue-grey tint or shade (mist `#F1F5F7`, mist-deep
   `#E1E9ED`, card `#F8FBFC`, ink `#0B1C27`), with one working accent (water `#1F6F8B`) and one bright accent (aqua
   `#7CC7E3`). The photography is graded into the same hue, so images and UI read as one surface.
4. **Editorial type pairing.** Cormorant Garamond at 46 to 118px with tight leading (0.96 to 1.02), slight
   negative tracking and `text-wrap: balance`; an italic second beat on the two biggest headlines. Hanken
   Grotesk does everything functional. 12px tracked caps eyebrows in the accent sit above every heading.
5. **Glass and softness.** A floating glass-pill header over an inset, rounded hero card; a glass hotspot
   callout and glass info bars on product cards; long, soft, ink-tinted shadows; a 14px radius family; pill
   buttons ending in a circular arrow chip.
6. **Rhythm through bands.** Rounded hero, then a hairline trust row, a staggered product grid, a tinted serif
   marquee, zig-zag feature rows, a tinted bento band, an overlapping image collage, and a closing photo band
   that fades from the page colour into the ink footer and a giant wordmark marquee.
7. **One motion system.** One easing curve, staggered fade-up reveals, slow image zooms, two marquees, a parallax
   band, all switched off under `prefers-reduced-motion`.
8. **AI art direction that holds.** 13 compositions (15 files with the mobile crops) in one environment
   (slate, steam, chrome, cool window light), no faces, products rendered faithfully. Pixel sizes match Gemini's native outputs. Mobile gets
   dedicated 4:5 crops cut from the same masters.
9. **The PDP falls off a cliff.** It uses stock Minimog blocks, supplier/AliExpress-style gallery images,
   generic supplier copy with risky claims, a dropdown for two colours, and no trust, benefits, bundle or FAQ.
   None of the homepage's content reaches it. This is the clearest place where Lumora can beat the reference.

---

## 1. Platform, build and apps

| Item | Finding |
|---|---|
| Theme | `Shopify.theme = {"name":"Inzinnergy","id":194178974067,"schema_name":"Minimog - OS 2.0","schema_version":"5.9.0","theme_store_id":null,"role":"main"}`. A renamed, uploaded copy of Minimog 5.9.0 (`theme_store_id: null`). |
| Section keys vs types | Homepage keys are hand-named in the template JSON (`iz_hero`, `iz_promise`…), so **key ≠ type**. The real type comes from `data-section-type` (`iz-hero`, `iz-promise`…), table in section 2. |
| Custom code | 10 custom sections: `iz-chrome-skin` (header group, style only, 7.9 KB of tokens plus Minimog overrides), `iz-hero`, `iz-promise`, `iz-collection`, `iz-words`, `iz-feature`, `iz-bento`, `iz-ritual`, `iz-band` and `iz-wordmark` (footer group). Shared library `assets/iz.css` (26.6 KB uncompressed, compiled with a source map, 113 classes) and `assets/iz-motion.js` (2.7 KB). Each section prints an ID-scoped `<style>` exposing its settings as CSS variables (e.g. `--iz-hero-inset: 12px; --iz-hero-radius: 26px; --iz-hero-size: 118px; --iz-callout-x: 55%; --iz-callout-y: 66%`), so paddings, ratios, stagger, focal points and scrims are editor settings. |
| Motion engine | `iz-motion.js` handles `data-iz-reveal` (IntersectionObserver, threshold .12, root margin -6% bottom), `data-iz-stagger` (sets `--i` per child for a 90ms delay step), `data-iz-marquee` (duplicates the track for a seamless loop), `data-iz-parallax` (factor, rAF on scroll) and `data-iz-progress` (`--p` 0 to 1). It re-inits on `shopify:section:load` and honours reduced motion. |
| Fonts | **Custom upload, not the Shopify font library**: Cormorant Garamond 400/500/600 and Hanken Grotesk 400/500/600 as **TTF** files in Shopify Files (`cdn.shopify.com/s/files/1/0991/5429/7203/files/CormorantGaramond-500.ttf`, `…/HankenGrotesk-400.ttf`), declared by Minimog's custom-font setting as `M-Heading-Font` / `M-Body-Font` with `font-display: swap`. No italic face, no WOFF2, no preload (section 4.1). |
| Theme settings (root vars) | Colours mapped to the palette (`--color-background 241,245,247`, button `11,28,39`, hover `31,111,139`, prices `31,111,139`, border `201,214,221`); buttons and inputs radius 30px; `--pcard-radius` and `--blocks-radius` 0 (cards are rounded by the skin; PDP media stays square); container 1 200px, fluid 1 420px + 65px offset; **section spacing 0 on every breakpoint** (sections own their padding). Leftover: `--color-image-overlay: #3A2B22` (a warm brown, unused). |
| Apps | **Vitals** (app embed `shopify://apps/vitals/blocks/app-embed`): Product Reviews configured (strings "Our Customers Love Us", "Happy Customers", "Verified buyer"; one placement setting `{"location":"atc_button","locator":"after"}`), Product Tabs (2 general description tabs), Upsell Builder offer types present, currency converter. Not renderable here (see caveat). **TrackingMore** (order-tracking page `/apps/trackingmore`, linked in the main nav as "Track Your Order"). **Shop Pay** accelerated checkout and **Shop Pay Installments** (`shopify-payment-terms`). **Meta pixel** (+ CAPI) through Shopify web pixels. **FoxKit** hooks (`<foxkit-cart-countdown>`, `<foxkit-cart-goal>`) with no visible output. No popup, wishlist UI or bundle widget in the theme. |
| Minimog built-ins in use | Transparent header on the homepage plus sticky on scroll-up; announcement slider (2 messages, 5s autoplay); mobile bottom bar (home, shop, cart, search; suppressed on the PDP); sticky add-to-cart (desktop and mobile); product recommendations; breadcrumb; page transition (fade + spinner); back-to-top button; quick add ("Select options") and second image on hover on stock cards. Age verifier section present but `data-enable="false"` (its CSS and JS still load on every page). `wishlist.js`, `compare-product.js` and `product-quick-view.js` also load. |
| Notable Minimog classes | `m-header[data-header-design="logo-left-menu-center"][data-sticky="on_scroll_up"].transparent-on-top`, `m-header__desktop/__mobile`, `m-announcement-bar m-gradient m-color-dark`, `m-footer m-footer--accordion m-color-footer`, `m-mobile-sticky-bar`, `m-main-product[data-layout="layout-4"]`, `media-gallery`, `m-product-media--slider`, `m-product-option--swatch_dropdown`, `m-product-form--main`, `m-add-to-cart m-button--secondary`, `m-product-dynamic-checkout`, `m-sticky-addtocart`, `product-recommendations`, `m-product-card--style-1 m-product-card--show-second-img`, `m-breadcrumb`, `m-page-transition`, `m-cart-drawer`, `m-age-verifier`. |
| PDP blocks (main-product) | `title`, `price` (`data-sale-badge-type="percentage"`, Shop Pay Installments), `variant_picker` (`swatch_dropdown`), `buy_buttons` (quantity, ATC, dynamic checkout, pickup availability), `description`. Section settings: column gap 50/20px, desktop slider on, video autoplay on, image zoom **off**, variant-grouped images off, featured media first. Sticky ATC on desktop and mobile. Recommendations: 5 per row, slider, mobile scroll, padding 100/100. |
| SEO / semantics | Homepage `<title>inzinnergy</title>` and **no meta description**; **two `<h1>`** on the homepage (Minimog's logo `h1.m-header__logo` plus the hero H1). PDP: title "Shower Power – inzinnergy"; meta description is raw bullet text ("…full-body water coverageFeel the stress…"); JSON-LD Product with `AggregateRating` 4.73/149 and `AggregateOffer`. Every PDP gallery image has `alt=""`. |

---

## 2. Homepage inventory (page order)

Desktop page height 7 558px; mobile 8 366px. Positions are `[y / height]` at 1440.

| # | Wrapper key → real type | Job | Layout and notable details |
|---|---|---|---|
| 1 | `iz-chrome-skin` (header group) → custom, CSS only | Site-wide token and override layer | `:root` tokens (12 colours, `--iz-radius: 14px`, `--iz-wrap: 1360px`, `--iz-header-h: 92px`, `--iz-ease: cubic-bezier(.2,.7,.2,1)`), plus `html, body {overflow-x: clip}`, antialiasing, aqua `::selection`, and restyles of the announcement, header pill, nav, buttons, inputs, stock product cards (boxed, multiply blend), PDP media blend, ATC, section subheadings, accordions, footer, cart drawer and focus rings. No markup. |
| 2 | `annoucement` → stock announcement bar (`m-color-dark`) [0 / 40] | Offer and risk reversal | Ink bar, 12.5px / 500 / .12em caps in foam. Swiper with 2 messages ("Free US shipping on orders over $70" linking to `/pages/shipping`, "30-day returns on every order" linking to the refund policy), autoplay 5s, bullets hidden. |
| 3 | `header` → stock header [40 / 78] | Navigation | `logo-left-menu-center`. Transparent over the hero, rendered as a **floating glass pill** (inner pill `rgba(11,28,39,.36)`, `blur(16px) saturate(1.2)`, 1px foam/16% border, radius 999px, min-height 64px, 14px from the top, long soft shadow). Foam PNG logo (150px). Once stuck it becomes a solid mist bar (62px) with the ink logo and a soft shadow; hides on scroll-down, returns on scroll-up. Nav: Shower heads, Bath essentials, Track Your Order, About, FAQ, Contact. Icons: search, bag. No mega menu. |
| 4 | `iz_hero` → `iz-hero` [40 / 812] | Brand promise, primary CTA, hero product | **Inset card**: 12px from the viewport edges, radius 26px, min-height 800px, ink base. Full-bleed image (5 504×3 072, focus 65% 50%) under two scrims: left-to-right ink at .70 → .385 at 42% → 0 at 68%, and bottom-up ink .70 → 0 at 34%. 7/5 grid. Eyebrow in aqua "High-pressure shower heads"; H1 118px "Pressure, / *refined.*"; 2-sentence lead (15.8px, foam 86%); two pill CTAs: foam "Shop shower heads" (sparkle lead icon, ink arrow chip) and ghost "Bath essentials" (drop lead icon, foam chip). **Glass hotspot callout** at 55% / 66%: aqua 7px dot with a 5px halo, a 22px hairline connector, eyebrow "Seven spray modes", product name, live price with struck compare-at, and an arrow chip; links to the PDP. "Scroll" cue bottom-right: caps label and a 44px ring with a drifting chevron. |
| 5 | `iz_promise` → `iz-promise` [852 / 173] | Trust row | 4 columns between top and bottom hairlines, 28px padding. Phosphor Light icon (28px, water) + serif title 21px + muted clarifier 13.5px: "Free US shipping / On every order over $70", "Easy returns / 30 days to send it back", "Secure checkout / Card or PayPal, always encrypted", "Tool-free install / Fits any standard shower hose". |
| 6 | `iz_collection` → `iz-collection` [1025 / 804] | The whole range | **Split header**: eyebrow "The collection" + H2 "Four pieces. / One better shower." on the left; lead + ink "Shop all" pill on the right, bottom-aligned with the heading. 4 cards, 4:5, gap 24px, **even cards dropped 40px** (stagger, with matching bottom padding). Glass info bars. Card images are art-directed packshots set in the section (not the products' featured images). |
| 7 | `iz_words` → `iz-words` [1829 / 138] | Rhythm break and keyword recall | Mist-deep band with hairlines. Serif 72px marquee: Pressure, Filtration, Spa at home, Less water, Softer towels, separated by water-drop icons (.42em, water). 5% edge-fade mask, 45s loop, pauses on hover. |
| 8 | `iz_feature` → `iz-feature` [1967 / 1996] | Product education ("which one to pick") | Centred head: eyebrow "Why it feels different", H2 "Find your perfect shower", lead. **3 zig-zag rows**: media 6.5fr (4:3, radius 14px, 1.035 hover zoom) and copy 5.5fr (max 480px; on flipped rows the copy hugs the image). Eyebrow = product name; H3 46px benefit; a long, specific paragraph; a hairline-topped row of **spec chips** with icons ("7 spray modes · Fine-mist setting", "140 mm face · Water-saving", "Filter in the handle · 3 spray modes"); a text CTA ("Shop Shower Power") with a mist chip that slides on hover. |
| 9 | `iz_bento` → `iz-bento` [3963 / 911] | Proof of benefits | Mist-deep band. Split head: eyebrow "Built for pressure", H2 "More pressure. / Less water.", lead right. 12-column bento, 250px rows, 20px gap: a large image tile (6×2) "Cleaner water" with arrow chip linking to LUX; a white card "Pressurized nozzles"; an ink card "Efficient by design" ("Up to 30% less water over a year…"); an image tile "After the shower" linking to bath essentials; an aqua-tint card "Fits in minutes" ("Universal G1/2 thread. Unscrew the old head, screw on the new one, done."). Phosphor Light icons 30px. Text cells lift 4px on hover. |
| 10 | `iz_ritual` → `iz-ritual` [4874 / 916] | Accessory cross-sell | 5/7 grid. Copy left: eyebrow "Complete the ritual", H2 "The bath / essentials", lead, a **product list between hairlines** (name · price · arrow chip), ink pill "Shop bath essentials". Media right: a 4:5 main image at 80% width plus an **overlapping square** (42%) at bottom-left with a 6px mist border and a long shadow. |
| 11 | `iz_band` → `iz-band` [5790 / 903] | Emotional close and final CTA | Full-bleed 21:9 image (parallax 0.1) with a **7-stop `color-mix()` fade from the page colour** at the top (40% height), a fade into ink at the bottom and a left scrim. Eyebrow "Every day, at home"; H2 101px "The spa, / *at home.*"; lead; foam pill "Shop the collection". A `#MainContent:has(...)` rule removes the main padding so the band sits flush on the footer. |
| 12 | `footer` → stock footer (`m-color-footer`) [6693 / 536] | Navigation, newsletter, legal | Ink, Minimog 1 200px container (left edge 135px). Logo PNG plus a 5-line brand statement (1/3 width); "Shop" (5 links); "Help" (6 links); newsletter "Stay in the flow" (30px serif), one-line promise, pill input (`#10293A` fill, `#23404F` border), foam "Subscribe" pill. Bottom: 9 payment icons, copyright, 4 policy links. Accordions on mobile. |
| 13 | `iz-wordmark` (footer group) → `iz-wordmark` [7228 / 330] | Sign-off | Ink band with a hair-dark top border; "Secure checkout" label + 5 payment icons; then a **216px serif "Inzinnergy" marquee** (60s, sparkle separators in aqua, foam at 92%) over an aqua radial glow rising from the bottom edge. |
| 14 | `mobile-sticky-bar` → stock | Mobile bottom nav | 60px mist bar, 4 icons (home, shop grid, cart with an aqua count bubble, search) with dividers. Mobile only; suppressed on the PDP. |
| 15 | `age-verifier-popup` → stock | None | Disabled (`data-enable="false"`); still loads its assets. |

---

## 3. Product page inventory (page order)

Template: `breadcrumb` → `main` → `product-recommendations`. **No custom `iz-*` section at all.** Page height
about 3 600px on desktop and 4 400px on mobile (including the strip under the footer).

| # | Section / element | Notable details |
|---|---|---|
| 1 | Announcement + header | Header in solid mist mode (not transparent); logo at x=135. |
| 2 | `breadcrumb` (stock) | Centred, 12px caps .1em: "HOME › HOME PAGE › SHOWER POWER". "Home page" is Shopify's default `/collections/frontpage` leaking into the trail. |
| 3 | `main` (stock main-product, layout-4) | 50/50 columns, 50px gap, 1 200px container. **Gallery**: 560×560 main slider + a thumbnail strip underneath (104px thumbs, 5 of 8 visible); prev/next arrows on desktop; zoom off. Media: a supplier collage (model + product + a strip of 7 spray modes baked in), an autoplay muted 3:4 video, then supplier/AliExpress-style images including a "7 Modes Pressurized" infographic. Filenames such as `Screenshot_2026-04-30_at_9.17.20_PM.png` and a hashed `S05b0…j.webp`. Aspect ratios vary from 0.75 to 1.20. All `alt=""`. Square corners (blocks radius 0) where the rest of the site uses 14px. Images are multiply-blended onto `#F8FBFC`. **Info column**: section 9. |
| 4 | Vitals (client-side, not captured) | Likely a star rating/reviews widget (149 reviews), 2 general description tabs, and upsell offers if active. |
| 5 | `product-recommendations` (stock) | "You Might Also Like" (34px serif, **Title Case**, centred). A 5-column grid holding **3 cards** (2 empty slots). Stock boxed cards (section 8.2). Slider on; on mobile a horizontal scroll with a peeking second card. Padding 100/100. |
| 6 | Footer + wordmark | Same as the homepage, then **a ~75px mist strip below the ink wordmark** (the space reserved for the sticky ATC is painted in the page colour). |
| — | Sticky ATC (persistent) | Desktop: slides up (74px mist bar) once the main ATC leaves the viewport; supplier thumbnail, serif title, variant select "Black - $40.00" (4px radius), quantity pill, ink ATC pill. Mobile: select + ATC only, visible whenever the main ATC is off-screen, **including on first load** (it covers the in-page colour picker). |

---

## 4. Design tokens

### 4.1 Typography

**Families and loading**

- **Cormorant Garamond** (headings, names) and **Hanken Grotesk** (everything functional), both open-source
  Google families, **uploaded as TTF** to Shopify Files and registered through Minimog's custom-font setting.
  Not the Shopify font library (that would load from `fonts.shopifycdn.com`). Only weights 400 and 500 of each
  family actually load on the homepage.
- **No italic face is uploaded.** The italic accents (`.iz-hl` in "*refined.*" and "*at home.*") are
  **browser-synthesised**: slanted roman letterforms, with the "f" sitting on the baseline instead of descending
  and roman serifs left on the feet (zoom: `inz_zoom_hero_italic.png`). Cormorant's real italic is far more
  beautiful, so this is a missed detail at 118px. The capability map notes the fix (upload the italic and declare
  it in skin CSS).
- TTF rather than WOFF2, and the heading face is not preloaded.

**Scale (computed at 1440 → 390)**

| Role | Family | Size | Weight | Line-height | Tracking | Case | Colour |
|---|---|---|---|---|---|---|---|
| Hero H1 | Cormorant | 118px → 50.7px (13vw) | 400, italic accent 400 | .96 | -.01em | Sentence | foam `#E8F0F4` |
| Band H2 (`--xl`) | Cormorant | 100.8px (7vw) → 46.8px | 400 | .98 | -.005em | Sentence | foam |
| Section H2 (`--l`) | Cormorant | 66.2px (4.6vw) → 38px | 500 | 1.02 | -.005em | Sentence | text `#10212B` |
| Feature H3 (`--m`) | Cormorant | 46px → 30px | 500 | 1.02 | -.005em | Sentence | text |
| Marquee words | Cormorant | 72px → 32px | 500 | 1 | -.005em | Sentence | ink |
| Footer wordmark | Cormorant | 216px (15vw) → 58.5px | 500 | .95 | -.01em | Title | foam 92% |
| Bento title / caption | Cormorant | 25.9 / 24.5px → 18px | 500 | 1.05 to 1.08 | | Sentence | inherit |
| Hero callout title | Cormorant | 22px → 19px | 500 | 1.05 | | Title | foam |
| Trust title | Cormorant | 21px → 18px | 500 | 1.1 | | Sentence | text |
| Footer newsletter title | Cormorant | 30px | 500 | 1.05 | | Sentence | foam |
| Footer column title | Cormorant | 16px (the skin wanted 20px) | 500 | 1.05 | | Title | foam |
| PDP H1 | Cormorant | 30px → 24px | 500 | 1.4 | -.005em | Title | text |
| Recommendations H2 | Cormorant | 34px → 23px | 500 | 1.05 | -.005em | Title Case | text |
| Eyebrow | Hanken | 12px (11px in the callout) | 500 | 1.5 | .18em | CAPS (via CSS) | water `#1F6F8B`, aqua on dark |
| Lead | Hanken | 15.84px (clamp 15.5 to 17.5) → 15px | 400 | 1.65 | 0 | Sentence | muted `#56707D`, foam 86% on dark; max 54ch |
| Body, PDP description | Hanken | 16px | 400 | 24px | 0 | | muted |
| Nav | Hanken | 14.5px | 500 | 1.5 | .02em | Sentence | foam over the hero, text when stuck |
| Kit button | Hanken | 14.5px | 500 | 1 | .02em | Sentence | |
| Minimog button (ATC etc.) | Hanken | 15px | 500 | 24px | .02em | Sentence | |
| Announcement | Hanken | 12.5px | 500 | 20px | .12em | CAPS | foam |
| Breadcrumb | Hanken | 12px | 400 | 18px | .1em | CAPS | text |
| Card title / price | Hanken | 15 / 14px → 12.5 / 11px | 500 | 1.25 | .01 / .04em | | foam |
| Spec chips / trust clarifier | Hanken | 13 / 13.5px | 400 | 1.5 | | | muted |

**Rules the system follows**

- The serif carries every headline and every *name*: product names in the callout, trust titles, bento titles
  and footer titles. The grotesk carries everything read fast or clicked: eyebrows, leads, nav, buttons, prices
  and card titles.
- Content is sentence case in the source; caps only appear through CSS (eyebrows, announcement, breadcrumb).
- `text-wrap: balance` on all headings, plus manual `<br>` for two-beat headlines.
- Italic appears only as the second beat of the two largest display headlines (hero and band).

### 4.2 Colour

| Token | Hex | Role | Contrast |
|---|---|---|---|
| ink | `#0B1C27` | Announcement, primary buttons, ink bento cell, band base, footer, wordmark | foam on ink 15.05:1 |
| ink-mid | `#10293A` | Footer newsletter field | |
| text | `#10212B` | Headings and body on light | 15.0:1 on mist |
| muted | `#56707D` | Leads, secondary text | 4.77:1 on mist (AA), **4.26:1 on mist-deep (fails AA)** |
| mist | `#F1F5F7` | Page background | |
| mist-deep | `#E1E9ED` | Tinted bands (words, bento), image placeholders, text-button chip | |
| card | `#F8FBFC` | Stock product cards, white bento card, form fields, PDP media tile | |
| hair | `#C9D6DD` | Hairlines and borders | 1.35:1, decorative only |
| hair-dark | `#23404F` | Dividers on ink | |
| foam | `#E8F0F4` | Text on dark, light buttons | |
| water | `#1F6F8B` | Accent on light: eyebrows, icons, prices, ATC hover | 5.17:1 on mist, 4.61:1 on mist-deep |
| aqua | `#7CC7E3` | Bright accent: button chips, cart bubble, eyebrows on dark, focus ring, hotspot dot, selection, sparkles | 9.21:1 on ink |
| aqua tint | `color-mix(aqua 55%, mist)` ≈ `#B1DCEC` | "Fits in minutes" bento card | ink text 11.8:1 |
| footer link | `#B9CAD3` | Footer links (aqua on hover) | 10.3:1 on ink |
| glass | `rgba(11,28,39,.42)` + `blur(16px) saturate(1.2)` + 1px `rgba(232,240,244,.16)` | Hero callout, card bars (the header pill uses .36) | |

- **Strategy:** a single hue family, from near-black ink to near-white mist, plus two accents in the same family.
  Nothing on the homepage is a "foreign" colour, which is why it feels calm and expensive. The only saturated
  outsider is the Shop Pay purple on the PDP.
- The photography is graded to the same values (ink shadows, mist highlights, water-blue midtones), so the
  imagery and the UI share one surface.

### 4.3 Spacing, grid, rhythm

- **Containers.** `.iz-wrap`: max 1 360px + padding `clamp(16px, 4vw, 48px)` gives 1 264px of content with a
  left edge at 88px at 1440, and 16px gutters at 390. Stock sections (header, footer, breadcrumb, PDP) use
  Minimog's 1 200px container + 15px, giving a left edge at 135px. The hero copy sits at 77px (12px inset +
  `clamp(24px, 4.5vw, 72px)`). **Three different left edges on one page.**
- **Section padding (desktop → mobile at ×0.7, the trust row at ×0.6):** trust 28/28; collection 72/56 (+40
  stagger); words 32/32; feature 88/88; bento 88/88; ritual 96/64; band 320/173 (min-height 760); wordmark
  40/24. PDP recommendations 100/100. Minimog's global section spacing is 0.
- **Inner rhythm:** eyebrow → H2 14px; H2 → lead 18px (14px in rows); lead → actions 30px (22px in rows, 20px in
  split heads); head → grid `clamp(28px, 4vw, 52px)` = 52px; card gap 24px; bento gap 20px; feature rows
  86px apart; ritual column gap 86px; trust columns 48px apart.
- **Grids:** split headers 6/6 (collection) or 7/5 (bento) with bottom alignment; feature rows 6.5/5.5; ritual
  5/7; bento 12 columns with 250px rows and `grid-auto-flow: dense`.
- **Background rhythm:** mist frame around the hero → mist (trust, collection) → mist-deep band (words) → mist
  (feature) → mist-deep band (bento) → mist (ritual) → photo band fading into ink → ink footer → ink wordmark.
  Hairlines bound the trust row and the tinted words band.

### 4.4 Radius, borders, shadows, glass, motion

- **Radius:** 14px token for cards, frames, bento cells and the collage; hero 26px (22px on mobile); callout
  16px; card glass bar 12px (10px mobile); 999px for buttons, inputs, badges and the header pill; 50% for chips;
  30px for the quantity stepper. **Off-system:** variant and sticky selects at 4px; PDP media and thumbnails at
  0px; stock card media square inside a 14px card.
- **Borders:** 1px hair on light; 1px foam/16% on glass; a 6px mist frame around the collage inset image.
- **Shadows (all long, soft, negative spread, ink-tinted):** card `0 30px 50px -36px rgba(11,28,39,.45)`, hover
  `0 40px 60px -36px …/.55`; glass `0 24px 50px -30px rgba(0,0,0,.6)`; header pill `0 20px 40px -28px
  rgba(0,0,0,.6)`; button hover `0 12px 26px -16px rgba(11,28,39,.55)`; collage inset `0 30px 50px -30px …/.45`;
  bento text cell and stock card hover `0 30px 44px -30px …/.35`.
- **Motion:** one easing (`cubic-bezier(.2,.7,.2,1)`) for everything; .25s for colour, .35s for transforms, .5s
  for card lifts, .8/.9s for reveals, 1 to 1.2s for image zooms. Reveal = opacity 0 → 1 with a 26px rise (media:
  18px + scale .97), 90ms stagger per child. Hover: buttons -2px, product cards -6px, bento cells -4px, callout
  -3px; images scale 1.035 to 1.04; chips turn aqua and rotate -45°; arrows nudge 3 to 4px. Marquees run at 45s
  (words) and 60s (wordmark), linear, pausing on hover. Scroll-cue chevron drifts 8px over 3s. Band parallax 0.1.
  Minimog's page-transition fade sits on top. `prefers-reduced-motion` disables all of it.

### 4.5 Buttons, chips, links, inputs

- **Kit pill (`.iz-btn`):** min-height 50px, padding 6/6/6/22px, 14.5px / 500 / .02em, radius 999px, with a
  **36px circular chip** on the right holding a Phosphor arrow (arrow-up-right for navigation, arrow-right for
  text links) and an optional 17px leading icon in water or aqua (sparkle, drop). Variants: **ink** (default,
  aqua chip), **foam** (on dark, ink chip), **ghost** (transparent, 1px currentColor border, fills on hover),
  **text** (no fill, mist-deep chip that turns aqua and slides 4px on hover). Hover: -2px lift + soft shadow,
  arrow nudges 3px. Focus: 2px aqua outline, 3px offset.
- **Stock buttons** are skinned to the same pill (15px / 500 / .02em) but stay **46px** tall: ATC in ink,
  turning water on hover; white "Select options" on cards. Two heights coexist (50 vs 46).
- **Standalone chips:** 40px foam circles (34px in bento captions, 38px on cards and the callout, 30px on mobile
  cards, 32px mist-deep in the ritual list). On hover they turn aqua and rotate -45°, which turns the up-right
  arrow into an **up** arrow (probably meant to land on "right").
- **Links and inputs:** footer links `#B9CAD3`, aqua on hover; pill inputs (999px, 46px); the newsletter field on
  ink uses `#10293A` with a `#23404F` border. Selects are not skinned (4px corners).

---

## 5. Header, announcement bar, menu, footer

- **Announcement:** one ink line, 40px, caps 12.5px / .12em; two rotating messages: a shipping threshold and a
  returns promise, each linking to its policy. It is not sticky. On mobile it fits on one line.
- **Header over the hero:** the glass pill floats 14px below the announcement, with 22px/12px inner padding, the
  foam logo at left, nav centred and icons at right. It is built purely from the skin (`.m-header:not(.stuck)
  .transparent-on-top .m-header__inner {…}`) on top of Minimog's native transparent header. On mobile the pill is
  inset 12px with a hamburger, centred logo (115px), search and bag.
- **Header after scroll:** Minimog's sticky state (mist bar, 62px, ink logo, soft shadow); hides on scroll-down
  and reappears on scroll-up. On the PDP the header is solid from the start.
- **Menu:** six flat links, four of them utilities (Track Your Order, About, FAQ, Contact). No mega menu, no
  imagery, no dropdowns. The skin's nav hover rule (`.m-menu__item--main:hover > .m-menu__link--main {opacity:.72}`)
  matches nothing (the link's parent is `.m-menu__item`), so the intended hover dimming never fires.
- **Footer:** ink, logo + brand statement ("…for people who want a stronger shower without a bigger water
  bill…"), Shop and Help columns, and a named newsletter ("Stay in the flow" / "Restock alerts, new bath
  essentials and the occasional shower tip. One email now and then, never a flood."). Bottom row: 9 payment
  icons, copyright, policy links.
- **Footer flaws:** the column titles render at 16px beside a 30px newsletter title. The skin's 20px rule
  loses twice: its class selector is misnamed (`.m-footer__block-title`; Minimog uses `.m-footer--block-title`)
  and its `.m-footer h3` fallback is outranked by Minimog's own `.m-footer--middle .m-footer--block-title`
  (checked in the CSS cascade). Payment icons appear
  twice (9 in the footer bottom, 5 more in the wordmark band). The footer uses the 1 200px container, so its
  left edge (135px) does not line up with the sections above (88px).
- **Wordmark sign-off:** a giant serif marquee of the brand name over a soft aqua glow, preceded by a "Secure
  checkout" strip. This is the kit's signature ending (Convenz has the same idea).

---

## 6. Imagery

- **Three tiers, one art direction.**
  1. *Cinematic lifestyle* (hero, closing band): dark slate shower walls, steam, a chrome head mid-spray, a hand
     only.
  2. *Product in context* (feature rows, bento, ritual): the real SKUs on slate or stone tile with steam,
     droplets and soft window light; one macro (waffle towel with water beads).
  3. *Clean packshots* (product cards): each product on a seamless blue-grey sweep with a soft contact shadow,
     2 048×2 048.
- **How consistency is achieved:** one environment (slate, tile, chrome, steam), one light (cool, soft, from a
  window or behind), **one grade that equals the UI palette**, **no faces** (only a hand in the hero), consistent
  camera language (3/4 angles, shallow depth of field) and product shapes kept faithful to the real items.
- **AI-generated, almost certainly with Gemini.** No C2PA or IPTC tags survive Shopify's CDN, but the pixel sizes
  match the native outputs of Gemini 3 Pro Image exactly: hero 5 504×3 072 (16:9 4K), band 6 336×2 688
  (21:9 4K), feature images 2 400×1 792 (4:3 2K), ritual 1 856×2 304 (4:5 2K), cards and details 2 048×2 048
  (1:1 2K). Strong circumstantial evidence rather than proof.
- **Mobile art direction:** the hero and band ship separate `<picture>` sources (`iz-hero-mb.jpg` 2 457×3 072,
  `iz-band-mb.jpg` 2 150×2 688), which are 4:5 cuts taken from the desktop masters at full height. The subject is
  re-framed for portrait rather than centre-cropped by CSS.
- **Homepage card images are overrides:** the collection section uses its own art-directed images
  (`iz-card-sp.jpg`…), not the products' featured images. This is how the homepage stays on-grade while the
  catalogue still holds supplier images.
- **The PDP and stock cards break all of it:** bright white supplier photos, a model with a face, baked-in
  text and collages, a comparison infographic printed with another brand's name ("CZZXI VS other", shown as the
  hover image on a recommendation card), mixed aspect ratios and empty alt text.

---

## 7. Bespoke touches beyond stock Minimog

| Touch | How it is built here | Lumora route in Minimog (our own shapes, not a copy) |
|---|---|---|
| Floating glass-pill header over the hero | Skin CSS on Minimog's transparent header (`.transparent-on-top`), backdrop blur, 999px radius | Same hook with Custom CSS; choose our own shape (e.g. a full-width frosted bar or an arch-topped hero) rather than the kit's pill |
| Inset rounded hero card with two scrims | `iz-hero` section (12px inset, 26px radius, CSS-variable scrims) | Slideshow or Image-with-text-overlay section + Custom CSS for the inset/radius and gradient scrim |
| Hotspot callout on the hero (pin, connector line, glass card, live price) | `iz-hero` markup + `::before`/`::after` pin and line | Custom Liquid block over the hero, or Minimog `hotspots-image` / `product-bundles` pins restyled |
| Pill button with a circular arrow chip and leading icon | `.iz-btn` + `.iz-btn__chip` primitives | Custom CSS on `.m-button` (pseudo-element chip) or Custom Liquid buttons in bespoke sections |
| Trust row between hairlines | `iz-promise` | `icon-box` section + Custom CSS (hairlines, serif titles) |
| Staggered card grid with glass info bars | `iz-collection` (`nth-child(2n)` offset, absolute glass bar) | `featured-collection` + Custom CSS (stagger, overlay info) or Custom Liquid |
| Serif word marquee with icon separators and edge-fade mask | `iz-words` + motion script | `scrolling-promotion` section + Custom CSS (mask-image, serif size) |
| Zig-zag rows with spec chips | `iz-feature` | `image-with-text` (alternate sides) + Custom CSS for the meta row |
| Bento grid mixing image tiles and three card tones | `iz-bento` (12-col CSS grid, dense flow) | Custom Liquid section (grid) or `custom-content` + CSS |
| Overlapping two-image collage | `iz-ritual` (absolute inset image with a page-coloured border) | `image-with-text` layered second image + Custom CSS |
| Closing band fading from page colour into the ink footer, with parallax | `iz-band` (multi-stop `color-mix()` gradient) | Image banner + Custom CSS gradient overlay; parallax optional |
| Giant wordmark marquee with glow | `iz-wordmark` (footer group) | `scrolling-promotion` in the footer group or Custom Liquid; CSS radial glow |
| Card and PDP image blend into the tile colour | `mix-blend-mode: multiply` on stock cards and PDP media | Not needed: our renders are made on the tile colour |
| Motion layer (reveal, stagger, marquee duplication, parallax) | `iz-motion.js` + `[data-iz-reveal]` CSS | Minimog's built-in scroll animations + Custom CSS; no extra script needed for a trial |
| Icon set | **Phosphor Icons, Light weight**, inline SVG (all 13 icons matched path-for-path: sparkle, arrow-up-right, drop, arrow-right, caret-down, truck, arrows-counter-clockwise, lock, wrench, shower, gauge, leaf, funnel) | Pick one line family and one stroke weight for all icons |
| Micro-polish | `text-wrap: balance`, aqua `::selection`, aqua focus rings, antialiasing, `overflow-x: clip` safety net | Same, in the skin CSS |

---

## 8. Product card anatomy

### 8.1 Homepage card (`.iz-pcard`, custom)

1. The whole card is a link: radius 14px, `overflow: hidden`, mist-deep base, **4:5 ratio** (1:1 sources cropped
   with `object-fit: cover`), long soft shadow. On desktop, even cards drop 40px.
2. Image: an art-directed packshot on a blue-grey sweep, filling the card.
3. **Glass info bar**, inset 12px from the left, right and bottom: radius 12px, padding 12/12/12/16px, glass
   recipe. Inside: title (15px / 500 foam, 2-line clamp), price (14px / 500 / .04em) with a compare-at at 60%
   opacity and 12.5px struck, and a 38px foam arrow chip on the right.
4. Optional badge at top-left (glass pill, or aqua for sale): defined in CSS, not used.
5. Hover: card lifts 6px, shadow deepens, image zooms 1.04 over 1s, chip turns aqua and rotates.
6. Mobile: 2 columns, no stagger, bar inset 8px, **title 12.5px (3-line clamp), price 11px**, chip 30px.

### 8.2 Stock card (recommendations, collection pages)

1. Boxed by the skin: `#F8FBFC` fill, 1px `#C9D6DD` border, 14px radius, lift 5px on hover.
2. Square media with the supplier image multiply-blended into the card tint; **second image on hover** (on the
   towel this is a supplier infographic printed "CZZXI VS other").
3. Sale badge "-33%" in a water-blue pill at top-left.
4. "Select options" white pill on hover (desktop), a bag icon quick-add on mobile.
5. Title 16px / 500, price 16px in water with the compare-at struck. **No inner padding**: text sits flush
   against the card's border.

### 8.3 Takeaway

Two unrelated card systems on one site. The homepage card is the reference-grade one; the stock card is what
shoppers see everywhere else. Lumora uses **one card spec on every template**.

---

## 9. PDP buy box and every conversion element, in order

### 9.1 Above the fold (1440×900)

1. **Announcement bar**: free US shipping over $70, alternating with 30-day returns (offer + risk reversal).
2. **Header** (solid), with search and bag.
3. **Breadcrumb**: Home › Home page › Shower Power.
4. **Gallery** (left, 560px square): supplier collage first, autoplay video second (camera badge on its thumb),
   a thumbnail strip showing 5 of 8 media, arrows on desktop, no zoom.
5. **Title**: H1 "Shower Power", 30px serif.
6. **Price**: $40.00 in water (~24px) with $50.00 struck in grey. No "save" badge even though the block's sale
   badge type is "percentage".
7. **Shop Pay Installments**: "Zero interest · 2 payments of $20.00 with shop ⓘ".
8. **Variant picker**: "Color: Black" label + a 99px dropdown with 4px corners for just **2 options**. Swatch
   colours are defined (`rgb(0 0 0)`, `rgb(211 211 211)`) but not shown.
9. **Quantity stepper** (pill, 130×46) + **Add to cart** (ink pill, 410×46, water on hover).
10. **Buy with Shop** (Shop Pay purple, full width), visually the loudest element in the box, and **More payment
    options** (underlined link).
11. **Pickup availability**: wired up, but no locations, so nothing renders.

### 9.2 Below the fold

12. **Description**: a rich-text wall of about 1 330px on desktop and 1 930px on mobile. Manual "•" bullets and
    bold subheads in muted text, pasted inline styles that render one bullet at 14px in a system font, a stray
    `<meta charset>` in the body, generic supplier copy and unverifiable claims ("up to 520% increased
    pressurization", fine mist "naturally generating a increase in negative ions… help support a more relaxed
    mood").
13. **Vitals (not captured)**: reviews (149, 4.73), 2 general tabs, possibly upsell offers.
14. **"You Might Also Like"**: 3 stock cards in a 5-column grid, sale badges, hover second image and quick add.
15. **Footer** (newsletter, policies, payment icons) and the **wordmark band** ("Secure checkout" + 5 icons).

### 9.3 Persistent and post-click

- **Sticky ATC**: on desktop it appears after the main ATC scrolls away (thumbnail, title, variant select with
  price, quantity, ATC). On mobile it shows the select + ATC whenever the main button is off-screen, including on
  first paint. The bottom nav is suppressed on the PDP, so there is no clash.
- **Back-to-top** ink circle (desktop).
- **Cart drawer**: serif "Shopping Cart" title. Empty state is one sentence ("Your cart is currently empty.") with
  no CTA and no suggestions. Because the skin paints `.m-cart-drawer` mist, **the overlay is opaque and the page
  disappears** behind the drawer (the same skin bug Convenz has). FoxKit cart-goal and countdown hooks exist but
  show nothing, so there is no free-shipping progress bar despite the $70 threshold.
- **Search rich results**: JSON-LD `AggregateRating` makes stars eligible in Google even though our capture shows
  none on the page.

### 9.4 Missing levers

No rating near the title (in our capture), no benefit bullets or icons, no trust row or delivery estimate at the
buy box, no guarantee, no stock signal, no bundle ("Shower Power + towel"), no comparison of Power vs LUX, no
what's-in-the-box, specs table, install steps or FAQ, no UGC. The homepage already has strong content for most
of these (spec chips, "Fits in minutes", the ritual set, the bento proof points), and **none of it reaches the
PDP**.

### 9.5 Mobile buy box (390×844)

First screen: one-line announcement, header, breadcrumb, a 360px square image, 5 thumbnails, title (24px),
price, Shop Pay line, "Color: Black". The **sticky ATC bar (74px) overlays the bottom** and hides the in-page
colour select. The in-page quantity stepper (full width), ATC and Shop Pay button sit just below the fold,
followed by about 2.3 screens of bullets before the recommendations (a horizontal scroll showing 1.4 cards).

---

## 10. Mobile treatment

**What changes**

- **Header:** the glass pill is inset 12px (47px tall) with a hamburger, centred logo, search and bag. Once
  stuck it becomes a solid mist bar.
- **Hero** re-stacks: a dedicated 4:5 image on top (110vw, max 640px) with a gradient into ink; the callout
  becomes a static glass card at the image's bottom-right (pin and line hidden); copy sits on the ink panel below
  (H1 50.7px; only the first lead paragraph is shown; buttons wrap). The scroll cue is hidden.
- **Grids collapse:** trust row 2×2 (22px icons, 18px titles); collection head stacks and cards go 2-up with no
  stagger; feature rows stack image-first; bento keeps the big image full width (16:10) and runs 2-up for the
  small cells (image cells square); ritual puts the collage first (main 86%, inset 46%).
- **Type** scales through `clamp()`: H2 38px, band H2 46.8px, marquee 32px, wordmark 58.5px.
- **Section padding** ×0.7 (trust ×0.6). Gutters are 16px in custom sections and 15px in stock ones.
- **Closing band:** image area set by `padding-top: 100vw`, text over a bottom gradient.
- **Footer:** accordions for Shop, Help *and the newsletter* (so sign-up is collapsed); payment icons wrap onto 2
  rows; the wordmark shrinks to 58px.

**What appears or sticks**

- Minimog bottom nav (60px: home, shop, cart with count, search) on the homepage.
- On the PDP the bottom nav is replaced by the sticky ATC (select + ATC).
- The header reappears on scroll-up; the announcement does not stick.

**What goes wrong**

- At 390×844 the hero's primary CTA ("Shop shower heads") is **half-covered by the fixed bottom nav** on first
  paint, and the secondary CTA is below it.
- Card prices are 11px and titles 12.5px inside the glass bars (small for the most important numbers).
- The newsletter hides in an accordion, and its title (30px) is mismatched with "Shop"/"Help" (16px).
- On the PDP, the sticky bar covers the colour picker before the shopper has scrolled.

---

## 11. Copy tone and structure

**Voice (homepage):** calm, specific and sensory; short declaratives; second person; no exclamation marks; no
hype adjectives. Numbers do the persuading: "140 mm face", "1200 ml", "Up to 30% less water", "G1/2 thread",
"5 ft hose". The light water puns are kept to microcopy ("Stay in the flow… never a flood").

**Headline formulas**

| Formula | Examples on the site | Where |
|---|---|---|
| Noun, then an italic twist | "Pressure, *refined.*" · "The spa, *at home.*" | Hero, closing band |
| Two-beat contrast with full stops | "Four pieces. One better shower." · "More pressure. Less water." | Section H2s |
| Benefit as a plain statement | "Seven ways to shower" · "Pressure that reaches the whole body" · "Filtered, for skin and hair" | Feature H3s |
| Utility title | "Find your perfect shower" · "The bath essentials" | Section H2s |

**Eyebrows (2 to 4 words, sentence case in source, caps via CSS):** a category ("High-pressure shower heads"), a
section role ("The collection", "Complete the ritual"), a claim ("Built for pressure", "Why it feels
different"), a moment ("Every day, at home"), or the product name in feature rows ("Shower Power", "Shower LUX").

**Body structure:** each lead is 1 to 3 sentences, opening with the mechanism or the feeling and closing with a
reassurance ("…so even the strong settings feel kind on skin", "…nothing about your plumbing has to change").
Feature paragraphs run 60 to 75 words with concrete detail.

**Microcopy:** trust items pair a 2 to 3 word title with a one-line clarifier ("Easy returns / 30 days to send
it back"); spec chips are 2 to 3 words; every CTA is "Shop + object" ("Shop shower heads", "Shop Shower Power",
"Shop bath essentials", "Shop the collection", "Shop all"). Specific, but monotonous across the page. The footer
statement names the audience and the promise in one sentence.

**Where it breaks:** the PDP description is generic supplier copy with superlatives, em-dash run-ons and
health-adjacent claims; the recommendations title is in Title Case; one product is named "…Scrub Sponge" while
its image and the homepage copy call it a scrub towel.

---

## 12. Weaknesses, and what Lumora does better

| # | Weakness on Inzinnergy | What we do instead |
|---|---|---|
| 1 | **The PDP is stock and off-brand**: supplier gallery (white backgrounds, baked-in text, collage, screenshot filenames, mixed ratios 0.75 to 1.2, empty alt, square corners), a dropdown for 2 colours, no benefits, trust, bundle or FAQ, and a 1 330px wall of bullets. None of the homepage's modules reach it. | The PDP is built from the same system as the homepage: on-brand gallery (our renders + graded photos, one ratio, alt text), swatches/pills, benefit bullets, trust line, routine bundle, accordions, reviews, FAQ, and homepage modules (feature row, bento proof, ritual) reused below the fold. |
| 2 | **Off-voice, risky PDP copy**: "520% increased pressurization", negative ions that "support a more relaxed mood"; manual bullets; pasted inline styles (one bullet renders at 14px in a system font); a stray `<meta>` in the body; meta description "coverageFeel". | One voice on both pages; cosmetics-compliant claims; any statistic footnoted as placeholder data; content structured in accordions; clean rich text with no `style=` attributes; written meta descriptions. |
| 3 | **Two product-card systems**: glass-bar cards on the homepage; boxed stock cards elsewhere with no inner padding, supplier images and a third-party infographic ("CZZXI VS other") as the hover image; 3 cards in a 5-column grid. | One card spec on every template; the second image is our own alternate angle or texture; grid column count matches the product count (or a carousel). |
| 4 | **Faux italics** at 118px (no italic face uploaded), TTF files, no preload. | Upload the true italic as WOFF2, declare it, preload the heading face. |
| 5 | **Three left edges** at 1440: hero copy 77px, sections 88px, header logo/footer/PDP 135px (1 360px kit wrap vs Minimog's 1 200px container). | One container and gutter for header, hero, sections, PDP and footer. |
| 6 | **Unverified skin**: 39 of 108 selectors match nothing on the home, product or collection page at load (some target states we did not trigger, many are plainly misnamed: `.m-footer__block-title`, `.m-product-media__thumbnails`, `.m-badge`, `.m-collapsible`, the nav hover rule), and one live rule is outranked by Minimog's own CSS. Visible results: 16px footer titles next to a 30px newsletter title, no nav hover dimming, unstyled badges, and an opaque cart overlay. | A selector audit before shipping: every rule in our skin maps to a live element on home, PDP and an open cart. |
| 7 | **Mobile first screen**: primary CTA half-hidden behind the fixed bottom nav; card prices at 11px; the newsletter collapsed inside an accordion. | Primary CTA fully visible above the bottom nav at 390×844; prices ≥13px; newsletter open on mobile. |
| 8 | **No visible social proof** in the theme on either page: reviews exist only inside a client-side app embed and JSON-LD; no testimonials, press or UGC on the homepage. | Theme-rendered reviews and testimonials styled to our tokens, a rating under the PDP title, placeholder data labelled as such in our notes. |
| 9 | **Utility-heavy nav**: 4 of 6 main links are utilities (Track Your Order, About, FAQ, Contact); no mega menu or imagery. | Shopping-led nav (shop by category or concern, routine, best sellers, about); utilities in the footer; one image mega menu. |
| 10 | **SEO and semantics**: two H1s on the homepage, `<title>inzinnergy</title>` with no meta description, "Home page" in the breadcrumb, empty alt text, a Title Case heading among sentence-case ones. | One H1 per page, written title and description, a clean breadcrumb (or none), alt text everywhere, one case rule. |
| 11 | **Redundancy and loose ends**: payment icons shown twice; a mist strip under the ink footer on the PDP (space reserved for the sticky ATC); the disabled age verifier still loads its assets; wishlist, compare and quick-view scripts with no visible UI; a leftover brown overlay token. | Payment icons once; reserved sticky space painted in the footer colour; no unused sections or scripts. |
| 12 | **Contrast**: muted leads on the mist-deep bands at 4.26:1 (fails AA for 15.8px text). | A darker muted token for tinted bands; every small text pair ≥4.5:1. |
| 13 | **Cart drawer**: opaque overlay, a bare empty state, no free-shipping progress despite the advertised $70 threshold. | Translucent overlay, a branded empty state with a CTA and 2 best sellers, a free-shipping progress bar tied to the announced threshold. |
| 14 | **Micro-inconsistencies**: chip hover rotates the up-right arrow to point up; selects at 4px among pills; kit buttons 50px vs stock buttons 46px; the sale badge type is set but no saving is shown on the PDP; PDP H1 line-height 1.4 vs 1.02 elsewhere. | One rotation direction (towards "right"), one radius family, one button height, one heading spec, a deliberate sale display (or none). |
| 15 | **Naming mismatch**: "Japanese Exfoliating Scrub *Sponge*" is a towel in every image and in the copy. | Product names, images and copy agree. |

---

## 13. Borrow vs avoid

**Borrow the level (adapt, never lift):**

- A tonal palette from one hue family with one working accent and one bright accent, with the imagery graded
  into it.
- A serif display face at large sizes with tight leading and balanced wrapping, against a quiet grotesk; small
  tracked caps eyebrows in the accent.
- A shoppable hero: one product callout with a live price, linking straight to the hero product.
- A hairline trust row directly under the hero.
- Product education as zig-zag rows with spec chips, then a bento of proof points mixing image and colour tiles.
- An overlapping image collage for the "complete the routine" set.
- A closing band that fades from the page colour into the footer, so the page ends with a dissolve rather than a
  cut.
- Dedicated 4:5 mobile crops for every full-bleed image.
- One easing curve, staggered reveals and slow zooms, all disabled under reduced motion.

**Avoid:**

- Reproducing the kit's signatures verbatim: glass pill + inset hero card + arrow-chip pills + staggered glass
  cards + wordmark marquee. The client knows this kit; use our own shape language.
- Letting the PDP fall back to stock, or using supplier imagery anywhere.
- Faux italics, dead skin CSS, three gutters, duplicate payment rows.
- Hiding the newsletter (or anything that converts) in a mobile accordion.

---

## 14. Evidence (session scratchpad, not committed)

Base: `/tmp/claude-0/-home-user-Chester-Studio/c51c471c-f281-5048-b5b7-f7b60a856929/scratchpad/research/`

- Homepage desktop: `inzinnergy_home_desktop.png` (+ `_01`…`_05`, `_overview`, `.styles.json`)
- Homepage mobile: `inzinnergy_home_mobile.png` (+ `_01`…`_06`, `_overview`, `.styles.json`)
- PDP desktop: `inzinnergy_pdp_desktop.png` (+ `_01`…`_03`, `_overview`)
- PDP mobile: `inzinnergy_pdp_mobile.png` (+ `_01`…`_04`, `_overview`)
- Live states: `inz_states/{home,pdp}_{desktop,mobile}_fold.png`, `home_{desktop,mobile}_sticky_header.png`,
  `pdp_{desktop,mobile}_scrolled.png`, `cart_drawer_empty_desktop.png`, `pdp_buybox_2x.png`,
  `pdp_rec_card_hover_2x.png`, and `probe.json` (header states, sticky ATC transforms, bottom bar, failed hosts)
- Token dumps (root vars, typography samples, section boxes, overflow): `inzinnergy_tokens_{home,pdp}_{desktop,mobile}.json`
- Raw HTML and catalogue: `inzinnergy_html/{home.html, pdp.html, pdp_main_stripped.html, products.json}`
- Theme assets: `inzinnergy_assets/{iz.css, iz.pretty.css, iz-motion.js, custom-style.css}`
- Original images for the art-direction and provenance check: `inzinnergy_imgs/`; contact sheet
  `inz_imagery_sheet.png`; faux-italic zoom `inz_zoom_hero_italic.png`
- Icon match: `phosphor_pkg/` (Phosphor core 2.1.1 from npm)
- Tools: `../tools/inz_probe.cjs` (live states), `../tools/inz_selectors.cjs` (skin selector audit),
  `../tools/inz_detail.cjs` (2x buy box and card hover), `../tools/tokens.cjs`, `../tools/shoot.cjs`

---

## 15. Polish checklist for Lumora (testable)

1. **Token layer first.** One `:root` block (≤12 colours: one working accent and one bright accent; radius,
   container and easing tokens) loaded site-wide and mapped into Minimog colour schemes. Test: no raw hex values
   in any custom CSS outside the token block.
2. **One hue family.** Background, tinted band, card, hairline, text, muted and ink are tints or shades of a single
   brand hue, and the imagery is graded into it. Test: a swatch strip of the UI tokens next to 10 sampled image
   midtones reads as one family.
3. **One left edge.** Header logo, hero copy, section content, PDP columns and footer share the same x (±1px) at
   1440 and at 390. Test: compare bounding-box `left` values in DevTools.
4. **One section-header spec.** Eyebrow (12 to 13px, 500, .16 to .18em caps, accent) → H2 (one `clamp()`, line-
   height ≈1.02, one tracking value, `text-wrap: balance`) → lead (≤54ch, line-height 1.6 to 1.65, muted) → CTA.
   Only two layouts: split (bottom-aligned) or centred. Test: computed H2 size, line-height and letter-spacing
   are identical in every section, PDP included.
5. **Real italics or none.** If a headline uses an italic accent, the italic face is uploaded (WOFF2) and
   declared. Test: `document.fonts` lists an italic face for the heading family, and `font-synthesis: none`
   changes nothing visually.
6. **Font hygiene.** WOFF2 only, ≤4 faces, the heading face preloaded. Test: network panel on a cold load.
7. **One CTA anatomy at one height.** Every CTA (homepage buttons, ATC, sticky ATC, newsletter) shares one height
   and radius; hover = -2px lift + soft ink-tinted shadow; arrows move in the direction they point. Test: computed
   heights are equal; hover transforms match.
8. **A radius family of three** (e.g. 14px media/cards/tiles, a larger hero radius, 999px pills/inputs/selects)
   plus 50% chips, applied to PDP media and variant controls too. Test: no computed `border-radius` outside the
   set.
9. **One shadow family.** Long, soft, negative-spread shadows tinted with the ink token; at most 3 recipes. Test:
   grep the skin for `box-shadow`.
10. **Trust row under the hero** (4 items between hairlines: icon + serif title + 13 to 14px clarifier) and a
    compact version of the same row at the PDP buy box. Test: present on both templates with the same icons and
    wording.
11. **One icon family and weight** at three sizes (e.g. 16/22/28px) across trust row, spec chips, bento,
    buttons, PDP benefits and footer. Test: every inline SVG comes from the same set.
12. **Hero.** A scrim keeps the H1 and lead ≥4.5:1; one shoppable callout with live price linking to the hero
    product; on mobile a dedicated 4:5 crop, and the primary CTA fully visible above the fixed bottom nav. Test:
    at 390×844 the CTA's bottom edge is above `844 - bottom-bar height`.
13. **Header behaviour.** Transparent over the hero with our own treatment, solid on scroll with a logo swap,
    hides on scroll-down and returns on scroll-up; ≤5 shopping-led main links, with utilities in the footer.
    Test: scroll down and up on both widths.
14. **One product-card system on every template** (homepage, PDP recommendations, collection, cart upsell): same
    ratio, tile colour, ≥12px inner padding, 2-line title clamp, price ≥13px on mobile, same hover (lift + ≤1.04
    zoom). The second image is our own render, never an infographic. Test: compare computed styles of a homepage
    card and a recommendation card.
15. **Grids fit the catalogue.** No empty slots: 6 products → 3 or 6 columns, 4 on a 2×2 or a carousel. Test:
    PDP recommendations and the homepage grid at 1440 and 390.
16. **Background rhythm.** Base → tinted band (with hairlines) → base → dark close; the closing band dissolves
    from the page colour into the footer colour; no strip of page colour under the footer on any template
    (sticky-ATC padding included). Test: full-page screenshots of home and PDP.
17. **Motion spec.** One easing; reveal = opacity + ~24px rise with an 80 to 100ms stagger; image zoom ≤1.04
    over ~1s; at most one marquee per page plus the footer sign-off; everything off under
    `prefers-reduced-motion`. Test: emulate reduced motion in DevTools.
18. **Imagery set.** One environment, light, grade and prop kit; one model policy (hands only, or one
    consistent model); hero and band get 4:5 mobile crops cut from the same masters; the PDP gallery uses the
    same art direction at one aspect ratio, with descriptive alt text; sources ≥2 048px. Test: a contact sheet of
    every image on both pages.
19. **PDP above the fold at 1440×900**: title, rating + count, price (with saving if on sale), 3 benefit bullets
    with icons, swatches or pills (no dropdown for ≤4 options), quantity + ATC as the strongest element with
    dynamic checkout quieter beneath, and a delivery/returns line. Test: all visible without scrolling.
20. **PDP depth below the fold** reuses homepage modules (benefit rows, proof bento, routine bundle) plus
    accordions (key ingredients, how to use, full ingredient list, shipping and returns), FAQ, reviews styled to
    tokens, and recommendations in the homepage card. ≤120 words of description before the first accordion.
    Test: the rich text contains no `style=` attributes.
21. **Sticky ATC** in our tokens (pill, price shown): desktop after scroll; on mobile it replaces the bottom nav
    and never hides the variant picker on first paint. Test: load the PDP at 390×844 and check the picker is
    visible.
22. **Cart drawer.** Translucent overlay (page still visible), a branded empty state with a CTA and 2 best
    sellers, and free-shipping progress tied to the announcement threshold. Test: open the drawer empty and with
    one item.
23. **Contrast.** Every small text pair ≥4.5:1, including muted text on tinted bands, eyebrows, prices, and text
    on glass or photos. Test: a contrast checker on each token pair in use.
24. **Hygiene.** Exactly one H1 per page; a written homepage title and meta description; no "Home page" in the
    breadcrumb; alt text on every image; payment icons shown once; no disabled sections or unused scripts loading;
    **every skin selector matches a live element** (run `querySelectorAll` on home, PDP and an open cart). Test:
    selector audit + Lighthouse SEO.
25. **Copy system.** Two headline formulas used deliberately (a comma twist with a real-italic second beat, and a
    two-beat contrast), benefit-led H3s, 2 to 4 word eyebrows, specific CTAs that vary by job ("Shop the serum",
    "Build your routine", not "Shop now" everywhere), concrete numbers with footnoted placeholder data,
    cosmetics-compliant verbs, and product names that match their images. Test: read-through against the copy
    deck.
