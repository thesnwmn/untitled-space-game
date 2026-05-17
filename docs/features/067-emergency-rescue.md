# Feature 067 · Emergency Rescue

## Goal

A player stranded without fuel can always request emergency assistance — either a tow to a fuel destination or an in-place fuel drop — paying a fee that may push them into negative credits, so they are never permanently stuck.

---

## Acceptance criteria

- `PlayerState.spendCredits` (or an equivalent credit-deduction path used by the rescue) allows credits to go below zero — no floor clamp for emergency charges.
- When `player.fuelL < hopCost` (the same condition that greys all destinations in Feature 066), an `[EMERGENCY]` entry appears at the bottom of the DESTINATIONS tab, rendered in a visually distinct colour (amber or equivalent warning colour).
- Selecting the emergency entry opens `EmergencyRescueScene`.
- `EmergencyRescueScene` displays the player's situation (stranded in space or at the named current destination), then a menu of available rescue options, each showing the fee and the projected credit balance after payment. The projected balance is shown in a warning colour if it would be negative.
- **TOW option** — available when the current system has at least one destination where `amenities.fuel === true`. Selecting it: deducts `towFee` from credits (allowing negative), calls `player.dock(destinationId)` for the first fuel-bearing destination in the system's destination list, plays `InSystemTravelAnimationScene`, then routes to `ShipScene`. Fuel is NOT deducted (the ship is being towed).
- **EMERGENCY FUEL DROP option** — always present regardless of whether any fuel destination exists in the system. Selecting it: deducts `fuelDropFee` from credits (allowing negative), calls `player.addFuel(fuelDropLitres)` capped at `player.fuelCapacityL`, then returns to `TravelMenuScene`. No location change, no animation.
- A BACK option returns to `TravelMenuScene` without any changes.
- Both rescue options proceed regardless of current credit balance; the result may be negative.
- After either rescue, the player is in a fully valid game state (positive fuel, reachable destinations).
- `npx tsc --noEmit` passes with zero errors. `npm test` passes with new tests covering: emergency entry visibility when `fuelL < hopCost` and absence when `fuelL >= hopCost`; TOW availability based on system fuel destinations; negative credit balance after tow fee; negative credit balance after drop fee; fuel added and capped on drop; `player.dock` called with correct destination on tow.

---

## Out of scope

- Rescue across system jumps (e.g. being towed to another star system).
- Cooldown, use limit, or per-session restriction on rescue.
- Narrative flavour text or distress-call story screen.
- Player choice of which fuel destination to be towed to.
- Rescue when the player cannot afford standard station refuelling (that is handled by negative credits allowing refuel at any station — no separate mechanic needed).

---

## Technical notes

### Negative credits

`PlayerState.spendCredits` likely clamps at zero (mirroring `consumeFuel`). Before removing the clamp, audit all callers — some (e.g. trader purchase validation, deposit checks) may rely on it as a guard. If they do, introduce a separate `chargeEmergencyFee(amount: number): void` method that explicitly permits negative results, and use it exclusively for rescue payments. If no callers rely on the clamp as a guard, the simpler path is to remove it from `spendCredits` directly.

### Balance

Add an `emergencyRescue` block to `GameBalance` in `src/game/world/types.ts` and `docs/world/settings/balance.md`:

```
emergencyRescue:
  tow_fee: 500
  fuel_drop_fee: 800
  fuel_drop_litres: 15
```

The drop fee is meaningfully higher than the tow fee: the player pays a premium to avoid being relocated. `fuelDropLitres` should be enough for several hops (enough to reach a fuel station) but well short of a full tank.

### Stranded condition

The `[EMERGENCY]` item in `TravelMenuScene` appears whenever `player.fuelL < hopCost` — the exact same condition used to grey all destinations in Feature 066. No additional flag or state is needed. This item sits below all normal destination items (including FLY INTO SPACE) and is always the last in the list.

### EmergencyRescueScene

New scene class. Constructor receives `player: PlayerState`, `context: GameContext`, `onTow: (destinationId: string) => void`, `onDrop: () => void`, `onBack: () => void`.

The scene resolves available options at construction time:
1. Find the tow destination: filter `getSystem(player.systemId).destinations` for entries where `getDestination(id).amenities.fuel === true`; take the first result. If none, the TOW option is omitted.
2. Build the menu from whichever options are available, always including EMERGENCY FUEL DROP and BACK.

Each option line shows fee and projected balance after payment.

> suggestion: `TOW TO ALPHA STATION  500 CR  (BALANCE: -120 CR)`
> suggestion: `EMERGENCY FUEL DROP   800 CR  (BALANCE: -420 CR)`

Projected balance uses a warning colour (e.g. `bright-red` or `yellow`) when negative.

### Post-tow routing

On tow confirmation: call `chargeEmergencyFee(towFee)` → `player.dock(destinationId)` → create `InSystemTravelAnimationScene` → route to `ShipScene` via `goToShip`. Fuel is NOT deducted. This mirrors the `onDestinationSelected` path in `game.ts` except for the credit method.

### Post-drop routing

On drop confirmation: call `chargeEmergencyFee(fuelDropFee)` → `player.addFuel(fuelDropLitres)` → dismiss `EmergencyRescueScene` → return to `TravelMenuScene` (re-open or navigate back via `onBack`). No animation plays, location is unchanged.

### World convention

Every star system should contain at least one destination with `amenities.fuel: true`. The fuel drop exists to handle genuine edge cases, but this should hold by design rather than be relied upon mechanically. If a `docs/world/README.md` or equivalent exists, note this constraint there.

---

## Play-test instructions

### Browser (`npm run dev`)

1. Travel within a system until fuel falls below one hop cost. Confirm `[EMERGENCY]` appears at the bottom of the DESTINATIONS tab in a distinct colour.
2. Select `[EMERGENCY]`. Confirm the rescue screen opens and shows correct fees and projected balances.
3. If a fuel destination exists in-system, select TOW. Confirm: fee deducted (check credit display), travel animation plays, player docks at the fuel destination, fuel gauge is unchanged.
4. Return to a stranded state with very low credits (use save editing or a test scenario). Select EMERGENCY FUEL DROP. Confirm: fee deducted (credits may go negative), fuel increases by `fuelDropLitres`, player remains at current location, TravelMenuScene reopens.
5. Confirm that after either rescue the `[EMERGENCY]` entry is gone (fuel is sufficient for at least one hop).
6. Test BACK: confirm returning to the travel menu with no changes.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

Feature 066 (In-System Travel Fuel Cost) — provides the hop cost formula and stranded condition.
