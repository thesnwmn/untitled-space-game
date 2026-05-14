# 024 · NavBar Keyboard Shortcuts

## Goal

Make NavBar buttons reachable via number keys on the keyboard. Pressing `1`
activates the leftmost button, `2` the next, and so on. Applies in terminal and
in the browser when the primary input is keyboard (not touch). The buttons
themselves display their shortcut index so no separate documentation is needed.

## Motivation

The NavBar (`[UNDOCK]`, `[HUB]`) is today only reachable by mouse/touch tap via
`hitTest()`. In terminal there is no pointing device at all, so `[UNDOCK]` and
`[HUB]` are completely unreachable with keys (ESC covers one case but not all).
This breaks full keyboard playability.

The NavBar already knows its options and their order, so it can own all input
handling for those buttons — scenes should not need any nav-specific input code.

---

## New `GameAction` values

In `src/shared/types.ts`, extend `GameAction`:

```typescript
export type GameAction =
  | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  | 'SELECT' | 'BACK' | 'PAUSE'
  | 'PAGE_UP' | 'PAGE_DOWN'
  | 'TOGGLE_HINTS'               // feature 016
  | 'NAV_1' | 'NAV_2' | 'NAV_3' | 'NAV_4' | 'NAV_5'
  | 'NAV_6' | 'NAV_7' | 'NAV_8' | 'NAV_9';
```

---

## Input handler wiring

### `DOMInputHandler` (`src/platform/dom/DOMInputHandler.ts`)

Add digit keys to `KEY_MAP`:

```typescript
'1': 'NAV_1', '2': 'NAV_2', '3': 'NAV_3', '4': 'NAV_4', '5': 'NAV_5',
'6': 'NAV_6', '7': 'NAV_7', '8': 'NAV_8', '9': 'NAV_9',
```

No `preventDefault` needed for digit keys.

### `TerminalInputHandler` (`src/platform/terminal/TerminalInputHandler.ts`)

Add to `KEY_MAP` array:

```typescript
['1', 'NAV_1'], ['2', 'NAV_2'], ['3', 'NAV_3'], ['4', 'NAV_4'], ['5', 'NAV_5'],
['6', 'NAV_6'], ['7', 'NAV_7'], ['8', 'NAV_8'], ['9', 'NAV_9'],
```

> **Note on future text input:** if a text-entry component is ever added, it
> should consume all raw keypresses before they reach the action dispatch
> pipeline (e.g. via a modal `TextInputHandler` that temporarily wraps the
> active `InputHandler`). No changes to this feature are needed to support that.

---

## `NavOption` change (`src/shared/types.ts` or `src/game/ui/NavBar.ts`)

Add an `action` callback to `NavOption`:

```typescript
export interface NavOption {
  id: string;
  label: string;
  action: () => void;
}
```

---

## `NavBar` changes (`src/game/ui/NavBar.ts`)

### Constructor

Add `inputHandler` as a third parameter. The NavBar registers its own action
and tap handlers at construction time — scenes do not handle nav input at all.

```typescript
constructor(
  stationName: string,
  options: ReadonlyArray<NavOption>,
  inputHandler: InputHandler,
)
```

In the constructor body:

```typescript
const NAV_INDEX: Partial<Record<GameAction, number>> = {
  NAV_1: 1, NAV_2: 2, NAV_3: 3, NAV_4: 4, NAV_5: 5,
  NAV_6: 6, NAV_7: 7, NAV_8: 8, NAV_9: 9,
};

inputHandler.onAction(action => {
  const idx = NAV_INDEX[action];
  if (idx !== undefined) options[idx - 1]?.action();
});

inputHandler.onTap?.((col, row) => {
  const id = this.hitTest(col, row);
  options.find(o => o.id === id)?.action();
});
```

### `render()` — index-prefixed labels

Add an optional `showIndices` boolean parameter:

```typescript
render(buffer: CharBuffer, showIndices = false): void
```

When `showIndices` is `true`, render buttons as `[1:LABEL]`, `[2:LABEL]`, etc.
When `false` (default), render as `[LABEL]`.

The `buttonRanges` cache must reflect whichever format was rendered so that
`hitTest()` returns the correct column ranges regardless of mode.

---

## Scene changes

Each scene's constructor becomes simpler. The `action` callback moves into the
`NavOption`, and the scene no longer registers any nav-specific `onAction` or
`onTap` handlers.

### `StationMenuScene`

Before (current):
```typescript
private readonly navBar = new NavBar(STATION_NAME.toUpperCase(),
  [{ id: 'undock', label: 'UNDOCK' }]);

// ... separate onAction and onTap handlers for nav
```

After:
```typescript
private readonly navBar = new NavBar(
  STATION_NAME.toUpperCase(),
  [{ id: 'undock', label: 'UNDOCK', action: () => { this.navActivated = true; onShip(); } }],
  inputHandler,
);
```

The separate nav `onAction` block and nav `onTap` block in the constructor are
removed entirely.

### `TraderScene`

```typescript
this.navBar = new NavBar(
  STATION_NAME.toUpperCase(),
  [
    { id: 'undock', label: 'UNDOCK', action: () => { this.activated = true; onUndock(); } },
    { id: 'hub',    label: 'HUB',    action: () => { this.activated = true; onHub(); } },
  ],
  inputHandler,
);
```

Remove the `navBar.hitTest()` block from the existing `onTap` handler.

### `MissionBoardScene`

Identical pattern to `TraderScene`.

### `render()` in all three scenes

Pass `showIndices` based on context:

```typescript
this.navBar.render(buffer, this.context.primaryInput !== 'touch');
```

---

## Hint text

Update keyboard hints in all three NavBar scenes. If feature 016 (Hint Overlay)
is already merged, update `getHint()`; otherwise update the inline hint string in
`render()`.

| Scene | Keyboard hint |
|-------|---------------|
| `StationMenuScene` | `↑↓ navigate   ENTER select   1 undock` |
| `TraderScene` | `↑↓ navigate   ←→ tabs   1 undock   2 hub` |
| `MissionBoardScene` | `↑↓ navigate   1 undock   2 hub` |

Touch hints are unchanged.

---

## Tests

### `src/game/ui/NavBar.test.ts` (updated)

Construction now takes an `inputHandler` argument — use the existing fake/stub
pattern from other test files.

- Firing `NAV_1` action calls the first option's `action` callback
- Firing `NAV_2` action calls the second option's callback (two-option NavBar)
- Firing `NAV_3` does nothing when only two options exist
- A tap hit on option 1's column range calls that option's `action`
- A tap hit on option 2's column range calls that option's `action`
- A tap miss (gap, out-of-range) calls nothing
- With `showIndices = false` (default), button text is `[LABEL]`
- With `showIndices = true`, button text is `[1:LABEL]`, `[2:LABEL]`, etc.
- `hitTest()` after `render(buffer, true)` resolves correctly for wider `[N:LABEL]` ranges
- `hitTest()` after `render(buffer, false)` resolves correctly for `[LABEL]` ranges

### `src/platform/dom/DOMInputHandler.test.ts` (updated)

- Key `'1'` fires `NAV_1`
- Key `'2'` fires `NAV_2`
- Key `'9'` fires `NAV_9`
- Key `'0'` is not mapped (no `NAV_0` action exists)

### `src/platform/terminal/TerminalInputHandler.test.ts` (updated)

- Input `'1'` fires `NAV_1`
- Input `'2'` fires `NAV_2`
- Input `'9'` fires `NAV_9`

### `src/game/scenes/station-menu-scene.test.ts` (updated)

- `NAV_1` action calls `onShip()` and silences further nav input
- In keyboard mode (`primaryInput: 'keyboard'`), row 1 contains `[1:UNDOCK]`
- In touch mode (`primaryInput: 'touch'`), row 1 contains `[UNDOCK]` (no prefix)
- No separate nav `onAction` or `onTap` block exists in the scene constructor
- Keyboard hint includes `1 undock`

### `src/game/scenes/trader-scene.test.ts` (updated)

- `NAV_1` action calls `onUndock()`
- `NAV_2` action calls `onHub()`
- `NAV_3` does nothing
- In keyboard mode, row 1 contains `[1:UNDOCK]` and `[2:HUB]`
- In touch mode, row 1 contains `[UNDOCK]` and `[HUB]`
- No nav hitTest block in scene's `onTap` handler
- Keyboard hint includes `1 undock` and `2 hub`

### `src/game/scenes/mission-board-scene.test.ts` (updated)

Same structure as TraderScene tests above.

---

## Files changed

| File | Change |
|------|--------|
| `src/shared/types.ts` | Add `NAV_1`–`NAV_9` to `GameAction`; add `action` to `NavOption` |
| `src/platform/dom/DOMInputHandler.ts` | Wire `'1'`–`'9'` → `NAV_1`–`NAV_9` |
| `src/platform/terminal/TerminalInputHandler.ts` | Wire `'1'`–`'9'` → `NAV_1`–`NAV_9` |
| `src/game/ui/NavBar.ts` | Add `inputHandler` to constructor; self-register `onAction`/`onTap`; add `showIndices` param to `render()` |
| `src/game/scenes/StationMenuScene.ts` | Add `action` to nav option; remove nav input handlers; pass `showIndices` to render |
| `src/game/scenes/TraderScene.ts` | Add `action` to nav options; remove nav hitTest from `onTap`; pass `showIndices` to render |
| `src/game/scenes/MissionBoardScene.ts` | Same as `TraderScene` |
| `src/game/ui/NavBar.test.ts` | Tests for self-contained input handling and `showIndices` rendering |
| `src/game/scenes/station-menu-scene.test.ts` | Update nav construction; add `NAV_1` and indexed-label tests |
| `src/game/scenes/trader-scene.test.ts` | Update nav construction; add `NAV_1`/`NAV_2` and indexed-label tests |
| `src/game/scenes/mission-board-scene.test.ts` | Same as `TraderScene` tests |
| `src/platform/dom/DOMInputHandler.test.ts` | Add digit → `NAV_N` tests |
| `src/platform/terminal/TerminalInputHandler.test.ts` | Add digit → `NAV_N` tests |
