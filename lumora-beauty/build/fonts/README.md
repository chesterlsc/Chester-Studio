# Fraunces 72pt SuperSoft: static WOFF2 for Minimog's custom font upload

Three static instances of the Fraunces variable font, made for Minimog's "custom font" field (which takes one file
per weight and cannot use variable axes), plus the italic Minimog cannot declare at all.

| File | Weight / style | Axes pinned | Size | Use |
|---|---|---|---|---|
| `Fraunces_72pt_SuperSoft-Light.woff2` | 300 normal | opsz 72, SOFT 100, WONK 0 | 29 KB | H1 to H3, stats, quotes, PDP title and price |
| `Fraunces_72pt_SuperSoft-Regular.woff2` | 400 normal | opsz 72, SOFT 100, WONK 0 | 29 KB | Card titles, pin and popover names, small display lines |
| `Fraunces_72pt_SuperSoft-LightItalic.woff2` | 300 italic | opsz 72, SOFT 100, **WONK 1** | 36 KB | The one accent word per heading, lexicon lines, the signature |

**How they were made.** Source: the Fraunces variable font served by Google Fonts (v38, roman and italic,
latin and latin-ext subsets, all four axes). Each subset was instanced with fontTools 4.68
(`varLib.instancer`, axes pinned as above, feature variations resolved so the WONK forms are baked in), the two
subsets were merged with `fontTools.merge`, renamed (family "Fraunces 72pt SuperSoft", styles Light / Regular /
Light Italic, PostScript names `Fraunces72ptSuperSoft-…`) and saved as WOFF2 (Brotli). 634 to 638 glyphs:
Latin, Latin-1, Latin Extended-A/B, curly quotes, ¹ ² ³, the middle dot, en and em dashes, $ and €, and the
f-ligatures. Each file opens cleanly with fontTools (checked: static, correct weight class, italic angle −16° on
the italic). The build script lives in the session scratchpad (`fontbuild/build_fonts.py`).

**License.** Fraunces is © 2020 The Fraunces Project Authors (github.com/undercasetype/Fraunces), licensed under
the SIL Open Font License 1.1 (openfontlicense.org). The copyright and license records are embedded in each file
(name IDs 0, 13, 14). Self-hosting and modification are allowed; the fonts may not be sold on their own.

## Upload (5 minutes)

1. **Shopify admin > Content > Files > Upload files**: select the three `.woff2` files. Keep the names exactly
   (lu-skin finds the italic by name with `file_url`). If Shopify appends `_1` because a file with that name
   exists, delete both and upload again.
2. For the Light and the Regular file, click the **link icon** to copy its URL
   (`https://cdn.shopify.com/s/files/1/…/files/Fraunces_72pt_SuperSoft-Light.woff2?v=…`).
3. **Theme editor > Theme settings > Typography > Heading font**: choose **custom font** (the toggle or option that
   reveals the URL field) and enter one line per weight, each URL followed by `@` and the weight:

   ```
   https://cdn.shopify.com/s/files/1/…/Fraunces_72pt_SuperSoft-Light.woff2?v=…@300
   https://cdn.shopify.com/s/files/1/…/Fraunces_72pt_SuperSoft-Regular.woff2?v=…@400
   ```

   If the field takes a single line, separate the two entries with a comma. Set **Heading font weight: 300**.
   Minimog then writes `@font-face { font-family: M-Heading-Font; font-weight: 300 | 400 }` and points
   `--font-stack-header` at it.
4. **Do not** enter the italic here. lu-skin declares it (`M-Heading-Font`, italic, 300 to 400) from the uploaded
   `Fraunces_72pt_SuperSoft-LightItalic.woff2`, and repeats the 300/400 faces as a safety net, so headings keep
   the right face even if the field format differs in your Minimog version. lu-skin also preloads the Light file.
5. **Body font: Figtree** from the Shopify font library (Theme settings > Typography > Body font). Nothing to
   upload; lu-skin loads its 500 and 600 weights from the same library font.

**Check:** on the storefront, DevTools > Network > Font shows the three Fraunces files from cdn.shopify.com with
status 200; the italic word in "Late light, *bottled.*" has the wonky, leaning b, and headings render in Fraunces
Light, not Georgia.
