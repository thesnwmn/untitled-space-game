# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)
- DONE — built, verified, play-tested

---

## READY

### 003 · Keyboard input handler (browser)
See docs/features/003-keyboard-input-browser.md.

### 004 · Touch controls (browser)
See docs/features/004-touch-controls-browser.md.

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
