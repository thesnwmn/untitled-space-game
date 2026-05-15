# Feature 031 · Cargo Trading

## Goal

Introduce a working cargo economy. The player's ship gains a persistent cargo hold
that survives scene transitions. Traders randomly generate their available stock on
first visit and refresh it after 2 minutes. The player buys or sells an item's entire
quantity in one action. Prices are fixed at the commodity's `basePrice`. A new Cargo
scene, accessible from the Ship screen, shows a read-only breakdown of the hold.

**Depends on:** 029, 030 (both must be DONE before starting this feature)

---

## Design decisions

### Hold tracking

Cargo is tracked as a list of `CargoEntry` records — commodity id plus unit count.
Total weight is always computed on the fly (`qty × commodity.weightKg`) rather than
stored as a separate field, eliminating an entire class of sync bugs. The existing
`cargo: number` field in `PlayerState` is removed.

### Always buy/sell all

Buying an item transfers all available trader units to the hold in one action.
Selling transfers all held units of that type to the trader in one action.
Partial quantities are a future feature.

### Capacity enforcement for buys

If the buy would exceed hold capacity, or the player can't afford it, the action
is silently rejected (no animation or error message in this feature).

### Trader stock cache

Each destination's trader stock is cached per session in a map keyed by
`destinationId`. On opening TraderScene the orchestrator calls
`getOrCreateTraderStock(destinationId)`, which returns existing stock if it was
generated within the last 2 minutes, or generates a fresh random selection and
resets the timestamp.

When a player buys an item the entry is removed from the cache array in place.
When a player sells, the entry is added to or merged into the cache.
The mutable array is passed directly into `TraderScene` as a reference so the
scene always sees live data without reconstructing it.

### Stock generation

Pick 4–6 commodities at random from `WORLD.commodities` (uniform distribution,
no goodsBias filtering in this feature). Assign each a qty of 1–8 units.

### Accessing cargo from the Ship screen

A new `CARGO` game action is added, mapped to the `c` / `C` keys. In `ShipScene`,
the `CARGO` action (keyboard) or tapping the cargo panel (touch) opens `CargoScene`.

The ship status bar is split into two panels. The right panel displays the cargo
reading. Touch must hit that panel specifically — tapping the fuel panel (left)
does nothing.

---

## Changed types

### `src/shared/types.ts`

Add `'CARGO'` to the `GameAction` union.

### `src/game/world/types.ts`

`CargoEntry` is defined by feature 033 (prerequisite). Add only:

```typescript
export interface TraderStockEntry {
  commodityId: string;
  qty: number;
}
```

---

## Changed files

### `src/platform/dom/DOMInputHandler.ts`

Add `c` and `C` to `KEY_MAP` mapped to `'CARGO'`.

### `src/platform/terminal/TerminalInputHandler.ts`

Add `c` and `C` to `KEY_MAP` mapped to `'CARGO'`.

### `src/game/world/world-data.ts`

Add three exports:
- `getCommodity(id: string): Commodity | undefined`
- `getCommodities(): Commodity[]`
- `computeCargoWeightKg(cargoHold: CargoEntry[]): number` — sums `qty × commodity.weightKg`
  across the hold; unknown commodities contribute 0.

### `src/game/PlayerState.ts`

Feature 033 leaves `cargoWeightKg` as a stub returning 0. This feature replaces it with
a real implementation using `computeCargoWeightKg` from `world-data.ts`.

### `src/main.ts` and `terminal.ts`

Add a trader stock cache: a map from `destinationId` to `{ entries: TraderStockEntry[]; generatedAt: number }`.
Implement `getOrCreateTraderStock(destinationId)`: return cached entries if fresher than
2 minutes, otherwise generate and cache new stock (4–6 random commodities, 1–8 units each).

Add `onBuy(commodityId)` and `onSell(commodityId)`:
- `onBuy`: check affordability and available hold capacity; if both pass, deduct credits,
  remove the entry from the trader's stock array, call `player.addCargo`.
- `onSell`: add credits, call `player.removeCargo`, merge the sold qty back into the
  trader's stock (add to existing entry or push a new one).

Update `goToTrader` to call `getOrCreateTraderStock` and pass the result into `TraderScene`.

Update `goToShip` to pass `goToCargo` as a new callback. Add `goToCargo` that constructs
`CargoScene`.

### `src/game/scenes/TraderScene.ts`

Replace the hardcoded `TRADERS` constant and static `Trader` interface with the live-data
approach described above.

**Constructor parameters:**
- `player: PlayerState`
- `destinationId: string`
- `traderStock: TraderStockEntry[]` — mutable reference; live data
- `onBuy: (commodityId: string) => void`
- `onSell: (commodityId: string) => void`
- `onHub: () => void`
- `onUndock: () => void`

The scene's current-items computation reads from `traderStock` (BUY tab) or
`player.cargoHold` (SELL tab). SELECT calls `onBuy` or `onSell` with the commodity
id. The scene does NOT set `activated` on SELECT — the player stays to make further
trades.

Display each item as its name, quantity, and total price (qty × basePrice).

Show empty-state messages when the relevant list is empty:
- BUY tab: `NO STOCK AVAILABLE`
- SELL tab: `CARGO HOLD EMPTY`

Show a hold-capacity footer on both tabs (current weight / capacity in kg).

### `src/game/scenes/ShipScene.ts`

Add `onCargo: () => void` as a new constructor parameter after `onDock`.

The `CARGO` action (keyboard) and a tap on the right half of the status bar at stat
row 2 (touch) both fire `onCargo`. Tapping the left (fuel) half does nothing.

Status bar: add cargo weight alongside the existing fuel and credits readout.
Footer hint: include the cargo shortcut.

### New file: `src/game/scenes/CargoScene.ts`

Read-only scene showing the hold contents.

**Constructor parameters:** `inputHandler`, `context`, `player: PlayerState`, `onBack: () => void`

**Behaviour:** `BACK` or `CARGO` actions return to the ship. Two-finger tap (touch) also
returns.

**Layout:** title centred at top; each hold entry shows commodity name, quantity, and
weight in kg; a separator and total-weight / capacity line near the bottom; a hint at
the very bottom. If the hold is empty, show a centred `CARGO HOLD EMPTY` message.
Truncate item names that would overflow the line.

---

## Tests

### New: `src/game/scenes/cargo-scene.test.ts`

Cover: empty hold message; single and multiple item rendering; correct total weight;
correct capacity display; `BACK` fires `onBack`; `CARGO` fires `onBack`; two-finger
tap fires `onBack`.

### Update: `src/game/scenes/trader-scene.test.ts`

Remove tests relying on hardcoded `TRADERS` data. Cover: BUY tab renders stock items;
BUY tab shows empty message; SELL tab renders hold items; SELL tab shows empty message;
SELECT on BUY tab calls `onBuy` with correct id; SELECT on SELL tab calls `onSell`;
tab switching; cursor navigation; `BACK` calls `onHub`; hold-capacity footer renders.

### Update: `src/game/scenes/ship-scene.test.ts`

Add `onCargo` to constructor. Cover: status bar shows cargo weight; `CARGO` action
fires `onCargo`; tap on cargo panel (right half of stat row) fires `onCargo`; tap on
fuel panel does not.

### Update: `src/game/world/world-data.test.ts`

Cover: `getCommodity` with valid id; `getCommodity` with unknown id returns `undefined`;
`computeCargoWeightKg` sums correctly across multiple entries.

---

## Acceptance criteria

- `npx tsc --noEmit` passes with zero errors.
- `npm test` passes with zero failures.
- Opening the Ship screen shows `CARGO:0/2000KG` for a fresh game.
- After buying items at a trader, cargo weight in the status bar updates correctly.
- After selling all items, cargo weight returns to 0.
- CargoScene shows the correct list and total; BACK returns to Ship.
- Trader stock refreshes after 2 minutes.
- Buying when the hold is full does nothing.
- Buying when credits are insufficient does nothing.

---

## Play-test checklist

1. Start game → Ship screen shows `CARGO:0/2000KG` in status bar.
2. Press `C` (keyboard) → CargoScene opens, shows "CARGO HOLD EMPTY". Close with ESC.
3. Dock at any station → open Trader → BUY tab shows 4–6 randomly generated items.
4. Select an item on BUY tab → item disappears, credits decrease, HOLD line updates.
5. Switch to SELL tab → bought item appears with correct qty and price.
6. Select item on SELL tab → item disappears, credits increase, HOLD line decreases.
7. Open CargoScene again → hold contents match expectation.
8. Fill hold to near capacity → buying a heavy item with insufficient space does nothing.
9. Leave station, return within 2 minutes → same (possibly depleted) stock on BUY tab.
10. Return after 2 minutes → fresh stock generated on BUY tab.
11. Sell at a different station → item leaves hold, appears in that station's BUY tab.

---

## Out of scope

- Partial buy/sell quantities (always all-or-nothing for now).
- Price variation by system, faction, or reputation.
- `goodsBias` filtering for stock generation.
- Visual feedback (flash, sound) when buy is rejected.
- Cargo jettison or spoilage mechanics.
