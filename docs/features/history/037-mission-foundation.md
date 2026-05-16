# 037 · Mission Foundation — DONE

## What it added

Established the core mission data model, world data, and `PlayerState` extensions
that all subsequent mission features depend on. Added `MissionSpec` (a discriminated
union of delivery and supply shapes), `ActiveMission`, `MissionItem`, `DeliveryItem`,
and `NpcNames` types; 14 delivery items and NPC name lists in `docs/world/`;
a seeded `MissionGenerator`; and `PlayerState` mission lifecycle methods with two
pure exported helpers (`getMissionStatus`, `canAcceptMission`).

## Key files

- `src/game/world/types.ts` — new mission and world-data types
- `docs/world/delivery-items.md` — 14 delivery items (5–200 kg)
- `docs/world/npc-names.md` — special names, first/last name lists
- `src/game/world/world-parser.ts` — parses delivery-items.md and npc-names.md
- `src/game/world/world-data.ts` — `getDeliveryItems()`, `getNpcNames()`
- `src/game/mission-generator.ts` — `generateMissions(destination, worldData, seed)`
- `src/game/player-state.ts` — mission fields, lifecycle methods, pure helpers
- `src/game/mission-generator.test.ts` — 8 generator tests
- `src/game/player-state.test.ts` — 41 new mission tests

## Architectural decisions embedded

- `ActiveMission` is `type ActiveMission = MissionSpec & { acceptedAt, pickupComplete }`
  rather than `interface … extends MissionSpec` because TypeScript interfaces cannot
  extend union types.
- `getMissionStatus` is a pure exported function (not a PlayerState method) so future
  scenes can call it without holding a full player reference; it uses `player.destinationId`
  to distinguish `in-transit` from `ready-to-deliver` for delivery missions.
- `cargoWeightKg` on `PlayerState` now includes `missionItemsWeightKg` so all existing
  capacity checks remain correct without changes to callsites.
