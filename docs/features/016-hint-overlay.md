# 016 · Hint Overlay

## Goal

Move all per-scene input hint text out of individual scene render methods and into a
single game-wide `HintOverlay` that exclusively owns the last row (`h - 1`) of the
buffer. No scene may write to `h - 1`. Add an `H` key toggle so the player can
hide hint text.

## Motivation

- Hints are rendered inconsistently today: most scenes write at `h - 3`, ShipScene
  at `h - 1`. A new scene must re-implement the same boilerplate.
- A global overlay gives one authoritative place to control hint appearance,
  visibility, and any future styling.

---

## Contract change: `Scene.getHint()`

Extend the `Scene` interface in `src/shared/types.ts`:

```typescript
export interface Scene {
  update(dt: number): void;
  render(buffer: CharBuffer): void;
  getHint(): string | null;   // new
}
```

Rules:
- `getHint()` returns the hint string appropriate for `context.primaryInput`, or
  `null` if the scene has no hint.
- `render()` must **not** write to row `h - 1` (reserved for the overlay).

---

## `GameContext` additions

In `src/shared/types.ts`:

```typescript
export interface GameContext {
  environment: RuntimeEnvironment;
  primaryInput: PrimaryInput;
  debug: boolean;
  showHints: boolean;    // new — default true
}
```

```typescript
export type GameAction =
  | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  | 'SELECT' | 'BACK' | 'PAUSE'
  | 'PAGE_UP' | 'PAGE_DOWN'
  | 'TOGGLE_HINTS';    // new
```

---

## `HintOverlay` component

New file: `src/game/ui/HintOverlay.ts`

```typescript
export class HintOverlay {
  render(buffer: CharBuffer, hint: string | null, visible: boolean): void
}
```

Behaviour:
- If `visible` is `false` **or** `hint` is `null`: leave row `h - 1` untouched
  (the game loop's `makeBuffer` already clears it to black).
- Otherwise: write `hint` centered on row `h - 1` in `'bright-black'` fg on
  `'black'` bg using `writeCentered`.

---

## Input handler wiring

Wire `H` / `h` to `TOGGLE_HINTS` in both handlers:

- `src/platform/dom/DOMInputHandler.ts` — add `KeyH` → `TOGGLE_HINTS` (no `preventDefault` needed)
- `src/platform/terminal/TerminalInputHandler.ts` — add `'h'` and `'H'` → `TOGGLE_HINTS`

---

## Game loop changes (`src/main.ts` and `terminal.ts`)

1. Initialise context with `showHints: true`.
2. Construct a single `HintOverlay` instance.
3. Register a handler that toggles the flag:
   ```typescript
   input.onAction(action => {
     if (action === 'TOGGLE_HINTS') context.showHints = !context.showHints;
   });
   ```
4. In the render loop, after `currentScene.render(buffer)`:
   ```typescript
   overlay.render(buffer, currentScene.getHint(), context.showHints);
   ```

---

## Scene changes

Remove the inline hint render call from every scene and add `getHint()`. The
scene's content layout is otherwise **unchanged** — rows that were already clear
above `h - 1` stay clear.

### `StoryScene`
```typescript
getHint(): string {
  return this.context.primaryInput === 'touch' ? TOUCH_HINT : KEYBOARD_HINT;
}
```
Remove: `writeCentered(buffer, h - 3, hint, 'bright-black', 'black')`

### `MainMenuScene`
```typescript
getHint(): string {
  return this.context.primaryInput === 'touch'
    ? 'tap an option to select'
    : '↑↓ navigate   ENTER select';
}
```
Remove: `writeCentered(buffer, footerRow, hint, 'bright-black', 'black')`

### `BaseMenuScene`
Add `getHint()` as a concrete method (inherited by `StationMenuScene`):
```typescript
getHint(): string {
  return this.context.primaryInput === 'touch'
    ? 'tap an option to select'
    : '↑↓ navigate   ENTER select';
}
```
Remove: `writeCentered(buffer, footerRow, hint, 'bright-black', 'black')`

### `ShipScene`
```typescript
getHint(): string {
  return this.context.primaryInput === 'touch'
    ? 'TAP to select'
    : '↑↓ navigate   ENTER select';
}
```
Remove: `writeCentered(buffer, footerRow, hint, 'bright-black', 'black')`
(ShipScene already placed its hint at `h - 1`; the overlay now owns that row,
and the button row at `h - 2` stays unchanged.)

### `TraderScene`
```typescript
getHint(): string {
  return this.context.primaryInput === 'touch'
    ? 'TAP to select   2-finger exit'
    : '↑↓ navigate   ESC return';
}
```
Remove: `writeCentered(buffer, footerRow, hint, 'bright-black', 'black')`

### `MissionBoardScene`
```typescript
getHint(): string {
  return this.context.primaryInput === 'touch'
    ? 'TAP to select   2-finger exit'
    : '↑↓ navigate   ESC return';
}
```
Remove: `writeCentered(buffer, footerRow, hint, 'bright-black', 'black')`

---

## Layout impact

| Scene | Hint was at | Hint moves to |
|-------|-------------|---------------|
| StoryScene | `h - 3` | `h - 1` (overlay) |
| MainMenuScene | `h - 3` | `h - 1` (overlay) |
| StationMenuScene | `h - 3` (BaseMenuScene) | `h - 1` (overlay) |
| TraderScene | `h - 3` | `h - 1` (overlay) |
| MissionBoardScene | `h - 3` | `h - 1` (overlay) |
| ShipScene | `h - 1` | `h - 1` (overlay, same row) |

Rows `h - 3` and `h - 2` become clear in scenes that previously used `h - 3`
for hints — this is acceptable empty space that separates content from the
overlay row.

**Future scenes** (015 Nav Bar, 013 Pagination) must implement `getHint()` as
part of the `Scene` interface when built.

---

## Tests

### `src/game/ui/HintOverlay.test.ts` (new)
- Renders hint centered on last row with `bright-black` fg / `black` bg
- Leaves last row black when `visible = false`
- Leaves last row black when hint is `null`
- Does not write to any row other than `h - 1`

### All 6 scene test files (updated)
- Remove hint-at-`h-3`/`h-1` assertions from `render()` tests
- Add `getHint()` tests: keyboard variant and touch variant
- Assert row `h - 1` is blank (all black spaces) after `render()`

### Input handler tests (2 files updated)
- `DOMInputHandler.test.ts`: `H` key fires `TOGGLE_HINTS`
- `TerminalInputHandler.test.ts`: `h` / `H` key fires `TOGGLE_HINTS`

---

## Files changed

| File | Change |
|------|--------|
| `src/shared/types.ts` | Add `getHint()` to `Scene`; `showHints` to `GameContext`; `TOGGLE_HINTS` to `GameAction` |
| `src/game/ui/HintOverlay.ts` | New class |
| `src/game/ui/HintOverlay.test.ts` | New tests |
| `src/game/scenes/StoryScene.ts` | Remove hint render; add `getHint()` |
| `src/game/scenes/MainMenuScene.ts` | Remove hint render; add `getHint()` |
| `src/game/scenes/BaseMenuScene.ts` | Remove hint render; add `getHint()` |
| `src/game/scenes/ShipScene.ts` | Remove hint render; add `getHint()` |
| `src/game/scenes/TraderScene.ts` | Remove hint render; add `getHint()` |
| `src/game/scenes/MissionBoardScene.ts` | Remove hint render; add `getHint()` |
| `src/platform/dom/DOMInputHandler.ts` | Wire `H` → `TOGGLE_HINTS` |
| `src/platform/terminal/TerminalInputHandler.ts` | Wire `h`/`H` → `TOGGLE_HINTS` |
| `src/main.ts` | `showHints: true` in context; construct `HintOverlay`; toggle handler; `overlay.render()` in loop |
| `terminal.ts` | Same as `src/main.ts` |
| `src/game/scenes/story-scene.test.ts` | Update hint assertions; add `getHint()` tests |
| `src/game/scenes/main-menu-scene.test.ts` | Update hint assertions; add `getHint()` tests |
| `src/game/scenes/station-menu-scene.test.ts` | Update hint assertions; add `getHint()` tests |
| `src/game/scenes/ship-scene.test.ts` | Update hint assertions; add `getHint()` tests |
| `src/game/scenes/trader-scene.test.ts` | Update hint assertions; add `getHint()` tests |
| `src/game/scenes/mission-board-scene.test.ts` | Update hint assertions; add `getHint()` tests |
| `src/platform/dom/DOMInputHandler.test.ts` | Add `TOGGLE_HINTS` test |
| `src/platform/terminal/TerminalInputHandler.test.ts` | Add `TOGGLE_HINTS` test |
