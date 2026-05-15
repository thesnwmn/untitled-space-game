# 031 · Cargo Trading — DONE

## What it added
A persistent cargo hold with live buy/sell trading at any trader destination. Trader stock is randomly generated on first visit per destination and refreshes every 2 minutes; buying transfers the entire available lot; selling transfers all held units of a type back to the trader at base price. A new read-only `CargoScene` (accessible via `C` key or tapping the cargo stat panel) shows hold contents with weight and capacity.

## Key files
- `src/game/scenes/cargo-scene.ts` — new read-only cargo hold scene
- `src/game/scenes/trader-scene.ts` — rewritten with live stock data; SELECT does not activate the scene so the player can keep trading
- `src/game/scenes/ship-scene.ts` — added `onCargo` callback, `CARGO` action, tap on right stat panel
- `src/game/game.ts` — trader stock cache with 2-minute TTL; `onBuy`/`onSell` logic with affordability and capacity enforcement
- `src/game/world/world-data.ts` — added `getCommodity`, `getCommodities`, `computeCargoWeightKg`
- `src/game/PlayerState.ts` — `cargoWeightKg` now uses real `computeCargoWeightKg` instead of stub

## Architectural decisions embedded
- `TraderScene` syncs its tab items on every `render()` call from the live mutable `traderStock` array, so it always reflects the latest state without requiring a scene rebuild after each trade.
- `TraderScene.activateCurrent()` is overridden to never set `activated`, allowing repeated trades in a single session.
- Stock generation picks 4–6 commodities uniformly at random (no goodsBias filtering) with 1–8 units each.
