# Feature 031 · Cargo Trading

## Goal

Introduce a working cargo economy. The player's ship gains a persistent cargo hold
that survives scene transitions. Traders randomly generate their available stock on
first visit and refresh it after 2 minutes. The player buys the entire available lot
of an item in one action (no partial quantities yet) or sells their entire stock of a
type in one action. Prices are fixed at the commodity's `basePrice` throughout this
feature. A new Cargo scene, accessible from the Ship screen, provides a read-only
breakdown of the hold's contents and weight.

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

Each destination's trader stock is cached per session in a `Map` keyed by
`destinationId`. On opening the TraderScene the orchestrator calls
`getOrCreateTraderStock(destinationId)` which:
1. Returns the existing stock if it was generated within the last 2 minutes.
2. Otherwise generates a fresh random selection and resets the timestamp.

When a player buys an item the entry is removed from the cache array in place.
When a player sells an item the entry is added to (or merged into) the cache.
The mutable cache array is passed directly into `TraderScene` as a reference so the
scene always sees live data on each render without needing to reconstruct.

### Stock generation

Pick 4–6 commodities at random from `WORLD.commodities` (uniform distribution,
no goodsBias filtering in this feature). Assign each a qty of 1–8 units.

### Accessing cargo from the Ship screen

A new `CARGO` game action is added, mapped to the `c` / `C` keys. In `ShipScene`,
`CARGO` action (keyboard) or tapping row 0 (the status bar row, touch) opens
`CargoScene`. The footer hint updates to show the `C cargo` shortcut.

---

## Changed types

### 1 · `src/shared/types.ts`

Add `'CARGO'` to the `GameAction` union:

```typescript
export type GameAction =
  | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  | 'SELECT' | 'BACK' | 'PAUSE' | 'CARGO'
  | 'PAGE_UP' | 'PAGE_DOWN';
```

### 2 · `src/game/world/types.ts`

Add two new interfaces (below the existing commodity types):

```typescript
export interface CargoEntry {
  commodityId: string;
  qty: number;           // units held
}

export interface TraderStockEntry {
  commodityId: string;
  qty: number;           // units available for sale
}
```

---

## Changed files

### 3 · `src/platform/dom/DOMInputHandler.ts`

Add `c` and `C` to `KEY_MAP`:

```typescript
c: 'CARGO',
C: 'CARGO',
```

### 4 · `src/platform/terminal/TerminalInputHandler.ts`

Add to `KEY_MAP` array:

```typescript
['c', 'CARGO'],
['C', 'CARGO'],
```

### 5 · `src/game/world/world-data.ts`

Add three exports alongside the existing `getSystem`, `getDrive`, etc.:

```typescript
export function getCommodity(id: string): Commodity | undefined {
  return WORLD.commodities.find(c => c.id === id);
}

export function getCommodities(): Commodity[] {
  return WORLD.commodities;
}

export function computeCargoWeightKg(cargoHold: CargoEntry[]): number {
  return cargoHold.reduce((total, entry) => {
    const commodity = getCommodity(entry.commodityId);
    return total + (commodity ? entry.qty * commodity.weightKg : 0);
  }, 0);
}
```

### 6 · `src/main.ts` and `terminal.ts`

The changes below are identical in both orchestrators.

#### a) Extend `playerState`

Add `cargoHold` and remove `cargo` (replace with computed weight):

```typescript
const playerState = {
  fuelL:         ship.fuelCapacityL,
  fuelCapacityL: ship.fuelCapacityL,
  driveId:       ship.defaultJumpDrive,
  cargoHold:     [] as CargoEntry[],    // ← new; replaces cargo: 0
  cargoCapacity: ship.cargoCapacityKg,
  credits:       settings.player.startingCredits,
};
```

Import `CargoEntry` and `TraderStockEntry` from `'./game/world/types'`.
Import `getCommodity`, `getCommodities`, `computeCargoWeightKg` from `'./game/world/world-data'`.

#### b) Add trader stock cache

```typescript
const TRADER_STOCK_REFRESH_MS = 2 * 60 * 1000;

interface TraderStockRecord {
  entries: TraderStockEntry[];
  generatedAt: number;
}
const traderStockCache = new Map<string, TraderStockRecord>();

function getOrCreateTraderStock(destinationId: string): TraderStockEntry[] {
  const now = Date.now();
  const cached = traderStockCache.get(destinationId);
  if (cached && now - cached.generatedAt < TRADER_STOCK_REFRESH_MS) {
    return cached.entries;
  }
  const all = getCommodities();
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  const count = 4 + Math.floor(Math.random() * 3); // 4, 5, or 6
  const entries: TraderStockEntry[] = shuffled.slice(0, count).map(c => ({
    commodityId: c.id,
    qty: 1 + Math.floor(Math.random() * 8), // 1–8
  }));
  traderStockCache.set(destinationId, { entries, generatedAt: now });
  return entries;
}
```

#### c) Add `onBuy` and `onSell`

```typescript
function onBuy(commodityId: string): void {
  const stock = getOrCreateTraderStock(currentDestinationId!);
  const idx = stock.findIndex(e => e.commodityId === commodityId);
  if (idx === -1) return;
  const entry = stock[idx];
  const commodity = getCommodity(commodityId);
  if (!commodity) return;
  const totalWeight = entry.qty * commodity.weightKg;
  const totalCost   = entry.qty * commodity.basePrice;
  const freeKg = playerState.cargoCapacity - computeCargoWeightKg(playerState.cargoHold);
  if (freeKg < totalWeight || playerState.credits < totalCost) return;
  playerState.credits -= totalCost;
  stock.splice(idx, 1);
  const held = playerState.cargoHold.find(e => e.commodityId === commodityId);
  if (held) {
    held.qty += entry.qty;
  } else {
    playerState.cargoHold.push({ commodityId, qty: entry.qty });
  }
}

function onSell(commodityId: string): void {
  const holdIdx = playerState.cargoHold.findIndex(e => e.commodityId === commodityId);
  if (holdIdx === -1) return;
  const entry = playerState.cargoHold[holdIdx];
  const commodity = getCommodity(commodityId);
  if (!commodity) return;
  playerState.credits += entry.qty * commodity.basePrice;
  playerState.cargoHold.splice(holdIdx, 1);
  const stock = getOrCreateTraderStock(currentDestinationId!);
  const traderEntry = stock.find(e => e.commodityId === commodityId);
  if (traderEntry) {
    traderEntry.qty += entry.qty;
  } else {
    stock.push({ commodityId, qty: entry.qty });
  }
}
```

#### d) Update `goToTrader`

```typescript
const goToTrader = () => {
  const stock = getOrCreateTraderStock(currentDestinationId!);
  currentScene = new TraderScene(
    input, context,
    currentDestinationId!,
    playerState,
    stock,
    onBuy,
    onSell,
    goToStation,
    goToShip,
  );
};
```

#### e) Update `goToShip`

Pass `cargoWeightKg` (computed) and add `goToCargo`:

```typescript
const goToShip = () => {
  currentScene = new ShipScene(
    input, context,
    currentSystemId, currentDestinationId,
    {
      fuelL:         playerState.fuelL,
      fuelCapacityL: playerState.fuelCapacityL,
      cargoWeightKg: computeCargoWeightKg(playerState.cargoHold),
      cargoCapacity: playerState.cargoCapacity,
      credits:       playerState.credits,
    },
    goToTravelMenu, goToStation, goToCargo,
  );
};
```

#### f) Add `goToCargo`

```typescript
const goToCargo = () => {
  currentScene = new CargoScene(
    input, context,
    playerState.cargoHold,
    playerState.cargoCapacity,
    goToShip,
  );
};
```

---

### 7 · `src/game/scenes/TraderScene.ts`

Complete overhaul of the BUY/SELL logic. Delete the hardcoded `TRADERS` constant and
`Trader` interface. Replace with the live-state approach.

#### New constructor signature

```typescript
import type { CargoEntry, TraderStockEntry } from '../world/types';
import { getCommodity } from '../world/world-data';

interface PlayerStateRef {
  cargoHold: CargoEntry[];
  cargoCapacity: number;
  credits: number;
}

constructor(
  inputHandler: InputHandler,
  context: GameContext,
  destinationId: string,
  playerState: PlayerStateRef,
  traderStock: TraderStockEntry[],      // mutable reference; live data
  onBuy: (commodityId: string) => void,
  onSell: (commodityId: string) => void,
  onHub: () => void,
  onUndock: () => void,
)
```

Store refs to `playerState`, `traderStock`, `onBuy`, `onSell` as private fields.
Remove the `trader` and `traderName` fields. Keep `traderName` derived from the
destination's `npcs.trader` as before.

#### Updated `currentItems()`

```typescript
private currentItems(): Array<{ commodityId: string; qty: number; price: number; name: string }> {
  if (this.activeTab === 'BUY') {
    return this.traderStock.map(e => {
      const c = getCommodity(e.commodityId)!;
      return { commodityId: e.commodityId, qty: e.qty, price: c.basePrice, name: c.name };
    });
  } else {
    return this.playerState.cargoHold.map(e => {
      const c = getCommodity(e.commodityId)!;
      return { commodityId: e.commodityId, qty: e.qty, price: c.basePrice, name: c.name };
    });
  }
}
```

#### Updated SELECT handling

```typescript
} else if (action === 'SELECT') {
  const items = this.currentItems();
  const item = items[this.cursorIdx];
  if (!item) return;
  if (this.activeTab === 'BUY') {
    this.onBuy(item.commodityId);
  } else {
    this.onSell(item.commodityId);
  }
```

Do NOT set `this.activated = true` on SELECT — the player stays in the scene
to make further buys/sells.

#### Updated render

In `render`, call `this.currentItems()` and display each as:

```
> Iron Ore (x3) ............. 240 CR
  Ration Packs (x8) ......... 480 CR
```

Format: `{prefix}{name} (x{qty}) {dots} {total} CR` where total = `qty × price`.

If `currentItems()` returns an empty array, show centred dim text:
- BUY tab empty: `NO STOCK AVAILABLE`
- SELL tab empty: `CARGO HOLD EMPTY`

Show a hold-capacity footer line above the hint (both tabs):

```
HOLD: 46/2000 KG
```

Compute weight using `computeCargoWeightKg` — import it from `world-data.ts`.

---

### 8 · `src/game/scenes/ShipScene.ts`

#### a) Update `PlayerStateView`

```typescript
interface PlayerStateView {
  fuelL: number;
  fuelCapacityL: number;
  cargoWeightKg: number;   // ← replaces cargo: number
  cargoCapacity: number;
  credits: number;
}
```

Remove the `INITIAL_STATE` constant and the internal `state` field (already done by
feature 030; skip if already gone).

#### b) Update the constructor

Add `onCargo: () => void` as a new parameter after `onDock`:

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  systemId: string,
  destinationId: string | null,
  playerState: PlayerStateView,
  onTravel: () => void,
  onDock: () => void,
  onCargo: () => void,   // ← new
)
```

Store as `private readonly onCargo`.

#### c) Add CARGO keyboard action

In `inputHandler.onAction`:

```typescript
} else if (action === 'CARGO') {
  this.activated = true;
  onCargo();
}
```

#### d) Add status bar tap for touch

In `inputHandler.onTap`, add a handler for status bar row before the existing
button-row check:

```typescript
if (row === STATUS_ROW) {
  this.activated = true;
  onCargo();
  return;
}
```

`STATUS_ROW` is already defined as `0`.

#### e) Update status bar rendering

Replace `this.state.cargo` / `this.state.cargoCapacity` with the new fields:

```typescript
const statusText = `FUEL:${playerState.fuelL}/${playerState.fuelCapacityL}L | CARGO:${playerState.cargoWeightKg}/${playerState.cargoCapacity}KG | CR:${playerState.credits}`;
```

#### f) Update footer hint

```typescript
const hint = this.context.primaryInput === 'touch'
  ? 'TAP status for cargo'
  : '↑↓ navigate   ENTER select   C cargo';
```

---

### 9 · New file: `src/game/scenes/CargoScene.ts`

Read-only scene showing the contents of the player's cargo hold.

```typescript
import type { InputHandler, GameContext, CharBuffer, Scene } from '../../shared/types';
import { writeText, writeCentered } from '../../shared/buffer-utils';
import { getCommodity, computeCargoWeightKg } from '../world/world-data';
import type { CargoEntry } from '../world/types';

export class CargoScene implements Scene {
  private readonly context: GameContext;
  private readonly cargoHold: CargoEntry[];
  private readonly cargoCapacity: number;
  private activated = false;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    cargoHold: CargoEntry[],
    cargoCapacity: number,
    onBack: () => void,
  ) {
    this.context = context;
    this.cargoHold = cargoHold;
    this.cargoCapacity = cargoCapacity;

    inputHandler.onAction((action) => {
      if (this.activated) return;
      if (action === 'BACK' || action === 'CARGO') {
        this.activated = true;
        onBack();
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTwoFingerTap?.(() => {
        if (this.activated) return;
        this.activated = true;
        onBack();
      });
    }
  }

  update(_dt: number): void {}

  render(buffer: CharBuffer): void { ... }
}
```

#### CargoScene layout (40 × 30)

```
Row 0–1:  (blank)
Row 2:    "CARGO HOLD"  centred, bright-cyan
Row 3:    "==========" centred (same width as title), cyan
Row 4:    (blank)
Rows 5+:  cargo items (or empty message)
          Each item: "  {name} (x{qty}) {dots} {weightKg}KG"
          fg: white
Row h-4:  "---" dim separator at col 2
Row h-3:  "  TOTAL: {used}/{cap} KG"  bright-cyan
Row h-2:  hint: "ESC return" (keyboard) / "2-finger TAP to exit" (touch)  dim
```

Item rendering:

```typescript
const contentWidth = w - 2; // subtract left/right margin
for (const entry of this.cargoHold) {
  const commodity = getCommodity(entry.commodityId)!;
  const name    = commodity.name.slice(0, 16);
  const qty     = `x${entry.qty}`;
  const kgStr   = `${entry.qty * commodity.weightKg}KG`;
  const fixed   = 2 + name.length + 4 + qty.length + 1 + kgStr.length; // "  {name} ({qty}) {dots} {kgStr}"
  const dotLen  = Math.max(1, contentWidth - fixed);
  const line    = `  ${name} (${qty}) ${'.'.repeat(dotLen)} ${kgStr}`;
  writeText(buffer, row, 0, line, 'white', 'black');
  row++;
  if (row >= h - 4) break; // leave room for total
}
```

Empty hold:

```typescript
if (this.cargoHold.length === 0) {
  writeCentered(buffer, 8, 'CARGO HOLD EMPTY', 'bright-black', 'black');
}
```

Total row:

```typescript
const usedKg = computeCargoWeightKg(this.cargoHold);
writeText(buffer, h - 3, 2, `TOTAL: ${usedKg}/${this.cargoCapacity} KG`, 'bright-cyan', 'black');
```

Hint row: as above per `context.primaryInput`.

---

## Tests to add / update

### `src/game/scenes/cargo-scene.test.ts` (new, ~10 tests)

| # | Test |
|---|------|
| 1 | Empty hold → "CARGO HOLD EMPTY" centred |
| 2 | Single item in hold → correct name, qty, weight line |
| 3 | Multiple items render in order |
| 4 | Total weight computed correctly |
| 5 | Total shows capacity correctly |
| 6 | BACK action fires onBack |
| 7 | CARGO action fires onBack (toggle) |
| 8 | Two-finger tap fires onBack |
| 9 | Item line does not render if row exceeds buffer height |
| 10 | Title and rule centred |

### `src/game/scenes/trader-scene.test.ts` (update, ~12 tests)

Remove tests that relied on hardcoded `TRADERS` data.

| # | Test |
|---|------|
| 1 | BUY tab renders trader stock items with name, qty, total price |
| 2 | BUY tab shows "NO STOCK AVAILABLE" when stock array is empty |
| 3 | SELL tab renders cargo hold items |
| 4 | SELL tab shows "CARGO HOLD EMPTY" when hold is empty |
| 5 | SELECT on BUY tab calls onBuy with correct commodityId |
| 6 | SELECT on SELL tab calls onSell with correct commodityId |
| 7 | LEFT switches to BUY tab, resets cursor |
| 8 | RIGHT switches to SELL tab, resets cursor |
| 9 | UP/DOWN cursor navigation wraps on BUY tab |
| 10 | BACK calls onHub |
| 11 | NavBar tap for undock calls onUndock |
| 12 | Hold capacity line renders on both tabs |

### `src/game/scenes/ship-scene.test.ts` (update, ~3 tests)

Update constructor call to include `onCargo` callback and pass `cargoWeightKg` in
`playerState`. Verify:

| # | Test |
|---|------|
| 1 | Status bar renders `CARGO:0/2000KG` for empty hold |
| 2 | Status bar renders correct weight when cargoWeightKg > 0 |
| 3 | CARGO action fires onCargo callback |

### `src/game/world/world-data.test.ts` (update, ~3 tests)

| # | Test |
|---|------|
| 1 | `getCommodity('iron-ore')` returns correct record |
| 2 | `getCommodity('nonexistent')` returns undefined |
| 3 | `computeCargoWeightKg` sums correctly across multiple entries |

---

## Acceptance criteria

- `npx tsc --noEmit` passes with zero errors.
- `npm test` passes with zero failures.
- Opening the Ship screen shows `CARGO:0/2000KG` for a fresh game.
- After buying items at a trader, cargo weight in status bar updates correctly.
- After selling all items, cargo weight returns to 0.
- CargoScene shows the correct list and total; BACK returns to Ship.
- Trader stock refreshes after 2 minutes (manual test: set `TRADER_STOCK_REFRESH_MS`
  to a small value in a debug session to verify, then restore to `120_000`).
- Buying when hold is full does nothing.
- Buying when credits are insufficient does nothing.

---

## Play-test checklist

1. Start game → Ship screen shows `CARGO:0/2000KG` in status bar.
2. Press `C` (keyboard) or tap status bar (touch) → CargoScene opens, shows "CARGO HOLD EMPTY".
3. Press ESC → back to Ship screen.
4. Dock at any station → open Trader → BUY tab shows 4–6 randomly generated items.
5. Select an item on BUY tab → item disappears from BUY tab, credits decrease,
   HOLD line updates.
6. Switch to SELL tab → bought item appears with correct qty and price.
7. Select item on SELL tab → item disappears, credits increase, HOLD line decreases.
8. Open CargoScene again → confirms hold contents match expectation.
9. Fill hold to near capacity → buying a heavy item with insufficient space does nothing.
10. Leave station, return within 2 minutes → same (possibly depleted) stock on BUY tab.
11. Return after 2 minutes → fresh stock generated on BUY tab.
12. Sell at a different station → item leaves hold, appears in that station's BUY tab.

---

## Out of scope

- Partial buy/sell quantities (always all-or-nothing for now).
- Price variation by system, faction, or reputation.
- `goodsBias` filtering for stock generation.
- Visual feedback (flash, sound) when buy is rejected.
- Inventory weight limit display on the trader screen beyond the hold-capacity footer.
- Cargo jettison or spoilage mechanics.
