# 060 · Navigation Encounter Trigger — DONE

## What it added
Post-jump random encounters triggering on ~30% of jumps. Shows a ship-cockpit overlay with
a 1.2-second incoming-signal animation (scrolling speaker bar), then typewriter dialog box
with encounter flavor text, then launches the navigation mini-game with difficulty derived
from destination system danger_level. Hull damage is applied using the Feature 058 formula
with a 1.25x multiplier for hard difficulty. Outcome labels (CLEAR, COLLISION, ABORTED)
and damage are displayed via LandingResultScene before normal arrival.

## Key files
- `src/game/scenes/navigation-encounter-scene.ts` — 251-line overlay scene with ship-cockpit background (starfield, gauges, HUD) and three-phase animation
- `src/game/scenes/navigation-encounter-scene.test.ts` — 6 tests covering phase transitions and character reveal timing
- `src/game/game.ts` — added maybeNavigationEncounter(), getDifficultyFromDangerLevel(), playNavigationMiniGame(), handleNavigationMiniGameResult() methods
- `src/game/world/types.ts` — added navigationEncounter sub-object to GameBalance
- `src/game/world/world-parser.ts` — added balance config parsing for navigation_encounter
- `docs/world/settings/balance.md` — added navigation_encounter section with encounter_chance_on_jump: 0.30

## Architectural decisions embedded
- Encounter type selection is fully random (equal weight); no weighting by system properties
- Difficulty multiplier is hardcoded (easy/normal=1.0, hard=1.25); not a balance key
- NavigationEncounterScene renders a static starfield snapshot seeded from player destination, preserving visual continuity without per-frame updates
- Three-phase animation (incoming 1200ms, typing ~40ms/char, complete) is self-advancing; no user input during incoming phase
- Input blocking suppresses TRAVEL, DOCK, CARGO, MENU, BACK in all phases; only skip/continue actions route
