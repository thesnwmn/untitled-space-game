# Feature 025 · Randomise Station Star Patterns

## Goal

Each visit to a destination produces a visually distinct starfield. The pattern is
stable for the entire visit — docking and undocking does not change it. It only
refreshes when the player fully navigates away (returns to the main menu, story
screen, or in future: jumps to a different destination).

---

## Behaviour

### What changes

`ShipScene` currently instantiates `new Starfield()`, which always uses the default
seed of `42`. All visits therefore show identical star layouts.

After this feature, `ShipScene` receives a `starfieldSeed: number` from the
orchestrator (`main.ts` / `terminal.ts`). The seed is a random 32-bit integer
generated once per visit and reused for every subsequent `ShipScene` instance
within that visit.

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
  positions. Twinkling phases resume from the beginning of the period (same seed
  ⟹ same initial phase), which is imperceptible given continuous animation.

---

## Implementation

### `ShipScene.ts`

Change the constructor signature to require a seed:

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  onDock: () => void,
  starfieldSeed: number,
)
```

Replace the existing `new Starfield()` call with `new Starfield(starfieldSeed)`.

No other changes to `ShipScene`.

### `main.ts`

Add a module-level variable to hold the current destination seed:

```typescript
let destinationSeed: number | null = null;
```

Update `goToShip` to generate a fresh seed when none exists, and preserve it when
one is already set (i.e. the player is undocking):

```typescript
const goToShip = () => {
  if (destinationSeed === null) {
    destinationSeed = (Math.floor(Math.random() * 0xFFFF_FFFF) + 1) >>> 0;
  }
  currentScene = new ShipScene(input, context, goToStation, destinationSeed);
};
```

Seed must be cleared whenever the player leaves a destination entirely. Add a
`goToMainMenu` function (the initial scene is set inline today; extract it) and
clear the seed in `goToStory` too:

```typescript
const goToMainMenu = () => {
  destinationSeed = null;
  currentScene = new MainMenuScene(input, context, goToStory);
};

const goToStory = () => {
  destinationSeed = null;
  currentScene = new StoryScene(input, context, goToStation);
};
```

Replace the inline `currentScene = new MainMenuScene(...)` at the bottom with
`goToMainMenu()`.

### `terminal.ts`

Apply the same changes as `main.ts`:
- Add `let destinationSeed: number | null = null`
- Same `goToShip` logic
- Clear `destinationSeed` in `goToMainMenu` / `goToStory`

### No changes needed to

- `Starfield.ts` — already accepts an arbitrary seed; LCG is deterministic for any
  non-zero 32-bit value
- `StationMenuScene.ts`, `TraderScene.ts`, `MissionBoardScene.ts` — routing
  callbacks are unchanged; these scenes never touch the starfield
- World docs / destination files — seeds are generated at runtime, not stored

---

## Tests

Add or extend `ShipScene.test.ts`:

1. **Seed is used** — constructing `ShipScene` with seed `N` produces a `Starfield`
   whose star positions match `new Starfield(N)` directly.
2. **Different seeds differ** — two `ShipScene` instances with distinct seeds have
   at least one star position that differs.
3. **TypeScript** — the constructor requires a `starfieldSeed` argument (compile-time
   check; `npx tsc --noEmit` must pass with zero errors).

Orchestration logic in `main.ts` / `terminal.ts` is verified by play-test.

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
