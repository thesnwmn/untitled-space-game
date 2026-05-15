# 006 · Main Menu Screen — DONE

## What it added
Established the `Scene` interface and `GameContext` type, then implemented `MainMenuScene` with ASCII title art, selectable NEW GAME / QUIT options, cursor navigation (UP/DOWN/SELECT for keyboard, tap-to-activate for touch), and a footer hint. QUIT is hidden in browser builds. Also wired the game loop in both entry points (rAF in browser, 30 fps interval in terminal).

## Key files
- `src/shared/types.ts` — `Scene` interface, `GameContext` type (`RuntimeEnvironment`, `PrimaryInput`)
- `src/game/scenes/MainMenuScene.ts` — main menu scene
- `src/main.ts` — browser game loop with rAF
- `terminal.ts` — terminal game loop at 30 fps

## Architectural decisions embedded
- `Scene` interface is intentionally minimal (`update(dt)` + `render(buffer)`); lifecycle methods deferred until a second scene proves the need.
- All platform decisions flow through `GameContext` — no `typeof window` checks in scenes.
- Browser `GameContext.primaryInput` is derived from `navigator.maxTouchPoints > 0` at startup.
- QUIT is suppressed in browser builds at the `GameContext` level, not via environment sniffing in the scene.
