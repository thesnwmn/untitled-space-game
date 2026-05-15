# 027 · World-Driven Story, Station, and System Display — DONE

## What it added
Removed all hardcoded world content from scene source files. `StoryScene` now renders text from the `opening-arrival` world beat. `StationMenuScene` builds its menu dynamically from `destination.amenities` flags. `ShipScene` shows `<DESTINATION> · <SYSTEM>` from world data and selects the station glyph from `destination.type`. `TraderScene` shows the NPC name from `destination.npcs.trader`. The `STATION_NAME` constant was deleted. Added `wrapText()` to `buffer-utils.ts`.

## Key files
- `src/shared/buffer-utils.ts` — `wrapText(text, maxWidth): string[]` added
- `src/game/scenes/StoryScene.ts` — reads `opening-arrival` beat; wraps paragraphs via `wrapText`
- `src/game/scenes/StationMenuScene.ts` — `destinationId` param; amenity-driven menu items; description/danger display
- `src/game/scenes/ShipScene.ts` — `destinationId` param; `destination.type` → station glyph mapping
- `src/game/scenes/TraderScene.ts` — `destinationId` param; NPC name from world data
- `src/game/scenes/MissionBoardScene.ts` — `destinationId` param; NavBar title from world data
- `src/game/constants.ts` — `STATION_NAME` deleted

## Architectural decisions embedded
- `DESTINATION_TYPE_TO_STATION` maps `civilian→HUB`, `military→RELAY`, `research→RING`, `black-market→BEACON`.
- Future amenities (`shipRepair`, `fuel`, `shipDealer`) slot in as new `if` branches in `StationMenuScene` with no other changes.
- Orchestrators pass `STARTING_DESTINATION = 'elysium-station'`; feature 026 replaces this with `currentDestinationId`.
