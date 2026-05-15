# Feature 034 · Shared Game Orchestrator

## Goal

Eliminate near-total duplication between `src/main.ts` and `terminal.ts` by extracting
all game navigation logic into a shared `Game` class, leaving both entry points containing
only platform setup and a game loop.

## Acceptance criteria

- `src/game/game.ts` exists and exports a `Game` class.
- `Game` accepts `renderer: Renderer`, `input: InputHandler`, and `context: GameContext`
  as constructor arguments.
- `Game` internally owns all navigation functions (`goToMainMenu`, `goToStation`,
  `goToTrader`, `goToMissionBoard`, `goToShip`, `goToTravelMenu`, `goToArrival`,
  `goToStory`, `goToFlyIntoSpace`, `onDestinationSelected`, `onJumpSelected`) — none of
  these appear in `src/main.ts` or `terminal.ts`.
- `Game` exposes a single `tick(dt: number): void` method that creates the char buffer,
  calls `currentScene.update(dt)`, `currentScene.render(buffer)`, and
  `renderer.drawBuffer(buffer)`.
- `dt` clamping to `MAX_DT` (100 ms) occurs inside `Game.tick()`, not in the caller.
- `src/main.ts` contains only: CSS import, renderer/input construction, `GameContext`
  construction, `new Game(...)`, and the `requestAnimationFrame` loop (≤ 25 lines).
- `terminal.ts` contains only: renderer/input construction, `GameContext` construction,
  `new Game(...)`, the `process.stdin` close guard, and the `setInterval` loop (≤ 20 lines).
- `npx tsc --noEmit` passes with zero errors.
- `npm test` passes with zero failures.

## Out of scope

- Unifying the game loop timing mechanism (`requestAnimationFrame` vs `setInterval`).
- Any change to `GameContext` shape — that belongs to feature 033.
- Any change to how scenes are constructed or their parameter lists — that belongs to
  feature 033.
- Moving `terminal.ts` into `src/`.

## Technical notes

### `src/game/game.ts` — `Game` class

`Game` is constructed with `renderer: Renderer`, `input: InputHandler`, and
`context: GameContext`. It initialises `currentScene` to a `MainMenuScene` during
construction (same as the current entry-point bootstrap lines). All navigation closures
become private methods; they close over `this` rather than over free variables in the
module scope.

The `makeBuffer()` helper (currently defined in `src/main.ts`; inlined in `terminal.ts`)
becomes a private method on `Game`.

`tick(dt: number)` is the only public method beyond the constructor. It clamps `dt` at
100 ms internally, then runs the update → render → draw pipeline.

`currentScene` is a private field, mutated only by the navigation methods.

### Entry-point shape after the change

`src/main.ts` retains: the CSS import, browser-specific `primaryInput` and `debug`
derivation, `DOMRenderer` / `DOMInputHandler` construction, `GameContext` literal,
`new Game(renderer, input, context)`, and the `requestAnimationFrame` loop body (capture
`lastTime`, compute raw `dt`, call `game.tick(dt)`).

`terminal.ts` retains: `TerminalRenderer` / `TerminalInputHandler` construction,
`GameContext` literal, `new Game(renderer, input, context)`, the `process.stdin` close
guard, `input.connect()`, and the `setInterval` body (compute raw `dt`, call
`game.tick(dt)`).

`dt` clamping is **not** done in the loop body — `tick()` owns that. The loop passes
the raw elapsed time.

### Dependency interaction with feature 033

This feature must be implemented **after** feature 033. Feature 033 removes `playerState`,
`currentSystemId`, `currentDestinationId`, and the `context.X = …` sync lines from both
orchestrators. Implementing 034 before 033 would require extracting those variables into
`Game` only to restructure them again in 033.

After 033, `Game` will hold a single `PlayerState` instance (constructed from game
settings at startup) and pass it to scenes. Feature 033's spec already defines that API;
034 does not need to pre-describe it.

## Dependencies

**033**
