# 024 · NavBar Keyboard Shortcuts — CANCELLED

## What it added
Specified wiring digit keys `1`–`9` to `NAV_1`–`NAV_9` `GameAction` values and making `NavBar` self-register its own input handlers at construction time, so scenes did not need separate nav `onAction`/`onTap` blocks. `render()` would gain a `showIndices` flag to display buttons as `[1:LABEL]` in keyboard mode.

## Key files
- (never implemented as a standalone feature)

## Architectural decisions embedded
- The `NAV_1`–`NAV_9` GameActions and digit-key wiring were implemented as part of feature 028 (Common Screen Layout), which deleted `NavBar` entirely and replaced it with `ScreenChrome`. The footer nav in `ScreenChrome` uses the same numbered-key approach specified here. The separate `NavBar.inputHandler` constructor parameter and `showIndices` render flag were never built.
