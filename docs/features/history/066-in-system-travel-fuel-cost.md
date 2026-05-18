# 066 · In-System Travel Fuel Cost — DONE

## What it added

In-system travel now consumes fuel based on ship efficiency, making fuel management meaningful throughout a session. Destinations and FLY INTO SPACE are greyed out when fuel is insufficient. The DESTINATIONS tab displays the per-hop fuel cost.

## Key files

- `src/game/world/types.ts` — added `fuelEfficiency` to Ship, `inSystemBaseConsumptionL` to GameBalance.fuel
- `src/game/world/world-parser.ts` — parsing of `fuel_efficiency` and `in_system_base_consumption_l` fields
- `src/game/player-state.ts` — added `getInSystemHopCost()` helper method
- `src/game/scenes/travel-menu-scene.ts` — greying logic and summary display
- `src/game/game.ts` — fuel deduction on destination selection and fly into space
- `docs/world/ships/*.md` — added `fuel_efficiency` to scout (0.7), freighter (0.85), hauler (0.95)
- `docs/world/settings/balance.md` — added `in_system_base_consumption_l: 4`

## Architectural decisions embedded

- Hop cost follows the same ceiling formula as jump cost (`Math.ceil(base × fuelEfficiency)`), ensuring consistent cost calculation across travel types.
- Fuel deduction occurs before animation scene creation, mirroring the jump fuel pattern and guaranteeing the deduction happens regardless of subsequent scene behavior.
