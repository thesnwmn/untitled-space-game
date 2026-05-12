# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)
- DONE — built, verified, play-tested

---

## READY

_(none)_

---

## NEEDS SPEC

_(none)_

---

## IN PROGRESS

_(none)_

---

## DONE

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
