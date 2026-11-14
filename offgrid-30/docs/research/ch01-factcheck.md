# Chapter 1 — Water Basics: How Much You Need — Independent fact-check

Fact-checker: independent agent (did not write the chapter). Date: 2026-11-14.
Scope: 10 pages (`src/content/pages/01-water-basics-how-much-you-need/*.mdx`), 10 diagrams (`src/components/diagrams/ch01/*.astro`, SVG `<title>`/`<desc>`/`<text>` and the WaterCalc formula), research notes `docs/research/ch01-facts.md`.
Rules applied: STYLE.md §2 (content/fact rules), §3 (writing), §7 (fact-check checklist).

Method: every number, time, age, unit, safety do/don't and red flag on the pages and diagrams was traced to the research notes and then **re-read on the source itself** (WebFetch for HTML; PDFs downloaded and text-extracted; PMC pages read from saved HTML). All 34 sources cited by the chapter were opened. Unit conversions and the calculator maths were recomputed by hand.

---

## Summary verdict: **FAIL — fixable** (it becomes PASS once the 1 critical and 6 major fixes below are made)

| Severity | Count |
|---|---|
| Critical | 1 |
| Major | 6 |
| Minor | 15 |
| Claims verified OK | ~150 (listed below) |

Most of the chapter is accurate. Numbers, unit conversions, quiz answers and references are almost all correct and match their sources. The problems are: one unsafe piece of baby-feeding advice; three safety gaps (untreated water used for "washing", no scald warning on the water heater, missing same-day signs for babies); and three numbers that are mislabelled or not in their source (WHO 7.5 L, "beef cow", "chicken").

---

## Issues

| # | Page / file | Exact text | Problem | Severity | Evidence (source + quote) | Exact fix (replacement text) |
|---|---|---|---|---|---|---|
| C1 | `04-who-needs-extra-water.mdx` Steps "Baby" detail; Don't list | Detail: `'Baby sick? Keep up breast milk or formula, in small amounts more often. Under 6 months: boil any extra water, then cool it.'` Don't: `'Give a baby under 6 months <b>unboiled</b> water'` | Implies it is normal to give water to babies under 6 months, as long as it is boiled. Breastfed babies under 6 months need no water, even in heat. NHS allows extra sips **only** for babies "on formula or solid foods". Giving plain water to young babies can cause low blood salt and seizures. The page drops NHS's condition. | **Critical** (child safety) | CDC, *Travel Recommendations for Nursing Mothers* (Feb 13, 2026), https://www.cdc.gov/infant-toddler-nutrition/breastfeeding/travel-recommendations.html: "Breastfed babies younger than 6 months do not need to drink water or any other liquids, even in hot weather." NHS `nhs-dehyd`: "give your baby small sips of extra water if they're on formula or solid foods" / "(if your baby is under 6 months, then boil the water first before letting it cool)". `cdc-infant` gives water only "If your child is between 6 and 12 months old". | Detail → `'Baby sick? Keep up breast milk or formula, in small amounts more often. Under 6 months, breastfed babies need no water. Formula-fed? Small sips of boiled, cooled water.'` (30 words max, so trim: `'Keep up breast milk or formula, little and often. Breastfed under 6 months: no water. On formula: sips of boiled, cooled water.'`). Don't → `'Give <b>water</b> to a breastfed baby under 6 months'`. Add the CDC travel page as a new source (`cdc-bf-travel`) in front-matter and References, and add it to `ch01-facts.md`. |
| M1 | `09-when-water-runs-low-what-to-do.mdx` Steps "Wash"; Scenario; `LowWaterPlan.astro` desc + `<text>` | `'Use untreated water for washing and laundry only.'` / Scenario: `'You save the creek water for washing.'` / SVG: `Untreated water: washing & laundry only`, `wash` | "Washing" includes washing hands, dishes and food and brushing teeth. CDC and Ready.gov say these need **safe** (bottled, boiled or treated) water. WHO only allows untreated water for "laundry, bathing". A child may wash hands or dishes in creek water. | **Major** (safety) | `cdc-safe`: use bottled, boiled or treated water for "drinking, making ice, making baby formula, brushing teeth, washing dishes, preparing or washing food, and washing hands" (WebFetch summary of the page); "drinking, cooking, and personal hygiene". `ready-water`: "Treat all water of uncertain quality before using it for drinking, food washing or preparation, washing dishes, brushing teeth, or making ice". `who-hum`: "people may use an untreated water source for laundry, bathing, etc." | Step title → `'Use untreated water only for laundry and bathing.'` Detail → `'Not for hands, dishes, food or teeth. Treat it first (see 4.3 and 4.4).'` Scenario → `'You save the creek water for laundry.'` SVG line → `Untreated water:` / `laundry & bathing only`; small label `wash` → `laundry`; desc → `3: Use untreated water only for laundry and bathing, not for drinking, hands, dishes, food or teeth.` Add `cdc-safe` to page front-matter `sources`. Also the alt text in front-matter: `use untreated water for laundry and bathing only`. |
| M2 | `06-hidden-water-already-in-your-home.mdx` Steps "Off"/"Drain"; Scenario; `HiddenWater.astro` drain strip | `'Open the drain at the bottom of the tank. Catch the water.'`; Scenario: turns power off, then at once "fill clean jugs from the drain at the bottom" | No warning that the tank water can be scalding hot, and nothing says an adult should do it. The book is for readers aged 10+. The research notes say so too: "Water heater safety details: let it cool first … scald warning. Not on `fema-ayr`, `rc-foodwater` or `cdc-find`." | **Major** (child safety) | No scald text on any cited source (checked `fema-ayr` p. 1.4, `rc-foodwater` p. 9, `cdc-find`, FEMA FAQ page). Candidate source found by search but **not yet read in full**: CPSC Publication 5098 "Avoiding Tap Water Scalds", https://www.cpsc.gov/s3fs-public/5098-Tap-Water-Scalds.pdf. | Add to the Drain step detail: `'Hot! The water can scald. An adult does this. Let it cool first.'` Add `'Let an adult drain the <b>hot</b> heater'` to Do. Scenario: add `You wait for the tank to cool.` before filling jugs. **Before printing:** research must verify one Tier 1 source for the scald warning (e.g. CPSC 5098) and add it to the notes and References. If no source can be verified, keep only "An adult does this", which is a supervision instruction and not a factual claim. |
| M3 | `02-how-much-water-each-person-needs-a-day.mdx` Callout; `DailyGallon.astro` `<text>` + desc | Callout: `'WHO says 7.5 L (2 gal) a day covers most people's drinking and food.'` SVG: `7.5 L (2 gal)` / `drinking + food`; desc: `7.5 liters (2 gallons) for drinking and food` | The cited WHO page does not say what the 7.5 L is for. It says only that it "will meet the requirements of most people under most conditions". The label "drinking + food" was added by the writers. In WHO's own framework 7.5 L is the low end of a **total** (drinking + cooking + basic hygiene), so the label is probably wrong as well as unsourced. | **Major** (claim not in source) | `who-hum`, full passage: "Based on estimates of requirements of lactating women who engage in moderate physical activity in above-average temperatures, a minimum of 7.5 litres per capita per day will meet the requirements of most people under most conditions. … However, in an emergency situation, a minimum of 15 litres is required. A higher quantity of about 20 litres per capita per day should be assured to take care of basic hygiene needs and basic food hygiene." | Callout → `'WHO: 7.5 L (2 gal) a day is the bare minimum for most people. In an emergency, WHO sets at least 15 L (4 gal). About 20 L (5.3 gal) covers basic hygiene.'` SVG `drinking + food` → `bare minimum`; desc → `7.5 liters (2 gallons) as the bare minimum for most people`. Fix `ch01-facts.md` line "meets most people's needs (drinking + food)" the same way. |
| M4 | `05-water-for-pets-and-farm-animals.mdx` alt; `AnimalWater.astro` `<text>` + desc | `Beef cow mild weather` `22 L · 5.7 gal`; alt: `beef cow 22 L` | The study has **no cows**. Its animals are bulls, heifers and steers (growing beef cattle). A milking cow needs much more. The chart also leaves out heat. In the same study intake rose to about 30 L/day in heat, which matters for planning. | **Major** (mislabelled number; could lead to under-planning) | `blake2026`: "bulls consuming the most water (25.62 ± 0.03 L/d), followed by heifers (23.21 ± 0.07 L/d), and steers (21.83 ± 0.06 L/d)"; "Under thermoneutral conditions (THI < 72), cattle drank 21.65 ± 0.02 L/d. This increased to 30.38 ± 0.07 L/d at THI 80–89". | Label → `Beef cattle <tspan>(young), mild weather</tspan>`; value stays `22 L · 5.7 gal`; add a note line `In heat: about 30 L (8 gal)`. Desc → `Young beef cattle (bulls, steers, heifers) in mild weather about 22 litres (5.7 gallons), about 30 litres (8 gallons) in heat.` Alt in front-matter: `young beef cattle 22 L (30 L in heat)`. Add the 30.38 L figure to `ch01-facts.md`. |
| M5 | `AnimalWater.astro` `<text>` + desc; page 05 alt | `Chicken` `0.15–0.2 L · 5–7 oz` | The source says this is what an adult **broiler** (meat bird) "usually" drinks, rising to 300–350 mL. The same paper gives about 500 mL/day for 6-month-old laying hens, the bird most homes keep. Planning on 0.15–0.2 L could leave a flock with half to a third of the water it needs in heat. | **Major** (under-planning) | `elsabry2023`: "An adult broiler chicken usually drinks about 150 to 200 ml per day, and it can reach up to 300–350 ml per day". The same paper cites Fujita et al. 2001: about 500 mL/day for 6-month-old commercial layers. | Label → `Meat chicken` / `0.15–0.35 L · 5–12 oz`; and either add `Laying hen: up to ~0.5 L (17 oz)` (one study, cited in `elsabry2023`) or footnote `Laying hens may drink more`. Update desc and the page alt the same way. Add the layer figure to `ch01-facts.md`. |
| M6 | `03-signs-of-dehydration-at-any-age.mdx` Callouts "Get help now" / "Get help the same day" | Same-day box: `A baby's soft spot sinks in. Or you feel dizzy when you stand up, and it does not go away.` | The same-day grading leaves out NHS's other urgent signs for babies and children: "few or no tears", "fewer wet nappies", "drowsy". The page lists these elsewhere as signs but never says to get help for them. The emergency box also leaves out MedlinePlus's 911 trigger "does not improve or worsens despite treatment". | **Major** (red flags incomplete) | `nhs-dehyd`, "Ask for an urgent GP appointment or get help from NHS 111 if": "you're feeling unusually tired (or your child seems drowsy)"; "you have dark yellow pee or you're peeing less than normal (or your baby has fewer wet nappies)"; "your baby or child have few or no tears when they cry"; "your baby has a soft spot on their head that sinks inwards". `mlp-dehyd-ency`, "call 911 … if": "The condition does not improve or worsens despite treatment" (paraphrased by WebFetch). | Same-day box → `A baby's soft spot sinks in, or a baby has few tears or fewer wet diapers. A child seems drowsy. You feel dizzy on standing, and it does not go away.` (keep to 3 lines). Emergency box: add `Or gets worse even after drinking.` |
| m1 | `04-…mdx` Do item, Steps "Work", Scenario `move`; `ExtraWater.astro` `Hard work in heat` | `'Hot work: 1 cup…'`, `'Working hard in heat? Drink 1 cup (237 mL) every 15–20 minutes.'` | The source gives this rate for **moderate** activity in **moderately** hot conditions, not hard work. | Minor | `cdc-niosh-heat`: "During moderate activity in moderately hot conditions, workers should drink about 1 cup every 15 to 20 minutes." | `'Working in heat? Drink 1 cup (237 mL) every 15–20 minutes.'`; SVG `Hard work in heat` → `Working in heat`; Do → `'Working in heat: 1 cup (237 mL) every <b>15–20</b> minutes'`. |
| m2 | `04-…mdx` Don't; `09-…mdx` Don't; `LowWaterPlan.astro` | `'Count <b>alcohol</b> or caffeine drinks as water'`; `'Count fizzy drinks, alcohol or coffee as water'` | It is sourced: Ready.gov and FEMA say caffeinated drinks dehydrate, and NHS heat advice says avoid caffeine. But NHS and MedlinePlus say tea and coffee **do** count toward intake. This conflict is not logged (STYLE §2.2). | Minor | `ready-water`: "Caffeinated drinks and alcohol dehydrate the body…" and "Do not drink carbonated or caffeinated beverages instead of drinking water." `nhs-heat`: "avoid alcohol, caffeine and hot drinks". Against: `nhs-drinks`: "Water, lower-fat milk and lower-sugar drinks, including tea and coffee, all count as part of your daily intake." `mlp-water` lists "tea, coffee, soda" as beverages that supply water. | Keep page 9 (emergency, heat: the safer choice). Page 4 Don't → `'Drink <b>alcohol</b> or coffee instead of water'` (this matches Ready.gov "instead of drinking water"). Log the conflict in `ch01-facts.md` §3 and PROGRESS.md. Add the Ready.gov "Do not drink carbonated or caffeinated beverages instead of drinking water" quote to the notes. |
| m3 | `03-…mdx` emergency Callout | `Has cold, pale, grey or blotchy skin` | NHS also lists **blue** skin, lips or tongue. Blue lips are the easiest sign to spot. | Minor | `nhs-dehyd` 999 list: "blue, grey, pale or blotchy skin, lips or tongue"; "skin that feels cold". | `Has blue, grey, pale or blotchy skin or lips, or cold skin, or is hard to wake.` |
| m4 | `08-…mdx` Steps "Heat" | `'Tick "hot weather" to double the total.'` | The calculator doubles the **people's** water only (`peopleGal = p*d*(hot?2:1)`). Pets are not doubled, so "the total" is wrong. | Minor | `WaterCalc.astro` line 212; the calculator's own label says "× 2 for people". | `'Tick "hot weather" to double the water for people.'` Optionally add a detail: `Animals need more in heat too (see 1.5).` |
| m5 | `08-…mdx` Callout | `People × days × 1 gallon = gallons. Times 3.8 = liters.` … `56 gallons (212 L)` | With the rule as stated, 56 × 3.8 = 212.8, which rounds to 213. The 212 comes from 3.785. | Minor | Arithmetic. | `Times 3.8 = liters (about).` and `56 gallons (about 212 L)`; or keep the rule and write `(213 L)`. |
| m6 | `WaterCalc.astro` lines 216–218 | `const gal1 = Math.round(totalGal * 10) / 10; const jugs = Math.ceil(gal1 / 5 - 1e-9); const drums = Math.ceil(gal1 / 55 - 1e-9);` | Rounding before `ceil` can under-count by 1 container when the total is up to 0.05 gal over a multiple of 5 or 55. Example: a total of 55.04 gal rounds to 55.0 and shows 1 drum, but 2 are needed. The spec is `ceil(total/5)`. | Minor | Code review. | `const jugs = Math.ceil(totalGal / 5 - 1e-9); const drums = Math.ceil(totalGal / 55 - 1e-9);` |
| m7 | `08-…mdx` Don't + `WaterCalc.astro` | `'Forget <b>pets</b> and farm animals in your count'` | The calculator handles only dogs and cats. Nothing tells the user to add farm animals or rabbits by hand. | Minor | `WaterCalc.astro` pets fieldset. | Add a calculator note: `<b>Farm animals and rabbits:</b> add them by hand (see 1.5).` Step 4 detail → `'Dogs and cats only. Add other animals by hand (see 1.5).'` |
| m8 | `08-…mdx` front-matter | `sources: [ready-water, cdc-store, rc-foodwater, rc-kit]` | The calculator uses dog 73 mL/kg and cat 60 mL/kg, but their sources are not listed. | Minor | `zanghi2018`, `kosmal2025` (both verified). | `sources: [ready-water, cdc-store, rc-foodwater, rc-kit, zanghi2018, kosmal2025]` |
| m9 | `01-why-water-comes-first.mdx` front-matter | Step detail `'Boiling kills germs (see 4.3).'` | `cdc-safe` supports this but is not in the page's sources. | Minor | `cdc-safe`: "Boiling is the best way to kill germs in water." | Add `cdc-safe` to `sources`. |
| m10 | `01-…mdx` MainVisual legend | `{ num: '3', text: 'Days without water' }` | Reads as "3 days". The fact is 3–7 days. | Minor | `mlp-water`: "die in three to seven days". | `{ num: '3–7', text: 'Days most people live without water' }` |
| m11 | `01-…mdx` Do | `'Get <b>enough</b> water first, then make it safe'` | WHO's sentence is about agencies supplying water in a disaster. A child could read it as "drink before treating". | Minor | `who-hum`: "The first priority is to provide an adequate quantity of water, even if its safety cannot be guaranteed". | `'Collect <b>enough</b> water first, then make it safe to drink'` |
| m12 | `AnimalWater.astro` horse and sheep labels | `Horse at rest 30 L`; `Sheep mild weather 2.2 L` | Body weight is not given, so the reader cannot scale the number to their own animal. The sheep figure is for 60 kg non-pregnant, non-milking ("empty") ewes at 22°C. | Minor | `freeman2021`: "approximately 30 L/day for an average adult nonbreeding, nonworking horse (500 kg body weight)"; "60 ml/kg/day". `perez2023`: "40 empty Rasa Aragonesa ewes (60 kg of BW) was 2.18 l … 22 ºC". | `Horse at rest, 500 kg (1,100 lb)`; `Sheep, 60 kg (130 lb), mild weather`. Optionally add `Horse ≈ 60 mL per kg (0.9 oz per lb)` to the per-weight panel. |
| m13 | `05-…mdx` Scenario | `'Then you start the generator to run the well.'` | A generator in a scenario read by children, with no safety cue. Carbon monoxide from generators is a leading cause of death in outages. No source for this is in the notes. | Minor | Not in the research notes (CDC CO guidance would be the source). | `'Then you start the generator outside, far from windows, to run the well.'` and a See-also chip to the generator/CO page. Add a CDC CO source to the notes first. |
| m14 | `02-…mdx` Do | `'Count water in <b>food</b> and other drinks too'` | In a "store 1 gallon" list, this can be read as "store less". | Minor | `ready-water`: ¾ gal "of fluid daily, from water and other beverages"; `cdc-drinks`: fruits and vegetables "can also add to fluid intake". | `'Know that food and other drinks add <b>water</b> too'`, or move it to Steps "Drink" detail. |
| m15 | `09-…mdx` danger Callout | `Is confused, faints, or has no pee. Has a fast heartbeat or fast breathing. See 1.3 for all the signs.` | Repeats the 1.3 red-flag box (STYLE §2: "No repeated info across pages"). Repeating it here is defensible for safety, but the editor should make that call deliberately. | Minor (style) | STYLE.md §2. | Keep it as is (a safety exception, logged in PROGRESS.md), or cut it to `Signs of severe dehydration? Get help now (see 1.3).` |

**Note on the fever threshold (no change required):** page 3 says `fever over 102°F (39°C)`. That matches MedlinePlus ("fever over 102°F (38.8°C)"; exact conversion 38.9°C, rounded to 39°C as the conflicts table says). For young babies a lower threshold applies, but no source for it is in the notes. Consider a See-also chip to the infant fever page (49.4) once that page is sourced.

---

## Claims verified OK (read on the source itself, 2026-11-14)

**Page 1.1 — Why water comes first** (+ `BodyWater.astro`)
- Most people die in 3–7 days without water: `mlp-water` "die in three to seven days" ✓
- About 75% water in babies, 55% in older adults: `popkin2010` "75% body weight in infants to 55% in elderly" ✓
- Water keeps temperature normal, cushions joints, protects the spinal cord, carries waste out in pee, sweat and poop: `cdc-drinks` ✓ (sweat: `mlp-water` "regulates the body temperature through perspiration") ✓
- Severe dehydration can kill: `mlp-dehyd-ency` (complications include death) ✓
- Water becomes precious after disasters: `fema-ayr` "Water quickly becomes a precious resource following many disasters" ✓
- Food can be cut, but not for children or pregnant women: `rc-foodwater` "Food, unlike water, may be rationed safely, except for children and pregnant women" ✓; "healthy people can survive on half their usual food intake" ✓
- Diseases (diarrhea, cholera, typhoid, polio): `who-dw` ✓
- WHO's 3 top priorities: `who-hum` ✓
- 1.4 million deaths a year (water, sanitation, hygiene combined): `who-san` dated 5 Nov 2026, "1.4 million people die each year as a result of inadequate drinking-water, sanitation and hygiene" ✓

**Page 1.2 — How much water a day** (+ `DailyGallon.astro`)
- 1 gal per person per day: `ready-water`, `ready-kit` ("one gallon per person per day for several days, for drinking and sanitation"), `cdc-store`, `rc-kit`, `rc-foodwater` ✓
- At least 3 days; aim for 2 weeks: `cdc-store` ✓; Red Cross 3 days to evacuate, 2 weeks at home: `rc-kit` ✓
- About ¾ gal (2.8 L) of fluid for a normally active person: `ready-water` ✓ (¾ × 3.785 = 2.84 L ✓)
- Older guides say ½ gal (1.9 L): `rc-foodwater`, `fema-ayr` ✓ (1.89 L ✓)
- Adults 2.7–3.7 L (91–125 oz) total from food and drinks: `mlp-water` ✓
- WHO 15 L (4 gal) in an emergency; 20 L (5.3 gal) for basic hygiene: `who-hum` ✓ (3.96; 5.28 gal ✓)
- Scenario 3 × 3 × 1 = 9 gal = 34 L ✓; 1 L ≈ 1 quart (1.06 qt) ✓

**Page 1.3 — Signs of dehydration** (+ `DehydrationSigns.astro`, `PeeChart.astro`)
- Adult and child signs (thirst, headache, dizziness, tiredness, dry mouth, lips and tongue, sunken eyes, dark strong-smelling pee, peeing less): `nhs-dehyd` ✓; muscle cramps, dry and cool skin: `mlp-dehyd-ency` ✓
- Severe signs (shriveled skin, fast heartbeat, fast breathing; very dark or amber pee, or none): `mlp-dehyd-ency` ✓
- Baby signs: sunken soft spot, few or no tears (`nhs-dehyd`); no wet diaper for 3+ hours, unusually sleepy (`mlp-dehyd-topic`) ✓
- Babies, children and older adults are more at risk: `nhs-dehyd` ✓; thirst fades with age: `mlp-dehyd-topic`, `mlp-water`, `popkin2010` ✓
- Thirst alone is not enough: `cdc-yb-heat` ✓; morning check most accurate: `cdc-yb-heat` ✓; aim for pale yellow pee: `nhs-drinks`, `nhs-dehyd` ✓
- Get help right away for confusion, fainting, no pee, fast heartbeat, fast breathing: `mlp-dehyd-topic` ✓; cold, pale, grey or blotchy skin, hard to wake = 999: `nhs-dehyd` ✓; fever over 102°F → 911: `mlp-dehyd-ency` ✓
- Same-day grading of sunken fontanelle and "dizzy when you stand up and it does not go away": `nhs-dehyd` urgent list ✓ (grading correct; list incomplete, see M6)
- Untreated severe dehydration can cause seizures, brain damage or death: `mlp-dehyd-ency` ✓

**Page 1.4 — Who needs extra water** (+ `ExtraWater.astro`)
- Very hot temperatures can double needs: `ready-water`, `fema-ayr` ✓
- 1 cup every 15–20 min, before thirst: `cdc-niosh-heat` ✓ (but see m1); 0.71–0.95 L (24–32 oz) per hour ✓ math
- Sweat up to 1 L (34 oz) an hour: `cdc-yb-heat` ✓ (33.8 oz ✓)
- Fever, vomiting, diarrhea: drink plenty, don't wait for signs; watch children and older adults: `mlp-dehyd-ency` ✓
- Pregnant or breastfeeding need more: `nhs-drinks`, `cdc-store`, `ready-water` ✓
- Under 5s and over 65s at higher risk: `nhs-dehyd`, `nhs-heat` ("aged 65 and over"; "aged 5 years and under") ✓
- Babies 6–12 months may have 4–8 oz (118–237 mL) of water a day: `cdc-infant` ✓
- Keep breastfeeding or formula, small amounts more often: `nhs-dehyd` ✓
- Too much water can cause hyponatremia: `cdc-yb-heat` ✓; alcohol does not add to body water: `mlp-water` ✓

**Page 1.5 — Animals** (+ `AnimalWater.astro`)
- Pets: 2 weeks of water at home, 3 days if leaving; livestock 1–2 weeks, more for heat; camp stove + 2 gal (7.6 L) fuel or generator for a well: `fema-cert-animal` (checklists p. 29–30) ✓
- Bowl and several days' supply: `ready-pets` ✓; livestock destinations need water: `ready-pets` ✓
- Dog 63–73 mL/kg/day on dry food (1.0–1.1 fl oz/lb): `zanghi2018` ✓ (note: this is *total* water intake; it is close to drinking water on dry food)
- Cat 50–60 mL/kg (0.8–0.9 fl oz/lb): `kosmal2025` (NRC) ✓
- Rabbit about 120 mL/kg (1.8 fl oz/lb); drinks more on dry pellets: `suckow-rabbit` ✓
- Horse 30 L (7.9 gal); nursing mare +37–74%, giving 52 L (13.8 gal): `freeman2021` ✓
- Goat in heat 7.4 L (2 gal); milking goat 15.3 L (4 gal); sheep about 2× in warm weather; sheep 2.18 L (0.58 gal): `perez2023` ✓
- Growing pig 7.1 L (1.9 gal): `schale2023` Table 3 "7.1 ± 2.4" ✓
- Dog example: 20 kg × 63–73 mL = 1.26–1.46 L, about 1.3–1.5 L (0.33–0.39 gal); ×14 = 17.6–20.4 L, about 18–20 L (4.7–5.4 gal, about 5) ✓; 20 kg = 44 lb ✓; 10 L = 2.6 gal ✓

**Page 1.6 — Hidden water** (+ `HiddenWater.astro`)
- Safe: water heater (if not damaged), pipes, melted ice (made with clean water), canned fruit or vegetable liquid: `fema-ayr` table, `rc-foodwater`, `cdc-find` ✓
- Tap water heater, not the heating-system tank: `cdc-find` ✓
- Toilet tank only if clear with no cleaner (page adds "treat", which is the conservative choice and matches the conflicts table): `cdc-find` ✓
- Never: toilet bowl, radiators or boilers (not even for hygiene), waterbed (fungicides, vinyl chemicals): `fema-ayr`, `cdc-safe`, `rc-foodwater` ✓; pool or spa for hygiene and cleaning only: `cdc-find` ✓; fuel or chemicals, do not use: `cdc-find` ✓
- Drain sequence (power or gas off → close intake → open hot tap → drain at bottom; refill before power or gas goes back on; a professional relights gas): `fema-ayr`, `rc-foodwater`, `ready-safety` ✓
- Pipes: open the highest tap, collect from the lowest: `fema-ayr`, `rc-foodwater` ✓
- Treat if in doubt: `ready-water`, `who-hum` ✓

**Page 1.7 — Main valve** (+ `MainValve.astro`)
- Everyone should learn; tag it; cracked lines may pollute; keep off until authorities say safe; gravity drains heater and toilet tanks: `ready-safety`, `fema-ayr` ✓
- Not the street valve in the cement box (special tool): `fema-ayr` ✓
- Test: may be rusted open or only partly close; replace: `fema-ayr` ✓
- Close on reports of broken water or sewage lines or official advice: `rc-foodwater`, `fema-ayr` ✓; CDC reason: `cdc-find` ✓
- Outdoor taps: close the inside valve, open the outside tap, leave it open so water can expand; no open flame to thaw: `rc-frozen` ✓

**Page 1.8 — Planner** (+ `WaterCalc.astro`)
- 1 gal per person per day, 3 days, 2 weeks, double in heat, replace self-filled water every 6 months, keep store-bought water sealed, store as much as you can: `cdc-store`, `ready-water`, `rc-foodwater`, `rc-kit` ✓
- Formula: people × days × 1 gal (×2 people only if hot) + (dog kg × 73 + cat kg × 60) mL × days ✓; lb→kg 0.45359237 ✓; 5 gal = 18.9 L (19) ✓; 55 gal = 208.2 L (208) ✓
- Default 4 × 14 = 56 gal = 212 L; 4 gal (15 L)/day; 12 jugs; 2 drums ✓. Quick table `Math.round(p*d*3.785)` ✓ (spot-checked 1×3 = 11 L, 6×30 = 681 L)

**Page 1.9 — Running low** (+ `LowWaterPlan.astro`)
- Never ration unless authorities say so; drink today's need, find more tomorrow; reduce activity and stay cool: `ready-water`, `fema-ayr`, `rc-foodwater` ✓
- Never less than 1 quart (4 cups; 0.95 L): `fema-ayr` ✓
- Drink known-safe water first; put off suspicious water but don't dehydrate: `fema-ayr` ✓
- Carbonated drinks don't count: `fema-ayr` ✓; avoid alcohol and caffeine in heat: `nhs-heat`, `ready-water` ✓
- No salty food; salt-free crackers, whole-grain cereal, canned food with liquid: `rc-foodwater` ✓
- Shade 11 am–3 pm: `nhs-heat` ✓

**Page 1.10 — Review**
- Checklist items match the verified facts ✓
- Quiz: Q1 answer 2 (1 gal) ✓; Q2 answer 1 (False) ✓; Q3 answer 3 (radiator) ✓ (the other 3 are listed as safe in `fema-ayr`); Q4 answer 1 (house valve) ✓; Q5 answer 1 ✓. Each question has exactly one correct option.
- References: all 34 IDs in the pages' front-matter appear in References. Titles, orgs, dates and URLs match the sources as opened (dates re-checked: `who-san` 5 Nov 2026, `who-dw` 13 Sep 2023, `who-hum` 7 Jan 2005, `ready-kit` 07/01/2026, `cdc-safe` Sept 19, 2024 at `/about/index.html`). Sources in the notes but not cited (`cdc-nchs242`, `cdc-yb-alt`, `bmcpreg2019`, `ready-heat`) are correctly left out. **To add after fixes:** the CDC breastfeeding travel page (C1) and a scald source (M2).

**Unit conversions:** every gal↔L, oz↔mL, kg↔lb, qt↔L, cup↔mL and °F↔°C pair on the pages and diagrams was recomputed. All are correct within rounding except m5 (3.8 vs 3.785).

**No myths found.** No "some people say". The pregnancy and breastfeeding litre figures (unverified) were correctly left off the pages. The altitude advice (no source) was correctly left out.

---

## Sources I could not open (or opened only by another route)

- **ready.gov, cdc.gov, fema.gov** with curl: Akamai "Access Denied" (403). All were then read with WebFetch (HTML). The two FEMA PDFs (`fema-ayr`, `fema-cert-animal`) were downloaded through WebFetch and text-extracted locally. **All verified.**
- **redcross.org** with WebFetch: 403. Read with curl instead (`rc-kit`, `rc-frozen` HTML; `rc-foodwater` PDF). **All verified.**
- **PMC** `schale2023`, `elsabry2023`, `suckow-rabbit` with curl: reCAPTCHA page. Read with WebFetch. **All verified.**
- **CPSC Publication 5098** (proposed scald source for M2): found by search only. The PDF text was not read. **Not verified.**
- Not cited by the chapter and not checked: Sphere Handbook, WHO Technical Note 9, National Academies DRI report, FM 21-76, extension/USDA livestock tables, AVMA (the research notes say these hosts are blocked).

---

## Fixes applied (2026-11-14)

Applied by the polish/fix agent, using the editor's decisions. Build passes (`astro build` into a scratch folder). Changed diagrams were checked at 390 px in light and dark mode. All 10 pages are now `status: checked`.

| Issue | What changed |
|---|---|
| **C1** | 1.4 Baby detail → "Baby sick? Keep up breast milk or formula, little and often. Breastfed under 6 months: no water. On formula: sips of boiled, cooled water." Don't → "Give **water** to a breastfed baby under 6 months". Alt text updated. New source `cdc-bf-travel` (CDC, Feb 13, 2026, read on cdc.gov: "Breastfed babies younger than 6 months do not need to drink water or any other liquids, even in hot weather.") added to 1.4 front-matter, the Review page sources and References, and `ch01-facts.md` (source table, P4, Conflicts). |
| **M1** | 1.9 step → "Use untreated water only for laundry and bathing." / detail "Not for hands, dishes, food or teeth. Treat it first (see 4.3 and 4.4)." Step label `Wash` → `Laundry`. Scenario → "You save the creek water for laundry." Alt text updated. `cdc-safe` added to 1.9 sources. `LowWaterPlan.astro`: heading "laundry & bathing only", ✓ "laundry", ✕ "drinking, hands, dishes"; desc lists drinking, hands, dishes, food and teeth. |
| **M2** | Scald warning **verified** on Tier 1 sources: `ready-burns` (Ready.gov "Preventing and Treating Burns", updated 08/31/2023: "Set your water heater's thermostat to 120 °F or lower to prevent scalding burns.") and `cdc-germs-home` (CDC, Mar 15, 2024: a heater at 130–140°F "increases your risk of burns"; this matters most with young children or older adults at home). 1.6 Drain detail now starts "Hot! The water can scald. An adult does this." New Do item: "Let an **adult** drain the hot heater". Scenario: "The water can scald, so you drain it yourself." `HiddenWater.astro`: a warning line under the drain strip ("Hot! The water can scald. An adult does this.") and the desc are updated. **"Let it cool first" was dropped**: no source says it (logged in the facts file). See-also 49.2 (cooling burns) added. nfpa.org and healthychildren.org are blocked by the session network; CPSC 5098 was not read. |
| **M3** | 1.2 Callout → "WHO: 7.5 L (2 gal) a day is the bare minimum for most people. … About 20 L (5.3 gal) covers basic hygiene." `DailyGallon.astro` label → "bare minimum"; desc updated. `ch01-facts.md` P2 line corrected. |
| **M4** | `AnimalWater.astro`: "Beef cattle (young), mild weather" 22 L · 5.7 gal, plus a dashed heat bar and the label "In heat: ~30 L (8 gal)". Desc updated. Page alt → "young beef cattle 22 L (30 L in heat)". Legend → "Dashed bar: extra in heat, or for a nursing mare". The bulls/heifers/steers quote and the 30.38 L/d heat figure were added to the facts file. |
| **M5** | `AnimalWater.astro`: "Meat chicken 0.15–0.35 L · 5–12 oz", plus a new row "Laying hen (1 study) ~0.5 L · 17 oz". Desc and page alt updated. The layer figure (Fujita 2001 via `elsabry2023`, re-read on PMC) was added to the facts file. |
| **M6** | 1.3 same-day box → "A baby's soft spot sinks in, or a baby has few tears or fewer wet diapers. A child seems drowsy. You feel dizzy on standing, and it does not go away." Emergency box gains "Or gets worse even after drinking." (MedlinePlus re-read). Facts file P3 updated. |
| m1 | 1.4 Do → "Working in heat: 1 cup (237 mL) every **15–20** minutes". Step title → "Working in heat? …". Scenario `move` and alt updated. `ExtraWater.astro` label and desc → "Working in heat". Facts file: "Moderate work in moderate heat". |
| m2 (caffeine) | Conflict logged in `ch01-facts.md` §3 with the decision "Skip alcohol. Go easy on caffeine; plain water is best." 1.4: Don't → "Drink **alcohol** instead of water"; new Do "Go easy on caffeine; plain **water** is best". 1.9: Don't → "Count fizzy drinks or **alcohol** as water"; new Do, same caffeine line. `LowWaterPlan.astro`: "No alcohol / less caffeine"; desc "skip alcohol, go easy on caffeine (plain water is best)". The Ready.gov "instead of drinking water" quote was added to the notes. (PROGRESS.md is outside this agent's edit scope and was not touched.) |
| m3 | 1.3 emergency box → "Has blue, grey, pale or blotchy skin or lips, or cold skin, or is hard to wake." |
| m4 | 1.8 step → "Tick "hot weather" to double the water for people." with the detail "… Animals need more in heat too (see 1.5)." Do → "Plan **double** for people in very hot weather". Quick-table note → "Hot weather: double the water for people. Add water for every animal (see 1.5)." Alt updated. |
| m5 | 1.8 Callout → "Times 3.785 (about 3.8) = liters. Example: 4 people × 14 days = 56 gallons. 56 × 3.785 = 212 L." |
| m6 | `WaterCalc.astro`: jugs and drums are now counted from the unrounded total (`Math.ceil(totalGal / 5 - 1e-9)`, same for 55). The displayed gallon total now rounds **up** (with a float tolerance), so it never reads lower than the containers imply. Re-tested: 4 × 14 = 56 gal / 212 L / 12 jugs / 2 drums ✓. 4 × 14 + dog 14.82 kg → 60.1 gal / 13 jugs (the old code showed 60 / 12). 1 × 55 days + dog 0.05 kg → 55.1 gal / 2 drums (the old code showed 1 drum). Hot 4 × 14 + dog 20 kg → 118 gal / 444 L / 24 jugs / 3 drums ✓. |
| m7 | `WaterCalc.astro`: a visible note (shown without JS too) reads "**Farm animals and rabbits:** add them by hand (see 1.5). This planner counts dogs and cats only." The pets fieldset is renamed "Dogs and cats: total weight". 1.8 step → "Add your dogs and cats by weight." / "Dogs and cats only. Add other animals by hand (see 1.5)." |
| m8 | 1.8 sources += `zanghi2018`, `kosmal2025`. |
| m9 | 1.1 sources += `cdc-safe`. |
| m10 | 1.1 legend → `{ num: '3–7', text: 'Days most people live without water' }`. |
| m11 | 1.1 Do → "Collect **enough** water first, then make it safe to drink". |
| m12 | `AnimalWater.astro`: "Horse at rest, 500 kg (1,100 lb)" and "Sheep 60 kg (132 lb), mild weather" (132 lb is the exact conversion, as in the facts file). The optional per-kg horse line was not added. |
| m13 | 1.5 scenario → "Then you start the generator outside, 20 feet (6 m) from doors and windows, to run the well." The Backup step detail adds "Generators run outside only." New source `cdc-gen` (CDC "Use a Generator Safely", Aug 26, 2026: "keep it outside at least 20 feet away from any doors, windows, or vents"), cited on 1.5 and in References. `cdc-co-psa` (CDC "Avoiding Carbon Monoxide Poisoning") was logged in the notes only. See-also 35.1 (carbon monoxide) added. |
| m14 | 1.2 Do → "Know that food and other drinks add **water** too". |
| m15 | 1.9 danger box replaced by a one-line `<Callout type="danger" title="Danger signs?">` that reads "Get help now. The full list of signs is on page 1.3." Page 1.3 is now the only home for the full list. |

**Layout fixes found in screenshots:** `AnimalWater.astro` now sits on a card panel and its row labels have a card-colored halo, so the 10 L grid lines no longer cut through the text. The new rows push the pets box and notes down (viewBox 924 → 1000). In `LowWaterPlan.astro` the canned-food column was nudged right so "less caffeine" does not touch it. In `HiddenWater.astro` the viewBox grows 884 → 918 to fit the scald line.

**Not done / open:** "Let it cool first" (no source). An extension/USDA table for laying hens and milking cows is still needed. PROGRESS.md conflict logging is outside this agent's scope.
