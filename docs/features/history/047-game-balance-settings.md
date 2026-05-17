# 047 · Game Balance Settings — DONE

## What it added

All hardcoded gameplay constants (fuel economics, mission counts and reward ranges, trader stock quantities, cache TTLs, NPC name probability, and reputation thresholds) were moved from TypeScript source into `docs/world/settings/balance.md`. The `GameBalance` type and `getGameBalance()` function allow any code to read balance values from world data rather than literals. `docs/world/game-settings.md` was moved to `docs/world/settings/new-game.md`; `src/game/constants.ts` was deleted entirely.

## Key files

- `docs/world/settings/balance.md` — new declarative balance file (YAML frontmatter)
- `docs/world/settings/new-game.md` — moved from `docs/world/game-settings.md`
- `src/game/world/types.ts` — `GameBalance` interface and `WorldData.balance` field
- `src/game/world/world-parser.ts` — `DEFAULT_BALANCE`, `parseBalance()`, updated path matching
- `src/game/world/world-data.ts` — `getGameBalance()` exported
- `src/game/game.ts`, `src/game/mission-generator.ts`, `src/game/scenes/station-menu-scene.ts`, `src/game/scenes/travel-menu-scene.ts` — all hardcoded literals replaced with `getGameBalance()` reads
