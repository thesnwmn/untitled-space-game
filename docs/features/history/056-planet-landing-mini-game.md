# 056 · Planet Landing Mini-Game — DONE

## What it added
Added `SurfaceLandingMiniGameScene` for `locationType: 'surface'` destinations: a side-on
descent where the player counters gravity and air resistance to land on a seeded terrain pad.
Terrain is generated deterministically per destination ID (FNV-1a + LCG); the pad is rendered
as `[====]` in bright-yellow. Score interpolates between `maxSafeSpeed` (100) and `crashSpeed`
(0) with `offPadScoreMultiplier` applied when landing off the pad. Shared landing helpers in
`src/game/mini-games/landing/` (physics, terrain, types) are parameterised for reuse by
feature 057 (Asteroid Landing).

## Key files
- `src/game/mini-games/landing/types.ts` — shared types for terrain and physics
- `src/game/mini-games/landing/physics.ts` — `updatePhysics()` with gravity, air resistance, clamping
- `src/game/mini-games/landing/terrain.ts` — `generateTerrain()`, `detectCollision()`, `renderTerrain()`
- `src/game/scenes/surface-landing-mini-game-scene.ts` — scene extending `BaseMiniGameScene`
- `src/game/scenes/surface-landing-mini-game-scene.test.ts` — 15 tests
- `src/game/mini-games/registry.ts` — `'surface-landing'` entry
- `src/game/world/types.ts` — `surface` sub-object added to `GameBalance.miniGames`
- `src/game/world/world-parser.ts` — defaults and parsing for surface balance params

## Architectural decisions embedded
- Landing helpers are style-parameterised (`'planet' | 'asteroid'`); feature 057 reuses them
  by passing `gravity: 0, airResistance: 1` to get zero-gravity asteroid behaviour.
- `surface` balance params are typed explicitly inside the `miniGames` index-signature object
  because all named property types are assignable to `unknown`.
