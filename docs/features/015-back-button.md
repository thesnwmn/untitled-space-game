# Feature 015: Back Button

**Status:** READY
**Depends on:** 011

## Summary

Add a tappable `< BACK` button rendered at row 0, col 0 of scenes that have an
`onBack` callback and no conflicting content in that corner: `TraderScene` and
`MissionBoardScene`. This gives touch players a clearly visible, tappable target
in addition to the existing ESC key and two-finger-tap gesture. Implement as a
reusable `BackButton` component following the same pattern as the planned `Pager`
component.

`ShipScene` is explicitly excluded: row 0 is already occupied by the status bar,
and the DOCK button already serves as a physical "return to station" control.

---

## BackButton Component

### File: `src/game/ui/BackButton.ts`

```typescript
export class BackButton {
  static readonly TEXT = '< BACK';   // 6 chars
  static readonly ROW  = 0;
  static readonly COL  = 0;

  render(buffer: CharBuffer): void
  // Writes '<' in 'white' at (ROW, COL).
  // Writes ' BACK' in 'bright-black' at (ROW, COL + 1).

  isTapped(col: number, row: number): boolean
  // true when row === ROW && col >= COL && col < COL + TEXT.length
}
```

The `<` glyph in white acts as the interactive indicator; ` BACK` in
`bright-black` is readable but visually secondary, keeping the corner tidy.

---

## Visual Layout

Row 0 of any scene that includes the button:

```
< BACK    (rest of row is black)
^     ^
col 0  col 5
```

- `<` — color `white`
- ` BACK` (chars at cols 1–5) — color `bright-black`

The button occupies cols 0–5 only; nothing else uses row 0 in these scenes.

---

## Integration: TraderScene

Add `private readonly backButton = new BackButton()` as a field.

### render()

Call `this.backButton.render(buffer)` after clearing the buffer and before any
other draw calls, so other content can safely overwrite if needed (though nothing
currently does at row 0).

### onTap handler

Check the back button first, before tab or item hit-testing:

```typescript
if (this.backButton.isTapped(col, row)) {
  this.activated = true;
  onBack();
  return;
}
```

The existing `onAction` handler for the `BACK` action is unchanged.

---

## Integration: MissionBoardScene

Identical pattern to TraderScene:

- Add `private readonly backButton = new BackButton()`.
- In `render()`: call `this.backButton.render(buffer)` immediately after the clear loop.
- In `onTap`: check `this.backButton.isTapped(col, row)` first; fire `onBack()` with
  the `activated` guard.

The existing `onAction` handler for `BACK` is unchanged.

---

## Footer Hints

No changes. The button is self-documenting by its visible placement. The existing
keyboard hint (`ESC return`) and touch hint (`2-finger exit`) remain as-is.

---

## Test Coverage

### `src/game/ui/BackButton.test.ts` (8 tests)

Use a small buffer (e.g. 10 rows × 20 cols) for all render tests.

| # | Description |
|---|-------------|
| 1 | `render` writes char `<` at row 0, col 0 |
| 2 | `render` writes `<` in color `white` |
| 3 | `render` writes char `B` at row 0, col 2 in color `bright-black` |
| 4 | `render` writes char `K` at row 0, col 5 in color `bright-black` |
| 5 | `isTapped(0, 0)` → `true` (leftmost col) |
| 6 | `isTapped(5, 0)` → `true` (rightmost col of button) |
| 7 | `isTapped(6, 0)` → `false` (one past end) |
| 8 | `isTapped(0, 1)` → `false` (wrong row) |

### `TraderScene` additions (3 tests)

| # | Description |
|---|-------------|
| 1 | `render` writes char `<` at row 0, col 0 |
| 2 | Tap at (col 2, row 0) fires `onBack` once |
| 3 | Tap at (col 2, row 0) silences all subsequent input |

### `MissionBoardScene` additions (3 tests)

| # | Description |
|---|-------------|
| 1 | `render` writes char `<` at row 0, col 0 |
| 2 | Tap at (col 2, row 0) fires `onBack` once |
| 3 | Tap at (col 2, row 0) silences all subsequent input |

---

## Acceptance Criteria

- ✓ `BackButton` component passes all unit tests
- ✓ `TraderScene` renders `<` at (row 0, col 0); tap fires `onBack` with guard
- ✓ `MissionBoardScene` renders `<` at (row 0, col 0); tap fires `onBack` with guard
- ✓ ESC key still fires `onBack` in both scenes (unchanged)
- ✓ Two-finger tap still fires `onBack` in both scenes (unchanged)
- ✓ `tsc --noEmit` zero errors
- ✓ All tests pass
- ✓ `npm run build` succeeds
- ✓ `init.sh` passes before and after

---

## Play-Test Instructions

1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — all tests pass
3. **Browser** `npm run dev`:
   - Navigate to TRADER — `< BACK` visible in top-left corner
   - Click/tap the `< BACK` button — returns to station menu
   - Navigate to MISSION BOARD — same button visible
   - Tap `< BACK` — returns to station menu
   - Confirm ESC still works in both scenes
4. **Touch emulation** (DevTools):
   - In TRADER: tap the `< BACK` text in top-left — returns to station
   - Two-finger tap still works as before
5. **Terminal** `npm run terminal`:
   - `< BACK` is visible at top-left of trader and mission board screens
   - ESC returns to station (touch tap not applicable)
