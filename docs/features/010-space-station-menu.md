# Feature 010 · Space station menu screen

**Goal:** Land the player inside Elysium Station — their first interactive hub — with a menu offering trade, missions, and the ability to undock and return to the main menu.

---

## Acceptance criteria

- `StationMenuScene` is implemented in `src/game/scenes/StationMenuScene.ts` and satisfies `Scene`.
- Constructor signature: `constructor(inputHandler: InputHandler, context: GameContext, onUndock: () => void)`.
- The screen renders into the 40×30 grid with the layout below.
- Navigation, cursor, touch, and footer hint behaviour mirrors `MainMenuScene` exactly.
- Selecting TRADER logs `[Station] Opening trader…` (placeholder — no trader scene yet).
- Selecting MISSION BOARD logs `[Station] Opening mission board…` (placeholder).
- Selecting UNDOCK calls `onUndock()` once, then silences further input.
- `tsc --noEmit` passes with zero errors.

---

## Layout (40 × 30 grid)

```
+--------------------------------------+   row  0   border (white on black)
|                                      |   row  1
|          ELYSIUM  STATION            |   row  2   bright-cyan, centred
|          ================            |   row  3   cyan, centred, = chars matching title width
|                                      |   rows 4–13
|            > TRADER                  |   row 14   bright-green (cursor) / white
|              MISSION BOARD           |   row 15   white
|              UNDOCK                  |   row 16   white
|                                      |   rows 17–26
|   ↑↓ navigate   ENTER select         |   row 27   bright-black, centred
|                                      |   row 28
+--------------------------------------+   row 29   border
```

Touch variant footer: `tap an option to select`

Menu item alignment: centre the item block (cursor prefix `> ` + longest label = `> MISSION BOARD` = 15 chars) horizontally within the 38-char interior.

---

## Colours

| Element        | fg           | bg    |
|----------------|--------------|-------|
| Border         | white        | black |
| Station title  | bright-cyan  | black |
| Title rule     | cyan         | black |
| Cursor item    | bright-green | black |
| Other items    | white        | black |
| Footer hint    | bright-black | black |
| Background     | black        | black |

---

## Shared BaseMenuScene

The border, cursor navigation, tap-to-select mapping, footer hint, and `activated` guard are identical across `MainMenuScene` and `StationMenuScene`. To avoid rebuilding this chrome for every future location menu, introduce a shared base.

### Recommended approach — `BaseMenuScene`

Create `src/game/scenes/BaseMenuScene.ts`:

```typescript
export interface MenuItemDef {
  label: string;
  action: () => void;
}

// Abstract base — not instantiated directly.
// Subclasses call super() and may call renderExtra() for content above the menu.
export abstract class BaseMenuScene implements Scene {
  // Handles: cursor, activated flag, UP/DOWN/SELECT input, onTap input,
  //          render() (border + title + rule + items + footer hint).
  // Subclasses provide: title string, items array.
}
```

Key responsibilities of the base class:
- Constructor takes `title: string`, `items: MenuItemDef[]`, `inputHandler: InputHandler`, `context: GameContext`.
- Registers `onAction` (UP/DOWN wrap-around, SELECT activates) and `onTap` (row → item mapping, starting from `MENU_ROW_START = 14`).
- `activated` flag silences input after first selection.
- `render(buffer)`: clears buffer, draws border (white), draws title centred at row 2 (bright-cyan), draws `=` rule at row 3 (cyan, same width as title), draws menu items centred from row 14, draws footer hint at row 27.
- `update(dt)`: no-op.

Refactor `MainMenuScene` to extend `BaseMenuScene`. The two-line title (`UNTITLED` / `SPACE GAME`) and tagline differ from the base pattern; handle this by:
- Passing an empty `title` string to suppress the base title+rule rendering, and
- Overriding `render()` to call `super.render()` then draw the custom title block and tagline on top; **or**
- Keeping `MainMenuScene` independent and only sharing the extracted buffer utilities (see below).

**The Engineer must choose the approach that minimises duplication without forcing awkward overrides.** If `MainMenuScene`'s title layout is too different, the simpler path is shared utilities only.

### Minimum viable shared extraction (if base class is not used for MainMenuScene)

At minimum, extract these three helpers from `MainMenuScene` to `src/shared/buffer-utils.ts`:

```typescript
export function writeText(buffer, row, col, text, fg, bg): void
export function writeCentered(buffer, row, text, fg, bg): void
export function drawBorder(buffer, fg, bg): void
```

Both `MainMenuScene` and `StationMenuScene` import from `buffer-utils.ts`. Do not duplicate these functions.

---

## Out of scope

- Trader screen content
- Mission board content
- Combat or travel to other locations
- Station lore, flavour text, or sub-menus within the station

---

## Technical notes

- `STATION_NAME` constant (`'Elysium Station'`) lives in `src/game/constants.ts` (introduced in item 009). `StationMenuScene` imports it from there and uses `STATION_NAME.toUpperCase()` for the title display (`ELYSIUM STATION`), so a future name change is a one-line edit.
- The `=` rule at row 3 should have the same character count as the rendered title string (`'ELYSIUM STATION'` = 15 chars → `===============`), centred independently.
- Entry points (`main.ts`, `terminal.ts`) are updated to replace the placeholder `onContinue` log (from item 009) with a real transition to `StationMenuScene`, and wire UNDOCK → `MainMenuScene` via `onUndock`. The full chain becomes: `MainMenuScene` → `StoryScene` → `StationMenuScene` → `MainMenuScene`.

---

## Tests required for StationMenuScene

- Renders border
- Renders station title (`ELYSIUM STATION`) at row 2 in bright-cyan
- Renders title rule (`===============`) at row 3 in cyan
- Renders TRADER at row 14, MISSION BOARD at row 15, UNDOCK at row 16
- Cursor starts on TRADER (bright-green prefix)
- DOWN moves cursor to MISSION BOARD; DOWN again to UNDOCK; DOWN again wraps to TRADER
- UP from TRADER wraps to UNDOCK
- SELECT on TRADER calls TRADER action (logs placeholder)
- SELECT on MISSION BOARD calls MISSION BOARD action (logs placeholder)
- SELECT on UNDOCK calls `onUndock` once, then silences input
- Tap on row 14 activates TRADER
- Tap on row 15 activates MISSION BOARD
- Tap on row 16 activates UNDOCK
- Tap on non-item row does nothing
- Input silenced after selection (second SELECT ignored)
- Keyboard footer hint when `primaryInput === 'keyboard'`
- Touch footer hint when `primaryInput === 'touch'`

## Tests to update for MainMenuScene

If `MainMenuScene` is refactored to extend `BaseMenuScene` or to import from `buffer-utils.ts`, existing tests should continue to pass without modification. If any tests assert implementation internals (e.g. the presence of the local `drawBorder` function), update them to match the new structure.

---

## Dependencies

- 006 · Main menu screen (DONE)
- 009 · Story intro screen (must be DONE — introduces `STATION_NAME` constant and scene transition pattern)
