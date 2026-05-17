# Feature 060 · Navigation Encounter Trigger

## Goal

When the player jumps to a new system, a configurable random chance triggers a navigation
encounter — a story screen followed by the navigation mini-game — with hull damage applied
on failure or cancellation before normal arrival.

---

## Acceptance criteria

- After every `JumpAnimationScene` completes, the orchestrator rolls for an encounter
  using `balance.navigationEncounter.encounterChanceOnJump`
- Encounter type (`'asteroid_belt'`, `'space_debris'`, `'space_storm'`) is selected with
  equal probability at random
- Difficulty is derived from the destination system's `danger_level`: `'none'`/`'low'` →
  `'easy'`; `'medium'` → `'normal'`; `'high'`/`'extreme'` → `'hard'`
- A new `NavigationEncounterScene` is shown: it displays the encounter type and brief
  flavour text with a single BEGIN action; the scene does not respond to ESC or MENU —
  input routes only to BEGIN
- After BEGIN, the navigation mini-game (Feature 059) is instantiated and played with the
  resolved `type` and `difficulty` params
- On `outcome: 'completed'` with `score >= balance.miniGames.noDamageThreshold`: no hull
  damage; proceed to normal post-jump arrival (TravelMenuScene in arrival mode)
- On `outcome: 'completed'` with `score < noDamageThreshold`: apply
  `player.applyHullDamage(balance.miniGames.maxHullDamageFraction * (1 - score /
  noDamageThreshold) * difficultyMultiplier)`, then proceed to arrival
- On `outcome: 'skipped'`: apply
  `player.applyHullDamage(balance.miniGames.abandonDamageFraction * difficultyMultiplier)`,
  then proceed to arrival
- `difficultyMultiplier` is `1.0` for `'easy'`, `1.0` for `'normal'`, `1.25` for `'hard'`
  (hardcoded in the orchestrator — not a balance key)
- After damage application, `LandingResultScene` (Feature 058) is shown with appropriate
  navigation labels (see Technical notes) before routing to TravelMenuScene
- `GameBalance.navigationEncounter` type and balance key `encounter_chance_on_jump` are
  added by this feature; the Engineer adds the TypeScript type to `src/game/world/types.ts`
  and the YAML value to `docs/world/settings/balance.md`
- `npm test` passes; `npx tsc --noEmit` produces zero errors
- Tests for damage formula: score ≥ `noDamageThreshold` → zero damage; score 0 →
  `maxHullDamageFraction × multiplier`; skipped → `abandonDamageFraction × multiplier`;
  hard multiplier (1.25) scales correctly

---

## Out of scope

- Encounters triggered by in-system travel (only system jumps are in scope)
- Displaying hull damage feedback beyond what `LandingResultScene` already shows
- Hull destruction / game-over handling when hull reaches zero
- Weighted encounter type selection by system properties (kept fully random for simplicity)

---

## Technical notes

### Routing change in `game.ts`

Current post-jump flow: `onJumpSelected` → `JumpAnimationScene` → `goToArrival()` →
`TravelMenuScene`.

This feature introduces a private `maybeNavigationEncounter(onComplete: () => void)`
called between `JumpAnimationScene.onComplete` and `goToArrival()`:

1. Roll a random number against `encounterChanceOnJump`; if no encounter, call
   `onComplete()` immediately.
2. If encounter: resolve type (random equal weight) and difficulty (from system
   `danger_level`). Show `NavigationEncounterScene`; on BEGIN, show the navigation
   mini-game; on `complete(result)`, apply damage via `player.applyHullDamage()`, then
   show `LandingResultScene`, then call `onComplete()`.

Hull damage is applied by the orchestrator — not by the mini-game scene — preserving
Feature 048's constraint that mini-games must not mutate `PlayerState`.

### `NavigationEncounterScene`

New scene `src/game/scenes/navigation-encounter-scene.ts` extending `BaseScene` (or
`BaseChoiceScene` from Feature 053 if it fits cleanly). Title area shows the encounter
type name; the content area shows two or three lines of flavour text; a footer nav button
`[ENTER] BEGIN` is the only active action.

**The scene must not respond to ESC, MENU, or back actions** — only `NAV_1` / ENTER / the
BEGIN button fires the callback. The player cannot skip the briefing.

> suggestion

Encounter type labels and flavour text:

| type            | label             | flavour text                                  |
|-----------------|-------------------|-----------------------------------------------|
| `asteroid_belt` | `ASTEROID BELT`   | `DENSE ROCK FIELD DETECTED ON JUMP EXIT.`<br>`BRACE FOR IMPACT.` |
| `space_debris`  | `DEBRIS FIELD`    | `COLLISION ALERT — DEBRIS FIELD ON APPROACH.`<br>`REDUCE SPEED.` |
| `space_storm`   | `SPACE STORM`     | `ELECTROMAGNETIC STORM DETECTED.`<br>`HOLD STEADY.` |

### `LandingResultScene` labels for navigation

Feature 058 defines `LandingResultScene` taking `outcomeLabel: string`,
`score: number | null`, `damageFraction: number`. The navigation caller derives
`outcomeLabel` as follows:

| condition              | label         | colour       |
|------------------------|---------------|--------------|
| skipped                | `ABORTED`     | red          |
| score 0 (collision)    | `COLLISION`   | red          |
| score 1–89             | (not expected — binary scoring in 059) | — |
| score 90–100 (clear)   | `CLEAR`       | bright-green |

`score` is `null` when skipped; otherwise the integer from `result.score`.

### `GameBalance.navigationEncounter`

Add to `GameBalance` in `src/game/world/types.ts`:

```typescript
navigationEncounter: {
  encounterChanceOnJump: number;
}
```

Default value in `docs/world/settings/balance.md`:

```yaml
navigation_encounter:
  encounter_chance_on_jump: 0.30
```

### `difficultyMultiplier` mapping

The navigation encounter does not use `Destination.difficultyMultiplier` (introduced by
Feature 058 for destinations, not systems). Instead the orchestrator derives a multiplier
from the system `danger_level`:

| `danger_level`          | multiplier |
|-------------------------|------------|
| `'none'` / `'low'`      | `1.0`      |
| `'medium'`              | `1.0`      |
| `'high'` / `'extreme'`  | `1.25`     |

This is separate from the destination-level `difficultyMultiplier` field.

### Affected files

- `src/game/game.ts` — `maybeNavigationEncounter()` method; routing change after jump
- `src/game/scenes/navigation-encounter-scene.ts` — new scene
- `src/game/world/types.ts` — `navigationEncounter` added to `GameBalance`
- `docs/world/settings/balance.md` — `navigation_encounter` block added

---

## Play-test instructions

### Browser (`npm run dev`)

1. Jump to any system — roughly 30% of jumps should show `NavigationEncounterScene`.
2. Confirm encounter type label and flavour text display correctly.
3. Press ESC or MENU — confirm nothing happens; only ENTER/BEGIN advances.
4. Press BEGIN — confirm the navigation mini-game loads with the resolved type and difficulty.
5. Complete successfully (score 100) — confirm `LandingResultScene` shows `CLEAR` and
   `HULL DAMAGE: 0%`; TravelMenuScene opens in arrival mode.
6. Trigger another encounter; hit an obstacle (score 0) — confirm `LandingResultScene`
   shows `COLLISION` and hull drops; check `HULL` display in ShipScene is reduced.
7. Trigger another encounter; press MENU during the mini-game — confirm `LandingResultScene`
   shows `ABORTED` with abandon damage applied.
8. Jump to a `danger_level: high` system — confirm `HULL DAMAGE` in the result scene is
   higher than for an easy-difficulty encounter with the same score.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

Feature 054 (Hull Integrity), Feature 058 (Mini-Game Landing Hook),
Feature 059 (Space Navigation Mini-Game)
