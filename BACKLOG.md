# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.
Completed items are in [BACKLOG_HISTORY.md](BACKLOG_HISTORY.md).

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)

---

## READY

### 025 · Randomise Station Star Patterns

Each visit to a destination generates a new random `Starfield` seed, producing a
unique star layout. The seed is preserved across dock/undock cycles at the same
destination and only cleared when the player fully navigates away (main menu, story
screen, or future jump). `ShipScene` gains a required `starfieldSeed: number`
constructor parameter. The orchestrators (`main.ts`, `terminal.ts`) hold a
`destinationSeed` variable: generated fresh on first `goToShip` when null, reused
on subsequent undocks, cleared on `goToMainMenu` / `goToStory`.
See `docs/features/025-randomise-station-star-patterns.md` for the full spec.

---

### 036 · Cockpit Ship View

Replace the current ship view with a fully animated cockpit display:
a two-row coloured gauge strip (fuel/cargo left, shields/hull right, button
clusters between), a borderless starfield viewport with floating crosshair
and HUD overlay, a 5-row bottom section with button panels flanking a dark
radar block (drifting contacts, edge arrow indicators), a scrolling
info/comms ticker, and a screen chrome footer nav bar. TRAVEL and DOCK are
embedded as coloured-background words inside the bottom panels.
See `docs/features/036-cockpit-ship-view.md` for the full spec.

---

### 037 · Mission Foundation

Establish the core mission data model, world data additions (`DeliveryItem[]`, `NpcNames`), `MissionGenerator`, and `PlayerState` extensions (`activeMissions`, `missionItems`, accept/collect/complete/cancel methods) that all subsequent mission features depend on.
See `docs/features/037-mission-foundation.md` for the full spec.

---

### 038 · Mission Board Live

Replace the hardcoded `MissionBoardScene` placeholder with live generated missions (TTL-cached in `Game`). Add `MissionDetailScene` with full mission info, cargo check, and ACCEPT/BACK navigation. Accepted missions are removed from the board.
See `docs/features/038-mission-board-live.md` for the full spec.

---

### 039 · Global Menu & Mission Log

Wire the dormant `[M] MENU` chrome button (and new `MENU` game action) to open a tabbed `GlobalMenuScene`. The `MISSIONS` tab lists active missions with live status sub-lines. Selecting a mission opens a `ModalConfirmDialog` for cancellation.
See `docs/features/039-global-menu-mission-log.md` for the full spec.

---

### 040 · Station Mission Actions

Add COLLECT and DELIVER mission items to `StationMenuScene` (above normal options, with a separator). Show mission items distinctly in `CargoScene` (bright-yellow, separate section). Complete deliveries with a reward modal.
See `docs/features/040-station-mission-actions.md` for the full spec.

---


## NEEDS SPEC

### 041 · Mission Flavour Text

Mission `description` text is assembled from world-data components: sentence fragments for job types, item/commodity names, destination flavour, and NPC voice. The fragment lists live in `docs/world/` and are loaded into `WorldData`. `MissionGenerator` picks and concatenates fragments based on mission type, replacing the placeholder prose strings added in feature 037. Full spec to be written.

---

## IN PROGRESS

_(none)_

---

## DONE

See [BACKLOG_HISTORY.md](BACKLOG_HISTORY.md) for all completed items.
