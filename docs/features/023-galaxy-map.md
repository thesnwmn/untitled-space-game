# 023 · Galaxy Map

## Goal

Render a visual, interactive galaxy map from the world docs — showing systems
as nodes, jump routes as edges, and colour-coding by zone and security —
and publish it to GitHub Pages alongside the game and world docs.

## Acceptance criteria

- Running `npm run build:map` produces `dist/map/index.html`.
- The map page renders an SVG galaxy map inside the dark terminal HTML shell
  established by Feature 022.
- Every system that has a doc in `docs/world/systems/` appears as a labelled
  node. Node position is determined by the system's `map_position.x` /
  `map_position.y` front matter fields (0–100 % of map area).
- Every route in `docs/world/navigation/jump-routes.md` appears as a line
  between the two system nodes.
- Nodes are colour-coded by `zone`: core → bright-cyan, frontier → bright-yellow,
  outer → bright-magenta.
- Route lines are colour-coded by `security`: high → green, medium → yellow,
  low → red, none → dark-red (bright-black).
- Hovering a system node shows a tooltip containing: system name, zone,
  security, danger level, and destination count.
- Clicking a system node opens the system's world docs page
  (`/untitled-space-game/docs/systems/<id>.html`) in the same tab.
  This link is only active when the docs page exists (i.e. after `build:docs`
  has been run); the map itself must not fail to render if docs are absent.
- The map has a legend panel identifying zone colours and security colours.
- The landing page (`dist/index.html`) has the GALAXY MAP tile enabled —
  replace the Feature 022 stub (dimmed, "coming soon") with an active link
  to `/untitled-space-game/map/`.
- `npm run build:all` runs cleanly and the deployed GitHub Pages site shows all
  three destinations (game, docs, map) functional.
- `tsc --noEmit` and `npm test` still pass.

## Out of scope

- Animated or physics-based layout (positions come from `map_position` in docs).
- Faction territory overlays.
- Zooming or panning (the map fits in a single viewport).
- Travel simulation or pathfinding.
- Rendering planets or station sub-icons within systems.

## Technical notes

### `scripts/build-map.ts`

Replaces the stub from Feature 022. Steps:

1. Read all `docs/world/systems/*.md` (excluding `_template.md`), parse with
   `gray-matter`. For each system, extract: `id`, `name`, `zone`, `security`,
   `danger_level`, `map_position.x`, `map_position.y`, `destinations` length.
2. Read `docs/world/navigation/jump-routes.md`, parse `data.routes` array.
3. Generate an SVG element:
   - `viewBox="0 0 100 100"` (coordinates map directly to `map_position` %).
   - Route `<line>` elements drawn first (below nodes).
   - System `<g>` elements: a `<circle>` node + `<text>` label.
   - A `<title>` inside each `<g>` for native SVG tooltip fallback.
4. Wrap the SVG in HTML using `html-template.ts` from Feature 022. The SVG
   is inline in the page body so it inherits the terminal CSS.
5. Write `dist/map/index.html`.

### SVG visual spec

```
Map area: viewBox "0 0 100 100", width/height 80vmin (square, scales with
  viewport), centred on page.

System node:
  <circle r="1.2">  — filled with zone colour, no stroke
  <text dy="2.5">   — system name in 2.5px font, bright-white, centred

Route line:
  <line stroke-width="0.3">  — colour from security level
  stroke-dasharray="1 0.5" for unstable/dangerous routes; solid for stable

Legend (fixed position, top-right of map):
  Small colour swatches + labels for zone and security, same font as map.
```

### Zone and security colour mapping

| Zone | CSS variable |
|---|---|
| core | var(--bright-cyan) |
| frontier | var(--bright-yellow) |
| outer | var(--bright-magenta) |

| Security | CSS variable |
|---|---|
| high | var(--green) |
| medium | var(--yellow) |
| low | var(--red) |
| none | var(--bright-black) |

The `--` CSS variables are defined in `colors.css` and must also be declared
inline in `html-template.ts` so the map page works without importing the
game's CSS bundle.

### Hover tooltip

Use a `<foreignObject>` or a positioned `<div>` (outside SVG) toggled via
vanilla JS `mouseover`/`mouseout` on each system `<g>`:

```
╔═══════════════════════╗
║ SOL                   ║
║ Zone:        core     ║
║ Security:    high     ║
║ Danger:      low      ║
║ Destinations: 4       ║
╚═══════════════════════╝
```

Styled with the terminal aesthetic. Position follows cursor (clamped to page).

### Landing page update

In `scripts/build-landing.ts`, detect whether `dist/map/index.html` exists
at build time and render the GALAXY MAP tile as active if so, or dimmed if not.
Alternatively (simpler): always render it active and link to
`/untitled-space-game/map/` — it will 404 until `build:map` runs, but
`build:all` runs everything in sequence so this is not an issue in CI.

For Feature 023, just render all three tiles active unconditionally.

### `map_position` field

Required for correct rendering. The Writer role is responsible for setting
`map_position.x` and `map_position.y` in each new system doc. Systems
without `map_position` are skipped with a console warning during the build.

## Dependencies

**018 · World Data Schemas & Seed Content** — reads `docs/world/systems/`
and `docs/world/navigation/jump-routes.md`.

**022 · World Docs HTML Publisher** — reuses `scripts/lib/html-template.ts`
and `scripts/lib/parse-world.ts`; replaces the `build-map.ts` stub; updates
the landing page to enable the GALAXY MAP tile.
