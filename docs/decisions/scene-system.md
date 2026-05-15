# Scene System

All game screens implement the `Scene` interface from `shared/types.ts`. The game loop calls `update(dt)` and `render(buffer)` on the active scene each frame.

**Menu scenes** extend `BaseMenuScene` (`src/game/scenes/BaseMenuScene.ts`), which provides:
- Cursor navigation (UP/DOWN with wrap-around)
- Tap-to-item mapping (`onTap` row → item index)
- `activated` guard — set on the first SELECT or tap, silences all further input
- Standard `render()` layout: ScreenChrome header/footer, left-aligned title, items with optional info lines, pagination

Individual menu scenes pass a title, items array, info lines, nav options, and per-item callbacks to the `BaseMenuScene` constructor. They contain no input or rendering logic of their own.

**Custom scenes** implement `Scene` directly (not via `BaseMenuScene`) when they require non-standard layout or behaviour that the base class cannot accommodate:
- `TravelMenuScene` — two tabs (DESTINATIONS / JUMPS) with LEFT/RIGHT switching

**Transition scenes** extend `BaseTransitionScene` (`src/game/scenes/base-transition-scene.ts`). The base class handles timing, chrome rendering, and buffer clearing; subclasses implement only `renderContent(buffer)`. All six animation scenes use this pattern:
- `JumpAnimationScene`, `InSystemTravelAnimationScene` — travel transitions
- `SurfaceLandingAnimationScene`, `AsteroidLandingAnimationScene` — landing transitions (2 500 ms)
- `SurfaceTakeOffAnimationScene`, `AsteroidTakeOffAnimationScene` — take-off transitions (1 500 ms)

Transition scenes accept no `InputHandler` and auto-advance once elapsed time reaches their duration. See `docs/decisions/travel-system.md` for durations, chrome overrides, and routing.

**ScreenChrome** (`src/game/ui/ScreenChrome.ts`) provides the consistent 2-row header and 1-row footer nav used by all scenes:
- Row 0: system name
- Row 1: destination name + credits
- Footer: `:: [1] LABEL :: [2] LABEL ::::` nav buttons
- Exports `CONTENT_TOP = 3`, `CONTENT_TOP_NO_HEADER`, `contentBottom(h, showFooter)`, `hitTestNav(col, row)`

**Shared drawing helpers** (`src/shared/buffer-utils.ts`):
- `writeText(buffer, row, col, text, fg, bg)` — writes a string at a fixed position
- `writeCentered(buffer, row, text, fg, bg)` — centres a string on a row
- `drawBorder(buffer, fg, bg)` — draws a `+`/`-`/`|` border around the full buffer
- `wrapText(text, maxWidth)` — wraps a string to an array of lines

**Scene wiring** (creating scenes and passing callbacks between them) lives entirely in the two entry points — `src/main.ts` (browser) and `terminal.ts` (Bun). Both must be kept in sync when adding new scenes.

**GameContext fields** (slimmed to runtime-only after feature 033):
```typescript
export interface GameContext {
  environment: RuntimeEnvironment;
  primaryInput: PrimaryInput;
  debug: boolean;
}
```

Game state (location, credits, fuel, cargo) moved to `PlayerState`
(`src/game/PlayerState.ts`), which is constructed once at startup and passed to
every scene alongside `context`. `ScreenChrome` reads from `PlayerState` for its
header rows (system name, destination name, credits).
