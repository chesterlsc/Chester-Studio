# Lumora: the six products (images, alt text, metafields)

Companion to `products.csv`. The CSV creates the products, variants, prices, SEO and (if the definitions exist first)
the metafields. Images are uploaded by hand from `lumora-beauty/products/<handle>/` in the order below, because the
importer can only fetch images from public URLs and ours are local. File status was checked when this sheet was written;
re-run a quick `ls lumora-beauty/products/*/` before the build.

## Before you import

1. Create the 16 product metafield definitions in **Settings > Custom data > Products** (namespace `custom`, exact keys in
   BUILD-GUIDE section 2.3). The CSV columns are named `Name (product.metafields.custom.key)`, Shopify's own export format.
2. **Products > Import**, choose `products.csv`, leave "Overwrite products with matching handles" on, publish to the Online Store.
3. If the metafield columns are ignored (definition missing or named differently), open **Products**, select all six,
   **Bulk edit**, add the 16 metafield columns, and paste the values from the tables below.
4. **Product Category is deliberately blank** in the CSV: the importer rejects any category path that does not match
   Shopify's current taxonomy exactly, and one bad cell fails the row. Set it per product in the admin (search box
   under Category, about ten seconds each); suggestions are below.
5. Inventory: not tracked (Variant Inventory Tracker empty) and policy `continue`, so nothing ever shows Sold out.
   Weights are realistic so shipping rates work.

## 01 · Sunmelt Cleansing Balm

| Field | Value |
|---|---|
| Handle | `sunmelt-cleansing-balm` |
| Type | Cleansing balm |
| Price | single size: $32 |
| Option | none (Default Title) |
| SKU | `LUM-01-SUNMELT-100` |
| Tags | `the-six, step-01, cleanse, skincare, fragrance-free, vegan-formula` |
| Category (set in admin) | Facial cleansers |
| Template | `product (default)` |
| SEO title | Sunmelt Cleansing Balm, balm-to-milk cleanser | Lumora Beauty |
| SEO description | A fragrance-free balm-to-milk cleanser with 18% apricot kernel oil and oat lipids. Lifts SPF, makeup and the day without the tight feeling. 100 ml, $32. |

**Images, in this order** (from `lumora-beauty/products/sunmelt-cleansing-balm/` unless noted):

| # | File | Alt text | Status |
|---|---|---|---|
| 1 | `sunmelt-cleansing-balm-packshot.jpg` | Sunmelt Cleansing Balm, a sand-colored tube standing on its cap, on a sand backdrop | ready (1200 x 1500) |

One image only for now: no low-sun hover render exists for this product, so the card simply zooms on hover.

**Metafields** (`custom.*`):

| Key | Value |
|---|---|
| `step` | 01 |
| `ritual` | Cleanse |
| `lexicon` | sunmelt (n.) a balm that melts like butter left in the sun |
| `card_line` | Balm-to-milk cleanser · 100 ml |
| `benefit_1` | drop|Melts from balm to milk with a splash of water |
| `benefit_2` | sun|Lifts SPF, makeup and the day in one step |
| `benefit_3` | absorb|Leaves skin soft, never tight |
| `suited_to` | Every skin type, including dry-feeling skin |
| `finish` | Clean and soft, never tight |
| `scent` | Fragrance-free |
| `key_ingredients` | 18% apricot kernel oil, oat lipids |
| `pairs_with` | long-light-serum |
| `what_it_does` | A balm-to-milk cleanser with 18% apricot kernel oil and oat lipids. It melts like butter left in the sun, then turns to milk with a little water and lifts SPF, makeup and the day, without the tight feeling. |
| `key_ingredients_detail` | 18% apricot kernel oil melts the balm to a milk that lifts SPF, makeup and the day. Oat lipids leave skin feeling soft, without the tight feeling. Sunflower seed wax gives the balm its body, and vitamin E helps keep the oils fresh. |
| `inci` | Prunus Armeniaca (Apricot) Kernel Oil, Caprylic/Capric Triglyceride, Polyglyceryl-4 Oleate, Helianthus Annuus (Sunflower) Seed Wax, Butyrospermum Parkii (Shea) Butter, Avena Sativa (Oat) Kernel Oil, Sorbitan Olivate, Helianthus Annuus (Sunflower) Seed Oil, Tocopherol. Illustrative formula for this concept store. |
| `how_to_use` | Massage a hazelnut-sized amount into dry skin, over SPF and makeup. Add a little warm water and it turns to milk. Rinse. Morning and evening, before Long Light. |

## 02 · Long Light Serum

| Field | Value |
|---|---|
| Handle | `long-light-serum` |
| Type | Serum |
| Price | 30 ml: $54, 15 ml travel: $29 |
| Option | Size |
| SKU | `LUM-02-LONGLIGHT-30`, `LUM-02-LONGLIGHT-15` |
| Tags | `the-six, step-02, glow, skincare, vitamin-c, fragrance-free, vegan-formula, hero` |
| Category (set in admin) | Facial serums (or Skin care if the taxonomy has no serum leaf) |
| Template | `product.long-light` |
| SEO title | Long Light Serum, 10% vitamin C glow serum | Lumora Beauty |
| SEO description | A water-light serum with 10% stable vitamin C and 2% sea buckthorn oil. Skin looks warm-lit, more even and awake, with no glitter and no tint. 30 ml, $54. |

**Images, in this order** (from `lumora-beauty/products/long-light-serum/` unless noted):

| # | File | Alt text | Status |
|---|---|---|---|
| 1 | `long-light-serum-packshot.jpg` | Long Light Serum, a 30 ml amber glass dropper with a champagne collar and honey bulb, on a sand backdrop | ready (1200 x 1500) |
| 2 | `long-light-serum-in-light.jpg` | Long Light Serum on travertine in low, raking sun, its shadow glowing amber on the wall | ready (1200 x 1500) |
| 3 | `long-light-serum-detail.jpg` | Close-up of the champagne collar, honey bulb and amber glass shoulder of Long Light Serum in raking sun | ready (1200 x 1500) |
| 4 | `long-light-serum-with-haze.jpg` | Long Light Serum beside a jar of Haze Soft-Focus Cream in late sun, the routine pair | ready (1200 x 1500) |
| 5 | `long-light-serum-back-label.jpg` | The back label of Long Light Serum: how to use, the full ingredient list, fragrance-free and vegan, 30 ml | **missing** (see BUILD-GUIDE 0.3) |
| 6 | `long-light-serum-06-ingredients-card.jpg` | Ingredients card: 10% vitamin C, a stable form, and 2% sea buckthorn oil, plus squalane, hyaluronate, ferulic acid and vitamin E. Fragrance-free, no mica, no tint, vegan formula. | **missing** (see BUILD-GUIDE 0.3) |
| 7 | `long-light-serum-07-results-card.jpg` | Results card: after 4 weeks, 93% said skin looked more radiant, 87% said tone looked more even and 96% said it layered under SPF without pilling. Consumer perception study, 32 participants, self-assessed. Illustrative placeholder data. | **missing** (see BUILD-GUIDE 0.3) |
| 8 | `long-light-serum-08-ritual-card.jpg` | Ritual card: Long Light is step 02 of 6, after Sunmelt and before Haze, morning and evening. | **missing** (see BUILD-GUIDE 0.3) |

Images 5 to 8 come from `lumora-beauty/build/media/` (the back label is the mockup's 1.6x crop; 6 to 8 are the mockup's
HTML gallery cards rendered to 1600 x 2000). Images 1 to 4 come from `products/long-light-serum/`. Image 4 is the same frame as
`renders/scenes/golden-pair.jpg` (the manifest says so). Card hover: with "second image on hover" on, the Long Light card would
swap to image 2, a wider low-sun scene, while the other five only zoom. BUILD-GUIDE 1.6 turns the hover image off so all six cards
behave the same; turn it on once every product has a same-crop low-sun render.

**Metafields** (`custom.*`):

| Key | Value |
|---|---|
| `step` | 02 |
| `ritual` | Glow |
| `lexicon` | long light (n.) the low, raking light of the last hour of sun. |
| `card_line` | 10% vitamin C glow serum · 30 ml |
| `benefit_1` | even|More even-looking tone in 4 weeks² |
| `benefit_2` | absorb|Absorbs in seconds, layers under SPF |
| `benefit_3` | amber|Amber glass keeps the vitamin C from the light |
| `suited_to` | Dull-looking or uneven-looking skin, every skin tone |
| `finish` | Satin; no tint, no shimmer |
| `scent` | Fragrance-free |
| `key_ingredients` | 10% vitamin C, 2% sea buckthorn oil |
| `pairs_with` | haze-soft-focus-cream |
| `what_it_does` | A water-light serum with 10% stable vitamin C and 2% sea buckthorn oil. It brightens the look of dull skin, evens the look of tone and leaves a satin finish that reads warm on every skin tone. The apricot color is sea buckthorn’s own, and it sinks in clear: no tint, no shimmer. |
| `key_ingredients_detail` | 10% vitamin C (3-O-ethyl ascorbic acid), a stable form that brightens the look of dull skin and evens the look of tone. 2% sea buckthorn oil, carotenoid-rich, and the reason the serum is apricot. 1% squalane and hyaluronic acid keep skin feeling soft and comfortable. Ferulic acid and vitamin E help keep the formula fresh. Every ingredient is decoded further down the page. |
| `inci` | Aqua (Water), Propanediol, Glycerin, 3-O-Ethyl Ascorbic Acid, Hippophae Rhamnoides Fruit Oil, Squalane, Polyglyceryl-4 Caprate, Sodium Hyaluronate, Tocopherol, Ferulic Acid, Xanthan Gum, Sodium Phytate, Citric Acid, Phenoxyethanol, Ethylhexylglycerin.<br>Fragrance-free. Vegan formula. Use within 6 months of opening. Formulas can change, so the list on your bottle is the one to trust. |
| `how_to_use` | Morning and evening, after Sunmelt. Warm 3 to 4 drops between your palms and press into clean skin, face and neck. Follow with Haze. In the morning, finish with your daily SPF. New to vitamin C? Start every other evening for the first week. |

## 03 · Haze Soft-Focus Cream

| Field | Value |
|---|---|
| Handle | `haze-soft-focus-cream` |
| Type | Moisturizer |
| Price | single size: $48 |
| Option | none (Default Title) |
| SKU | `LUM-03-HAZE-50` |
| Tags | `the-six, step-03, moisturize, skincare, fragrance-free, vegan-formula` |
| Category (set in admin) | Lotions & moisturizers |
| Template | `product (default)` |
| SEO title | Haze Soft-Focus Cream, satin moisturizer | Lumora Beauty |
| SEO description | A cushiony moisturizer with ceramides and 5% squalane that leaves a blurred, satin finish and comforts dry-feeling skin. 50 ml, $48. |

**Images, in this order** (from `lumora-beauty/products/haze-soft-focus-cream/` unless noted):

| # | File | Alt text | Status |
|---|---|---|---|
| 1 | `haze-soft-focus-cream-packshot.jpg` | Haze Soft-Focus Cream, a frosted amber jar with an apricot lid, on a sand backdrop | ready (1200 x 1500) |

One image only for now: no low-sun hover render exists for this product, so the card simply zooms on hover.

**Metafields** (`custom.*`):

| Key | Value |
|---|---|
| `step` | 03 |
| `ritual` | Moisturize |
| `lexicon` | haze (n.) the soft blur of golden air |
| `card_line` | Cushiony satin moisturizer · 50 ml |
| `benefit_1` | absorb|Helps replenish the moisture barrier |
| `benefit_2` | even|A blurred, satin, soft-focus finish |
| `benefit_3` | drop|Comforts dry-feeling skin |
| `suited_to` | Normal to dry-feeling skin, every skin tone |
| `finish` | Satin, soft-focus |
| `scent` | Fragrance-free |
| `key_ingredients` | Ceramides, 5% squalane |
| `pairs_with` | long-light-serum |
| `what_it_does` | A cushiony moisturizer with ceramides and 5% squalane. It leaves a blurred, satin finish and comforts dry-feeling skin, morning and evening. |
| `key_ingredients_detail` | Ceramides help replenish the moisture barrier. 5% squalane gives the cushiony, satin finish and comforts dry-feeling skin. Shea butter and glycerin keep skin feeling soft. |
| `inci` | Aqua (Water), Squalane, Glycerin, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Butyrospermum Parkii (Shea) Butter, Glyceryl Stearate, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Sodium Lauroyl Lactylate, Carbomer, Xanthan Gum, Tocopherol, Phenoxyethanol, Ethylhexylglycerin. Illustrative formula for this concept store. |
| `how_to_use` | Morning and evening, after Long Light. Warm a pea-sized amount between your fingertips and press into face and neck. In the morning, follow with your daily SPF. |

## 04 · Apricity Lip + Cheek Balm

| Field | Value |
|---|---|
| Handle | `apricity-lip-cheek-balm` |
| Type | Lip and cheek balm |
| Price | Clay: $24, Low Sun: $24, Dusk: $24 |
| Option | Shade |
| SKU | `LUM-04-APRICITY-CLAY`, `LUM-04-APRICITY-LOWSUN`, `LUM-04-APRICITY-DUSK` |
| Tags | `the-six, step-04, flush, color, vegan-formula` |
| Category (set in admin) | Lip balms & treatments (or Blush) |
| Template | `product (default)` |
| SEO title | Apricity Lip + Cheek Balm, sheer color in three shades | Lumora Beauty |
| SEO description | A sheer, buildable lip and cheek balm with shea and 5% apricot kernel oil, in Low Sun, Clay and Dusk. No mica, no glitter. 6 g, $24. |

**Images, in this order** (from `lumora-beauty/products/apricity-lip-cheek-balm/` unless noted):

| # | File | Alt text | Status |
|---|---|---|---|
| 1 | `apricity-lip-cheek-balm-packshot.jpg` | Apricity Lip + Cheek Balm in the shade Clay, a terracotta stick with a champagne cap, on a sand backdrop | ready (1200 x 1500) |

Variant images: assign the packshot to **Clay** (the default, first variant). Low Sun and Dusk have no render yet, so leave
their variant image empty (the gallery keeps the Clay packshot). Swatch colours come from theme settings (Low Sun #D9875F, Clay #B0533F, Dusk #7E3B36).

**Metafields** (`custom.*`):

| Key | Value |
|---|---|
| `step` | 04 |
| `ritual` | Flush |
| `lexicon` | apricity (n.) the warmth of the sun in winter |
| `card_line` | 3 shades · 6 g |
| `benefit_1` | tones|Sheer, buildable warmth in three shades |
| `benefit_2` | drop|A soft, cushioned glide on lips and cheeks |
| `benefit_3` | leaf|Color from iron oxides: no mica, no glitter |
| `suited_to` | Lips and cheeks, on light to deep skin |
| `finish` | Sheer satin, buildable |
| `scent` | Fragrance-free |
| `key_ingredients` | Shea butter, 5% apricot kernel oil, iron oxides |
| `pairs_with` | haze-soft-focus-cream |
| `what_it_does` | A sheer lip and cheek balm with shea and 5% apricot kernel oil. Buildable warmth in three shades, Low Sun, Clay and Dusk, designed to read on light to deep skin¹. |
| `key_ingredients_detail` | Shea butter gives a soft, cushioned glide on lips and cheeks. 5% apricot kernel oil adds slip that sinks in fast. Iron oxides give the sheer color: no mica, no glitter. |
| `inci` | Ricinus Communis (Castor) Seed Oil, Butyrospermum Parkii (Shea) Butter, Prunus Armeniaca (Apricot) Kernel Oil, Euphorbia Cerifera (Candelilla) Wax, Copernicia Cerifera (Carnauba) Wax, Simmondsia Chinensis (Jojoba) Seed Oil, Tocopherol, [+/- CI 77491, CI 77492, CI 77499 (Iron Oxides)]. Illustrative formula for this concept store. |
| `how_to_use` | Dab onto lips, or tap onto cheeks with a fingertip and blend upward. Build one sheer layer at a time. |

## 05 · Gloaming Body Oil

| Field | Value |
|---|---|
| Handle | `gloaming-body-oil` |
| Type | Body oil |
| Price | single size: $46 |
| Option | none (Default Title) |
| SKU | `LUM-05-GLOAMING-100` |
| Tags | `the-six, step-05, body, skincare, fragrance-free, vegan-formula, slow-hour` |
| Category (set in admin) | Body oils |
| Template | `product (default)` |
| SEO title | Gloaming Body Oil, dry-touch body oil | Lumora Beauty |
| SEO description | A dry-touch body oil with 40% apricot kernel, jojoba and vitamin E. Skin looks lit and feels soft, never shimmery or greasy. 100 ml, $46. |

**Images, in this order** (from `lumora-beauty/products/gloaming-body-oil/` unless noted):

| # | File | Alt text | Status |
|---|---|---|---|
| 1 | `gloaming-body-oil-packshot.jpg` | Gloaming Body Oil, a tall amber glass bottle with a ribbed clay cap, on a sand backdrop | ready (1200 x 1500) |

One image only for now: no low-sun hover render exists for this product, so the card simply zooms on hover.

**Metafields** (`custom.*`):

| Key | Value |
|---|---|
| `step` | 05 |
| `ritual` | Body |
| `lexicon` | gloaming (n.) the soft light after sunset |
| `card_line` | Dry-touch body oil · 100 ml |
| `benefit_1` | absorb|Dry-touch: sinks in fast, never greasy |
| `benefit_2` | even|Skin looks lit, never shimmery |
| `benefit_3` | drop|Soft, comfortable skin after a bath |
| `suited_to` | Body, every skin type and tone |
| `finish` | Lit, dry-touch; no shimmer |
| `scent` | Fragrance-free |
| `key_ingredients` | 40% apricot kernel oil, jojoba, vitamin E |
| `pairs_with` | slow-hour-golden-milk |
| `what_it_does` | A dry-touch body oil with 40% apricot kernel, jojoba and vitamin E. Skin looks lit and feels soft, never shimmery or greasy. |
| `key_ingredients_detail` | 40% apricot kernel oil gives soft slip that sinks in fast. Jojoba keeps the feel dry-touch, never greasy. Vitamin E helps keep the oils fresh. |
| `inci` | Prunus Armeniaca (Apricot) Kernel Oil, Caprylic/Capric Triglyceride, Simmondsia Chinensis (Jojoba) Seed Oil, Squalane, Helianthus Annuus (Sunflower) Seed Oil, Tocopherol. Illustrative formula for this concept store. |
| `how_to_use` | In the evening, on skin still damp from a bath or shower. Warm a few drops in your palms and press over shoulders, arms and legs. |

## 06 · Slow Hour Golden Milk

| Field | Value |
|---|---|
| Handle | `slow-hour-golden-milk` |
| Type | Golden milk blend |
| Price | single size: $28 |
| Option | none (Default Title) |
| SKU | `LUM-06-SLOWHOUR-120` |
| Tags | `the-six, step-06, unwind, food, slow-hour` |
| Category (set in admin) | Herbs & spices, or Drink mixes (it is sold as food) |
| Template | `product (default)` |
| SEO title | Slow Hour Golden Milk, spiced drink blend | Lumora Beauty |
| SEO description | A warm spiced drink blend of turmeric root, ginger, Ceylon cinnamon, cardamom and black pepper. Sold as food, about 30 cups. 120 g, $28. |

**Images, in this order** (from `lumora-beauty/products/slow-hour-golden-milk/` unless noted):

| # | File | Alt text | Status |
|---|---|---|---|
| 1 | `slow-hour-golden-milk-packshot.jpg` | Slow Hour Golden Milk, a speckled dusk stoneware canister with a champagne lid, on a sand backdrop | ready (1200 x 1500) |

One image only for now: no low-sun hover render exists for this product, so the card simply zooms on hover.

**Metafields** (`custom.*`):

| Key | Value |
|---|---|
| `step` | 06 |
| `ritual` | Unwind |
| `lexicon` | slow hour (n.) the hour you take back |
| `card_line` | Spiced drink blend · about 30 cups |
| `benefit_1` | cup|A warm, spiced cup for the end of the day |
| `benefit_2` | sun|Turmeric, ginger, Ceylon cinnamon and cardamom |
| `benefit_3` | drop|Whisk into warm milk: about 30 cups a tin |
| `suited_to` | An evening cup, with any milk |
| `finish` | *(leave empty)* |
| `scent` | *(leave empty)* |
| `key_ingredients` | Turmeric root 38%, ginger, Ceylon cinnamon, cardamom, black pepper, coconut milk powder |
| `pairs_with` | gloaming-body-oil |
| `what_it_does` | A spiced drink blend of turmeric root (38%), ginger, Ceylon cinnamon, cardamom, black pepper and coconut milk powder. A warm cup for the end of the day. |
| `key_ingredients_detail` | Turmeric root (38%) gives the golden color and a warm, earthy base. Ginger brings gentle heat, Ceylon cinnamon a sweet spice, cardamom a soft, floral lift and black pepper a little warmth at the finish. Coconut milk powder makes the cup creamy. |
| `inci` | Ingredients: turmeric root (38%), coconut milk powder (coconut milk, maltodextrin), ginger, Ceylon cinnamon, cardamom, black pepper. Illustrative food label for this concept store: a live product needs a full food label with allergens, net weight and best-before. |
| `how_to_use` | Whisk one heaped teaspoon (about 4 g) into a cup of warm milk or plant milk, hot but not boiling. Sweeten if you like. Best before: see the base of the tin. |

## Collections

| Collection | Handle | Type | Contents and sort |
|---|---|---|---|
| The six | `the-six` | Automated: tag is equal to `the-six` | Sort **manually**: 01 Sunmelt, 02 Long Light, 03 Haze, 04 Apricity, 05 Gloaming, 06 Slow Hour |
| The slow hour | `the-slow-hour` | Automated: tag is equal to `slow-hour` | Gloaming, then Slow Hour (optional; only if the button links here) |

Search & Discovery app (optional, 2 minutes): set complementary products so "Pairs well with" is curated: Long Light → Haze,
Sunmelt; Haze → Long Light, Apricity; the rest → their `pairs_with` product.
