# 034 · Shared Game Orchestrator — DONE

## What it added

Extracted all game navigation logic from `src/main.ts` and `terminal.ts` into a shared
`Game` class in `src/game/game.ts`. Both entry points now contain only platform setup and
a game loop, with all scene construction and navigation owned by `Game` as private methods.
`Game.tick(dt)` clamps dt to 100 ms internally and runs the full update → render → draw pipeline.

## Key files

- `src/game/game.ts` — new `Game` class (created)
- `src/main.ts` — reduced to 25 lines (platform setup + RAF loop)
- `terminal.ts` — reduced to 19 lines (platform setup + setInterval loop)
- `src/game/game.test.ts` — 4 tests for tick behaviour and dt clamping
