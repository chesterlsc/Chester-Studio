# Lumora Beauty × Minimog: build guide

> ## Read first: build the approved v2 (shortened, visual-first)
>
> After review, the client asked for shorter pages that let visuals lead. The approved targets are
> `mockup/index-short.html` and `mockup/product-long-light-serum-short.html` (images in
> `mockup/presentation/v2/`). This guide still describes v1 in full; build it with these changes:
>
> **Homepage**
> - **Keep:** hero, promise strip, the sunset shelf, the closing band, the footer and footnotes.
> - **Trim:**
>   - "Start here" becomes one sentence, the 3 ticks and the CTAs. The reassurance line and footnote go into the footer block.
>   - "What's in the glow" shows the 4 image tiles only, with no statement paragraph.
>   - The proof band shows the 3 numbers only, with the heading "Four weeks, in numbers.", standard padding and no timeline.
> - **Add** "Shop by moment" (Minimog image cards) after "Start here". Heading: "Two moments, one ritual."
>   - Morning card: `products/long-light-serum/long-light-serum-in-light.jpg`, title "First light, bottled.", step chips 01 02 03 04, link "Shop the morning ritual".
>   - Evening card: `renders/scenes/evening-4x5.jpg`, title "The slow hour.", step chips 01 02 03 05 06, link "Shop the evening ritual".
>   - Styles are in `mockup/css/home-short.css`.
> - **Skip:** the every-skin tiles, the slow-hour section, the formulator note, testimonials, the homepage FAQ and the proof timeline.
>
> **Product page (Long Light)**
> - **Keep:** the gallery and the buy box, without the "At a glance" rows. The 4 accordions hold the depth.
> - **Add** a row of 3 benefit tiles after the main product section: Amber glass (detail render), Vitamin C 10%, Sea buckthorn 2%. Styles are in `mockup/css/pdp-short.css`.
> - **Then keep:**
>   - results (the 3 numbers only);
>   - the glow-check swatches;
>   - the ritual bundle;
>   - the FAQ, cut to 5 questions;
>   - reviews: the summary plus 3, labelled as samples;
>   - "pairs well with";
>   - the footer.
> - **Skip:** why amber, ingredients decoded, who it's for, the formulator note, the guarantee band, the how-to section and the review filters.
>
> **Decided:** the step label is "Step 02 · Glow"; the 15 ml travel size is $29; the homepage stat is 90%; no apps are installed without the client's OK.


Build the homepage and the Long Light Serum product page in the client's Minimog test store, in this order, in
about five hours. Everything you paste is in this folder. The look to match is the approved mockups:
`mockup/delivered/homepage-v1/` (homepage) and `mockup/exports/lumora-pdp-*.jpg` (PDP). Section maps:
`mockup/SECTIONS.md` and `mockup/PDP-SECTIONS.md`. Where this guide differs from them, the reason is given
(appendix A).

| File or folder | What it is |
|---|---|
| `BUILD-GUIDE.md` | This guide: build order, every setting that matters, every block with its copy |
| `theme-settings.md` | Every theme setting value on one page (colour schemes with exact hex per field) |
| `custom-liquid/` | 28 ready-to-paste Custom Liquid files, all `lu-` scoped, each under 50 KB (README lists where each goes) |
| `fonts/` | Fraunces 72pt SuperSoft Light, Regular and Light Italic (WONK) as WOFF2, plus the upload README |
| `icons/` | The monoline icons for the promise strip and the marquee sun dot (SVG) |
| `media/` | Every image to upload to **Content > Files**, already named as the snippets expect |
| `products.csv`, `products.md` | The six products for **Products > Import**; image order, alt text and metafield values |
| `copy-deck.md` | All homepage and PDP copy in section order, ready to paste |
| `QA-checklist.md` | The pass/fail list for the live build (1440, 1280, 390, 360) |

**Time plan (about 5 hours):** setup and theme settings 60 min · products, metafields, collections, menus,
discounts 50 min · header, footer and homepage 100 min · PDP templates 70 min · QA at four widths 30 min.

Conventions in this guide: **Scheme** names refer to the ten colour schemes you create in step 1.3. **Hook** is
the class you type into the section's *Custom attributes* field (in some Minimog versions *Custom CSS class* or
*Section class*). `<em>word</em>` in a heading means: select the last word and press the italic (I) button, or
type the tags if the field has no toolbar (lu-skin turns escaped tags into a real italic either way).

---

## 0. Before you touch the theme (10 min)

**0.1 Check the theme version.** Online Store > Themes > Minimog > ⋯ > *Theme info*. The references run 5.9.0;
6.0 and 6.1 add a heading-size setting, a separate footer font and card-title letter spacing (nothing here
depends on them). Note the version in the Slack reply.

**0.2 Apps.** Nothing in this build needs an app. Ask the client before installing anything. Optional, each with the
fallback this kit already covers:

| Need | Optional app | Fallback in this kit |
|---|---|---|
| Bundles (golden pair $92, full sunset $197) | Shopify Bundles (free) or FoxKit Product bundles | Cart permalinks in `lu-pdp-pair`, `lu-pdp-complete`, `lu-ritual-arc` plus two automatic discounts (2.6) |
| Subscribe and save (PDP block 1.11) | Shopify Subscriptions (free) | Leave the block out; nothing else depends on it |
| Reviews | Judge.me | `lu-pdp-rating` + `lu-pdp-reviews` (static, labelled sample) |
| Complementary products | Search & Discovery (free, by Shopify) | Product recommendations' automatic related products |
| Free-shipping bar, bundles | FoxKit (needs the FoxKit Theme Helper app embed) | Minimog cart free-shipping bar (1.9) |

**0.3 Upload the files (Content > Files > Upload).** Keep the names exactly: the snippets look files up by name
with Shopify's `file_url` / `file_img_url` filters, so no URL is typed anywhere. If Shopify renames a file on
upload (a `_1` suffix because the name exists), delete the old one and upload again.

| Folder | Files |
|---|---|
| `build/fonts/` | `Fraunces_72pt_SuperSoft-Light.woff2`, `Fraunces_72pt_SuperSoft-Regular.woff2`, `Fraunces_72pt_SuperSoft-LightItalic.woff2` |
| `build/media/` | `leaf-light.png`, `lumora-sun-mark.svg`, `lu-hero-desktop.jpg`, `lu-hero-mobile.jpg`, `lu-golden-pair.jpg`, `lu-start-inset.jpg`, `lu-skin-1.jpg` to `lu-skin-4.jpg`, `lu-ingredient-vitamin-c.jpg`, `lu-ingredient-sea-buckthorn.jpg`, `lu-ingredient-apricot.jpg`, `lu-ingredient-ceramides.jpg`, `lu-ritual.jpg`, `lu-golden-milk.jpg`, `lu-slow-hour-packshot.jpg`, `lu-formulator.jpg`, `lu-closing.jpg`, `lu-why-amber.jpg`, `lumora-wordmark.svg`, `lumora-wordmark-linen.svg` (and the `@2x.png` versions if the logo picker refuses SVG), `favicon-512.png` |
| `build/icons/` | `lu-icon-ship.svg`, `lu-icon-guarantee.svg`, `lu-icon-drop.svg`, `lu-icon-tones.svg`, `lu-sun-dot.svg` |

The PDP gallery images (`long-light-serum-back-label.jpg` and the three `-0N-…-card.jpg`) go on the product, not
in Files (6.4).

**0.4 Decisions to settle with yourself before starting** (defaults chosen, see section 9): the Long Light step
name (Glow), the 15 ml price ($29), the homepage "91%" (round down to 90%?), bundles by discount or by bundle
product.

---

## 1. Theme: duplicate, name, settings (50 min)

**1.1 Duplicate.** Online Store > Themes > Minimog > ⋯ > *Duplicate*. Rename the copy **Lumora · Golden Hour ·
v1 (Chester Studio)**. Work only in the copy. Keep the original untouched as the rollback.

**1.2 Fonts first** (so every later screen previews in the right type). Follow `fonts/README.md`: upload the three
WOFF2 files (done in 0.3), then *Theme settings > Typography > Heading font*: custom font, one line per weight:

```
<URL of Fraunces_72pt_SuperSoft-Light.woff2>@300
<URL of Fraunces_72pt_SuperSoft-Regular.woff2>@400
```

Copy each URL from Content > Files (the link icon). Heading weight **300**. *Body font*: **Figtree** from the
Shopify library, weight 400 (lu-skin loads 500 and 600 from the same library font). Minimog cannot declare an
italic face; lu-skin does (`@font-face` for `M-Heading-Font`, italic, from your uploaded Light Italic file).

**1.3 Colour schemes.** Create ten schemes, named exactly as below, with the values in `theme-settings.md` §2
(every field, exact hex). The key idea: **Sale price carries each scheme's accent** (we never show sale prices,
and lu-skin colours eyebrows and italic accent words from it). Default scheme = **Travertine**.

| Scheme | Background | Text | Accent (Sale price slot) | Button / text / hover | Used by |
|---|---|---|---|---|---|
| Travertine | #F3E7DA | #35211F | #A8473B | #A8473B / #FBF6EF / #8E3F31 | Default, header, shelf, Every skin, PDP main, Pairs |
| Linen | #FBF6EF | #35211F | #A8473B | #A8473B / #FBF6EF / #8E3F31 | Promise strip |
| Sand | #E9D9C5 | #35211F | #8E3F31 | #A8473B / #FBF6EF / #8E3F31 | Start here |
| Honey wash | #F5E1C1 | #35211F | #8E3F31 | #A8473B / #FBF6EF / #8E3F31 | (Custom Liquid sections set it themselves) |
| Honey | #E8B566 | #35211F | #35211F | n/a | Sensory marquee |
| Apricot wash | #F4CDB2 | #35211F | #8E3F31 | #A8473B / #FBF6EF / #8E3F31 | Formulator (home) |
| Rose wash | #EDC3B1 | #35211F | #35211F (Dusk italic) | #A8473B / #FBF6EF / #8E3F31 | The slow hour, Formulator (PDP) |
| Terracotta | #A8473B | #FBF6EF | #E8B566 | #FBF6EF / #35211F / #E8B566 | Early voices |
| Clay | #8E3F31 | #FBF6EF | #E8B566 | #E8B566 / #35211F / #FBF6EF | FAQ |
| Dusk | #35211F | #FBF6EF | #E8B566 | #E8B566 / #35211F / #FBF6EF | Announcement, footer |

No two neighbouring sections share a scheme (the sunset scroll). The Custom Liquid sections carry their own
scheme class (`lu-s-*` in lu-skin), so their scheme setting, if they have one, does not matter.

**1.4 Everything else in Theme settings** (values in `theme-settings.md`): buttons (pill radius, border 1, font
15 / 600, letter spacing 0.3 px, no uppercase), inputs (pill, border 1), radius (blocks 14, medium blocks 14,
product card 14), layout (section spacing 0 at every breakpoint; container and fluid width as in the table; the
skin pins the content to 1296 px with 72 px gutters at 1440 so every section shares one left edge), product
cards (1.6), animations (scroll reveal *fade in up*, page transition off, loading spinner off), colour swatches
(Low Sun **#D9875F**, Clay **#B0533F**, Dusk **#7E3B36**), cart (1.9), favicon `favicon-512.png`, social links
empty (no dead icons). Theme *Custom CSS* field: leave empty.

**1.5 Store money format** (prices read "$54", not "$54.00", as in the mockups): Settings > General > Store
defaults > Currency display > *Change formatting*: `${{amount_no_decimals}}` for both "HTML without currency"
fields. Every price in the store is whole dollars. If you would rather not touch it, prices show ".00" and the
snippets still print "$54" (they use `money_without_trailing_zeros`).

**1.6 Product cards** (Theme settings > Product card): style 1 (the plainest), image ratio **portrait 4:5**
(lu-skin forces 4:5 anyway), **show second image on hover: off** (only Long Light has a second image, and it is a
wider scene; off keeps all six cards behaving the same: lift, 1.04 zoom, quick-add pill), quick add / add to cart
button **on**, quick view **on** (it is what quick add opens for Long Light and Apricity), wishlist **off**,
compare **off**, vendor **off**, product type **off**, rating **off**, short description **off**, inventory
**off**, colour swatches **on**, sold-out and sale badges as default (never triggered), title line clamp **2**.
lu-skin adds the step chip, the one-line descriptor (metafield `custom.card_line`), "Quick add · $54" and the
mobile "+" button.

**1.7 Typography sizes** (Theme settings > Typography, if your version shows them): base 16, line height 26;
H1 96 / 64 / 44, H2 52 / 40 / 34, H3 44 / 36 / 32, H4 30 / 24 / 22, H5 19 / 17 / 16, H6 16 / 15 / 15
(desktop / tablet / mobile); heading letter spacing 0. lu-skin enforces the section-header anatomy and the
hero and PDP title sizes regardless, so these only tidy Minimog's own small headings.

**1.8 Header and announcement colours**: header scheme Travertine; transparent header on the home page **on**,
with the *transparent header text colour* set to **#35211F** (the hero is light) and the normal (dark) logo;
cart count bubble **#A8473B** with **#FBF6EF** text (Theme settings > Colors, global).

**1.9 Cart**: cart type **drawer**; free-shipping goal **on**, threshold **$65** (if your version has it under
Cart; FoxKit's free shipping goal is the alternative); gift wrap off; cart note off; empty-cart text "Your bag is
empty. Start with Long Light, step 02." (edit in default theme content). lu-skin fills the progress bar with the
golden-hour gradient. Edit default theme content (Themes > ⋯ > *Edit default theme content*): search "Add to
cart" and change every product-form string to **Add to bag**; free-shipping strings to "You're {{ amount }} from
free shipping." and "Free shipping, unlocked."

---

## 2. Store setup (50 min)

**2.1 Product metafield definitions** (Settings > Custom data > Products > *Add definition*). Namespace and key
exactly as below. Create all 16 **before** importing the CSV.

| Name | Namespace and key | Type |
|---|---|---|
| Step number | `custom.step` | Single line text (two digits, "02") |
| Ritual step | `custom.ritual` | Single line text ("Glow") |
| Lexicon line | `custom.lexicon` | Single line text |
| Card line | `custom.card_line` | Single line text |
| Benefit 1, 2, 3 | `custom.benefit_1`, `custom.benefit_2`, `custom.benefit_3` | Single line text ("icon\|text") |
| Suited to | `custom.suited_to` | Single line text |
| Finish | `custom.finish` | Single line text |
| Scent | `custom.scent` | Single line text |
| Key ingredients | `custom.key_ingredients` | Single line text |
| Pairs with (handle) | `custom.pairs_with` | Single line text (a product handle) |
| What it does | `custom.what_it_does` | Multi-line text |
| Key ingredients (detail) | `custom.key_ingredients_detail` | Multi-line text |
| Full ingredients (INCI) | `custom.inci` | Multi-line text |
| How to use | `custom.how_to_use` | Multi-line text |

Plain text types on purpose: the CSV can fill them, and nobody has to build metaobjects in a trial
(PDP-SECTIONS' metaobject plan is the scalable version for a live store; appendix A).

**2.2 Import the products.** Products > Import > `products.csv` (overwrite on). Then upload images per product in
the order and with the alt text in `products.md` (Long Light: 8 images; the others: the packshot). Set each
product's Category in the admin (suggestions in `products.md`; the CSV leaves it blank because a mismatched
taxonomy path fails the row). Check that the metafields arrived (open Long Light > Metafields); if not, bulk
edit them from `products.md`. Inventory is untracked with "continue selling", so nothing ever says Sold out.
Long Light's variants are **30 ml first** (so it is the default and the button reads $54), then 15 ml travel.

**2.3 Collections.** *The six* (`the-six`): automated, tag equals `the-six`, sort **manually** 01 to 06.
*The slow hour* (`the-slow-hour`): automated, tag equals `slow-hour` (Gloaming, then Slow Hour).

**2.4 Navigation** (Content > Menus):

| Menu | Items (title → link) |
|---|---|
| Main menu | Shop → /collections/the-six · The ritual → /#ritual · Ingredients → /#ingredients · Slow hour → /#slow-hour · Our story → /#our-story |
| Footer: Shop | The six → /collections/the-six · The full sunset → /#ritual · The golden pair → /products/long-light-serum#pair · Gift the light → /#ritual |
| Footer: Help | Shipping → /policies/shipping-policy · Returns → /policies/refund-policy · The 30-day promise → /#promise · FAQ → /#faq · Contact us → /pages/contact |
| Footer: About | Our story → /#our-story · Ingredients → /products/long-light-serum#ingredients · How we cast → /#every-skin · Accessibility → /pages/accessibility |
| Footer: Policies | Privacy → /policies/privacy-policy · Terms → /policies/terms-of-service · Refunds → /policies/refund-policy · Accessibility → /pages/accessibility |

The anchors `#shop`, `#start-here`, `#every-skin`, `#slow-hour`, `#our-story`, `#voices` and `#faq` are added by
lu-skin to the hooked native sections; `#ritual`, `#ingredients`, `#proof` and `#promise` belong to the Custom
Liquid sections.

**2.5 Pages and policies (so no link is dead).** Settings > Policies: create Refund, Privacy, Terms and Shipping
from Shopify's templates (2 min). Online Store > Pages: **Contact** (template `page.contact`) and
**Accessibility** (copy in `copy-deck.md` §19). These are the only pages outside the brief, and they exist only
so footer and help links land somewhere real.

**2.6 Discounts (Discounts > Create > Amount off products, Automatic):**

| Title (shown in cart) | Value | Applies to | Minimum | Combinations |
|---|---|---|---|---|
| The full sunset | **$35.00 fixed, "Only apply discount once per order" on** | collection The six | quantity of items **6** | none |
| The golden pair | **$10.00 fixed, once per order** | products Long Light Serum + Haze Soft-Focus Cream | quantity of items **2** | none |

Shopify then applies the better one. Known gap (fine for a trial, say so if asked): six of any one product also
triggers the $35. The live-store answer is a Shopify Bundles fixed bundle (0.2).

**2.7 Shipping** (Settings > Shipping and delivery > General rates, US): Standard $6.00; Free shipping, condition
order price $65 and up. This is what the copy promises.

**2.8 Preferences** (Online Store > Preferences): homepage title **Lumora Beauty | Golden-hour skincare for every
skin tone**; meta description **Glow-giving skincare and slow evening rituals, made for every skin tone. Six steps
from late light to dusk. Warm, never orange. Lit, never glittery.**; social sharing image `lu-hero-desktop.jpg`
(or the 1200 x 630 crop of it). Password page: keep the store password and send the client the preview link plus
password.

---

## 3. Header group (20 min)

Theme editor, any page, left column: **Header group**.

**3.1 lu-skin** (first in the group). *Add section > Custom Liquid*, paste `custom-liquid/lu-skin.liquid`,
padding 0, drag it above the announcement bar. **3.2 lu-skin-sections** directly below it: paste
`custom-liquid/lu-skin-sections.liquid`. If the header group refuses Custom Liquid, put both as the first two
sections of the home template and of each product template instead (same result, one paste more per template).

**3.3 Announcement bar.** Scheme Dusk. One announcement, centred, no link:
`Free US shipping over $65 · 30-day guarantee, even if opened`
lu-skin swaps the middle dot for a Honey sun dot and, below 768 px, shows the 36-character line
`Ships free over $65 · 30-day returns` (brand book; the mockup shows "Free shipping over $65", which is 39
characters with the dot). Autoplay off, height about 40 px.

**3.4 Header.** Design **logo left, menu centre**; container fluid; logo `lumora-wordmark.svg`, width **138**
desktop / **108** mobile (alt "Lumora"); menu Main menu; sticky **on scroll up**; transparent on home **on**
(1.8); icons: search, account, cart (mobile: search, cart, menu; account hidden). **Mega menu** on *Shop*: add a
Mega menu block for the menu item "Shop"; content = the six products (product list or collection "The six", with
images) plus one banner (image `lu-ritual.jpg`, heading "The full sunset", text "All six steps · $197", link
/#ritual). If your version's mega menu has no product tiles, use two link columns (01 to 03 and 04 to 06) plus
the banner. lu-skin sets the nav in tracked caps with the Terracotta wipe-in underline and the hairline once
stuck.

---

## 4. Home page, section by section (100 min)

Template: Home page. Remove Minimog's demo sections first. Then add, in this order. Desktop padding is set in
each section's settings (standard **120 / 120**); lu-skin sets the phone padding (64) and pins the gutters.

### 4.1 Hero: *Image with text overlay* (`video-hero`) · hook `lu-hero` · scheme Travertine

| Setting | Value |
|---|---|
| Image (desktop) | `lu-hero-desktop.jpg` (1920 x 1080, 158 KB). Alt: "Long Light Serum on a travertine riser beside a jar of Haze Soft-Focus Cream, low sun from the left and olive-leaf shadows on a warm wall" |
| Image (mobile) | `lu-hero-mobile.jpg` (1168 x 1460). Alt: "Long Light Serum and Haze Soft-Focus Cream on travertine in low warm sun" |
| Height | Large or Adapt to image (the skin pins 744 px at 1440, 640 px on tablets, 4:5 under the copy on phones) |
| Overlay | Off (the skin draws the left Travertine scrim and the Honey glow) |
| Content position | Middle left · text alignment left · content stacked below on mobile **on** (the skin moves the copy above the image) |
| Text colour / content scheme | Dark (Dusk); if only white is offered, leave it, the skin forces Dusk |
| Subheading | `Golden-hour skincare` |
| Heading | `Late light, <em>bottled.</em>` (size: largest; the skin sets 96 / 64 / 44 px and makes it the page's only H1) |
| Text | `Glow-giving skincare and slow evening rituals, made for every skin tone. Warm, never orange. Lit, never glittery.` |
| Button 1 | `Shop the ritual` → `/collections/the-six` · style primary |
| Button 2 | `Find your first step` → `/#ritual` · style link |

### 4.2 Hero pin and golden-hour clock: *Custom Liquid* · padding 0

Paste `lu-hero-pin.liquid` **directly below the hero**. It moves itself into the hero: the glass pin card on the
bottle (desktop: x 67.5 %, y 56 %; "Start here · Step 02 / Long Light Serum / 10% vitamin C + sea buckthorn /
$54", live price and image) and the clock under the buttons ("Golden hour in New York today: **3:51 to 4:50 pm**";
NOAA solar formula, visitor time zone mapped to a city, no location prompt; checked against the brand's values for
New York, Chicago and Los Angeles on 23 Nov 2026). Hidden on phones (the pin), as in the mockup.

### 4.3 Promise strip: *Icon box* · hook `lu-promise` · scheme Linen

Four items, icon beside text, 4 per row desktop, **mobile: grid** (not slider; the skin forces 2 x 2), no
heading, padding top 0 / bottom 40. The skin draws the horizon arc (signature transition 1 of 2) rising 44 px
into the hero, with the Honey hairline.

| Icon (upload) | Heading | Text |
|---|---|---|
| `lu-icon-ship.svg` | `Free US shipping` | `on every order over $65` |
| `lu-icon-guarantee.svg` | `30 days to love it` | `even if the bottle is open` |
| `lu-icon-drop.svg` | `Fragrance-free` | `every skincare formula, no masking scent` |
| `lu-icon-tones.svg` | `Every skin tone` | `finish tested on Fitzpatrick I to VI¹` |

Type the superscript ¹ as the character (copy it from here); lu-skin turns ¹ ² ³ into the Honey sun-dot marker.

### 4.4 The sunset shelf: *Featured collection* · hook `lu-shelf` · scheme Travertine

Collection **The six**; 6 products; 3 per row, 2 rows; grid on desktop, **mobile: scroll** (the skin sets cards
to 64 % so the next one peeks); column gap 24, row gap 56, mobile gap 12; heading `Six steps, late light to
<em>dusk.</em>`, **no subheading** (product rails get a bare heading); view all: link `Shop all six` →
/collections/the-six, right-aligned; flash sale/countdown off. Padding 120 / 120.

### 4.5 Start here: Long Light: *Image with text* · hook `lu-start` · scheme Sand

| Setting | Value |
|---|---|
| Image | `lu-golden-pair.jpg` (1200 x 1500). Alt: "Long Light Serum beside a jar of Haze Soft-Focus Cream on a travertine plinth in late sun" |
| Second (layered) image | `lu-start-inset.jpg`. Alt: "Illustration: a golden drop of serum resting on warm skin, with a soft leaf shadow" |
| Layout | Image left, image width half, layered image on, floating animation off |
| Subheading | `Start here · Step 02` (the skin adds the step 02 sun mark) |
| Heading | `The serum that catches the <em>light.</em>` |
| Text (rich text, in this order) | Paragraph: `10% stable vitamin C and 2% sea buckthorn oil in a water-light serum. Skin looks warmer, more even and quietly lit by week four².` · Bulleted list: `More even-looking tone in 4 weeks²` / `Absorbs in seconds, layers under SPF` / `Amber glass keeps the vitamin C from the light` · Paragraph: `Opened is fine: you have 30 days to decide.` · Paragraph: `²Consumer perception study, 32 participants aged 24 to 58, 4 weeks of twice-daily use, self-assessed. Illustrative placeholder data.` |
| Button 1 | `Add to bag · $54` → `/cart/<variant id of Long Light 30 ml>:1` (find it on the product: Variants > 30 ml, the number at the end of the URL). lu-skin adds it in place and opens the cart drawer |
| Button 2 | `See the details` → `/products/long-light-serum` (style link) |

The skin turns the list into icon rows (even, absorb, amber) and moves the last two paragraphs under the buttons,
as the reassurance line and the footnote.

### 4.6 Every skin, in its best light: *Image cards* · hook `lu-skin-tones` · scheme Travertine

Subheading `Inclusive by design` · heading `Every skin, in its best <em>light.</em>` · description `Golden hour
flatters everyone. We test every finish on light to deep skin¹, so the glow reads warm, never ashy, orange or
glittery.` · 4 cards, layout with content **below** the image, mobile scroll, hover zoom off, each card's scheme
Travertine, no buttons:

| Image | Card heading | Card subheading | Alt |
|---|---|---|---|
| `lu-skin-1.jpg` | `7:12 am` | `Window light` | Illustration: a fair skin tone in low morning light, with a soft leaf shadow |
| `lu-skin-2.jpg` | `4:47 pm` | `Low sun` | Illustration: a light-medium skin tone in warm late-afternoon light, with leaf shadows |
| `lu-skin-3.jpg` | `5:31 pm` | `Leaf shadow` | Illustration: a medium-deep skin tone in raking golden light, with leaf shadows |
| `lu-skin-4.jpg` | `6:58 pm` | `Last light` | Illustration: a deep skin tone catching the last golden light, with a leaf shadow |

The skin adds the leaf-light texture (1 of 2, 6 % multiply, drifting 12 px over 14 s), the italic time captions
and footnote 1 under the cards.

### 4.7 What's in the glow: *Custom Liquid* · padding 0

Paste `lu-glow.liquid` (four ingredient cards with percentage tags and the statement row "No mica, glitter or
self-tan anywhere in the line… *not a coating.*", Linen). Native alternative if you prefer editor fields:
*Custom content* with four image blocks (25 % each) and four text blocks, then two text blocks (66 % / 33 %) for
the statement; it will not match the card anatomy as closely.

### 4.8 Proof, with the method: *Custom Liquid* · padding 0

Paste `lu-proof.liquid` (Honey wash; 93%², +38%³, 91%², the Day 1 / Week 2 / Week 4 line, footnotes 2 and 3
directly beneath, labelled illustrative placeholder data).

### 4.9 Sensory marquee: *Scrolling promotion* · hook `lu-marquee` · scheme Honey

Direction left, speed slow (duration 40 s or the slowest), pause on hover on, padding 30 / 30, container full.
Five *Announcement* blocks, each with icon `lu-sun-dot.svg` (icon size small) and text:
`Layers like silk` · `Golden hour, twice a day` · `Warm, <em>never orange</em>` · `Lit, <em>never glittery</em>` ·
`Fragrance-free`. Text size 44 (the skin sets 44 / 28 px Fraunces Light). One marquee per page; static under
reduced motion.

### 4.10 The ritual: sunset in six: *Custom Liquid* · padding 0

Paste `lu-ritual-arc.liquid`. Honey wash to Apricot wash; the line-up scene (`lu-ritual.jpg`) with six numbered
Honey pins linking to the products (three pins on the 4:5 phone crop), the Long Light popover open at rest, the
sun-arc timeline, the six steps with live prices, "$197 for all six, $232 bought separately · Save 15%", **Add the
full sunset · $197** (a cart permalink built from each product's first variant; the $35 comes off through the
automatic discount, 2.6) and "Start with one step" → /#shop. Why not the native *Product bundles* section: its
add-all button prints the undiscounted $232, and its list cannot take the six-column sun-arc layout or the phone
crop without heavy CSS on markup we cannot inspect (appendix A).

### 4.11 The slow hour: *Image with text* · hook `lu-slow` · scheme Rose wash

Image **right**, layered second image on. Image `lu-golden-milk.jpg` (alt "Illustration: a cup of golden milk seen
from above, on a rose-colored ground with a leaf shadow"); second image `lu-slow-hour-packshot.jpg` (alt "Slow
Hour Golden Milk canister"). Subheading `After sundown` · heading `The ritual doesn’t stop at <em>skin.</em>` ·
text: paragraph `Gloaming for warm shoulders after a bath. Slow Hour for the cup you take outside to watch the
light go.`, paragraph *gloaming* `(n.) the soft light after sunset. Also: your shoulders, after this oil.` (make
"gloaming" italic), paragraph `Slow Hour is a spice blend for warm drinks, sold as food, never as a supplement.` ·
button `Shop the slow hour` → /collections/the-slow-hour. The skin sets the lexicon line in Fraunces and moves the
last paragraph under the button with the drop icon. Accent words are Dusk italic (Clay fails on Rose wash).

### 4.12 A note from our formulator: *Image with text* · hook `lu-note` · scheme Apricot wash

Image **left**, no layered image, image `lu-formulator.jpg` (alt "Long Light Serum on a ledge in warm window
light"). Subheading `From our formulator` · heading `Made for my mother’s skin, <em>too.</em>` · text: paragraph
`“I wanted a glow that works on my skin and on my mother’s, which are not the same color. Golden hour does that
for everyone, so we built around it: actives that brighten, oils that catch the light the way skin does, no mica,
no tint. If a formula doesn’t earn its place on your shelf, send it back.”`, then paragraph *Mara* (italic)
`Head of formulation` (Shift+Enter) `Illustrative persona for this concept store`. No button. The skin adds leaf
light (2 of 2), the 24 px Fraunces note and the signature rule.

### 4.13 Early voices: *Testimonials* · hook `lu-voices` · scheme Terracotta

Layout: boxed cards (the grid layout, not the big slider), 4 per row, mobile swipe, no star ratings, no images,
autoplay off. Subheading `Sample tester notes` · heading `First impressions, <em>unhurried.</em>`. Four blocks
(text / author):

| Text | Author |
|---|---|
| `Glow that isn’t gray on me.` | `Ama · Deep skin, combination` |
| `Sinks in before my SPF does.` | `Priya · Medium skin, oily` |
| `The oil is the best part of my evening.` | `Lena · Light skin, dry` |
| `My 7 am face, looking like 7 pm.` | `Jo · Fair skin, sensitive` |

The skin bolds the name, adds the Honey quote mark and the disclosure "Testers received products free. Sample
content for this concept store, not customer reviews."

### 4.14 FAQ: *Collapsible tabs* · hook `lu-faq` · scheme Clay

One open at a time, first open, no image. Subheading `Good questions` · heading `Before your first golden
<em>hour.</em>` · description `Short answers to what people ask before they buy. Anything else, write to us and a
person replies within one working day.` plus a link `Write to us` → /pages/contact. Seven blocks (questions and
answers in `copy-deck.md` §14). The skin lays it out in two columns (heading 5/12, list 6/12), 72 px rows, Honey
toggle when open, and adds the footnotes for any marker used in an answer.

### 4.15 Closing band: *Custom Liquid* · padding 0

Paste `lu-closing.liquid` (`lu_mode` stays `'home'`): Dusk, the evening render (`lu-closing.jpg`), "The 30-day
promise / Stay for golden *hour.*", **Start with Long Light · $54** (cart permalink) and "Shop all six"; the
horizon arc into the footer (signature transition 2 of 2).

### 4.16 Footnotes block: *Custom Liquid* · padding 0

Paste `lu-footnotes.liquid` (`lu_mode` `'home'`) as the **last section of the home template** (PDP-SECTIONS 14
moved it out of the footer group so each page lists its own markers).

---

## 5. Footer group (15 min)

**5.1 Footer** (scheme Dusk, container fluid). Blocks, in order:

| Block | Content |
|---|---|
| Logo / text | Logo `lumora-wordmark-linen.svg` (width 150); text `Lumora makes glow-giving skincare and slow rituals for every skin tone: six steps, from late light to dusk.` |
| Menu | Title `Shop`, menu Footer: Shop |
| Menu | Title `Help`, menu Footer: Help |
| Menu | Title `About`, menu Footer: About |
| Newsletter | Title `The Low Sun Letter`; description: `One note a fortnight, sent at your golden <em>hour.</em>` (first paragraph) / `Ritual notes and first looks at new steps. Nothing louder than that.` / `One click to unsubscribe. We never share your address.`; placeholder `Email address`; button `Subscribe` |

Bottom: copyright `© 2026 Lumora Beauty. The hour of light.` ("Powered by Shopify" off; the skin hides it if the
setting is missing), policies menu Footer: Policies, payment icons **on** (shown once; the skin makes them
monochrome), country/language selectors off. Mobile: menus as accordions (Minimog default), newsletter first
(the skin). lu-skin styles titles in Honey caps, the newsletter as the 30 px Fraunces line with the italic accent,
the field on Dusk raised.

**5.2 lu-footer-wordmark** (Footer group > Add section > Custom Liquid, after the Footer): paste
`lu-footer-wordmark.liquid`. It moves itself above the copyright row: the giant gradient "lumora" behind a Honey
horizon line, sinking 8 % as the page ends (still under reduced motion).

**5.3** Hide the footer group's *Mobile sticky bar* (bottom nav) and *Age verifier*: not in the mockups.

---

## 6. The product page (70 min)

**6.1 Templates.** Online Store > Themes > Customize > Products > *Create template* **long-light** (based on
Default product). Build it fully (6.2 to 6.4), then assign Long Light Serum to it (Products > Long Light >
Theme template). The **Default product** template (the other five) gets: lu-pdp-skin, the Product information
section with the same blocks (6.2), then **The ritual** (`lu-ritual-arc.liquid`, the generic homepage version:
`lu-pdp-complete` names Long Light as "this product"), Pairs well with, the FAQ with the homepage questions, the
closing band with `lu_mode` **'home'** ("Use any Lumora formula for 30 days…") and the footnotes block with
`lu_mode` **'home'**. It contains no Long Light copy, so the other five PDPs are complete and never wrong: all of
their buy-box content comes from metafields; the sample rating shows on Long Light only and the golden pair card on
Long Light and Haze only.

**6.2 Product information (`main-product`)** · scheme Travertine · container fluid · padding 24 / 120.

Section settings: media width about 58 % (gallery 712 px, info 520 px at 1440); media layout **Grid 2 columns**
(desktop), mobile **slider with dots and counter**; image zoom on; show featured media first on; **sticky info
column on**; hide variant images that don't match off; **sticky add to cart: mobile only** (the sticky info column
does the job on desktop); dynamic checkout **off**; quantity selector **off**; pickup availability off; Shop Pay
installments off; "tax included" line off.

First, above Product information: *Add section > Custom Liquid*, padding 0, paste `lu-pdp-skin.liquid` (icon
sprite, buy-box layout, the Add to bag price script). Then the blocks, top to bottom:

| # | Block | Type | Settings / paste |
|---|---|---|---|
| 1 | Breadcrumb | `breadcrumb` | Home / The six / Long Light Serum (hidden on phones by the skin) |
| 2 | Custom Liquid | `custom_liquid` | `lu-pdp-eyebrow.liquid` → "Step 02 · Glow" with the sun mark |
| 3 | Custom Liquid | `custom_liquid` | `lu-pdp-rating.liquid` → ★ 4.7 · 52 reviews · SAMPLE (same row as the eyebrow). Remove if Judge.me's badge is used |
| 4 | Title | `title` | vendor off, product type off, wishlist off |
| 5 | Price | `price` | sits on the title's row, right-aligned (the skin); no compare-at, no installments |
| 6 | Custom Liquid | `custom_liquid` | `lu-pdp-lexicon.liquid` → *long light* (n.) the low, raking light of the last hour of sun. |
| 7 | Custom Liquid | `custom_liquid` | `lu-pdp-benefits.liquid` → three icon benefits + footnote 2 line |
| 8 | Custom Liquid | `custom_liquid` | `lu-pdp-glance.liquid` → Suited to · Finish · Scent · Key ingredients · Pairs with (moves below the trust row on phones) |
| 9 | Variant picker | `variant_picker` | picker type **Button**; option label shows the selected value; no preselection off (30 ml is the first variant) |
| 10 | (optional) Subscription app block | `@app` | Only with Shopify Subscriptions: one-time selected by default, "Subscribe, save 15% · $45.90 · Renews every 10 weeks, about one bottle. Skip or cancel anytime." 30 ml only |
| 11 | Buy buttons | `buy_buttons` | quantity off, dynamic checkout off; label reads **Add to bag · $54** (theme content + the skin script, which follows the size) |
| 12 | Custom Liquid | `custom_liquid` | `lu-pdp-delivery.liquid` → "Free US shipping over $65. Any second step gets you there." / "Order today, arrives Mon, Nov 30 – Wed, Dec 2" (computed, skips weekends and carrier holidays) |
| 13 | Custom Liquid | `custom_liquid` | `lu-pdp-trust.liquid` → the promise strip, compact, + footnote 1 |
| 14 | Custom Liquid | `custom_liquid` | `lu-pdp-pair.liquid` → The golden pair card, outline button "Add the golden pair · $92" (Long Light and Haze only) |
| 15 | Custom Liquid | `custom_liquid` | `lu-pdp-accordions.liquid` → What it does (open) · Key ingredients · Full ingredients (INCI) · How to use · Shipping and returns |
| 16 | Custom Liquid | `custom_liquid` | `lu-pdp-help.liquid` → "Not sure it's right for your skin? Ask us. A person replies within one working day." (or Minimog *Add-on buttons > Ask a question*) |

Native accordions instead of block 15: five *Collapsible tab* blocks, contents connected to the four multi-line
metafields with dynamic sources (the shipping one as static text). Use them if your version lets a rich text field
connect to a multi-line text metafield; otherwise keep the Custom Liquid block.

**6.3 Sections below Product information** (long-light template), in order:

| # | Section | Type | Scheme | Paste / settings |
|---|---|---|---|---|
| 2 | Why amber | Custom Liquid | Sand | `lu-pdp-why-amber.liquid` (image `lu-why-amber.jpg`; chart: amber 97 % vs clear 82 %, footnote 3; two facts) |
| 3 | Ingredients, decoded | Custom Liquid | Linen | `lu-pdp-decoded.liquid` (two actives with "why this %", the other thirteen in label order, "Formulated without, and why") |
| 4 | How to use | Custom Liquid | Travertine + leaf light | `lu-pdp-how-to.liquid` (Warm · Press · Layer, morning and evening rows with "your daily SPF", layering notes) |
| 5 | Results, with the method | Custom Liquid | Honey wash | `lu-pdp-results.liquid` (93 %, 87 %, 96 % with exact counts, footnote 2 under the stats, method panel, timeline) |
| 6 | The glow check | Custom Liquid | Linen | `lu-glow-check.liquid` (six swatch illustrations, scores per type, 58 of 60, footnote 1) |
| 7 | Who it's for | Custom Liquid | Sand | `lu-pdp-who.liquid` (chips, Made for · Maybe not for you if · Good to know) |
| 8 | Complete the ritual | Custom Liquid | Apricot wash | `lu-pdp-complete.liquid` (scene with 02 in Terracotta, checklist of six, $197, link to the golden pair) |
| 9 | From our formulator | *Image with text* · hook `lu-note` | Rose wash | Image left `lu-formulator.jpg` (alt "Long Light Serum on a ledge in warm window light"); subheading `From our formulator`; heading `Why we stopped at <em>ten.</em>`; text: the note and signature from `copy-deck.md` §16.9 |
| 10 | FAQ | *Collapsible tabs* · hook `lu-faq` | Clay | Subheading `Good questions`, heading `Before your first <em>drop.</em>`, description + `Write to us` link, nine blocks from `copy-deck.md` §16.10 (first open). Footnotes 1 and 2 are added under the list |
| 11 | Reviews | Custom Liquid | Linen | `lu-pdp-reviews.liquid` (summary, bars, mentions, working skin/tone filters, four sample reviews, disclosures). With Judge.me: its section instead, keep the labels |
| 12 | Pairs well with | *Product recommendations* | Travertine | Heading `Its place on the <em>shelf.</em>`, no subheading, 3 products, view-all link `Shop all six` → /collections/the-six if the section has one; cards come out in the homepage card system. In Search & Discovery set Long Light's complementary products to Sunmelt, Haze, Apricity |
| 13 | Guarantee band | Custom Liquid | Dusk | `lu-closing.liquid` with `lu_mode` set to `'pdp'`: "Thirty days, even if *opened.*", **Try it for 30 days · $54**, "How returns work" |
| 14 | Footnotes | Custom Liquid | Dusk | `lu-footnotes.liquid` with `lu_mode` `'pdp'` (footnote 3 is the stability test here) |

Every Custom Liquid section: padding 0, colour scheme anything (they set their own), no section heading.

**6.4 Product media (Long Light).** Eight images in this order, alt text in `products.md`: packshot · in light ·
detail · with Haze · back label (`build/media/long-light-serum-back-label.jpg`, the mockup's 1.6x crop) ·
ingredients card · results card · ritual card (`build/media/long-light-serum-0N-…-card.jpg`, the mockup's HTML
cards rendered at 1600 x 2000). The text on the cards is also live on the page.

**6.5 Sticky add to bag.** Mobile only (section setting). lu-pdp-skin gives it the glass Linen bar, hairline,
safe-area padding and the Terracotta pill; the script keeps its label "Add to bag · $54". It appears once the main
button scrolls away (`html.stick-atc-show`) and never stacks with the bottom nav (hidden in 5.3).

**6.6 Apps, if the client says yes.** Judge.me: import the reviews you want as sample content, place its widget where
section 11 is, keep "Sample" labels, restyle stars to Dusk (no yellow). FoxKit bundles: add its Product bundles
block under the trust row instead of `lu-pdp-pair` and delete the two automatic discounts. Shopify Bundles: create
"The golden pair" ($92) and "The full sunset" ($197) fixed bundles, point the two buttons at them, delete the
automatic discounts.

---

## 7. The six products (summary)

| # | Product | Handle | Price | Variants | Images | Template |
|---|---|---|---|---|---|---|
| 01 | Sunmelt Cleansing Balm | `sunmelt-cleansing-balm` | $32 | single (100 ml) | packshot | Default |
| 02 | Long Light Serum | `long-light-serum` | $54 / $29 | Size: 30 ml, 15 ml travel | 8 (6.4) | **long-light** |
| 03 | Haze Soft-Focus Cream | `haze-soft-focus-cream` | $48 | single (50 ml) | packshot | Default |
| 04 | Apricity Lip + Cheek Balm | `apricity-lip-cheek-balm` | $24 | Shade: Clay, Low Sun, Dusk | packshot (assign to Clay) | Default |
| 05 | Gloaming Body Oil | `gloaming-body-oil` | $46 | single (100 ml) | packshot | Default |
| 06 | Slow Hour Golden Milk | `slow-hour-golden-milk` | $28 | single (120 g) | packshot | Default |

Tags, SKUs, SEO titles and descriptions, weights and all metafield values are in `products.csv` /
`products.md`. Slow Hour is tagged `food`: the trust row drops "Fragrance-free" and "Every skin tone" for it, and
the INCI row reads "Ingredients and allergens".

---

## 8. QA and hand-off (30 min)

Work through `QA-checklist.md` at 1440, 1280, 390 and 360 (Chrome device toolbar), on the home page, Long Light
and one default-template product (Haze). Then: Online Store > Themes > the duplicate > *Preview* > share preview
link; send it with the store password and the time it took (the brief asks for both). Do not publish over the
client's live theme unless the client asks.

---

## 9. Decisions for Chester

> **Resolved:** step name is "Step 02 · Glow" everywhere; 15 ml travel is $29; the homepage proof stat is 90%; card hover images stay off; bundles use the two automatic discounts unless the client approves Shopify Bundles or FoxKit; no apps are installed without the client's OK.


1. **Step name "Glow" or "Treat".** The PDP mockup export shows "Step 02 · Treat" (brief and brand book); the
   homepage ritual list says "Glow", and "treats" is on the never-say list. The kit uses **Glow** (metafield
   `custom.ritual`); switching is one field.
2. **15 ml travel price.** Not set in the brand book; the PDP mockup shows $24 and recommends $29. The CSV uses
   **$29** ($1.93/ml, so the 30 ml stays better value). Or delete the variant.
3. **Homepage "91%".** With 32 people, 91 % is not reachable (29 of 32 is 90.6 %); the round-down rule says
   **90%**. The kit keeps the approved 91 % (one edit in `lu-proof.liquid`).
4. **Bundles by discount or by bundle product** (2.6 vs 6.6). The kit uses automatic discounts: no app, six
   products only.
5. **Card hover image** off for all six (1.6). Turn it on when every product has a same-crop low-sun render.
6. **Apps**: none needed; ask the client before Judge.me, Shopify Subscriptions or FoxKit.
7. **Two extra pages** (Contact, Accessibility) and the four policy pages exist only so links are not dead.

---

## Appendix A. Where the build differs from the section maps, and why

| Map says | Build does | Why |
|---|---|---|
| SECTIONS 10: Product bundles section with a Custom Liquid arc block | One Custom Liquid section (`lu-ritual-arc`) | The native add-all prints the undiscounted total; its list can't take the six-column arc layout or the phone crop; pins and prices stay live through Liquid |
| SECTIONS 7: Custom content | Custom Liquid (`lu-glow`), native alternative noted | Card anatomy (name + % tag + line) and the statement row need fixed markup |
| SECTIONS 15: footnotes block in the footer group | Last template section per page | PDP-SECTIONS 14: each page lists its own markers (footnote 3 differs) |
| SECTIONS 1: mobile announcement "Free shipping over $65 · 30-day returns" | "Ships free over $65 · 30-day returns" | brand.json (locked): 36 characters, the 38 limit |
| SECTIONS 5: inset photo of serum on skin | Illustration `lu-start-inset.jpg` | No stock photography; same for the four skin cards, golden milk and formulator |
| PDP-SECTIONS metafields: metaobjects (`benefits`, `ingredients`), integers, rich text, JSON | 16 plain text fields; decoded, results, glow check and who-it's-for as static Custom Liquid on the Long Light template | CSV-importable, no metaobject set-up in a trial; only the Long Light template shows those modules. The metaobject plan is the live-store upgrade |
| PDP-SECTIONS 1.13 / 1.14: separate free-shipping block and native Shipping block | One block (`lu-pdp-delivery`) | Minimog's shipping block can't skip carrier holidays; the copy and the dates match the mockup |
| PDP-SECTIONS 1.17: five native collapsible tabs with rich text metafields | One Custom Liquid block reading multi-line metafields | Works on every version without dynamic-source type limits; native route kept as an option |
| PDP-SECTIONS 10: FAQPage JSON-LD | Left out | Google limited FAQ rich results to government and health sites in 2023, so it would add markup for nothing |
| PDP-SECTIONS 11: "Write a review" and "Show more reviews" buttons | Left out; filter chips work | Nothing sits behind them in a trial, and a dead button reads as broken |
| Homepage mockup closing alt (glass sphere) | Alt describes the final render (Gloaming and Slow Hour) | The render changed |
