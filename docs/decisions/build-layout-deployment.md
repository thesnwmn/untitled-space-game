# Build, Layout & Deployment

## Build Tooling: Vite + TypeScript + Bun

**Vite** handles the browser build:
- Near-instant startup and hot module reloading
- First-class TypeScript support with no extra config
- Produces clean static files suitable for GitHub Pages deployment
- Minimal configuration overhead — stays out of the way

**Bun** handles the terminal build:
- Runs TypeScript natively with no compile step
- Bundles to a single installable executable (`bun build`)
- Handles raw stdin keyboard input cleanly

**TypeScript** is used for all game logic and rendering code:
- Type safety across the character buffer, game state, and UI layer
- Helps Claude Code make accurate, consistent changes across the codebase
- No additional frameworks (React, Vue, etc.) — vanilla TS only

**Scripts:**
```
npm run dev          → Vite dev server (browser)
npm run build        → Vite browser build → dist/game/
npm run build:docs   → Bun script → dist/docs/ (world doc HTML pages)
npm run build:map    → Bun script → dist/map/ (SVG galaxy map)
npm run build:all    → game + docs + map + landing page
bun run terminal.ts  → Run game in terminal directly
```

---

## Layout

The game uses a fixed character grid of **40 columns** wide. Height is adaptive:
- `MIN_GRID_HEIGHT = 30`, `MAX_GRID_HEIGHT = 50` (constants in `shared/types.ts`)
- **Browser:** `DOMRenderer` measures the pixel size of a character cell, computes an adaptive row count clamped to 30–50, and scales the font to fill the viewport. Fires `onResize` handlers when height changes.
- **Terminal:** `TerminalRenderer.getHeight()` reads `process.stdout.rows` clamped to the same range.

All scenes must be designed to work with `h` rows where `30 ≤ h ≤ 50`, using `renderer.getHeight()` rather than a fixed constant.

**No borders:** Screens do not use the `drawBorder` utility. Borders were removed in feature 014.

---

## Deployment

- Source hosted on GitHub (`thesnwmn/untitled-space-game`)
- Browser build deployed via GitHub Pages (`.github/workflows/deploy.yml` — triggers on push to `main`, deploys full `dist/` tree)
- Base path: `/untitled-space-game/game/` for the game; `/untitled-space-game/docs/` for world docs; `/untitled-space-game/map/` for the galaxy map
- Terminal build installable via Bun
- No local machine required for development — changes made via Claude Code on the web
