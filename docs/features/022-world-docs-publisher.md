# 022 · World Docs HTML Publisher

## Goal

Render all `docs/world/` markdown documents into a browsable HTML site deployed
alongside the game on GitHub Pages, with a shared landing page so visitors can
choose between the game, the world docs, and (after Feature 023) the galaxy map.

## Acceptance criteria

- Running `npm run build:docs` produces a `dist/docs/` directory containing:
  - `dist/docs/index.html` — top-level docs index listing all categories
    (Systems, Destinations, Factions, Ships, Commodities, Story Beats) with
    clickable links to each category index page.
  - `dist/docs/systems/index.html` — lists all system docs with name, zone,
    security, danger level, and a link to the detail page.
  - `dist/docs/systems/<id>.html` — detail page for each system: front matter
    table at top, full markdown body rendered as HTML below.
  - Same pattern for `destinations/`, `factions/`, `ships/`, `story/`.
  - `dist/docs/commodities.html` — renders the commodity list (all 12 entries)
    as a table with name, category, base price, legal status, weight.
  - `_template.md` files are excluded from all output.
- Running `npm run build` (Vite game build) outputs to `dist/game/` instead of
  `dist/` root. All existing game functionality is unchanged — only the output
  directory and base path change.
- Running `npm run build:landing` produces `dist/index.html` — the GitHub Pages
  landing page — with at minimum three launch tiles: PLAY GAME, WORLD DOCS, and
  GALAXY MAP (disabled/greyed out until Feature 023 lands).
- Running `npm run build:all` runs all four steps in sequence: game, docs,
  landing page, and (no-op placeholder for) map.
- The CI workflow (`.github/workflows/deploy.yml`) runs `npm run build:all`
  instead of `npm run build`, and deploys the entire `dist/` directory.
- All generated HTML uses the game's dark terminal aesthetic: black background,
  monospace font (Share Tech Mono or VT323 from Google Fonts), 16-colour palette
  that matches the game's `colors.css` naming conventions.
- Each generated page has a breadcrumb header: `[ UNTITLED SPACE GAME ] > [ DOCS ]
  > [ SYSTEMS ]` (category) or `[ SYSTEMS ] > [ Sol ]` (detail), all as
  clickable links.
- Internal links between world doc pages work correctly on GitHub Pages
  (e.g. a system's `major_factions` list links to the corresponding faction
  detail pages; a system's `destinations` list links to destination pages).
- `tsc --noEmit` still passes with zero errors after all changes.
- `npm test` still passes.

## Out of scope

- Search or filtering within the docs site.
- Editing world docs through the browser.
- Authentication or access control.
- The galaxy map (Feature 023).
- Prose quality — the docs site renders whatever is in `docs/world/`; content
  is the Writer role's responsibility.

## Technical notes

### Package additions

Add as `devDependencies`:
- `gray-matter` — front matter parser (`import matter from 'gray-matter'`)
- `marked` — markdown-to-HTML renderer (`import { marked } from 'marked'`)

These are used only in build scripts, never in game code.

### Vite config change

Change Vite `base` from `/untitled-space-game/` to `/untitled-space-game/game/`
and explicitly set `build.outDir` to `dist/game`. This moves the game output
from `dist/` root to `dist/game/`, freeing the root for the landing page.

```typescript
export default defineConfig({
  base: '/untitled-space-game/game/',
  build: {
    outDir: 'dist/game',
  },
  test: { /* unchanged */ },
});
```

### Script locations

```
scripts/
  build-docs.ts      # renders docs/world/ → dist/docs/
  build-landing.ts   # generates dist/index.html
  build-map.ts       # stub — created by Feature 023; stub here emits nothing
  lib/
    parse-world.ts   # shared: discovers + parses all world docs into typed objects
    html-template.ts # shared: HTML page shell (head, nav, footer)
```

All scripts are run with `bun scripts/<name>.ts` — no compile step needed.

### `scripts/lib/parse-world.ts`

Discovers every `docs/world/**/*.md` that is not a `_template.md`. For each
file, calls `gray-matter(content)` to split front matter and body. Returns an
array of `{ path, data, content }` objects. Grouping by category (systems,
destinations, etc.) is done by the calling script using the directory segment
of `path`.

### `scripts/lib/html-template.ts`

Exports a `page(title, breadcrumbs, body): string` function that wraps content
in a complete HTML document:
- `<head>`: charset, viewport, Google Fonts import for Share Tech Mono, inline
  `<style>` block replicating the game's colour variables and body defaults
  (`background: #000`, `color: #fff`, `font-family: 'Share Tech Mono'`).
- `<header>`: breadcrumb row in bright-cyan, formatted as `[ A ] > [ B ]` with
  each segment linking to the correct URL.
- `<main>`: `body` string injected verbatim.
- `<footer>`: bright-black `UNTITLED SPACE GAME — WORLD DOCS` label.

### `scripts/build-docs.ts`

1. Calls `parse-world.ts` to load all docs.
2. Groups by category: `systems | destinations | factions | ships | story |
   commodities`.
3. For each category, writes a `dist/docs/<category>/index.html` with a table
   of all items (id, name, key front matter fields).
4. For each item, writes `dist/docs/<category>/<id>.html` with a front matter
   summary table and the markdown body rendered via `marked`.
5. Writes `dist/docs/index.html` with links to all category index pages.
6. Cross-reference fields (`system`, `major_factions`, `destinations`) are
   rendered as clickable links to the corresponding detail pages.
7. Skips `_template.md` files.

### `scripts/build-landing.ts`

Writes `dist/index.html`. The page uses the terminal aesthetic, displays the
game title in ASCII art (same as the in-game main menu), and shows three large
clickable tiles:

```
[ PLAY GAME ]    [ WORLD DOCS ]    [ GALAXY MAP ]
```

GALAXY MAP tile is styled as dimmed/disabled with text `(coming soon)` until
Feature 023 lands. The landing page is a static file — no build-time dependency
on whether `dist/map/` exists.

### `scripts/build-map.ts` stub

For Feature 022, this file exists but writes nothing. Feature 023 replaces it
with the real implementation. The stub ensures `npm run build:all` does not fail.

### `package.json` additions

```json
"scripts": {
  "build": "vite build",
  "build:docs": "bun scripts/build-docs.ts",
  "build:map": "bun scripts/build-map.ts",
  "build:landing": "bun scripts/build-landing.ts",
  "build:all": "npm run build && npm run build:docs && npm run build:map && npm run build:landing"
}
```

### CI workflow update

Replace the single `npm run build` step with `npm run build:all`. Add a Bun
setup step before `Install dependencies` since Bun is used by the build scripts:

```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v2
  with:
    bun-version: latest
```

## Dependencies

**018 · World Data Schemas & Seed Content** — build script reads `docs/world/`.
