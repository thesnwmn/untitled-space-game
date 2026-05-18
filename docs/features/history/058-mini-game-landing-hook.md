# 058 · Mini-Game Landing Hook — DONE

## What it added
Added `GameBalance.miniGames` top-level section (`maxHullDamageFraction`, `abandonDamageFraction`,
`noDamageThreshold`) to the type system, world parser, and `balance.md`. Added
`Destination.difficultyMultiplier?: number` for per-destination damage scaling. Rewired
`goToLandOrDock()` in `Game` to consult `miniGameRegistry` by locationType; when a matching
entry is found the mini-game runs and its result feeds a damage formula; when no entry is found
the original animation scene plays unchanged. `LandingResultScene` (3 s, advances on keypress)
is shown after every mini-game before the station opens.

## Key files
- `src/game/world/types.ts` — `GameBalance.miniGames` section, `Destination.difficultyMultiplier`
- `src/game/world/world-parser.ts` — DEFAULT_BALANCE.miniGames, parseBalance, parseDestination
- `docs/world/settings/balance.md` — mini_games YAML block
- `src/game/game.ts` — `computeMiniGameDamage`, `getMiniGameOutcomeLabel`, updated `goToLandOrDock`
- `src/game/scenes/landing-result-scene.ts` — new scene extending BaseTransitionScene
- `src/game/mini-game-damage.test.ts` — damage formula and label tests
- `src/game/scenes/landing-result-scene.test.ts` — scene render and timing tests

## Architectural decisions embedded
- Registry lookup uses `meta.id === registryKey` (not locationType directly) so the mapping
  table in `LOCATION_TYPE_TO_REGISTRY_KEY` is the single source of truth for routing.
- `LandingResultScene` manipulates the protected `elapsed` field inherited from
  `BaseTransitionScene` to trigger early completion on keypress, keeping the timing logic
  in one place.
