# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)
- DONE — built, verified, play-tested

---

## READY

### 016 · Hint Overlay

Add a `HintOverlay` that exclusively owns the last buffer row (`h - 1`) for input hint text. Extract hint rendering from all 6 scenes via a new `Scene.getHint()` method on the `Scene` interface. Add `showHints: boolean` to `GameContext` (default `true`) and wire `H`/`h` to a new `TOGGLE_HINTS` game action so the player can hide hints. See `docs/features/016-hint-overlay.md` for the full spec.

---

### 015 · Station Nav Bar

Add a two-row nav bar at rows 0–1 of every station-context screen. Row 0 shows the station name (all caps, `bright-cyan`, centered); row 1 shows centered `[LABEL]` nav buttons in `white`. Both are inputs from each scene. `StationMenuScene` shows `[UNDOCK]` only (title changes to "HUB", UNDOCK menu item removed, ESC now undocks). `TraderScene` and `MissionBoardScene` show `[UNDOCK] [HUB]` as a breadcrumb trail (outermost destination left, nearest right); tapping `[HUB]` or pressing ESC returns to hub, tapping `[UNDOCK]` goes to ship. Implement as a reusable `NavBar` component (`src/game/ui/NavBar.ts`) that caches button positions after `render()` for use in `hitTest()`. See `docs/features/015-nav-bar.md` for full spec.

**Depends on:** 011

---

### 013 · Menu Pagination

Add a reusable `Pager` component (`src/game/ui/Pager.ts`) that paginates item lists in `MissionBoardScene` and `TraderScene` when item count exceeds the visible content area height. A one-row pager bar `< Page N/X >` appears at the bottom of the content region; LEFT/RIGHT navigates pages in the Mission Board, PAGE_UP/PAGE_DOWN in the Trader (where LEFT/RIGHT is already used for tab switching). Tap the `<`/`>` arrows or swipe to page. Pages wrap. Cursor resets to the first item on each page change. See `docs/features/013-menu-pagination.md` for full spec.

**Depends on:** 011

---

## NEEDS SPEC

_(none)_

---

## IN PROGRESS

_(none)_

---

## DONE

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
- `src/game/scenes/StoryScene.ts` — full implementation: constructor takes `(inputHandler, context, onContinue)`; registers `onAction` (SELECT fires `onContinue` once then sets `activated`) and `onTap` (any tap fires `onContinue` once); BACK is ignored; `render` clears buffer to black, draws white border, renders `YEAR  2076` centred in bright-yellow on row 2, all 11 story text lines in white at col 2, keyboard or touch footer hint in bright-black at row 27
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
3. **Browser:** Run `npm run dev` — open browser; main menu appears; press Enter on NEW GAME — story screen appears with border, "YEAR  2076" in yellow, story text in white, keyboard footer at bottom; press Enter — console logs `[Story] Arriving at Elysium Station…`
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
