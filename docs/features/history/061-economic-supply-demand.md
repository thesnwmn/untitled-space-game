# 061 · Economic Supply & Demand — DONE

## What it added

Trading now reflects local economic specialization. Systems specify their economic focus (mining, industrial, military, etc.) through `economies` tags. Each economy defines which commodities it produces or needs, with factors from 0.5 (abundant/cheap) to 1.3 (rare/expensive). Commodity prices scale from basePrice × 0.75 to basePrice × 1.25 based on effective factors (averaged across the system's applicable economies).

## Key files

- `docs/world/economies.md` — new: 9 economy types with commodity factors
- `src/game/world/types.ts` — `StarSystem.economy` → `StarSystem.economies`; removed `Destination.goodsBias`; added `effectiveFactor` to `TraderStockEntry`; added economies to `GameBalance`
- `src/game/world/world-data.ts` — `computeEffectiveFactor(commodityId, system)` calculates prices
- `src/game/game.ts` — `generateTraderStock()` weights commodities inversely by effective factor
- `src/game/scenes/trader-scene.ts` — removed reputation price modifier; prices now economy-based
- `src/game/mission-generator.ts` — supply missions prefer commodities with above-1.0 factors
- All 36 system docs: `economy` → `economies`
- All 20 destination docs: removed `goods_bias`

## Architectural decisions embedded

- Effective factors are pure function; clamping happens at compute time, not storage time, so authored factors can exceed balance ranges.
- Stock entries store effective factor once at generation; prices computed at render time for sell (allows future NPC reputation changes), once at buy generation (static per stock lifetime).
- Reputation no longer affects commodity prices; only fuel prices retain reputation modifier.
