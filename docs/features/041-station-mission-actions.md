# Feature 041 · Station Mission Actions

## Goal

Surface mission-related actions (item collection, supply delivery) in the station hub menu, show mission items distinctly in the cargo view, and give the player completion and cancellation feedback via modal dialogs.

---

## Acceptance criteria

- When docked, `StationMenuScene` checks `player.getMissionsForPickup(destinationId)` and `player.getMissionsForDelivery(destinationId)` each time it is constructed
- Mission items (COLLECT and DELIVER rows) appear **above** the normal amenity items (TRADER, MISSION BOARD, REFUEL); if any mission items are present, a disabled separator row (e.g. a line of dashes or blank) appears between the mission items and the normal items
- Each `getMissionsForPickup` result yields a menu item labelled `COLLECT: [itemName]` in `bright-yellow`; selecting it calls `player.collectMissionItem(missionId)` and rebuilds the station menu
- Each `getMissionsForDelivery` result yields a menu item labelled `DELIVER: [title] → [reward] CR` in `bright-yellow`
- A DELIVER item is disabled (dimmed, with a detail sub-line explaining what is missing) if the cargo check fails at render time (supply mission commodities have been sold, or a delivery item was somehow lost)
- Selecting a valid DELIVER item: removes cargo/mission item, calls `player.completeMission(missionId)`, calls `player.addCredits(reward)`, opens a `ModalConfirmDialog` with a single OKAY button and a body message confirming the reward amount; closing the modal rebuilds the station menu
- `CargoScene` displays `player.missionItems` in a visually distinct section: items render in `bright-yellow` with a `[MISSION]` prefix or equivalent marker; they appear separated from (below or above) regular commodity entries
- Mission items do not appear in the `TraderScene` sell list (they are in `player.missionItems`, not `player.cargoHold`, so no sell-list change is needed — but a test must confirm a mission item's name is absent from the sell rows)
- `npx tsc --noEmit` passes; `npm test` passes with tests covering COLLECT flow, DELIVER flow (success and disabled states), cargo display of mission items, and completion modal

---

## Out of scope

- Space-based mission completion (radio / comms popup in cockpit)
- Faction reputation effects from completing or cancelling missions
- Mission failure on expiry

---

## Technical notes

### `StationMenuScene` changes

The constructor currently builds `items` as a fixed array of amenity entries. Refactor to:
1. Query mission pickup and delivery lists
2. Push COLLECT and DELIVER items into a `missionItems` array
3. If `missionItems.length > 0`, push a disabled separator item, then push `missionItems` before the amenity items
4. Continue with existing amenity item construction

The DELIVER callback must re-check the cargo condition at selection time (not just at construction) because the player may have navigated away and returned. If the check fails at selection time, show a brief info modal rather than completing.

### Cargo capacity display in `StationMenuScene`

No change needed — cargo capacity already reflects mission item weight via `PlayerState.cargoWeightKg`.

### `CargoScene` changes

After rendering regular `cargoHold` entries, render a second section for `player.missionItems`. If there are no mission items, no header or section is needed. If there are, render a short section header (e.g. `MISSION CARGO` in `bright-yellow`) and each item as `[MISSION] [itemName]` with weight, in `bright-yellow`.

The total weight line at the bottom of `CargoScene` already uses `player.cargoWeightKg`, which includes mission item weight — no change needed there.

### Completion modal

Re-use `ModalConfirmDialog` (feature 039) with `cancelLabel` omitted (single-button mode). Body text example:

> suggestion: `"Mission complete!\n\nYou received [reward] CR."`

The modal is opened via `BaseMenuScene.openModal`; closing it calls `this.closeModal()` and then triggers the station menu rebuild (e.g. by calling `onHub()` callback or re-entering the station scene).

### Separator item shape

A disabled `MenuItemDef` with an empty or dash-filled `label` and no `action`. `BaseMenuScene` already supports `disabled` items that skip cursor focus — the separator just needs to be inert.

> suggestion: label `"────────────────────"` (dashes to fill the content width) in `bright-black`
