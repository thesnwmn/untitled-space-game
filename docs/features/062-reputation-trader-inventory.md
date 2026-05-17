# Feature 062 · Reputation-Scaled Trader Inventory

## Goal

A trader's available stock reflects the player's standing with the local faction — favoured pilots see more item types and larger quantities, while despised players find shelves sparse.

---

## Acceptance criteria

- `GameBalance.trading` gains six new keys: `stockRepCountBonusPerLevel`, `stockRepCountBonusMin`, `stockRepCountBonusMax`, `stockRepQtyBonusPerLevel`, `stockRepQtyBonusMin`, `stockRepQtyBonusMax`.
- `stockQtyMin` default updates to 5 and `stockQtyMax` default updates to 10 in both code and `balance.md`.
- The effective count bonus is `clamp(repLevel × stockRepCountBonusPerLevel, stockRepCountBonusMin, stockRepCountBonusMax)`.
- The number of item types offered is drawn from `[clamp(stockCountMin + countBonus, 1, totalCommodities), clamp(stockCountMax + countBonus, 1, totalCommodities)]`.
- The effective qty bonus is `clamp(repLevel × stockRepQtyBonusPerLevel, stockRepQtyBonusMin, stockRepQtyBonusMax)`.
- Each item's quantity is drawn from `[(stockQtyMin + qtyBonus), (stockQtyMax + qtyBonus)]`, then scaled by a per-commodity multiplier derived from `Commodity.basePrice` and `Commodity.weightKg` such that cheaper, lighter goods receive proportionally more stock. The final value is floored at 1.
- The reputation lookup uses the same faction/destination logic as the existing trade price modifiers. If the destination has no controlling faction, `repLevel` is treated as 0.
- Cached stock is regenerated when the player's reputation level with the controlling faction has changed since the stock was last generated (not only when the TTL expires).
- At reputation −2 (HATED) with default balance values: count range 2–4 types; base qty range 1–6 before commodity scaling.
- At reputation 0 (NEUTRAL) with default balance values: count range 4–6 types; base qty range 5–10 before commodity scaling.
- At reputation +3 (REVERED) with default balance values: count range 7–9 types; base qty range 11–16 before commodity scaling.
- No new fields are added to the `Commodity` interface.
- `npm test` passes; new tests cover count and qty ranges at reputation −2, 0, and +3 against the expected ranges above.
- `npx tsc --noEmit` passes with zero errors.

---

## Out of scope

- Visual indication in the trader UI of how reputation affects stock.
- Changing which faction's reputation is consulted (same logic as existing price modifiers).
- Changing trade prices based on reputation (already handled by existing trade modifiers).
- Contraband access gating by reputation level.

---

## Technical notes

### New balance parameters

Add to `GameBalance.trading` (and `balance.md` under `trading:`):

```
stockRepCountBonusPerLevel  — count-range shift per reputation level
stockRepCountBonusMin       — floor on total count bonus
stockRepCountBonusMax       — ceiling on total count bonus
stockRepQtyBonusPerLevel    — qty-range shift per reputation level
stockRepQtyBonusMin         — floor on total qty bonus
stockRepQtyBonusMax         — ceiling on total qty bonus
```

Default values for `stockRepCountBonusPerLevel` = 1 and `stockRepQtyBonusPerLevel` = 2 match the manager's specification. The Engineer should choose clamp defaults that do not clip the natural range produced by the current −2 to +3 reputation scale, so normal play is unaffected by the clamps unless explicitly tuned.

Also update existing defaults: `stockQtyMin` → 5, `stockQtyMax` → 10.

### Affected files

- `src/game/game.ts` — `getOrCreateTraderStock`: accepts the player's current reputation level, computes adjusted count and qty ranges, applies per-commodity qty scaling.
- `src/game/world/types.ts` — add six new fields to `GameBalance.trading`.
- `src/game/world/world-parser.ts` — update `DEFAULT_BALANCE.trading` with new keys and revised qty defaults.
- `docs/world/settings/balance.md` — update `stock_qty_min`, `stock_qty_max`, add the six new keys.

### Reputation lookup

`getOrCreateTraderStock` currently takes only `destinationId`. Add the player's current reputation level with the destination's controlling faction as a second parameter. The call site already has `PlayerState` available; use the same faction-lookup path already used for trade price modifiers in `trader-scene.ts`.

### Cache invalidation on reputation change

Store the reputation level used at generation inside the cache entry (alongside `generatedAt`). On each access, if the stored level differs from the current level, discard and regenerate — regardless of whether the TTL has expired. The Engineer may alternatively use a composite cache key of `destinationId + repLevel`; either approach satisfies the requirement.

### Per-commodity quantity scaling

Each item's rolled quantity (from the rep-adjusted range) is multiplied by a per-commodity factor derived from `Commodity.basePrice` and `Commodity.weightKg`. The intent: cheap, light goods (e.g. Ration Packs: 60 cr, 4 kg) should appear in roughly 2–3× the quantity of expensive, heavy goods (e.g. Ship Components: 650 cr, 60 kg). The exact function — log-based, tier-based, or otherwise — and any balance parameters for the scaling range are left to the Engineer's judgment. The result is floored at 1.

### Note for Feature 061

Feature 061 (Economic Supply & Demand) modifies the same `getOrCreateTraderStock` function. Its weighted commodity selection must operate on the reputation-adjusted count range produced by this feature, not raw `stockCountMin`/`stockCountMax`. Feature 061's spec has been updated accordingly.

---

## Play-test instructions

### Browser (`npm run dev`)

1. Start a new game; dock at any station. Note the number of item types listed and the quantities shown for a cheap good (e.g. Ration Packs) and a heavy expensive good (e.g. Ship Components).
2. Raise reputation to FRIENDLY (+1) via missions. Dock at a station controlled by that faction. Confirm at least one additional item type appears and quantities are higher overall.
3. If reachable, test at REVERED (+3): confirm 7–9 item types; confirm cheap goods show substantially higher quantities than expensive ones.
4. Test at HATED (−2): confirm 2–4 item types only and lower quantities.
5. Confirm Ration Packs consistently appear in higher quantity than Ship Components across multiple dockings.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

Feature 052 (Reputation — Trade Effects) — complete.

Note: Feature 061 (Economic Supply & Demand) modifies the same stock generation function and must be built after this feature. Feature 061's spec has been updated to reflect this.
