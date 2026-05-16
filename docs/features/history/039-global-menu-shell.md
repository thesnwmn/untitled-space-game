# 039 · Global Menu Shell — DONE

## What it added

Wired the dormant `[M] MENU` chrome button and new `MENU` game action (`M`/`m` key) to open `GlobalMenuScene` from five supported scenes: `ShipCockpitScene`, `StationMenuScene`, `TraderScene`, `MissionBoardScene`, and `CargoScene`. `Game` stores the prior scene in `sceneBeforeMenu` and restores it when the menu closes; pressing `[1] GAME`, `BACK`, or `M` again all return to the exact prior scene. The entry list starts empty — future features add their own entries via `GlobalMenuEntry`.

## Key files

- `src/game/scenes/global-menu-scene.ts` — new scene (+ interface `GlobalMenuEntry`)
- `src/game/scenes/global-menu-scene.test.ts` — 13 tests
- `src/game/ui/screen-chrome.ts` — `hitTestHeader()` method added
- `src/game/scenes/base-menu-scene.ts` — `onMenuCallback` field + MENU action/tap intercept
- `src/game/game.ts` — `sceneBeforeMenu`, `goToGlobalMenu()`, `returnFromMenu()`, `buildMenuEntries()`
- `src/shared/types.ts` — `'MENU'` added to `GameAction`
- `src/platform/dom/dom-input-handler.ts` — `m`/`M` → `'MENU'`
- `src/platform/terminal/terminal-input-handler.ts` — `m`/`M` → `'MENU'`

## Architectural decisions embedded

`onMenuCallback` is a protected field set by each supporting scene after `super()` rather than a constructor parameter on `BaseMenuScene`, avoiding a breaking change to the base class signature for scenes that don't need menu access (e.g. `TravelMenuScene`, `GalaxyMapScene`). `buildMenuEntries()` in `Game` is a private helper assembled at call-time, making it straightforward for future features to append entries by extending this method.
