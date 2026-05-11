# Feature 007 — Responsive Screen Sizing

**Goal:** Both renderers dynamically size the character grid to fill available space within fixed minimum and maximum bounds, never showing a browser scrollbar, and notify the game when dimensions change.

## Acceptance criteria

- `types.ts` replaces `GRID_WIDTH`/`GRID_HEIGHT` constants with `MIN_GRID_WIDTH = 20`, `MIN_GRID_HEIGHT = 30`, `MAX_GRID_WIDTH = 40`, `MAX_GRID_HEIGHT = 60`
- `Renderer` interface gains `onResize(handler: (width: number, height: number) => void): void`
- **DOMRenderer** — on construction and on every `window.resize` event (debounced ~100ms):
  - Measures actual pixel dimensions of one character cell at the base font size (done once after font loads via `document.fonts.ready`; result cached)
  - Computes `cols = clamp(floor(viewport_width / char_w), MIN_GRID_WIDTH, MAX_GRID_WIDTH)`, same for rows independently
  - If viewport is smaller than the minimum grid at base font: scales font down so the minimum grid fits exactly — no overflow, no scrollbar
  - If viewport is larger than the maximum grid at base font: renders at max size; CSS centers the `<pre>` in the viewport; body background provides black padding — no font scaling up
  - Otherwise: grid fills the viewport at base font size
  - Fires all registered `onResize` handlers with the new `(width, height)`
- **Browser scrollbars:** `html, body { overflow: hidden }` — the `<pre>` element never exceeds the viewport in either dimension
- **TerminalRenderer** — reads `process.stdout.columns` / `process.stdout.rows` at construction, clamps to min/max, listens for `SIGWINCH` to recompute and fire `onResize` handlers
- `DOMRenderer.getWidth()` / `getHeight()` return the current live grid dimensions
- `TerminalRenderer.getWidth()` / `getHeight()` return the current clamped terminal dimensions
- `src/main.ts` test pattern updated: uses `renderer.getWidth()`/`getHeight()` when building the demo buffer, and re-renders on resize
- `tsc --noEmit`, `npm test`, `npm run build`, and `init.sh` all pass clean

## Out of scope

- Adaptive layouts (different UI arrangements at different sizes) — scenes receive new dimensions via the callback but are not required to reflow
- HiDPI / device pixel ratio handling
- Scaling font size up for viewports larger than the max grid (those get black padding instead)

## Technical notes

- **Character measurement:** append a hidden `<span>` containing a known character to the body, call `getBoundingClientRect()`, then remove it. Wrap this in `document.fonts.ready` so VT323 is loaded before measuring; cache the result as it does not change with font size adjustments.
- **Font scaling below minimum:** `font_scale = min(viewport_width / (MIN_GRID_WIDTH × char_w), viewport_height / (MIN_GRID_HEIGHT × char_h))`. Apply as a CSS `font-size` override on `.game-screen`. Grid dimensions stay at the minimum values.
- **Pre element sizing:** set the `<pre>` element's width explicitly in pixels (`cols × char_w`) so the browser never word-wraps content. Height follows naturally from row count and line height.
- **Debounce:** trailing debounce of ~100ms on `window.resize` to avoid layout thrash during window drag.
- **onResize handlers:** stored as an array; each call to `onResize` appends a handler rather than replacing.
- **SIGWINCH:** registered via `process.on('SIGWINCH', ...)`. Guard with try/catch — some platforms do not support it.
- **Centering at max size:** achieved via existing CSS flexbox centering on `body`; no JS needed for the padding case.

## Dependencies

- 002 · CharBuffer and DOMRenderer (done)
