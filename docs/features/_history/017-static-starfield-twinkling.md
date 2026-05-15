# 017 · Static Starfield with Twinkling — DONE

## What it added
Replaced the scrolling parallax starfield (from feature 012) with stationary stars that pulse through dim/normal/bright states using a sinusoidal brightness cycle. Each star has a `twinklePhase` and `twinklePeriod` (LCG-assigned per layer range) that advance continuously each frame. Layer 0 stars become invisible during their dim phase; layer 2 stars cycle fastest.

## Key files
- `src/game/scenes/Starfield.ts` — `Star` interface updated (removed `y`, `twinkleTimer`, `twinkled`; added `row`, `twinklePhase`, `twinklePeriod`); `update()` advances phase; `render()` maps `sin(phase)` to three brightness states
- `src/game/scenes/Starfield.test.ts` — scroll/wrap tests removed; phase-advance and brightness-state tests added

## Architectural decisions embedded
- `twinklePhase` advances continuously with no explicit wrap — `sin` is periodic so no modulo is needed.
- Brightness is a three-state mapping (`b ≥ 0.5` = bright, `-0.5 ≤ b < 0.5` = normal, `b < -0.5` = dim) rather than a binary flash.
- Layer 0 dim state renders nothing (cell stays background), producing natural cosmic flicker.
- `SpaceStation`, `ShipScene`, and `station-types.ts` are untouched by this change.
