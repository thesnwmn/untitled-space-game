# Feature 054 · Hull Integrity

## Goal

Track the ship's hull integrity on `PlayerState` and surface it to the player in the ship
view, laying the foundation for damage events in later features.

---

## Acceptance criteria

- `PlayerState` has a `hullIntegrity` property (0.0–1.0); serialised; defaults to 1.0 on
  new game; missing on load → backfilled to 1.0
- `PlayerState.applyHullDamage(fraction: number): void` subtracts `fraction` from
  `hullIntegrity`, clamped to 0.0; the method is the sole write path for hull damage
- `ShipScene` renders `HULL: XX%` — bright-green at ≥ 80%, yellow at 50–79%, red below 50%
- `npm test` passes; `npx tsc --noEmit` produces zero errors
- Tests for `PlayerState`: `hullIntegrity` starts at 1.0; `applyHullDamage` subtracts
  correctly; clamps at 0.0; value 0.75 serialises and deserialises as 0.75; missing field
  on load is backfilled to 1.0

---

## Out of scope

- Hull repair mechanics or UI
- Any caller of `applyHullDamage` — this feature only defines and exposes the method
- Balance settings for damage amounts (those belong to the feature that applies damage)

---

## Technical notes

### Hull integrity on `PlayerState`

New private field `_hullIntegrity: number`. Public getter `hullIntegrity: number`. Method
`applyHullDamage(fraction: number): void` sets `_hullIntegrity = Math.max(0,
_hullIntegrity - fraction)`. Include `hullIntegrity` in the serialised save state; backfill
to `1.0` on load when the field is absent.

### Hull display in `ShipScene`

Add a `HULL: XX%` summary line (percentage rounded to the nearest integer). Colour:
bright-green ≥ 80%, yellow 50–79%, red < 50%. The Engineer should slot it alongside
existing ship info without displacing other lines.

---

## Play-test instructions

### Browser (`npm run dev`)

1. Start a new game — confirm `HULL: 100%` is visible in the ship view in bright-green.
2. From a browser console or test, call `player.applyHullDamage(0.25)` — confirm
   `HULL: 75%` displayed in yellow.
3. Call `player.applyHullDamage(0.40)` — confirm `HULL: 35%` displayed in red.
4. Call `player.applyHullDamage(1.0)` on a ship at 35% — confirm `HULL: 0%` (clamped).

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

None
