# Custom Liquid snippets

Paste each file's whole content into a Minimog *Custom Liquid* section or block (the field takes up to 50 KB).
Every class and custom property is `lu-` prefixed; the only URLs are Shopify CDN files resolved by `file_url` /
`file_img_url` from **Content > Files** (names in BUILD-GUIDE 0.3) and the SVG namespace inside data-URI icons.
Every file was rendered with mock Shopify data (python-liquid) and screenshotted at 1440 and 390 before hand-off.

| File | Size | Where it goes | What it does |
|---|---|---|---|
| `lu-skin.liquid` | 41.2 KB | Header group, first section (Custom Liquid) | Site-wide: tokens, the true italic face + Figtree 500/600, one section-header anatomy, pill buttons with the Honey halo, the card system (step chip, card line, quick add), horizon arc on the promise strip, sun-dot footnotes, header/footer/cart drawer, `lu-s-*` schemes for Custom Liquid sections, reduced motion, small helpers (cart permalinks open the drawer, one H1, anchors, announcement dot) |
| `lu-skin-sections.liquid` | 12.4 KB | Header group, directly below lu-skin | Styles for hooked native sections: lu-hero, lu-start, lu-slow, lu-note, lu-skin-tones, lu-marquee, lu-voices, lu-faq |
| `lu-hero-pin.liquid` | 10.9 KB | Home, directly below the hero | Product pin on the bottle + the golden-hour clock (NOAA formula, time zone → city); moves itself into the hero |
| `lu-glow.liquid` | 4.7 KB | Home, after Every skin | What's in the glow: four ingredient cards and the statement row |
| `lu-proof.liquid` | 3.1 KB | Home, after What's in the glow | Proof, with the method: three stats, timeline, footnotes 2 and 3 |
| `lu-ritual-arc.liquid` | 11.8 KB | Home, after the marquee | The ritual: scene with six pins, sun-arc timeline, six steps, $197 set, add-all |
| `lu-closing.liquid` | 5.1 KB | Home and every product template, last but one (lu_mode home / pdp) | Closing band / guarantee band with the horizon arc into the footer |
| `lu-footnotes.liquid` | 2.3 KB | Last section of each template (lu_mode home / pdp) | Footnotes block for that page's markers + concept-store label |
| `lu-footer-wordmark.liquid` | 8.3 KB | Footer group, after the Footer | Setting-sun wordmark; moves itself above the copyright row; sinks 8 % |
| `lu-pdp-skin.liquid` | 26.2 KB | Every product template, first section | Icon sprite, buy-box layout, PDP shared styles, the Add to bag · price script |
| `lu-pdp-eyebrow.liquid` | 0.9 KB | Product information block, above Title | Step 02 · Glow with the sun mark (metafields) |
| `lu-pdp-rating.liquid` | 1.2 KB | Block, after the eyebrow | Sample rating 4.7 · 52 reviews · SAMPLE (Long Light only) |
| `lu-pdp-lexicon.liquid` | 0.7 KB | Block, below Price | Lexicon line (custom.lexicon) |
| `lu-pdp-benefits.liquid` | 1.5 KB | Block, below the lexicon | Three icon benefits + footnote 2 line (custom.benefit_1 to 3) |
| `lu-pdp-glance.liquid` | 1.3 KB | Block, below the benefits | At a glance rows (metafields) |
| `lu-pdp-delivery.liquid` | 3.8 KB | Block, below Buy buttons | Free-shipping line + calculated delivery dates |
| `lu-pdp-trust.liquid` | 1.3 KB | Block, below delivery | Compact promise strip + footnote 1 |
| `lu-pdp-pair.liquid` | 1.9 KB | Block, below trust | The golden pair card (Long Light and Haze) |
| `lu-pdp-accordions.liquid` | 2.4 KB | Block, below the pair card | Five accordions from metafields |
| `lu-pdp-help.liquid` | 0.5 KB | Block, last | Help line to the contact page |
| `lu-pdp-why-amber.liquid` | 5.3 KB | Long Light template section 2 | Why amber: image, copy, light-test chart (fn 3), two facts |
| `lu-pdp-decoded.liquid` | 9.1 KB | Section 3 | Ingredients, decoded |
| `lu-pdp-how-to.liquid` | 7.6 KB | Section 4 | How to use: three steps, morning/evening rows, layering notes |
| `lu-pdp-results.liquid` | 4.2 KB | Section 5 | Results, with the method |
| `lu-glow-check.liquid` | 5.8 KB | Section 6 | The glow check: Fitzpatrick I to VI swatches and scores |
| `lu-pdp-who.liquid` | 4.6 KB | Section 7 | Who it's for |
| `lu-pdp-complete.liquid` | 8.6 KB | Section 8 | Complete the ritual (full sunset $197) |
| `lu-pdp-reviews.liquid` | 13.2 KB | Section 11 | Sample reviews with working filters |

Settings inside the files (top of each, in `{%- liquid -%}` / `assign` lines): `lu_mode` (closing, footnotes),
`lu_set_price` (ritual, $197 in cents), pin positions `lu_px` / `lu_py` (ritual) and `lu_pin_x` / `lu_pin_y` (hero),
`lu_threshold` (free shipping, 6500 cents) and the product handles where a product is named. Prices, product
links and cart permalinks are read live from the products, so nothing needs a variant ID except the homepage
"Add to bag · $54" button in a native section (BUILD-GUIDE 4.5).
