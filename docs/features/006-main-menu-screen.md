# Feature 006 · Main menu screen

**Goal:** Display the game's main menu — ASCII title, selectable options, and full keyboard/touch navigation — establishing the visual and interactive style for the rest of the game.

## Acceptance criteria

- A `Scene` interface is added to `src/shared/types.ts`:
  ```typescript
  export interface Scene {
    update(dt: number): void;
    render(buffer: CharBuffer): void;
  }
  ```
- `MainMenuScene` is implemented in `src/game/scenes/MainMenuScene.ts` and satisfies `Scene`.
- `MainMenuScene` constructor signature: `constructor(inputHandler: InputHandler, context: GameContext)`.
- The `GameContext` type (`RuntimeEnvironment`, `PrimaryInput`) is also added to `src/shared/types.ts` as specified in DECISION_REGISTER.md.
- The menu renders into the full 40×60 grid with this layout:

  ```
  rows  2–12  title block  (ASCII art "UNTITLED / SPACE GAME" in bright-cyan on black)
  rows 14–16  tagline      (centred, white on black, e.g. "- An ASCII space adventure -")
  rows 22–28  menu options (see below)
  row  58     footer hint  (centred, bright-black — text varies by primaryInput, see below)
  ```

  Footer hint text:
  - `context.primaryInput === 'keyboard'`: `"↑↓ navigate   ENTER select"`
  - `context.primaryInput === 'touch'`: `"tap an option to select"`

- Menu options rendered as (example, cursor on first item):

  ```
  > NEW GAME
    QUIT
  ```

  The cursor `>` and the highlighted option label use `bright-green` fg; unselected options use `white` fg. All options on `black` bg.
- When `context.environment === 'browser'`, QUIT is not rendered and not selectable. The menu only shows NEW GAME. (There is nothing meaningful to quit to in a browser tab.)

- **Keyboard/swipe navigation (incremental):**
  - UP / DOWN move the cursor, wrapping around (bottom to top and vice versa).
  - SELECT activates the currently highlighted item.

- **Touch navigation (direct):**
  - `MainMenuScene` registers an `onTap` handler with the `InputHandler`. When a tap arrives, the scene checks whether the tapped grid row falls on a menu item row. If it does, that item is activated immediately — no cursor movement required.
  - Tapping a non-item row has no effect.

- **Item actions:**
  - Activating "NEW GAME" (via either input method) logs `"[MainMenu] Starting game…"` to console and stops responding to further input (placeholder until a game scene exists).
  - Activating "QUIT" logs `"[MainMenu] Quitting…"`, then calls `process.exit(0)` in the terminal build. In the browser build it is a no-op beyond the log.
  - BACK while on the menu has no effect.

- The browser entry point runs a game loop using `requestAnimationFrame`: `scene.update(dt)` → `scene.render(buffer)` → `renderer.drawBuffer(buffer)`. Target is uncapped but renders each frame.
- The terminal entry point runs a game loop using `setInterval` at 30fps (33ms interval).
- `MainMenuScene` receives an `InputHandler` in its constructor. It registers its own `onAction` and `onTap` listeners internally. No global input state.
- `tsc --noEmit` passes with zero errors.

## Out of scope

- Options / settings screen
- Animated intro or title screen transition
- Sound
- Save / load
- Finalised ASCII art logo (placeholder text is acceptable)

## Technical notes

- The title block ASCII art is intentionally left as a placeholder (`"UNTITLED\nSPACE GAME"`) to be replaced when the game has a name and an artist pass. The Engineer should write it as a multi-line string constant in `MainMenuScene.ts`.
- The `Scene` interface is intentionally minimal. Do not add lifecycle methods (`init`, `destroy`, etc.) until a second scene exists and the pattern is proven necessary.
- The footer hint row uses `bright-black` (dark grey) to keep it visually subordinate to the menu.
- `dt` passed to `update` is milliseconds since the last frame. `MainMenuScene` does not use it at this stage (static menu), but the signature must match the interface.
- `onTap` is optional on the `InputHandler` interface. `MainMenuScene` should guard: `if (inputHandler.onTap) inputHandler.onTap(...)`.
- `GameContext` is constructed by the entry point (see DECISION_REGISTER.md — Runtime Context). Browser: `{ environment: 'browser', primaryInput: navigator.maxTouchPoints > 0 ? 'touch' : 'keyboard' }`. Terminal: `{ environment: 'terminal', primaryInput: 'keyboard' }`.
- `MainMenuScene` must not contain any `if (typeof window !== 'undefined')` or other environment sniffing — all platform decisions are made via `GameContext`.

## Dependencies

- 001 · Scaffold
- 002 · CharBuffer and DOMRenderer
- 003 · Keyboard input handler (browser) — for browser wiring
- 005 · Keyboard input handler (terminal) — for terminal wiring
- 004 · Touch controls (browser) — connect touch handler alongside keyboard handler in browser entry point
