# 004 · Touch Controls (Browser) — DONE

## What it added
Extended `DOMInputHandler` with touch gesture support: tap fires `onTap(col, row)` for direct positional selection, directional swipes fire UP/DOWN/LEFT/RIGHT `GameAction`s, and a two-finger tap fires BACK. Touch and keyboard are activated/deactivated with a single `connect()` / `disconnect()` call.

## Key files
- `src/platform/dom/DOMInputHandler.ts` — touch event listeners added to existing class
- `index.html` — `<meta name="viewport" content="... user-scalable=no">` to prevent pinch-zoom

## Architectural decisions embedded
- Tap fires `onTap` with grid coordinates (not a SELECT action) — positional selection is a separate signal from directional SELECT, allowing menus to directly activate the tapped item without cursor movement.
- Swipe threshold is 20 px; dominant axis determines direction.
- Two-finger tap (both deltas < 20 px) fires BACK.
