# 016 · Hint Overlay — CANCELLED

## What it added
Specified moving all per-scene input hint text into a single game-wide `HintOverlay` component owning the last row (`h - 1`), and adding `H` key toggling via a new `TOGGLE_HINTS` `GameAction`. Would have added `getHint(): string | null` to the `Scene` interface and `showHints: boolean` to `GameContext`.

## Key files
- (never implemented)

## Architectural decisions embedded
- Cancelled because feature 028 (Common Screen Layout) removed hint text entirely. If hints return they will be part of `ScreenChrome` and togglable at that level. The `TOGGLE_HINTS` `GameAction` and `HintOverlay` class were never created.
