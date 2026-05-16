# Feature 044 · Knowledge Base — Screens

> **Prerequisites**: feature 039 (Global Menu Shell) and feature 043 (Knowledge Base Discovery) must be built first.

## Goal

The player can open their accumulated knowledge as a navigable reference from the global menu. Three levels of screen let them browse from a list of known systems down to individual destination records.

---

## Navigation flow

```
Global menu
  [1] GAME
  KNOWLEDGE BASE  →  System List
                       [1] BACK → global menu
                       (select a visited system)  →  System Detail
                                                       [1] BACK → System List
                                                       (select a visited dest.)  →  Destination Detail
                                                                                      [1] BACK → System Detail
```

Selecting an **uncharted** (known-name-only) system or destination does not navigate deeper. A non-interactive line appears below the selected row: `No data — visit to learn more.`

Pressing `M` from any KB screen opens the global menu. Closing the global menu from that point returns to the underlying game scene, not back into the KB.

---

## Acceptance criteria

- `KNOWLEDGE BASE` appears as a selectable entry in `GlobalMenuScene`
- **System List**: shows all known systems sorted by distance from Sol (nearest first); visited systems are selectable; known-only systems display an `UNCHARTED` label and are not selectable; if no systems are known the screen shows `NO SYSTEMS ON RECORD`
- **System Detail**: reachable only for visited systems; shows the system's star type, zone, security level, danger level, population, economy categories, and description; below this, a paginated list of all known destinations in that system with the same visited/known-only distinction
- **Destination Detail**: reachable only for visited destinations from within System Detail; shows location type, destination type, amenities (each marked present or absent), danger level, and description
- All three screens have `[1] BACK` returning to their parent screen
- Pressing `M` from any KB screen opens the global menu
- The system list is sorted nearest-to-Sol first
- `npx tsc --noEmit` passes; `npm test` passes, covering: system list rendering (empty, mixed visited/known), system detail for a visited system, destination detail content, and back navigation at each level

---

## Out of scope

- Filtering, searching, or annotating entries
- A visual galaxy-map view (separate build target under `npm run build:map`)

---

## Technical notes

### New scenes

Three new scenes extending `BaseMenuScene`:

- `src/game/scenes/knowledge-system-list-scene.ts`
- `src/game/scenes/knowledge-system-scene.ts`
- `src/game/scenes/knowledge-destination-scene.ts`

### System List scene

Reads `player.knownSystems` (from the KB Discovery feature). For each system, fetches the `StarSystem` record from world data to get `distanceFromSol` for sorting and `zone`/`security` for display.

Visited systems map to selectable `MenuItemDef` entries; known-only systems map to disabled entries with `UNCHARTED` appended to the label.

### System Detail scene

Receives the `systemId`. Renders a non-interactive info block at the top (star type, zone, security, danger, population, economy tags, description) using the world data record. Below it, renders the destination list as interactive `MenuItemDef` entries using the same visited/known-only pattern.

To separate the info block from the destination list visually without using the tab mechanism, the info block can be rendered directly in `render()` above the `BaseMenuScene` item list, with `CONTENT_TOP` offset adjusted accordingly.

### Destination Detail scene

Receives the `destinationId`. Renders a non-interactive info block: location type, destination type, amenities grid, danger level, description. Because there is no interactive list, this scene may be simpler to implement as a custom scene rather than extending `BaseMenuScene`.

### `Game` additions

New private navigation methods: `goToKnowledgeBase()`, `goToKnowledgeSystem(systemId)`, `goToKnowledgeDestination(destinationId)`. Each instantiates the corresponding scene with the appropriate back-navigation callback.

`goToGlobalMenu()` is updated to include a `KNOWLEDGE BASE` entry that calls `goToKnowledgeBase()`.

### Amenities display

The `Destination.amenities` object has boolean fields: `trader`, `missionBoard`, `shipRepair`, `fuel`, `shipDealer`. Suggest rendering these as a compact row, e.g.:

```
TRADER [Y]  MISSIONS [Y]  FUEL [Y]  REPAIR [ ]  DEALER [ ]
```
