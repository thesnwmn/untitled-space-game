# Feature 025 · Overhaul Star Field & Destination Display

## Goal

Give every destination a unique, stable visual identity in the cockpit view: a starfield pattern derived deterministically from the destination ID, and a type-appropriate foreground object (space station, asteroid, or planet) with variant also selected by destination ID.

---

## Acceptance criteria

- The starfield seed is derived deterministically from `player.destinationId` — visiting the same destination always produces the same star pattern
- When `player.destinationId` is null (in open space), the starfield uses a fixed fallback seed producing a consistent open-space pattern
- A destination object is rendered in the starfield viewport whenever `destinationId` is non-null
- Object category is determined by `locationType`: `orbital` or `deep-space` → space station; `asteroid` → asteroid; `surface` → planet
- At least 3 predefined ASCII art variants exist per category; the active variant is chosen from the destination ID so different destinations of the same category look different
- The destination object drifts slowly within the viewport (same figure-8 drift the current `SpaceStation` uses)
- No orchestrator-level seed state is present — `game.ts` requires no seed management
- When in open space, no destination object is rendered
- The `starfieldSeed` constructor parameter is not present on `ShipCockpitScene`

---

## Out of scope

- Animated objects beyond the existing drift
- Per-variant colour variation within asteroid or station categories (colour is fixed per category)
- Objects in landing/take-off animation scenes

---

## Technical notes

### Seed derivation

Export a pure function `hashStringToSeed(s: string): number` from `src/game/scenes/starfield.ts`. Returns a stable non-zero 32-bit unsigned integer for any non-empty input, and a fixed non-zero fallback for empty string. FNV-1a or djb2 are both acceptable; must be deterministic across all runtimes.

`ShipCockpitScene` derives the starfield seed as `hashStringToSeed(player.destinationId ?? '')`. The variant index for the destination object is `hashStringToSeed(destinationId) % variantCount`, where `variantCount` is the number of variants for that category.

### ShipCockpitScene changes

The constructor has no `starfieldSeed` parameter — the seed is computed internally. All other constructor parameters are unchanged. Replace the hardcoded `new Starfield(42)` from feature 036 with `new Starfield(hashStringToSeed(player.destinationId ?? ''))`.

### Destination glyph catalogue

`space-station.ts` and `station-types.ts` become dead code after feature 036 (their only consumer, `ShipScene`, is deleted). This feature revives and extends them — the Engineer may rename the files or keep them. The catalogue must cover three categories keyed by `LocationType` bucket:

**Station** (`orbital` / `deep-space`) — colour `cyan` or `bright-white`. The existing BEACON, RELAY, RING, HUB glyphs are good starting material; add or replace variants to reach at least 3.

**Asteroid** (`asteroid`) — colour `yellow`. At least 3 variants. Suggest jagged irregular shapes.

> suggestion:
> ```
>  /\/\
> < oo >
>  \__/
> ```

**Planet** (`surface`) — at least 3 variants, with a distinct per-variant colour to hint at world type (e.g. `blue` ocean world, `bright-yellow` desert, `bright-cyan` gas giant). Roughly circular shapes.

> suggestion:
> ```
>   .--.
>  / .. \
> | .... |
>  \ .. /
>   `--'
> ```

All objects must fit within approximately 5 rows × 11 cols so they sit comfortably inside the cockpit crosshair's inner space (≈ ±2 rows × ±5 cols from the crosshair centre).

### DestinationObject

Rename `SpaceStation` to `DestinationObject` (and its file accordingly), or keep the existing name and file — Engineer's choice. The drift animation and render logic are unchanged. Constructor accepts a glyph definition (rows + colour) and the viewport bounds, same as today.

### Render order in the starfield viewport

1. `Starfield.render()` — background stars
2. `DestinationObject.render()` — overwrites stars behind the glyph
3. HUD overlay text (top row of viewport)
4. Crosshair glyphs (centre `╋` and four corner brackets, drawn over everything)

### Tests

- `hashStringToSeed` returns identical values for the same input across multiple calls
- `hashStringToSeed` returns different values for at least 3 distinct destination-like string pairs
- `DestinationObject` (or equivalent) selects the correct category for each `LocationType`

---

## Play-test instructions

### Browser (`npm run dev`)

1. Undock from a station — confirm a destination object appears in the starfield viewport
2. Dock and undock again — confirm the star pattern and object are identical to step 1
3. Navigate to the main menu, then travel to a different destination — confirm a different star pattern and (if the destination is a different `locationType`) a different object type
4. Travel to two different `orbital` destinations — confirm the star patterns differ and the station variant may differ
5. Fly into open space — confirm no destination object is rendered

### Terminal (`npm run terminal`)

Repeat all five steps using keyboard navigation.

---

## Dependencies

Feature 036 (Cockpit Ship View)
