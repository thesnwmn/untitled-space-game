# Feature 025 · Randomise Station Star Patterns

## Goal

Each visit to a destination produces a visually distinct starfield. The pattern is
stable for the entire visit — docking and undocking does not change it. It only
refreshes when the player fully navigates away (returns to the main menu, story
screen, or in future: jumps to a different destination).

---

## Behaviour

### What changes

`ShipScene` currently instantiates `new Starfield()` with a fixed seed of `42`.
All visits therefore show identical star layouts.

After this feature, `ShipScene` receives a `starfieldSeed: number` from the
orchestrator. The seed is a random 32-bit integer generated once per visit and
reused for every subsequent `ShipScene` instance within that visit.

### Visit lifecycle

| Navigation event | Seed action |
|---|---|
| Arrive at ShipScene with no current seed | Generate new random seed |
| Dock at station (ShipScene → StationMenuScene) | Seed preserved in orchestrator |
| Undock (StationMenuScene → ShipScene) | Reuse existing seed → same star layout |
| Navigate to Main Menu | Clear seed |
| Navigate to Story screen | Clear seed |
| Jump to a new destination (future feature) | Clear seed |

### Visible effect

- Every trip through Main Menu → Story → Station → Undock yields a different star
  layout (different star positions and different initial twinkling phases).
- Docking and undocking multiple times at the same station shows the same star
  positions.

---

## Technical notes

### `ShipScene.ts`

Add `starfieldSeed: number` to the constructor signature after the existing parameters.
Pass it to `new Starfield(starfieldSeed)` instead of the current call with no argument.
No other changes to `ShipScene`.

### `main.ts` and `terminal.ts`

Add a module-level `destinationSeed: number | null` variable, initially `null`.

`goToShip`: if the seed is null, generate a random non-zero 32-bit integer and store
it; if it already has a value, reuse it. Either way, pass it to `ShipScene`.

`goToMainMenu` and `goToStory`: clear the seed to `null` before constructing the scene.
Extract `goToMainMenu` from the current inline construction if it doesn't already exist
as a named function.

Apply the same changes to both orchestrators.

---

## Tests

Add to `ShipScene.test.ts`:
- A given seed produces the same star positions as `new Starfield(seed)` directly.
- Two different seeds produce at least one star position that differs.

Orchestration logic is verified by play-test.

---

## Play-test instructions

### Browser (`npm run dev`)

1. Open the game → Main Menu → Story → Station → **Undock**
2. Note the star layout (positions of `.` `*` `+` glyphs).
3. **Dock** (DOCK button or tap right half of buttons row).
4. **Undock** again → ✓ **same star layout** as step 2.
5. Navigate to Main Menu.
6. Main Menu → Story → Station → **Undock** → ✓ **different star layout** from step 2.
7. Repeat step 5–6 a few more times to confirm variety.

### Terminal (`npm run terminal`)

Repeat the same steps using keyboard navigation.

---

## Dependencies

None beyond the existing `Starfield` class, which already accepts an arbitrary seed.
