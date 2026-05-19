# 057 · Asteroid Landing Mini-Game — DONE

## What it added

Implemented the asteroid landing mini-game for `locationType: 'asteroid'` destinations.
The scene reuses the physics engine and terrain infrastructure from feature 056 (shared
helpers in `src/game/mini-games/landing/`) with distinct parameters: zero gravity (player
must thrust actively), no air resistance (velocity persists until opposed), and
asteroid-specific balance config. The 3×2 ship sprite descends from top-centre; terrain
is seeded per destination ID with jagged `/\^` silhouette and `▪` fill. Landing on the
flat `[====]` pad scores higher. MENU key aborts with `skipped` outcome. Registered in
the mini-game registry and routed via the existing game.ts logic.

## Key files

- `src/game/scenes/asteroid-landing-mini-game-scene.ts` — scene class (274 lines)
- `src/game/scenes/asteroid-landing-mini-game-scene.test.ts` — 14 tests
- `src/game/mini-games/landing/terrain.ts` — enhanced `renderTerrain()` for varied asteroid visuals
- `src/game/mini-games/registry.ts` — added descriptor and factory
- `src/game/world/types.ts` — added `asteroid` balance config
- `src/game/world/world-parser.ts` — added balance parsing
- `src/game/game.test.ts` — updated routing test

## Architectural decisions embedded

- Physics updater is parameterised: `gravity: 0` disables gravitational pull,
  `airResistance: 1.0` prevents velocity decay
- Terrain renderer distinguishes asteroid from planet via character selection:
  asteroids use `/\^` for jagged top, `▪` for fill; planets use `^` and `#`
