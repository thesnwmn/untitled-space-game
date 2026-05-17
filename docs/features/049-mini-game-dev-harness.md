# Feature 049 · Mini-Game Dev Harness

## Goal

Provide standalone browser and terminal entry points for running any registered mini game
outside the main game, plus a GitHub Pages index page listing all available mini games and
their variants, so mini games can be developed and tested in isolation.

---

## Acceptance criteria

- `npm run dev:mini-games` starts a Vite dev server serving the mini-game browser runner
- `npm run build:mini-games` builds the browser runner to `dist/mini-games/`
- `npm run build:all` includes the mini-games build
- When the browser runner loads with no `?game=` param, it displays a listing of all
  registered mini games with links for each variant (or a default "play" link if no variants
  are defined); the listing is styled on-theme (monospace, dark background)
- When the browser runner loads with `?game=<id>` (plus any variant params), it instantiates
  and runs the specified mini game with a mock `PlayerState`
- On `complete()` in the browser runner, the result (`outcome` and any `data`) is displayed
  and a link back to the mini-game index is offered
- If `?game=<id>` does not match any registered entry, the browser runner displays a clear
  error message and links back to the index
- `bun run terminal-mini-games.ts` with no arguments prints the name and description of each
  registered mini game (from `miniGameDescriptors`) and exits with code 0
- `bun run terminal-mini-games.ts <id>` instantiates and runs the specified mini game in the
  terminal using a mock `PlayerState`; the standard Bun game loop is used
- `bun run terminal-mini-games.ts <id> --variant=<variant-id>` applies the named variant's
  `params` entries as the mini game's initial configuration
- If `<id>` is not found in the registry, the terminal runner prints a clear error and exits
  with a non-zero code
- On `complete()` in the terminal runner, the result is printed to stdout and the process
  exits with code 0
- `npx tsc --noEmit` produces zero errors

---

## Out of scope

- Saving or persisting results from either standalone runner
- Any concrete mini game implementation (registry remains empty after this feature)
- A terminal equivalent of the index listing page (terminal runner lists games via `--help`
  / no-args only)
- Authentication or access control on the mini-games page

---

## Technical notes

### Vite config (`vite.mini-games.config.ts`)

A second Vite config file at the project root. Key differences from `vite.config.ts`:

- `base: '/untitled-space-game/mini-games/'`
- `build.outDir: 'dist/mini-games'`
- No `test` section — tests stay in the existing config

Entry HTML is `mini-games.html` at the project root, pointing to `src/mini-game-runner.ts`.
`mini-games.html` mirrors the structure of `index.html` (same font, CSS, game-screen element).

### Browser runner (`src/mini-game-runner.ts`)

Sets up `DOMRenderer` and `DOMInputHandler`, then reads `window.location.search`.

**Index mode** (no `?game=` param): Renders a static HTML listing into `document.body` (no
game loop started). The listing is generated from `miniGameDescriptors`. Each entry shows the
mini game name, description, and one link per variant (`?game=<id>&<variant params>`) — or a
single "PLAY" link if the mini game has no variants. The page should be legible and
on-theme; it does not need to be a full `Scene`-based ASCII render.

**Runner mode** (`?game=<id>` present): Finds the matching `MiniGameEntry` in
`miniGameRegistry`. Constructs a mock `PlayerState`. Passes all remaining `URLSearchParams`
entries to the factory. Starts a `requestAnimationFrame` loop. On `complete(result)`:
cancels the animation frame, clears the renderer, and renders a result overlay showing
`outcome` and `data` (if any) plus a link back to the mini-game index.

If `<id>` is not found, renders an error message and index link without starting the game loop.

### Terminal runner (`terminal-mini-games.ts`)

Parallel to `terminal.ts` at the project root. Uses `TerminalRenderer` and
`TerminalInputHandler`.

**Argument parsing:** `process.argv` entries after the script name. First non-flag argument
is `<id>`; `--variant=<variant-id>` is a named flag.

**No-args / list mode:** Imports `miniGameDescriptors` (pure data — no factory imports
needed) and prints each entry's `name` and `description` to stdout. Exits 0.

**Run mode:** Looks up `<id>` in `miniGameRegistry`. If not found, prints an error to stderr
and exits 1. Otherwise constructs a mock `PlayerState`, resolves variant params (if
`--variant` was supplied, find the matching `MiniGameVariant` in the descriptor's `variants`
array and use its `params`; if `--variant` is not supplied, pass an empty params object).
Passes params as `Record<string, string>` to the factory. Runs the Bun game loop (same
pattern as `terminal.ts`: `setInterval` or equivalent). On `complete(result)`, tears down
the terminal renderer cleanly and prints the result.

### Mock `PlayerState`

Both runners need a `PlayerState` to satisfy `BaseMiniGameScene`'s constructor. Add a static
method `PlayerState.createMock(): PlayerState` that returns a minimal valid instance with
default values (e.g. starter system, starter destination, full fuel, zero credits). This is
the only way the harness constructs a `PlayerState` — it must not load world data or require
a save file.

If `initWorld()` is a prerequisite for `PlayerState` to function correctly, the harness must
call `initWorld(loadWorldData())` (browser) or the terminal equivalent before constructing
the mock. The Engineer should verify this against the current `PlayerState` implementation.

### Deployed structure

The `dist/mini-games/` output is deployed alongside the existing `dist/game/`,
`dist/docs/`, and `dist/map/` trees. The GitHub Pages root landing page (built by
`build:landing`) should link to `/untitled-space-game/mini-games/` once this feature ships —
that landing page update is in scope for this feature.

### npm scripts

```
"dev:mini-games":   "vite --config vite.mini-games.config.ts",
"build:mini-games": "vite build --config vite.mini-games.config.ts",
"build:all":        "npm run build && npm run build:docs && npm run build:map && npm run build:landing && npm run build:font-report && npm run build:mini-games"
```

---

## Play-test instructions

### Browser (`npm run dev:mini-games`)

1. Navigate to the dev server root — confirm the mini-game index loads (will show an empty
   list until a mini game is registered).
2. Manually append `?game=nonexistent` — confirm the error message and index link appear.

### Terminal (`bun run terminal-mini-games.ts`)

1. Run with no args — confirm the list of mini games prints (empty until one is registered)
   and the process exits cleanly.
2. Run with an unknown id — confirm the error message and non-zero exit code.

---

## Dependencies

Feature 048 (Mini-Game Base Scene)
