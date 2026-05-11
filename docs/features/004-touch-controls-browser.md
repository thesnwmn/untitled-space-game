# Feature 004 · Touch controls (browser)

**Goal:** Allow mobile users to control the game with tap and swipe gestures on the game area, producing the same `GameAction` events as keyboard input.

## Acceptance criteria

- Touch gesture handling is added to `DOMInputHandler` in `src/platform/dom/DOMInputHandler.ts` (the same class established in item 003), so a single `connect()` / `disconnect()` call activates both keyboard and touch.
- Gesture mappings:

  | Gesture | GameAction |
  |---|---|
  | Swipe up (dominant axis, delta ≥ 20px) | UP |
  | Swipe down (dominant axis, delta ≥ 20px) | DOWN |
  | Swipe left (dominant axis, delta ≥ 20px) | LEFT |
  | Swipe right (dominant axis, delta ≥ 20px) | RIGHT |
  | Tap (touch delta < 20px, single finger) | SELECT |
  | Two-finger tap | BACK |

- Swipe direction is determined by the dominant axis (whichever of `|dx|` or `|dy|` is larger). Gesture is recognised on `touchend`.
- No raw `TouchEvent` data reaches game logic — only `GameAction` values.
- `index.html` includes `<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">` to prevent unintended pinch-zoom during play.
- Tested via browser DevTools touch simulation: swiping and tapping in the game area logs the correct `GameAction` values to console.
- `tsc --noEmit` passes with zero errors.

## Out of scope

- Multi-touch gestures beyond two-finger tap
- On-screen button overlay / virtual d-pad
- Haptic feedback

## Technical notes

- Listen on `document.body` for `touchstart` and `touchend` to catch all touch input regardless of where the user touches on screen.
- Track `touchstart` position per touch identifier. On `touchend`, compute `dx` and `dy` from the start position of the first touch.
- For two-finger tap: if `touches.length === 2` at `touchend` and both touch deltas are < 20px, fire BACK.
- Call `event.preventDefault()` on touch events to suppress the 300ms tap delay and default scroll behaviour.

## Dependencies

- 001 · Scaffold
- 003 · Keyboard input handler (browser) — touch handling lives in the same `DOMInputHandler` class
