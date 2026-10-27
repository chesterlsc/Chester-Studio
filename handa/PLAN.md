# HANDA (prepare.ph) — Build plan

> Captain's plan. Written before code. Decisions that the brief left open are marked **[call]** with the reasoning.

## 0. Where this lives

This repo is the Chester Studio portfolio site (GitHub Pages at the root). **[call]** HANDA is built as a self-contained app in `handa/` so nothing at the root breaks. It deploys on its own (Cloudflare Pages or Netlify, free tier) to `prepare.ph`. The root site is untouched.

## 1. One line

Game-like home-readiness app for Filipino families: pick a scenario → pick a duration → set your household → START → stock a 3D house until the meter is full → share a Ready Card.

## 2. Stack

| Layer | Choice | Why |
|---|---|---|
| App | Vite 8 + React 19 + TypeScript | Fast dev, small bundles, route code-splitting is trivial. |
| Routing | react-router 7 (data-less, lazy routes) | Each tab/screen is its own chunk. |
| State | Zustand (UI + session) + Dexie (IndexedDB) | Local-first by default; Dexie gives us a real queryable store that survives offline. |
| 3D house | three.js + @react-three/fiber + drei | **The brief's single most important visual.** A real WebGL scene, not a flat illustration: low-poly stylised bahay cutaway, isometric game camera, items fly into shelves, weather per scenario. Lazy-loaded so the landing page stays light. |
| Motion (2D) | CSS springs via tokens + small `useSpring` helper (no heavy motion lib) | Keeps the first bundle small; everything animates with transform/opacity only. |
| i18n | i18next + react-i18next, `en.json` / `tl.json` | No hard-coded strings. Taglish allowed in `tl`. |
| PWA | vite-plugin-pwa (Workbox) | Precache app shell, runtime-cache fonts/images, offline after first visit. |
| Auth + cloud | Supabase (email magic link + Google), Postgres, RLS on every table | Free tier. Env-gated: without keys the app runs fully as guest. |
| Fonts | Self-hosted, subset: **Sora** (display) + **Inter Tight** (text) + **JetBrains Mono** (numbers) | Space-launch feel: geometric display, tight neutral body, mono for meters. |
| Native wrap | Capacitor-ready: `src/native/*` adapters for notifications/storage/share | No rewrite later. |

**[call] Why not Next.js?** No server rendering needed (offline-first SPA, auth via Supabase). Vite keeps hosting free and static.

## 3. Folder structure

```
handa/
  index.html                  app shell (dark, inline critical CSS)
  public/                     icons, manifest, fonts (woff2, subset), og image
  src/
    main.tsx                  providers (i18n, router, db bootstrap)
    app/
      router.tsx              lazy routes
      Shell.tsx               bottom tab bar (mobile) / side rail (desktop)
    design/
      tokens.css              color / type / space / radius / motion / shadow tokens
      global.css              reset, dark-first theme, reduced-motion, low-data mode
      icons/                  hand-drawn SVG icon set (one stroke weight, one fill style)
    ui/                       Button, Meter, Chip, Sheet, Stepper, Toggle, Toast, EmptyState, Hint
    i18n/                     index.ts, en.json, tl.json
    domain/
      types.ts                Household, Scenario, Item, Kit, Readiness …
      scenarios.ts            8 scenarios, their weather, which categories matter and how much
      readiness.ts            the math: needs = f(scenario, duration, household); coverage per category
      catalog.ts              item catalog (what exists, units, covers person-days, where it goes)
      kits.ts                 quick-add kits
    content/                  guides, DIY, workouts, tips, first aid, baby, safety (EN + TL), quizzes
    store/
      db.ts                   Dexie schema (households, sessions, inventory, scores, surveys, outbox)
      useSession.ts           current run (scenario/duration/household)
      useInventory.ts         items placed in this run
      useSettings.ts          lang, sound, reduced motion, low data, consent
    sync/
      supabase.ts             client (null when no env)
      outbox.ts               write-local-first queue, replay when online, last-write-wins per row
      migrateGuest.ts         guest → account: upload local rows, tag with user_id, keep local copy
    scene/                    THE 3D HOUSE
      HouseScene.tsx          Canvas, camera, lights, postfx-free (perf)
      House.tsx               walls, roof (cut-away), floor, rooms
      Storage.tsx             pantry, med cabinet, water corner, power station, go-bag hook
      ItemMesh.tsx            procedural low-poly item meshes per category (bottle, can, box, lamp…)
      FlyIn.tsx               spring flight from UI into storage slot + squash & settle
      Weather.tsx             rain, flood water plane, heat shimmer, brownout flicker, zombie fog
      useSceneStore.ts        slot allocation, highlight missing categories
    screens/
      Landing, Play (Scenario → Duration → Household), HouseScreen (3D + item tray + meter),
      Score (Ready Card), Learn, LearnDeck (swipe cards + quiz), Inventory (expiry), PlanCard,
      Hotlines, Profile (account, data export/delete), Pricing, Survey, Press, Onboarding
    native/                   share.ts, notify.ts, storage.ts (web impl, Capacitor later)
  supabase/
    schema.sql                tables + RLS policies + export/delete RPC
  .github/workflows/
    keepalive.yml             daily ping so the free project does not pause
    backup.yml                weekly export to a release asset
  README.md
```

## 4. Data model

**Local (Dexie) = source of truth on device. Cloud mirrors it per user.**

- `households` — id, name, adults, kids, babies, seniors, pets, specialNeeds[], region, city
- `runs` — id, householdId, scenario, durationDays, startedAt, finishedAt, readinessPct, daysCovered
- `inventory` — id, runId?, householdId, catalogId, qty, unit, expiresAt?, location (slot), note
- `scores` — runId, pct, categories{}, at
- `surveys` — id, answers{}, at
- `settings` — key/value
- `outbox` — op, table, rowId, payload, at  (replayed to Supabase when online)

Every row carries `updatedAt` and, once signed in, `userId`. Sync is **last-write-wins per row** by `updatedAt` **[call]** — simple, predictable, good enough for one family editing one household. Supabase tables mirror this with RLS `auth.uid() = user_id` on every table, insert/select/update/delete.

## 5. The readiness math (domain/readiness.ts)

- Person-day needs by category come from the scenario profile × duration × household weights (baby 0.5 water but +formula/diapers; senior +meds; pet +pet food/water).
- Base: water 4 L/person/day (3 L drinking + 1 L hygiene; NDRRMC/DOH use 3–4 L), food 2,100 kcal/person/day, etc.
- Each catalog item declares `covers: { category, personDays per unit }` where it makes sense; others are checklist items (`needed: n` per household).
- Readiness % = weighted average of per-category coverage, weights from the scenario (e.g. Flood weights water+docs+shelter; Brownout weights power+food+cash).
- "Days you can last" = min over critical categories of covered person-days ÷ people.

## 6. The storage game: illustrated rooms (v3, the default)

The house is a cut-away dollhouse (3 floors × 3 rooms) drawn as cartoon vector scenes. Tap a room to go inside: a full illustrated room with its own furniture, window weather, lamp glow (brownout turns the lights off and your placed lamps light the room), and storage units with slot grids. Items are illustrated sprites that fly from the tray onto the shelf with a bounce, stack with ×counters, and open an inspect sheet (quantity, expiry, where it should live, storage tip, where to buy).

- **Rooms by storage science**: Kitchen & pantry, Water station, Bedroom (medicine cabinet at 1.60 m, locked; baby shelf), Bathroom (hygiene only), Sala (power station), Study/library (documents, cash, radio), Entryway (go-bag hooks), Bodega/garage (tool wall, pet rack), Safe room upstairs (stay-in shelf, boarded window, blackout curtain).
- **Game layer**: XP (10 per placement, 15 for a first visit, 25–210 per mission, 100 for finishing), 10 levels, per-room missions generated from the readiness gaps (stock N × item, complete category, finish room), "Next best move" cards, level-up and room-complete celebrations with confetti, haptics, sounds.
- **Popups that teach**: a "Common mistake" card on first entering a room (from the room's *never* list, tap for the full house rules), a "Storage tip" the first time an item is placed, a "Did you know" fact when a category completes, and a rules sheet per room (climate, 6 rules, nevers, cadence, facts, sources).
- **Survival run**: the day-by-day scenario simulation, reachable from the map and the room.
- **AA art pass (v3.1)**: one-point-perspective rooms with ceiling/floor AO, window light shafts and lamp pools, weather colour grade, film grain and vignette, dust motes; furniture drawn with top/side faces and shadows; items as shaded sprites with proper-storage variants (six-pack water, can rows, battery packs, document pouches, drums on pallets, hung go-bags); in-scene signage (FIFO, "no meds in the bathroom", 1.60 m cabinet height) and an info toggle that annotates every storage unit with its storage rule.
- **Cartoon art direction (v4)**: the whole game moved to a warm visual-novel cartoon look: thick warm-ink outlines (`paint-order: stroke`, no filters, so nine mini rooms stay cheap), hard cel-shade bands instead of soft gradients, saturated golden-hour palette, chunky rounded shapes, and lived-in props per room (posters, Bahay Kubo print, sampaguita garland, capiz chimes, jeepney toy, sari-sari price board, banig, timba at tabo, "MABUHAY" doormat), plus a dollhouse exterior with garden, fence, gate and gable roof.
- **Imported 3D models (v4)**: every item shape also exists as a low-poly cartoon 3D model (src/models/build.ts, MeshToonMaterial + inverted-hull ink outline). `pnpm models` exports one GLB per shape (public/models, 25 files, ~0.5 MB) and pre-renders 86 WebP sprites (public/sprites, ~0.8 MB: one per catalog item plus six-pack and can-row variants). Rooms, the dollhouse minis and the tray draw these sprites; the inspect sheet shows the live GLB on a drag-to-rotate turntable. Me → Item art switches back to the vector sprites (also used automatically in low-data mode). External CC0 packs were not reachable from the build container, so the models are our own.
- **Intro as a game menu (v4.1)**: first launch plays a three-beat toon cinematic (storm, lights-out pantry with the real sprites, dawn title card); scenario = mission select with a vignette per scenario and threat pips; duration = difficulty tiers with a live days/litres/meals gauge; household = squad roster with avatars, briefing and a sticky START; START plays a match-start card into the house. All under src/intro (strings in src/intro/strings.ts).
- **Performance rule**: anything that moves continuously (rain, motes, flicker, rings) lives in a thin overlay SVG, never inside the inked room or dollhouse; no full-screen filters or blend modes in the live scene; mini rooms never animate. Idle raster work in a room is zero.
- **Set aside, still shipped**: Blueprint editor (v2) and the 3D house (v1) under Me → House view.

## 6b. The blueprint editor (v2, set aside)

The 3D house (section 6a below) is kept behind **Me → House view → 3D (experimental)**. The default is now the **Readiness Plan**: an architect's drawing set operated like a game level editor.

- **Drawing set.** Two plans on one A1-style sheet (ground floor, second floor), drawn in centimetres at 1:50: wall poché with 45° hatch, door swings, window symbols, dimension lines with ticks, room codes and areas, a north arrow, a scale bar, and a title block (project, client = household, scenario · duration, scale, date, sheet, readiness %). Light theme is ink on paper, dark theme is a blueprint.
- **Rooms by storage logic, not by use.** Kitchen & pantry (food, preserving: cool/dry/dark, off the floor, FIFO) · Water station in the dirty kitchen (drums on a pallet out of sunlight, treatment shelf) · Bedroom (medicine cabinet at 1.60 m, locked; baby shelf) · Bathroom (hygiene only; never medicine) · Sala (power station console) · Study (document safe, cash, radio) · Entryway (go-bag hooks by the exit) · Bodega/garage (tool wall, pet rack) · Safe room upstairs (stay-in shelf, security, extinguisher). Each room carries a storage guide: climate, 6 rules, 4 nevers, a check cadence, PH/WHO sources, and 3 facts drawn as CAD general notes.
- **Blocks.** Every item is a CAD block: a top-down symbol on the plan, a front elevation in the section, with a ×qty badge. Shelves have slot grids; overflow stacks with an offset. Missing categories get a pulsing **revision cloud**, the architect's own "fix this" mark.
- **Editor chrome.** Left: Layers (categories with eye toggles and fill). Right: Inspector (room code, climate, cadence, store-it-right sheet, recommended next with quantities and tips, item steppers, facts). Bottom: Palette (asset browser) and a status bar (sheet, zoom, cursor in metres, readiness, days, rev). Pan, wheel/pinch zoom, Esc/1/2 shortcuts. On phones the panels become tabs under the canvas.
- **Section view.** Per room, each storage unit as an elevation at 1:20: posts, shelves, off-floor dimension, total height, FFL line, items on shelves, general notes column.
- **Simulate.** Day-by-day burn-down per category for the chosen scenario and duration, with run-out events and "N of D days covered".
- **Cinematic tour.** Camera dollies room to room with captions, then opens the simulation. Presentation mode (from /press) auto-stocks the plan while touring, for recordings.

## 6a. The 3D house (set aside, still shipped behind a setting)

- **Style:** low-poly, chunky, slightly toy-like. Flat-shaded materials with a warm palette, soft directional sun + hemisphere fill, contact shadow blob under the house. No textures to download; everything is geometry + vertex colour → instant load, works offline.
- **Camera:** orthographic-feeling isometric (actually perspective with narrow FOV at 3/4 angle), gentle orbit damping, zooms into a room when you pick a category.
- **House:** 2-storey bahay with one wall and half the roof cut away so you see inside: kitchen/pantry, sala with the power station, CR with hygiene shelf, bedroom with baby corner, door with the go-bag hook, yard with water drums.
- **Items:** procedural meshes per category (bottle, gallon, can, sack, box, lamp, battery, radio, bag). Tapping an item in the tray spawns it at the tray position, it **arcs** into its slot (spring on a bezier), squashes on landing, slot glows briefly. Completing a category pops confetti shards in that room.
- **Weather:** rain streaks + darker sky for Bagyo; rising water plane for Baha; heat shimmer + orange sky for El Niño; lights off + flicker for Brownout; dry taps for Water interruption; shake for Lindol; dusk + boarded windows for Civil unrest; fog + green tint for Zombie.
- **Perf:** one canvas, instanced items where many, `frameloop="demand"` when idle, DPR capped at 1.5 on mobile, reduced-motion → no weather particles and instant placement. Low-data mode → 2D fallback list.

## 7. Milestones

1. **M1 Foundation** — tokens, shell, i18n, router, Dexie, Landing. Runs.
2. **M2 Core loop** — Play (scenario/duration/household), readiness math, HouseScreen with 3D house, item tray, meter, Score + Ready Card (canvas → PNG, Web Share).
3. **M3 Content** — Learn decks (10+ Basic cards, 3 levels), DIY, Workouts, Tips, First aid, Baby, Safety, Hotlines, 3 kits.
4. **M4 Accounts** — Supabase schema + RLS, magic link + Google, guest→account migration, outbox sync, export/delete.
5. **M5 Polish** — PWA, onboarding, hints, survey, pricing, press/showcase + presentation mode, Lighthouse, a11y pass, README + workflows.

## 8. Crew split (subagents)

- **Content** — writes `src/content/*` and the item catalog in EN + TL against the typed schema.
- **Data & security** — `supabase/schema.sql`, `sync/*`, migration, export/delete.
- **QA** — build, type-check, Playwright smoke of the core loop, Lighthouse, a11y.
- **Captain (me)** — design system, 3D scene, screens, integration.

## 9. Decisions log

- **Dark-first** with a light theme available. Brand colour is a signal orange on near-black (launch-pad feel), success is a mint green, warnings amber. No gradients except the scenario sky.
- **No emoji as icons** — custom SVG set in `design/icons`.
- **Sound** — tiny synthesized WebAudio blips (no audio files), off by default.
- **Share card** rendered on a 2D canvas (1200×630) showing % + scenario + days, never item details (OPSEC).
- **Payments off** — tier logic and gates exist (`domain/tiers.ts`), the upgrade button opens a "coming soon" sheet.
- **Health content** carries a visible "for review by a licensed professional" banner and "when to go to a doctor" block.

## 10. Decisions made while building (captain's log)

- **Camera is frontal, not isometric.** The cut-away house is viewed from the front (the removed wall), slightly right and 20° up; orbit is limited to ±30° so a wall never blocks the interior. Portrait phones get a wider FOV and a longer distance so the whole lot fits; focusing a category only nudges the camera on phones.
- **Pantry lives on the left wall** (not the back wall) so it reads from the camera; the kitchen partition is a half-wall counter for the same reason.
- **Roof is a true section**: back slope + ridge + fascia only. The front slope is removed, like an architectural cut.
- **Rain is line streaks**, not points; flood is a rising translucent plane capped below the shelves; brownout turns the house lights off and lets the lamps you place light the room, with a flicker while you have fewer than three power items.
- **Tier gating is in the code but open while payments are off** (`PAYMENTS_ENABLED = false`): Intermediate/Pro guides stay readable so launch content is not dead-ended. Flip the flag and the locks appear.
- **"Baby & kids" counts kids too** (wipes, kids' meds, comfort items), so a household with a 6-year-old and no baby still sees the category.
- **Guest outbox is not written** when no cloud is configured; `migrateGuest` snapshots local rows at first sign-in instead.
- **Fonts**: Sora / Inter Tight / JetBrains Mono as subset variable woff2 (≈78 KB total), preloaded.
- **Bundle**: landing route ships React + router + i18n only (three.js, Dexie and Supabase are all behind dynamic imports). Lighthouse mobile on the landing: Performance 91, Accessibility 98, Best practices 100, SEO 100.
- **QR for the plan card** is a dependency-free encoder (`src/lib/qr.tsx`), byte mode, EC level L, versions 1–40.
- **v2 (blueprint)**: the pan/zoom viewport is a 150-line custom SVG component (no map library); symbols use `vector-effect: non-scaling-stroke` so line weight stays crisp at any zoom; the whole drawing is data in `src/plan/floorplan.ts` (centimetres), so moving a shelf is a one-line change.
- **Not done in v1** (next slices): payments (GCash/Maya via a PH gateway), Squads, multiple locations UI (data model supports `households` per user), printable PDF books, native wrappers.
