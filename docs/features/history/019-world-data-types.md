# 019 · World Data TypeScript Types — DONE

## What it added
Defined TypeScript interfaces for every world entity and created a static `WORLD: WorldData` constant in `src/game/world/world-data.ts` containing all seed data from feature 018. Exported typed lookup helpers (`getSystem`, `getDestination`, `getRoutesFrom`, `getDrive`, `getStoryBeat`, `getStoryBeatsByTrigger`) so any game scene can import world data without file I/O.

## Key files
- `src/game/world/types.ts` — all world entity interfaces and union types (camelCase)
- `src/game/world/world-data.ts` — `WORLD` constant with all seed data; lookup helpers
- `src/game/world/world-data.test.ts` — referential integrity tests (all ids resolve, all routes valid, etc.)

## Architectural decisions embedded
- camelCase field names in TypeScript map to snake_case front-matter names in markdown; the loader (feature 020) is responsible for the translation.
- `description` strings in the static data are single-sentence summaries; full prose is in the markdown docs and will be loaded in feature 020.
- `getRoutesFrom(systemId)` returns routes in both directions (where `from === id` or `to === id`).
