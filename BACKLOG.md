# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)
- DONE — built, verified, play-tested

---

## READY

### 020 · World Data File Loader

Replace the static `WORLD` object in `world-data.ts` with a loader that parses
`docs/world/**/*.md` via `gray-matter`. Browser build uses Vite `import.meta.glob`
(bundled at compile time); terminal build uses Bun fs reads. A shared
`world-parser.ts` maps snake_case front matter to camelCase TypeScript types and
extracts `description` from markdown body text. Both paths call `initWorld()` in
their respective entry points; `src/tests/setup.ts` is updated so all Vitest tests
have world data initialised automatically.
See `docs/features/020-world-file-loader.md` for the full spec.

**Depends on:** 018, 019

---

### 025 · Randomise Station Star Patterns

Each visit to a destination generates a new random `Starfield` seed, producing a
unique star layout. The seed is preserved across dock/undock cycles at the same
destination and only cleared when the player fully navigates away (main menu, story
screen, or future jump). `ShipScene` gains a required `starfieldSeed: number`
constructor parameter. The orchestrators (`main.ts`, `terminal.ts`) hold a
`destinationSeed` variable: generated fresh on first `goToShip` when null, reused
on subsequent undocks, cleared on `goToMainMenu` / `goToStory`.
See `docs/features/025-randomise-station-star-patterns.md` for the full spec.

---

### 024 · NavBar Keyboard Shortcuts

Make NavBar buttons (`[UNDOCK]`, `[HUB]`) reachable by number keys: `1` activates
the leftmost button, `2` the next, etc. Applies in terminal and browser keyboard
mode. `NavOption` gains an `action` callback; `NavBar` takes `inputHandler` in its
constructor and self-registers `onAction`/`onTap` — scenes need no nav input code.
In keyboard mode buttons render as `[1:UNDOCK]` / `[2:HUB]` so the shortcut is
self-documenting. Adds `NAV_1`–`NAV_9` to `GameAction`; wires digit keys in both
input handlers. See `docs/features/024-navbar-keyboard-shortcuts.md` for the full spec.

---

### ~~016 · Hint Overlay~~ — CANCELLED

Superseded by 028. Hint text is removed entirely. If hints return they will be part of `ScreenChrome` and togglable.

---

### 013 · Menu Pagination

Add a reusable `Pager` component (`src/game/ui/Pager.ts`) that paginates item lists in `MissionBoardScene` and `TraderScene` when item count exceeds the visible content area height. A one-row pager bar `< Page N/X >` appears at the bottom of the content region; LEFT/RIGHT navigates pages in the Mission Board, PAGE_UP/PAGE_DOWN in the Trader (where LEFT/RIGHT is already used for tab switching). Tap the `<`/`>` arrows or swipe to page. Pages wrap. Cursor resets to the first item on each page change. See `docs/features/013-menu-pagination.md` for full spec.

**Depends on:** 011

---

### 028 · Common Screen Layout

Introduce a `ScreenChrome` component that renders a 2-row header (`:: SYSTEM :: … :: [M] MENU ::` / `:: DESTINATION :: … :: credits CR ::`) and a 1-row footer nav (`:: [1] NAV1 :: [2] NAV2 ::::`) into every scene's buffer. Exports layout constants (`CONTENT_TOP`, `contentBottom(h, showFooter)`) so scenes no longer hard-code row numbers. Updates `BaseMenuScene` with left-aligned titles, backtick underlines, and richer `MenuItemDef` (simple / info / multi-line). Story screen suppresses both zones; Ship screen keeps header only. Replaces the existing `NavBar` component. Also removes all per-scene hint text permanently (supersedes 016).
See `docs/features/028-common-screen-layout.md` for the full spec.

**Depends on:** 011, 015

---

## NEEDS SPEC

_(none)_

---

## IN PROGRESS

_(none)_

---

## DONE

### 026 · Jump System

**Built:**
- `src/game/scenes/TravelMenuScene.ts` — unified two-tab scene (DESTINATIONS / JUMPS) for both in-system travel and inter-system jumps; NavBar with SHIP button; current destination greyed out (`bright-black`); FLY INTO SPACE as final DESTINATIONS item (greyed when already in space); arrival mode (no greyed destination) when `currentDestinationId === null`
- `src/game/scenes/JumpAnimationScene.ts` — 5-second auto-advancing jump animation; animated ellipsis and countdown; fires `onArrival` exactly once
- `src/game/scenes/InSystemTravelAnimationScene.ts` — 2-second auto-advancing in-system travel animation; fires callback on completion
- `src/game/scenes/ShipScene.ts` — added `systemId: string` param and `destinationId: string | null`; "in space" mode shows `IN SPACE · <SYSTEM>`, greys DOCK button, suppresses station glyph, constrains UP/DOWN to one item; `[ T ] TRAVEL` button replaces `[ J ] JUMP`
- `src/main.ts` / `terminal.ts` — `currentSystemId` and `currentDestinationId: string | null` state; `goToTravelMenu`, `goToArrival`, `goToFlyIntoSpace`, `onDestinationSelected`, `onJumpSelected` wired up
- `src/game/scenes/travel-menu-scene.test.ts` — 18 tests covering render, DESTINATIONS/JUMPS tab keyboard, NavBar SHIP tap, FLY INTO SPACE behaviour
- `src/game/scenes/ship-scene.test.ts` — updated for new signature; 5 new "in space" tests
- `src/game/scenes/jump-animation-scene.test.ts` — 3 tests; `src/game/scenes/in-system-travel-animation-scene.test.ts` — 3 tests

**Evidence:** 281 tests, 0 TypeScript errors. Branch: `claude/implement-jump-system-EYxJj`.

---

### 027 · World-Driven Story, Station, and System Display

**Built:**
- `src/shared/buffer-utils.ts` — added `wrapText(text, maxWidth): string[]` utility
- `src/shared/buffer-utils.test.ts` — 5 tests covering empty string, single word, over-length word, multi-word wrap, exact-fill
- `src/game/scenes/StoryScene.ts` — removed `STORY_LINES`, `YEAR_HEADER`, `STATION_NAME` import; reads `opening-arrival` beat via `getStoryBeatsByTrigger('game-start')[0]`; splits on `\n\n`, extracts year header, wraps body paragraphs at 36 chars with blank separators
- `src/game/scenes/StationMenuScene.ts` — added `destinationId: string` param; menu items built from `destination.amenities`; NavBar title from `dest.name`; description (3 lines) and `DANGER: <level>` rendered at rows 5+
- `src/game/scenes/ShipScene.ts` — added `destinationId: string` param; location row shows `<DEST>  ·  <SYSTEM>`; station glyph mapped from `destination.type` via `DESTINATION_TYPE_TO_STATION`
- `src/game/scenes/TraderScene.ts` — added `destinationId: string` param; trader name from `destination.npcs.trader`; NavBar title from `dest.name`
- `src/game/scenes/MissionBoardScene.ts` — added `destinationId: string` param; NavBar title from `dest.name`
- `src/game/constants.ts` — `STATION_NAME` export deleted
- `src/main.ts` / `terminal.ts` — added `STARTING_DESTINATION = 'elysium-station'`; passed to all scene constructors
- All 5 scene test files updated; `story-scene.test.ts` replaces Hugo-text paragraph checks with world-data assertions

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 238/238 tests passed (15 test files)
- `bash init.sh`: ✓ `=== Environment ready ===`

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — must show 15 test files, 238 tests passed
3. **Browser** `npm run dev` — main menu → NEW GAME:
   - Story screen: new third-person corporate-war text (no Hugo); `YEAR  2284` header in yellow; text wraps to 36 chars
   - Station hub: `ELYSIUM STATION` in NavBar; description snippet in dim text; `DANGER: LOW` below; TRADER and MISSION BOARD items visible
   - Ship: location bar shows `ELYSIUM STATION  ·  SOL`; HUB-type station glyph (white `[H]` cross) visible in window
   - Trader: `MERCHANT KESS` title (from world data); nav bar shows `ELYSIUM STATION`
   - Mission Board: nav bar shows `ELYSIUM STATION`
4. **Terminal** `npm run terminal` — same navigation; verify location and trader name

---

### 019 · World Data TypeScript Types

**Built:**
- `src/game/world/types.ts` — exports all type aliases and interfaces: `SecurityLevel`, `DangerLevel`, `PopulationLevel`, `KnowledgeLevel`, `Zone`, `LocationType`, `DestinationType`, `StoryBeatType`, `FactionType`, `FactionSize`, `CommodityCategory`, `ShipClass`, `RouteStability`, `StarSystem`, `DestinationAmenities`, `Destination`, `StoryBeat`, `JumpRoute`, `JumpDrive`, `Ship`, `Faction`, `Commodity`, `WorldData`
- `src/game/world/world-data.ts` — exports `WORLD: WorldData` with all seed data (4 systems, 10 destinations, 5 routes, 4 drives, 3 ships, 6 factions, 12 commodities, 3 story beats) plus helpers: `getSystem`, `getDestination`, `getRoutesFrom`, `getDrive`, `getStoryBeat`, `getStoryBeatsByTrigger`
- `src/game/world/world-data.test.ts` — 16 tests covering all acceptance criteria

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 230/230 tests passed (14 test files)
- `bash init.sh`: ✓ `=== Environment ready ===`

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — must show 14 test files, 230 tests passed
3. Verify `src/game/world/world-data.test.ts` passes: `getSystem('sol')` resolves, `elysium-station` has `trader === 'Merchant Kess'`, `getRoutesFrom('sol')` returns 3+ routes, `getDrive('civilian-mk1').maxDistanceLy === 4`, story beats resolve correctly

---

### 023 · Galaxy Map

**Built:**
- `scripts/build-map.ts` — replaces Feature 022 stub; reads all `docs/world/systems/*.md` (skipping `_template.md`) via `gray-matter`; normalises `map_position` light-year coordinates to a 0–100 SVG viewBox with 8-unit padding; reads `docs/world/navigation/jump-routes.md`; generates an inline SVG with `<line>` route elements (stroke-dasharray for unstable routes) and `<g class="system">` node elements (`<circle r="1.2">` + `<text dy="2.5">`) colour-coded by zone/security; wraps in `html-template.ts` `page()`; writes `dist/map/index.html`
- `scripts/lib/html-template.ts` — added `--bright-cyan: #55ffff`, `--bright-yellow: #ffff55`, `--bright-magenta: #ff55ff` to `:root` CSS variable block
- `scripts/build-landing.ts` — GALAXY MAP tile changed from disabled span to active `<a href="map/index.html">` link

**Colour coding:**
- Zones: core → `--bright-cyan`, frontier → `--bright-yellow`, outer → `--bright-magenta`
- Routes: high → `--green`, medium → `--yellow`, low → `--red`, none → `--bright-black`; unstable routes dashed

**Interactive features:**
- Hover tooltip (follows cursor, clamped to viewport) shows system name, zone, security, danger level, destination count in terminal box-drawing style
- Click any node navigates to `/untitled-space-game/docs/systems/<id>.html`
- Legend panel (zone colours + route security colours) rendered alongside the SVG

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 214/214 tests passed (13 test files)
- `npm run build:map`: ✓ `dist/map/index.html` written (8 systems, 5 routes)
- `npm run build:all`: ✓ game + docs + map + landing page all written

**Play-test instructions:**
1. `bash init.sh` — must print `=== Environment ready ===`
2. `npm run build:all` — must complete with no errors
3. Open `dist/index.html` — GALAXY MAP tile is now an active link (not dimmed)
4. Click GALAXY MAP → `dist/map/index.html`: SVG renders 8 labelled system nodes and 5 route lines
5. Hover a system node — tooltip appears with system details in box-drawing style; moves with cursor
6. Verify colour coding: Sol node is bright-cyan (core), routes vary green/yellow/red; wolf-359 routes are dashed (unstable)
7. Click a node — navigates to its world docs page

---

### 015 · Station Nav Bar

**Built:**
- `src/game/ui/NavBar.ts` — new `NavBar` class; constructor takes `(stationName, options)`; `render()` writes station name centered in `bright-cyan` on row 0 and `[LABEL]` buttons centered in `white` on row 1 with one-space gaps; caches button column ranges after each render; `hitTest(col, row)` returns option id for row 1 hits, `null` for row 0, misses, or pre-render calls
- `src/game/ui/NavBar.test.ts` — 14 tests covering: station name text/position/color, single-option centering, two-option layout and gap, button color, hitTest row 0 null, hitTest undock/hub ranges, hitTest gap and out-of-range null, single-option hitTest, pre-render null
- `src/game/scenes/BaseMenuScene.ts` — scene title color changed from `bright-cyan` to `white`
- `src/game/scenes/StationMenuScene.ts` — title changed to `'HUB'`; UNDOCK menu item removed; `navBar` field added (single `[UNDOCK]` option); `render()` overrides to call `super.render()` then `navBar.render()`; additional `onAction` handler: ESC sets `navActivated=true` and calls `onShip`; additional `onTap` handler: hitTest on `'undock'` → `onShip`
- `src/game/scenes/TraderScene.ts` — constructor signature changed from `onBack` to `(onHub, onUndock)`; `navBar` field added (two options `[UNDOCK] [HUB]`); `navBar.render()` called after clear; scene title color `bright-cyan` → `white`; `onTap` checks nav hit first; BACK action calls `onHub`
- `src/game/scenes/MissionBoardScene.ts` — identical changes to TraderScene
- `src/game/scenes/station-menu-scene.test.ts` — rewritten: updated layout tests (HUB title/white, === rule, no UNDOCK in items); replaced UNDOCK keyboard/tap tests with ESC→onShip and nav-button tap tests; added nav bar row 0/1 assertions
- `src/game/scenes/trader-scene.test.ts` — all constructors updated to two-callback form; trader name color updated to white; BACK test renamed onHub; added nav bar row 0/1 tests and [UNDOCK]/[HUB] tap tests
- `src/game/scenes/mission-board-scene.test.ts` — same updates as trader scene tests
- `src/main.ts` — `goToTrader` and `goToMissionBoard` now pass `goToShip` as second argument
- `terminal.ts` — same wiring update as `src/main.ts`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 214/214 tests passed (13 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 21.67 kB)

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — must show 13 test files, 214 tests passed
3. **Browser** `npm run dev` — navigate to station:
   - Hub: "ELYSIUM STATION" at top (bright-cyan), "[UNDOCK]" centered below (white), "HUB" scene title, two menu items (TRADER / MISSION BOARD), no UNDOCK item
   - Press ESC at hub → goes to Ship scene; DOCK returns to hub
   - Open TRADER: "ELYSIUM STATION" at top, "[UNDOCK] [HUB]" below; tap `[HUB]` → hub; tap `[UNDOCK]` → Ship; ESC → hub
   - Repeat above from MISSION BOARD
4. **Terminal** `npm run terminal`: nav bar visible at top of each station screen; ESC navigates correctly

---

### 017 · Static Starfield with Twinkling — Ship Scene

**Built:**
- `src/game/scenes/Starfield.ts` — replaced scrolling parallax model with stationary stars;
  removed `y`, `twinkleTimer`, `twinkled` fields; added `row` (integer, fixed), `twinklePhase`
  (radians, LCG-seeded to `[0, 2π)`), `twinklePeriod` (LCG-assigned per-layer range: L0 4000–9000 ms,
  L1 2000–5000 ms, L2 800–2500 ms); `update()` advances phase via `(2π / period) * dt`; `render()`
  maps `sin(phase)` to dim / normal / bright colour states (L0 dim = not rendered; L1 dim =
  `bright-black`; L2 dim = `white`); layer counts corrected to 18/10/5; bounds remap on first
  `render()` still scales initial positions to actual screen size
- `src/game/scenes/Starfield.test.ts` — removed all scrolling and twinkle-timer tests; added
  tests for integer row, twinklePhase in `[0, 2π)`, twinklePeriod in layer range, LCG
  determinism for phases/periods, row/col unchanged after update, phase-advance formula,
  and all three brightness state → colour mappings (bright / normal / dim) for all three layers

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 190/190 tests passed (12 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 20.28 kB)

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — must show 12 test files, 190 tests passed
3. **Browser:** `npm run dev` — navigate main menu → story → station → UNDOCK → Ship scene
   - Stars are stationary — no rain/scrolling effect
   - Over 10 s, individual stars smoothly brighten and dim; some distant `.` stars blink out
   - Layer 2 (`+`) stars twinkle noticeably faster than layer 0 (`.`) stars
   - Space station continues its Lissajous drift unchanged
4. **Terminal:** `bun terminal.ts` — same navigation; observe twinkling and station drift

---

### 021 · Writer Role

**Built:**
- `docs/agent/roles/WRITER.md` — full role instructions: tone guide, doc type
  responsibilities, cross-reference checklist, narrative rules
- `CLAUDE.md` — updated to list seven roles (added Writer) and added
  `build:docs`, `build:map`, `build:all` commands (stub entries for 022/023)
- `docs/world/systems/` — all four system docs updated with `map_position`
  fields (required by Feature 023); `_template.md` updated with schema entry
- `docs/features/022-world-docs-publisher.md` — full spec (READY)
- `docs/features/023-galaxy-map.md` — full spec (READY, depends on 022)

**Evidence:** Documentation-only. No code changes; no tests required.

**Play-test instructions:** Not applicable.

---

### 022 · World Docs HTML Publisher

**Built:**
- `scripts/lib/parse-world.ts` — walks `docs/world/**/*.md`, skips `_template.md` files, parses front matter + body via `gray-matter`; returns `WorldDoc[]` with `{ path, category, id, data, content }`
- `scripts/lib/html-template.ts` — `page(title, breadcrumbs, body)` helper; inline CSS with black background, Share Tech Mono / VT323 fonts, 16-colour palette matching `colors.css`; breadcrumb header in bright-cyan; footer in dim
- `scripts/build-docs.ts` — renders all world docs to `dist/docs/`: category index pages with sortable tables, detail pages with front-matter table + rendered markdown body, `dist/docs/index.html` listing all categories; cross-reference fields (`major_factions`, `destinations`, `system`, `home_system`, `influence`) rendered as hyperlinks; `dist/docs/commodities.html` as a table from front-matter list
- `scripts/build-landing.ts` — writes `dist/index.html` with game title, tagline, and three tiles: `[PLAY GAME]`, `[WORLD DOCS]`, `[GALAXY MAP]` (dimmed, "coming soon" until Feature 023)
- `scripts/build-map.ts` — stub; no-op until Feature 023
- `vite.config.ts` — `base` changed to `/untitled-space-game/game/`; `build.outDir` set to `dist/game`; game assets no longer overwrite landing page
- `package.json` — added `build:docs`, `build:map`, `build:landing`, `build:all` scripts
- `.github/workflows/deploy.yml` — added `oven-sh/setup-bun@v2` step; `npm run build` → `npm run build:all`; deploys entire `dist/` tree
- `gray-matter ^4.0.3` and `marked ^18.0.3` added as `devDependencies`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 214/214 tests passed (13 test files)
- `npm run build`: ✓ Vite build → `dist/game/` (21.66 kB JS)
- `npm run build:all`: ✓ game + 51 docs HTML pages + stub map + landing page; all cross-reference links resolve correctly

**Play-test instructions:**
1. `bash init.sh` — must print `=== Environment ready ===`
2. `npm run build:all` — must complete with no errors
3. Verify `dist/` tree: `index.html`, `game/index.html`, `docs/index.html`, `docs/systems/sol.html`, `docs/destinations/elysium-station.html`, `docs/factions/terran-union.html`, `docs/ships/scout.html`, `docs/story/first-jump.html`, `docs/commodities.html`
4. Open `dist/index.html` in browser: landing page shows three tiles; GALAXY MAP is dimmed
5. Click WORLD DOCS → `dist/docs/index.html`: six category links; click Systems → sol detail page; verify faction/destination links work
6. Click PLAY GAME → game loads correctly from `dist/game/`

---

### 018 · World Data Schemas & Seed Content

**Built:**
- `docs/features/018-world-data-schemas.md` — full spec for all world document types
- `docs/features/019-world-data-types.md` — full spec for TypeScript types feature
- `docs/world/systems/` — four system docs (`sol`, `alpha-centauri`, `barnards-star`,
  `wolf-359`) updated with `zone`, `danger_level`, `destinations` fields; typo
  `alpha-centurai` corrected; `_template.md` updated
- `docs/world/destinations/` — new directory (renamed from `stations/`); `_template.md`
  with `location_type` field; ten destination docs with full amenities front matter
  (`elysium-station`, `galileo-transfer`, `tycho-orbital`, `mars-anchor`,
  `new-horizon-port`, `hestia-ring`, `redline-station`, `kepler-yard`, `drift-market`,
  `blackwake-yard`)
- `docs/world/story/` — new directory; `_template.md` for story beats; three seed
  beats (`opening-arrival`, `first-jump`, `enter-wolf-359`)
- `docs/world/factions/` — six faction docs (`terran-union`, `helios-directorate`,
  `centauri-trade-league`, `independent-miners-guild`, `free-captains`,
  `grey-market-cartel`)
- `docs/world/ships/` — three ship docs (`freighter`, `scout`, `hauler`); `_template.md`
  updated
- `docs/world/commodities.md` — twelve commodities across four categories
- `docs/world/navigation/jump-routes.md` — full five-route connected graph across
  all four systems; broken `epsilon-eridani` reference removed

**Evidence:**
- All destination ids in system `destinations` lists resolve to docs in
  `docs/world/destinations/`
- All faction ids in system `major_factions` lists resolve to docs in
  `docs/world/factions/`
- All route endpoints reference system ids that have docs in `docs/world/systems/`
- All ship `default_jump_drive` ids reference drives in `jump-drives.md`
- No code changes — documentation only

**Play-test instructions:**
- Not applicable (documentation-only feature)

---

### 012 · Animated Starfield & Space Station View — Ship Scene

**Built:**
- `src/game/scenes/station-types.ts` — new file; four built-in `SpaceStationDef` constants: BEACON (2×3, bright-yellow), RELAY (3×5, bright-yellow), RING (3×3, cyan), HUB (5×5, white)
- `src/game/scenes/Starfield.ts` — new class; 33 stars across three layers (18 `.` bright-black/1.5 r/s, 10 `*` white/4.0 r/s, 5 `+` bright-white/9.0 r/s); LCG seed 42; per-star twinkle timer [800–3000 ms]; bounds cached from `render()` call and used in `update()` for wrap; `getStars()` test accessor
- `src/game/scenes/SpaceStation.ts` — new class; anchor placed at 50% vertical / 60% horizontal of interior; Lissajous drift (AMP_ROW=2, AMP_COL=3, periods 9 s and 12 s); clamps to interior bounds; `getDisplayPosition()` test accessor; space chars in glyph skipped during render
- `src/game/scenes/ShipScene.ts` — new cockpit window border (row 2: `\___/`, rows 3–25: `|` sides, row 26: `|_____|` sill, row 27: `/     \` corners); buttons moved to single row `h-2` side-by-side; lazy-init of `SpaceStation` on first `render()`; `update()` forwards to starfield and station; tap detection splits row at `w/2`
- `src/game/scenes/Starfield.test.ts` — 20 tests covering initialisation, layer distribution, LCG determinism, y/col bounds, speed advancement, wrap, twinkle timer, all three layer colours, twinkle colour overrides, draw-order overwrite
- `src/game/scenes/SpaceStation.test.ts` — 9 tests covering anchor row at t=0, interior bounds, drift change, quarter/full-period clamping, large-dt safety, glyph render, space-skip, overwrite
- `src/game/scenes/ship-scene.test.ts` — updated; removed old static starfield tests; added border row assertions, interior non-space check, animation forwarding tests; button tests updated to single BUTTONS_ROW; footer/touch rows updated to `h-1`/`h-2`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 190/190 tests passed (12 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 20.29 kB)
- `init.sh` (before and after): ✓ passes clean

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — must show 12 test files, 190 tests passed
3. **Browser:** `npm run dev` — navigate main menu → story → station → UNDOCK → Ship scene
   - Cockpit window border visible (corners `\`/`/`, underscores top/bottom, pipes sides)
   - Three star layers scroll downward at visibly different speeds
   - RELAY station visible right-of-centre, drifting slowly on Lissajous path
   - Stars twinkle (colour change) periodically over 10 s observation
   - JUMP and DOCK buttons on single row at bottom; cursor moves with ↑↓; ENTER on DOCK returns to station
4. **Terminal:** `bun terminal.ts` — same navigation; observe star motion and station drift

---

### 014 · Adaptive Height, Border Removal & Screen Centering Fix

**Built:**
- `src/shared/types.ts` — replaced `GRID_HEIGHT = 30` with `MIN_GRID_HEIGHT = 30` and `MAX_GRID_HEIGHT = 50`
- `src/platform/dom/DOMRenderer.ts` — fixed `measureChar()` font from `VT323` to `Share Tech Mono`; added `private gridH = MIN_GRID_HEIGHT`; updated `applyScale()` to compute adaptive row count clamped to 30–50, fire `onResize` handlers when height changes; `getHeight()` now returns `this.gridH`
- `src/platform/terminal/TerminalRenderer.ts` — `getHeight()` now reads `process.stdout.rows` clamped to `MIN_GRID_HEIGHT`/`MAX_GRID_HEIGHT`
- `src/game/scenes/MainMenuScene.ts` — removed `drawBorder` import and call
- `src/game/scenes/BaseMenuScene.ts` — removed `drawBorder` import and call
- `src/game/scenes/StoryScene.ts` — removed `drawBorder` import and call; removed `FOOTER_ROW = 27` constant; footer now uses `h - 3`
- `src/game/scenes/TraderScene.ts` — removed `drawBorder` import and call; `contentWidth` changed from `w - 3` to `w - 2`
- `src/game/scenes/MissionBoardScene.ts` — removed `drawBorder` import and call; `contentWidth` changed from `w - 3` to `w - 2`
- `src/platform/dom/DOMRenderer.test.ts` — updated import to `MIN_GRID_HEIGHT`; `getHeight()` assertion uses `MIN_GRID_HEIGHT`
- `src/platform/terminal/TerminalRenderer.test.ts` — same import and assertion update
- All 5 scene test files — replaced `'renders a border…'` tests with `'does not render a border'` negative assertions
- `src/game/scenes/story-scene.test.ts` — footer row assertions now use `h - 3`; retitled `tap on row 0 (border)` → `tap on row 0 (empty row)`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 156/156 tests passed (10 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 17.41 kB)
- `init.sh` (before and after): ✓ passes clean

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — must show 10 test files, 156 tests passed
3. **Browser centering**: `npm run dev` — open browser; `<pre>` should have equal space on both sides at any viewport width
4. **Adaptive height**: resize DevTools to tall narrow shape (~375×812 px) — grid should have more than 30 rows of content area
5. **No borders**: navigate all scenes (main menu, story, station, trader, mission board, ship) — no `+`/`-`/`|` frame on any screen

---

### 011 · Game Scenes — Trader, Mission Board, Ship

**Built:**
- `src/game/scenes/TraderScene.ts` — implements `Scene`; constructor takes `(inputHandler, context, onBack)`; data: `TRADERS` constant with one trader (MERCHANT KESS) with 6-item buy/sell lists; tab state (`BUY`/`SELL`), cursor navigation (UP/DOWN wrap, LEFT/RIGHT switches tab and resets cursor), SELECT logs item name placeholder, BACK fires `onBack()` with activated guard; `onTap` handles tab-column detection and item-row tap; `render()` clears to black, draws border, bright-cyan title, cyan rule, tab bar ([BUY]/[SELL] at cols 10/17), item list with left-aligned name + dots + right-aligned price, bright-black footer
- `src/game/scenes/MissionBoardScene.ts` — implements `Scene`; constructor takes `(inputHandler, context, onBack)`; data: `MISSIONS` constant (7 missions, types rescue/delivery/combat/salvage); cursor navigation (UP/DOWN wrap), SELECT logs mission title placeholder, BACK fires `onBack()` with activated guard; `onTap` detects mission row taps; `render()` clears to black, draws border, bright-cyan title, cyan rule, mission rows with bright-yellow type icon `[X]`, white title, bright-green reward, dotted fill; bright-black footer
- `src/game/scenes/ShipScene.ts` — implements `Scene`; constructor takes `(inputHandler, context, onBack)`; data: `INITIAL_STATE = { fuel:100, cargo:0, cargoCapacity:50, credits:5000 }`; deterministic LCG starfield (60 stars, seed 0xabcd1234, rows 1–24); two-button cursor (JUMP/DOCK, row 25/26) with UP/DOWN wrapping, SELECT logs `[Ship] Jumping…`/`[Ship] Docking…`, BACK fires `onBack()` with activated guard; `onTap` handles JUMP/DOCK rows; `render()` clears to black, bright-cyan status bar at row 0, starfield (bright-black `.`/`*`), centered button labels in bright-yellow with cursor prefix, footer at row 27
- `src/game/scenes/trader-scene.test.ts` — 18 tests covering layout, tab rendering, item list, cursor navigation, tab switching, SELECT/BACK, tap on tabs, tap on items
- `src/game/scenes/mission-board-scene.test.ts` — 17 tests covering layout, type icons, rewards, cursor navigation, SELECT/BACK, tap on missions
- `src/game/scenes/ship-scene.test.ts` — 19 tests covering no-border layout, status bar, starfield, button layout/colours, cursor navigation, SELECT/BACK, tap on buttons
- `src/game/scenes/StationMenuScene.ts` — updated constructor: takes `(inputHandler, context, onTrader, onMissionBoard, onShip)`; TRADER/MISSION BOARD/UNDOCK items now fire their respective callbacks instead of console.log placeholders
- `src/game/scenes/station-menu-scene.test.ts` — updated all 18 tests to pass three callbacks; assertions changed from `consoleSpy` to `expect(onTrader/onMissionBoard/onShip).toHaveBeenCalledTimes(1)`; added `makeScene` helper
- `src/main.ts` — added imports and `goToTrader`, `goToMissionBoard`, `goToShip` callbacks; `goToStation` now passes all three callbacks to `StationMenuScene`
- `terminal.ts` — same scene wiring as `src/main.ts`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 154/154 tests passed (10 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 17.44 kB)

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — must show 10 test files, 154 tests passed
3. **Browser:** Run `npm run dev` — open browser; main menu → Enter → story → Enter → station menu (ELYSIUM STATION)
   - Navigate to TRADER, press Enter → Trader scene with MERCHANT KESS title, [BUY]/[SELL] tabs, item list with prices; LEFT/RIGHT switches tabs; ESC returns to station
   - From station, navigate to MISSION BOARD, press Enter → Mission Board with 7 missions, type icons [R]/[D]/[C]/[S] in bright-yellow, rewards in bright-green; ESC returns to station
   - From station, navigate to UNDOCK, press Enter → Ship scene with status bar (FUEL:100%), starfield of dots/stars, JUMP/DOCK buttons; UP/DOWN moves cursor between buttons; Enter logs placeholder; ESC returns to station
4. **Terminal:** Run `bun terminal.ts` — same navigation flow as browser; q to quit

---

### 010 · Space station menu screen

**Built:**
- `src/game/scenes/BaseMenuScene.ts` — new abstract base class; constructor takes `(title, items, inputHandler, context)`; handles cursor navigation (UP/DOWN wrap-around), `activated` guard (set on SELECT or tap before calling the item action), `onTap` mapping (row → item starting from row 14), and `render()` (clear to black, white border, bright-cyan title centred at row 2, cyan `=` rule at row 3 matching title width, bright-green/white items centred from row 14, bright-black footer hint at h-3); `update()` no-op
- `src/game/scenes/StationMenuScene.ts` — extends `BaseMenuScene`; constructor takes `(inputHandler, context, onUndock)`; passes `STATION_NAME.toUpperCase()` as title and three items: TRADER (logs placeholder), MISSION BOARD (logs placeholder), UNDOCK (calls `onUndock`)
- `src/game/scenes/station-menu-scene.test.ts` — 18 tests: border, title row/colour, rule row/colour, items at rows 14–16, cursor starts on TRADER, DOWN cycles through all three and wraps, UP from TRADER wraps to UNDOCK, SELECT on TRADER logs placeholder, SELECT on MISSION BOARD logs placeholder, SELECT on UNDOCK calls onUndock once then silences, tap rows 14/15/16 activate correct items, tap non-item row does nothing, input silenced after any selection, keyboard footer hint, touch footer hint, update no-throw
- `src/main.ts` — scene wiring updated: `goToStation` creates `StationMenuScene` with `goToMainMenu` as `onUndock`; `goToStory` now passes `goToStation` as `onContinue`; full chain: `MainMenuScene` → `StoryScene` → `StationMenuScene` → `MainMenuScene`
- `terminal.ts` — same scene wiring as `src/main.ts`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 100/100 tests passed (7 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 9.74 kB)
- `init.sh` (before and after): ✓ passes clean

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — must show 7 test files, 100 tests passed
3. **Browser:** Run `npm run dev` — open browser; main menu appears; press Enter on NEW GAME → story screen; press Enter → station menu appears with border, "ELYSIUM STATION" in cyan at top, `===============` rule below, TRADER/MISSION BOARD/UNDOCK items with green cursor on TRADER; navigate with ↑↓; press Enter on TRADER → console logs `[Station] Opening trader…`; navigate to UNDOCK and press Enter → returns to main menu
4. **Terminal:** Run `bun terminal.ts` — main menu renders; Enter → story; Enter → station menu; navigate to UNDOCK and press Enter → returns to main menu
5. On touch browser (DevTools emulation): tap TRADER/MISSION BOARD rows → logs placeholder; tap UNDOCK → returns to main menu; footer shows `tap an option to select`

---

### 009 · Story intro screen

**Built:**
- `src/game/constants.ts` — new file; exports `STATION_NAME = 'Elysium Station'` as the single source of truth for the station name
- `src/shared/buffer-utils.ts` — new file; exports `writeText`, `writeCentered`, `drawBorder` extracted from `MainMenuScene` so all scenes share the same helpers
- `src/game/scenes/StoryScene.ts` — full implementation: constructor takes `(inputHandler, context, onContinue)`; registers `onAction` (SELECT fires `onContinue` once then sets `activated`) and `onTap` (any tap fires `onContinue` once); BACK is ignored; `render` clears buffer to black, draws white border, renders `YEAR  2284` centred in bright-yellow on row 2, all 11 story text lines in white at col 2, keyboard or touch footer hint in bright-black at row 27
- `src/game/scenes/story-scene.test.ts` — 17 tests: layout/clear, border, year header colour/position, all three story paragraphs at correct rows, closing line, keyboard footer, touch footer, line-length bound, SELECT fires once, second SELECT ignored, tap fires once, tap on any row fires, second tap ignored, BACK no effect, update no throw
- `src/game/scenes/MainMenuScene.ts` — updated to import helpers from `buffer-utils`; constructor signature changed from `(inputHandler, context)` to `(inputHandler, context, onNewGame: () => void)`; NEW GAME action now calls `onNewGame()` instead of logging
- `src/game/scenes/main-menu-scene.test.ts` — updated all 22 tests to pass `onNewGame` as `vi.fn()` or a named mock; assertions changed from `consoleSpy` to `expect(onNewGame).toHaveBeenCalledTimes(1)`
- `src/main.ts` — scene wiring: `currentScene` variable; `goToStory` callback creates `StoryScene` with placeholder `onContinue`; `MainMenuScene` constructed with `goToStory`; loop renders `currentScene`
- `terminal.ts` — same scene wiring as `src/main.ts` for the terminal entry point

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 82/82 tests passed (6 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 8.32 kB)
- `init.sh` (before and after): ✓ passes clean

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — must show 6 test files, 82 tests passed
3. **Browser:** Run `npm run dev` — open browser; main menu appears; press Enter on NEW GAME — story screen appears with border, "YEAR  2284" in yellow, story text in white, keyboard footer at bottom; press Enter — console logs `[Story] Arriving at Elysium Station…`
4. **Terminal:** Run `bun terminal.ts` — main menu renders; press Enter → story screen renders with the same layout; press Enter again → logs `[Story] Arriving at Elysium Station…`
5. On touch browser (DevTools emulation): tap NEW GAME → story screen; tap anywhere → logs `[Story] Arriving at Elysium Station…`; footer shows `[ TAP TO CONTINUE ]`

---

### 006 · Main menu screen

**Built:**
- `src/shared/types.ts` — added `Scene` interface (`update(dt: number): void; render(buffer: CharBuffer): void`)
- `src/game/scenes/MainMenuScene.ts` — full implementation: constructor takes `(inputHandler, context)`; registers `onAction` (UP/DOWN wrap cursor, SELECT activates) and `onTap` (direct row-to-item activation); `render` draws title block (bright-cyan, rows 4 & 7, 0-indexed), tagline (white, row 14), menu options (bright-green cursor + white unselected, starting row 21), and footer hint (bright-black, row 57 — only if grid ≥ 58 rows tall); QUIT only added in terminal context; `activated` flag silences further input after selection
- `src/game/scenes/main-menu-scene.test.ts` — 21 tests covering: layout/clear, title & tagline rendering, cursor colour, footer hint (keyboard/touch/absent), browser vs terminal item sets, DOWN/UP/SELECT/BACK keyboard nav, wrap-around, post-activation silence, touch tap on item row, touch tap on non-item row, QUIT via touch (process.exit mocked)
- `src/platform/terminal/process.d.ts` — extended `stdin.on` with `'close' | 'end'` overload
- `terminal.ts` — replaced test pattern with 30fps `setInterval` game loop (MainMenuScene + buffer allocation); added `process.stdin.on('close', ...)` so process exits cleanly when stdin is piped (init.sh check)
- `src/main.ts` — replaced test pattern with `requestAnimationFrame` game loop (MainMenuScene + buffer allocation per frame); `input.connect()` called before scene construction

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 65/65 tests passed (5 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 7.20 kB)
- `init.sh` (before and after): ✓ passes clean

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — must show 5 test files, 65 tests passed
3. **Browser:** Run `npm run dev` — open browser; main menu should appear with "UNTITLED" and "SPACE GAME" title in cyan, tagline, and "NEW GAME" option with green cursor; press Down (no effect — single item), Enter — console logs `[MainMenu] Starting game…`; keyboard hint shows in footer
4. **Terminal:** Run `bun terminal.ts` — main menu renders in terminal; press Down to move cursor to QUIT, Enter to quit; UP wraps back to NEW GAME
5. On a touch-capable browser: swipe or use DevTools touch emulation — footer shows "tap an option to select"; tapping the NEW GAME row activates it immediately

---

### 005 · Keyboard input handler (terminal)

**Built:**
- `src/platform/terminal/process.d.ts` — extended with `exit(code?: number): never` and `stdin` shape (`isTTY?`, `setRawMode?`, `resume`, `on`, `removeListener`)
- `src/platform/terminal/TerminalInputHandler.ts` — full implementation: `onAction(handler)` registers callbacks; `connect()` sets raw mode via optional `setRawMode?.()`, calls `resume()`, attaches `data` listener; `disconnect()` removes listener and restores cooked mode; key map covers arrow keys → UP/DOWN/LEFT/RIGHT, `\x1b[5~`/`\x1b[6~` → PAGE_UP/PAGE_DOWN, `\r`/`\n` → SELECT, bare `\x1b` → BACK, `p`/`P` → PAUSE; `q`, `Q`, `\x03` call `process.exit(0)`; constructor accepts optional `stdin` parameter for testability (defaults to `process.stdin`)
- `src/platform/terminal/TerminalInputHandler.test.ts` — 20 tests: connect/disconnect lifecycle, all 11 key mappings, multiple handlers, no events after disconnect, unmapped keys ignored, q/Q/Ctrl+C trigger exit
- `terminal.ts` — registers smoke-test `onAction` logger and calls `connect()`
- `init.sh` — terminal entry check changed from `bun --check terminal.ts` to `bun terminal.ts < /dev/null` (stdin EOF causes clean exit after connect)

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 44/44 tests passed (4 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 5.75 kB)
- `init.sh` (before and after): ✓ passes clean

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — must show 4 test files, 44 tests passed
3. Run `npm run terminal` — terminal enters raw mode; press arrow keys, Enter, Escape, P — each must log `GameAction: <ACTION>`; press `q` to quit

---

### 008 · Colocate unit tests with source modules

**Built:**
- `src/tests/scaffold.test.ts` — deleted; four describe blocks extracted into colocated files
- `src/tests/dom-input-handler.test.ts` — deleted; content merged into colocated file below
- `src/platform/dom/DOMRenderer.test.ts` — `describe('DOMRenderer')` block (4 tests)
- `src/platform/terminal/TerminalRenderer.test.ts` — `describe('TerminalRenderer')` block (3 tests)
- `src/platform/terminal/TerminalInputHandler.test.ts` — `describe('TerminalInputHandler')` block (1 test)
- `src/platform/dom/DOMInputHandler.test.ts` — scaffold smoke-test describe plus all 16 detailed keyboard/touch tests (17 tests)
- `vite.config.ts` — `include` pattern changed from `src/tests/**/*.test.ts` to `src/**/*.test.ts`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 25/25 tests passed (4 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 5.75 kB)
- `init.sh` (before and after): ✓ passes clean

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — must show 4 test files, 25 tests passed
3. Confirm `src/tests/` contains only `setup.ts` (no `.test.ts` files)
4. Confirm each colocated `.test.ts` sits next to its source module

---

### 004 · Touch controls (browser)

**Built:**
- `src/platform/dom/DOMInputHandler.ts` — full touch implementation alongside keyboard: `onTap(handler)` registers tap callbacks; `connect()` attaches `touchstart`/`touchend` listeners to `document.body` with `{ passive: false }`; touch positions tracked per identifier; on `touchend`: single tap (delta < 20px) fires all `onTap` handlers with grid col/row; swipe (dominant axis, delta ≥ 20px) fires UP/DOWN/LEFT/RIGHT action; two-finger tap (both deltas < 20px) fires BACK; `disconnect()` removes all touch listeners and clears state; `getGridCoords()` derives cell size from `.game-screen` data attributes and `getBoundingClientRect()`
- `src/platform/dom/DOMRenderer.ts` — `applyResize()` now writes `data-grid-cols` and `data-grid-rows` attributes on the `<pre>` element for coordinate lookup
- `index.html` — viewport meta updated to `user-scalable=no` to suppress pinch-zoom
- `src/tests/dom-input-handler.test.ts` — 11 new tests: correct grid coords on tap, multiple handlers, tap fires no action, all 4 swipe directions, swipe fires no tap, two-finger tap fires BACK, no events after disconnect, preventDefault on touch events

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 25/25 tests passed (2 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 5.75 kB)
- `init.sh` (before and after): ✓ passes clean

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm run dev` — open in browser DevTools with mobile device simulation enabled
3. Tap a cell — console must log `onTap: col=<N> row=<N>` (add a temp log in main.ts if needed)
4. Swipe up/down/left/right — must log `GameAction: UP/DOWN/LEFT/RIGHT`
5. Two-finger tap — must log `GameAction: BACK`
6. Pinch-zoom must be suppressed (page stays fixed)

---

### 003 · Keyboard input handler (browser)

**Built:**
- `src/platform/dom/DOMInputHandler.ts` — full implementation: `onAction(handler)` registers callbacks; `connect()` attaches a `keydown` listener to `document`; `disconnect()` removes it; key map covers ArrowUp/Down/Left/Right → UP/DOWN/LEFT/RIGHT, PageUp/Down → PAGE_UP/PAGE_DOWN, Enter → SELECT, Escape → BACK, P/p → PAUSE; arrow and page keys call `event.preventDefault()`
- `src/main.ts` — instantiates `DOMInputHandler`, registers a smoke-test `console.log` callback, and calls `connect()`
- `src/tests/dom-input-handler.test.ts` — 5 tests: all key mappings, multiple handlers called independently, `preventDefault` behaviour, no events after `disconnect`, unmapped keys ignored

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 14/14 tests passed (2 test files)
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 3.87 kB)
- `init.sh` (before and after): ✓ passes clean

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm run dev` — open browser, open DevTools console
3. Press ArrowUp, ArrowDown, ArrowLeft, ArrowRight, PageUp, PageDown, Enter, Escape, P — each must log `GameAction: <ACTION>` in the console, and the page must not scroll on arrow/page keys
4. No `GameAction` log on unmapped keys (e.g. A, Space)

---

### 007 · Responsive screen sizing

**Built:**
- `src/shared/types.ts` — replaced `GRID_WIDTH`/`GRID_HEIGHT` with `MIN_GRID_WIDTH = 20`, `MIN_GRID_HEIGHT = 30`, `MAX_GRID_WIDTH = 40`, `MAX_GRID_HEIGHT = 60`; added `onResize(handler)` to `Renderer` interface
- `src/platform/dom/DOMRenderer.ts` — measures char cell size once via `document.fonts.ready`; on construction and every debounced `window.resize` event (~100ms): clamps grid to min/max, scales font down if viewport smaller than min grid, sets explicit `<pre>` pixel width; fires all `onResize` handlers
- `src/platform/terminal/TerminalRenderer.ts` — reads `process.stdout.columns`/`process.stdout.rows` at construction, clamps to min/max, registers `SIGWINCH` listener (guarded by try/catch) to recompute and fire `onResize` handlers
- `src/platform/terminal/process.d.ts` — minimal ambient declaration for `process` global (avoids new package dependency)
- `src/main.ts` — uses `renderer.getWidth()`/`getHeight()` for test pattern, re-renders on resize
- `index.html` — added `html, body { overflow: hidden }`, changed `align-items` to `center`, `height: 100vh`, body background `#000000`
- `src/tests/setup.ts` — polyfills `document.fonts.ready` for jsdom test environment
- `vite.config.ts` — added `setupFiles: ['src/tests/setup.ts']`
- `src/tests/scaffold.test.ts` — updated dimension assertions to use `MAX_GRID_*` constants; added `onResize` callable tests for both renderers; added async resize handler test for DOMRenderer

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 9/9 tests passed
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.js 3.16 kB)
- `init.sh` (before and after): ✓ passes clean

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm run dev` — open browser; a grid of `#` characters fills the viewport (up to 40×60), cycling through all 16 foreground colours; no scrollbar visible
3. Resize the browser window — grid dimensions update and re-render without scrollbar appearing
4. Narrow the window below 320px — font scales down so the minimum 20×30 grid still fits
5. Run `bun terminal.ts` — prints `Grid: 40×60` (or actual terminal dimensions clamped to 20–40 × 30–60)

---

### 002 · CharBuffer and DOMRenderer

**Built:**
- `src/shared/types.ts` — added `GRID_WIDTH = 40` and `GRID_HEIGHT = 60` as the single source of truth for grid dimensions
- `src/platform/dom/DOMRenderer.ts` — full implementation: creates and owns a `<pre class="game-screen">` element, `drawBuffer` serialises each cell into `<span class="fg-X bg-Y">char</span>` with HTML escaping; `transparent` fg/bg omit the corresponding class; guarded for non-DOM environments
- `src/platform/dom/colors.css` — CSS custom properties on `:root` for all 16 named colours; `.fg-*` and `.bg-*` classes for each; swapping a theme requires only editing the `:root` block
- `index.html` — loads VT323 from Google Fonts; imports `colors.css`; body resets + centred layout; `.game-screen` styles (`white-space: pre`, VT323, `line-height: 1em`)
- `src/main.ts` — imports `colors.css`; renders a 40×60 test pattern of `#` characters cycling through all 16 foreground colours on a black background
- `src/platform/terminal/TerminalRenderer.ts` — updated to import `GRID_WIDTH`/`GRID_HEIGHT` from shared types

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 6/6 tests passed
- `npm run build`: ✓ Vite build OK (dist/assets/index-*.css 1.94 kB; dist/assets/index-*.js 1.92 kB)
- `init.sh` (before and after): ✓ passes clean

**Play-test instructions:**
1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm run dev` — open browser; a 40×60 grid of `#` characters should fill the screen, each row cycling through all 16 foreground colours (black, red, green, … bright-white) on a black background, rendered in VT323 font

---

### 001 · Scaffold: Vite + TypeScript + Bun project structure

**Built:**
- `package.json` with Vite + TypeScript + Vitest dev dependencies and all required scripts
- `tsconfig.json` — strict mode, `moduleResolution: "bundler"`, targets `src/**/*`
- `vite.config.ts` — base path `/untitled-space-game/` for GitHub Pages; Vitest config included
- `index.html` — browser entry (Vite)
- `src/main.ts` — browser bootstrap (detects touch vs keyboard, instantiates stubs)
- `src/shared/types.ts` — `Color`, `Cell`, `CharBuffer`, `Renderer`, `InputHandler`, `GameAction`, `GameContext`
- `src/platform/dom/DOMRenderer.ts` — no-op stub implementing `Renderer` (40×60 grid)
- `src/platform/dom/DOMInputHandler.ts` — no-op stub implementing `InputHandler`
- `src/platform/terminal/TerminalRenderer.ts` — no-op stub implementing `Renderer` (40×60 grid)
- `src/platform/terminal/TerminalInputHandler.ts` — no-op stub implementing `InputHandler`
- `terminal.ts` — Bun entry point
- `src/tests/scaffold.test.ts` — 6 tests verifying all stubs are instantiable and return correct dimensions
- `.github/workflows/deploy.yml` — builds on push to main, deploys `dist/` to `gh-pages` branch via peaceiris/actions-gh-pages
- `.gitignore`

**Evidence:**
- `tsc --noEmit`: ✓ zero errors
- `npm test`: ✓ 6/6 tests passed
- `npm run build`: ✓ Vite build OK (dist/index.html 0.32 kB)
- `bun --check terminal.ts`: ✓ exits 0
- `init.sh` (before and after): ✓ passes clean

**Play-test instructions:**
1. Clone repo, run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm run dev` — Vite dev server starts; open browser, console shows `Space game initialised — browser/keyboard`
3. Run `bun terminal.ts` — prints `Space game initialised — terminal/keyboard` and `Grid: 40×60`
