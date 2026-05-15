# 015 · Station Nav Bar — DONE

## What it added
Added a two-row nav bar at the top of every station-context screen (rows 0–1): station name in bright-cyan on row 0, bracketed nav buttons (`[UNDOCK]`, `[HUB]`) centered on row 1. Introduced the `NavBar` component with `render()` and `hitTest()`. Also renamed `StationMenuScene`'s title from the station name to `HUB`, removed the UNDOCK menu item, and made ESC trigger undocking. TraderScene and MissionBoardScene gained an `onUndock` callback.

## Key files
- `src/game/ui/NavBar.ts` — `NavBar` component with button layout computation and tap hit-testing
- `src/game/scenes/StationMenuScene.ts` — NavBar integration; title → HUB; UNDOCK item removed
- `src/game/scenes/TraderScene.ts` — NavBar with UNDOCK + HUB; `onUndock` callback added
- `src/game/scenes/MissionBoardScene.ts` — same changes as TraderScene

## Architectural decisions embedded
- NavBar is a pure rendering and hit-testing helper; all state (activation guards, callbacks) lives in the scene.
- Button column ranges are cached after each `render()` call for use by `hitTest()`.
- Nav bar occupied rows 0–1, which were previously blank — no content row shifts needed.
- Superseded by feature 028 (Common Screen Layout), which deleted `NavBar` and replaced it with `ScreenChrome`.
