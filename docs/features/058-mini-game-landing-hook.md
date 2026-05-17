# Feature 058 · Mini-Game Landing Hook

## Goal

Wire mini-game results into the `goToLandOrDock` travel flow: route by destination type
to the appropriate registered mini-game, apply hull damage from the score, and show a
brief result scene before the player enters the station.

---

## Acceptance criteria

- `GameBalance.miniGames` top-level section exists with the shared damage values documented
  in Technical notes (the per-game sub-sections `docking`, `surface`, `asteroid` are added
  by features 055–057 respectively; this feature only adds the top-level keys)
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
- `LandingResultScene` displays: an outcome label derived from the score and game type
  (see label table in Technical notes), the score (hidden when skipped), and the hull
  damage applied as a percentage; auto-advances after ~3 000 ms or on any keypress
- `npm test` passes; `npx tsc --noEmit` produces zero errors
- Tests for damage formula: score ≥ `noDamageThreshold` → zero damage; score 0 →
  `maxHullDamageFraction`; score midway → proportional; skipped → `abandonDamageFraction`;
  `difficultyMultiplier` scales damage correctly

---

## Out of scope

- Any concrete mini-game implementation (registry stays empty after this feature)
- Per-game balance sub-sections (`docking`, `surface`, `asteroid`) — each game feature
  adds its own sub-section
- Setting `difficultyMultiplier` on any destination in world data

---

## Technical notes

### `GameBalance.miniGames` — top-level keys only

Add to `GameBalance` in `src/game/world/types.ts` and `src/game/world/data/balance.yml`:

```typescript
miniGames: {
  maxHullDamageFraction: number;  // max damage fraction when score = 0 (e.g. 0.10)
  abandonDamageFraction: number;  // fixed damage fraction on skipped outcome (e.g. 0.05)
  noDamageThreshold: number;      // score at or above which no damage is applied (e.g. 90)
  // per-game sub-sections added by features 055–057
}
```

Features 055–057 each append their own sub-section (`docking`, `surface`, `asteroid`) to
this object. The TypeScript interface and YAML should be structured so sub-sections can be
added incrementally without requiring changes to this feature's code.

### `Destination.difficultyMultiplier`

Add `difficultyMultiplier?: number` to the `Destination` interface. World parser reads it
as `parseFloat` with fallback `undefined`. Orchestrator uses
`destination.difficultyMultiplier ?? 1.0`.

### Mini-game routing in `game.ts`

| `locationType`  | registry key        |
|-----------------|---------------------|
| `'orbital'`     | `'docking'`         |
| `'deep-space'`  | `'docking'`         |
| `'surface'`     | `'surface-landing'` |
| `'asteroid'`    | `'asteroid-landing'`|

If the registry has no matching entry, run the existing animation scene unchanged.

### Damage formula

```
if outcome === 'skipped':
  damageFraction = abandonDamageFraction * multiplier
  score = null

if outcome === 'completed':
  score = result.result.score          // integer 0–100
  if score >= noDamageThreshold:
    damageFraction = 0
  else:
    damageFraction = maxHullDamageFraction
                   * (1 - score / noDamageThreshold)
                   * multiplier
```

### `LandingResultScene`

New scene `src/game/scenes/landing-result-scene.ts` extending `BaseTransitionScene`.
Constructor receives: `outcomeLabel: string`, `score: number | null`,
`damageFraction: number`. Duration: 3 000 ms; advances immediately on any keypress.

The caller derives `outcomeLabel` from score and mini-game id. Suggested mapping:

| score (or null) | docking label      | landing label     | colour       |
|-----------------|--------------------|-------------------|--------------|
| null (skipped)  | `ABORTED`          | `ABORTED`         | red          |
| 0–39            | `COLLISION`        | `CRASH`           | red          |
| 40–69           | `ROUGH DOCK`       | `HARD LANDING`    | yellow       |
| 70–89           | `DOCKED`           | `LANDED`          | bright-green |
| 90–100          | `PERFECT DOCK`     | `PERFECT LANDING` | bright-green |

> suggestion: Three centred rows:
> - Outcome label (coloured per table above)
> - `SCORE: 82 / 100` — omitted when score is null
> - `HULL DAMAGE: 3%` in yellow if > 0, bright-green if 0

---

## Play-test instructions

### Browser (`npm run dev`)

1. Dock anywhere — confirm the existing animation scene still plays (no mini-game
   registered yet) and hull integrity is unchanged.
2. Once a mini-game is registered (features 055–057), dock at the relevant destination
   type — confirm the mini-game plays; the result scene shows label, score, and damage;
   the station opens.
3. Press MENU during a mini-game — confirm the result scene shows `ABORTED` and the
   abandon damage fraction is applied.
4. Achieve a score ≥ 90 — confirm `HULL DAMAGE: 0%` in bright-green.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

Feature 048 (Mini-Game Base Scene), Feature 054 (Hull Integrity)
