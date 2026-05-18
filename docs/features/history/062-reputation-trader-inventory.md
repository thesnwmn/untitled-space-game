# 062 · Reputation-Scaled Trader Inventory — DONE

## What it added

Trader stock count and per-item quantity now scale with the player's reputation level
with the destination's controlling faction. Count and qty ranges each receive a clamped
bonus computed from `repLevel × bonusPerLevel`. A per-commodity log-based multiplier
(factor range 0.5–1.5) ensures cheaper, lighter goods (e.g. Ration Packs) appear in
roughly 3× the quantity of expensive, heavy goods (e.g. Ship Components). The stock
cache is invalidated whenever the player's rep level changes, even within the TTL window.

## Key files

- `src/game/world/types.ts` — six new fields on `GameBalance.trading`
- `src/game/world/world-parser.ts` — updated defaults (`stockQtyMin`→5, `stockQtyMax`→10) and parser
- `src/game/game.ts` — `generateTraderStock` exported pure function; `StockCache` stores `repLevel`; `goToTrader` looks up rep level via owning faction
- `docs/world/settings/balance.md` — updated defaults and six new YAML keys
- `src/game/game.test.ts` — 8 new tests covering count and qty bounds at rep −2, 0, +3

## Architectural decisions embedded

- `generateTraderStock` is extracted as an exported module-level pure function in `game.ts` for testability, consistent with the existing pattern of module-level helpers.
- The commodity qty factor uses `log(price × weight)` normalised across all commodities, mapping [scoreMin, scoreMax] → factor [1.5, 0.5]. This is self-contained and adapts automatically if commodities are added or removed.
- Cache invalidation uses a `repLevel` field stored in the cache entry (checked alongside the TTL), rather than a composite key, to keep the cache map keyed only by `destinationId`.
