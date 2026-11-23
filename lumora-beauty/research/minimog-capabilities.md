# Minimog capability map (for the Lumora Beauty build)

Prepared 2026-11-23. Purpose: every homepage and product-page decision we make must be buildable in
Minimog (by Foxecom) with its sections/blocks plus light Custom CSS / Custom Liquid. This file maps what
the theme can do, how the client's three reference stores actually achieved their polish, and where the
limits are.

## Evidence legend (read this first)

| Tag | Meaning | Trust |
|---|---|---|
| **[L]** | Seen in the live HTML of a reference store running Minimog (all three run **Minimog - OS 2.0, v5.9.0**) | Verified |
| **[R]** | Section file confirmed to exist in Minimog 5.9.0 via Shopify's Section Rendering API on coldbrookoutfitters.com (`/?section_id=<file>` returns 200 with Minimog markup; unknown names return 404) | Verified |
| **[A]** | Class names / attributes found in Minimog's own CSS/JS assets (`/cdn/shop/t/2/assets/*.css` and `*.js`) | Verified that the code path exists; editor label not seen |
| **[D]** | Foxecom docs (docs.foxecom.com blocks scripts, so read through search snippets) | Likely, wording may be for another version |
| **[S]** | Shopify docs (help.shopify.com / shopify.dev, via search snippets and Context7) | Verified platform rule |
| **[K]** | Our own knowledge, not confirmed this session | Unverified: check in the editor |

"Section file" ids below are the real Liquid file names (what `?section_id=` accepts). The editor label is
what you see in "Add section". Where I could not find the file name the id is marked "unknown".

---

## 0. TL;DR for the team

1. **Version.** All three references run Minimog **5.9.0** (`Shopify.theme.schema_version`) [L]. Minimog is sold
   by Foxecom/ThemeForest, not the Shopify Theme Store (`theme_store_id: null`; `themes.shopify.com/themes/minimog`
   is 404). Latest releases: **6.0.0 (27 May 2026)** and **6.1.0 (6 Nov 2026)** [D]. A fresh install on the
   test store is probably 6.x: check Online Store > Themes before building (deltas in section 8).
2. **The references are not "stock Minimog".** Every one of them adds **custom section files to the theme code**
   (prefixes `sp-*` on Coldbrook, `iz-*` on Inzinnergy, `cv-*` on Convenz) and a **site-wide "chrome skin"
   section in the header group** that holds brand tokens and overrides Minimog classes [L][R]. Coldbrook adds
   a style-only **homepage "index skin"**; Inzinnergy and Convenz add a custom CSS asset and a ~1 KB motion
   script. Their bespoke look (rounded inset hero with glass callout,
   bento grids, marquee bands, torn-paper/ridge dividers, giant footer wordmark, boxed product cards) comes
   from that code, not from Minimog settings.
3. **Their PDPs are close to stock and thin**: title, price, variant picker, buy buttons, description, sticky
   add-to-cart, a reviews app section, recommendations [L]. Our PDP can beat them clearly with stock Minimog
   blocks plus a few Custom Liquid touches.
4. **Typography**: Minimog takes either a Shopify-library font or **uploaded font files** (URL@weight per
   weight). Uploaded fonts are exposed as `M-Heading-Font` / `M-Body-Font` [L]. All three references upload
   at least one font; Coldbrook even uploads Barlow Condensed, which is in Shopify's library, to get four real
   weights. None of them upload an italic, so their italic accent words are **faux italics**: an easy polish
   win for us (section 5.2).
5. **Custom CSS limits** [S]: 500 characters per section field, 1,500 for the theme-wide field, only `@media`,
   `@container`, `@layer`, `@supports` in section CSS, no `@import`, URLs only from `cdn.shopify.com`.
   **Custom Liquid** takes up to **50 KB** per field and has none of those restrictions, so it is the
   practical home for a skin stylesheet and bespoke markup.
6. **Mobile spacing trap**: Minimog caps section padding on mobile at `min(setting, 40px)` and scales it
   to 0.8x (laptop) / 0.6x (tablet) [A]. Mockups that show 80-120 px gaps on mobile need CSS to match.
7. **FoxKit** (Foxecom's app) supplies bundles, quantity breaks, related products, countdown, stock countdown,
   free-shipping goal, in-cart upsell, pre-order, size chart, sales pop and more; Minimog has hooks for it built
   in [L][D]. It must be installed on the client's store (ask first). Native alternatives exist for most PDP needs.

---

## 1. How the reference stores reached their polish

### 1.1 Coldbrook Outfitters (theme "Coldbrook Outfitters Theme", Minimog 5.9.0) [L][R]

| Area | Sections (wrapper key, file) | Stock or custom |
|---|---|---|
| Header group | `annoucement` (stock announcement bar), `header` (stock; `data-header-design="logo-left-menu-center"`, `data-sticky="on_scroll_up"`, mega menu), `sp_chrome_skin` (custom file `sp-chrome-skin`, style only) | mixed |
| Homepage | `sp_hero` (custom `sp-hero`), `sp_activity` (custom `sp-activity-grid`, 6-up image tiles with scrim), `sp_bestsellers` (**stock product-tabs** + class `sp-bestsellers`), `sp_scene` (custom `sp-shop-scene`), `sp_promise` (custom `sp-promise`), `sp_stories` (**stock Image cards** + class `sp-stories`), `featured_collection_*` (stock), `blog_posts_*` (stock), `slider_*` (**stock slideshow**, one video slide, class `sp-video-band`), `sp_testimonials` (**stock testimonials** + class), `sp_forest` (custom full-bleed band fading into the footer), `sp_index_skin` (custom file `sp-index-skin`, style only) | mixed |
| Footer group | `footer`, `mobile-sticky-bar`, `age-verifier-popup` (all stock) | stock |
| PDP | `breadcrumb`, `main` (stock main-product), Judge.me review widget inside Minimog's app section, `product-recommendations` | stock |

Techniques seen in their CSS:
- **Brand tokens** as CSS custom properties on `:root` (`--sp-paper`, `--sp-rust`, `--sp-radius`, an easing
  curve) declared once in the skin section; every override reads them.
- **Hook classes on stock sections** through Minimog's per-section "Custom attributes" field (the class lands on
  the `<section class="m-section ... sp-stories">`), then the index skin restyles them: caps headings, rust
  eyebrows, equal-height product rows, hover zoom on image cards, boxed testimonial cards, quiet slider dots.
- **Torn-paper edges** on the stock slideshow: `::before/::after` with an inline SVG data-URI background,
  flipped with `scaleY(-1)` for the top edge. **Ridge divider** in the custom hero as inline `<svg>`.
- **Topographic texture** via a `.topo` hook class: `background-image: var(--sp-topo)` repeated at 600 px.
- **"Tile-blend"**: `mix-blend-mode: multiply` so supplier photos on white sit on the cream card colour.
- Fonts: heading = uploaded Barlow Condensed (400/500/600/700) as `M-Heading-Font`; body = Source Sans Pro
  from the Shopify library. `h1,h2,h3{text-transform:uppercase}` set in a theme-level CSS field (a
  `<style data-shopify>` in the head).
- Reduced-motion guards, and a "scroll-reveal safety" rule that forces `.m-scroll-trigger` visible where it
  could get stuck.

### 1.2 Inzinnergy (Minimog 5.9.0) [L][R]

Custom files: `iz-hero`, `iz-promise`, `iz-collection`, `iz-words`, `iz-feature`, `iz-bento`, `iz-ritual`,
`iz-band`, `iz-wordmark` (footer group), `iz-chrome-skin` (header group); assets `iz.css` (5.5 KB) and
`iz-motion.js` (1 KB).
- Hero: inset card (`--iz-hero-inset: 12px`, `--iz-hero-radius: 26px`), dark scrim, 118 px serif title with an
  italic accent word, a floating glass product callout (`--iz-callout-x/y`), pill CTAs, a scroll cue.
- Header: **glass pill** while transparent over the hero (`backdrop-filter: blur(16px) saturate(1.2)`,
  `border-radius: 999px`), solid once stuck. Uses Minimog's native "transparent header on homepage"
  (`data-transparent="true"`, class `transparent-on-top`) as the hook.
- Pill buttons with a 2 px hover lift and soft shadow; boxed "mist" product cards with `multiply` blend and a
  -5 px hover lift; the same blend on PDP media; eyebrow (`.m-section__subheading`) restyled in the accent colour.
- Staggered 4-column product grid (`--iz-col-stagger: 40px`), serif marquee band with masked fade edges,
  bento grid, offset two-image "ritual" collage, full-bleed band fading into the footer colour, giant footer
  wordmark marquee.
- Motion script: reveal-on-scroll with per-child stagger (`--i`), marquee track duplication, parallax factor,
  scroll-progress variable `--p`; it honours `prefers-reduced-motion`.
- Fonts: uploaded **Cormorant Garamond** 400/500/600 (heading) + uploaded **Hanken Grotesk** 400/500/600 (body).
  Theme settings: buttons and inputs radius 30 px.
- PDP: stock main-product (media layout-4 with desktop slider and thumbnail strip, `swatch_dropdown` picker),
  sticky add-to-cart on desktop and mobile, recommendations.

### 1.3 Convenz (Minimog 5.9.0) [L][R]

The entire homepage is **one custom section** (`convenz_coffee`) plus `cv-chrome-skin` (header group) and
`cv-wordmark` (footer group), assets `cv.css` + `cv-motion.js`. Heading font Anton (Shopify library), body
uploaded Hanken Grotesk. Theme-level custom CSS (about 1,000 characters) re-styles h1-h3 and hides some social
links. At the time of checking its product URLs returned 404 and `/products.json` was empty, so its PDP could
not be inspected.

### 1.4 What this means for us

- Matching the references' level means **brand tokens + a site-wide skin + 2-4 bespoke moments**, layered on
  stock sections. That is exactly the references' pattern.
- Two ways to ship it (decision for the lead):
  - **A. Editor-only (our current standard):** stock sections; hook classes via "Custom attributes"; one
    **Custom Liquid** section holding the skin `<style>` (<= 50 KB) placed in the header group if the editor
    allows it, otherwise at the top of each template (home, product); bespoke blocks (hero callout, ingredient
    spotlight, wavy dividers, footer wordmark) as Custom Liquid sections. Downside: Custom Liquid content
    has no editor settings, so copy edits mean editing HTML text.
  - **B. Theme code (what the references did):** new `sections/*.liquid` files with schemas, plus
    `assets/custom.css.liquid` (Foxecom's sanctioned place for CSS, migrated by FoxHome updates [D]). Needs
    "Edit code" permission on the client's store and is heavier to review. Same visual result as A.
- Both are legitimately "built in Minimog". A is faster to review and safer for a trial; B is more editable
  for the client later.

---

## 2. Homepage section cheat sheet

Common to almost every Minimog section [L][A][D]: colour scheme select (`m-gradient m-color-<scheme>`),
container type (`container` 1200-1320 px / `container-fluid` up to 1420-1520 px + 60 px gutters /
`container-full` edge to edge / `container-narrow` 740 px), padding top/bottom (`--section-padding-*`),
section header (subheading = eyebrow, heading with size select, description, optional "view all" link,
alignment), **Custom attributes** (extra class/ID), **animation** (scroll reveal: fade in / fade in up /
left / right / none, with card cascade `data-cascade` + `--animation-order`).

| Editor section | File id | Verified | Key settings and blocks | Lumora use |
|---|---|---|---|---|
| Slideshow | `slider` | [R][L][A] | Blocks: image slide, **video slide** (MP4 from Files). Heights adapt/small/medium/large/fullscreen; 9 content positions; text size; slide text animation (fade in up/left/right); autoplay + speed; arrows; dots; content stacked under the image on mobile; button styles primary/secondary/white/link | Hero carousel, or a full-bleed video band (Coldbrook uses it this way) |
| Image with text overlay (hero) | `video-hero` | [R][A] | Image **or video** background (MP4 / YouTube), overlay, heights adapt to fullscreen, content position, text size, buttons, content stack on mobile | Single campaign hero; texture/application video hero |
| Image with text | `image-with-text` | [R][A] | Image left/right, **layered second image** (`--layer`), floating "move up-down" image animation, subheading/heading/description/button, column gap, offset top | Brand story, ingredient spotlight, founder note |
| Multiple image with text | `multiple-image-with-text` | [R] | Carousel of image + text slides; autoplay, speed, nav arrows, pagination, gap | "How to use" steps, ritual chapters |
| Image cards | unknown (in use on Coldbrook) | [L][A] | 5 layouts (`--layout-1..5`), per-card colour scheme, desktop + mobile image, subheading/heading/link button, hover effects (scale up / scale down / zoom in), mobile scroll or stacked, fixed button | Shop by concern / skin type / category |
| Collection list | `collection-list` | [R] | Grid or slider, items per row, hover effect (scaling-down), heading-at-left variant, mobile grid/scroll | Shop by category (if collections exist) |
| Collection tabs | `collection-tabs` | [R] | Big image + list of collections, switch on hover, autoplay, image left/right | Alternative category explorer |
| Collage with tabs | `collage-tabs` | [R] | Tabbed collage layout | Optional |
| Collection showcase | `collection-showcase` | [R] | Columns (3), image left/right | Optional |
| Featured collection | `featured-collection` | [R][L] | Collection, items per row and rows, slider or grid, mobile grid/scroll, "view all" as link or button, **flash sale bar + countdown** | Bestsellers grid of our 6 products |
| Product tabs | `product-tabs` | [R][L] | Tab blocks (each a collection), horizontal tabs, items per row (6 on Coldbrook), slider toggle, load-more link | "Bestsellers / New / Sets" tabs |
| Featured products slider | `featured-product-slider` | [R] | Product slider synced with an image column, image left/right, autoplay, pagination | Hero-product spotlight carousel |
| Featured product | unknown | [A][D] | Uses main-product blocks inside `.m-featured-product`; image side left/right, buy button [D] | Single hero product on the homepage (verify label in editor) |
| Product bundles | `product-bundles` | [R][A] | Image with **numbered hotspot pins**, product list, running **total price**, one "add all to cart" button; layout 1/2, image left/right | "Shop the ritual" set on home **and** PDP |
| Hotspots image | `hotspots-image` | [R][D] | Image with product hotspots, position sliders, desktop/mobile aspect ratio | Shoppable flat-lay |
| Lookbook | `lookbook` (+ `lookbook-slider.js`) | [R][A][D] | Image with up to 5 tagged products [D]; slider variant image left/right, product card style 5 | Shoppable editorial |
| Before/after slider | `image-comparison` | [R][A][D] | Two images (desktop + mobile each) + heading; horizontal or vertical; small/medium/large | Texture or "glow" comparison (placeholder, compliant wording) |
| Scrolling promotion (marquee) | `scrolling-promotion` | [R][A][D] | Blocks: image, announcement (text/icon + link), testimonial (text, product, image, icon); speed (`--duration`), direction left/right, pause, item gap | Ingredient/claims marquee, press quotes ticker |
| Icon box (text with icons) | `icon-box` | [R][A] | Icon/image + heading + text blocks; icon beside or above text; items per row; mobile slider | Benefits row (cruelty-free, vegan, recyclable glass) |
| Testimonials | `testimonials` | [R][L][A] | **8 layouts**; blocks: star rating, title, text, author (image/product per docs [D]); autoplay; per-block colour scheme; fraction or bullet pagination | Reviews strip |
| Press ("Featured in") | `press` | [R] | Quote slider synced with a logo row; autoplay | "As seen in" quotes |
| Brand list (logo list) | `brands-list` | [R][D] | Logo blocks, 2-8 visible, slider with mobile autoplay | Press or retailer logos |
| Gallery images | `gallery` | [R][D] | Image blocks with links, columns (4), rows, grid or mobile swipe (2 cols) | Instagram-style UGC grid |
| Collapsible tabs (FAQ) | `collapsible-tabs` | [R][D] | Accordion blocks (heading + content), optional image left/right | Homepage FAQ |
| Video | `video` | [R] | YouTube/Vimeo/MP4, autoplay, loop, muted, cover image, ratio 16:9 | Texture/application film |
| Rich text | `rich-text` | [R] | Heading/text/button blocks, alignment | Manifesto line |
| Custom content | `custom-content` | [R][D] | Free layout of blocks: image, text, lookbook item, product bundle item, icon box (6.0+), width/alignment per block | Small editorial grids |
| Custom Liquid | `custom-liquid` | [R] | One Liquid/HTML field (<= 50 KB), wraps in `<section class="m-section m-custom-liquid">` | Bespoke moments + skin CSS |
| Countdown timer | `countdown-timer` | [R][D] | End date/time, button; **evergreen mode is 6.0+** | Launch only (avoid fake urgency) |
| Promotion countdown timer | `promotion-countdown-timer` | [R][D] | Image + countdown + text | Optional |
| Promotion banner | `promotion-banner` | [R] | Heading, text, button, colour scheme | Offer band |
| Newsletter | `newsletter` | [R][A] | Vertical/horizontal, with or without image, bordered/dark form, icon | Sign-up block |
| Blog posts | `blog-posts` | [R][L] | Blog, grid or mobile scroll, image ratio, tags/date/excerpt | Journal (not needed for trial) |
| Recently viewed | `recent-viewed-products` | [R][L] | Products to show, per row, slider | Collection/PDP |
| Contact form | `contact-form` | [R] | | Not needed |
| Header / Announcement / Footer / Mobile sticky bar / Age verifier / Cart drawer | `header`, `footer`, `mobile-sticky-bar`, `age-verifier-popup`, `cart-drawer` (announcement file unknown) | [R][L] | Header designs (e.g. logo-left-menu-center), **transparent over the home hero**, sticky (on scroll up), mega menu; footer blocks + newsletter + payment icons; mobile bottom nav (hidden on PDP) | Global chrome |

Not found in Minimog 5.9.0 under any file name we tried, and no matching CSS/JS asset: **Instagram feed**,
**Store locator** (arrives in 6.0), **Featured promotion**, **Product list banner**, **Image with slider**,
**shoppable video**. Absence is weaker evidence than presence (Image cards also escaped our name guesses while
being in use), so treat them as unavailable unless the test store's "Add section" list shows them. `multicolumn` and `bento`
render on Coldbrook but are **not Minimog** (third-party markup, own fonts); do not plan on them.

---

## 3. Product page

### 3.1 Template sections available below the fold (product.json)

| Section | File id | Verified | Notes |
|---|---|---|---|
| Breadcrumb | `breadcrumb` | [R][L] | Centred crumb above the product |
| Product information (main product) | `main-product` | [R][L] | Blocks in 3.2, media in 3.3, sticky ATC in 3.4 |
| Product information tabs | `product-details-tabs` | [R][D] | Tabs on desktop, collapsible on mobile (`m-product-collapsible`) |
| Product reviews | `product-reviews` | [R] | Heading + wrapper for a reviews app |
| Apps (app section wrapper) | `apps` | [R][L] | Minimog wraps app blocks with padding/colour; Coldbrook puts the Judge.me widget here |
| Product recommendations | `product-recommendations` | [R][L] | Shopify recommendations API, slider, items per page; 6.1 adds card layout/ratio/vendor settings [D] |
| Recently viewed | `recent-viewed-products` | [R] | |
| Any homepage section | see section 2 | [R] | Image with text, icon box, before/after, product bundles, multiple image with text, collapsible tabs (FAQ), testimonials, scrolling promotion, video, custom liquid all work on the product template |

Per-product content: Shopify **dynamic sources** let section/block text and image settings read product
metafields [K: platform feature], so one PDP template can serve all 6 products (ingredients, how-to, key
claims) if we fill metafields.

### 3.2 Main product blocks

| Block (editor) | Type id | Verified | What it does / settings | Lumora use |
|---|---|---|---|---|
| Title | `title` | [L][A] | H1; optional wishlist button beside it; product type/vendor label above | Product name |
| Price | `price` | [L][A] | Sale/compare-at, sale badge (percentage; fixed amount on cards since 5.9), **Shop Pay installments** line, unit price, "tax included" note | Price + installments |
| Rating | `rating` | [A] | Theme star rating (product reviews); most stores use an app block instead | Stars under title |
| App block | `@app` | [L] | Any app's block: Judge.me star badge on Coldbrook; FoxKit blocks | Reviews badge, FoxKit |
| Badge | `badge` | [A] | Small label above the title | "Bestseller" / "New" |
| Text | `text` | [A] | Free text, styles incl. subtitle and uppercase | One-line benefit, "for dry, dull skin" |
| Short description / Description | `description` | [L][D] | Full or short description (rte) | Hook paragraph |
| Breadcrumb | `breadcrumb` | [A] | Crumb inside the info column | Optional |
| Variant picker | `variant_picker` | [L][A] | Styles: dropdown, **button (pills)**, swatch, colour, **image swatch**, swatch+dropdown; option to start with no variant selected ("Choose an option"); colour names map to hex in theme settings; FoxKit **size guide** link inside the option label | Size pills (15 ml / 30 ml), shade swatches |
| Buy buttons | `buy_buttons` | [L][A] | Quantity stepper, Add to cart, **dynamic checkout** (Shop Pay), **pickup availability**, slots for FoxKit countdown / stock countdown | Main CTA |
| Inventory status | `inventory_status` | [A][D] | Threshold, status text ("Only 3 left"), pulsing dot, optional bar; states in stock / low / backorder / sold out | Honest low-stock only |
| Shipping information | `shipping` | [A][D] | Estimated delivery date range + shipping text, date format | "Order today, arrives Thu-Mon" |
| Trust badge | unknown | [A][D] | Image of payment/trust icons | Payment + guarantee badge |
| Product meta | unknown | [A][D] | SKU, vendor, type, collections, tags, availability list | Skip (clutter) |
| Collapsible tab | `collapsible_tab` | [A][D] | Heading + text or custom Liquid, default open/closed (docs wording from sibling theme Megamog; page-content source unverified) | Benefits, Key ingredients, How to use, Full INCI, Shipping & returns |
| Countdown | unknown | [D] | Sale countdown in the buy box | Only for a real promo |
| Add-on buttons | `addons` | [A][D] | Compare, **Ask a question** (modal form, `ask-question.js`), social share, custom code | "Ask our skin team" |
| Share | `share-social` | [A] | Social share links | Optional |
| Custom content | unknown | [D] | Content block inside the info column | Mini "pairs well with" |
| Custom Liquid | `custom_liquid` | [A][D] | Any Liquid/HTML in the buy box | Icon trust row, ingredient chips, routine upsell |
| Upload image field / custom fields | unknown | [A][D] | Line-item properties (personalisation) | Not needed |
| Custom tags | unknown | [D] | Product tags as chips | Skin-type chips (if tagged) |
| Live views | unknown | [A] | `m-product-live-views` ("people viewing") | Do not use (fake urgency) |
| Complementary products | not found | - | No Minimog evidence. Use FoxKit related products/bundles, the Minimog `product-bundles` section, or Custom Liquid | "Complete the ritual" |
| Icon with text | not found as a PDP block | - | Use Custom Liquid, Text, Trust badge image, or an Icon box section below | Icon row |

### 3.3 Media gallery

- Layouts [D]: **Standard, Grid 1 column, Grid 2 columns, Grid mix, Slider 2 columns, Slider vertical,
  Slider full-width** (internally `layout-1..7` [A]: layout-6 = vertical thumbnail rail on the left, layout-7 =
  centred carousel with faded neighbours and centred info). Both references use **layout-4 with "desktop
  slider" on**, which renders a large image plus a horizontal thumbnail strip [L].
- Options seen [L][A]: image zoom (PhotoSwipe lightbox + hover zoom icon), video autoplay, 3D models with
  "View in your space", variant-grouped images (filter gallery by selected variant), show featured media first,
  mobile slider with pagination/thumbnails, **sticky media column and sticky info column** on desktop
  (`position: sticky; top: 30px`).

### 3.4 Sticky add-to-cart [L][A]

- Section setting: show on desktop and/or mobile (`data-show-on-desktop/mobile`).
- Appears when the main Add to cart button leaves the viewport (IntersectionObserver); adds
  `html.stick-atc-show` (use it to lift chat widgets or a back-to-top button).
- Desktop bar: thumbnail, title, variant dropdown, quantity, Add to cart (+ dynamic checkout when enabled).
- Mobile bar: variant dropdown + Add to cart only (quantity and dynamic checkout hidden).
- The footer "mobile sticky bar" (bottom nav) is suppressed on the product template, so there is no clash.
- Restyle with CSS only (e.g. pill button, price in the bar).

### 3.5 Conversion levers: native vs app

| Lever | Native Minimog | FoxKit / other |
|---|---|---|
| Bundle / routine upsell | `product-bundles` section, Custom Liquid | FoxKit Product bundles, Quantity breaks |
| Delivery estimate | Shipping information block | - |
| Low stock | Inventory status block | FoxKit Stock countdown |
| Countdown | Countdown block / sections | FoxKit Countdown timer, Cart countdown |
| Reviews | Rating block + `product-reviews` section | Judge.me (used by Coldbrook) |
| Free-shipping progress | - (not in theme settings) | FoxKit Free shipping goal |
| Size/shade guide | Collapsible tab or Custom Liquid | FoxKit Size chart (hook already in variant label) |
| Pre-order | - | FoxKit Pre-order (badges already wired into cards and sticky ATC) |
| Ask a question | Add-on buttons | - |

---

## 4. FoxKit (Foxecom's companion app)

- Setup [D]: install FoxKit, enable the **FoxKit Theme Helper** app embed (required since Minimog 3.5.0), then add
  FoxKit app blocks/sections to the product template: **Product bundles, Quantity breaks (volume discounts),
  Related products, Countdown timer, Stock countdown**.
- Cart and site-wide [D]: **In-cart upsell, Free shipping goal bar** (physical products; discount via Shopify
  Functions by default), **Cart countdown**, **Pre-purchase offers**, **Sales notifications** (sales pop),
  **Lucky wheel**, **Pop-ups**, **Pre-order**, **Size charts**, **Back-in-stock alerts**, Analytics.
- Theme hooks already present in Minimog 5.9.0 [L][A]: `<foxkit-preorder-badge>` on every product card,
  `foxkit-sizechart-button` in the variant label, `.foxkit-preorder-note` and `.foxkit-button` handling in the
  sticky ATC, `foxKitBaseUrl: "foxkit.app"` in `window.MinimogSettings`.
- Pricing (App Store snippet, verify): free tier with limited features, Starter about $19/month, 14-day trial.
- For the trial: installing an app on the client's store needs their OK. Every PDP need above has a native
  fallback, so FoxKit is optional.

---

## 5. Theme settings

### 5.1 Colour schemes [L][D]

- Shopify colour-scheme group: shipped schemes `default`, `dark`, `footer`, `badge-hot`, `badge-new`,
  `badge-sale`, plus any number of custom ones (rendered `.m-color-scheme-<uuid>`).
- Tokens per scheme: background, background secondary, **gradient background** (gradients allowed, applied by
  `.m-gradient`), text, text secondary, heading, button, button text, outline button, button hover, button text
  hover, border, sale price, regular price, form field, form field text, tooltip, tooltip text.
- Global tokens: image overlay colour + opacity, cart/wishlist count bubble colours, success/warning/error colours.
- Badges use schemes, so badge colours come from the palette.

### 5.2 Typography [L][D]

- Heading font and body font: **Shopify font picker** (library) **or custom font**: upload files to
  Content > Files and paste the URL in the theme setting as `link@weight` [D]; TTF, OTF, WOFF, WOFF2 accepted.
  Minimog then writes `@font-face { font-family: M-Heading-Font | M-Body-Font; font-weight: N; font-display: swap }`
  for each weight [L] and sets `--font-stack-header/body` and `--font-weight-header/body`.
- With a library font Minimog loads the chosen weight plus bold and italics for body; one weight (+ bolder/lighter
  tokens) for headings [L]. That is why references upload files: to get 400/500/600 cleanly.
- **Italic gap**: the custom-font field declares normal styles only. Inzinnergy's `<em>` accents are browser-faked
  italics. Fix: upload the real italic file and add one `@font-face { font-family: M-Heading-Font; font-style: italic; ... }`
  in the skin CSS (Custom Liquid or `custom.css.liquid`; the native Custom CSS field cannot do it because
  section CSS rejects `@font-face`, and theme-level support is unverified).
- Scale tokens [L]: base size 16, body line-height 26 px, H1-H6 sizes per breakpoint (Coldbrook: H1 64/44/38,
  H2 46/36/32, H3 32/25/22, H4 22/17/17, H5 18/16, H6 16/16 for desktop >= 1280 / tablet >= 768 / mobile), heading
  letter-spacing, heading weight, button font size and weight. Whether each value is an editor setting in 5.9 is
  unverified [K]; **6.0 adds a heading-size setting, a separate footer font, letter-spacing for product-card
  titles and the main menu** [D]. Uppercase headings need CSS (Coldbrook does it with one rule).

### 5.3 Buttons, inputs, radius, layout [L]

- Buttons: border radius (2 px Coldbrook, 30 px pill on Inzinnergy/Convenz), border width, letter spacing,
  uppercase toggle, font size/weight. Styles in markup: primary (solid), secondary (outline), white, link,
  plain, blank, small, large, text-with-icon.
- Inputs: radius and border width.
- Radius tokens: blocks, medium blocks, product card (`--blocks-radius`, `--medium-blocks-radius`, `--pcard-radius`).
- Layout: container width (1200-1320), fluid container width (1420-1520) + 60 px offset, section spacing per
  breakpoint (all three references set it to 0 and use per-section padding).
- **Section padding auto-scaling** [A]: laptop 0.8x, tablet 0.6x, mobile `min(value, 40px)`.

### 5.4 Product cards [L][A][D]

Styles 1-5, image ratio (1:1 on Coldbrook), second image on hover, quick view / quick add ("Select options"),
wishlist and compare buttons, vendor, type, reviews, inventory, short description, colour swatches, sale badge
(percentage or fixed amount), sold-out and pre-order tags, title line clamp (2), card radius. References add the
"boxed card" look (background, hairline border, radius, hover lift) with CSS.

### 5.5 Animations [L][D]

Theme settings > Animations: page transition (3.5+), loading spinner with optional logo (4.1+), scroll reveal
(fade in / fade in up / left / right / none); sections carry their own animation setting. Implementation:
`.m-scroll-trigger.animate--fade-in-up`, 600 ms, `cubic-bezier(0,0,.3,1)`, IntersectionObserver with -50 px
bottom margin, cascade stagger on cards. Image cards also offer hover scale up / scale down / zoom in.
Parallax, marquee duplication, scroll-progress and per-word reveals are **not** native: the references add
them with a small script.

### 5.6 Other global features [L][D]

Header designs, transparent header over the home hero, sticky header (on scroll up), mega menu; announcement
bar; cart drawer (needs AJAX add to cart) with discount-code and gift-wrap add-ons [L], order note [K] and
estimated shipping rates [D]; quick view; compare; wishlist; recently viewed; cookie banner; age verifier; colour-name to hex
map for swatches; mobile bottom nav.

---

## 6. Custom CSS and Custom Liquid: what is possible, and the limits

| Mechanism | Where | Limits | Good for |
|---|---|---|---|
| Section **Custom CSS** (Shopify native) | Each section's settings | **500 characters**; auto-scoped to that section; only `@media`, `@container`, `@layer`, `@supports`; cannot target the `.shopify-section` wrapper; URLs only from `cdn.shopify.com` [S] | Small per-section tweaks |
| Theme **Custom CSS** | Theme settings | **1,500 characters**; no `@import`/`@charset`/`@namespace`; `cdn.shopify.com` URLs only [S]. Minimog also has an "Advanced" CSS area [D]; Coldbrook/Convenz put small global rules in a head `<style data-shopify>` via one of these fields [L] | Global one-liners (uppercase headings, hide elements) |
| **Custom attributes** (Minimog) | Each section | Adds class/ID to the section [L][D] | Hook classes for the skin |
| **Custom Liquid section** | Any template; header/footer group if allowed [K] | **50 KB** per field [S]; no editor settings; full HTML/CSS/JS/Liquid (product, collections, metafields, settings) | Skin stylesheet, bespoke sections, SVG dividers, wordmark, motion script |
| **Custom Liquid block** | Main product, Collapsible tab content | 50 KB; renders inside the buy box | Icon rows, ingredient chips, routine upsell |
| Theme code | `assets/custom.css.liquid`, `snippets/custom-code-head/body.liquid`, new `sections/*.liquid` [D] | Needs Edit code access; FoxHome migrates custom.css.liquid on update [D] | Route B in section 1.4 |
| Files | Content > Files | Fonts, SVG textures, videos (hosted on cdn.shopify.com) | Anything referenced by CSS |

Recipes for bespoke touches (all proven on the references):
- **Wavy / torn / ridge dividers**: inline `<svg>` in a Custom Liquid section, or `::before/::after` on a
  hooked section with an SVG background. In the native Custom CSS field the SVG must be a `cdn.shopify.com`
  file URL; in Custom Liquid `<style>` a data-URI is fine.
- **Textured backgrounds** (paper grain, topo, linen): upload a tileable PNG/SVG to Files, apply on a hook class
  (`background-image` + `background-size`) or use a scheme gradient for soft washes.
- **Glass header over the hero**: Minimog's transparent header + `.m-header.transparent-on-top` CSS
  (`backdrop-filter`, pill radius).
- **Boxed product cards with blended packshots**: card background + border + radius, `mix-blend-mode: multiply`
  on images (do not combine with transforms on the image in Safari; scale the wrapper instead).
- **Custom badges**: theme badges are sale/new/hot/sold-out/pre-order via schemes; anything else ("Award
  winner", ingredient chips) needs Custom Liquid that reads product tags/metafields, or CSS restyling.
- **Eyebrows, numbered steps, pull quotes, marquee masks** (`mask-image` fades), **radial glows** behind
  packshots, **giant footer wordmark**: CSS in the skin plus a Custom Liquid section in the footer group.
- **Motion**: native reveal covers most needs; for stagger/marquee/parallax add a ~1 KB script in Custom Liquid,
  guarded by `prefers-reduced-motion` (as the references do).

---

## 7. Font shortlist for a premium beauty brand

How availability was checked: a family counts as **in Shopify's library** only if (a) Shopify's own docs list it
(Context7 copy of shopify.dev) or (b) its hashed Shopify font file (found in public `cdn.shopify.com` theme CSS)
is still served today by Shopify's font CDN (`/cdn/fonts/<family>/...` returns 200). Control test: the Monotype
families Shopify deprecated in 2024-25 (Avenir Next, Futura, Harmonia Sans, ITC Johnston, Twentieth Century)
now return **404**, while Google families return 200. Everything else is marked custom upload (all are Google
Fonts under OFL and confirmed on fonts.googleapis.com; woff2 files are easiest via npm `@fontsource/*`).

| Family | Role | Availability |
|---|---|---|
| Cormorant / Cormorant Garamond | Display serif, very high contrast, beautiful true italics | Cormorant: **Shopify library** (n4 served 200). Cormorant Garamond: **custom upload** (Inzinnergy uploads 400/500/600) |
| Playfair Display | Editorial Didone-ish display | **Shopify library** (served 200) |
| EB Garamond | Refined serif for subheads, quotes, italic accents | **Shopify library** (served 200) |
| Prata | Single-weight Didone display | **Shopify library** (served 200) |
| Ovo | Soft, gentle serif (single weight) | **Shopify library** (served 200) |
| Fraunces | Soft "wonky" serif with optical sizes: warm and characterful | **Custom upload** (no library evidence) |
| Bodoni Moda | Fashion Didone with optical sizes | **Custom upload** (no library evidence) |
| Instrument Serif | Condensed editorial serif, roman + italic | **Custom upload**; pairs with Instrument Sans |
| Gilda Display | Light, elegant display serif | **Custom upload** |
| Italiana | Hairline display, characterful | **Custom upload** |
| Marcellus | Flared, Trajan-like, spa feel | **Custom upload** |
| Jost | Geometric sans (Futura-like) for body/nav | **Shopify library** (served 200) |
| DM Sans | Clean low-contrast sans body | **Shopify library** (served 200) |
| Figtree | Friendly, open sans body | **Shopify library** (served 200) |
| Instrument Sans | Contemporary grotesk body | **Shopify library** (served 200) |
| Inter | Neutral UI sans | **Shopify library** (served 200) |
| Karla | Grotesk with character | **Shopify library** (served 200) |
| Tenor Sans | Elegant humanist sans for eyebrows/nav caps | **Shopify library** (served 200) |
| Hanken Grotesk | Refined grotesk body (used by two references) | **Custom upload** (library status unverified) |
| Manrope | Modern grotesk body | **Custom upload** (no library evidence) |

Also confirmed in the library but less suited: Montserrat, Raleway, Questrial, Cardo, Rasa, Open Sans, Assistant,
Source Sans Pro, Barlow / Barlow Condensed, Anton, Josefin Sans.

Strong pairings to test in the mockup: Cormorant (library) + Jost (library), zero uploads; Instrument Serif
(upload, with real italic) + Instrument Sans (library); Fraunces (upload) + DM Sans (library); Bodoni Moda
(upload) + Figtree (library).

---

## 8. Version deltas and things to verify in the editor

- **6.0.0** (27 May 2026) [D]: Store locator section + find-a-store template; new customer accounts support;
  evergreen countdown; heading-size setting; separate footer font; letter-spacing for product-card titles and
  main menu; Icon box block in Custom content; sold-out cards keep ATC enabled.
- **6.1.0** (6 Nov 2026) [D]: product-card settings inside Product recommendations (layout, image ratio,
  vendor); faster, steadier PDP on mobile.
- **5.9.0** (19 Jan 2026) [D]: fixed-amount sale badge on cards.
- Verify on the test store: theme version; exact labels of image cards / featured product / trust badge /
  product meta / countdown blocks; whether Custom Liquid can be added to the header group; the custom-font field
  format for several weights; whether H1-H6 sizes are editable; whether FoxKit may be installed.

---

## Appendix: evidence log

- Theme identity [L]: `Shopify.theme = {"schema_name":"Minimog - OS 2.0","schema_version":"5.9.0","theme_store_id":null}`
  on coldbrookoutfitters.com, convenz.com and inzinnergy.com.
- Section files confirmed (200) via `https://coldbrookoutfitters.com/?section_id=<id>` [R]:
  age-verifier-popup, apps, blog-posts, brands-list, breadcrumb, cart-drawer, collage-tabs, collapsible-tabs,
  collection-list, collection-page-header, collection-showcase, collection-tabs, contact-form, countdown-timer,
  custom-content, custom-liquid, featured-collection, featured-product-slider, footer, gallery, header,
  hotspots-image, icon-box, image-comparison, image-with-text, lookbook, main-account, main-product,
  mobile-sticky-bar, multiple-image-with-text, newsletter, press, product-bundles, product-recommendations,
  product-tabs, promotion-banner, promotion-countdown-timer, recent-viewed-products, rich-text,
  scrolling-promotion, slider, testimonials, video, video-hero; on a product URL: product-details-tabs,
  product-reviews. Non-Minimog extras on Coldbrook: bento, multicolumn. About 370 other candidate names
  returned 404.
- Reference custom files confirmed (200): sp-hero, sp-chrome-skin, sp-index-skin, sp-promise, sp-shop-scene,
  sp-activity-grid (Coldbrook); iz-hero, iz-bento, iz-chrome-skin, iz-words, iz-wordmark, iz-ritual, iz-band,
  iz-feature, iz-collection, iz-promise (Inzinnergy); cv-chrome-skin, cv-wordmark (Convenz).
- PDP block classes [A] from `product.css` and `component-product-inventory.css`: `main-product__block-` addons,
  badge, breadcrumb, buy_buttons, collapsible_tab, custom_liquid, price, rating, share-social, shipping, text,
  title, inventory_status; components m-product-trust-badge, -live-views, -custom-field, -meta, -tax, -type,
  -wishlist, -sale-progress; assets ask-question.js, compare-product.js, photoswipe.js, product-model.js.
- Docs [D] product-information TOC: Shipping information, Buy buttons, Short description, Rich text, Trust badge,
  Product meta, Collapsible tab, Countdown, Add-on buttons, Custom content, Custom liquid, Upload image field,
  Custom tags, Apps block, Inventory status; media layouts Standard / Grid 1 col / Grid 2 col / Grid mix /
  Slider 2 col / Slider vertical / Slider full-width.
- Shopify limits [S]: help.shopify.com "Adding custom CSS" (500 / 1,500 characters, allowed at-rules,
  cdn.shopify.com URLs); shopify.dev "Theme limits" (50 KB per `liquid` setting, 50 blocks per section).
- Raw captures (session scratch, may be cleared): HTML, split sections, probe logs and screenshots under
  `/tmp/claude-0/-home-user-Chester-Studio/c51c471c-f281-5048-b5b7-f7b60a856929/scratchpad/minimog/`.
