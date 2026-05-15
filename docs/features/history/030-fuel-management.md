# 030 · Fuel Management — DONE

## What it added

Introduced a real fuel economy: fuel is tracked in litres, deducted on every jump via
`Math.ceil(FUEL_PER_LY × distance × drive.fuelEfficiency)`, and displayed as `FUEL:x/yL`
in the Ship screen stat panel. Jump routes the player cannot afford are greyed out and
unselectable. Stations with `amenities.fuel: true` offer a `BUY FUEL` item when the tank
is not full, charging `fuelNeeded × FUEL_PRICE_PER_L` credits.

## Key files

- `src/game/constants.ts` — `FUEL_PER_LY`, `FUEL_PRICE_PER_L`
- `src/game/world/world-data.ts` — `getRoute()` helper
- `src/game/scenes/ShipScene.ts` — `PlayerStateView` interface; fuel display
- `src/game/scenes/TravelMenuScene.ts` — fuel-based jump item disabling
- `src/game/scenes/StationMenuScene.ts` — conditional BUY FUEL item
- `src/main.ts`, `terminal.ts` — module-level `playerState`; fuel deduction on jump

## Architectural decisions embedded

`PlayerState` is now owned by the orchestrators (`main.ts` / `terminal.ts`) and passed
into scenes as a read-only `PlayerStateView`. Scenes are pure display; mutations happen
exclusively in the orchestrator callbacks (`onJumpSelected`, `onRefuel`). This pattern
extends naturally to cargo (031) and any future persistent state.
