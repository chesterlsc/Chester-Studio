# Polish scorecard (merged from the three reference teardowns)

Built from the polish checklists at the end of `coldbrook.md`, `convenz.md` and `inzinnergy.md`. All three
stores are Minimog 5.9 builds by the same team, so this is that team's standard. Every Lumora mockup and
build is scored against it. "Test" notes say how to check an item.

## 1. System

1. **Token layer.** At most 12 colours from one hue family, one working accent, plus an optional bright accent used only on dark. Imagery is graded into the same family. *Test: swatch strip vs 10 sampled image midtones reads as one family; no raw hex outside the token block.*
2. **Two font families**, at most 4 faces, WOFF2. Use real italics if italics are used. The heading face is set in Minimog typography.
3. **One section-header anatomy everywhere** (PDP included): eyebrow (12–13px, 500–600, .16–.18em caps, accent) → H2 (one clamp, ~32px mobile / 46–66px desktop, line-height ≈1.02, `text-wrap: balance`) → lead (≤54ch, muted, line-height 1.6) → actions. The optional "view all" is a right-aligned text link with a 1px underline. *Test: identical computed H2 metrics.*
4. **Eyebrows only on story sections**, 2–4 words naming the section's job. Product rails get a bare heading.
5. **One radius family**: a media/card token, 999px pills for buttons/inputs, 50% for chips. *Test: no computed border-radius outside the set.*
6. **One button anatomy at one height** (46–52px desktop, 48px mobile). Primary is a filled accent or ink; secondary is a 1px outline. Hover lifts 1–2px with a soft ink-tinted shadow, arrows nudge in their direction, and a visible focus ring.
7. **One shadow family**: soft, long, negative-spread, ink-tinted, at most 3 recipes. Prefer hairlines on cards.
8. **One icon family and weight** at three sizes, one colour per background. Custom SVG, never emoji.
9. **One left edge.** Header logo, hero copy, section content and footer columns align within ±1px at 1440 and 390.
10. **Two vertical-rhythm tokens**: standard ≈ clamp(64px, 8vw, 120px) and feature ≈ clamp(80px, 11vw, 160px). No unintended gaps.
11. **Background rhythm**: base → tinted band with hairlines → base → dark statement band → … → a closing band that dissolves into the footer. No two identical adjacent bands, no pure-white page, texture on at most 2 sections at ≤8% opacity.
12. **A signature transition motif** of our own (SVG/CSS), used 2–3 times at the same kind of moment.
13. **Motion**: one easing, two durations (~180/380ms). Reveal = opacity plus a 20–28px rise with a 60–100ms stagger. Image zoom ≤1.04 over 0.8–1s. At most one marquee per page. Everything respects `prefers-reduced-motion`.
14. **Contrast**: every small-text pair ≥4.5:1, including eyebrows, muted text on tints, prices, and text over images (scrims).

## 2. Imagery

15. **One grade** across all lifestyle imagery (light, white balance, contrast). Props and wardrobe echo the accent.
16. **Six packshots**: same background, camera family, light, shadow and ratio (4:5), sources ≥2048px. Every label reads Lumora, with no garbled text.
17. **The hero product appears in at least 3 scenes.** Mobile 4:5 crops come from the same masters.
18. **Descriptive alt text** on every image.

## 3. Header and hero

19. **Announcement**: one benefit-led line that fits 390px without wrapping (≤38 uppercase characters).
20. **Header**: logo left; at most 5 shopping-led links in tracked caps with a wipe-in underline; transparent over the hero, then solid with a hairline; sticky on scroll-up; an image mega menu with product tiles.
21. **Desktop hero**: 2–4-word H1, a lead of ≤22 words, 2 CTAs with specific verbs, and a trust row (3–4 items: icon, title, clarifier, hairline dividers). The scrim keeps text ≥4.5:1, the hero fills the first 900px screen, and an optional shoppable callout shows the hero product's live price.
22. **Mobile hero**: dedicated art, with the H1 and primary CTA visible within 390×844.

## 4. Commerce modules

23. **One product-card system** on every template: same ratio, tile colour and padding; 2-line title clamp with reserved height; prices on one baseline; the same hover (lift, ≤1.04 zoom); at most one badge; no wishlist/compare clutter.
24. **Grids fit the catalogue**: 6 products → 3×2, 6 across, or a carousel. No empty slots. Each product appears at most twice on the homepage.
25. **Shoppable routine scene**: numbered accent pins with a ring and gentle pulse; popovers with thumbnail, name, price and arrow; the numbered list stays visible on mobile.
26. **At least one full-bleed dark statement band** on the homepage and on the PDP.
27. **Footer**: logo plus a one-line promise, 2–3 menus, a named newsletter with a value line, monochrome payment icons shown once, policy links and an oversized wordmark sign-off. The section above flows into it.

## 5. Product page

28. **Above the fold at 1440×900**: breadcrumb, title, rating with count, price, 3 benefit bullets with icons, variant pills (no dropdown for ≤4 options), quantity plus Add to cart as the strongest element, dynamic checkout quieter beneath, and a delivery/returns microcopy line.
29. **The buy-box trust row matches the hero trust row** (compact version, same icons and wording).
30. **Depth below the fold**: benefits, ingredients with %, how to use, results (footnoted), full INCI, FAQ, reviews styled to tokens, a routine/bundle upsell, and recommendations using the homepage card.
31. **Sticky add to cart** in brand tokens: desktop after scroll, a mobile bottom bar. It never covers other UI.
32. **Cart drawer** (build only): translucent overlay, a free-shipping progress bar tied to the announcement threshold, an upsell slot, a branded empty state.

## 6. Copy

33. **One voice, US spelling.** Headlines of ≤6 words (2–4 ideal). At most one highlighted (italic/accent) word per heading, and it is the last word.
34. **Eyebrows of 2–4 words.** CTAs are specific verb phrases that vary by job, never a bare "Shop now". Risk-reversal microcopy sits beside the main CTAs.
35. **Concrete numbers**, at least one "X, not Y" proof line per page, and no sentence reused across sections. Claims are cosmetics-compliant, and every statistic is footnoted as illustrative placeholder data.

## 7. Hygiene (build)

36. Exactly one H1 per page; a written meta title and description; a social share image; no dead links; no leftover theme defaults (demo copy, "Powered by Shopify", default favicon); the heading WOFF2 preloaded; the hero image ≤200KB at 1920w.
