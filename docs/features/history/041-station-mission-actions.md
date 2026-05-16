# 041 · Station Mission Actions — DONE

## What it added
`StationMenuScene` now surfaces mission actions at docked stations: `COLLECT: [itemName]` items for delivery pickups and `DELIVER: [title] → [reward] CR` items for ready-to-deliver missions, rendered in `bright-yellow` above the normal amenity items with a disabled separator row between them. Selecting COLLECT calls `collectMissionItem` and rebuilds the hub; selecting DELIVER re-checks cargo, completes the mission, awards credits, and shows a `ModalConfirmDialog` completion modal. `CargoScene` displays mission items in a distinct `MISSION CARGO` section in `bright-yellow` with a `[MISSION]` prefix.

## Key files
- `src/game/scenes/station-menu-scene.ts` — mission item building and action closures
- `src/game/scenes/cargo-scene.ts` — MISSION CARGO section
- `src/game/scenes/base-menu-scene.ts` — added `accentFg?: Color` to `MenuItemDef`
- `src/game/game.ts` — `onHub` wired to `goToStation()`

## Architectural decisions embedded
- Mission action closures (`action: () => {}` placeholders assigned after `super()`) follow the same post-super mutation pattern already used by the fuel item in `StationMenuScene`.
- `accentFg` on `MenuItemDef` allows non-cursor items to render in a non-white colour without touching `BaseMenuScene`'s cursor-focus logic.
