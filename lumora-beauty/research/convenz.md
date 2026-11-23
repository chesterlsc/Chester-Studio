# convenz.com: reference teardown

Reference 2 of 3 for the Lumora Beauty trial (with coldbrookoutfitters.com and inzinnergy.com).
Captured 2026-11-23 at 1440 px desktop and 390 px mobile with Playwright, plus raw HTML, theme CSS/JS
and computed styles. Screenshots and downloads stay in the session scratchpad (see Appendix); none are
copied into this repo.

**How to use this doc:** sections 3.3, 6, 9 and 14 are the parts to design against. Section 1 explains
why the live homepage and PDP are *not* the benchmark.

---

## TL;DR

- **What it sells:** a short, curated range of travel-coffee gear: OutIn portable espresso machines
  (Nano, Mino), the Fino grinder, a white-label "3-in-1 portable espresso maker", plus a case, folding
  cup, bean canister and coffee stand. The FAQ says the range is widening into portable rechargeables
  (neck fan, steamer, heated lunch box). Palette: warm paper, espresso ink and a saffron accent.
- **Stack:** Minimog OS 2.0 **v5.9.0**. The theme is named "CONVENZ Coffee Revamp Sep 2026" and is an
  uploaded copy (`theme_store_id: null`). The polish does **not** come from stock Minimog. It comes from
  a **38 KB bespoke CSS library (`cv.css`, 15 custom section components plus shared primitives)**, a **2.7 KB motion script
  (`cv-motion.js`)** and a global "chrome skin" section that restyles every Minimog component.
- **Caveat:** on 2026-11-23 the store has **zero published products**. Every `/products/*` URL returns
  404, every collection is empty, and the homepage has shrunk to one text-only custom section with an
  empty hero column. **The PDP cannot be audited live.** The **About** and **FAQ** pages are the only
  live renders of the full design system, so they are what we benchmark against.
- **Why it feels premium (transferable):**
  - one disciplined token set;
  - huge display type at fluid `vw` sizes with tight leading;
  - one repeatable section-header anatomy (eyebrow, heading with one highlighted last word, lead, pill
    CTA with an arrow chip);
  - a paper background, ink "statement" bands and one hot accent;
  - soft long shadows and a single easing curve;
  - AI lifestyle imagery locked to one prop kit and one grade;
  - supplier packshots blended into cream cards;
  - staggered scroll reveals and scroll-progress effects;
  - a giant wordmark sign-off.
- **What's weak:**
  - two type systems collide (theme Custom CSS forces every `h1–h3` to Arial);
  - three different page gutters;
  - the cart drawer's opaque overlay hides the page;
  - the nav hover CSS is dead;
  - the saffron highlight word fails contrast (1.64:1);
  - there is no social proof anywhere;
  - a 404 sits behind every product link.

---

## 1. Site state on 2026-11-23 (read first)

| Check | Result |
|---|---|
| `/products.json` | `{"products":[]}` |
| `/products/<handle>` for all 6 handles referenced on the site (`nano-portable-espresso-machine-space-grey`, `outin-mino-…`, `outin-fino-…`, `universal-coffee-stand`, `3-in-1-portable-espresso-maker`, `vacuum-sealed-coffee-bean-canister`) | all **404** |
| `/products/<handle>.js` | 404 |
| Collections (`all`, `best-sellers`, `coffee-on-the-go`, …) | "Sorry, there are no products in this collection" |
| `/search?q=espresso`, `/search/suggest.json` | 0 results |
| Sitemap | No product sitemap. Pages, collections and blog only. |
| Markets | Single market (US/USD/en), no `hreflang` alternates, so the products are unpublished, not region-hidden. |
| WebSearch | No indexed convenz.com pages. The "3-in-1" maker is a generic white-label product sold widely. |

**Consequences:**

1. The live homepage is most likely a **fallback state**. Its section CSS still styles a hero product
   image, price, CTA button, a 4-card catalog grid, a demo video and a final CTA, and none of these
   render (see 3.2).
2. All nav and footer product links, the About page CTA ("Shop the espresso maker") and the bento tile
   lead to a 404.
3. The **PDP benchmark has to come from coldbrook and inzinnergy.** Section 5 records only what the
   theme CSS proves about convenz's PDP skin.

---

## 2. Theme and stack

| Item | Value |
|---|---|
| Theme | `Shopify.theme = {"name":"CONVENZ Coffee Revamp Sep 2026","id":163261546627,"schema_name":"Minimog - OS 2.0","schema_version":"5.9.0","theme_store_id":null,"role":"main"}` |
| Header group | `cv_chrome_skin` (custom), `annoucement` (Minimog announcement bar; the instance key is spelled this way), `header` (Minimog) |
| Footer group | `footer` (Minimog), `cv_wordmark` (custom), `mobile-sticky-bar` (Minimog) |
| Custom assets | `cv.css` (38.5 KB, 15 section components plus primitives), `cv-motion.js` (reveal, stagger, parallax, scroll-progress, marquee). `custom-style.css` is Minimog's stock utility file. `custom.css` is empty. |
| Global Custom CSS (theme settings) | `h1,h2,h3{font-family:Arial,Helvetica,sans-serif;text-transform:none;letter-spacing:-.025em}`, plus small Minimog tweaks (tag pills, icon-box borders, footer social). This line is the source of the Arial headings. |
| Minimog features in use | sticky header (`data-sticky="on_scroll_up"`), `logo-left-menu-center` header, dropdown menu, mobile sticky bar, cart drawer with coupon add-on, AJAX ATC, quick view, wishlist and compare scripts, predictive search, recently viewed (collections), back-to-top button, `m-scroll-trigger animate--fade-in-up` reveals |
| Apps / embeds | **FoxKit** (Minimog's companion app): `<foxkit-cart-countdown>` and `<foxkit-cart-goal>` in the cart drawer. **PagePilot AI Page Builder**: a dangling app embed that fails on every page (`Failed to render app block … pagepilot-ai-page-builder … does not exist`), probably left from AI-generated product pages. Shop Pay / accelerated checkout, Shopify UCP/agent discovery. **No reviews app, no bundles/upsell app, no popup app, no third-party wishlist.** |
| Settings of note | `pcard_image_ratio: 1/1`, `pcard_show_lowest_prices: true`, `enable_cart_drawer: true`, `discount_code_enable: true`, `use_ajax_atc: true`, cookie banner off. The product colour-swatch list is Minimog's default, untouched. |

---

## 3. Homepage (live)

### 3.0 Section inventory in page order

| # | Wrapper id (type after `__`) | Group | What it does | Layout / notable details |
|---|---|---|---|---|
| 1 | `sections--…__cv_chrome_skin` | header | Invisible "skin" section. It loads `cv.css` and `cv-motion.js` and injects `:root` tokens plus about 120 override rules for Minimog components (header, menu, buttons, cards, PDP, tabs, accordions, footer, drawer, collection). | This ships global CSS from a section in the header group, so it is on every page without editing `theme.liquid`. |
| 2 | `sections--…__annoucement` | header | Announcement bar: "OUTIN TRAVEL ESPRESSO · Shipping rates and delivery timing are calculated at checkout". | Static single message, whole bar links to the shipping policy. Ink background, 12.5 px / 500 / .14em uppercase cream. 40 px tall on desktop, **80 px (3 lines) on mobile**. |
| 3 | `sections--…__header` | header | Logo left, menu centre, icons right (search, account, cart). | 62 px plus 1 px hairline `#dcd1bf`. Logo PNG 175 px (130 px mobile, 140 px sticky). Sticky on scroll-up with a compact logo and no announcement bar. Dropdown on "Travel Espresso". |
| 4 | `template--…__convenz_coffee` | template | **The entire homepage body**: a single custom section with four internal blocks (3.1). | Own inline CSS scoped to an ID, using **Arial and Georgia**, not the theme fonts. Max-width 1320 px with 5 % padding (content edge ≈ 126 px). |
| 5 | `sections--…__footer` | footer | Brand blurb, Shop menu, Help menu, newsletter, payment icons, bottom menu. | Ink background. Newsletter heading Anton 36 px. Pill input and pill saffron button (button sits below the input). |
| 6 | `sections--…__cv_wordmark` | footer | Giant "CONVENZ" sign-off. | Anton at 21vw (302 px at 1440). It rises 24 % and fades from 15 % to 100 % opacity with scroll progress, over a saffron radial glow and a bottom fade. **Hidden on mobile.** It also supports a product image rising out of the word (unused here). |
| 7 | `sections--…__mobile-sticky-bar` | footer | Mobile bottom bar: home, collections, cart (saffron count bubble), search. | 60 px, fixed, cream background, hairline separators. Desktop hidden. |

### 3.1 `convenz_coffee` block by block (live)

1. **Hero (`.cv-hero`):** a 2-column grid, but **only the copy column renders**, so the right half
   (≈ 650 px) is empty.
   - Eyebrow "Coffee for hotel stays & road trips" (12 px / 700 / .13em uppercase ochre).
   - H1 "Your coffee / routine, *packed.*" at 84 px Arial 750, -.035em, with the last word in Georgia
     italic.
   - Lead at 18 px muted.
   - Delivery disclaimer at 13 px with an inline "Delivery details" link.
   - **No button, no image, no price.**
2. **Principles (`.cv-principles`):** three numbered columns (01 / 02 / 03) between top and bottom
   hairlines: "Start with the maker." / "Add what you need." / "Know before you go." H2s at 23 px with
   15 px body.
3. **About card (`.cv-about`):** an inset ink card (radius 8 px, padding 50 px). Eyebrow "Why CONVENZ",
   H2 "Fewer choices. / A clearer setup." at 52 px cream, a paragraph, and a text link
   "Questions about your setup? Get in touch ↗".
4. **FAQ (`.cv-faq`):** eyebrow "Before you choose", H2 "Good questions.", then 4 native `<details>`
   (max-width 850 px, hairline separators, a "+" that rotates 45° when open). The questions cover
   delivery, package contents, accessories and pre-sale help.

The live homepage is ≈ 2 620 px tall on desktop. It has **no imagery, no product, no social proof and no
primary CTA**. The mobile first view is all text.

### 3.2 Dormant blocks in the homepage CSS (likely hidden because products are unpublished)

The section's CSS also styles:

- `.cv-hero-image`: a square product image on `#eee4d3` with an 8 px radius and a 12 px figcaption;
- `.cv-product-name`, `.cv-variant`, `.cv-price` (23 px / 700) and `.cv-button`: a 52 px saffron button
  with 5 px radius, label and icon spaced apart;
- `.cv-catalog` + `.cv-grid`: a 4-column grid with 20 px gap. Each card has a 1 px border, 7 px radius,
  square `contain` image, 19 px title, price, and an underlined "CTA" text link;
- `.cv-demo`: video plus text, `1fr 1.3fr`;
- `.cv-final`: a centred closing CTA.

So the intended revamp homepage reads: hero with featured product and buy button, principles, 4-product
catalog, about card, demo video, FAQ, final CTA. It is short and "honest", but even at full strength it
is a much plainer system than `cv.css` below (5 px vs pill radii, Arial vs Anton).

### 3.3 The bespoke section library in `cv.css` (the real quality bar)

These components define the polished convenz the client most likely saw when choosing the reference.
Only `cv-ah`, `cv-mf`, `cv-bento`, `cv-cta` and `cv-wm` still render live (About and FAQ pages). The rest
are reconstructed from the stylesheet; a head comment about "cv-mosaic … three points … ~187px void"
confirms the mosaic shipped on a page before.

| Component | What it is | Signature details | Lumora build route (Minimog) |
|---|---|---|---|
| `cv-hero` | Split hero 44/56: copy left, full-bleed image right | Image masked with a left-to-right gradient so it melts into the paper. Saffron radial glow behind. A floating product (7 s ease bob). A **rotating circular text badge** (SVG textPath, 22 s spin) with a saffron core and icon. A scroll cue (1 px ochre line). On mobile the image moves above the copy at 118vw tall with a bottom fade. | Minimog *Slideshow / Image with text*, plus Custom CSS for the mask and glow. Badge via a *Custom Liquid* block (SVG). |
| `cv-strip` | Row of 5 product mini-cards overlapping the hero's bottom by **−96 px** | Numbered 01–05 in Anton ochre. Square images blended into the card with `multiply`. Price in ochre. A round chip that turns saffron and rotates −45° on hover. On mobile: a scroll-snap rail of 62vw cards. | *Featured collection* (carousel), plus negative margin in Custom CSS. |
| `cv-ticker` / `cv-marquee` | Ink marquee band | Anton 18 px uppercase with saffron icons and dot separators. Track duplicated in JS, 40 s linear, pauses on hover, edges masked with a gradient. | Minimog *Scrolling text / Marquee* section. |
| `cv-cats` | 4/8 split: heading left, three 4:5 category tiles right | Gradient shade on tiles, Anton caption plus sub-caption, chip arrow. Mobile: 72vw scroll-snap rail. | *Collection list* plus CSS. |
| `cv-xp` | "Exploded view" scroll story | Product centred. Parts fly in from offsets as scroll progress `--p` goes 0→1. An SVG **ribbon stroke draws itself**. Part tags fade in. A steps list with a progress line that fills saffron and 56 px icon nodes. | Custom Liquid only (heavy). Not needed for Lumora. |
| `cv-mosaic` | 12-col × 6-row asymmetric mosaic of 5 images, plus 3 icon points on a hairline | Exact `grid-column` / `grid-row` spans per cell. Mobile becomes 2 columns with two 16:10 feature cells. | *Image gallery / Lookbook* plus CSS. |
| `cv-band` | Full-bleed parallax image band | Directional ink scrim (left, right or centre). Content max 620 px. On mobile the content starts at 60vw over a bottom scrim. | *Image banner* plus CSS. |
| `cv-trio` | Scene image plus product cards (and a "kit" variant) | `cv-pcard` (anatomy in 5.3). The kit variant uses a 5/7 split, 2×2 cards and 5:4 images cropped to the bottom. | *Featured collection with banner* / *Shop the look*. |
| `cv-steps` | Alternating left/right timeline | Centre line that fills saffron with scroll progress. 96 px icon nodes ringed with a 10 px paper halo. Anton step titles at 26–38 px. | *Timeline* / *Multicolumn* plus CSS (static line). |
| `cv-gallery` | Horizontal marquee of 3:4 images | Every even item offset +28 px (stagger). Hover zoom 1.04. | *Scrolling images* plus CSS. |
| `cv-cta` | Closing CTA in three variants | **Plain:** paper → `#f3dba6` gradient with a saffron radial glow at the bottom. **Image:** a full-bleed photo with colour-mix fades top and bottom. **Ridge:** a 21:9 landscape overlapping the previous section by 90 px. | *Image with text overlay* / *Rich text* plus CSS. |
| `cv-ah` | About hero: copy plus layered image pair | 4:5 main image at 84 % width, plus a square inset (44 %) with a **6 px paper border** and a long soft shadow, offset to the bottom-left. Ochre caption line. | *Image with text* plus Custom CSS (inset via a second image block). |
| `cv-mf` | Manifesto band | Ink background, image at 40 % opacity with parallax under a veil. Sticky statement column. 88 × 2 px saffron rule. Three Anton-titled paragraphs on hairlines. | *Rich text* / *Image with text* in the dark scheme. |
| `cv-bento` | 12-col bento | Large / wide / tall / small cells. Image cells get a caption and chip. Text cells come in paper, ink or saffron fills with Phosphor icons. Hover lift −4 px. | *Bento grid / Promotion grid* if available, else Custom Liquid. |
| `cv-wm` | Footer wordmark | See 3.0 row 6. | Custom Liquid section in the footer group. |
| `cv-btn`, `cv-chip`, `cv-eyebrow`, `cv-h`, `cv-lead`, `cv-actions` | Primitives | See section 6. | Theme settings plus Custom CSS. |

Every component exposes section settings as CSS variables in a per-section `<style>` block (for
example `--cv-cta-bg`, `--cv-cta-scrim`, `--cv-ah-ratio`, `--cv-bento-row`), so the merchant tunes them
in the theme editor. Every component also re-inits on `shopify:section:load`, so it stays editor-safe.

---

## 4. Live bespoke pages (best evidence of the system)

### 4.1 About (`/pages/about-us`), 4 sections, ≈ 4 560 px

| # | Section (`template--…__`) | Content | Measured details |
|---|---|---|---|
| 1 | `about_hero` (`cv-ah`) | Eyebrow "About CONVENZ". H1 "CONVENIENCE BELONGS / **EVERYWHERE.**" (last word saffron). A ≈ 90-word story paragraph and an ochre caption line. Right: tailgate lifestyle shot (4:5) plus inset of the case on a bed. | H1 Anton 103.68 px (7.2vw), lh .92, ls .005em. Lead 16.56 px / 26.5 px muted, 445 px wide. Main image 478 × 597, inset 250 × 250 with a `0 30px 50px -30px rgba(42,27,20,.45)` shadow. Section padding ≈ 115 / 130 px. |
| 2 | `about_manifesto` (`cv-mf`) | Eyebrow "Why we started" (saffron). H2 "CONVENIENCE, / DONE **PROPERLY.**" with a saffron rule. Right: "What we make / How we choose / Where it goes" paragraphs, then a "Shop the range" button. | Ink background with a misty-road image at 40 % opacity and parallax 0.08. H2 74.88 px (5.2vw). Paragraph titles Anton 22 px. Text `#cdbfae` 16 / 26.4. Padding 158 px. |
| 3 | `about_bento` (`cv-bento`) | Eyebrow "The kit". H2 "ONE BAG, / EVERYTHING **SORTED.**" with a lead on the right (7/5 grid). Bento cells: a large flat-lay image ("The whole kit, one bag" plus chip), a paper cell ("Portable by design"), an ink cell ("Charges anywhere"), an image cell (canister by a window) and a saffron cell ("Made to be used"). | Rows 260 px, gap ≈ 22 px, radius 8 px, text-cell padding 28 px. Icons Phosphor Light, 34 px, ochre (saffron on ink, ink on saffron). Cell titles Anton 27.36 px. Cell text 14.5 px muted. |
| 4 | `about_cta` (`cv-cta`, plain) | Eyebrow "CONVENZ". H2 "COME ALONG / FOR THE **RIDE.**" (highlight in **ochre** here). Lead "Start with the espresso maker. Add what your days actually need." Buttons: ink "Shop the espresso maker" (saffron chip) and ghost "Browse everything" (ink chip). | Gradient `#f5efe4 → #f3dba6` with a saffron glow. H2 103.68 px. Buttons 52 px pills, padding `6px 6px 6px 24px`, chip 38 px. |

### 4.2 FAQ (`/pages/faqs`)

- **Minimog breadcrumb** (centred, 12 px uppercase).
- **Minimog `page-faqs` section** (`m-faqs-section`, custom class `cv-faq-page`): 8 `collapsible-tab`
  blocks, first one open. Questions are set in Anton 20 px. There is a chevron icon and hairlines; the
  answer text is muted 16 / 24.
- **`faq_cta`** (`cv-cta`): "GREAT COFFEE / BELONGS **EVERYWHERE.**" with the same lead and buttons as
  the About CTA.
- **The page has no `<h1>` or title**; it jumps from the breadcrumb straight into accordions.

---

## 5. PDP, product card and cart

### 5.1 What cannot be known

There is no live PDP. `https://convenz.com/products/nano-portable-espresso-machine-space-grey` (a nav
item, the brand's hero product) returns a 404 ("OOPS! PAGE NOT FOUND!" in uppercase Arial, saffron pill
"Go to Home"). Buy-box order, gallery layout, variant pickers, trust rows, tabs content, reviews and
sticky ATC behaviour **cannot be observed**. Do not cite convenz for PDP structure; use coldbrook and
inzinnergy. The PagePilot remnant suggests the old PDPs may have been AI page-builder layouts rather
than Minimog blocks.

### 5.2 PDP skin proven by the theme CSS (`cv_chrome_skin`)

Every item below is evidenced by a CSS rule, in the order a Minimog PDP renders them.

1. **Media gallery** (`.m-product-media`, slider slides, thumbnails): cream card background
   `#fbf7ef`, `isolation: isolate`, images with `mix-blend-mode: multiply`. This drops supplier
   white-background packshots onto the brand cream with no retouching.
2. **Title** (`.m-product__title`): uppercase. Because of the global Arial override it would render as
   uppercase Arial unless the title is not an h1–h3.
3. **Price** (`.m-product__price .m-price-item`): ochre `#8f5f1e`, Hanken 500.
4. **Add to cart** (`.m-product-form .m-add-to-cart`): pill. Saffron fill, ink text; hover
   `#d9962a`.
5. **Product tabs** (`.m-tabs__nav`, `.m-product-tabs__nav`): Anton 20 px uppercase, active tab with a
   saffron bottom border.
6. **Accordions** (`.m-collapsible`): Anton 20 px uppercase triggers, hairline `#dcd1bf` borders,
   muted content.
7. **AJAX ATC opens the cart drawer** (see 5.4), with Minimog's quantity popover.
8. **Breadcrumbs** (`.m-breadcrumb`): 12 px, .1em, uppercase.

### 5.3 Product card anatomy (two systems)

**Minimog card, as skinned (`.m-product-card`, used on collections and recommendations):**

- **Container:** cream `#fbf7ef` card, 1 px `#dcd1bf` border, radius 8 px, `overflow: hidden`.
- **Image:** 1:1 ratio (`pcard_image_ratio`), blended with `multiply`.
- **Hover:** card lifts −5 px with shadow `0 30px 44px -30px rgba(42,27,20,.4)` (0.5 s), and the
  *media wrapper* scales 1.03 (0.8 s). The image itself is never transformed: a code comment notes that
  Safari paints a white box when a blended image gets its own compositing layer.
- **Info:** padding `14px 16px 18px`. Name in Anton 17 px uppercase, clamped to 2 lines with a
  2.15em min-height so prices align. Price in Hanken 500 ochre, showing the lowest variant price.
- **Badges:** pill, 11 px, .1em uppercase. Hot/sale badges have a saffron fill with ink text; new
  badges have an ink fill with cream text.
- **Actions:** pill buttons. Wishlist, compare and quick view come from Minimog's own scripts.

**Bespoke `cv-pcard` (trio and kit sections):**

- 4:5 image on paper-deep, `object-fit: contain` with 4 % padding and multiply.
- Body under a hairline, padding `16px 18px 18px`.
- Ochre eyebrow (11 px, .16em), then an Anton 22 px title, then a 14 px muted note.
- Price row pushed to the bottom (`margin-top: auto`) with a struck-through compare price.
- Hover −6 px lift and 1.04 image scale.

### 5.4 Cart drawer and post-ATC

- Minimog drawer with **FoxKit cart countdown** and **FoxKit cart goal** (free-shipping progress) in the
  header.
- Coupon add-on, subtotal, a pill "Check out" button and a "View Cart" link.
- **Bug:** cv.css paints `.m-cart-drawer` (the full-screen wrapper, not just the panel) with opaque
  `--cv-paper`. When the drawer opens, the whole page disappears behind a flat cream sheet instead of a
  dimmed backdrop.
- The title "SHOPPING CART" renders in uppercase Arial.
- The empty state is a single line, "Your cart is currently empty.", with no CTA and no recommendations.

### 5.5 What this means for Lumora's PDP

Take these from convenz:

- packshots that sit on the brand tint;
- the accent-filled pill ATC;
- uppercase display-face tabs and accordion triggers;
- the cart goal.

Fix these:

- give the drawer a dimmed backdrop;
- design the empty cart state;
- add the conversion depth convenz never shows: rating summary near the title, benefit bullets,
  trust row, routine/bundle upsell, ingredients, how-to, results, objection FAQ, reviews, mobile sticky
  ATC.

---

## 6. Design tokens

### 6.1 Typography

| Role | Family | Size (desktop → mobile) | Weight | Case / tracking | Line-height |
|---|---|---|---|---|---|
| Display XL (`.cv-h--xl`: heroes, CTAs) | **Anton** | `clamp(52px, 7.2vw, 108px)`: **103.68 px** at 1440 → 50.7 px (13vw) | 400 | UPPERCASE, +.005em | **.92** |
| Display L (`.cv-h--l`) | Anton | `clamp(40px, 5.2vw, 76px)`: 74.88 → 40 px | 400 | UPPER, +.005em | .92 |
| Display M (`.cv-h--m`) | Anton | `clamp(32px, 3.6vw, 52px)`: 51.84 → 32 px | 400 | UPPER | .92 |
| Display S / card titles | Anton | 17–30 px (`clamp(22px,2vw,28px)` etc.) | 400 | UPPER, +.01em | 1–1.05 |
| Footer / menu headings | Anton | 16 px menus, 36 px newsletter (25 px mobile), 18 px mega-menu L1 | 400 | UPPER, +.04em | .95 |
| Eyebrow (`.cv-eyebrow`) | Hanken Grotesk | 12 px | 500 | UPPER, **.18em**; colour ochre (saffron on dark) | 18 px |
| Lead (`.cv-lead`) | Hanken Grotesk | `clamp(16px, 1.15vw, 18px)`: 16.56 px | 400 | none, max **56ch**, muted `#6f5f52` | 1.6 |
| Body | Hanken Grotesk | 16 px base | 400 | none | 26 px (1.625) |
| Small text (bento, cards, points) | Hanken Grotesk | 14–15 px | 400 | none | 1.5–1.55 |
| Nav | Hanken Grotesk | 14.5 px | 500 | +.04em | n/a |
| Announcement | Hanken Grotesk | 12.5 px | 500 | UPPER, .14em | n/a |
| Buttons | Hanken Grotesk | 15 px | 500 | sentence case, +.01–.02em | 1 |
| *Revamp homepage only* | Arial 750 / Georgia italic | 84 px H1, 52 px H2, 23 px H3 | 750 | sentence case, −.035em | 1.08 |

Minimog base scale (theme settings): H1 64/44/38, H2 46/36/32, H3 34/27/23, H4 24/19/19, H5 18/16,
H6 16/16 (desktop/tablet/mobile), base 16 / 26. The cv sections ignore this scale and use their own
`vw` clamps.

**Font loading:**

- **Anton** comes from the **Shopify font library** (`/cdn/fonts/anton/anton_n4.<hash>.woff2`,
  `<link rel="preload">`, 21 KB).
- **Hanken Grotesk** is a **custom upload** through Minimog's custom-font setting: `@font-face` named
  `M-Body-Font`, src `cdn.shopify.com/s/files/1/0747/7556/0323/files/HankenGrotesk-{400,500,600}.ttf`
  (3 × 25 KB TTF, not woff2, not preloaded).
- coldbrook uses the same Minimog mechanism (alias `M-Heading-Font`), so **both references use custom
  uploaded fonts**.

### 6.2 Colour

| Token | Hex | Use |
|---|---|---|
| `--cv-paper` | `#f5efe4` | Page background (scheme default), header |
| `--cv-paper-deep` | `#ede4d4` | Image placeholders, alt section scheme, chip background |
| `--cv-card` | `#fbf7ef` | Cards, PDP media, form fields |
| `--cv-hair` | `#dcd1bf` | Hairlines, card borders (homepage section uses `#d3c7b5`) |
| `--cv-text` | `#22170f` | Body text |
| `--cv-ink` | `#2a1b14` | Headings, footer, announcement, dark bands, ink buttons |
| `--cv-choc` | `#3a2519` | Dark secondary, form fields on dark |
| `--cv-muted` | `#6f5f52` | Leads, secondary text (5.3:1 on paper) |
| `--cv-cream` | `#f5eddf` | Text on dark |
| `--cv-saffron` | `#f0b33b` | Primary buttons, highlight word on dark, chips, badges, count bubbles, focus rings, glows |
| `--cv-saffron-deep` | `#d9962a` | Button hover |
| `--cv-ochre` | `#8f5f1e` | Eyebrows, prices, icons, highlight word on light CTA (4.8:1 on paper) |
| `--cv-hair-dark` | `#4a342a` | Borders on dark |
| On-dark muted | `#cdbfae` | Footer links, manifesto text |
| CTA gradient end | `#f3dba6` (`#f7e3b6` default) | Warm glow sections |

Contrast checks:

| Pair | Ratio | Verdict |
|---|---|---|
| Ink on saffron | 8.9:1 | Excellent |
| Cream on ink | 14.3:1 | Excellent |
| **Saffron text on paper** (the "EVERYWHERE." highlight) | **1.64:1** | Fails even large-text 3:1 |
| Ochre highlight on the CTA gradient | 4.05:1 | Their partial fix |

### 6.3 Spacing, grid, rhythm

**Containers: three different left edges.**

| Area | Container | Content left edge at 1440 |
|---|---|---|
| Header and footer | Minimog fluid container (1420 px, 65 px offset) | **65 px** |
| cv sections | `cv-wrap` (1320 px max, `padding-inline: clamp(16px,4vw,48px)`) | **108 px** |
| Revamp homepage section | 1320 px with 5 % padding | **≈ 126–132 px** |

Section padding comes from two tokens:

- **standard:** `clamp(64px, 8vw, 120px)` (115 px at 1440), used by mosaic, trio, steps and bento;
- **feature:** `clamp(80px, 11vw, 160px)` (158 px), used by manifesto and CTA.

Minimog section spacing is set to **0** on every breakpoint, so each section owns its padding.

**Header stack inside a section:**

| From → to | Gap |
|---|---|
| Eyebrow → heading | 14 px |
| Heading → lead | 18 px |
| Lead → actions | 30 px |
| Header block → content | 28–56 px (`clamp(28px,4vw,56px)`) |

**Grids:**

- Split ratios 44/56 (hero), 4/8 (cats, trio), 6/6 (about, manifesto), 7/5 (bento head), 5/7 (kit).
- 12-col bento with 260 px rows.
- Gaps `clamp(12px,1.6vw,22px)`.

### 6.4 Radius, shadow, motion

- **Radius:** one token for blocks, `--cv-radius: 8px` (cards, tiles, images, bento, about card).
  **999 px** for buttons, inputs, badges and filter pills. **50 %** for chips. Minimog's own radius
  settings are all 0; the skin applies 8 px.
- **Shadows:** long, soft and negative-spread, always ink-tinted.
  - Card hover: `0 30px 44px -30px rgba(42,27,20,.4)`.
  - Strip card at rest: `0 24px 40px -30px rgba(42,27,20,.35)`.
  - Inset image: `0 30px 50px -30px rgba(42,27,20,.45)`.
  - Button hover: `0 10px 24px -14px rgba(42,27,20,.45)`.
- **Easing:** one curve everywhere, `--cv-ease: cubic-bezier(.2,.7,.2,1)`.
- **Durations:** colour .25 s, button lift .35 s, card lift .5 s, media zoom .8–1.2 s.
- **Reveal:** `[data-cv-reveal]` children `.cv-r` fade in from `translateY(28px)` over .8 / .9 s,
  **staggered 90 ms**. Variants: `--scale` (20 px plus .96 scale), `--x` (−24 px), `--line` (scaleX
  from the left, for rules). IntersectionObserver threshold .12 with −6 % bottom margin.
- **Scroll-driven:** `data-cv-parallax="0.08"` on band and manifesto media. `data-cv-progress` sets
  `--p` 0→1 in three modes: `enter` (wordmark), `line` (timeline fills), default (exploded view).
- **Accessibility:** `prefers-reduced-motion` disables all of it and forces `--p: 1`.

### 6.5 Buttons and inputs

- **Primary `cv-btn`:** saffron pill, min-height 52 px, padding `6px 6px 6px 24px`, Hanken 15 / 500,
  with a **38 px ink "chip"** holding a Phosphor arrow. On hover: lift −2 px, shadow, and the arrow
  nudges 3 px right.
- **Variants:** `--ink` (ink fill, saffron chip), `--ghost` (1 px current-colour outline; hover fills
  ink and the chip turns saffron), `--cream`, `--text` (no fill; the chip slides 4 px).
- **Minimog `.m-button`:** pill, 500 weight, sentence case. Primary is saffron with ink text; hover
  `#d9962a`, lift −2 px.
- **Inputs:** pill (30 px radius), 46 px tall. Fill `#3a2519` on dark, `#fbf7ef` on light. Saffron
  focus border.
- **Focus-visible:** `2px solid saffron`, offset 3 px, on links, buttons and summary elements.

---

## 7. Header, announcement bar, menu, footer

- **Announcement:** one static, operational message (shipping is calculated at checkout); no
  rotation, no benefit. Desktop 40 px; on mobile it wraps to 3 lines (80 px) and pushes the hero down.
- **Header:**
  - Layout: `logo-left-menu-center`, cream background, 1 px hairline, 62 px.
  - Nav: Travel Espresso (dropdown), Nano, Fino Grinder, Mino, About, in Hanken 14.5 / 500 / .04em.
  - Icons: search (popup), account, cart (saffron bubble).
  - **Sticky on scroll-up:** announcement drops away, logo compacts 175 → 140 px, soft shadow.
  - The skin defines a saffron underline that scales in from the left on hover, but it targets
    `.m-menu__item--main`, which no menu `<li>` carries. **The hover effect never fires.**
- **Menu:**
  - Desktop: a 250 px dropdown with two Anton 18 px uppercase level-1 items ("By need ›",
    "Popular ›") that each open a flyout (Coffee on the go / Everyday carry / Power & heat;
    Best sellers / The espresso maker / All products). It is two hovers deep, with no imagery or
    featured product.
  - Mobile: a 350 px left drawer with nested levels, back buttons, and a "My Account" block with
    Log in and Register pills.
- **Footer (ink):**
  - 4 columns: (1) cream logo image (max 200 px) plus a one-sentence brand blurb; (2) Shop menu;
    (3) Help menu (about, contact, FAQ, 4 policies); (4) newsletter "COFFEE PLANS? STAY IN THE
    LOOP." in Anton 36 px with a one-line description, pill email field and saffron "Join the list"
    pill below it.
  - Bottom row: copyright left; 9 payment icons and a short policy menu right; a hairline above.
  - Then the **wordmark** section and a saffron back-to-top circle (46 px, bottom-right).
  - Link hover turns saffron.

---

## 8. Imagery

- **AI-generated.** I downloaded 4 of the 5 About images. Three of them (band, flat-lay, gallery) carry
  the IPTC XMP tag `DigitalSourceType = trainedAlgorithmicMedia`. The hero JPEG's metadata was
  stripped, but it is visually the same set. Filenames follow a system (`cv-about-hero`, `cv-about-detail`,
  `cv-about-band`, `cv-about-flatlay`, `cv-gallery-a…j`).
- **How consistency is achieved:**
  1. **One recurring prop kit**: black cylindrical maker with a green "0" LED, blush folding cup, blush
     canister with a black/yellow lid, black zip case. It appears in every scene, so the product reads
     as one line.
  2. **One grade**: overcast, soft daylight, warm neutrals (oatmeal knit, tan leather, light oak, cream
     linen) that echo the UI palette.
  3. **One subject logic**: "coffee away from home" scenes (tailgate in misty hills, hotel bed, window
     ledge over rooftops, packed duffel).
  4. A **mix of scales** within a section: wide lifestyle plus tight detail inset, flat-lay plus
     still-life.
  5. **Atmosphere images used as texture**: the misty road band runs at 40 % opacity under an ink veil.
- **Packshots:** supplier white-background cut-outs, never re-shot. They are visually unified by
  `mix-blend-mode: multiply` onto `#fbf7ef` (cards, PDP, cart thumbnails) and `object-fit: contain`
  with 4–8 % padding.
- **Weak spots:**
  - AI artifacts such as a **gibberish script "logo" on the canister**;
  - no real product branding anywhere (generic white-label look);
  - lifestyle and packshot worlds don't share a background.
- **For Lumora:** our Blender renders with a real Lumora label, plus graded Unsplash editorial, beat this
  on credibility. Copy the *discipline* (one prop kit, one grade, one subject logic), not the scenes.

---

## 9. Bespoke touches and how they are built

| Touch | Where | How it is built | Lumora equivalent within "Minimog + light CSS/Liquid" |
|---|---|---|---|
| Global component skin | All pages | A Liquid section in the header group outputs `<link cv.css>`, `<script cv-motion.js>` and a `<style>` block of tokens and overrides | **Theme settings → Custom CSS** (one curated skin, ≈ 150–250 lines) |
| Highlighted last word | All display headings | `<span class="cv-hl">` inside the heading; colour per section setting | Minimog headings accept inline HTML / `<em>`. Style `em` via Custom CSS. Use a contrast-safe accent. |
| Pill button with arrow chip | All CTAs | `cv-btn` + `cv-btn__chip` (Phosphor arrow-right, Light) | Custom CSS `::after` on `.m-button` (SVG mask), or Custom Liquid buttons |
| Layered image pair with paper border | About hero | Absolutely positioned inset, 6 px paper border, long shadow | *Image with text* plus a Custom CSS overlay, or a Custom Liquid block |
| Bento with coloured text cells and icons | About | Custom section, 12-col grid, Phosphor icons | Custom Liquid section (one) or Minimog *Bento* if present in the installed version |
| Manifesto band with parallax texture | About | Image at 40 % opacity, veil gradient, `data-cv-parallax` | *Image with text overlay* in the dark scheme with low image opacity (CSS) |
| Glow CTA | About, FAQ | Linear gradient plus a radial saffron glow (`:before`) | Section background gradient plus Custom CSS pseudo-element |
| Footer wordmark | All pages | Custom section, Anton 21vw, scroll-progress rise and fade, radial glow, bottom fade, hidden on mobile | Custom Liquid section in the footer group (static version needs no JS) |
| Rotating circular badge | (old) hero | SVG `textPath`, 22 s spin, saffron core | Custom Liquid SVG plus CSS `@keyframes` |
| Marquee / ticker | (old) | Duplicated track, mask gradient, pause on hover | Minimog *Scrolling text* section |
| Product strip overlapping hero | (old) | Negative top margin −96 px | Custom CSS on the featured collection section |
| Blended packshots | Cards, PDP, cart | `isolation: isolate` plus `mix-blend-mode: multiply`, scaling the wrapper not the image (Safari fix) | Same Custom CSS; or render products on the brand tint (our plan) |
| Scroll reveals with stagger | All cv sections | IntersectionObserver plus `--i` × 90 ms | Minimog's built-in `animate--fade-in-up` / "Reveal on scroll" setting, plus optional CSS stagger |
| Phosphor icon set (Light, filled paths, 256 viewBox) | Bento, points, nodes, buttons | Inline SVG | Upload SVGs to Files or inline in Custom Liquid; one family, one weight |

---

## 10. Mobile treatment

- **Header:** hamburger left, logo centred (130 px), search and cart right; 48 px tall. The account icon
  moves into the drawer.
- **Announcement:** wraps to 3 lines (80 px), which is too long.
- **Mobile sticky bottom bar:** home, collections, cart, search; 60 px, always visible.
- **Split sections stack.**
  - `cv-ah`: copy first, then the image pair (the inset keeps its overlap).
  - `cv-hero`: image first at 118vw height (max 640 px) with a bottom fade, badge shrunk to 96 px,
    scroll cue hidden.
  - Bands start their copy 60vw down over a bottom scrim.
- **Card rows become scroll-snap rails** rather than stacked grids: strip 62vw, cats 72vw, trio 74vw,
  with 16 px side padding and hidden scrollbars. The kit variant keeps a 2×2 grid and hides card notes.
- **Bento:** 2 columns. The large cell goes full-width at 16:10, small cells become squares, titles drop
  to 19 px.
- **Type:** display XL 46–64 px (13–13.5vw); manifesto 40 px; bento head 32 px. Body stays 16 px.
- **Footer:** Shop and Help collapse to accordions; the newsletter stays open (its heading runs into
  the chevron at 390 px). Payment icons wrap. **The wordmark is hidden.**
- **CTAs:** stacked, centred, full pill buttons.
- **Back-to-top:** shrinks to 40 px.

---

## 11. Copy tone and structure

- **Voice:** calm, practical, anti-hype, travel-specific. It sells *the routine*, not specs.
- **Headline formulas:**
  - **"[Thing], [payoff]."** with a comma pivot and the last word highlighted: "Your coffee routine,
    *packed.*" / "Convenience, done *properly.*" / "One bag, everything *sorted.*"
  - **Big claim, 3 words:** "Convenience belongs *everywhere.*" / "Great coffee belongs
    *everywhere.*"
  - **Two-beat contrast:** "Fewer choices. A clearer setup."
  - **Invitation:** "Come along for the *ride.*"
  - Always ≤ 6 words, period-terminated, 2 lines.
- **Eyebrows:** 2–4 words that frame the section's job: "About CONVENZ", "Why we started", "The kit",
  "Before you choose", "Why CONVENZ", "Coffee for hotel stays & road trips".
- **Proof lines:** an **"X, not Y"** formula: "Sized for a pocket, not a counter." / "Everyday tools,
  not gadgets for the drawer." / "Nothing here is a novelty."
- **Body:** concrete scenes and rules of three ("a train tray table, a hotel desk or the passenger
  seat"; "a case that fits, a cup that folds, a canister that keeps beans fresh"; "Is it truly
  portable? Would you use it every week? Is it good enough to keep?").
- **Structure devices:** numbered steps (01 / 02 / 03 "Start with the maker. / Add what you need. /
  Know before you go."); three titled paragraphs ("What we make / How we choose / Where it goes").
- **Microcopy:**
  - CTAs are verb-first and specific: "Shop the espresso maker", "Shop the range",
    "Browse everything", "Join the list".
  - Conversational asks: "Questions about your setup? Get in touch ↗", "Coffee plans? Stay in the
    loop."
  - Transparency notes: "Shipping cost and delivery timing are calculated at checkout."
- **Slips:**
  - "Don't pay for labor, pay for ethicality." is off-voice and unclear.
  - Both CTAs reuse the same lead and buttons.
  - The CTA eyebrow is just the brand name.
  - The announcement bar spends prime space on a disclaimer.
  - No outcome or proof language (no numbers, reviews or guarantees).

---

## 12. Weaknesses and what we would do better

| # | Weakness (evidence) | Lumora does better by |
|---|---|---|
| 1 | Live homepage is a product-less fallback: text-only hero with an empty right column, no CTA, no imagery (3.1) | Every product-dependent block has a designed fallback, and the hero always carries an image and a primary CTA |
| 2 | Two type systems: Custom CSS forces `h1–h3` to Arial site-wide, while the footer, About and FAQ use Anton. The 404, collection title and cart title end up as **uppercase Arial**. | Fonts set only in Minimog typography settings; no element-level `font-family` overrides; audit h1–h3 on every template incl. drawer and 404 |
| 3 | Body font uploaded as 3 TTFs, not preloaded | woff2 uploads; preload the display face; ≤ 4 font files |
| 4 | Three content edges (65 / 108 / ≈ 130 px) | One container and gutter token shared by header, sections and footer |
| 5 | Cart drawer wrapper painted opaque cream; Arial title; empty state with no CTA (5.4) | Tint only `.m-cart-drawer__inner`; dimmed backdrop; free-shipping goal; empty state with best sellers |
| 6 | Dead nav hover CSS (`.m-menu__item--main` never exists) | Test every hover and focus state in the browser before shipping |
| 7 | Saffron highlight on paper is 1.64:1 | Deep accent for text on light (≥ 3:1 at display size, ≥ 4.5:1 below 24 px); bright accent only as fill or on dark |
| 8 | Thin two-level dropdown, two hovers deep, no imagery | Mega menu with product thumbnails or one featured tile; ≤ 1 hover to any product |
| 9 | Mobile announcement wraps to 3 lines; newsletter heading collides with the chevron | Copy budgets: announcement ≤ 38 characters; footer headings ≤ 22 characters on mobile |
| 10 | No social proof anywhere: no reviews app, ratings, press or UGC | Star rating on cards and the PDP title, review section, testimonial or UGC row on the homepage |
| 11 | Every product link 404s (nav, footer, bento, About CTA) | Link check before handoff |
| 12 | AI imagery with gibberish labels and generic white-label products | Branded Blender renders with legible Lumora labels; graded editorial photos |
| 13 | Dangling PagePilot app embed fails on every page | Clean app embeds; no leftovers |
| 14 | FAQ page has no H1; FAQ CTA duplicates the About CTA copy | Every page has one H1; no copy reused verbatim across sections or pages |
| 15 | Copy slips ("pay for ethicality") and no outcome language | Sensory, specific, compliant beauty copy with footnoted (placeholder) proof points |

---

## 13. Borrow vs avoid (Lumora)

**Borrow (principles):**

- tokenised palette: paper, deep ink, one accent, one deep accent;
- fluid display type with tight leading;
- one section-header anatomy;
- the highlight-word device (contrast-safe);
- pill buttons with a secondary "chip";
- 8 px radius everywhere;
- ink-tinted long shadows;
- one easing curve;
- staggered reveals with reduced-motion support;
- packshots that sit on the brand tint;
- mobile rails instead of stacks;
- an oversized wordmark sign-off;
- section settings exposed as CSS variables.

**Avoid (their signatures; do not copy):**

- Anton all-caps headlines;
- the saffron-on-espresso palette;
- the circular arrow chip as *the* brand button;
- the giant footer word as an identical device;
- the rotating text badge;
- the tailgate / road-trip art direction.

Lumora needs its own signatures: its own display face, accent behaviour, icon family and sign-off
device.

---

## 14. Polish checklist (testable; apply to Lumora before anything ships)

1. **One heading face, set only in theme settings.** On home, PDP, cart drawer, search and 404, every
   `h1–h3` computed `font-family` is the brand display font. There are zero `h1,h2,h3{font-family…}`
   overrides in Custom CSS.
2. **Section headers share one anatomy:**
   - eyebrow: 12 px, 500, .16–.18em, uppercase, deep accent;
   - 14 px gap, then heading;
   - 18 px gap, then lead (max 56ch, muted);
   - 30 px gap, then actions.
   The same values hold in every section.
3. **Display sizes are fluid clamps:** hero ≈ `clamp(48px,7vw,104px)`, section ≈ `clamp(32px,3.6vw,52px)`,
   line-height .92–1.05, `text-wrap: balance`, never more than 3 lines at 1440 or 4 at 390.
4. **Highlight word rule:** at most one highlighted word per heading, always the last. It measures
   ≥ 3:1 against its background (check with a contrast tool; bright accent only on dark).
5. **One pill button system:**
   - radius 999 px; min-height 52 px desktop / 48 px mobile;
   - primary = accent fill; secondary = 1 px outline;
   - hover lift −2 px plus shadow;
   - `:focus-visible` 2 px accent ring, offset 3 px.
6. **One block radius token (8 px)** on cards, images, tiles, bento cells and drawers. Spot-check 10
   elements; all match.
7. **Product cards:**
   - identical image ratio and background colour across all 6 products;
   - packshots sit on the card tint (no white boxes);
   - titles clamp to 2 lines with reserved height, so prices and ratings align on one baseline.
8. **Card hover:**
   - lift −4 to −6 px;
   - shadow `0 30px 44px -30px rgba(ink,.4)`;
   - media scale 1.03–1.05 over ≥ 0.8 s;
   - one shared easing `cubic-bezier(.2,.7,.2,1)`.
9. **One container:** header logo, section content and footer columns share the same left edge at
   1440 px (≤ 1 px variance, measured).
10. **Two vertical-rhythm tokens only:** standard ≈ `clamp(64px,8vw,120px)` and feature
    ≈ `clamp(80px,11vw,160px)`. No unintended gap over 200 px between sections.
11. **Light/dark rhythm:** at least one full-bleed dark "statement" band on the homepage and one on the
    PDP; no two adjacent sections share the same background and layout.
12. **Scroll reveals:**
    - children fade up 20–28 px with a 60–90 ms stagger;
    - no layout shift (CLS < 0.05);
    - with `prefers-reduced-motion` everything is visible instantly.
13. **Imagery discipline:**
    - one colour grade across all lifestyle images;
    - the hero product appears in at least 3 scenes;
    - no illegible or AI-gibberish text;
    - every product label reads "Lumora".
14. **One icon family and weight** (for example Phosphor Light), one colour per background, consistent
    size (≈ 32–34 px in feature cells, 16 px in buttons).
15. **Header:**
    - sticky on scroll-up with a compact logo;
    - 1 px hairline;
    - nav hover and active states visibly fire (test in a browser);
    - cart count bubble in the accent colour.
16. **Announcement bar:** one benefit-led line that fits 390 px without wrapping (≤ 38 characters at
    12.5 px uppercase); optional rotation, ≤ 3 messages.
17. **Mega menu:** any product reachable in ≤ 1 hover, with at least one image tile (featured product or
    routine).
18. **Footer:**
    - brand blurb, 2 menus, newsletter with a value promise;
    - headings fit 390 px without touching the accordion icon;
    - payment icons and policy links;
    - a distinctive brand sign-off on desktop.
19. **Mobile layout:**
    - card rows are scroll-snap rails (≈ 70–75vw cards, 16 px gutters, next card peeking);
    - split sections put the image first when it carries the story;
    - tap targets ≥ 44 px.
20. **Mobile PDP:** a sticky add-to-cart bar appears once the main ATC scrolls out of view and never
    covers the sticky nav bar or chat.
21. **Cart drawer:**
    - dimmed (not opaque) page backdrop;
    - only the panel tinted;
    - free-shipping progress bar;
    - upsell slot;
    - empty state with a CTA and best sellers;
    - title in the brand font.
22. **No dead ends:** every CTA, nav, footer and card link returns 200 (crawl check). Product-dependent
    blocks have fallbacks. The 404 page is branded.
23. **Fonts and performance:** woff2 only, display face preloaded, ≤ 4 font files, LCP image eager with
    `fetchpriority="high"`, everything else lazy.
24. **Copy rules:**
    - headlines ≤ 6 words, period-terminated;
    - eyebrows 2–4 words naming the section's job;
    - at least one "X, not Y" proof line per page;
    - no sentence reused across sections;
    - cosmetics-compliant claims, with any statistic footnoted.

---

## Appendix: evidence (session scratchpad, not in repo)

Base: `/tmp/claude-0/-home-user-Chester-Studio/c51c471c-f281-5048-b5b7-f7b60a856929/scratchpad/research/`

- Homepage: `convenz_home_desktop.png` (+ `_01`–`_02`, `_overview`, `.styles.json`),
  `convenz_home_mobile.png` (+ chunks)
- PDP (404 state): `convenz_pdp_desktop.png`, `convenz_pdp_mobile.png` (+ chunks)
- About: `convenz_about_desktop.png` (+ `_01`–`_03`), `convenz_about_mobile.png` (+ `_01`–`_04`)
- FAQ: `convenz_faqs_desktop.png` (+ chunks)
- States: `convenz_probe/` (mega menu, nav hover, sticky scroll-up, wordmark at full progress, cart
  drawer, button hover, mobile first view, collection header; `convenz_probe.json` with `:root`
  variables, fonts, metrics)
- Raw HTML: `convenz_html/` (home, about, faqs, contact, impact, blog, collections, search, 404 PDPs,
  sitemaps, `products.json`)
- Theme assets: `convenz_assets/` (`cv.css`, `cv.pretty.css`, `cv-motion.js`, `custom-style.css`)
- Image provenance check: `convenz_imgs/` (4 About images, `contact_sheet.png`)
- Scripts: `../tools/convenz_probe.cjs`, `../tools/convenz_probe2.cjs`
