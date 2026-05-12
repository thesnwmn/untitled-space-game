# Feature 002 · CharBuffer and DOMRenderer

**Goal:** Establish the core rendering primitive — a typed 2D character buffer and a DOM renderer that paints it to a `<pre>` element — giving all subsequent scenes a working display layer.

## Acceptance criteria

- `CharBuffer`, `Cell`, `Color` types and `GRID_WIDTH = 40`, `GRID_HEIGHT = 60` constants are exported from `src/shared/types.ts`, matching the definitions in DECISION_REGISTER.md exactly.
- `DOMRenderer` lives in `src/platform/dom/DOMRenderer.ts` and implements the `Renderer` interface.
- `DOMRenderer.drawBuffer(buffer)` serialises the buffer into `<span class="fg-X bg-Y">char</span>` elements inside a single `<pre>` element, with a newline character between each row.
- `src/platform/dom/colors.css` defines `.fg-*` and `.bg-*` classes for all 16 named colours plus `transparent`. Actual RGB values are held in CSS custom properties on `:root` (e.g. `--color-green: #00aa00;`), and the classes reference those variables. Swapping a colour theme requires only editing the `:root` block.
- `transparent` fg/bg: cells with `transparent` colour omit the corresponding class entirely; they inherit whatever CSS colour is already set.
- `index.html` loads the VT323 font from Google Fonts and imports `colors.css`. The `<pre>` is the only element the renderer writes to.
- `GRID_WIDTH` and `GRID_HEIGHT` are the single source of truth for grid dimensions across the codebase.
- Running `npm run dev` displays a test pattern: the full 40×60 grid filled with `#` characters, each row using a different foreground colour cycling through all 16 named colours, all on a black background. This confirms the grid, colour classes, and font are all wired up correctly.
- `tsc --noEmit` passes with zero errors.

## Out of scope

- `TerminalRenderer` (separate backlog item)
- Any animation, game loop, or scene management
- Input handling

## Technical notes

- The `<pre>` element should use `white-space: pre` and the VT323 monospace font. CSS should ensure it is centred and letterboxed as described in DECISION_REGISTER.md (no JavaScript layout logic needed).
- Each frame, `drawBuffer` replaces the full `innerHTML` of the `<pre>`. No diffing or partial updates.
- Consecutive cells with identical fg and bg can share a single `<span>` to reduce DOM node count — but this is an optimisation and not required for this item.

## Dependencies

- 001 · Scaffold
