# 011 · Game Scenes — Trader, Mission Board, Ship — DONE

## What it added
Added three new scenes reachable from the station menu: `TraderScene` (BUY/SELL tabs, item lists, LEFT/RIGHT tab switching), `MissionBoardScene` (typed missions with reward display, cursor navigation), and `ShipScene` (status bar, static ASCII starfield viewport, JUMP/DOCK buttons). Wired all scenes into the orchestrators with callback-based transitions and hardcoded initial data.

## Key files
- `src/game/scenes/TraderScene.ts` — trader with BUY/SELL tabs
- `src/game/scenes/MissionBoardScene.ts` — mission board
- `src/game/scenes/ShipScene.ts` — ship exterior with status bar and starfield placeholder

## Architectural decisions embedded
- All mission/trader/player data hardcoded in scene constructors; future features externalise state management.
- `ShipScene` does not extend `BaseMenuScene` (custom layout); it tracks cursor state manually with `cursorIdx` and an `activated` guard.
- Scene re-entry creates a fresh instance; no state persists across transitions at this stage.
