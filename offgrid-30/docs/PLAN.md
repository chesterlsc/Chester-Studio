# OFFGRID 30 — MASTER PLAN

> Survive 30 years without power. A visual, interactive survival book for ages 10–80.
> Read this file, PROGRESS.md and STYLE.md at the start of every session.

---

## 1. Book at a glance

| | |
|---|---|
| Parts (color groups) | 8 |
| Sections | 22 |
| Chapters | 105 |
| Pages per chapter | 10 (9 topic pages + 1 Review page) |
| Front + back matter | 5 + 3 pages |
| **Total pages** | **1,058** |
| Quizzes | 105 (one per chapter, 5 questions each) |
| 3D models (planned) | 58, each with a 2D fallback |

Page IDs: `chapter.page` (e.g. `4.3` = Chapter 4, page 3). Page `.10` is always the Review page.

**One-home rule:** every fact lives on exactly one page. Other pages link to it with a "See also" chip. Overlaps were resolved in this TOC; keep it that way when writing.

---

## 2. Page template

Every topic page (pages 1–9) has these blocks, in this order:

| # | Block | Component | Notes |
|---|---|---|---|
| 0 | Section tab + page ID | `<PageHeader>` | Color band, section icon, "Ch 4 · p3", bookmark button |
| 1 | Title + why it matters | `<PageHeader>` | Title ≤ 7 words, why ≤ 15 words |
| 2 | ✅ Do / ❌ Don't | `<DoDont>` | Two columns (stack on phone), shapes ✓ / ✕ |
| 3 | Step-by-step | `<Steps>` | Numbered step strip; tap a step to reveal detail; "I did this" ticks |
| 4 | What you need + alternatives | `<NeedList>` | Each row: item → "No X? Use Y." |
| 5 | POV scenario | `<Scenario>` | Short real-life story card, "you" voice |
| 6 | Main visual | `<Figure>` / `<Model3D>` | SVG diagram, labeled illustration, chart or 3D. 3D always has 2D fallback |
| 7 | Legend | `<Legend>` | Only symbols used on this page |
| + | Optional | `<Warning>`, `<RedFlag>`, `<SeeAlso>`, `<BeforeAfter>`, `<Compare>`, `<Video>`, `<Checklist>` | Use only when they add something |

On phone the **Main visual moves to just under the title** (visual first). On desktop it sits beside the steps.

**Review page (page 10 of every chapter):**
1. Chapter recap as a tickable checklist (one line per page)
2. Quiz: 5 questions (multiple choice / true-false / tap-the-picture), instant feedback with a link to the page that answers it
3. References: numbered list (org/author, title, year, URL, date checked)
4. Image & video credits

### MDX front-matter schema
```yaml
id: "4.3"
chapter: 4
page: 3
section: water
title: "Boiling: the gold standard"
why: "Boiling kills almost every germ in water."
tags: [boil, treatment, altitude]
visual: { type: svg | image | 3d, file: "…", fallback: "…", alt: "…" }
sources: [r1, r4]          # chapter reference IDs (not shown on page)
seeAlso: ["4.4", "35.1"]
status: draft | checked | done
lastChecked: 2026-11-14
```

---

## 3. Design system

### 3.1 Look & feel
**Premium printed field guide + modern app.** Warm paper, strong ink, thumb-index color tabs on the page edge, numbered step strips, labeled cut-away diagrams. Calm, sturdy, trustworthy. No camo, no "doomsday" styling.

### 3.2 Parts, sections, colors, icons
Palette is based on **Okabe–Ito** (the standard colorblind-safe set). Colors are tuned for text contrast; color is always paired with an icon + section name.

| Part | Color (base / text-safe) | Sections → icon |
|---|---|---|
| 1 WATER | Blue `#0072B2` / `#005A8C` | Water → droplet |
| 2 FOOD | Bluish green `#009E73` / `#00704F` | Food & farming → sprout · Cooking & preservation → pot |
| 3 SHELTER & ENERGY | Orange `#E69F00` / `#8F5A00` | Shelter & building → house · Fire & heat → flame · Power alternatives → bolt · Tools & DIY → wrench |
| 4 HEALTH | Vermillion `#D55E00` / `#A34700` | Medicine & first aid → cross · Herbal & field medicine → leaf · Hygiene & sanitation → hands |
| 5 FAMILY & CARE | Reddish purple `#CC79A7` / `#8E4A72` | Babies & kids → baby · Women's health → heart-flower · Elderly care → cane · Dogs & pets → paw |
| 6 SAFETY & RESOURCES | Yellow `#F0E442` (band only, black text) / `#6B6200` | Home security → shield · Scavenging & salvage → crate · Trade & barter → scale |
| 7 FIND YOUR WAY | Sky blue `#56B4E9` / `#1F6E99` | Navigation → compass · Communication → radio |
| 8 MIND & FUTURE | Ink `#2B2B2B` + slate `#5B6B7A` | Mental health → mind · Community & leadership → people · 30-year strategy → road |

**Neutrals:** paper `#FAF7F0`, card `#FFFFFF`, ink `#16181A`, muted ink `#4A4F55`, rule `#D9D3C7`.
**Dark mode:** night `#0E1012` (near-black saves battery on OLED), card `#1A1D20`, text `#F2EFE8`, section colors lightened to keep ≥ 4.5:1.

**Signal colors (always with a shape):**
| Meaning | Shape | Color |
|---|---|---|
| Do / correct | ✓ in circle | green `#00704F` |
| Don't / wrong | ✕ in square | vermillion `#A34700` |
| Caution | ▲ triangle | yellow `#F0E442` fill, black ink |
| Danger / call for help | ⬣ octagon | black fill, white text |
| Tip | ◆ diamond | blue `#005A8C` |

### 3.3 Typography (self-hosted, open license, cached offline)
- **Headings:** Barlow Condensed (SemiBold/Bold) — field-guide feel, fits long titles on phones.
- **Body & UI:** Atkinson Hyperlegible Next — designed by the Braille Institute for low-vision readers; clear 1/l/I and 0/O.
- **Numbers in tables/diagrams:** Atkinson Hyperlegible Mono.
- Scale (phone → desktop): body **18 → 20px**, line-height 1.55, max 65ch · h1 34 → 48 · h2 26 → 32 · h3 21 → 24 · captions 16px (minimum).

### 3.4 Layout & spacing
8px grid · page gutter 16px phone / 32px desktop · cards radius 12px · touch targets ≥ 48px · section color tab fixed on the right edge (desktop) / top band (phone).

### 3.5 Icon set
One custom SVG set, 24px grid, 2px stroke, rounded joins, works at 20–64px. Groups: 22 section icons · signal icons (do, don't, caution, danger, tip) · need-list icons (tool, material, time, people, skill level) · legend symbols (water flow arrow, heat, cut line, fold, tie, measure, ground, north arrow) · UI (bookmark, search, print, lite mode, 3D, play).

### 3.6 Diagram style
Flat fills from the section palette at 15–30% tint, 2px ink outlines, labels on the drawing, numbered step circles, a scale reference (hand/person/ruler), wrong-vs-right pairs where mistakes are common. SVGs are inline and themable (use CSS variables so dark mode and print just work).

### 3.7 Interaction
Tap-to-reveal steps · tickable checklists (saved locally) · before/after slider · comparison toggles · quiz with instant feedback · 3D viewer with rotate / zoom / step-through and a "2D" toggle.

---

## 4. Tech plan

| Need | Choice | Why |
|---|---|---|
| Framework | **Astro** (static) + MDX | Ships zero JS by default → fast on cheap phones; great for 1,000+ content pages |
| Interactive islands | React (only where needed) | Quiz, steps, checklists, sliders hydrate on demand |
| 3D | React Three Fiber + drei, loaded **only on tap** (`client:only` + lazy) | Keeps pages light; never loads in Lite mode |
| Content | `src/content/chapters/NN-slug/pp-slug.mdx` with typed schema (Astro content collections) | Validates the template on build |
| Search | **Pagefind** | Static index, works offline once cached |
| Offline / PWA | `@vite-pwa/astro` (Workbox) | Precache app shell + search; cache pages as read; "Download whole book" button |
| Bookmarks, checklists, quiz scores, settings | `localStorage` (wrapped in try/catch) | No account, no server |
| Dark mode | CSS variables + toggle (system default) | |
| **Lite mode** (low battery) | Toggle + auto-suggest when Battery API reports < 20% | True-black theme, no 3D, no animation, no images over 50KB |
| Print / PDF | Print stylesheet per page & chapter; full-book PDF built with Playwright at build time | Paper copy matters when there's no power |
| Hosting | Static build → `offgrid-30/dist`, deployable to any static host | |

**Performance budget per page:** ≤ 120KB transferred (excluding 3D), LCP < 2.5s on slow 4G, Lighthouse a11y = 100.

---

## 5. Production loop (per chapter)

research → write → visuals → fact-check → polish → update PROGRESS.md → commit.
Subagents get **only** their chapter's TOC entry + STYLE.md. Report progress every 5 chapters.

---

## 6. Full table of contents

Legend: **[3D]** = interactive 3D model planned (with 2D fallback). Every chapter's page **.10 = Review: checklist · quiz · references**.

### FRONT MATTER
- FM.1 How to use this book
- FM.2 Colors, icons & symbols
- FM.3 What keeps you alive: survival priorities
- FM.4 Your first 72 hours without power
- FM.5 Limits of this book & when to get expert help

---

## PART 1 — WATER (blue)

### Section: Water

**Ch 1. Water Basics: How Much You Need**
1. Why water comes first
2. How much water each person needs a day
3. Signs of dehydration at any age
4. Who needs extra water
5. Water for pets and farm animals
6. Hidden water already in your home
7. Shutting off your home's water safely
8. Your daily water budget planner
9. When water runs low: what to do

**Ch 2. Storing Water**
1. Choosing safe containers
2. Cleaning and sanitizing containers
3. Filling and treating water for storage
4. Where to keep stored water
5. Rotating stored water
6. Big storage: barrels, totes and tanks
7. Building a cistern
8. Keeping out mosquitoes and algae
9. Protecting water from freezing

**Ch 3. Finding Water**
1. Water sources ranked: safest to riskiest
2. Springs: finding and protecting them
3. Streams, rivers and lakes
4. Reading the land for water
5. Dew and condensation: what really works
6. Melting snow and ice safely
7. Water from plants
8. Water you must never drink
9. Checking water quality without a lab

**Ch 4. Making Water Safe**
1. The 3 dangers: germs, chemicals, dirt
2. Settling and cloth pre-filtering
3. Boiling: the gold standard
4. Bleach disinfection: dose chart
5. Tablets, iodine and pool shock
6. Solar disinfection (SODIS)
7. Store-bought filters: what they remove
8. Keeping clean water clean
9. What treatment cannot remove

**Ch 5. Building Water Filters**
1. How filters work: the layers explained
2. Biosand filter: build it **[3D]**
3. Biosand filter: run and maintain it
4. Ceramic pot filter **[3D]**
5. Two-bucket cartridge filter **[3D]**
6. Making activated charcoal
7. Emergency gravel-sand-charcoal filter and its limits **[3D]**
8. Distilling salty or chemical water **[3D]**
9. Filter troubleshooting

**Ch 6. Rainwater Harvesting**
1. How much rain your roof can catch
2. Safe and unsafe roof materials
3. Gutters and downspouts
4. First-flush diverter: build it **[3D]**
5. Sizing your tank
6. Screens, inlets and overflow
7. Treating rainwater for drinking
8. Rainwater laws
9. Year-round rain system care

**Ch 7. Wells & Pumps**
1. Well types: dug, driven, drilled
2. Why hand-digging a well is dangerous
3. Driving a sand-point well **[3D]**
4. Protecting a well from pollution
5. Shock-chlorinating a well
6. Hand pumps for existing wells
7. Bucket, rope and windlass
8. Rope pump: build it **[3D]**
9. Gravity-fed water systems

---

## PART 2 — FOOD (bluish green)

### Section: Food & farming

**Ch 8. Nutrition to Stay Alive**
1. Calories: how much each person needs
2. Protein, fat and carbs made simple
3. Vitamins and minerals you can't skip
4. Deficiency diseases: scurvy, pellagra, beriberi, rickets
5. Feeding kids, elders, pregnant and nursing people
6. Complete-protein combos
7. Salt and iodine
8. Signs of malnutrition
9. Planning a balanced survival diet

**Ch 9. Food Storage & Stockpiles**
1. What to store first
2. Shelf-life chart
3. Mylar bags and oxygen absorbers
4. Buckets and sealing
5. Stopping rodents, weevils and moths
6. Cool, dark, dry storage spaces
7. Rotation: first in, first out
8. Tracking your inventory
9. Spotting spoiled stored food

**Ch 10. Starting a Survival Garden**
1. Picking a garden site
2. How much garden feeds one person
3. Highest-calorie crops
4. Beds: in-ground, raised, containers
5. Hand tools for gardening
6. Planting calendar by climate
7. Sowing seeds and transplanting
8. Watering with less water
9. Crop rotation and spacing

**Ch 11. Soil & Compost**
1. Know your soil: the jar test
2. Soil pH and how to fix it
3. Compost basics: greens and browns
4. Building a 3-bin compost **[3D]**
5. Hot composting
6. Worm composting
7. Using animal manure safely
8. Cover crops and green manure
9. Mulch: what and how

**Ch 12. Seeds: Saving & Storing**
1. Open-pollinated, hybrid and heirloom
2. Easiest seeds to save
3. Cross-pollination and isolation distances
4. Wet seed processing
5. Dry seed processing
6. Drying and storing seeds
7. Germination test
8. How long seeds stay alive
9. Building a 30-year seed bank

**Ch 13. Grains, Fruit Trees & Perennials**
1. Growing grain on a small plot
2. Harvesting, threshing and winnowing
3. Grinding grain into flour
4. Growing dry beans at scale
5. Planting fruit trees
6. Pruning and grafting
7. Berry bushes and vines
8. Perennial vegetables
9. Cold frames and row covers

**Ch 14. Protecting Crops**
1. Identifying common pests
2. Barriers: row covers and fences
3. Hand-picking and traps
4. Helpful insects
5. Plant diseases: blight, mildew, rot
6. Keeping out deer, rabbits and birds
7. Homemade sprays that are proven safe
8. Weed control without chemicals
9. Backup plan for crop failure

**Ch 15. Raising Chickens**
1. Why chickens
2. Best breeds for survival
3. Building a coop **[3D]**
4. Feeding without store feed
5. Water and winter care
6. Predator protection
7. Hatching chicks
8. Common health problems
9. Butchering a chicken humanely

**Ch 16. Rabbits, Goats, Ducks & Bees**
1. Choosing animals for your space
2. Rabbits: housing and breeding
3. Rabbits: feeding (and why lean meat isn't enough)
4. Goats: housing and fencing
5. Goats: milking and milk safety
6. Ducks
7. Bees: honey and pollination
8. Animal health and diseases people can catch
9. Butchering rabbits and goats humanely

**Ch 17. Foraging Wild Food**
1. Golden rule: when in doubt, leave it out
2. The Universal Edibility Test and its limits
3. Deadly lookalikes
4. Common edible greens
5. Nuts and acorns (and leaching)
6. Berries: safe and poisonous
7. Roots and tubers
8. Mushrooms: why beginners shouldn't
9. Foraging calendar by season

**Ch 18. Hunting, Trapping & Fishing**
1. Laws, ethics and safety
2. Hunting basics
3. Snares and legal traps
4. Tracks and signs
5. Fishing gear and improvised hooks
6. Fish traps and nets
7. Field dressing game
8. Insects as food
9. Diseases from wild meat

### Section: Cooking & preservation

**Ch 19. Cooking Without Power**
1. Cooking methods compared
2. Rocket stove: build it **[3D]**
3. Cooking on a wood stove
4. Solar cooker: build it **[3D]**
5. Haybox (retained-heat) cooking
6. Dutch oven and campfire cooking
7. Earth or clay oven: build it **[3D]**
8. Fuel-saving tricks
9. Baking bread without electricity

**Ch 20. Food Safety & Kitchen Hygiene**
1. The danger zone
2. Safe cooking temperatures
3. Clean, separate, cook, chill
4. Washing dishes without running water
5. Botulism: the hidden killer
6. Storing leftovers safely
7. Cooking safely for a crowd
8. Keeping pests out of the kitchen
9. Handling fresh meat after butchering

**Ch 21. Canning**
1. Water-bath vs pressure canning
2. Equipment and what can be reused
3. Water-bath canning step by step
4. Pressure canning step by step
5. Altitude adjustments
6. Canning on a wood or rocket stove
7. Use tested recipes only
8. Checking seals and storing jars
9. Canning failures and what to do

**Ch 22. Drying & Smoking**
1. How drying keeps food
2. Solar dehydrator: build it **[3D]**
3. Drying fruit and vegetables
4. Making jerky safely
5. Cold vs hot smoking
6. Building a smokehouse **[3D]**
7. Drying herbs for cooking
8. Storing dried food
9. Rehydrating and cooking dried food

**Ch 23. Salting, Fermenting & Curing**
1. Salt curing basics
2. Sauerkraut step by step
3. Lacto-fermented vegetables
4. Pickling with vinegar
5. Making vinegar
6. Sourdough starter
7. Yogurt and simple cheese
8. Salt-curing meat and fish
9. Fermentation safety: good vs bad signs

**Ch 24. Root Cellars & Cold Storage**
1. How a root cellar works
2. Building a root cellar **[3D]**
3. Simple versions: buried barrel, clamp, trench
4. Which crops store best
5. Ice house and harvesting ice
6. Clay-pot cooler (zeer pot) **[3D]**
7. Springhouse and cool-water storage
8. Storing eggs without a fridge
9. Checking temperature and humidity

---

## PART 3 — SHELTER & ENERGY (orange)

### Section: Shelter & building

**Ch 25. Shelter Basics**
1. How your body loses heat
2. Choosing where to live long-term
3. Stay home or leave?
4. Making one room warm
5. Insulating with what you have
6. Staying cool without power
7. Ventilation and damp control
8. Tarp shelters **[3D]**
9. Debris hut **[3D]**

**Ch 26. Knots & Lashings**
1. Rope basics and words to know
2. Square (reef) knot **[3D]**
3. Bowline **[3D]**
4. Clove hitch **[3D]**
5. Taut-line hitch **[3D]**
6. Trucker's hitch **[3D]**
7. Sheet bend **[3D]**
8. Square lashing **[3D]**
9. Tripod lashing **[3D]**

**Ch 27. Building Basics**
1. Reading a building site
2. Simple foundations
3. Framing basics **[3D]**
4. Measuring and squaring by hand (3-4-5)
5. Roofs: slope and materials
6. Doors and windows
7. Loads and spans made simple
8. Ladder and height safety
9. Weatherproofing

**Ch 28. Natural Building**
1. Choosing a method for your climate
2. Log cabin **[3D]**
3. Cob
4. Straw bale
5. Adobe bricks
6. Rammed earth
7. Wattle and daub
8. Thatch and sod roofs
9. Lime plaster

**Ch 29. Home Repair & Maintenance**
1. Fixing roof leaks
2. Broken windows
3. Plumbing without water pressure
4. Rot and termites
5. Sticking doors and hinges
6. Gutters and drainage
7. Removing mold safely
8. Chimney care
9. Seasonal home checklist

**Ch 30. Disasters & Your Home**
1. Hurricanes and high wind
2. Floods
3. Earthquakes
4. Wildfire: defensible space
5. Winter storms
6. Tornadoes
7. Building a safe room
8. Checking damage after a disaster
9. Sheltering in place

**Ch 31. Outbuildings & Land Works**
1. Woodshed
2. Workshop
3. Greenhouse: build it **[3D]**
4. Fence types
5. Gates
6. Barns and animal shelters
7. Paths and drainage ditches
8. Small footbridge
9. Caring for outbuildings

### Section: Fire & heat

**Ch 32. Fire Basics**
1. The fire triangle
2. Tinder, kindling, fuel
3. Fire lays: teepee, log cabin, lean-to **[3D]**
4. Matches and lighters: store them right
5. Ferro rod
6. Bow drill **[3D]**
7. Lighting fire with the sun
8. Fire in wet weather
9. Putting a fire fully out

**Ch 33. Firewood**
1. How much wood for a winter
2. Best and worst firewood
3. Felling a tree safely
4. Cutting and splitting
5. Seasoning wood until it's dry
6. Stacking and storing **[3D]**
7. Axe and saw care
8. Coppicing for endless wood
9. Other fuels: charcoal, dung, briquettes

**Ch 34. Heating Your Home**
1. Wood stoves: choosing and safe clearances
2. Getting more heat from a fireplace
3. Rocket mass heater **[3D]**
4. Masonry heater
5. Heating just one room
6. Passive solar heating
7. Staying warm without heat: layers and sleep
8. Hot water bottles and bed warming
9. Solar water heater

**Ch 35. Fire & Carbon Monoxide Safety**
1. Carbon monoxide: the silent killer
2. CO poisoning: signs and what to do
3. Never use these indoors
4. Chimney fires
5. Extinguishers and other ways to fight fire
6. Home fire escape plan
7. Battery smoke and CO alarms
8. If clothes catch fire
9. Safe lamps and candles

### Section: Power alternatives

**Ch 36. Power Basics**
1. Volts, amps and watts made simple
2. Your power budget
3. DC vs AC
4. Battery types
5. Making batteries last
6. Wiring safety and fuses
7. Wire size chart
8. Inverters and charge controllers
9. Living on very little power

**Ch 37. Solar Power**
1. How solar panels work
2. Sizing a small system
3. Panel placement and angle
4. Building a 100-watt kit **[3D]**
5. Portable panels and power stations
6. Solar lights and phone charging
7. Solar maintenance
8. How long panels last
9. Solar troubleshooting

**Ch 38. Wind & Water Power**
1. Is wind worth it? Site check
2. Small wind turbine basics
3. Turbine from a salvaged motor
4. Tower safety
5. Micro-hydro basics
6. Measuring head and flow
7. Water wheels for mechanical power
8. Hydraulic ram pump **[3D]**
9. Combining power sources

**Ch 39. Human & Mechanical Power**
1. Hand-crank generators
2. Bicycle generator **[3D]**
3. Treadle and pedal machines
4. Pulleys and windlasses
5. Levers
6. Animal power
7. Gravity and counterweights
8. Springs and flywheels
9. Matching the job to the power

**Ch 40. Light Without the Grid**
1. Lighting options compared
2. Oil lamps and fuels
3. Making candles
4. Rushlights and tallow
5. LED lights and batteries
6. Daylight: windows, tubes, reflectors
7. Lanterns
8. A night routine that saves light
9. Lamp oil from animal fat

### Section: Tools & DIY

**Ch 41. Essential Tool Kit**
1. The 30 most useful hand tools
2. Choosing a knife
3. Sharpening **[3D]**
4. Axes and hatchets
5. Saws
6. Hammers and pry bars
7. Shovels and digging tools
8. Measuring and marking
9. Hand-tool safety rules

**Ch 42. Tool Care & Repair**
1. Removing rust
2. Replacing a handle **[3D]**
3. Sharpening saws
4. Grinding wheels and files
5. Oiling and storing tools
6. Fixing shovels and hoes
7. Carving tool handles
8. Tool inventory
9. Protective gear

**Ch 43. Woodworking**
1. Wood types and their uses
2. Green woodworking
3. Joints without nails **[3D]**
4. Carving spoons and bowls
5. Shaving horse **[3D]**
6. Pole lathe **[3D]**
7. Simple furniture
8. Natural wood finishes
9. Making buckets and barrels

**Ch 44. Metalwork & Blacksmithing**
1. Building a simple forge **[3D]**
2. Anvil alternatives
3. Reading heat colors
4. Basic forging moves
5. Hardening and tempering
6. Making hooks, nails and simple tools
7. Cold work: drilling and riveting
8. Salvaging good steel
9. Forge safety

**Ch 45. Textiles, Rope & Leather**
1. Sewing basics and stitches
2. Mending clothes
3. Darning socks
4. Making cordage from plants **[3D]**
5. Spinning wool with a drop spindle
6. Weaving basics
7. Tanning hides
8. Sewing leather
9. Repairing footwear

**Ch 46. Practical DIY Projects**
1. Making soap
2. Making lye from wood ash
3. Glues: hide glue and pine pitch
4. Containers from salvage
5. Bicycle maintenance
6. Simple pottery and firing
7. Brooms and brushes
8. Baskets
9. Fixing a wheelbarrow or cart

---

## PART 4 — HEALTH (vermillion)

### Section: Medicine & first aid

**Ch 47. First Aid Foundations**
1. Check the scene, then the person
2. Getting help when there's no 911
3. Primary check: awake, airway, breathing
4. Recovery position **[3D]**
5. CPR for adults **[3D]**
6. CPR for children and babies
7. Choking: adults, children, babies
8. Shock: signs and care
9. Building a first aid kit

**Ch 48. Bleeding & Wounds**
1. Types of bleeding
2. Direct pressure
3. Tourniquets: store-bought and improvised **[3D]**
4. Wound packing **[3D]**
5. Cleaning a wound
6. Closing a wound: when NOT to
7. Dressings and bandages **[3D]**
8. Signs of infection
9. Head, chest and belly wounds: red flags

**Ch 49. Burns, Heat & Cold**
1. Burn types and size (palm rule)
2. Cooling and covering burns
3. Burns that need urgent care
4. Heat exhaustion vs heat stroke
5. Hypothermia
6. Frostbite
7. Trench (immersion) foot
8. Sunburn and snow blindness
9. Lightning and electric shock injuries

**Ch 50. Bones, Joints & Muscles**
1. Is it broken? Signs
2. Splinting rules
3. Improvised splints **[3D]**
4. Slings **[3D]**
5. Sprains and strains
6. Possible spine injury: when NOT to move
7. Dislocations: what to do
8. Moving an injured person **[3D]**
9. Recovery and rehab exercises

**Ch 51. Bites, Stings, Poison & Sudden Illness**
1. Severe allergy (anaphylaxis) and epinephrine
2. Asthma attack
3. Snakebite
4. Spiders and scorpions
5. Ticks: removal and disease
6. Animal bites and rabies
7. Poisoning
8. Seizures
9. Stroke and heart attack signs

**Ch 52. Infections & Fever**
1. Fever: when to worry
2. Dehydration and oral rehydration solution
3. Diarrhea and cholera
4. Chest infections and pneumonia signs
5. Sepsis warning signs
6. Skin infections and abscesses
7. Urinary tract infections
8. Eye infections
9. Antibiotics: why misuse is dangerous

**Ch 53. Outbreaks & Contagious Disease**
1. How diseases spread
2. Masks and barriers
3. Setting up an isolation room
4. Caring for a contagious person safely
5. Disinfecting with bleach
6. Mosquito-borne diseases
7. Lice and scabies
8. Why vaccines matter long-term
9. Handling the dead safely

**Ch 54. Medicines: Stock, Store, Use Safely**
1. Core medicine list
2. Reading labels and doses
3. Storing medicines
4. Expiry dates: what studies show
5. Medicines that become unsafe
6. Children's doses: safety rules
7. Interactions and allergies
8. Pain relief options
9. Keeping medical records

**Ch 55. Teeth, Eyes & Ears**
1. Daily tooth care without store toothpaste
2. Toothache first aid
3. Broken or knocked-out tooth
4. Tooth abscess danger signs
5. Temporary fillings
6. Something in the eye
7. Chemicals in the eye
8. Glasses: spares and care
9. Protecting hearing and ears

**Ch 56. Long-Term Illness Without a Pharmacy**
1. Planning ahead with your doctor
2. Diabetes
3. High blood pressure
4. Heart disease
5. Asthma and COPD
6. Thyroid conditions
7. Epilepsy
8. Mental-health medicines: never stop suddenly
9. Living with chronic pain

### Section: Herbal & field medicine

**Ch 57. Herbal Medicine: Safety First**
1. What "proven" means: evidence levels
2. Dangers: toxic plants, doses, drug mix-ups
3. Who should avoid herbs
4. Identifying plants with certainty
5. Making teas and infusions
6. Decoctions
7. Salves and infused oils
8. Poultices and compresses
9. Labeling and recording remedies

**Ch 58. Remedies With Real Evidence**
1. How to read the evidence badges
2. Honey for wounds and coughs
3. Ginger for nausea
4. Peppermint for stomach cramps
5. Aloe vera for minor burns
6. Willow bark for pain
7. Cranberry for urinary infections
8. Tea tree oil for minor skin problems
9. Remedies that don't work or cause harm

**Ch 59. Field Medicine & Improvising**
1. Medical kit from household items
2. Improvised bandages and dressings
3. Sterilizing instruments
4. Making sterile saline
5. Improvised cold and hot packs
6. Medical supplies: reuse or throw away
7. Taking vital signs by hand
8. Growing a medicine garden
9. Red flags: when home care isn't enough

### Section: Hygiene & sanitation

**Ch 60. Personal Hygiene**
1. Handwashing: when and how
2. Tippy tap: build it **[3D]**
3. Bathing with little water
4. Hair and scalp care
5. Foot care
6. Laundry by hand
7. Hand sanitizer and alternatives
8. Skin and nail care
9. Keeping bedding clean and dry

**Ch 61. Toilets & Human Waste**
1. Why poop spreads disease
2. Emergency two-bucket toilet
3. Pit latrine: build it **[3D]**
4. Ventilated (VIP) latrine **[3D]**
5. Composting toilet
6. Composting human waste safely
7. Safe distances from water
8. Using urine as fertilizer
9. Keeping toilets clean

**Ch 62. Greywater & Trash**
1. Greywater basics
2. Greywater to the garden
3. Sorting trash
4. Burning trash: the risks
5. Burying and composting waste
6. Reuse and repurpose
7. Disposing of dead animals
8. Medical waste and sharps
9. Hazardous waste: batteries and chemicals

**Ch 63. Pest & Disease Carriers**
1. Rats and mice
2. Flies
3. Mosquitoes: kill the breeding spots
4. Cockroaches
5. Ticks around the home
6. Bed bugs
7. Safe traps
8. Repellents that work
9. Pest-proofing your home

---

## PART 5 — FAMILY & CARE (reddish purple)

### Section: Babies & kids

**Ch 64. Newborn Care**
1. Baby's first day
2. Keeping baby warm (skin-to-skin)
3. Breastfeeding basics
4. When breastfeeding isn't possible
5. Cloth diapers and washing them
6. Umbilical cord care
7. Safe sleep
8. Newborn danger signs
9. Jaundice

**Ch 65. Babies & Toddlers**
1. Starting solid food
2. Homemade baby food
3. Growth and milestones
4. Teething
5. Diaper rash
6. Fever in babies
7. Dehydration in babies
8. Childproofing
9. Carrying babies: slings and wraps

**Ch 66. Children's Health & Safety**
1. Feeding growing kids
2. Common childhood illnesses
3. First aid differences for kids
4. Drowning prevention
5. Safety rules kids can learn
6. Lost-child plan
7. Kids after scary events
8. Sleep routines
9. Vaccination records

**Ch 67. Raising & Teaching Kids Off-Grid**
1. Homeschooling basics
2. Reading and math without screens
3. Survival skills by age
4. Chores by age
5. Toys from scratch
6. Games without power
7. Teens: real responsibility
8. Building a kids' learning library
9. Family emergency roles

### Section: Women's health & hygiene

**Ch 68. Periods & Intimate Health**
1. Period basics
2. Making reusable pads
3. Menstrual cups: use and clean
4. Washing and drying reusable products
5. Period pain relief
6. Heavy bleeding: when to worry
7. Tracking your cycle
8. Menopause
9. Yeast and bacterial infections

**Ch 69. Pregnancy & Childbirth**
1. Signs of pregnancy and due date
2. Eating well in pregnancy
3. Pregnancy danger signs
4. Clean birth kit
5. Stages of labor
6. Helping with a normal birth
7. The placenta and bleeding after birth
8. Birth complications: what to do
9. Caring for the mother after birth

**Ch 70. Family Planning & Lifelong Health**
1. Birth control without a pharmacy
2. Breast self-check
3. Pelvic floor health
4. Depression after birth
5. Breastfeeding and the mother's health
6. Sexual health and STIs
7. Bone health and aging
8. Keeping women's health records
9. Privacy and dignity in shared living

### Section: Elderly care

**Ch 71. Caring for Older Adults**
1. How the body changes with age
2. Food and water for older adults
3. Managing many medicines
4. Preventing falls
5. Making mobility aids: canes, crutches, walkers
6. Helping with hearing and vision
7. Heat and cold risks for elders
8. Dementia care basics
9. Keeping elders active and valued

**Ch 72. Home Nursing**
1. Setting up a sickroom and home hospital bed
2. Bathing someone in bed
3. Preventing pressure sores
4. Turning and lifting safely **[3D]**
5. Toileting and incontinence
6. Feeding and swallowing problems
7. Noticing when someone is getting worse
8. Caregiver burnout
9. Sharing care across a group

**Ch 73. End of Life**
1. Signs that death is near
2. Comfort care
3. Easing pain and breathing
4. Saying goodbye and spiritual care
5. Advance wishes
6. What to do right after a death
7. Burial: safe and legal
8. Wills and records
9. Supporting the family

### Section: Dogs & pets

**Ch 74. Dogs: Care & Feeding**
1. Feeding dogs without kibble
2. Foods that poison dogs
3. Water and shelter for dogs
4. Grooming and nail care
5. Training basics
6. Working dogs: guarding and herding
7. Exercise
8. Breeding and spaying choices
9. Caring for old dogs

**Ch 75. Pet First Aid & Health**
1. Pet first aid kit
2. Checking a pet's vital signs
3. Wounds and bleeding
4. Heatstroke and cold
5. Poisoning
6. Vaccines and rabies
7. Fleas, ticks and worms
8. Muzzling an injured dog safely
9. Humane end-of-life choices

**Ch 76. Cats & Other Pets**
1. Cats: food and toxic foods
2. Cats as pest control
3. Birds and small pets
4. Pets in an evacuation
5. Rehoming a pet
6. Feeding pets from the garden
7. Litter alternatives
8. Controlling pet numbers
9. Strays and feral animals: staying safe

---

## PART 6 — SAFETY & RESOURCES (yellow)

### Section: Home security & defense

**Ch 77. Home Security Basics**
1. Layers of security
2. Doors and locks
3. Windows
4. Lighting and clear sight lines
5. Fences and thorny hedges
6. Alarms that need no power
7. Hiding valuables
8. Keeping a low profile
9. Home security checklist

**Ch 78. Personal Safety & De-escalation**
1. Situational awareness
2. Calming a tense situation
3. Travel safety
4. Safety in groups
5. Self-defense basics: break free and escape
6. Spotting scams and manipulation
7. Firearms: law and safe storage
8. Firearm safety rules
9. Non-lethal tools and the law

**Ch 79. Neighborhood Watch**
1. Organizing a watch
2. Watch schedules
3. Signals and alerts
4. Rally points
5. Logging and reporting incidents
6. Meeting strangers and refugees humanely
7. Settling disputes between neighbors
8. Self-defense law: what's allowed
9. Watch review checklist

**Ch 80. Emergency Plans & Drills**
1. Family emergency plan
2. Go-bags for everyone
3. Bug in or bug out?
4. Evacuation routes
5. Meeting places
6. Important documents
7. Vehicle emergency kit
8. Home inventory for disasters
9. Running drills

### Section: Scavenging & salvage (abandoned / legal)

**Ch 81. Salvaging Legally & Safely**
1. The law: abandoned vs owned
2. Getting permission and keeping records
3. Protective gear
4. Building dangers: collapse, asbestos, mold
5. Chemical and biological dangers
6. Needles and sharp objects
7. Always work in pairs
8. What to look for first
9. Leave no damage

**Ch 82. What to Salvage & How**
1. Metals
2. Wire and electrical parts
3. Car parts
4. Motors from appliances
5. Lumber and building materials
6. Fabric and clothing
7. Plastic containers and tarps
8. Glass and jars
9. Tools and hardware

**Ch 83. Turning Salvage Into Gear**
1. Car batteries for solar storage
2. Pallets
3. Tires
4. Barrels and drums
5. Old windows into cold frames
6. Bikes into machines
7. Electronics for parts
8. Fabric scraps
9. Sorting and storing salvage

### Section: Trade & barter

**Ch 84. Barter Basics**
1. How barter works
2. Setting up a trade inventory
3. Fair trades and value charts
4. Negotiating
5. Trade safety
6. Trust and reputation
7. Markets and trade days
8. Keeping trade records
9. Credit and IOUs

**Ch 85. Skills as Currency**
1. Most valuable skills
2. Pricing your work
3. Teaching as trade
4. Repair services
5. Medical skills: ethics and limits
6. Selling food you grow
7. Apprenticeships
8. Building a reputation
9. Cooperatives

**Ch 86. Long-Term Trade Goods**
1. Salt, sugar and honey
2. Seeds
3. Soap and hygiene goods
4. Tools and hardware
5. Fabric and thread
6. Alcohol: uses and risks
7. Medicines: why not to trade them
8. Batteries and light
9. Producing goods to trade

---

## PART 7 — FIND YOUR WAY (sky blue)

### Section: Navigation

**Ch 87. Maps**
1. Why paper maps matter
2. Reading a topographic map
3. Contour lines
4. Scale and distance
5. Grid references
6. Drawing your own map
7. Mapping your community
8. Protecting maps
9. Planning a route

**Ch 88. Compass & Natural Navigation**
1. Parts of a compass **[3D]**
2. Taking a bearing
3. Declination
4. Finding where you are (triangulation)
5. Shadow-stick and sun direction
6. Stars: North Star and Southern Cross
7. The moon
8. Nature clues: what works and what's a myth
9. Pace counting

**Ch 89. Travel & Distance**
1. Walking long distances
2. Carrying loads: packs and carts
3. Bicycles for transport
4. Horses and pack animals
5. Boats and canoes
6. Crossing rivers safely
7. If you're lost: STOP
8. Signaling for rescue
9. Traveling at night

### Section: Communication (radio)

**Ch 90. Radio Basics**
1. How radio works
2. Frequencies and bands
3. Licenses and the law
4. Choosing radios
5. Antennas
6. Powering radios
7. Radio manners and the phonetic alphabet
8. Emergency channels
9. Listening: AM, FM, shortwave, weather radio

**Ch 91. Ham Radio**
1. Getting licensed
2. HF vs VHF/UHF
3. Repeaters
4. Building a dipole antenna **[3D]**
5. Nets and schedules
6. Morse code
7. Digital messages over radio
8. Grounding and lightning protection
9. Radio care

**Ch 92. Low-Tech Communication**
1. Signal mirrors and flags
2. Whistle codes
3. Message boards and runners
4. Logbooks and written records
5. Privacy codes and the law
6. Community bulletin board
7. Smoke and fire signals
8. Bells and sound signals
9. A local courier system

**Ch 93. Information & Knowledge**
1. Staying informed
2. Checking rumors
3. A community reference library
4. Copying and preserving knowledge
5. Saving digital files for decades
6. Passing on skills
7. Local news sharing
8. Emergency alerts
9. Records that last 30 years

---

## PART 8 — MIND & FUTURE (ink / slate)

### Section: Mental health

**Ch 94. Stress & Shock**
1. What stress does to body and mind
2. Psychological first aid
3. Breathing to calm down
4. Grounding techniques
5. Sleep
6. Daily routine
7. Panic attacks
8. Anger
9. When stress becomes dangerous

**Ch 95. Depression, Anxiety & Trauma**
1. Signs of depression
2. Anxiety
3. Trauma and PTSD signs
4. Suicide: warning signs and what to do
5. Talking with someone in crisis
6. Alcohol, drugs and withdrawal
7. Severe mental illness: how to help
8. Grief and loss
9. Building resilience

**Ch 96. Everyday Wellbeing**
1. Purpose and meaning
2. Exercise
3. Staying connected
4. Music, art and stories
5. Faith and reflection
6. Journaling and gratitude
7. Boredom
8. Isolation and loneliness
9. Hope and goals

**Ch 97. Family & Relationships Under Pressure**
1. Talking so families listen
2. Resolving conflict
3. Helping kids with big feelings
4. Couples under stress
5. Blended and chosen families
6. Privacy and personal space
7. Domestic violence: signs and getting help
8. Rituals and celebrations
9. Forgiveness and repair

### Section: Community & leadership

**Ch 98. Building a Community**
1. Why groups survive better
2. Finding and choosing people
3. Skills inventory
4. Sharing resources
5. Running good meetings
6. Making decisions together
7. Rules and agreements
8. Welcoming newcomers
9. Community map and roles

**Ch 99. Leadership**
1. What good leaders do
2. Leading in a crisis
3. Delegating
4. Making hard decisions
5. Fairness and trust
6. Handling complaints
7. Leading volunteers
8. Preventing abuse of power
9. Planning who leads next

**Ch 100. Conflict, Justice & Fairness**
1. Mediation step by step
2. Rules and consequences
3. Fair food sharing
4. Theft
5. Restorative justice
6. Land and water disputes
7. Protecting vulnerable people
8. Transparency and records
9. Working with authorities

**Ch 101. Community Systems**
1. Shared work days
2. Community kitchen
3. Community health post
4. Community school
5. Tool library
6. Water committee
7. Emergency response team
8. Celebrations and culture
9. Relations with nearby communities

### Section: 30-year long-term strategy

**Ch 102. The First Year**
1. The phases: day, week, month, year
2. Priorities map
3. Month-by-month plan for year one
4. Learning skills fast
5. Starting food production
6. Securing water long-term
7. Preparing for the first winter
8. Health baseline for everyone
9. Year-one review

**Ch 103. Years 2–10: Becoming Self-Reliant**
1. Scaling up food
2. Growing your animal herd
3. Perennial food systems
4. Making your own tools and materials
5. Replacing worn-out goods
6. Training new people
7. Building permanent structures
8. Energy over a decade
9. Five-year review

**Ch 104. Years 10–30: Lasting a Generation**
1. What runs out, and when
2. Keeping soil fertile for decades
3. Keeping seeds and animals genetically healthy
4. Passing on knowledge
5. When your group grows older
6. Rebuilding infrastructure
7. Medicine over the long term
8. Keeping history and records
9. Handing over to the next generation

**Ch 105. Planning Toolkit**
1. Household self-check
2. Seasonal task calendar
3. Inventory templates
4. Skills tracker
5. Risk assessment
6. Resource budget
7. Family plan template
8. Community plan template
9. The 30-year master checklist

---

### BACK MATTER
- BM.1 Glossary (every technical term, plain words)
- BM.2 How we check facts
- BM.3 Master source list
