# 067 · Emergency Rescue — DONE

## What it added

When stranded without fuel (fuelL < hopCost), players can request emergency assistance: a tow to the nearest in-system fuel destination or an in-place fuel drop, each at a distinct cost. Both options charge fees that may push credits below zero, ensuring players are never permanently stuck. The [EMERGENCY] menu entry appears in the DESTINATIONS tab only when stranded, and disappears once fuel is sufficient again.

## Key files

- `src/game/scenes/emergency-rescue-scene.ts` — new scene displaying stranded situation, rescue options with fee/balance info, and cursor-navigable choices
- `src/game/scenes/travel-menu-scene.ts` — adds [EMERGENCY] entry to destinations list when player is stranded
- `src/game/game.ts` — orchestrator handlers for tow (dock + animation) and fuel drop (fuel add + return to travel)
- `src/game/world/types.ts` — emergencyRescue block added to GameBalance interface
- `src/game/world/world-parser.ts` — balance parser updated to handle emergency_rescue YAML section
- `docs/world/settings/balance.md` — balance params: tow_fee 500, fuel_drop_fee 800, fuel_drop_litres 15

## Architectural decisions embedded

- EmergencyRescueScene extends BaseScene (not BaseMenuScene) because complex per-option balance rendering requires custom color logic per line, which BaseMenuScene doesn't support cleanly
- Credits intentionally allowed to go negative; spendCredits has no floor clamp so emergency fees can push balance below zero
- Stranded condition uses same `fuelL < hopCost` test as Feature 066, reusing existing hop cost infrastructure
- Tow routes through InSystemTravelAnimationScene like normal destination travel, but without fuel deduction
