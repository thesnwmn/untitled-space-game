# Feature 056 · Planet Landing Mini-Game

## Goal

Implement the landing mini-game for surface (planet) destinations: a side-on descent where
the player must counter gravity and air resistance to land gently on a marked pad.

---

## Acceptance criteria

- Mini-game registered with `id: 'surface-landing'`; corresponding `miniGameDescriptors`
  entry
- Used for `locationType: 'surface'` via the routing in feature 054
- Full content-area viewport (no canvas restriction — uses the full available area)
- A ship sprite (2–3 cols wide, 2 rows tall) appears at the top-centre of the viewport with
  a small initial downward velocity
- Terrain is rendered at the bottom of the viewport: an irregular ASCII contour 3–5 rows
  tall, generated deterministically from the destination ID
- The terrain contains exactly one flat **landing pad** (`[====]` or similar, at least 4
  chars wide) visually distinct from the surrounding terrain
- Gravity (`balance.miniGames.surface.gravityAccel`) continuously increases the ship's
  downward velocity each frame
- DOWN thrust adds additional downward acceleration; UP thrust subtracts from downward
  velocity (may reverse it)
- LEFT/RIGHT thrust adds horizontal velocity; horizontal velocity decays each frame by
  `airResistance` factor (frame-rate independent; see Technical notes)
- Horizontal velocity is capped at `thrustForce × 3` chars/s; vertical velocity is
  uncapped (gravity accumulates)
- The ship is clamped to stay within the horizontal bounds of the viewport
- Game ends when the ship's bounding box overlaps the topmost row of the terrain at its
  horizontal position
- On landing, compute:
  - `speedScore = clamp(0, 1, 1 - (speed - maxSafeSpeed) / (crashSpeed - maxSafeSpeed))`
    where `speed` = magnitude of velocity vector at impact
  - `padScore = 1.0` if the centre of the ship is over a pad column, else
    `offPadScoreMultiplier`
  - `score = speedScore * padScore`
- Call `complete({ outcome: score >= successThreshold ? 'success' : 'fail', data: { score,
  speed, onPad: boolean } })`
- If MENU is pressed: call `complete({ outcome: 'skipped', data: { score: 0 } })`
  immediately
- Terrain is identical every time for the same destination ID (same pad position and
  contour shape)
- The terrain visual style uses smooth/undulating chars appropriate for a planet surface
  (see Technical notes for suggestion)
- `npm test` passes; `npx tsc --noEmit` produces zero errors
- Tests: `score = 1.0` at `maxSafeSpeed` on pad; `score = offPadScoreMultiplier` at
  `maxSafeSpeed` off pad; `speedScore` → 0 as speed approaches `crashSpeed`; terrain
  generation reproducible for same seed; MENU → skipped

---

## Out of scope

- Multiple landing pads
- Atmospheric entry animation (ship appearing from off-screen)
- Fuel consumption during the mini-game
- A time limit (game ends only on terrain contact)
- Planet-specific art beyond the terrain seed variant

---

## Technical notes

### Shared landing helpers

This feature introduces shared physics and terrain helpers in
`src/game/mini-games/landing/` so that feature 057 (Asteroid Landing) can reuse them.
The Engineer should factor the following as parameterisable standalone functions or classes:

- **Physics updater**: accepts `{ vx, vy, x, y }` state plus a config object
  `{ gravity, airResistance, thrustForce, viewportWidth }` and a `dt`; returns updated
  state. Feature 056 passes real gravity and air resistance values; feature 057 passes 0
  and 1.0 respectively.
- **Terrain generator**: `generateTerrain(seed: string, width: number, height: number,
  padWidth: number, style: 'planet' | 'asteroid'): TerrainColumn[]` where each
  `TerrainColumn` has `{ surfaceRow: number, isPad: boolean }`. The `style` parameter
  controls character selection.
- **Terrain renderer**: draws `TerrainColumn[]` onto a `CharBuffer` region using
  style-appropriate chars.
- **Collision detector**: given ship bounding box and `TerrainColumn[]`, returns whether
  any ship column overlaps its terrain column.

The ship sprite shape and the score formula may also be extracted if they are identical
across both games.

### Physics update

Ship state: `{ x: number, y: number, vx: number, vy: number }` in floating-point char
coordinates. Each frame:
1. `vx *= airResistance ** dt` (frame-rate independent decay)
2. `vy += gravityAccel * dt`
3. Apply held thrust: `vx ± thrustForce * dt`, `vy ± thrustForce * dt`
4. Clamp `vx` to `[-thrustForce * 3, +thrustForce * 3]`
5. `x += vx * dt`; `y += vy * dt`
6. Clamp `x` so the ship stays within viewport width (accounting for sprite width)

### Terrain generation

Algorithm (suggestion): start with a flat baseline at a fixed height from the bottom. Use
the seeded PRNG to add gentle random height variation across columns (no sharp spikes).
Choose a contiguous run of `padWidth` columns (by seed) and flatten them to a consistent
height — these are the pad columns. Mark them `isPad: true`.

> suggestion for planet terrain chars: Top row of each non-pad column uses `^` or `~`;
> fill rows below use `#`. Pad top row: `=`; pad fill: `#`; pad visible as `[====]` by
> adding `[` at the left edge column and `]` at the right edge column.

The terrain height (rows from bottom) should leave at least half the viewport height as
open sky for the descent.

### Rendering

> suggestion: Sky rows are blank (empty). Ship sprite is bright-green (or dim if hull is
> low). Terrain rendered in white or `bright-black`. Pad in bright-yellow. Speed readout
> in the top-right: `SPD: 4.2`. A small indicator when speed exceeds `maxSafeSpeed` (e.g.
> `!! FAST` in yellow).

### Seeded PRNG

Use the same deterministic hash/PRNG approach already used elsewhere in the codebase for
seeded randomness. The Engineer should check the existing pattern and match it.

### Registration

Append to both registry arrays. `id: 'surface-landing'`. Variants:
```
[{ id: 'surface', label: 'Planet Surface', params: { locationType: 'surface' } }]
```

---

## Play-test instructions

### Browser (`npm run dev:mini-games`)

1. Navigate to `?game=surface-landing` — confirm terrain and ship appear; ship drifts down.
2. Let the ship fall with no input — confirm it accelerates and hits terrain; result shows
   low score.
3. Thrust UP to slow descent; land on pad gently — confirm score approaches 1.0.
4. Land fast on the pad — confirm low score.
5. Land gently off the pad — confirm `offPadScoreMultiplier` applied (score lower than
   equivalent on-pad landing).
6. Visit the same destination twice — confirm the terrain layout is identical.
7. Press MENU mid-game — confirm skipped outcome.

### Browser (full game, `npm run dev`)

1. Dock at a surface destination — confirm planet landing mini-game plays; result scene
   shows score and hull damage; station opens.

### Terminal (`npm run terminal`)

Repeat full game steps using keyboard navigation.

---

## Dependencies

Feature 054 (Hull Integrity & Mini-Game Landing Hook), Feature 049 (Mini-Game Dev Harness)
