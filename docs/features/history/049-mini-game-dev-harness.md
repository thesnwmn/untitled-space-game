# 049 · Mini-Game Dev Harness — DONE

## What it added
Standalone browser and terminal entry points for developing and testing mini games in isolation. Browser harness lists registered games and supports launching by id; terminal harness provides command-line access. Both use a mock `PlayerState` and support variant parameters. Added `npm run dev:mini-games`, `npm run build:mini-games` scripts and updated landing page.

## Key files
- `src/game/player-state.ts` — added static `createMock()` method
- `mini-games.html` — browser entry point
- `src/mini-game-runner.ts` — browser runner with index and game modes
- `terminal-mini-games.ts` — terminal runner with argument parsing
- `vite.mini-games.config.ts` — second Vite config for mini-games build
- `scripts/build-landing.ts` — updated to include mini-games link
- `package.json` — added scripts and updated `build:all`

## Architectural decisions embedded
- Mock `PlayerState` is created via static factory method, matching the pattern of game initialization from world settings.
- Browser and terminal runners follow the same pattern as main game entry points (`main.ts`, `terminal.ts`) — independent, focused, reusable.
- Mini-game registries are initialized empty per spec; first concrete mini game (Feature 055) will populate them.
