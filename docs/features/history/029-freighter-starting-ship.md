# 029 · Freighter as Starting Ship — DONE

## What it added
Wired the player's starting ship to world data. Added `starting_ship: freighter` to `docs/world/game-settings.md`, added `startingShip: string` to the `GameSettings` TypeScript interface, exported a `getShip(id)` helper, and updated `ShipScene` to derive initial player state (cargo capacity, credits) from the freighter world record rather than a hardcoded `INITIAL_STATE`. Status bar unit changed from `T` to `KG`.

## Key files
- `docs/world/game-settings.md` — `starting_ship: freighter` field added
- `src/game/world/types.ts` — `startingShip: string` added to `GameSettings`
- `src/game/world/world-data.ts` — `startingShip: 'freighter'` in `WORLD.settings`; `getShip(id)` exported
- `src/game/scenes/ShipScene.ts` — `INITIAL_STATE` removed; state derived from `getGameSettings()` + `getShip()`

## Architectural decisions embedded
- Fuel stays as a percentage (0–100); fuel-in-litres tracking is deferred to feature 030.
- Ship selection at game start is a future feature; this feature only wires the starting ship from settings.
