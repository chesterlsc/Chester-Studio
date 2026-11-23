# Lumora × Minimog: theme settings

Every theme-setting value for the duplicate theme, on one page. Labels follow Minimog 5.9 (6.x moves a few into
sub-groups; the values do not change). Where a setting is missing in your version, the skin (`lu-skin.liquid`)
already enforces the value, so skip it.

## 1. Global colours (Theme settings > Colors)

| Setting | Value |
|---|---|
| Image overlay colour / opacity | #35211F / 0 % (the skin draws the hero and closing scrims) |
| Cart and wishlist count bubble | background #A8473B, text #FBF6EF |
| Success / warning / error | Minimog defaults (functional colours, never decorative) |
| Default colour scheme | Travertine |

## 2. Colour schemes (create ten, named exactly)

Shopify colour pickers store opaque colours, so the 14 % / 24 % / 20 % hairlines are entered as their opaque
blend on each background (Border column). **Sale price carries the scheme's accent**: no product shows a sale
price, and lu-skin reads this slot for eyebrows and the italic accent word (Terracotta on Travertine and Linen;
Clay on Sand and the washes; Dusk italic on Rose wash and Honey; Honey on Terracotta, Clay and Dusk, used at 24 px
and up only). Gradient background: leave empty on every scheme.

| Scheme | Background | Background secondary | Text | Text secondary | Heading | Button | Button text | Outline button | Button hover | Button text hover | Border | Sale price (= accent) | Regular price | Form field | Form field text | Tooltip | Tooltip text |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Travertine (default)** | #F3E7DA | #FBF6EF | #35211F | #6E554C | #35211F | #A8473B | #FBF6EF | #35211F | #8E3F31 | #FBF6EF | #D8CBC0 | #A8473B | #35211F | #FBF6EF | #35211F | #35211F | #FBF6EF |
| **Linen** | #FBF6EF | #F3E7DA | #35211F | #6E554C | #35211F | #A8473B | #FBF6EF | #35211F | #8E3F31 | #FBF6EF | #DFD8D2 | #A8473B | #35211F | #F3E7DA | #35211F | #35211F | #FBF6EF |
| **Sand** | #E9D9C5 | #FBF6EF | #35211F | #6E554C | #35211F | #A8473B | #FBF6EF | #35211F | #8E3F31 | #FBF6EF | #BEAD9D | #8E3F31 | #35211F | #FBF6EF | #35211F | #35211F | #FBF6EF |
| **Honey wash** | #F5E1C1 | #FBF6EF | #35211F | #6E554C | #35211F | #A8473B | #FBF6EF | #35211F | #8E3F31 | #FBF6EF | #C7B39A | #8E3F31 | #35211F | #FBF6EF | #35211F | #35211F | #FBF6EF |
| **Honey** | #E8B566 | #F5E1C1 | #35211F | #35211F | #35211F | #A8473B | #FBF6EF | #35211F | #8E3F31 | #FBF6EF | #BD9155 | #35211F | #35211F | #FBF6EF | #35211F | #35211F | #FBF6EF |
| **Apricot wash** | #F4CDB2 | #FBF6EF | #35211F | #5E463E | #35211F | #A8473B | #FBF6EF | #35211F | #8E3F31 | #FBF6EF | #C6A48F | #8E3F31 | #35211F | #FBF6EF | #35211F | #35211F | #FBF6EF |
| **Rose wash** | #EDC3B1 | #FBF6EF | #35211F | #5E463E | #35211F | #A8473B | #FBF6EF | #35211F | #8E3F31 | #FBF6EF | #C19C8E | #35211F | #35211F | #FBF6EF | #35211F | #35211F | #FBF6EF |
| **Terracotta** | #A8473B | #8E3F31 | #FBF6EF | #FBF6EF | #FBF6EF | #FBF6EF | #35211F | #FBF6EF | #E8B566 | #35211F | #B96A5F | #E8B566 | #FBF6EF | #FBF6EF | #35211F | #FBF6EF | #35211F |
| **Clay** | #8E3F31 | #35211F | #FBF6EF | #E3D3C6 | #FBF6EF | #E8B566 | #35211F | #FBF6EF | #FBF6EF | #35211F | #A46457 | #E8B566 | #FBF6EF | #FBF6EF | #35211F | #FBF6EF | #35211F |
| **Dusk** | #35211F | #412E2B | #FBF6EF | #CDB8AA | #FBF6EF | #E8B566 | #35211F | #FBF6EF | #FBF6EF | #35211F | #5D4C49 | #E8B566 | #FBF6EF | #412E2B | #FBF6EF | #FBF6EF | #35211F |

| Scheme | Used by |
|---|---|
| Travertine (default) | Default, header, shelf, Every skin, PDP main, Pairs well with |
| Linen | Promise strip |
| Sand | Start here |
| Honey wash | Spare (Custom Liquid sections set their own) |
| Honey | Sensory marquee |
| Apricot wash | Formulator (home) |
| Rose wash | The slow hour, Formulator (PDP) |
| Terracotta | Early voices |
| Clay | FAQ (home and PDP) |
| Dusk | Announcement bar, footer |

Contrast (checked in the brand book): Dusk text 12.4:1 on Travertine, 14.1 on Linen, 10.9 on Sand, 11.8 on Honey
wash, 8.1 on Honey, 10.2 on Apricot wash, 9.4 on Rose wash; Linen 5.4:1 on Terracotta, 6.7 on Clay, 14.1 on Dusk;
secondary text ≥ 4.96:1 everywhere; Terracotta as text on Sand fails (4.19), hence Clay there.

## 3. Typography (Theme settings > Typography)

| Setting | Value |
|---|---|
| Heading font | Custom font. One line per weight: `<URL of Fraunces_72pt_SuperSoft-Light.woff2>@300` and `<URL of Fraunces_72pt_SuperSoft-Regular.woff2>@400` (see `fonts/README.md`) |
| Heading font weight | 300 |
| Heading letter spacing | 0 (the skin sets −0.03 em H1, −0.02 em H2/H3) |
| Body font | Figtree (Shopify font library), weight 400 |
| Base font size / line height | 16 px / 26 px |
| H1 desktop / tablet / mobile | 96 / 64 / 44 |
| H2 | 52 / 40 / 34 |
| H3 | 44 / 36 / 32 |
| H4 | 30 / 24 / 22 |
| H5 | 19 / 17 / 16 |
| H6 | 16 / 15 / 15 |
| Product card title (6.0+) | heading font, letter spacing 0 |
| Main menu letter spacing (6.0+) | 0.14 em (the skin sets it anyway) |
| Footer font (6.0+) | Body font |

The italic face (Fraunces 72pt SuperSoft Light Italic, WONK on) is declared by lu-skin as `M-Heading-Font`, style
italic, from `Fraunces_72pt_SuperSoft-LightItalic.woff2` in Files. Figtree 500 and 600 are loaded by lu-skin from
the same library font.

## 4. Buttons, inputs, radius, layout

| Setting | Value |
|---|---|
| Button border radius | maximum (pill; the skin sets 999 px) |
| Button border width | 1 px |
| Button font size / weight | 15 px / 600 |
| Button letter spacing | 0.3 px (0.02 em) |
| Button uppercase | off |
| Input border radius / width | maximum (pill) / 1 px |
| Blocks radius / Medium blocks radius / Product card radius | 14 / 14 / 14 px |
| Container width | 1326 px (or the nearest the slider allows) |
| Fluid container width | the smallest the slider allows (the skin pins it to 1296 px content + 72 px gutters at ≥ 1280) |
| Section spacing desktop / laptop / tablet / mobile | 0 / 0 / 0 / 0 (each section owns its padding) |
| Section padding (each native section) | 120 / 120 desktop (feature sections the same; the Custom Liquid ones carry their own) |

## 5. Product cards (Theme settings > Product card)

| Setting | Value |
|---|---|
| Card style | 1 |
| Image ratio | Portrait 4:5 |
| Show second image on hover | **Off** (see BUILD-GUIDE 1.6) |
| Quick add / Add to cart button | On |
| Quick view | On |
| Wishlist, Compare | Off, Off |
| Vendor, Product type | Off, Off |
| Rating, Short description, Inventory | Off, Off, Off |
| Colour swatches | On (Apricity) |
| Sale badge | Percentage (never triggered: no compare-at prices) |
| Title line clamp | 2 |

## 6. Animations

| Setting | Value |
|---|---|
| Page transition | Off |
| Loading spinner / logo | Off |
| Scroll reveal | Fade in up |
| Image hover effect (if global) | None (the skin's 1.04 zoom on cards) |

## 7. Colour swatches (Theme settings > Color swatches)

```
Low Sun: #D9875F
Clay: #B0533F
Dusk: #7E3B36
```

## 8. Header, announcement, cart, social, favicon

| Setting | Value |
|---|---|
| Header design | Logo left, menu centre |
| Header colour scheme | Travertine |
| Transparent header on home | On · text colour #35211F · logo: the normal dark wordmark |
| Sticky header | On scroll up |
| Logo | `lumora-wordmark.svg` · width 138 desktop, 108 mobile |
| Announcement | Scheme Dusk · text "Free US shipping over $65 · 30-day guarantee, even if opened" · no link · autoplay off |
| Cart type | Drawer |
| Free-shipping goal | On · $65 (FoxKit's free shipping goal is the alternative) |
| Cart note, gift wrap | Off, Off |
| Social media links | Empty |
| Favicon | `favicon-512.png` (Honey sun on Dusk) |
| Search | Products only |
| Cookie banner | Shopify default if the store needs one |
| Age verifier, newsletter pop-up | Off, Off |

## 9. Store settings outside the theme

| Where | Value |
|---|---|
| Settings > General > Currency formatting | `${{amount_no_decimals}}` (prices read "$54") |
| Settings > Shipping | US: Standard $6.00; Free on orders $65 and up |
| Settings > Policies | Refund, Privacy, Terms, Shipping from Shopify's templates |
| Online Store > Preferences | Title "Lumora Beauty \| Golden-hour skincare for every skin tone"; description "Glow-giving skincare and slow evening rituals, made for every skin tone. Six steps from late light to dusk. Warm, never orange. Lit, never glittery."; social image `lu-hero-desktop.jpg` |
| Discounts (automatic) | "The full sunset" $35 off The six, min 6 items, once per order; "The golden pair" $10 off Long Light + Haze, min 2 items, once per order; no combinations |
| Theme language (Edit default theme content) | "Add to cart" → "Add to bag"; free-shipping strings → "You're {{ amount }} from free shipping." / "Free shipping, unlocked." |
