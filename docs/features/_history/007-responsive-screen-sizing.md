# 007 · Responsive Screen Sizing — DONE

## What it added
Replaced fixed grid constants with min/max bounds and made both renderers dynamically compute grid dimensions from available viewport/terminal space. `DOMRenderer` measures character cell size after font load, scales the font down when the viewport is too small to fit the minimum grid, and centers the `<pre>` with CSS when the viewport is larger than the max grid. `TerminalRenderer` reads `process.stdout.columns/rows` and listens for `SIGWINCH`.

## Key files
- `src/shared/types.ts` — `MIN_GRID_WIDTH`, `MIN_GRID_HEIGHT`, `MAX_GRID_WIDTH`, `MAX_GRID_HEIGHT` replacing fixed constants
- `src/platform/dom/DOMRenderer.ts` — font measurement, debounced resize handler, `onResize` callback
- `src/platform/terminal/TerminalRenderer.ts` — `SIGWINCH` listener, clamped `getWidth()` / `getHeight()`

## Architectural decisions embedded
- Character measurement uses a hidden `<span>` appended to body, wrapped in `document.fonts.ready` to ensure VT323 is loaded first; result is cached.
- `onResize` handlers are stored as an array; each `onResize()` call appends (does not replace).
- Font scaling only goes down (small viewports); oversized viewports get black padding via CSS flexbox centering, no upscaling.
