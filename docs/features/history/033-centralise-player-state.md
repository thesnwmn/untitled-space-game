# 033 · Centralise Player State — DONE

## What it added
Replaced the ad-hoc `playerState` plain object and scattered `currentSystemId` /
`currentDestinationId` / `context.credits` variables in both orchestrators with a
single typed `PlayerState` class (`src/game/PlayerState.ts`). All persistent game
state (fuel, credits, cargo, location) is now owned by one object constructed once
at startup and passed to scenes as a single `player` argument.

## Key files
- `src/game/PlayerState.ts` — new class (created)
- `src/game/world/types.ts` — added `CargoEntry` interface
- `src/shared/types.ts` — removed `systemId`, `destinationId`, `credits` from `GameContext`
- `src/game/ui/screen-chrome.ts` — reads location/credits from `player` not `context`
- `src/game/scenes/base-menu-scene.ts` — `player` added as constructor arg, stored as `protected readonly player`
- `src/game/scenes/station-menu-scene.ts` — dropped `fuelL`, `fuelCapacityL`, `credits` params
- `src/game/scenes/travel-menu-scene.ts` — dropped `systemId`, `currentDestinationId`, `fuelL`, `fuelCapacityL`, `driveId` params
- `src/game/scenes/ship-scene.ts` — dropped `systemId`, `destinationId`, `PlayerStateView` spread; `PlayerStateView` deleted
- `src/main.ts`, `terminal.ts` — construct `PlayerState`; all `context.X = ...` sync lines removed
- `src/game/player-state.test.ts` — 22 tests (created)
- `src/tests/makePlayer.ts` — shared test helper (created)

## Architectural decisions embedded
`PlayerState` uses named update methods (`addFuel`, `consumeFuel`, `spendCredits`,
`jumpTo`, `dock`, `undock`) with no public field mutation, enforcing that all state
changes go through a defined API. The `cargoWeightKg` getter is a stub returning 0
to be filled by feature 031.
