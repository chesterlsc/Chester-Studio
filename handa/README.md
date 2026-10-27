# HANDA — prepare.ph

**Handa ka na ba?** A game-like home-readiness app for Filipino families. Pick a scenario (bagyo, baha, init, brownout, walang tubig, lindol, gulo, zombie), pick how long, set your household, press START, and stock an illustrated dollhouse of your home, room by room, with missions, XP and popups that teach real storage rules, until the readiness meter is full. Each room follows real storage rules (medicine out of the bathroom, water off the concrete and out of the sun, go-bags by the door). Free, Tagalog/English, works offline.

- Product plan and design decisions: [`PLAN.md`](./PLAN.md)
- Database + auth setup: [`supabase/README.md`](./supabase/README.md)

## Stack

Vite 8 · React 19 · TypeScript · react-router 7 · Zustand · Dexie (IndexedDB) · three.js + react-three-fiber · i18next · vite-plugin-pwa · Supabase (optional, free tier)

## Run it

```bash
cd handa
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # type-check + production build → dist/
pnpm preview      # serve dist/ on :4173
pnpm test         # vitest (readiness math, QR encoder)
pnpm models       # re-render the cartoon 3D item models → public/models/*.glb + public/sprites/*.webp (Playwright, ~40 s)
```

Node 22+. pnpm 10 (npm works too, but the lockfile is pnpm's).

## Environment variables

Copy `.env.example` to `.env.local`. **Every variable is optional.** Without Supabase keys the app runs fully in guest mode (device-only save), which is also what the production build does until you add them.

| Variable | What it does |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL. Enables accounts + cloud sync. |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (safe to ship; RLS protects every table). |
| `VITE_GOOGLE_AUTH` | `1` to show "Continue with Google" (enable the provider in Supabase first). |
| `VITE_SITE_URL` | Canonical URL used in share cards and auth redirects, e.g. `https://prepare.ph`. |

## Deploy (free)

The app is a static SPA. Any static host works; these are free and support SPA fallbacks:

**Cloudflare Pages** (recommended, also free custom domain for prepare.ph)
1. Pages → Create project → connect this repo.
2. Build command `cd handa && pnpm install && pnpm build`, output directory `handa/dist`.
3. Add the `VITE_*` variables under Settings → Environment variables.
4. Add a `_redirects` rule if you want (Pages already serves `index.html` for unknown routes when the file exists at the root; vite-plugin-pwa's `navigateFallback` handles the rest offline).
5. Custom domain → `prepare.ph`.

**Netlify**: same build command and output dir; add `/* /index.html 200` to `handa/public/_redirects`.

**Vercel**: framework preset Vite, root directory `handa`.

### Headers (CSP, caching)

Set these on the host (Cloudflare Pages: `handa/public/_headers`, Netlify: same file):

```
/*
  Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

## Supabase: accounts, sync, keep-alive, backup

1. Create a free project, run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL editor (idempotent; RLS on every table; `export_my_data()` / `delete_my_data()` RPCs; a `ping()` RPC for keep-alive).
2. Auth → enable Email (magic link) and, optionally, Google. Site URL = your domain; add `<domain>/auth/callback` to Redirect URLs.
3. Put the URL and anon key in the host's env vars.
4. **Keep-alive** (free projects pause after ~7 days idle): `.github/workflows/handa-keepalive.yml` at the repo root pings the database daily. Add repo secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
5. **Weekly backup**: `.github/workflows/handa-backup.yml` runs `pg_dump`, encrypts it with GPG and stores it as a workflow artifact for 90 days. Add secrets `SUPABASE_DB_URL` (the *Session pooler* URI) and `BACKUP_PASSPHRASE`.

Both workflows skip quietly when the secrets are missing. Full details in `supabase/README.md`.

### Guest → account

Everything a guest does is stored in IndexedDB. On first sign-in on a device, `src/sync/migrateGuest.ts` tags every local row with the user id and queues it for upload. Nothing is deleted; the device keeps its copy and stays the source of truth offline. Sync is write-local-first with an outbox, last-write-wins per row by `updatedAt`.

## Project map

```
src/design     tokens.css (color/type/space/radius/motion), global.css, icons/ (hand-drawn SVG set)
src/ui         Button, Meter, Ring, Chip, Stepper, Segmented, Toggle, Sheet, Toast, Empty, Hint, TopBar
src/domain     types, scenarios (weights + weather), readiness math, catalog (70 items), kits, tiers, badges
src/content    guides (21, EN+TL, quizzes, sources), hotlines, affiliates
src/game       THE ROOM GAME (default): layouts (room scenes + slot grids), Furniture, Sprites (vector fallback), RoomScene, HouseMap (dollhouse), ItemArt (3D sprite / live model), missions, progress (XP/levels), GameScreen
src/models     cartoon 3D items: build.ts (procedural low-poly models, toon materials, ink outlines), ItemViewer (drag-to-rotate GLB viewer), manifest (generated), useSprite
tools/render   dev-only renderer page used by scripts/build-models.mjs to export GLBs and WebP sprites
src/plan       the blueprint editor (set aside behind Me → House view → Blueprint): floorplan data (cm), Blueprint (plan), Elevation (section), Symbols (CAD blocks), Viewport (pan/zoom), simulation + SimChart, PlanScreen
src/scene      the 3D house (set aside behind Me → House view → 3D): House, ItemMesh, Items, Weather, Celebrate
src/screens    Landing, Play, HouseScreen, Score, Learn, LearnDeck, Hotlines, Stock, PlanCard, Me, Pricing, Survey, Press
src/store      Dexie db, settings, session, inventory
src/sync       Supabase client, auth, outbox sync, guest migration, export/delete
src/native     share / notify / storage adapters (web now, Capacitor later)
```

## Mobile apps later

The code never touches platform APIs directly; `src/native/*` are the only adapters. To wrap: `npx cap init`, point Capacitor at `dist/`, and swap the adapter bodies for `@capacitor/share`, `@capacitor/local-notifications`, `@capacitor/preferences`.

## Content and safety notes

- Health pages carry a "for review by a licensed professional before launch" banner and a "when to go to a doctor" block. No prescription dosing anywhere.
- Guidance is based on NDRRMC, PAGASA, PHIVOLCS, DOH and Philippine Red Cross public material and links out to them.
- Ready Cards show a percentage, scenario and days; never what is in the house.
- Affiliate links are search links with a visible disclosure; the table lives in `src/content/affiliates.ts`.
- Payments are off (`PAYMENTS_ENABLED = false` in `src/domain/tiers.ts`). Tier gates exist; the upgrade button opens a "coming soon" sheet.
