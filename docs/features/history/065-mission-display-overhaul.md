# 065 · Mission Board & Log Display Overhaul — DONE

## What it added

Mission board and log are now sorted by delivery destination, with supply missions showing per-commodity cargo availability inline. The board sorts missions alphabetically by destination then by type (delivery before supply); the log sorts by destination, then status priority (ready-to-deliver first), then type. Supply missions in both views display requirement lines beneath the status/destination line, colour-coded green when the player holds sufficient cargo, dim otherwise.

## Key files

- `src/game/scenes/mission-board-scene.ts` — added `sortMissions()`, `destColor()`, `buildMenuItem()`, and `buildSupplyDetails()` static methods; missions now display destination name and per-requirement cargo lines using `detailsColored`
- `src/game/scenes/mission-log-scene.ts` — added `getStatusPriority()`, `sortMissions()`, `buildMenuItem()`, and `buildSupplyDetails()` instance methods; missions sorted by destination, status priority, then type
- `src/game/scenes/mission-board-scene.test.ts` — updated layout-dependent tests for multi-row items; added 27 new tests covering sort order, destination display, and requirement colours
- `src/game/scenes/mission-log-scene.test.ts` — added 22 new tests covering sort order and requirement display

## Architectural decisions embedded

- Sorting happens at render time (getter in MissionLogScene, constructor in MissionBoardScene) to reflect live player state (cargo quantity).
- Supply requirement detail lines leverage the existing `MenuItemDef.detailsColored` field (added in base-menu-scene.ts previously) rather than extending the interface further; per-line colours are maintained as arrays within a single `detailsColored` structure.
- Destination name colouring (bright-green for current, bright-yellow for in-system, white otherwise) mirrors the logic in `MissionDetailScene`, surfacing player proximity at a glance.
