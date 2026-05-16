# 036 · Cockpit Ship View — DONE

## What it added

Replaced the old framed ship view with a full cockpit display divided into six horizontal zones: screen chrome header, a two-row gauge strip (fuel/cargo left, shields/hull right, button clusters between), a borderless starfield viewport with HUD overlay and floating crosshair, a five-row bottom section containing TRAVEL and DOCK word buttons flanking a dark radar block with drifting contacts and edge arrow indicators, a scrolling info/comms ticker, and a screen chrome footer separator.

`ShipCockpitScene` accepts the same public constructor signature as the deleted `ShipScene`, so the only orchestrator change was an import swap in `game.ts`.

## Key files

- `src/game/scenes/ship-cockpit-scene.ts` — new scene class (ShipCockpitScene)
- `src/game/scenes/ship-cockpit-scene.test.ts` — 48 tests
- `src/game/game.ts` — import swapped to ShipCockpitScene
- `src/game/scenes/ship-scene.ts` — deleted
- `src/game/scenes/ship-scene.test.ts` — deleted

## Architectural decisions embedded

- Starfield seed is fixed at 42 for this feature; feature 025 will replace it with deterministic seeding from `player.destinationId`.
- Shield and hull gauges are hardcoded to 1.0 (full) pending player stat additions in a later feature.
- All animation (button flicker, radar drift, ticker scroll) is driven by the `dt` argument in `update()` — no `setTimeout` or `Date.now()` calls.
