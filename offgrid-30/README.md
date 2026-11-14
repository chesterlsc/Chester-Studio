# OFFGRID 30

A visual, interactive survival book for surviving 30 years without power. Ages 10–80.

- Plan, TOC, design system: `docs/PLAN.md`
- Writing & design rules: `docs/STYLE.md`
- Progress: `docs/PROGRESS.md`

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/ (+ Pagefind search index)
```

Deploy under a sub-path with `BASE=/offgrid-30/ npm run build`.

## Where things live

| What | Where |
|---|---|
| Book pages (one MDX per page) | `src/content/pages/<chapter>/<page>.mdx` |
| Template components | `src/components/book/` |
| Icons | `src/components/icons/paths.ts` |
| Diagrams (SVG, themable) | `src/components/diagrams/` |
| 3D models (lazy, React Three Fiber) | `src/components/three/models/` |
| Colors, type, spacing | `src/styles/tokens.css` |
| Navigation data (generated from PLAN.md) | `scripts/build-toc.mjs` → `src/data/toc.json` |
