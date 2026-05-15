# 002 · CharBuffer and DOMRenderer — DONE

## What it added
Established the core rendering primitive: a typed 2D character buffer (`CharBuffer`, `Cell`, `Color`) and a `DOMRenderer` that serialises it into `<span>` elements inside a `<pre>` tag. Set the fixed grid constants `GRID_WIDTH = 40` and `GRID_HEIGHT = 60` as the single source of truth for grid dimensions.

## Key files
- `src/shared/types.ts` — `CharBuffer`, `Cell`, `Color`, grid constants, `Renderer` interface
- `src/platform/dom/DOMRenderer.ts` — `DOMRenderer` implementing `Renderer`
- `src/platform/dom/colors.css` — `.fg-*` / `.bg-*` classes backed by CSS custom properties on `:root`
- `index.html` — loads VT323 font; `<pre>` is the only render target

## Architectural decisions embedded
- All 16 named colours plus `transparent` are handled via CSS classes; `transparent` fg/bg omits the class entirely so it inherits parent colour.
- Each frame `drawBuffer` replaces the full `innerHTML` of the `<pre>` — no diffing.
- Grid dimensions flow from a single constant definition; no scene may override them.
