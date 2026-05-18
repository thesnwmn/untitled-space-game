# 054 · Hull Integrity — DONE

## What it added

Added hull integrity tracking on `PlayerState` (0.0–1.0, initialized to 1.0 on new game). `applyHullDamage(fraction)` is the sole write path, subtracting from integrity and clamping at 0.0. `ShipCockpitScene` renders `HULL: XX%` text display in the HUD with dynamic colour: bright-green ≥ 80%, yellow 50–79%, red < 50%. The gauge bar reflects actual integrity and updates colour dynamically.

## Key files

- `src/game/player-state.ts` — added `_hullIntegrity` field, `hullIntegrity` getter, `applyHullDamage(fraction)` method
- `src/game/scenes/ship-cockpit-scene.ts` — added `getHullColor()` helper; hull gauge uses dynamic colour; HUD displays `HULL: XX%` text
- `src/game/player-state.test.ts` — 5 tests for hull state management (init, damage, clamping, accumulation, preservation)
- `src/game/scenes/ship-cockpit-scene.test.ts` — 2 test updates for hull gauge colour at full integrity

## Architectural decisions embedded

None; feature establishes a simple state property and display pattern with no new architectural rules.
