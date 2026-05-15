# 012 · Animated Starfield & Space Station View — DONE

## What it added
Overhauled `ShipScene`'s viewport with a three-layer parallax scrolling starfield (`.` / `*` / `+` at increasing speeds), a cockpit-window ASCII border, and a gently drifting space station (Lissajous sinusoidal path). Introduced `Starfield`, `SpaceStation`, and `station-types.ts` as separate classes. Stars used an LCG seeded at 42 for reproducibility and a one-frame twinkle flash.

## Key files
- `src/game/scenes/Starfield.ts` — starfield with 33 stars across 3 layers, LCG seeded
- `src/game/scenes/SpaceStation.ts` — station drift on Lissajous path with clamped bounds
- `src/game/scenes/station-types.ts` — BEACON, RELAY, RING, HUB glyph catalogue
- `src/game/scenes/ShipScene.ts` — updated layout constants, window border, wiring

## Architectural decisions embedded
- `Starfield.render()` receives interior bounds at call time (not constructor) for reusability across different buffer sizes.
- `SpaceStation` receives interior bounds at construction; stores anchor and computes drift via `Math.sin` — no shared PRNG needed.
- Station glyphs skip space characters when rendering, compositing onto the starfield without overwriting the background.
- Initial default station type is RELAY; `station-types.ts` is the extension point for future types.
