# 064 · Mission Balance & Deposit — DONE

## What it added

Supply missions now pay rewards based on a randomized multiplier (1.15–1.50) above material cost, biased toward the upper end for heavier cargo requests. Supply quantities raised to 3–10 per item. Delivery item selection is weighted by weight (heavier items picked more frequently). All delivery missions require an upfront credit deposit (fraction of reward, default 20%), forfeited on cancellation but not refunded on completion.

## Key files

- `src/game/world/types.ts` — replaced `supplyRewardMargin`/`supplyRandomReward` with `supplyRewardMultiplierMin`/`Max`; added `deliveryDepositFraction` and `deposit` field to `DeliveryMissionSpec`
- `src/game/mission-generator.ts` — weighted delivery item selection by `weightKg`; weight-biased supply multiplier (nudge random toward 1.0 by 15% relative to 500 kg reference)
- `src/game/player-state.ts` — `canAcceptMission` checks credits >= deposit; `acceptMission` deducts deposit immediately
- `src/game/scenes/mission-detail-scene.ts` — DEPOSIT line display in bright-yellow after REWARD

## Architectural decisions embedded

- Supply reward formula guarantees profit: `floor(totalMaterialCost × M)` where M ∈ [min, max], always M > 1.0
- Weight bias uses subtle nudge (15% of random value proportional to weight ratio) rather than deterministic mapping—preserves randomness at both extremes
- Deposit is calculated per-mission (not per-destination) and stored on the spec itself, not recomputed
- Deposit deduction is synchronous at acceptance; no separate "hold" or authorization step
