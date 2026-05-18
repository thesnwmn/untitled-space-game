# 025 · Overhaul Star Field & Destination Display — DONE

## What it added
Every destination now has a unique, stable visual identity in the cockpit viewport.
`hashStringToSeed` (FNV-1a) derives a deterministic seed from `player.destinationId`;
`ShipCockpitScene` uses this seed to initialise `Starfield` and to pick a variant from
three per-category glyph catalogues (`STATION_GLYPHS`, `ASTEROID_GLYPHS`, `PLANET_GLYPHS`).
A `SpaceStation` object is lazily created on first render and displayed with the existing
figure-8 drift; nothing is rendered when the player is in open space.

## Key files
- `src/game/scenes/starfield.ts` — added exported `hashStringToSeed`
- `src/game/scenes/station-types.ts` — added three glyph catalogues and `selectDestinationGlyph`
- `src/game/scenes/space-station.ts` — constructor now takes `StationGlyph` directly
- `src/game/scenes/ship-cockpit-scene.ts` — seed from hash, lazy destination object, no `starfieldSeed` param

## Architectural decisions embedded
- Seed management lives entirely inside `ShipCockpitScene`; no orchestrator state needed.
- `SpaceStation` is lazily initialised on the first `renderContent` call so that viewport
  bounds (which depend on buffer height) are known before the anchor position is calculated.
