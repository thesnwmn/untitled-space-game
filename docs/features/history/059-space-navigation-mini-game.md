# 059 · Space Navigation Mini-Game — DONE

## What it added

A momentum-based obstacle-avoidance mini-game where the player pilots a ship through a scrolling field of drifting objects (asteroids, debris, or storm particles) covering a fixed distance. Full-viewport canvas with arrow-key momentum input (impulse-based, with opposite-direction velocity cancellation), per-character collision detection, and binary scoring (100 for success, 0 for collision).

## Key files

- `src/game/mini-games/navigation-mini-game.ts` — 520-line scene class with physics model, spawning strategy, collision detection, and rendering
- `src/game/mini-games/navigation-mini-game.test.ts` — 11 tests covering momentum model, driftVy enforcement, collision, HUD exclusion, despawn, and completion
- `src/game/mini-games/registry.ts` — three descriptor variants registered (asteroid_belt, space_debris, space_storm)
- `src/game/world/types.ts` — NavigationDifficulty, NavigationEventType, NavigationBalance types
- `src/game/world/world-parser.ts` — parseNavigationBalance() function and default config integration
- `docs/world/settings/balance.md` — navigation_minigame section with ship and per-difficulty parameters

## Architectural decisions embedded

- Momentum model uses per-axis velocity with opposite-direction cancellation; player can press DOWN to reduce forward velocity but world advances at minimum minScrollSpeed
- Two-tier obstacle spawning: lead-spawn fills bands ahead of viewport to target density; edge-spawn periodically introduces obstacles from sides
- All balance parameters (acceleration, max speeds, obstacle density, spawn intervals, size ratios) are configurable per difficulty and event type via YAML
- HUD row exclusion prevents collision and rendering of obstacles in the top row (reserved for progress bar)
- Seeded PRNG (LCG) ensures reproducible obstacle layouts per destination within a session
