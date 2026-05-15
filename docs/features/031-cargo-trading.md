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
`CARGO` action (keyboard) or tapping the cargo panel (touch) opens `CargoScene`.

The ship status bar is split into two panels at `statRow = 2`. The right panel
(`col >= Math.floor(w / 2)`) displays the cargo reading. Touch must hit that
panel specifically — tapping the fuel panel (left) does nothing.

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

`CargoEntry` is defined by feature 033 (prerequisite). Add only `TraderStockEntry`
here:

```typescript
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

### 5b · `src/game/PlayerState.ts` — add `cargoWeightKg`

Feature 033 leaves `cargoWeightKg` as a stub. This feature adds the real
implementation. Add the import and getter:

```typescript
import { computeCargoWeightKg } from './world/world-data';

// inside PlayerState class:
get cargoWeightKg(): number {
  return computeCargoWeightKg(this._cargoHold as CargoEntry[]);
}
```

### 6 · `src/main.ts` and `terminal.ts`

The changes below are identical in both orchestrators. The `playerState` plain object
no longer exists (removed by feature 033); `player` is a `PlayerState` instance.

Import `TraderStockEntry` from `'./game/world/types'`.
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

Use `PlayerState` methods; no direct field mutation:

```typescript
function onBuy(commodityId: string): void {
  const stock = getOrCreateTraderStock(player.destinationId!);
  const idx = stock.findIndex(e => e.commodityId === commodityId);
  if (idx === -1) return;
  const entry = stock[idx];
  const commodity = getCommodity(commodityId);
  if (!commodity) return;
  const totalWeight = entry.qty * commodity.weightKg;
  const totalCost   = entry.qty * commodity.basePrice;
  const freeKg = player.cargoCapacity - player.cargoWeightKg;
  if (freeKg < totalWeight || player.credits < totalCost) return;
  player.spendCredits(totalCost);
  stock.splice(idx, 1);
  player.addCargo(commodityId, entry.qty);
}

function onSell(commodityId: string): void {
  const heldEntry = player.cargoHold.find(e => e.commodityId === commodityId);
  if (!heldEntry) return;
  const commodity = getCommodity(commodityId);
  if (!commodity) return;
  player.addCredits(heldEntry.qty * commodity.basePrice);
  player.removeCargo(commodityId);
  const stock = getOrCreateTraderStock(player.destinationId!);
  const traderEntry = stock.find(e => e.commodityId === commodityId);
  if (traderEntry) traderEntry.qty += heldEntry.qty;
  else stock.push({ commodityId, qty: heldEntry.qty });
}
```

#### d) Update `goToTrader`

```typescript
const goToTrader = () => {
  const stock = getOrCreateTraderStock(player.destinationId!);
  currentScene = new TraderScene(
    input, context, player,
    player.destinationId!,
    stock,
    onBuy,
    onSell,
    goToStation,
    goToShip,
  );
};
```

#### e) Update `goToShip`

`player` is passed directly (feature 033 already wired this up). Only new change here
is adding `goToCargo` as the final callback:

```typescript
const goToShip = () => {
  currentScene = new ShipScene(
    input, context, player,
    goToTravelMenu, goToStation, goToCargo,
  );
};
```

#### f) Add `goToCargo`

```typescript
const goToCargo = () => {
  currentScene = new CargoScene(
    input, context, player,
    goToShip,
  );
};
```

---

### 7 · `src/game/scenes/TraderScene.ts`

Complete overhaul of the BUY/SELL logic. Delete the hardcoded `TRADERS` constant and
`Trader` interface. Replace with the live-state approach.

#### New constructor signature

`PlayerStateRef` is removed; use `PlayerState` directly (from feature 033):

```typescript
import type { TraderStockEntry } from '../world/types';
import { getCommodity } from '../world/world-data';
import type { PlayerState } from '../PlayerState';

constructor(
  inputHandler: InputHandler,
  context: GameContext,
  player: PlayerState,
  destinationId: string,
  traderStock: TraderStockEntry[],      // mutable reference; live data
  onBuy: (commodityId: string) => void,
  onSell: (commodityId: string) => void,
  onHub: () => void,
  onUndock: () => void,
)
```

Store refs to `player`, `traderStock`, `onBuy`, `onSell` as private fields.
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
    return [...this.player.cargoHold].map(e => {
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

Compute weight using `this.player.cargoWeightKg` and capacity via
`this.player.cargoCapacity`.

---

### 8 · `src/game/scenes/ShipScene.ts`

`PlayerStateView` is deleted by feature 033. `ShipScene` already receives `player:
PlayerState`. This feature extends it with cargo display and the cargo scene action.

#### a) Update the constructor

Add `onCargo: () => void` as a new parameter after `onDock`:

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  player: PlayerState,
  onTravel: () => void,
  onDock: () => void,
  onCargo: () => void,   // ← new
)
```

Store as `private readonly onCargo`.

#### b) Add CARGO keyboard action

In `inputHandler.onAction`:

```typescript
} else if (action === 'CARGO') {
  this.activated = true;
  onCargo();
}
```

#### c) Add cargo panel tap for touch

In `inputHandler.onTap`, add a handler that fires only when the tap lands in the
right (cargo) panel of the stat bar. The stat bar lives at `statRow = 2`; the
right panel begins at `col = Math.floor(this.w / 2)`.

```typescript
const half = Math.floor(this.w / 2);
if (row === 2 && col >= half) {
  this.activated = true;
  onCargo();
  return;
}
```

Tapping the left (fuel) panel or any other row does not open CargoScene.

#### d) Update status bar rendering

Extend status bar to include cargo (reads from `this.player`):

```typescript
const statusText = `FUEL:${this.player.fuelL}/${this.player.fuelCapacityL}L | CARGO:${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG | CR:${this.player.credits}`;
```

#### e) Update footer hint

```typescript
const hint = this.context.primaryInput === 'touch'
  ? 'TAP cargo panel for hold'
  : '↑↓ navigate   ENTER select   C cargo';
```

---

### 9 · New file: `src/game/scenes/CargoScene.ts`

Read-only scene showing the contents of the player's cargo hold.

```typescript
import type { InputHandler, GameContext, CharBuffer, Scene } from '../../shared/types';
import { writeText, writeCentered } from '../../shared/buffer-utils';
import { getCommodity } from '../world/world-data';
import type { PlayerState } from '../PlayerState';

export class CargoScene implements Scene {
  private readonly context: GameContext;
  private readonly player: PlayerState;
  private activated = false;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    onBack: () => void,
  ) {
    this.context = context;
    this.player  = player;

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
for (const entry of this.player.cargoHold) {
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
if (this.player.cargoHold.length === 0) {
  writeCentered(buffer, 8, 'CARGO HOLD EMPTY', 'bright-black', 'black');
}
```

Total row:

```typescript
writeText(buffer, h - 3, 2, `TOTAL: ${this.player.cargoWeightKg}/${this.player.cargoCapacity} KG`, 'bright-cyan', 'black');
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

Update constructor call to include `onCargo` callback. Use the shared `makePlayer()`
helper (from feature 033) to build the `PlayerState`. Verify:

| # | Test |
|---|------|
| 1 | Status bar renders `CARGO:0/2000KG` for empty hold |
| 2 | Status bar renders correct weight when cargoWeightKg > 0 |
| 3 | CARGO action fires onCargo callback |
| 4 | Tap on cargo panel (row 2, col >= half) fires onCargo callback |
| 5 | Tap on fuel panel (row 2, col < half) does NOT fire onCargo |

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
2. Press `C` (keyboard) → CargoScene opens, shows "CARGO HOLD EMPTY". Close with ESC.
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
