# Scene System

All game screens implement the `Scene` interface from `shared/types.ts`:

```typescript
export interface Scene {
  update(dt: number): void;
  render(buffer: CharBuffer): void;
}
```

The game loop calls `update(dt)` and `render(buffer)` on the active scene each frame.

## Menu scenes

Menu scenes extend `BaseMenuScene` (`src/game/scenes/BaseMenuScene.ts`). The base class provides:

- Cursor navigation (UP/DOWN with wrap-around)
- Tap-to-item mapping (`onTap` row → item index, items start at row 14)
- `activated` guard — set on the first SELECT or tap, silences all further input
- Standard `render()` layout: white border, bright-cyan title centred at row 2, cyan `=` rule at row 3 matching title width, bright-green/white items from row 14, bright-black footer hint at row h−3

Individual menu scenes pass a title, items array, and per-item callbacks to the `BaseMenuScene` constructor. They contain no input or rendering logic of their own.

## Shared drawing helpers

`src/shared/buffer-utils.ts` exports three helpers used by all scenes:

- `writeText(buffer, row, col, text, fg, bg)` — writes a string at a fixed position
- `writeCentered(buffer, row, text, fg, bg)` — centres a string on a row
- `drawBorder(buffer, fg, bg)` — draws a `+`/`-`/`|` border around the full buffer

## Scene wiring

Creating scenes and passing callbacks between them is the responsibility of the two entry points — `src/main.ts` (browser) and `terminal.ts` (Bun). Both must be kept in sync when adding new scenes.

Game-wide constants (e.g. `STATION_NAME`) live in `src/game/constants.ts`.
