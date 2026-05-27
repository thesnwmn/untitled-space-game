# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.
Completed items are in [BACKLOG_HISTORY.md](BACKLOG_HISTORY.md).

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)

---

## READY

### 043 · Knowledge Base — Discovery

The game silently records visited systems and destinations as the player travels. On entering a system the names of its destinations and direct jump-route neighbours are noted. On docking, the destination is marked fully visited. NPC mention hooks are defined for future use. Data only — no UI screens.
See `docs/features/043-knowledge-base-discovery.md` for the full spec.

---

### 044 · Knowledge Base — Screens

A three-level navigable reference accessible from the global menu: System List → System Detail → Destination Detail. Visited places show full records; known-only places show name with an UNCHARTED label and cannot be navigated into. Depends on features 039 and 043.
See `docs/features/044-knowledge-base-screens.md` for the full spec.

---

### 068 · Ship Upgrade Infrastructure & SHIP Screen

Establishes the world-data schema and PlayerState foundation for ship upgrades. Adds a `SHIP`
entry to the global menu that opens `ShipUpgradesScene`, listing all installed upgrades as
togglable ON/OFF rows. Starts with no upgrades purchasable (added by Feature 069).
See `docs/features/068-ship-upgrade-infrastructure.md` for the full spec.

---

### 069 · Ship Dealer Upgrades & Landing & Docking Computers

Adds two purchasable autopilot upgrades at destinations with `ship_dealer: true`: a `Docking Computer`
that bypasses orbital/deep-space docking (animation only), and a `Landing Computer` that bypasses
surface and asteroid landings (both animation and mini-game). Depends on Feature 068.
See `docs/features/069-ship-dealer-docking-computer.md` for the full spec.

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
