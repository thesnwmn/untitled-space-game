# 014 · Adaptive Height, Border Removal & Screen Centering Fix — DONE

## What it added
Addressed three presentation issues together: (1) increased the maximum grid height from 30 to 50 rows on tall viewports; (2) removed `drawBorder()` calls from all five scenes that used it, giving a cleaner terminal look; (3) fixed `DOMRenderer.measureChar()` to measure Share Tech Mono instead of VT323, correcting left-alignment caused by wrong character cell dimensions.

## Key files
- `src/shared/types.ts` — `MIN_GRID_HEIGHT = 30`, `MAX_GRID_HEIGHT = 50` replacing fixed `GRID_HEIGHT = 30`
- `src/platform/dom/DOMRenderer.ts` — font measurement fix; adaptive height computation in `applyScale()`
- `src/platform/terminal/TerminalRenderer.ts` — live `process.stdout.rows` clamped to min/max in `getHeight()`
- Five scene files — `drawBorder()` call removed from each

## Architectural decisions embedded
- Scale formula ensures the minimum grid fits when the viewport is too small; maximum grid gets CSS centering with black padding — no upscaling.
- `drawBorder()` retained in `buffer-utils.ts` for potential future pop-up overlay use; only removed from scene render paths.
- `StoryScene` footer changed from hardcoded `row 27` to relative `h - 3` to work at any grid height.
