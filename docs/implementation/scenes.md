# Scene System

All game screens implement the `Scene` interface from `shared/types.ts`:

```typescript
export interface Scene {
  update(dt: number): void;
  render(buffer: CharBuffer): void;
}
```

The game loop calls `update(dt)` and `render(buffer)` on the active scene each frame.

## Menu scenes (BaseMenuScene)

Most menu screens extend `BaseMenuScene` (`src/game/scenes/BaseMenuScene.ts`). The base class provides:

- Cursor navigation (UP/DOWN with wrap-around)
- Tap-to-item mapping (`onTap` row → item index, items start at row 14)
- `activated` guard — set on the first SELECT or tap, silences all further input
- Standard `render()` layout: white border, bright-cyan title centred at row 2, cyan `=` rule at row 3 matching title width, bright-green/white items from row 14, bright-black footer hint at row h−3

Individual menu scenes pass a title, items array, and per-item callbacks to the `BaseMenuScene` constructor. They contain no input or rendering logic of their own.

Current BaseMenuScene subclasses: `MainMenuScene`, `StationMenuScene`, `TraderScene`, `MissionBoardScene`.

## Custom scenes

Some scenes implement `Scene` directly when they require non-standard layout or behaviour:

### TravelMenuScene

Two-tab scene for in-system travel and inter-system jumps. Implements its own input handler and render loop.

- **Tabs:** DESTINATIONS and JUMPS, switched with LEFT/RIGHT. Active tab is `bright-green`.
- **Layout:** NavBar rows 0–1, title row 3, tabs row 6, items from row 8.
- **DESTINATIONS tab:** lists system destinations + "FLY INTO SPACE" sentinel at the end. Current docked destination and FLY INTO SPACE (when already in space) are shown in `bright-black` and are not selectable.
- **JUMPS tab:** lists jump routes as `NAME  XLY  [STABILITY]`.
- **NavBar:** single SHIP button; both BACK key and SHIP tap call `onShip()`.
- **Arrival mode:** constructed with `currentDestinationId: null` — no item is greyed out.

### ShipScene

Custom layout with a starfield, NavBar (location + system), and TRAVEL / DOCK buttons.

- `destinationId: string | null` — null means "in space": shows `IN SPACE · SYSTEM`, greys DOCK, suppresses station glyph, limits cursor to TRAVEL only.

### StoryScene

Scrolling text scene reading from world data story beats. Custom pagination and render logic.

### JumpAnimationScene

Timer-driven, accepts no input. Auto-advances to `onArrival` after exactly 5 000 ms. Renders animated ellipsis and countdown.

### InSystemTravelAnimationScene

Same timer-driven pattern as `JumpAnimationScene` but 2 000 ms duration. Kept as a separate class for future visual divergence.

## Shared drawing helpers

`src/shared/buffer-utils.ts` exports helpers used by all scenes:

- `writeText(buffer, row, col, text, fg, bg)` — writes a string at a fixed position
- `writeCentered(buffer, row, text, fg, bg)` — centres a string on a row
- `drawBorder(buffer, fg, bg)` — draws a `+`/`-`/`|` border around the full buffer
- `wrapText(text, maxWidth)` — wraps a string to an array of lines (used by StoryScene)

## NavBar

`NavBar` (`src/game/ui/NavBar.ts`) renders a two-row header: the location/title on row 0 and a set of labelled buttons on row 1. Button hit ranges are computed lazily during the first `render()` call; `hitTest(col, row)` returns the matched button id or `null`.

Scenes that include a NavBar must call `navBar.render(buffer)` before any `navBar.hitTest()` call in the same frame.

## Scene wiring

Creating scenes and passing callbacks between them is the responsibility of the two entry points — `src/main.ts` (browser) and `terminal.ts` (Bun). Both must be kept in sync when adding new scenes.

Game state shared across scenes (`currentSystemId`, `currentDestinationId`) lives as module-scope variables in each entry point and is updated by the orchestrator callbacks (`onDestinationSelected`, `onJumpSelected`, `goToFlyIntoSpace`, etc.).
