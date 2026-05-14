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

---

## `NavBar` changes (`src/game/ui/NavBar.ts`)

### 1. `render()` — index-prefixed labels

Add an optional `showIndices` boolean parameter:

```typescript
render(buffer: CharBuffer, showIndices = false): void
```

When `showIndices` is `true`, render buttons as `[1:LABEL]`, `[2:LABEL]`, etc.
When `false` (default), render as before: `[LABEL]`.

The `buttonRanges` cache must reflect whichever format was rendered, because
`hitTest()` reads from it. No other change to `hitTest()` is needed.

### 2. `getOptionId(index: number): string | null`

New method — returns the option `id` at the given 1-based position, or `null`
if `index` is out of range:

```typescript
getOptionId(index: number): string | null {
  return this.options[index - 1]?.id ?? null;
}
```

---

## Module-level helper (shared by scenes)

Each scene file that has a NavBar should include this local map to convert a
`GameAction` to a 1-based NavBar index:

```typescript
const NAV_INDEX: Partial<Record<GameAction, number>> = {
  NAV_1: 1, NAV_2: 2, NAV_3: 3, NAV_4: 4, NAV_5: 5,
  NAV_6: 6, NAV_7: 7, NAV_8: 8, NAV_9: 9,
};
```

Or, if multiple scenes need it, extract to a shared utility in
`src/game/ui/NavBar.ts` as an exported constant.

---

## Scene changes

Each scene's `onAction` handler gains a branch for `NAV_N` actions that looks up
the option id and fires the matching callback. Pattern:

```typescript
const navIdx = NAV_INDEX[action];
if (navIdx !== undefined) {
  const id = this.navBar.getOptionId(navIdx);
  if (id === 'undock') { this.activated = true; onUndock(); return; }
  if (id === 'hub')    { this.activated = true; onHub();    return; }
}
```

Each scene also passes `showIndices` to `navBar.render()`:

```typescript
this.navBar.render(buffer, this.context.primaryInput !== 'touch');
```

### `StationMenuScene`

NavBar options: `[{ id: 'undock', label: 'UNDOCK' }]`

- `NAV_1` → `undock` → call `onShip()` (same effect as `BACK`/ESC)
- `render()`: pass `showIndices` — button appears as `[1:UNDOCK]` in keyboard mode

### `TraderScene`

NavBar options: `[undock, hub]`

- `NAV_1` → `undock` → call `onUndock()`
- `NAV_2` → `hub` → call `onHub()`
- `render()`: buttons appear as `[1:UNDOCK] [2:HUB]` in keyboard mode

### `MissionBoardScene`

NavBar options: `[undock, hub]`

- `NAV_1` → `undock` → call `onUndock()`
- `NAV_2` → `hub` → call `onHub()`
- `render()`: buttons appear as `[1:UNDOCK] [2:HUB]` in keyboard mode

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

- `getOptionId(1)` returns the first option's id
- `getOptionId(2)` returns the second option's id (when two options exist)
- `getOptionId(0)` returns `null`
- `getOptionId(3)` returns `null` when only two options exist
- With `showIndices = false` (default), button text is `[LABEL]`
- With `showIndices = true`, button text is `[1:LABEL]`, `[2:LABEL]`, etc.
- `hitTest()` after `render(buffer, true)` resolves correctly for wider `[N:LABEL]` ranges
- `hitTest()` after `render(buffer, false)` resolves correctly for `[LABEL]` ranges

### `src/platform/dom/DOMInputHandler.test.ts` (updated)

- Key `'1'` fires `NAV_1`
- Key `'2'` fires `NAV_2`
- Key `'9'` fires `NAV_9`
- Unmapped digits (none, but verify `'0'` is not mapped)

### `src/platform/terminal/TerminalInputHandler.test.ts` (updated)

- Input `'1'` fires `NAV_1`
- Input `'2'` fires `NAV_2`
- Input `'9'` fires `NAV_9`

### `src/game/scenes/station-menu-scene.test.ts` (updated)

- `NAV_1` action calls `onShip()` and silences further input
- `NAV_2` through `NAV_9` do nothing (no second option)
- In keyboard mode (`primaryInput: 'keyboard'`), row 1 contains `[1:UNDOCK]`
- In touch mode (`primaryInput: 'touch'`), row 1 contains `[UNDOCK]` (no prefix)
- Keyboard hint includes `1 undock`

### `src/game/scenes/trader-scene.test.ts` (updated)

- `NAV_1` action calls `onUndock()` and silences further input
- `NAV_2` action calls `onHub()` and silences further input
- `NAV_3` through `NAV_9` do nothing
- In keyboard mode, row 1 contains `[1:UNDOCK]` and `[2:HUB]`
- In touch mode, row 1 contains `[UNDOCK]` and `[HUB]`
- Keyboard hint includes `1 undock` and `2 hub`

### `src/game/scenes/mission-board-scene.test.ts` (updated)

- Same structure as TraderScene tests above

---

## Files changed

| File | Change |
|------|--------|
| `src/shared/types.ts` | Add `NAV_1`–`NAV_9` to `GameAction` |
| `src/platform/dom/DOMInputHandler.ts` | Wire `'1'`–`'9'` → `NAV_1`–`NAV_9` |
| `src/platform/terminal/TerminalInputHandler.ts` | Wire `'1'`–`'9'` → `NAV_1`–`NAV_9` |
| `src/game/ui/NavBar.ts` | Add `showIndices` param to `render()`; add `getOptionId()` |
| `src/game/scenes/StationMenuScene.ts` | Handle `NAV_1`; pass `showIndices` to render |
| `src/game/scenes/TraderScene.ts` | Handle `NAV_1`, `NAV_2`; pass `showIndices` to render |
| `src/game/scenes/MissionBoardScene.ts` | Handle `NAV_1`, `NAV_2`; pass `showIndices` to render |
| `src/game/ui/NavBar.test.ts` | Tests for `getOptionId()` and `showIndices` rendering |
| `src/game/scenes/station-menu-scene.test.ts` | Tests for `NAV_1` and indexed button label |
| `src/game/scenes/trader-scene.test.ts` | Tests for `NAV_1`/`NAV_2` and indexed button labels |
| `src/game/scenes/mission-board-scene.test.ts` | Tests for `NAV_1`/`NAV_2` and indexed button labels |
| `src/platform/dom/DOMInputHandler.test.ts` | Tests for digit → `NAV_N` |
| `src/platform/terminal/TerminalInputHandler.test.ts` | Tests for digit → `NAV_N` |
