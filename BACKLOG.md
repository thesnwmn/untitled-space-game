# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.
Completed items are in [BACKLOG_HISTORY.md](BACKLOG_HISTORY.md).

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)

---

## READY

### 025 · Overhaul Star Field & Destination Display

Each destination has a unique, stable starfield pattern derived deterministically from its ID (no orchestrator seed state needed). A type-appropriate foreground object — space station, asteroid, or planet — is rendered in the viewport with variant also selected by destination ID. Depends on feature 036.
See `docs/features/025-overhaul-star-field-display.md` for the full spec.

---

### 037 · Mission Foundation

Establish the core mission data model, world data additions (`DeliveryItem[]`, `NpcNames`), `MissionGenerator`, and `PlayerState` extensions (`activeMissions`, `missionItems`, accept/collect/complete/cancel methods) that all subsequent mission features depend on.
See `docs/features/037-mission-foundation.md` for the full spec.

---

### 038 · Mission Board Live

Replace the hardcoded `MissionBoardScene` placeholder with live generated missions (TTL-cached in `Game`). Add `MissionDetailScene` with full mission info, cargo check, and ACCEPT/BACK navigation. Accepted missions are removed from the board.
See `docs/features/038-mission-board-live.md` for the full spec.

---

### 039 · Global Menu Shell

Wire the dormant `[M] MENU` chrome button (and new `MENU` game action) to open a new `GlobalMenuScene`. The menu is a flat, extensible list of entries — no tabs. Starts empty; subsequent features add their own entries. Establishes the save/restore flow for returning to the game after closing the menu.
See `docs/features/039-global-menu-shell.md` for the full spec.

---

### 040 · Global Menu · Mission Log

Add a `MISSIONS` entry to the global menu that opens a dedicated Mission Log screen. Lists active missions with status sub-lines and allows cancellation via a `ModalConfirmDialog`. Depends on feature 039.
See `docs/features/040-global-menu-mission-log.md` for the full spec.

---

### 041 · Station Mission Actions

Add COLLECT and DELIVER mission items to `StationMenuScene` (above normal options, with a separator). Show mission items distinctly in `CargoScene` (bright-yellow, separate section). Complete deliveries with a reward modal.
See `docs/features/041-station-mission-actions.md` for the full spec.

---

### 043 · Knowledge Base — Discovery

The game silently records visited systems and destinations as the player travels. On entering a system the names of its destinations and direct jump-route neighbours are noted. On docking, the destination is marked fully visited. NPC mention hooks are defined for future use. Data only — no UI screens.
See `docs/features/043-knowledge-base-discovery.md` for the full spec.

---

### 044 · Knowledge Base — Screens

A three-level navigable reference accessible from the global menu: System List → System Detail → Destination Detail. Visited places show full records; known-only places show name with an UNCHARTED label and cannot be navigated into. Depends on features 039 and 043.
See `docs/features/044-knowledge-base-screens.md` for the full spec.

---

### 045 · Global Menu · Galaxy Map

Add a `GALAXY MAP` entry to the global menu (below `MISSIONS`) that opens `GalaxyMapScene`. The entry is always present. When opened from the menu, a `[2] GAME` footer button returns directly to the underlying game scene; `[1] BACK` returns to the global menu. The travel-menu access path is unchanged. Depends on feature 039.
See `docs/features/045-global-menu-galaxy-map.md` for the full spec.

---


## NEEDS SPEC

### 042 · Mission Flavour Text

Mission `description` text is assembled from world-data components: sentence fragments for job types, item/commodity names, destination flavour, and NPC voice. The fragment lists live in `docs/world/` and are loaded into `WorldData`. `MissionGenerator` picks and concatenates fragments based on mission type, replacing the placeholder prose strings added in feature 037. Full spec to be written.

---

## IN PROGRESS

_(none)_

---

## DONE

See [BACKLOG_HISTORY.md](BACKLOG_HISTORY.md) for all completed items.
