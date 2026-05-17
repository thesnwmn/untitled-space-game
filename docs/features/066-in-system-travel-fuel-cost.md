# Feature 066 · In-System Travel Fuel Cost

## Goal

Travelling to any destination within a system, or flying into open space, consumes fuel — making fuel management meaningful throughout a session, not just at jump time.

---

## Acceptance criteria

- `Ship` world data type gains `fuelEfficiency: number` (same semantics as `JumpDrive.fuelEfficiency`: a consumption multiplier where lower = more efficient, less fuel used).
- All three ships have `fuelEfficiency` set: scout `0.7`, freighter `0.85`, hauler `0.95`.
- `GameBalance.fuel` gains `inSystemBaseConsumptionL: number` (suggested default `4`).
- In-system hop cost formula: `Math.ceil(inSystemBaseConsumptionL × ship.fuelEfficiency)` — same pattern as jump cost. At the default base this gives scout 3 L, freighter 4 L, hauler 4 L.
- A shared helper (or `PlayerState` computed getter) calculates the hop cost so the formula is not duplicated between the travel menu and the orchestrator.
- The orchestrator deducts the hop cost from `player.fuelL` immediately when `onDestinationSelected` or `goToFlyIntoSpace` is called — before the animation scene is created. Mirrors the jump fuel deduction pattern.
- In the DESTINATIONS tab of `TravelMenuScene`, all items — including FLY INTO SPACE — are greyed out when `player.fuelL < hopCost`. This condition is independent of the existing "current location" greying; a destination may be greyed for either or both reasons.
- The DESTINATIONS tab summary area shows the per-hop fuel cost once (the same value applies to every item; no per-row repetition).
- Any UI label reading "JUMP FUEL" is renamed to "FUEL". The underlying `PlayerState` field names `fuelL` and `fuelCapacityL` are unchanged.
- `npx tsc --noEmit` passes with zero errors. `npm test` passes with new and updated tests covering: hop cost calculation for each ship, greying when `fuelL < hopCost`, fuel deduction on `onDestinationSelected`, fuel deduction on `goToFlyIntoSpace`.

---

## Out of scope

- Emergency rescue when the player is stranded (Feature 067).
- Per-destination or distance-based in-system fuel costs.
- Fuel cost for docking, landing, take-off, or undocking animations.

---

## Technical notes

### Ship world data

Add `fuelEfficiency: number` to the `Ship` interface in `src/game/world/types.ts`. Update `src/game/world/world-parser.ts` to parse the field from ship markdown front matter. Add `fuel_efficiency` to all three ship files in `docs/world/ships/`: scout `0.7`, freighter `0.85`, hauler `0.95`. These values reflect each ship's character — lighter and faster hulls are more efficient in atmosphere and low-thrust manoeuvres.

### Balance

Add `inSystemBaseConsumptionL` to `GameBalance.fuel` in `src/game/world/types.ts` and `docs/world/settings/balance.md`. Default `4`. All balance tuning happens in the markdown file; no magic numbers in source.

### Hop cost helper

The hop cost is constant for a given player state. Place a `getInSystemHopCost(player: PlayerState): number` helper alongside the existing jump cost logic (or expose it as a `PlayerState` getter) so `TravelMenuScene` (for greying and summary display) and `game.ts` (for deduction) both call the same calculation.

### Greying logic in TravelMenuScene

Extend the item-building logic to mark any destination (and FLY INTO SPACE) as `disabled` when `player.fuelL < hopCost`. Keep this orthogonal to the existing current-location check — the two disabled conditions should not interfere.

### Fuel deduction in game.ts

Deduct `hopCost` in both `onDestinationSelected` and `goToFlyIntoSpace` before constructing the animation scene. Follow the same call order as `consumeFuel` in `onJumpSelected`.

### Summary display

Add a summary line to the DESTINATIONS tab via the `summary` option on `BaseScene`. Exact wording and colour are the engineer's call.

> suggestion: `FUEL  X L per hop`  in `bright-black`

### Label cleanup

`grep -r "JUMP FUEL" src/` to locate any label. Rename to `FUEL` if found. No field renames on `PlayerState`.

---

## Play-test instructions

### Browser (`npm run dev`)

1. Start a new game with the default freighter. Note the fuel gauge.
2. Open TRAVEL → DESTINATIONS. Confirm the summary line shows a fuel cost.
3. Travel to a destination in the system. Confirm fuel decreases by the displayed amount.
4. Travel until fuel is too low for another hop. Confirm all destinations and FLY INTO SPACE are greyed out.
5. Repeat with scout and hauler ships if available via world data or a test save.
6. Confirm the ship cockpit fuel display does not say "JUMP FUEL".

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

None.
