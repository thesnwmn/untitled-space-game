# 022 · World Docs HTML Publisher — DONE

## What it added
Created a Bun build pipeline (`scripts/build-docs.ts`) that renders all `docs/world/` markdown files into a browsable HTML site at `dist/docs/`, using `gray-matter` for front-matter parsing and `marked` for markdown-to-HTML. Also produced a landing page (`dist/index.html`) with game/docs/map tiles, a `build-map.ts` stub, and moved the Vite game output to `dist/game/`. CI updated to run `npm run build:all`.

## Key files
- `scripts/build-docs.ts` — main docs renderer; category index pages + detail pages + cross-reference hyperlinks
- `scripts/build-landing.ts` — landing page with PLAY GAME / WORLD DOCS / GALAXY MAP tiles
- `scripts/lib/parse-world.ts` — shared markdown discovery and front-matter parsing
- `scripts/lib/html-template.ts` — shared HTML shell with terminal aesthetic CSS
- `scripts/build-map.ts` — no-op stub (replaced by feature 023)
- `vite.config.ts` — `base` changed to `/untitled-space-game/game/`; `outDir` set to `dist/game`

## Architectural decisions embedded
- All build scripts run with `bun scripts/<name>.ts` — no compile step.
- `_template.md` files are excluded from all generated output.
- Cross-reference fields (`major_factions`, `destinations`, `system`) render as hyperlinks to detail pages.
