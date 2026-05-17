# Feature 054 · Hull Integrity & Mini-Game Landing Hook

## Goal

Introduce hull integrity tracking on `PlayerState`, wire mini-game results into the
`goToLandOrDock` flow so landing quality determines hull damage, and show a brief result
scene before the player enters the station.

---

## Acceptance criteria

- `PlayerState` has a `hullIntegrity` property (0.0–1.0); serialised; defaults to 1.0 on
  new game; missing on load → backfilled to 1.0
- `PlayerState.applyHullDamage(fraction: number): void` subtracts `fraction` from
  `hullIntegrity`, clamped to 0.0
- `GameBalance.miniGames` section exists with all values documented in Technical notes
- `Destination.difficultyMultiplier?: number` is parsed from world data (optional, defaults
  to `1.0`); no destination currently sets this field
- `game.ts → goToLandOrDock()` looks up `miniGameRegistry` for an entry whose `meta.id`
  matches the destination's `locationType` via the key table in Technical notes; if found,
  instantiates and runs the mini-game; if not found, falls back to the existing animation
  scene (current behaviour unchanged — no registered mini-games yet)
- When a mini-game completes with `outcome: 'completed'`, the orchestrator reads
  `result.result.score` (integer 0–100); if `score >= balance.miniGames.noDamageThreshold`
  no damage is applied; otherwise applies
  `player.applyHullDamage(balance.miniGames.maxHullDamageFraction
  * (1 - score / noDamageThreshold) * difficultyMultiplier)`
- When a mini-game completes with `outcome: 'skipped'`, the orchestrator applies
  `player.applyHullDamage(balance.miniGames.abandonDamageFraction * difficultyMultiplier)`
- After damage application, the orchestrator shows `LandingResultScene`; on that scene's
  completion it calls `goToStation()`
- `LandingResultScene` displays: an outcome label derived from the score, the score itself
  (hidden when skipped), and the hull damage applied; auto-advances after ~3 000 ms or on
  any keypress
- `ShipScene` renders `HULL: XX%` — bright-green at ≥ 80%, yellow at 50–79%, red below 50%
- `npm test` passes; `npx tsc --noEmit` produces zero errors
- Tests for `PlayerState`: `hullIntegrity` starts at 1.0; `applyHullDamage` subtracts
  correctly; clamps at 0.0; serialises and deserialises; load backfills missing field
- Tests for damage formula: score ≥ `noDamageThreshold` → zero damage; score 0 →
  `maxHullDamageFraction`; score at midpoint → proportional; skipped → `abandonDamageFraction`

---

## Out of scope

- Any concrete mini-game implementation (registry stays empty after this feature)
- Hull repair mechanics or UI
- Setting `difficultyMultiplier` on any destination in world data

---

## Technical notes

### Hull integrity on `PlayerState`

New private field `_hullIntegrity: number`. Public getter `hullIntegrity: number`. Method
`applyHullDamage(fraction: number): void` sets `_hullIntegrity = Math.max(0,
_hullIntegrity - fraction)`. Include `hullIntegrity` in the serialised save state; backfill
to `1.0` on load when the field is absent.

### `GameBalance.miniGames`

New nested object on `GameBalance` in `src/game/world/types.ts` and corresponding YAML in
`src/game/world/data/balance.yml`:

```typescript
miniGames: {
  maxHullDamageFraction: number;     // max damage fraction when score = 0 (e.g. 0.10)
  abandonDamageFraction: number;     // fixed damage fraction on skipped outcome (e.g. 0.05)
  noDamageThreshold: number;         // score (0–100) at or above which no damage is applied (e.g. 90)
  docking: {
    countdownSeconds: number;         // timer length (e.g. 30)
    thrustForce: number;              // velocity added per second per held direction (e.g. 4)
    maxVelocity: number;              // chars/s cap per axis (e.g. 12)
    driftIntervalMs: number;          // average ms between airlock drift events (e.g. 6000)
    driftMaxDistanceChars: number;    // max displacement per drift event from centre (e.g. 3)
    driftSpeedCharsPerSec: number;    // speed the airlock moves during a drift (e.g. 2)
    perfectRadiusChars: number;       // distance at which raw score ≈ 0.5 (e.g. 1.5)
  };
  surface: {
    gravityAccel: number;             // downward accel chars/s² (e.g. 3)
    airResistance: number;            // horizontal velocity multiplier per second (e.g. 0.6)
    thrustForce: number;              // accel per second per held direction (e.g. 6)
    maxSafeSpeed: number;             // chars/s at or below → speed score 100 (e.g. 4)
    crashSpeed: number;               // chars/s at or above → speed score 0 (e.g. 20)
    offPadScoreMultiplier: number;    // overall score multiplier for landing off-pad (e.g. 0.4)
  };
  asteroid: {
    initialDownwardVelocity: number;  // chars/s at game start (e.g. 1)
    thrustForce: number;              // accel per second per held direction (e.g. 5)
    maxSafeSpeed: number;             // (e.g. 3)
    crashSpeed: number;               // (e.g. 15)
    offPadScoreMultiplier: number;    // (e.g. 0.4)
  };
}
```

### `Destination.difficultyMultiplier`

Add `difficultyMultiplier?: number` to the `Destination` interface. World parser reads it as
`parseFloat` with fallback `undefined`. When the orchestrator resolves difficulty, use
`destination.difficultyMultiplier ?? 1.0`.

### Mini-game routing in `game.ts`

`goToLandOrDock()` currently selects an animation scene by `locationType`. Change it to
first check `miniGameRegistry`:

| `locationType`  | registry key        |
|-----------------|---------------------|
| `'orbital'`     | `'docking'`         |
| `'deep-space'`  | `'docking'`         |
| `'surface'`     | `'surface-landing'` |
| `'asteroid'`    | `'asteroid-landing'`|

Look up by `meta.id`. If found: instantiate the mini-game scene with an `onComplete`
callback that invokes `handleMiniGameResult`. If not found: run the existing animation scene
as before.

### Damage formula in `handleMiniGameResult`

```
handleMiniGameResult(result: MiniGameResult, destination: Destination):
  multiplier = destination.difficultyMultiplier ?? 1.0

  if result.outcome === 'skipped':
    damageFraction = abandonDamageFraction * multiplier
    outcomeLabel   = 'ABORTED'
    score          = null

  if result.outcome === 'completed':
    score = result.result.score  // integer 0–100
    if score >= noDamageThreshold:
      damageFraction = 0
    else:
      damageFraction = maxHullDamageFraction * (1 - score / noDamageThreshold) * multiplier
    outcomeLabel = derived from score and mini-game id (see LandingResultScene below)

  player.applyHullDamage(damageFraction)
  show LandingResultScene(outcomeLabel, score, damageFraction)
  on complete → goToStation()
```

### `LandingResultScene`

New scene `src/game/scenes/landing-result-scene.ts` extending `BaseTransitionScene`.
Constructor receives: `outcomeLabel: string`, `score: number | null`, `damageFraction: number`.
Duration: 3 000 ms; advances immediately on any keypress.

The caller derives `outcomeLabel` from the score and the mini-game id. Suggested mapping:

| score (or null) | docking label    | landing label   | colour       |
|-----------------|------------------|-----------------|--------------|
| null (skipped)  | `ABORTED`        | `ABORTED`       | red          |
| < 40            | `COLLISION`      | `CRASH`         | red          |
| 40–69           | `ROUGH DOCK`     | `HARD LANDING`  | yellow       |
| 70–89           | `DOCKED`         | `LANDED`        | bright-green |
| ≥ 90            | `PERFECT DOCK`   | `PERFECT LANDING` | bright-green |

> suggestion: Three centred rows:
> - Outcome label (coloured per table above)
> - `SCORE: 82 / 100` — omitted when score is null
> - `HULL DAMAGE: 3%` in yellow if > 0, bright-green if 0

### Hull display in `ShipScene`

Add a `HULL: XX%` summary line. Colour: bright-green ≥ 80%, yellow 50–79%, red < 50%.
The Engineer should slot it alongside existing ship info without displacing other lines.

---

## Play-test instructions

### Browser (`npm run dev`)

1. Start a new game — confirm `HULL: 100%` is visible in the ship view.
2. Dock anywhere — confirm the existing animation scene still plays (no mini-game registered)
   and hull does not change.
3. From a test or browser console, call `player.applyHullDamage(0.15)` — confirm
   `HULL: 85%` in the ship view, displayed in yellow.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

Feature 048 (Mini-Game Base Scene)
