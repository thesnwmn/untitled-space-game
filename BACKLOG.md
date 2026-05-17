# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.
Completed items are in [BACKLOG_HISTORY.md](BACKLOG_HISTORY.md).

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)

---

## READY

### 047 · Game Balance Settings

All hardcoded gameplay constants (NPC name probability, mission counts and reward ranges, trader stock quantities, cache TTLs, fuel economics) move into `docs/world/settings/balance.md`. `docs/world/game-settings.md` is renamed to `docs/world/settings/new-game.md`. A new `GameBalance` type is added to `types.ts`, parsed by `world-parser.ts`, and exposed via `getGameBalance()` in `world-data.ts`. `constants.ts` is deleted; `mission-generator.ts` and `game.ts` read all balance values from `getGameBalance()`.
See `docs/features/047-game-balance-settings.md` for the full spec.

---

### 050 · Reputation — Foundation (Data & UI)

Faction relationships (rivals, allies) are added to world data. Destinations gain an optional `owning_faction` field. `PlayerState` stores a per-faction reputation score. A `reputation-utils.ts` module provides level computation and labels. A `ReputationScene` is added to the global menu. `StationMenuScene` displays the owning faction when present. Depends on features 046 and 047.
See `docs/features/050-reputation-foundation.md` for the full spec.

---

### 051 · Reputation — Mission Integration

Missions at faction-owned destinations carry a `giverFactionId`. Completing a mission applies a rep delta to the giving faction, half that delta to its allies, and negative half to its rivals. `MissionDetailScene` shows a REPUTATION IMPACT section with SMALL / MEDIUM / LARGE labels. Depends on feature 050.
See `docs/features/051-reputation-missions.md` for the full spec.

---

### 052 · Reputation — Trade Effects

Trade prices at faction-owned stations are modified by the player's standing with that faction. Buying goods accrues a small rep gain per credit spent, capped per docking visit. `TraderScene` displays the current standing label when a faction is identified. Depends on feature 050.
See `docs/features/052-reputation-trade.md` for the full spec.

---

### 025 · Overhaul Star Field & Destination Display

Each destination has a unique, stable starfield pattern derived deterministically from its ID (no orchestrator seed state needed). A type-appropriate foreground object — space station, asteroid, or planet — is rendered in the viewport with variant also selected by destination ID. Depends on feature 036.
See `docs/features/025-overhaul-star-field-display.md` for the full spec.

---

### 045 · Global Menu · Galaxy Map

Add a `GALAXY MAP` entry to the global menu (below `MISSIONS`) that opens `GalaxyMapScene`. The entry is always present. When opened from the menu, a `[2] GAME` footer button returns directly to the underlying game scene; `[1] BACK` returns to the global menu. The travel-menu access path is unchanged. Depends on feature 039.
See `docs/features/045-global-menu-galaxy-map.md` for the full spec.

---

### 048 · Mini-Game Base Scene

`BaseMiniGameScene` abstract class extending `BaseScene`, providing standard screen chrome,
optional viewport centering (for mini games smaller than the full content area), result
reporting via a typed `MiniGameResult` callback, and read-only `PlayerState` access. Includes
`miniGameDescriptors` (pure-data registry) and `miniGameRegistry` (with factory functions)
in `src/game/mini-games/registry.ts`. Both registries start empty. Depends on feature 046.
See `docs/features/048-mini-game-base-scene.md` for the full spec.

---

### 049 · Mini-Game Dev Harness

Standalone browser and terminal entry points for running any registered mini game outside
the main game. Browser: `mini-games.html` + `src/mini-game-runner.ts` built via a second
Vite config (`base: /untitled-space-game/mini-games/`); index mode lists all mini games,
runner mode launches by `?game=<id>`. Terminal: `terminal-mini-games.ts` lists games when
run with no args; runs a specific game by id with optional `--variant=<id>` flag. Both use
a mock `PlayerState`. Adds `dev:mini-games` and `build:mini-games` scripts; `build:all`
updated. Depends on feature 048.
See `docs/features/049-mini-game-dev-harness.md` for the full spec.

---

### 043 · Knowledge Base — Discovery

The game silently records visited systems and destinations as the player travels. On entering a system the names of its destinations and direct jump-route neighbours are noted. On docking, the destination is marked fully visited. NPC mention hooks are defined for future use. Data only — no UI screens.
See `docs/features/043-knowledge-base-discovery.md` for the full spec.

---

### 044 · Knowledge Base — Screens

A three-level navigable reference accessible from the global menu: System List → System Detail → Destination Detail. Visited places show full records; known-only places show name with an UNCHARTED label and cannot be navigated into. Depends on features 039 and 043.
See `docs/features/044-knowledge-base-screens.md` for the full spec.

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
