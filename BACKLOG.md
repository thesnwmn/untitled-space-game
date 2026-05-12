# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)
- DONE — built, verified, play-tested

---

## READY

### 005 · Keyboard input handler (terminal)
See docs/features/005-keyboard-input-terminal.md.

### 006 · Main menu screen
See docs/features/006-main-menu-screen.md.

---

## NEEDS SPEC

_(none)_

---

## IN PROGRESS

_(none)_

---

## DONE

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
