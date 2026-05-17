# Feature 064 · Mission Balance & Deposit

## Goal

Supply missions pay more than the materials cost, delivery missions skew toward heavy cargo that strains the starter ship, and accepting a delivery mission requires a credit deposit that is forfeited on cancellation — making every mission a real commitment.

---

## Acceptance criteria

- `GameBalance.missions.supplyRewardMargin` is renamed `supplyRewardMultiplier` throughout (types, parser, world data, generator). Its default value in `balance.md` is set to a value greater than 1.0 (e.g. 1.30). The reward formula remains `floor(totalMaterialCost × supplyRewardMultiplier) + floor(rand × supplyRandomReward)`.
- `supplyQtyMin` and `supplyQtyMax` are raised to values that require meaningful cargo investment (e.g. 3 and 10).
- Delivery item selection in `generateDeliveryMission` uses weighted random by `weightKg` — each item's selection probability is proportional to its weight. Heavier items are picked more often; light items remain in the pool but appear rarely.
- `GameBalance.missions` gains `deliveryDepositFraction: number` (e.g. 0.20).
- `DeliveryMissionSpec` gains `deposit: number`, computed at generation as `floor(reward × deliveryDepositFraction)`.
- `canAcceptMission` checks `player.credits >= spec.deposit` for delivery missions; returns `{ ok: false, reason: 'Insufficient credits for deposit' }` if not.
- `PlayerState.acceptMission` deducts `spec.deposit` from `player.credits` at the moment of acceptance.
- `PlayerState.cancelMission` does not refund the deposit — credits are already deducted.
- `PlayerState.completeMission` pays the gross `reward` (the deposit is not refunded separately; the player's net gain is `reward − deposit`).
- `MissionDetailScene` shows a `DEPOSIT: NNN CR` line prominently — placed immediately after `REWARD:` and before the ACCEPT MISSION choice — whenever `spec.deposit > 0`. The line uses a visually distinct colour (e.g. yellow) to signal cost.
- `npx tsc --noEmit` passes with zero errors; `npm test` passes with updated and new tests covering: weighted delivery item selection (heavier items statistically more frequent), deposit deduction on accept, deposit forfeiture on cancel, credit check in `canAcceptMission`, reward payout on complete.

---

## Out of scope

- Partial deposit refunds for late or damaged delivery.
- Deposit mechanic on supply missions.
- Per-destination or per-faction deposit fractions.
- Any economy-adjusted pricing on supply mission costs (that is Feature 061's domain).

---

## Technical notes

### Weighted delivery item selection

Build a weight array parallel to the delivery items array where each entry equals `item.weightKg`. Use the LCG `rand()` to pick proportionally: sum total weight, pick a value in `[0, totalWeight)`, iterate through items accumulating weight until the threshold is crossed. This is a standard weighted random — no need for a sorting step.

### Deposit field on spec

`deposit` belongs on `DeliveryMissionSpec`, not `MissionBase`, because supply missions have no deposit. When the Engineer adds `deposit: number` to the type, `SupplyMissionSpec` is unaffected.

### `acceptMission` signature

`PlayerState.acceptMission` already receives the full spec. Derive `spec.deposit` from the spec directly — no signature change is needed.

### Balance key rename

`supplyRewardMargin` → `supplyRewardMultiplier` must be updated in: `GameBalance` type, `balance.md` (front-matter key and value), the world parser, and the mission generator. A grep for the old name should turn up all sites.

### `MissionDetailScene` layout

> suggestion

Insert the deposit line between the existing `REWARD: NNN CR` line and the blank gap before the ACCEPT MISSION choice. Example:

```
REWARD:  800 CR
DEPOSIT: 160 CR
```

Use `bright-yellow` for the deposit line to contrast with the green reward line. The existing layout logic (row tracking within `contentLimit`) handles this naturally with one additional `write` call.

---

## Play-test instructions

### Browser (`npm run dev`)

1. Dock at a station with a mission board. Open the board and select a delivery mission.
2. Confirm the detail screen shows both REWARD and DEPOSIT lines.
3. If your credits are below the deposit amount, confirm ACCEPT MISSION is disabled with the insufficient-credits reason.
4. Accept a delivery mission — verify credits decrease by the deposit amount immediately.
5. Cancel the mission via the Missions log — verify credits are NOT refunded.
6. Accept and complete a delivery mission — verify credits increase by the full gross reward.
7. Browse supply missions and confirm their rewards are greater than what the required commodities would cost at the trader.
8. Accept several supply missions; note the quantities are high enough to require a real cargo investment.
9. Open the mission board on several visits and observe that delivery missions tend to be heavier items.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

None
