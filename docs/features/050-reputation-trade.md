# Feature 050 · Reputation — Trade Effects

## Goal

A faction's standing with the player modifies buy and sell prices at their stations, and buying goods earns a small amount of reputation with the operating faction.

---

## Acceptance criteria

- `reputation-utils.ts` gains `getTradeModifier(level: number): number` returning a multiplier centred on `1.0`; higher standing gives a discount on buys and a premium on sells; lower standing gives a surcharge on buys and a markdown on sells; the six modifier values (one per level) are named constants
- `TraderScene` reads `owningFactionId` from the current destination; if the faction is reputation-eligible, trade modifiers are applied; if absent or ineligible, prices are unchanged
- Buy prices are multiplied by the modifier (level +3 → cheapest, level -2 → most expensive)
- Sell prices are divided by the modifier or use an inverse scale (level +3 → highest return, level -2 → lowest); the Engineer chooses the exact inversion, but the directional effect must be clear
- `TraderScene` displays the player's current standing label (not a number) with the operating faction near the top of the scene when a reputation-eligible faction is identified; no line is shown when absent
- Every purchase accrues `creditsSpent × REP_PER_CREDIT` reputation with the operating faction (`REP_PER_CREDIT` is a named constant)
- Total rep gain from buying within a single docking visit is capped at `MAX_REP_PER_VISIT` (a named constant); the cap resets on undock; this value is transient and is not serialised
- `npm test` passes; `npx tsc --noEmit` passes

---

## Out of scope

- Faction-gated items (refusing to sell goods to low-rep players)
- Rep gain from selling goods
- Per-faction or per-system cap tracking (cap is per destination visit only)
- Displaying the numerical modifier percentage to the player

---

## Technical notes

### Modifier scale

Six values, one per level -2 through +3, as named constants. The scale should be meaningful but not game-breaking.

> suggestion: -2 → 1.20 (20% surcharge), -1 → 1.10, 0 → 1.00, +1 → 0.92, +2 → 0.85, +3 → 0.80

Buy price = `basePrice × modifier`. Sell price = `basePrice / modifier` (or `basePrice × (2 - modifier)` — Engineer's choice, both produce a meaningful spread).

### Visit cap

The cap is a simple integer accumulator local to the docking session. The cleanest implementation is a transient field on `PlayerState` (not serialised) reset to `0` on each dock, or a local variable in `TraderScene` reset on scene construction. Either approach is acceptable.

### Destination → faction lookup

Read `currentDestination.owningFactionId`. No fallback to system `majorFactions`. If the field is absent, skip all modifier and rep-gain logic silently.

---

## Play-test instructions

### Browser (`npm run dev`)

1. Dock at a faction-owned station — confirm the faction standing label appears in the trader header.
2. Note a commodity's buy price. Check the Reputation screen (NEUTRAL standing). Prices should be unmodified.
3. Use the browser console or a test save to set standing to FRIENDLY — confirm buy prices decrease and sell prices increase relative to base.
4. Buy goods repeatedly in one visit — confirm rep increases but stops accruing once the visit cap is reached.
5. Undock and redock — confirm the cap has reset and rep gain resumes from zero.
6. Dock at a destination with no owning faction — confirm no standing label appears and prices are unchanged.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

Feature 048 (Reputation — Foundation)
