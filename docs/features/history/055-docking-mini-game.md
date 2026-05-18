# 055 · Docking Mini-Game (Orbital Alignment) — DONE

## What it added

A real-time alignment mini-game for orbital and deep-space docking. Players hold a momentum-based ship crosshair within a slowly-drifting airlock target before a 30-second countdown expires. Score is calculated from the final Euclidean distance between ship and airlock: distance 0 yields score 100, and score approaches 0 at large distances via the formula `round(clamp(1/(1+distance/3))*100)`. MENU aborts with zero score and abort damage.

## Key files

- `src/game/scenes/docking-mini-game-scene.ts` — main scene class (254 lines); momentum physics, seeded airlock drift, score calculation
- `src/game/mini-games/registry.ts` — added descriptor and factory entry for docking variants (orbital, deep-space)
- `src/game/game.test.ts` — updated orbital docking test to use `DockingMiniGameScene`

## Architectural decisions embedded

- Seeded LCG PRNG ensures consistent drift pattern per destination, making the game fair and reproducible.
- Momentum-based physics (no passive drag) lets players use counter-thrust to control position, increasing skill expression.
- Distance-based score rewards precision without requiring extreme speed; gentle airlock drift prevents cheesing.
