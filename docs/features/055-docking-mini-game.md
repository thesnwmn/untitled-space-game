# Feature 055 · Docking Mini-Game (Orbital Alignment)

## Goal

Implement the docking mini-game for orbital and deep-space stations: a real-time alignment
challenge where the player must hold a ship crosshair within the station airlock marker
before a countdown expires.

---

## Acceptance criteria

- Mini-game registered in `miniGameRegistry` with `id: 'docking'`; corresponding entry in
  `miniGameDescriptors`
- Used for `locationType: 'orbital'` and `'deep-space'` via the routing in feature 054
- A centred canvas (32 cols × 18 rows) is declared; `BaseMiniGameScene` centres it in the
  content area
- The airlock target `[+]` is displayed at or near canvas centre initially
- The ship crosshair `(+)` is displayed at the player's current position, starting at
  canvas centre
- UP/DOWN/LEFT/RIGHT fire thrusters; each held direction adds `thrustForce` velocity per
  second in that axis; velocity is capped per axis at `maxVelocity`; **no passive drag** —
  velocity persists until the player counter-thrusts
- The crosshair position is clamped to remain fully within the canvas boundary
- The airlock marker drifts: on a timer averaging `driftIntervalMs` (±20% jitter), a new
  drift target is chosen within `driftMaxDistanceChars` of canvas centre; the airlock moves
  toward it at `driftSpeedCharsPerSec`; on arrival the timer resets; the drift target is
  seeded from the destination ID so the same station always drifts identically within a
  session
- A countdown timer displays `countdownSeconds` ticking down to 0 (1-second precision)
- When the countdown reaches 0: compute `distance` as the Euclidean char distance between
  ship and airlock; compute `score = Math.round(clamp(0, 1, 1 / (1 + distance /
  perfectRadiusChars)) * 100)` (integer 0–100); call
  `complete({ outcome: 'completed', result: { score } })`
- If MENU is pressed during play: call `complete({ outcome: 'skipped' })` immediately,
  without showing a game-over state inside the mini-game
- Registered with two variants: `orbital` and `deep-space` (for dev harness)
- Playable via dev harness (`?game=docking`); result displays correctly in harness overlay
- `npm test` passes; `npx tsc --noEmit` produces zero errors
- Tests: score = 100 when distance = 0; score decreases as distance increases; score = 0
  at very large distance; `complete()` not called twice; MENU → `{ outcome: 'skipped' }`

---

## Out of scope

- Passive drag on the ship crosshair
- Representation of the station exterior
- Background star field inside the mini-game canvas
- Varying airlock size by station type or destination

---

## Technical notes

### Coordinate system

Ship and airlock positions are floating-point offsets from canvas centre (x-right, y-down
in chars). Update each frame:
1. For each held directional action, add `thrustForce * dt` to the corresponding velocity
   component
2. Clamp each velocity component to `[-maxVelocity, +maxVelocity]`
3. Add `velocity * dt` to position
4. Clamp position so the rendered crosshair stays within the canvas bounds

### Input — key-held pattern

Track which directional actions are currently held using key-down / key-up events. Apply
thrust on every `update` call while the direction is held. The Engineer should check how
other scenes handle continuous input and match that pattern.

### Airlock drift

Private state: `driftTarget: { x, y }`, `driftTimer: number`. On each update, move the
airlock toward `driftTarget` at `driftSpeedCharsPerSec * dt`. When the airlock reaches
`driftTarget` (within 0.1 chars), pick a new target: use the seeded PRNG (seeded from
destination ID at construction) to choose a random offset within `driftMaxDistanceChars`
of canvas centre; reset the timer with `driftIntervalMs × (0.8 + 0.4 × random)`.

The drift applies gentle pressure on the player without requiring rapid reaction. The
`driftSpeedCharsPerSec` balance value should be slow enough that the player can track it
with steady thrust.

### Score formula

```
rawScore = clamp(0, 1, 1 / (1 + distance / perfectRadiusChars))
score    = Math.round(rawScore * 100)   // integer 0–100
```

`perfectRadiusChars` is the distance at which rawScore ≈ 0.5. Distance 0 → score 100.
Distance `perfectRadiusChars` → score ≈ 50. Distance large → score → 0.

### Rendering

> suggestion: A plain `+`/`-`/`|` border around the canvas. Countdown in the top-right
> corner inside the canvas (`T: 28`). Airlock target in bright-yellow; ship crosshair in
> bright-green. Distance readout in the bottom-left (`DIST: 2.4`). Empty space inside the
> canvas is blank (not filled with characters).

### Registration

Append to both registry arrays in `src/game/mini-games/registry.ts`. The `id` must be
`'docking'`. Variants:
```
[
  { id: 'orbital',    label: 'Orbital Station', params: { locationType: 'orbital' } },
  { id: 'deep-space', label: 'Deep Space',       params: { locationType: 'deep-space' } }
]
```

---

## Play-test instructions

### Browser (`npm run dev:mini-games`)

1. Navigate to `?game=docking` — confirm the canvas, airlock `[+]`, and crosshair `(+)`
   appear; countdown starts immediately.
2. Press and hold arrow keys — confirm the crosshair moves with momentum; releasing a key
   does not stop movement.
3. Counter-thrust to stop the crosshair — confirm it holds position.
4. Watch for 10–15 s — confirm the airlock drifts slowly and resets.
5. Wait for the countdown to reach 0 — confirm `complete()` fires; result overlay shows.
6. Start again, immediately press MENU — confirm the game ends with `skipped` outcome.

### Browser (full game, `npm run dev`)

1. Dock at an orbital station — confirm the docking mini-game plays in place of the
   animation; result scene shows outcome label, score %, and hull damage; station opens.
2. Press MENU during the mini-game — confirm abort damage applies; result scene shows
   `ABORTED`; station opens.

### Terminal (`npm run terminal`)

Repeat full game steps using keyboard navigation.

---

## Dependencies

Feature 058 (Mini-Game Landing Hook), Feature 049 (Mini-Game Dev Harness)
