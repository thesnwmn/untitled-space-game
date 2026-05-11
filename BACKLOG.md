# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)
- DONE — built, verified, play-tested

---

## READY

### 007 · Responsive screen sizing
See docs/features/007-responsive-screen-sizing.md.

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
