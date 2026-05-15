# 010 · Space Station Menu Screen — DONE

## What it added
Implemented `StationMenuScene` presenting the player's first interactive hub (TRADER, MISSION BOARD, UNDOCK) inside Elysium Station. Introduced `BaseMenuScene` — an abstract base class handling cursor navigation, `activated` guard, border, title/rule, items, and footer hint — which `StationMenuScene` extends. `MainMenuScene` was refactored to share buffer utilities without extending the base.

## Key files
- `src/game/scenes/StationMenuScene.ts` — station hub scene
- `src/game/scenes/BaseMenuScene.ts` — abstract base with shared menu chrome
- `src/shared/buffer-utils.ts` — `writeText`, `writeCentered`, `drawBorder` used by both scenes

## Architectural decisions embedded
- `BaseMenuScene` owns: cursor, activated flag, UP/DOWN/SELECT input, `onTap` row→item mapping (from `MENU_ROW_START = 14`), border, title/rule rendering, and footer hint.
- `STATION_NAME.toUpperCase()` drives the displayed title so a name change is a one-line edit.
- Entry points complete the full scene chain: `MainMenuScene` → `StoryScene` → `StationMenuScene` → `MainMenuScene`.
