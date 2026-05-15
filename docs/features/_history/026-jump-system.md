# 026 · Jump System — DONE

## What it added
Implemented a three-screen jump flow: `JumpMenuScene` lists reachable systems via `getRoutesFrom()`; `JumpAnimationScene` auto-advances after 5 000 ms with animated ellipsis and countdown; `SystemArrivalScene` lists destinations in the arrived system via world data. The orchestrators gained `currentSystemId` and `currentDestinationId` state variables, and `ShipScene` was updated to accept `destinationId` and call `onJump()`.

## Key files
- `src/game/scenes/JumpMenuScene.ts` — lists jump routes from current system; BACK returns to ship
- `src/game/scenes/JumpAnimationScene.ts` — timed 5-second animation; no input accepted
- `src/game/scenes/SystemArrivalScene.ts` — destination picker for the arrived system
- `src/game/scenes/ShipScene.ts` — `destinationId` constructor param; `onJump()` callback
- `src/main.ts` / `terminal.ts` — `currentSystemId`, `currentDestinationId` state; full scene wiring

## Architectural decisions embedded
- `JumpAnimationScene` takes no `InputHandler`; it accepts no player input by design.
- `JumpMenuScene` resolves the "other" system id from each route (handles both `from` and `to` directions).
- No BACK from `SystemArrivalScene` — the player must dock somewhere to proceed.
