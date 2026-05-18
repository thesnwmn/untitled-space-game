# 045 · Global Menu · Galaxy Map — DONE

## What it added

Added a `GALAXY MAP` entry to the global menu, making the star chart accessible from anywhere in the game. When opened from the menu, the scene includes both a `[1] BACK` button (return to menu) and `[2] GAME` button (return to underlying game scene). The existing travel menu access path is unaffected.

## Key files

- `src/game/scenes/galaxy-map-scene.ts` — optional `onGame` callback parameter; dynamic nav option injection
- `src/game/game.ts` — `GALAXY MAP` menu entry; `goToGalaxyMapFromMenu()` method with proper callback routing
- `src/game/scenes/galaxy-map-scene.test.ts` — test coverage for nav option presence, action routing, and tap handling

## Architectural decisions embedded

- Scene callback pattern extended: `onGame` follows the existing `onBack`/`onMenu` pattern, allowing scenes to be reachable via multiple paths with different return targets.
- Nav options are assembled at scene construction time based on parameter presence, rather than at render time.
