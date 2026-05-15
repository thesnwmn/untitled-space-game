# Feature 032 · Modal Input Dialog

## Goal

Introduce a reusable `ModalInputDialog` component that overlays a numeric input form on
any `BaseMenuScene` subclass. Replace the one-shot buy-all/sell-all mechanic from
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
full scene. The trader list (or station menu) remains visible behind it, preserving
context.

Because `InputHandler` callbacks register at construction time and cannot be removed,
the parent (`BaseMenuScene`) intercepts all actions and routes them into the dialog while
it is open, suppressing its own normal handling. The dialog is never registered directly
against the `InputHandler` — it only receives pre-routed calls.

### Character input extension

A new optional method `onCharInput(handler)` is added to the `InputHandler` interface.
It delivers `'0'`–`'9'` for digit keys and `'\b'` for Backspace/Delete.

Both platform handlers fire `onCharInput` **in addition to** any `GameAction` that the
same keypress already produces (digits `1`–`9` currently map to `NAV_1`–`NAV_9`; that
mapping is preserved so existing nav behaviour is unaffected when no modal is open).
`BaseMenuScene` ignores `onCharInput` events unless a modal is currently open.

### First-character-clears

When the dialog opens `replaceNextDigit = true`. The first digit typed replaces the
existing value and sets `replaceNextDigit = false`; subsequent digits append. Arrow
keys (UP/DOWN) adjust by `step` and do **not** change `replaceNextDigit` — so digits
typed after arrows still append rather than replace. Backspace removes the last digit
(integer-divide by 10); if the result is 0, `replaceNextDigit` is reset to `true`.

### TAB action

`'TAB'` is added to `GameAction` and mapped in both platform handlers. It cycles focus
forward: `field → confirm button → cancel button → field`.

### Focus styling

| Control | Focused | Unfocused |
|---------|---------|-----------|
| Number input box | black on green | white on black |
| Button | black on green | white on black |
| Labels and derived rows | white on black | (always) |

Dialog background: every cell in the dialog rectangle is black.

---

## Changed types

### `src/shared/types.ts`

Add `'TAB'` to `GameAction`.

Add optional `onCharInput(handler: (char: string) => void): void` to `InputHandler`.

---

## New file: `src/game/ui/ModalInputDialog.ts`

### Form definition types

```typescript
export interface NumberFieldDef {
  label: string;
  initialValue: number;
  min: number;
  max: number;
  step: number;
}

export interface DerivedRowDef {
  label: string;
  compute: (value: number) => string;
}

export interface ModalFormDef {
  title: string;
  field: NumberFieldDef;
  derivedRows: DerivedRowDef[];
  confirmLabel: string;
  onConfirm: (value: number) => void;
  onCancel: () => void;
}
```

The class receives a `ModalFormDef` and exposes: `handleAction(action: GameAction)`,
`handleCharInput(char: string)`, `handleTap(col: number, row: number)`, and
`render(buffer: CharBuffer)`.

### Dialog layout

The dialog is **30 columns wide** and centred horizontally in the buffer. Height is
`8 + D` rows where D = `derivedRows.length`. It is centred vertically too.

Row structure from top:
- Border row
- Title
- Underline of title
- Blank row
- Number field: label, ` : `, value box (right-justified in 5 chars)
- One row per derived row: label and computed value, aligned to the right edge of the field
- Blank row
- Button row: confirm and cancel buttons, centred with a gap between them
- Border row

Borders use `+` corners, `-` horizontal, `|` vertical. Label column width is
the max of all labels so the value column stays aligned.

After each `render()` call, store the absolute buffer coordinates of the value box and
buttons so `handleTap` can hit-test them.

### Action routing

| Focused control | Action | Effect |
|---|---|---|
| any | `BACK` | `onCancel()` |
| `field` | `UP` | increment by step, clamped at max |
| `field` | `DOWN` | decrement by step, clamped at min |
| `field` | `SELECT` | `onConfirm(value)` |
| `field` | `TAB` or `RIGHT` | focus → confirm |
| `confirm` | `SELECT` | `onConfirm(value)` |
| `confirm` | `TAB` or `RIGHT` | focus → cancel |
| `confirm` | `LEFT` or `UP` | focus → field |
| `cancel` | `SELECT` | `onCancel()` |
| `cancel` | `TAB` | focus → field |
| `cancel` | `LEFT` | focus → confirm |
| `cancel` | `UP` | focus → field |

`DOWN` on `confirm`/`cancel` is a no-op. `NAV_1`–`NAV_9` are ignored in all states.

### Char input (field focused only)

- Digit: if `replaceNextDigit`, set value to digit and clear flag; otherwise append
  (multiply current value by 10, add digit), clamped at max.
- Backspace: integer-divide by 10; if result is 0, set `replaceNextDigit = true`.

---

## Changed files

### `src/platform/dom/DOMInputHandler.ts`

Add `Tab` to `PREVENT_DEFAULT_KEYS`. Add `onCharInput` method with its own handler
array. In the keydown listener: digits fire `onCharInput` and also fall through to the
`KEY_MAP` action (so `NAV_1`–`NAV_9` still fire); Backspace fires `onCharInput('\b')`
only; Tab fires `'TAB'` action only.

### `src/platform/terminal/TerminalInputHandler.ts`

Add `onCharInput` method. In the data listener: digits fire `onCharInput` then fall
through to `KEY_MAP`; Backspace fires `onCharInput('\b')` and returns; Tab fires
`'TAB'` and returns.

### `src/game/scenes/BaseMenuScene.ts`

Add a `protected modal: ModalInputDialog | null` field. Add `openModal` and
`closeModal` helpers. When a modal is open, route all `onAction`, `onTap`, and
`onCharInput` events to the modal instead of the scene's own handlers. At the end
of `render()`, draw the modal on top if one is open.

### `src/game/scenes/TraderScene.ts`

On SELECT of an item, open a modal instead of calling `onBuy`/`onSell` directly.
Initial value = min(available qty, max the player can afford). Confirm callback calls
`onBuy(commodityId, qty)` or `onSell(commodityId, qty)`. Do not set `activated` on
SELECT — the player stays in the scene.

`onBuy` and `onSell` constructor parameters gain a `qty: number` argument.

### `src/game/scenes/StationMenuScene.ts`

Replace the immediate-refuel action for BUY FUEL with a modal. Initial litres =
min(fuel needed, max affordable at the per-litre price). Step = 10. Confirm calls
`onRefuel(litres × price, litres)`.

Store `fuelL`, `fuelCapacityL`, and `credits` as instance fields so the action closure
can reference them.

### `src/main.ts` and `terminal.ts`

Update `onBuy`, `onSell`, and `onRefuel` to accept and use the new `qty`/`litres`
arguments rather than always using the full available quantity.

---

## Tests

### New: `src/game/ui/modal-input-dialog.test.ts`

Cover: border and title render at correct positions; field label and initial value
render; derived row renders with computed value; confirm and cancel button text
present; focused field cells have green background; focused button cells have green
background; UP/DOWN adjust value with clamping; first digit replaces, second appends;
backspace removes last digit; backspace to zero resets replaceNextDigit; TAB cycles
focus; SELECT on field fires onConfirm; SELECT on confirm fires onConfirm; SELECT
on cancel fires onCancel; BACK fires onCancel; tap on confirm area fires onConfirm;
tap on cancel area fires onCancel.

### Update: `src/platform/dom/DOMInputHandler.test.ts`

Cover: Tab fires TAB action; digit fires both its NAV action and onCharInput; Backspace
fires onCharInput('\b') and no action; no error when onCharInput not registered.

### Update: `src/platform/terminal/TerminalInputHandler.test.ts`

Cover: `'\t'` fires TAB; digit fires both NAV and onCharInput; `'\x7f'` fires
onCharInput('\b').

### New/Update: `src/game/scenes/BaseMenuScene.test.ts`

Use a concrete test subclass. Cover: while modal open, onAction routes to modal not
parent; same for onTap and onCharInput; after closeModal, actions route to parent.

### Update: `src/game/scenes/trader-scene.test.ts`

Cover: SELECT opens modal rather than calling onBuy directly; onBuy called with
correct commodityId and qty after modal confirm.

### Update: `src/game/scenes/station-menu-scene.test.ts`

Cover: BUY FUEL opens modal rather than calling onRefuel directly; onRefuel called
with correct cost and litres after confirm.

---

## Acceptance criteria

- `npx tsc --noEmit` passes with zero errors.
- `npm test` passes with zero failures.
- Opening the trade dialog for "Buy Iron Ore (x3, 80 CR each)" with 200 CR available
  shows initial quantity 2 (max affordable) and total value 160 CR.
- Typing `'1'` changes quantity to 1 (replaces); typing `'0'` changes it to 10
  (appends); backspace reverts to 1.
- UP/DOWN arrow in dialog changes quantity by step (1 for goods, 10 for fuel); clamped.
- Tab cycles: field → confirm button → cancel button → field.
- Enter while on the field or confirm button fires confirm; Enter on cancel fires cancel.
- Escape cancels from any focus.
- Fuel dialog shows initial litres = min(missing litres, max affordable); step = 10.
- After confirming a trade, the modal closes and the trader list is visible again.

---

## Play-test checklist

1. `bash init.sh` → `=== Environment ready ===`
2. `npm test` → all tests pass
3. **Browser** `npm run dev` → dock at Elysium Station → TRADER:
   - BUY tab: select an item → modal overlays the trader list.
   - Dialog shows title, Quantity field, Total Value derived row, confirm and cancel buttons.
   - Initial quantity = min(trader stock, max affordable).
   - Arrow UP/DOWN changes quantity; value clamps at 0 and max.
   - Tab cycles focus; focused control is green.
   - Type `3` → quantity becomes 3 (first key replaces). Type `0` → becomes 30.
     Backspace → 3. Backspace → 0.
   - Total Value updates on every change.
   - Enter confirms; item removed from BUY list; credits reduced; SELL tab shows item.
   - Escape cancels; no change to inventory.
   - SELL tab: similar dialog; confirm removes from SELL tab and increases credits.
4. STATION HUB → BUY FUEL (if tank not full):
   - Modal with Litres field, initial = min(missing, affordable), step 10.
   - Confirm → fuel increases; credits decrease.
5. **Terminal** `npm run terminal` → same flows using keyboard only.

---

## Out of scope

- Multiple numeric fields in a single form.
- Weight-capacity check in the buy max (caller is responsible for passing a correct `max`).
- Price variation by system or faction.
- Visual feedback when confirm is called with value 0.
- Animated open/close transitions.
- Touch on-screen number pad (touch users use swipe UP/DOWN to change value).
