# Feature 057 · Asteroid Landing Mini-Game

## Goal

Implement the landing mini-game for asteroid destinations: a side-on descent with no
gravity and no air resistance, where the player must manage all thrust manually to reach
the landing pad at safe speed.

---

## Acceptance criteria

- Mini-game registered with `id: 'asteroid-landing'`; corresponding `miniGameDescriptors`
  entry
- Used for `locationType: 'asteroid'` via the routing in feature 054
- Full content-area viewport
- Same ship sprite dimensions and shape as feature 056
- Asteroid terrain at the bottom: jagged, cratered aesthetic, generated deterministically
  from destination ID; contains exactly one flat landing pad (same `[====]` convention)
- **No gravity**: vertical velocity does not change unless the player thrusts
- **No air resistance**: horizontal velocity does not decay between frames
- Ship starts at top-centre with initial downward velocity
  `balance.miniGames.asteroid.initialDownwardVelocity`
- UP/DOWN/LEFT/RIGHT each apply `balance.miniGames.asteroid.thrustForce` acceleration in
  that axis per frame
- Score formula, collision detection, and game-end logic identical to feature 056 but
  using `asteroid.maxSafeSpeed`, `asteroid.crashSpeed`, `asteroid.successThreshold`, and
  `asteroid.offPadScoreMultiplier`
- `complete({ outcome: ..., data: { score, speed, onPad } })` and MENU → skipped, as in
  feature 056
- Terrain is identical every time for the same destination ID
- Asteroid terrain visual style is jagged/cratered and clearly distinct from the planet
  terrain in feature 056 (different char set; see Technical notes)
- Reuses the shared physics updater, terrain generator, terrain renderer, and collision
  detector introduced in feature 056 — no duplication
- `npm test` passes; `npx tsc --noEmit` produces zero errors
- Tests: no gravity applied (vy unchanged without thrust); no air resistance (vx unchanged
  without thrust); score formula identical to feature 056 with asteroid balance values;
  terrain reproducible for same seed

---

## Out of scope

- Micro-gravity effects or tumbling rotation
- Multiple landing pads
- Fuel consumption during the mini-game
- A time limit

---

## Technical notes

### Reuse from feature 056

Feature 057 uses the shared helpers from `src/game/mini-games/landing/` introduced in
feature 056. Differences are achieved by configuration:

- Pass `gravity: 0` and `airResistance: 1.0` to the physics updater (no decay, no
  gravitational pull)
- Pass `style: 'asteroid'` to the terrain generator for different char selection
- Use `balance.miniGames.asteroid.*` values throughout

The physics updater, terrain generator, renderer, and collision detector are used
unchanged; no new shared files are added by this feature.

### Asteroid terrain visual

> suggestion: Top row of each non-pad column alternates between `/`, `\`, and `^` chars
> based on column index (seeded) to produce a jagged silhouette. Fill rows below use `▪`
> or `░` for a cratered texture. Pad convention (`[====]`) unchanged for consistency with
> feature 056.

The overall height profile should be more erratic than the planet terrain — wider variance
in column heights, no smoothing pass.

### Physics

No changes to the physics updater. Passing `gravity: 0` means `vy` is not modified by
gravity. Passing `airResistance: 1.0` means `vx *= 1.0 ** dt = 1.0` — no decay.

The player must actively thrust in all directions to control velocity. The ship will drift
indefinitely at its current velocity unless thrust is applied.

### Registration

Append to both registry arrays. `id: 'asteroid-landing'`. Variants:
```
[{ id: 'asteroid', label: 'Asteroid Surface', params: { locationType: 'asteroid' } }]
```

---

## Play-test instructions

### Browser (`npm run dev:mini-games`)

1. Navigate to `?game=asteroid-landing` — confirm jagged terrain and ship appear; ship
   drifts slowly downward.
2. Apply no input — confirm the ship drifts at constant velocity (no acceleration).
3. Apply LEFT thrust, then release — confirm horizontal velocity persists with no decay.
4. Apply UP thrust to reverse downward drift; land gently on pad — confirm high score.
5. Let ship crash without braking — confirm low score / fail outcome.
6. Visit the same destination twice — confirm terrain layout is identical.
7. Compare terrain appearance to feature 056 — confirm visually distinct style.

### Browser (full game, `npm run dev`)

1. Dock at an asteroid destination — confirm asteroid landing mini-game plays; result scene
   shows score and hull damage; station opens.

### Terminal (`npm run terminal`)

Repeat full game steps using keyboard navigation.

---

## Dependencies

Feature 054 (Hull Integrity & Mini-Game Landing Hook), Feature 049 (Mini-Game Dev
Harness), Feature 056 (Planet Landing Mini-Game — shared helpers)
