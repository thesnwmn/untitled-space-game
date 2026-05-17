# 052 · Reputation — Trade Effects — DONE

## What it added
`TraderScene` now applies per-faction trade modifiers derived from the player's reputation
standing. Buy prices are multiplied by the modifier (`round(basePrice × modifier)`) and sell
prices are divided (`round(basePrice / modifier)`), with the modifier pulled from
`getGameBalance().reputation` for each of the six standing levels. A `STANDING: <label>` line
renders between the trader name underline and the tab bar when the destination has a
reputation-eligible owning faction. Buying goods accrues reputation proportional to credits
spent, capped per docking visit via a transient `repGainedThisVisit` field on `TraderScene`.

## Key files
- `src/game/reputation-utils.ts` — added `getTradeModifier(level, balance)`
- `src/game/world/world-data.ts` — added `getFaction(id)` export
- `src/game/scenes/trader-scene.ts` — modifier logic, standing label, rep accrual, `unitPrice` callback param
- `src/game/game.ts` — `onBuy`/`onSell` accept `unitPrice`; `goToTrader` threads it from TraderScene callbacks
- `src/game/scenes/trader-scene.test.ts` — 6 new reputation trade effect tests; 3 callback assertions updated

## Architectural decisions embedded
- `onBuy`/`onSell` callbacks now carry `unitPrice` as a 3rd parameter so the TraderScene
  (which knows the modifier) is the single source of price truth; the orchestrator uses
  `unitPrice` for deductions without re-computing the modifier independently.
- Visit cap is a field on `TraderScene` (not `PlayerState`) — it is inherently transient
  because the scene is reconstructed on each dock, naturally resetting the cap on undock.
- Standing label is written at `CONTENT_TOP + 2` (the blank row between underline and tab bar)
  via the `render()` override, avoiding any shift in the summary/tab/item row layout.
