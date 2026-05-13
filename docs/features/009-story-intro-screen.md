# Feature 009 · Story intro screen

**Goal:** Show a short narrative screen when the player starts a new game, introducing the protagonist Hugo and his destination before landing them at the station hub.

---

## Station name

The space station is named **Elysium Station**. This name appears in this screen and as the title of item 010. Define it once as a shared constant — suggested location: `src/game/constants.ts`.

```typescript
export const STATION_NAME = 'Elysium Station';
```

---

## Acceptance criteria

- `StoryScene` is implemented in `src/game/scenes/StoryScene.ts` and satisfies the `Scene` interface.
- Constructor signature: `constructor(inputHandler: InputHandler, context: GameContext, onContinue: () => void)`.
- The screen renders into the 40×30 grid with the exact layout below.
- Pressing SELECT (Enter) triggers `onContinue` once, then silences further input.
- A tap anywhere on the grid (any col, any row) also triggers `onContinue` once.
- BACK (Escape) does nothing — the player cannot return to the main menu from here.
- After `onContinue` fires, all subsequent input is ignored.
- `tsc --noEmit` passes with zero errors.

---

## Layout (40 × 30 grid)

```
+--------------------------------------+   row  0   border (white on black)
|                                      |   row  1
|              YEAR  2284              |   row  2   bright-yellow, centred
|                                      |   row  3
|  Hugo poured his last credits into   |   row  4   white on black, col 2
|  a battered freighter — barely       |   row  5
|  spaceworthy, but entirely his.      |   row  6
|                                      |   row  7
|  Stories pulled him outward:         |   row  8
|  Elysium Station, drifting in        |   row  9
|  Jupiter's long shadow — where       |   row 10
|  traders, chancers and fortune-      |   row 11
|  seekers converge.                   |   row 12
|                                      |   row 13
|  Hugo eases into the docking bay,    |   row 14
|  locks the clamps, steps aboard.     |   row 15
|                                      |   row 16
|  Whatever comes next is up to him.   |   row 17
|                                      |   rows 18–26
|       [ PRESS ENTER TO CONTINUE ]    |   row 27   bright-black, centred
|                                      |   row 28
+--------------------------------------+   row 29   border
```

Touch variant footer (when `context.primaryInput === 'touch'`):

```
              [ TAP TO CONTINUE ]
```

---

## Story text (exact, col 2 start, max 36 chars per line)

```
YEAR  2284                              ← centred, bright-yellow

Hugo poured his last credits into       ← 33 chars
a battered freighter — barely           ← 29 chars
spaceworthy, but entirely his.          ← 30 chars

Stories pulled him outward:             ← 27 chars
Elysium Station, drifting in            ← 28 chars
Jupiter's long shadow — where           ← 29 chars
traders, chancers and fortune-          ← 30 chars
seekers converge.                       ← 17 chars

Hugo eases into the docking bay,        ← 32 chars
locks the clamps, steps aboard.         ← 31 chars

Whatever comes next is up to him.       ← 33 chars
```

All lines are left-aligned starting at column 2. The Engineer should verify each line fits within column 37 (≤ 36 chars). The em dash `—` is a single character.

---

## Colours

| Element      | fg            | bg    |
|--------------|---------------|-------|
| Border       | white         | black |
| Year header  | bright-yellow | black |
| Story text   | white         | black |
| Footer hint  | bright-black  | black |
| Background   | black         | black |

---

## Scene transition wiring

`MainMenuScene`'s NEW GAME action must call `onNewGame` (a new callback parameter) rather than just logging. The entry points supply this callback and swap the active scene.

At this stage (009 only), `onContinue` in the entry points logs a placeholder — `StationMenuScene` does not exist yet:

```typescript
// Pseudocode — exact implementation left to Engineer
let currentScene: Scene;

const goToStory = () => {
  currentScene = new StoryScene(inputHandler, context, () => {
    console.log('[Story] Arriving at Elysium Station…');  // placeholder until item 010
  });
};
const goToMain = () => { currentScene = new MainMenuScene(inputHandler, context, goToStory); };

currentScene = new MainMenuScene(inputHandler, context, goToStory);
```

Item 010 replaces the placeholder with a real transition to `StationMenuScene`.

`InputHandler` is registered once at startup. Each scene re-registers its own listeners in its constructor — previous listeners remain attached unless explicitly removed. To avoid listener accumulation across scene transitions, each scene should rely on its own `activated` guard to become dormant. The Engineer should evaluate whether this is sufficient or whether `InputHandler` needs an `offAction` / `clearListeners` method.

---

## Shared buffer utilities

`MainMenuScene` currently contains three local helpers — `writeText`, `writeCentered`, and `drawBorder`. `StoryScene` will need the same utilities. Extract them to `src/shared/buffer-utils.ts` so they can be imported by both scenes (and all future scenes).

---

## Out of scope

- Animated text reveal or typewriter effect
- Multiple story variants or branching
- Sound or music
- A "back" path from this screen to the main menu

---

## Technical notes

- Story text is a constant array of `{ text: string; row: number }` objects in `StoryScene.ts`. Do not build a text-wrapping algorithm — the text is pre-wrapped.
- The year header `"YEAR  2284"` uses two spaces between YEAR and 2284 for visual spacing. Render it centred.
- The `onContinue` callback replaces the current `console.log` placeholder in `MainMenuScene`. `MainMenuScene`'s NEW GAME action must be updated to call `onContinue()` instead of (or in addition to) logging.

---

## Tests required

- Renders border, year header, all story text lines at correct rows
- Renders keyboard footer hint when `primaryInput === 'keyboard'`
- Renders touch footer hint when `primaryInput === 'touch'`
- SELECT action triggers `onContinue` exactly once
- Tap on any row triggers `onContinue` exactly once
- Second SELECT after first does nothing (activated guard)
- Second tap after first does nothing (activated guard)
- BACK action has no effect

---

## Dependencies

- 006 · Main menu screen (must be DONE — `Scene` interface and `GameContext` already defined)
- 010 · Space station menu (implement together in same session)
