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
