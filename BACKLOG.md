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


### 054 · Hull Integrity

Hull integrity tracking on `PlayerState` (0.0–1.0, serialised, backfilled on load);
`applyHullDamage(fraction)` as the sole write path; `HULL: XX%` display in `ShipScene`
(colour by threshold). No callers yet — this is pure state and display.
See `docs/features/054-hull-integrity-minigame-hook.md` for the full spec.

---

### 058 · Mini-Game Landing Hook

`GameBalance.miniGames` top-level balance keys (`maxHullDamageFraction`,
`abandonDamageFraction`, `noDamageThreshold`); `difficultyMultiplier` on `Destination`;
`goToLandOrDock` routes through `miniGameRegistry` by `locationType` (falls back to
animation scene when no game registered); damage formula applied on `complete`;
`LandingResultScene` shown before station. Depends on features 048 and 054.
See `docs/features/058-mini-game-landing-hook.md` for the full spec.

---

### 055 · Docking Mini-Game (Orbital Alignment)

Crosshair alignment game for `'orbital'` and `'deep-space'` destinations. 32×18 centred
canvas; momentum-based ship crosshair; slowly drifting airlock target seeded from
destination ID; 30-second countdown; score by distance at expiry.
See `docs/features/055-docking-mini-game.md` for the full spec.

---

### 056 · Planet Landing Mini-Game

Side-on descent for `'surface'` destinations. Gravity, air resistance, seeded terrain with
flat landing pad; score by speed and pad accuracy; introduces shared landing helpers in
`src/game/mini-games/landing/` for reuse by feature 057.
See `docs/features/056-planet-landing-mini-game.md` for the full spec.

---

### 057 · Asteroid Landing Mini-Game

Side-on descent for `'asteroid'` destinations. No gravity, no air resistance; jagged
seeded terrain; reuses physics updater and terrain helpers from feature 056 with different
parameters and visual style.
See `docs/features/057-asteroid-landing-mini-game.md` for the full spec.

---

### 059 · Space Navigation Mini-Game

Momentum-based obstacle-avoidance mini-game: player pilots a ship through a scrolling
field of drifting objects (asteroids, debris, or storm particles) covering a fixed
distance. Full-viewport canvas; arrow-key momentum model with forward-speed floor; three
event-type variants; binary score (100 = clear, 0 = collision); balance params under
`GameBalance.miniGames.navigation`. Depends on features 048 and 049.
See `docs/features/059-space-navigation-mini-game.md` for the full spec.

---

### 060 · Navigation Encounter Trigger

Post-jump random encounter hook: ~30% chance per jump triggers a story screen
(`NavigationEncounterScene`) then the navigation mini-game; difficulty derived from system
`danger_level`; hull damage applied via the Feature 058 formula on collision or
cancellation; `LandingResultScene` shown before arrival. Depends on features 054, 058,
and 059.
See `docs/features/060-navigation-encounter-trigger.md` for the full spec.

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
