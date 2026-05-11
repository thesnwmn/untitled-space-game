# Feature 004 · Touch controls (browser)

**Goal:** Allow mobile users to control the game with tap and swipe gestures, using direct positional taps for menu navigation and directional swipes for future in-game input.

## Design rationale

Touch and keyboard navigation are intentionally different:

- **Menus:** A keyboard user moves a cursor incrementally (UP/DOWN) then presses SELECT. A touch user taps the item they want directly — no cursor movement required. Scenes that support touch use `onTap` to map grid coordinates to items.
- **In-game (future):** Touch controls for gameplay (e.g. drag, aim, swipe-to-move) will be specced per feature when needed. The directional swipes defined here serve as a fallback and are likely to be replaced or supplemented in a gameplay spec.

## Acceptance criteria

- Touch gesture handling is added to `DOMInputHandler` in `src/platform/dom/DOMInputHandler.ts` (the same class established in item 003), so a single `connect()` / `disconnect()` call activates both keyboard and touch.
- `DOMInputHandler` implements the optional `onTap(handler)` method from the `InputHandler` interface. Multiple registrations are all called independently.
- **Tap (single finger, delta < 20px):** calls all `onTap` handlers with the grid column and row of the tap. Does NOT fire a `SELECT` action — positional tap is a separate signal from direction-based SELECT.
- **Swipe (delta ≥ 20px, dominant axis):** fires the corresponding directional `GameAction` (UP / DOWN / LEFT / RIGHT). Dominant axis is whichever of `|dx|` or `|dy|` is larger.
- **Two-finger tap (both deltas < 20px):** fires `BACK`.
- Gesture is recognised on `touchend`. No raw `TouchEvent` data reaches game logic.
- `index.html` includes `<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">` to prevent pinch-zoom during play.
- Tested via browser DevTools touch simulation: tapping and swiping logs the correct grid coordinates / `GameAction` values to console.
- `tsc --noEmit` passes with zero errors.

## How menus use onTap

A menu scene registers an `onTap` handler and maps the received `row` to whichever menu item occupies that row in the buffer. If the row matches an item, it activates that item directly — equivalent to moving the cursor to it and pressing SELECT in one gesture. Rows that don't contain a menu item are ignored.

## Out of scope

- Multi-touch gestures beyond two-finger tap
- On-screen button overlay / virtual d-pad
- Haptic feedback
- In-game touch controls (specced per gameplay feature)

## Technical notes

- Listen on `document.body` for `touchstart` and `touchend` to catch all touch input regardless of where the user touches on screen.
- Track `touchstart` position per touch identifier. On `touchend`, compute `dx` and `dy` from the start position of the first touch.
- For `onTap` grid coordinate calculation: divide the tap's pixel coordinates by the character cell size. Cell size can be derived from the `<pre>` element's `offsetWidth / GRID_WIDTH` and `offsetHeight / GRID_HEIGHT`.
- Call `event.preventDefault()` on touch events to suppress the 300ms tap delay and default scroll behaviour.
- For two-finger tap: if `changedTouches.length === 2` at `touchend` and both touch deltas are < 20px, fire BACK.

## Dependencies

- 001 · Scaffold
- 003 · Keyboard input handler (browser) — touch handling lives in the same `DOMInputHandler` class
