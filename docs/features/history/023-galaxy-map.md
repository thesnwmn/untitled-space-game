# 023 · Galaxy Map — DONE

## What it added
Replaced the `build-map.ts` stub with a real SVG galaxy map renderer. Each system doc with `map_position.x/y` front matter becomes a labelled node; jump routes become edges. Nodes are zone-coloured (core = bright-cyan, frontier = bright-yellow, outer = bright-magenta); routes are security-coloured. Hover tooltips show system details; clicking a node opens its world docs page. The landing page GALAXY MAP tile was enabled.

## Key files
- `scripts/build-map.ts` — SVG map generator; reads system docs and jump-routes.md; writes `dist/map/index.html`
- `scripts/build-landing.ts` — updated to render GALAXY MAP tile as active

## Architectural decisions embedded
- `viewBox="0 0 100 100"` maps directly to `map_position` percentage coordinates.
- Systems without `map_position` are skipped with a console warning — no build failure.
- Hover tooltip uses a positioned `<div>` outside the SVG, toggled via vanilla JS `mouseover`/`mouseout`.
- Unstable/dangerous routes use `stroke-dasharray`; stable routes are solid.
- Reuses `html-template.ts` from feature 022; CSS variables declared inline so the map page works without the game's CSS bundle.
