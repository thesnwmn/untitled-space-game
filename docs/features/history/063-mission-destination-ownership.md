# 063 · Mission Destination Ownership & Generation — DONE

## What it added

Missions are now owned by destinations and generated when the player docks (not when the board is opened). Each destination controls its mission output via `minMissions` (guaranteed baseline) and `missionChance` (probability of additional generation). `PlayerState` caches missions per-destination with TTL for save/restore. The station hub shows the mission board entry only when missions are available.

## Key files

- `src/game/world/types.ts` — `Destination` gains `minMissions` and `missionChance`; removed `missionBoard` from `DestinationAmenities`; replaced `boardCountMin`/`boardCountMax` with `boardMaxCount` in `GameBalance.missions`
- `src/game/player-state.ts` — added mission cache with TTL; `getDestinationMissions()` and `refreshDestinationMissions()` methods
- `src/game/mission-generator.ts` — new generation algorithm: baseline minMissions + probabilistic chance loop, seeded by destination ID + time window
- `src/game/game.ts` — removed `missionBoardCache`; mission refresh on dock; direct missions array to `MissionBoardScene`
- `src/game/scenes/mission-board-scene.ts` — constructor parameter changed from callback to direct array
- `src/game/scenes/station-menu-scene.ts` — MISSION BOARD visibility now conditional on player's cached missions
- `docs/world/destinations/` — all 19 destination files updated with `min_missions` and `mission_chance` fields

## Architectural decisions embedded

- Mission caching moved from `Game` to `PlayerState`, enabling proper save/restore and decoupling mission generation from scene lifecycle.
- Time-window-based seeding (`destination.id ^ floor(Date.now() / missionTtlMs)`) ensures reproducible results across the TTL window without global seed state.
- MISSION BOARD visibility is now determined by player state (missions present) rather than a static destination amenity, allowing dynamic behaviour based on generation outcome.
