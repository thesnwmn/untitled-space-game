# Feature 065 · Mission Board & Log Display Overhaul

## Goal

Both the mission board and the missions log sort their lists clearly by destination and status, and supply missions show per-item cargo availability inline so players can immediately see what they still need to buy.

---

## Acceptance criteria

- Mission board missions are sorted: primary key = delivery destination name (alphabetical A–Z), secondary key = type (`delivery` before `supply`).
- Mission log (active missions) are sorted: primary = delivery destination name (A–Z), secondary = status priority (ready-to-deliver first, then needs-supplies / pending-pickup, then in-transit), tertiary = type (`delivery` before `supply`).
- In the mission board, each supply mission list item shows below its title and reward:
  - The delivery destination name (same destination as the board, but explicit for clarity).
  - One line per requirement: `Nx Commodity Name (have: M)` where M is the player's current cargo quantity for that commodity. The line is coloured `bright-green` if the player holds ≥ the required quantity, `bright-black` otherwise.
- In the mission log, each supply mission list item shows the same per-requirement lines (destination + coloured cargo lines) as the board.
- In the mission board, each delivery mission list item shows below its title and reward:
  - The delivery destination name.
- In the mission log, delivery missions retain their existing status+destination detail line (no change).
- `npx tsc --noEmit` passes with zero errors; `npm test` passes with updated tests covering sort order for both views and the coloured requirement lines.

---

## Out of scope

- Player-togglable sort order.
- Filtering or search on either screen.
- Changes to `MissionDetailScene` content or layout.
- Any display changes to the deposit field in the board list (deposit is shown in the detail scene only).

---

## Technical notes

### Sorting

Both `MissionBoardScene` and `MissionLogScene` build their item lists in getters or constructors. Apply sorting over the input array before mapping to `MenuItemDef`. Use `getDestination(deliveryDestinationId)?.name ?? deliveryDestinationId` as the sort key for destination. Status sort order: `ready-to-deliver = 0`, `needs-supplies = 1`, `pending-pickup = 1`, `in-transit = 2`.

### Supply mission inline detail lines

`MenuItemDef.details` is already an array of strings with a single `detailsFg` colour. Inline requirement lines need per-line colours (green / dim). Check whether `MenuItemDef` supports per-line colour; if not, the Engineer should extend it to accept `details: Array<{ text: string; fg: Color }>` or a parallel `detailColors: Color[]` array, updating `BaseMenuScene` rendering accordingly. If a simpler approach is available (e.g., rendering coloured lines directly in a scene subclass override), prefer that to avoid widening the shared interface unnecessarily.

### Cargo quantity lookup

`player.cargoHold` is a `CargoEntry[]` with `{ commodityId, qty }`. For each requirement `{ commodityId, qty }`, find the matching cargo entry and read its qty (default 0 if absent). This is a pure read with no side effects.

### Delivery destination in board list

For delivery missions on the board, the delivery destination can be any destination in the world (not just the current one). Resolve its name via `getDestination`. Colour the name as the existing `MissionDetailScene` does: `bright-green` if it's the player's current destination, `bright-yellow` if it's in the current system, `white` otherwise — surfacing at-a-glance whether the player is already heading there.

---

## Play-test instructions

### Browser (`npm run dev`)

1. Dock at a station with several missions. Open the mission board.
2. Confirm missions are grouped by delivery destination name and within each group deliveries precede supply missions.
3. Select a supply mission and confirm per-requirement lines show commodity name, required qty, current cargo qty, and correct colour (green if sufficient, dim otherwise).
4. Go to the trader, buy some of the required commodities, return to the board — confirm the colour of the affected lines changes to green.
5. Accept several missions. Open Missions from the global menu.
6. Confirm the log sorts: ready-to-deliver missions appear first, followed by in-progress, then in-transit.
7. Confirm supply missions in the log show the same per-requirement lines as the board.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

Feature 063 (Mission Destination Ownership & Generation) — board entry is conditional; mission list source moves to PlayerState.
Feature 064 (Mission Balance & Deposit) — type shape of `MissionSpec` must be stable before display work.
