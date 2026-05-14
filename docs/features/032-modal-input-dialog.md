# Feature 032 · Modal Input Dialog

## Goal

Introduce a reusable `ModalInputDialog` component that overlays a numeric input form on
any `BaseMenuScene` subclass.  Replace the one-shot buy-all/sell-all mechanic from
feature 031 and the full-refuel mechanic from feature 030 with dialogs that let the
player choose an exact quantity or litre count before confirming.

**Depends on:** 031 (Cargo Trading — must be DONE first)

**Modifies these post-031/030 interfaces:**
- `onBuy(commodityId, qty)` — adds a `qty: number` argument (031 spec had `commodityId` only)
- `onSell(commodityId, qty)` — same addition
- `onRefuel(cost, litres)` — adds a `litres: number` argument (030 spec had `cost` only)

---

## Design decisions

### Modal as overlay, not a scene

The dialog renders into a sub-rectangle of the current buffer rather than replacing the
full scene.  The trader list (or station menu) remains visible behind it, preserving
context.

Because `InputHandler` callbacks register at construction time and cannot be removed,
the parent (`BaseMenuScene`) intercepts all actions and routes them into the dialog while
it is open, suppressing its own normal handling.  The dialog is never registered directly
against the `InputHandler` — it only receives pre-routed calls.

### Character input extension

A new optional method `onCharInput(handler)` is added to the `InputHandler` interface.
It delivers:
- `'0'`–`'9'` for digit keys
- `'\b'` for Backspace / Delete

Both platform handlers fire `onCharInput` **in addition to** any `GameAction` that the
same keypress already produces (digits `1`–`9` currently map to `NAV_1`–`NAV_9`; that
mapping is preserved so existing nav behaviour is unaffected when no modal is open).
`BaseMenuScene` ignores `onCharInput` events unless a modal is currently open.

### First-character-clears

When the dialog opens `replaceNextDigit = true`.  The first digit typed replaces the
existing value and sets `replaceNextDigit = false`; subsequent digits append.  Arrow
keys (UP/DOWN) adjust by `step` and do **not** change `replaceNextDigit` — so digits
typed after arrows still append rather than replace.  Backspace removes the last digit
(by integer-dividing by 10); if the result is 0, `replaceNextDigit` is reset to `true`.

### TAB action

`'TAB'` is added to `GameAction` and mapped in both platform handlers.  It cycles focus
forward: `field → confirm button → cancel button → field`.

### Focus styling

| Control | Focused | Unfocused |
|---------|---------|-----------|
| Number input box `\| … \|` | black on green | white on black |
| Button `\| Label \|` | black on green | white on black |
| Labels and derived rows | white on black | (always this) |

Dialog background: every cell in the dialog rectangle is black.

---

## Changed types

### `src/shared/types.ts`

1. Add `'TAB'` to `GameAction`:

```typescript
export type GameAction =
  | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  | 'SELECT' | 'BACK' | 'PAUSE' | 'TAB'
  | 'PAGE_UP' | 'PAGE_DOWN' | 'CARGO'
  | 'NAV_1' | 'NAV_2' | 'NAV_3' | 'NAV_4' | 'NAV_5'
  | 'NAV_6' | 'NAV_7' | 'NAV_8' | 'NAV_9';
```

2. Add `onCharInput` to `InputHandler`:

```typescript
export interface InputHandler {
  onAction(handler: (action: GameAction) => void): void;
  onTap?(handler: (col: number, row: number) => void): void;
  onCharInput?(handler: (char: string) => void): void;
}
```

---

## Changed files

### 1 · `src/platform/dom/DOMInputHandler.ts`

**a)** Add a `charHandlers` array and an `onCharInput` method:

```typescript
private charHandlers: ((char: string) => void)[] = [];

onCharInput(handler: (char: string) => void): void {
  this.charHandlers.push(handler);
}
```

**b)** Add `Tab` to `PREVENT_DEFAULT_KEYS`.

**c)** Restructure the `keydown` listener to fire both charInput events and action events
without short-circuiting one for the other:

```typescript
this.keyListener = (event: KeyboardEvent) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    for (const h of this.actionHandlers.slice()) h('TAB');
    return;
  }
  if (!event.ctrlKey && !event.altKey && !event.metaKey) {
    if (/^[0-9]$/.test(event.key)) {
      for (const h of this.charHandlers.slice()) h(event.key);
      // fall through — digit keys also map to NAV_1-9
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      for (const h of this.charHandlers.slice()) h('\b');
      return;
    }
  }
  const action = KEY_MAP[event.key];
  if (!action) return;
  if (PREVENT_DEFAULT_KEYS.has(event.key)) event.preventDefault();
  for (const h of this.actionHandlers.slice()) h(action);
};
```

### 2 · `src/platform/terminal/TerminalInputHandler.ts`

**a)** Add a `charHandlers` array and an `onCharInput` method (same pattern as DOM).

**b)** In the `data` listener, handle Tab, digits, and backspace before the KEY_MAP
loop; digits fall through to KEY_MAP so `NAV_1`–`NAV_9` still fire:

```typescript
this.dataHandler = (chunk) => {
  const key = chunk.toString();
  if (EXIT_KEYS.has(key)) { process.exit(0); return; }

  // Tab
  if (key === '\t') {
    for (const h of this.handlers) h('TAB');
    return;
  }

  // Char input: digits fire charInput then fall through to KEY_MAP (NAV_1-9)
  if (/^[0-9]$/.test(key)) {
    for (const h of this.charHandlers) h(key);
    // fall through
  }
  // Backspace (DEL = 0x7f, BS = 0x08)
  if (key === '\x7f' || key === '\x08') {
    for (const h of this.charHandlers) h('\b');
    return;
  }

  for (const [seq, action] of KEY_MAP) {
    if (key === seq) {
      for (const h of this.handlers) h(action);
      return;
    }
  }
};
```

**c)** Add `['0', 'NAV_0']` to KEY_MAP is **not** needed — `'0'` is delivered only via
`onCharInput`.

### 3 · `src/game/scenes/BaseMenuScene.ts`

**a)** Add a protected modal field:

```typescript
protected modal: ModalInputDialog | null = null;
```

**b)** Add `openModal` and `closeModal` helpers:

```typescript
protected openModal(dialog: ModalInputDialog): void {
  this.modal = dialog;
}

protected closeModal(): void {
  this.modal = null;
}
```

**c)** At the top of the `onAction` lambda, intercept when a modal is open:

```typescript
inputHandler.onAction((action) => {
  if (this.modal !== null) {
    this.modal.handleAction(action);
    return;
  }
  // … existing handling unchanged …
});
```

**d)** At the top of the `onTap` lambda, intercept tap events:

```typescript
if (inputHandler.onTap) {
  inputHandler.onTap((col, row) => {
    if (this.modal !== null) {
      this.modal.handleTap(col, row);
      return;
    }
    // … existing tap handling unchanged …
  });
}
```

**e)** Register `onCharInput` routing:

```typescript
inputHandler.onCharInput?.((char) => {
  if (this.modal !== null) {
    this.modal.handleCharInput(char);
  }
});
```

**f)** At the end of `render()`, draw the modal on top if open:

```typescript
if (this.modal !== null) {
  this.modal.render(buffer);
}
```

### 4 · `src/game/scenes/TraderScene.ts` (post-031 state)

Change the SELECT action on a BUY or SELL item from calling `onBuy`/`onSell` directly to
opening a modal.  Compute initial value and max before constructing the form.

```typescript
// Called when SELECT fires on an item in the active tab
private openTradeDialog(item: { commodityId: string; name: string; price: number; qty: number }): void {
  const isBuy = this.activeTab === 'BUY';
  const initialValue = isBuy
    ? Math.min(item.qty, Math.floor(this.playerState.credits / item.price))
    : item.qty;
  const maxValue = isBuy
    ? Math.min(item.qty, Math.floor(this.playerState.credits / item.price))
    : item.qty;

  if (maxValue === 0) return; // nothing to buy/sell — no dialog

  const form: ModalFormDef = {
    title: `${isBuy ? 'Buy' : 'Sell'} ${item.name}`,
    field: {
      label: 'Quantity',
      initialValue,
      min: 0,
      max: maxValue,
      step: 1,
    },
    derivedRows: [{
      label: 'Total Value',
      compute: (n) => `${n * item.price} CR`,
    }],
    confirmLabel: isBuy ? 'Buy' : 'Sell',
    onConfirm: (qty) => {
      if (qty > 0) {
        isBuy ? this.onBuy(item.commodityId, qty) : this.onSell(item.commodityId, qty);
      }
      this.closeModal();
    },
    onCancel: () => this.closeModal(),
  };
  this.openModal(new ModalInputDialog(form));
}
```

Do **not** set `this.activated = true` when opening the dialog — the player stays in
TraderScene after a trade.

The `onBuy` and `onSell` constructor parameters become `(commodityId: string, qty: number) => void`.

### 5 · `src/game/scenes/StationMenuScene.ts` (post-030 state)

Replace the immediate-refuel action for BUY FUEL with a modal.  The existing item is
already computed; change its `action` callback to:

```typescript
action: () => {
  const fuelNeeded = fuelCapacityL - fuelL;
  const maxAffordable = Math.floor(credits / FUEL_PRICE_PER_L);
  const maxLitres = Math.min(fuelNeeded, maxAffordable);

  if (maxLitres === 0) return; // guard: shouldn't occur if item is shown

  const form: ModalFormDef = {
    title: 'Buy Fuel',
    field: {
      label: 'Litres',
      initialValue: maxLitres,
      min: 0,
      max: maxLitres,
      step: 10,
    },
    derivedRows: [{
      label: 'Total Value',
      compute: (n) => `${n * FUEL_PRICE_PER_L} CR`,
    }],
    confirmLabel: 'Buy',
    onConfirm: (litres) => {
      if (litres > 0) onRefuel(litres * FUEL_PRICE_PER_L, litres);
      this.closeModal();
    },
    onCancel: () => this.closeModal(),
  };
  this.openModal(new ModalInputDialog(form));
},
```

`StationMenuScene` must store `fuelL`, `fuelCapacityL`, and `credits` as instance fields
so the action closure can reference them.

### 6 · `src/main.ts` and `terminal.ts`

Update the `onBuy`, `onSell`, and `onRefuel` callbacks to accept and use the new `qty`
/ `litres` arguments:

```typescript
function onBuy(commodityId: string, qty: number): void {
  // … same logic as 031 but use qty instead of entry.qty …
}

function onSell(commodityId: string, qty: number): void {
  // … same logic as 031 but use qty instead of entry.qty …
}

// onRefuel updated signature:
(cost: number, litres: number) => {
  playerState.credits -= cost;
  playerState.fuelL = Math.min(playerState.fuelL + litres, playerState.fuelCapacityL);
  goToStation();
},
```

---

## New file: `src/game/ui/ModalInputDialog.ts`

### Form definition types

```typescript
export interface NumberFieldDef {
  label: string;         // e.g. 'Quantity', 'Litres'
  initialValue: number;
  min: number;           // 0
  max: number;
  step: number;          // 1 for goods, 10 for fuel
}

export interface DerivedRowDef {
  label: string;         // e.g. 'Total Value'
  compute: (value: number) => string;
}

export interface ModalFormDef {
  title: string;
  field: NumberFieldDef;
  derivedRows: DerivedRowDef[];
  confirmLabel: string;  // 'Buy' or 'Sell'
  onConfirm: (value: number) => void;
  onCancel: () => void;
}
```

### Layout

The dialog box is **30 columns wide** and **`8 + D` rows tall** (where D = `derivedRows.length`).
It is drawn centred in the buffer:

```
startCol = Math.floor((bufferW - 30) / 2)   → col 5 on a 40-wide buffer
startRow = Math.floor((bufferH - height) / 2)
```

The standard 1-derived-row form is 9 rows tall, centred at row 10 on a 30-row buffer.

```
dialogRow 0:  +----------------------------+        (border)
dialogRow 1:  | {title}                    |
dialogRow 2:  | {underline '…}             |
dialogRow 3:  |                            |        (blank)
dialogRow 4:  | {label} : | {value,5d} |   |        (number field)
dialogRow 5:  | {derived[0].label} : {val} |        (derived row 0)
   …          | (one row per extra derived) |
dialogRow 5+D:|                            |        (blank)
dialogRow 6+D:| | {confirmLabel} | | Cancel| |      (buttons)
dialogRow 7+D:+----------------------------+        (border)
```

Borders use `+` corners, `-` horizontal, `|` vertical — consistent with `drawBorder`.
Each cell in the dialog rectangle (including the border) starts with `bg: 'black'`.

#### Number field row (dialogRow 4)

Inner content (28 chars between the `|` borders):

```
 {label padded to labelWidth} :  | {value right-justified in 5 chars} |
```

- `labelWidth = Math.max(field.label.length, ...derivedRows.map(r => r.label.length))`
- One space left margin, `labelWidth` chars for label, ` : `, two spaces, then the value box.
- Value box = `| ` + value + ` |` (value is right-aligned in a field 5 chars wide, padded with spaces).
- The value box portion (from `|` to `|` inclusive): bg `'green'`/fg `'black'` when
  `focusedControl === 'field'`; bg `'black'`/fg `'white'` otherwise.

#### Derived rows (dialogRows 5 … 5+D-1)

Same left margin and label width as the field row; the computed value string is
right-aligned to the same end column as the value box.

Colour: fg `'white'`, bg `'black'` always (read-only).

#### Button row (dialogRow 6+D)

Confirm button text: `| {confirmLabel} |` (e.g. `| Buy |` = 7 chars, `| Sell |` = 8 chars).
Cancel button text: `| Cancel |` (10 chars).

Both buttons are centred together within the 28-char inner width with a 3-space gap
between them; remaining space is split equally (rounded down) on the outside.

```
padding = Math.floor((28 - confirmLen - 10 - 3) / 2)
row text: {padding} {confirm} {3 spaces} {cancel} {padding}
```

Each button renders its characters:
- Focused button: bg `'green'`, fg `'black'`
- Unfocused button: bg `'black'`, fg `'white'`

#### Caching bounds

After each `render()` call the dialog stores:

```typescript
private lastBounds: { startRow: number; startCol: number; endRow: number; endCol: number } | null = null;
```

`handleTap` uses these bounds to hit-test the value box and button regions.

### `handleAction` routing

| `focusedControl` | Action | Effect |
|------------------|--------|--------|
| any | `BACK` | `form.onCancel()` |
| `'field'` | `UP` | `value = min(value + step, max)` |
| `'field'` | `DOWN` | `value = max(value − step, min)` |
| `'field'` | `SELECT` | `form.onConfirm(value)` |
| `'field'` | `TAB` or `RIGHT` | `focusedControl = 'confirm'` |
| `'confirm'` | `SELECT` | `form.onConfirm(value)` |
| `'confirm'` | `TAB` or `RIGHT` | `focusedControl = 'cancel'` |
| `'confirm'` | `LEFT` or `UP` | `focusedControl = 'field'` |
| `'cancel'` | `SELECT` | `form.onCancel()` |
| `'cancel'` | `TAB` | `focusedControl = 'field'` |
| `'cancel'` | `LEFT` | `focusedControl = 'confirm'` |
| `'cancel'` | `UP` | `focusedControl = 'field'` |

`NAV_1`–`NAV_9` and `DOWN` on `'confirm'` / `'cancel'` are ignored (no-op).

### `handleCharInput` logic

Only processed when `focusedControl === 'field'`:

```typescript
handleCharInput(char: string): void {
  if (this.focusedControl !== 'field') return;
  if (char === '\b') {
    this.value = Math.floor(this.value / 10);
    if (this.value === 0) this.replaceNextDigit = true;
  } else if (/^[0-9]$/.test(char)) {
    const digit = parseInt(char, 10);
    if (this.replaceNextDigit) {
      this.value = digit;
      this.replaceNextDigit = false;
    } else {
      this.value = Math.min(this.value * 10 + digit, this.form.field.max);
    }
  }
}
```

### `handleTap` logic

Uses `lastBounds` to determine which hit region was tapped.  Regions (all in buffer
coordinates):
- **Value box**: row `startRow + 4`, cols `valueBoxStart` to `valueBoxEnd`.  Tap → `focusedControl = 'field'`.
- **Confirm button**: row `startRow + 6 + D`, cols for the confirm button span.  Tap → `form.onConfirm(value)`.
- **Cancel button**: same row, cols for the cancel button span.  Tap → `form.onCancel()`.
- Anywhere else in the dialog or outside: no-op.

---

## Tests

### `src/game/ui/modal-input-dialog.test.ts` (new, ~18 tests)

| # | Test |
|---|------|
| 1 | `render` draws `+` corners and `-`/`|` border at correct buffer positions |
| 2 | Title renders at dialog row 1, underline at row 2 |
| 3 | Field label and initial value render at dialog row 4 |
| 4 | Derived row label and computed value render at dialog row 5 |
| 5 | Confirm and cancel button text at dialog row 6 (D=1) |
| 6 | Focused field: value box cells have `bg: 'green'` |
| 7 | Unfocused field (focus on confirm): value box cells have `bg: 'black'` |
| 8 | Focused confirm button: its cells have `bg: 'green'` |
| 9 | `UP` increments value by step; clamped at max |
| 10 | `DOWN` decrements value by step; clamped at min |
| 11 | First digit typed replaces existing value (`replaceNextDigit = true` on open) |
| 12 | Second digit appends to first |
| 13 | Backspace removes last digit (`Math.floor(50 / 10) === 5`) |
| 14 | Backspace to 0 resets `replaceNextDigit` |
| 15 | `TAB` from field → confirm → cancel → field |
| 16 | `SELECT` with field focused fires `onConfirm` with current value |
| 17 | `SELECT` with confirm focused fires `onConfirm` |
| 18 | `SELECT` with cancel focused fires `onCancel` |
| 19 | `BACK` from any focus fires `onCancel` |
| 20 | `handleTap` on confirm button area fires `onConfirm` |
| 21 | `handleTap` on cancel button area fires `onCancel` |

### `src/platform/dom/DOMInputHandler.test.ts` (update, ~4 tests)

| # | Test |
|---|------|
| 1 | Tab key fires `TAB` action and no tap |
| 2 | Digit key `'3'` fires both `NAV_3` action and `onCharInput('3')` |
| 3 | `Backspace` fires `onCharInput('\b')` and no action |
| 4 | `onCharInput` not registered → digit key fires NAV action only (no error) |

### `src/platform/terminal/TerminalInputHandler.test.ts` (update, ~3 tests)

| # | Test |
|---|------|
| 1 | `'\t'` fires `TAB` action |
| 2 | `'5'` fires both `NAV_5` action and `onCharInput('5')` |
| 3 | `'\x7f'` fires `onCharInput('\b')` |

### `src/game/scenes/BaseMenuScene.test.ts` (new or extended, ~4 tests)

BaseMenuScene is abstract; use a concrete test subclass.

| # | Test |
|---|------|
| 1 | While modal is open, `onAction` routes to modal, not parent |
| 2 | While modal is open, `onTap` routes to modal, not parent |
| 3 | While modal is open, `onCharInput` routes to modal |
| 4 | After `closeModal()`, actions route to parent again |

### `src/game/scenes/trader-scene.test.ts` (update, ~3 tests)

| # | Test |
|---|------|
| 1 | SELECT on a BUY item opens a modal (not immediately calling `onBuy`) |
| 2 | SELECT on a SELL item opens a modal (not immediately calling `onSell`) |
| 3 | `onBuy` is called with correct `commodityId` and `qty` after modal confirm |

### `src/game/scenes/station-menu-scene.test.ts` (update, ~2 tests)

| # | Test |
|---|------|
| 1 | Selecting BUY FUEL opens a modal (not immediately calling `onRefuel`) |
| 2 | `onRefuel` is called with correct `cost` and `litres` after modal confirm |

---

## Acceptance criteria

- `npx tsc --noEmit` passes with zero errors.
- `npm test` passes with zero failures.
- Opening the trade dialog for "Buy Iron Ore (x3, 80 CR each)" with 200 CR available
  shows initial quantity 2 (max affordable) and total value 160 CR.
- Typing `'1'` changes quantity to 1 (replaces); typing `'0'` changes it to 10 (appends);
  backspace reverts to 1.
- UP/DOWN arrow in dialog changes quantity by step (1 for goods, 10 for fuel); clamped.
- Tab cycles: field → confirm button → cancel button → field.
- Enter while on the field or confirm button fires confirm; Enter on cancel fires cancel.
- Escape (or two-finger tap on touch) cancels from any focus.
- Fuel dialog shows initial litres = min(missing litres, max affordable); step = 10.
- After confirming a trade, the modal closes and the trader list is visible again.

---

## Play-test checklist

1. `bash init.sh` → `=== Environment ready ===`
2. `npm test` → all tests pass
3. **Browser** `npm run dev` → dock at Elysium Station → TRADER:
   - BUY tab: select an item → modal overlays the trader list.
   - Dialog shows title `Buy {item name}`, Quantity field, Total Value derived row, `| Buy |` and `| Cancel |` buttons.
   - Initial quantity = min(trader stock, max affordable).
   - Arrow UP/DOWN changes quantity by 1; value clamps at 0 and max.
   - Tab cycles focus; focused control is green.
   - Type `3` → quantity becomes 3 (first key replaces). Type `0` → becomes 30.
   - Backspace → becomes 3 again. Backspace again → becomes 0.
   - Total Value updates on every change.
   - Enter confirms; item removed from BUY list; credits reduced; SELL tab shows item.
   - Escape / two-finger tap cancels; no change to inventory.
   - SELL tab: select a held item → similar dialog with initial qty = all held. Confirm → item disappears from SELL tab, credits increase.
4. Open STATION HUB → BUY FUEL (if tank not full):
   - Modal with `Buy Fuel` title, Litres field (initial = min(missing, affordable)), step 10.
   - Total Value = litres × 10 CR.
   - Confirm → fuel increases by selected litres; credits decrease.
5. **Terminal** `npm run terminal` → same flows using keyboard only.

---

## Out of scope

- Multiple numeric fields in a single form.
- Weight-capacity check in the buy max (caller is responsible for passing a correct `max`).
- Price variation by system or faction.
- Visual feedback when confirm is called with value 0.
- Animated open/close transitions.
- Touch on-screen number pad (touch users use swipe UP/DOWN to change value).
