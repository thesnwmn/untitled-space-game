# Feature 060 · Navigation Encounter Trigger

## Goal

When the player jumps to a new system, a configurable random chance triggers a navigation
encounter — a ship-cockpit overlay with an incoming-signal animation and typewriter dialog
followed by the navigation mini-game — with hull damage applied on failure or cancellation
before normal arrival.

---

## Acceptance criteria

- After every `JumpAnimationScene` completes, the orchestrator rolls for an encounter
  using `balance.navigationEncounter.encounterChanceOnJump`
- Encounter type (`'asteroid_belt'`, `'space_debris'`, `'space_storm'`) is selected with
  equal probability at random
- Difficulty is derived from the destination system's `danger_level`: `'none'`/`'low'` →
  `'easy'`; `'medium'` → `'normal'`; `'high'`/`'extreme'` → `'hard'`
- A new `NavigationEncounterScene` is shown as a full-screen overlay on a static ship
  cockpit background (frozen starfield, live player gauges, HUD, bottom panels). The scene
  progresses through three internal phases:
  - **`'incoming'`** (~1,200 ms): the speaker bar in the bottom radar section animates
    with scrolling vertical bars of varying heights moving right-to-left, replacing the
    static hyphens; no dialog box is visible; the phase advances automatically when the
    duration elapses
  - **`'typing'`**: a bordered dialog box appears over the lower portion of the starfield
    viewport; the encounter type label is shown as the dialog header; flavour text is
    revealed one character at a time (~40 ms per character); any tap or keypress instantly
    reveals the complete text and transitions to `'complete'`; the speaker animation
    continues
  - **`'complete'`**: the full flavour text is visible; a `[ CONTINUE ]` prompt appears
    as the last interior line of the dialog box; any tap, ENTER, or `NAV_1` fires the
    `onBegin` callback and proceeds to the mini-game; the speaker animation continues
- The scene does not respond to ESC, MENU, TRAVEL, DOCK, or CARGO in any phase — only
  the skip/continue action routes anywhere
- After `onBegin`, the navigation mini-game (Feature 059) is instantiated and played with
  the resolved `type` and `difficulty` params
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
- Audio playback (no audio system exists in the game)
- Background environment matching the encounter type (captured in Ideas.md for future)

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
   `danger_level`). Show `NavigationEncounterScene`; on `onBegin`, show the navigation
   mini-game; on `complete(result)`, apply damage via `player.applyHullDamage()`, then
   show `LandingResultScene`, then call `onComplete()`.

Hull damage is applied by the orchestrator — not by the mini-game scene — preserving
Feature 048's constraint that mini-games must not mutate `PlayerState`.

### `NavigationEncounterScene`

New scene `src/game/scenes/navigation-encounter-scene.ts` extending `BaseScene`.

**Background rendering:** The scene renders a static ship cockpit view as its background
content, replicating the essential visual elements of `ShipCockpitScene` directly in its
own `renderContent()`: a starfield snapshot seeded from `player.destinationId` (rendered
once on construction, not updated), the gauge strip from current `PlayerState`, HUD
readouts, and bottom panels including the speaker bar. The goal is visual continuity with
the ship view; pixel-perfect fidelity is not required.

**Internal state:** The scene tracks `phase: 'incoming' | 'typing' | 'complete'`,
`phaseAccum: number` (ms elapsed in the current phase), and `charCount: number` (characters
of flavour text revealed so far).

**Phase `'incoming'`**

Duration: 1,200 ms (hardcoded — not a balance key).

The speaker bar (the `<)) ` prefix followed by hyphens, rendered at `bottomBot`,
`RADAR_START`–`RADAR_END - 1`) animates the hyphen zone only. The `<)) ` prefix stays
static. The remaining characters cycle through ASCII bar heights (`_`, `-`, `=`, `|`) in a
scrolling pattern that advances one position every ~80 ms; a simple integer offset into a
circular pseudo-random height sequence achieves the right-to-left scroll without heavy
state. Use ASCII characters only — Unicode block glyphs are not required and may not render
correctly in the terminal target.

Phase advances automatically when `phaseAccum >= 1200`. No dialog box is drawn.

**Phase `'typing'`**

`charCount` increments by 1 every ~40 ms. The dialog box is drawn over the lower portion
of the starfield viewport — from `viewportBot - 5` through `viewportBot` (6 rows including
top and bottom borders), spanning the full content width (columns 0–39).

> suggestion

Dialog layout (rows top to bottom within the box):

```
+--------------------------------------+
| ASTEROID BELT                        |  ← encounter type label
| DENSE ROCK FIELD DETECTED ON JUMP    |  ← flavour text, revealed char by char
| EXIT. BRACE FOR IMPACT.              |
|                                      |  ← blank padding
+--------------------------------------+
```

Inner width is 38 characters. Flavour text wraps at word boundaries to fit. Only
`charCount` characters are rendered; the rest of the text is withheld.

Speaker animation continues at the same rate as in `'incoming'`.

Any action arriving in this phase (tap, ENTER, NAV_1, or any other non-deactivating
action) sets `charCount` to the total flavour text length and transitions to `'complete'`
immediately.

**Phase `'complete'`**

The dialog box is rendered identically to `'typing'` but with the full text visible and
a `[ CONTINUE ]` prompt centred on the last interior row before the bottom border:

> suggestion

```
+--------------------------------------+
| ASTEROID BELT                        |
| DENSE ROCK FIELD DETECTED ON JUMP    |
| EXIT. BRACE FOR IMPACT.              |
|            [ CONTINUE ]              |
+--------------------------------------+
```

Speaker animation continues.

ENTER, NAV_1, or any tap fires `onBegin` → mini-game. No other action routes anywhere.

**Input blocking:** Override `handleAction` and `handleTap` to suppress TRAVEL, DOCK,
CARGO, MENU, ESC, and BACK in all phases. Only the skip/continue action is live.

**Encounter type labels and flavour text:**

> strong suggestion

| type            | label           | flavour text                                                |
|-----------------|-----------------|-------------------------------------------------------------|
| `asteroid_belt` | `ASTEROID BELT` | `DENSE ROCK FIELD DETECTED ON JUMP EXIT. BRACE FOR IMPACT.` |
| `space_debris`  | `DEBRIS FIELD`  | `COLLISION ALERT — DEBRIS FIELD ON APPROACH. REDUCE SPEED.` |
| `space_storm`   | `SPACE STORM`   | `ELECTROMAGNETIC STORM DETECTED. HOLD STEADY.`              |

### `LandingResultScene` labels for navigation

Feature 058 defines `LandingResultScene` taking `outcomeLabel: string`,
`score: number | null`, `damageFraction: number`. The navigation caller derives
`outcomeLabel` as follows:

| condition              | label       | colour       |
|------------------------|-------------|--------------|
| skipped                | `ABORTED`   | red          |
| score 0 (collision)    | `COLLISION` | red          |
| score 90–100 (clear)   | `CLEAR`     | bright-green |

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

### Affected files

- `src/game/game.ts` — `maybeNavigationEncounter()` method; routing change after jump
- `src/game/scenes/navigation-encounter-scene.ts` — new scene (overlay design)
- `src/game/world/types.ts` — `navigationEncounter` added to `GameBalance`
- `docs/world/settings/balance.md` — `navigation_encounter` block added

---

## Play-test instructions

### Browser (`npm run dev`)

1. Jump to any system — roughly 30% of jumps should show `NavigationEncounterScene`.
2. Confirm the ship cockpit view appears as a static background (starfield frozen, gauges
   reflect current player state).
3. Confirm the speaker bar animates with scrolling vertical bars for ~1.2 s before the
   dialog box appears.
4. Confirm the dialog box appears over the lower starfield with the correct encounter type
   label.
5. Confirm flavour text types out character-by-character.
6. Press TRAVEL, DOCK, ESC, or MENU during typing — confirm nothing happens.
7. While text is still typing, press ENTER — confirm text snaps to complete instantly and
   `[ CONTINUE ]` appears.
8. Press ENTER or tap `[ CONTINUE ]` — confirm navigation mini-game loads with the correct
   type and difficulty.
9. Complete successfully (score 100) — confirm `LandingResultScene` shows `CLEAR` and
   `HULL DAMAGE: 0%`; TravelMenuScene opens in arrival mode.
10. Trigger another encounter; score 0 — confirm `LandingResultScene` shows `COLLISION`
    and hull drops; check `HULL` gauge in subsequent ShipCockpitScene is reduced.
11. Trigger another encounter; press MENU during the mini-game — confirm `LandingResultScene`
    shows `ABORTED` with abandon damage applied.
12. Jump to a `danger_level: high` system — confirm hull damage is higher than for an
    easy-difficulty encounter with the same score.
13. Let the text finish typing naturally without pressing anything — confirm `[ CONTINUE ]`
    appears automatically at the end.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

Feature 054 (Hull Integrity), Feature 058 (Mini-Game Landing Hook),
Feature 059 (Space Navigation Mini-Game)
