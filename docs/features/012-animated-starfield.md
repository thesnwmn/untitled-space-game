# Feature 012: Animated Starfield — Ship Scene

**Status:** READY
**Depends on:** 011 (ShipScene must exist with a static starfield)

## Summary

Replace the static ASCII dot pattern in ShipScene's viewport with a three-layer parallax
scrolling starfield. Stars drift from top to bottom at layer-specific speeds, wrapping back
to the top when they exit the viewport. An occasional twinkle effect briefly brightens
individual stars. The result is purely cell-based (no CSS), so it works identically in both
the DOM renderer and the terminal renderer.

---

## Visual Design

### Viewport

Rows 2–25, cols 0–39 (the same region defined by the Ship scene spec).
The rest of the scene — status bar, action buttons, footer — is unchanged.

### Layers

| Layer | Stars | Char | Colour        | Speed (rows/sec) | Meaning      |
|-------|-------|------|---------------|-----------------|--------------|
| 0     | 18    | `.`  | `bright-black`| 1.5             | Distant      |
| 1     | 10    | `*`  | `white`       | 4.0             | Mid-field    |
| 2     | 5     | `+`  | `bright-white`| 9.0             | Near / fast  |

Total: 33 stars simultaneously on screen.

### Twinkle

Each star has an independent twinkle timer. When the timer fires:
- Layer 0 star: upgrades to `white` for one render frame
- Layer 1 star: upgrades to `bright-white` for one render frame
- Layer 2 star: upgrades to `bright-cyan` for one render frame

After one frame the colour reverts. The timer then resets to a new random interval
in the range 800 ms – 3000 ms.

### Motion direction

Stars move **downward** (y increases). This reads as the ship moving forward through
space. Stars reappear at the top (row 2) with a freshly randomised column when they
exit the bottom (row 25).

---

## State

### Star data structure

```typescript
interface Star {
  col: number;          // 0–39, integer
  y: number;            // floating-point row within viewport [2, 25]
  layer: 0 | 1 | 2;
  twinkleTimer: number; // ms until next twinkle
  twinkled: boolean;    // true for one render frame during a twinkle event
}
```

### Initialisation

Stars are seeded using a deterministic LCG (Linear Congruential Generator) so the
starfield looks identical every time the player enters the Ship scene. The PRNG is
private to the starfield module and is not surfaced to the rest of the codebase.

Seed value: `42` (arbitrary fixed constant).

Initial y positions are distributed across the full viewport height so the field looks
populated from the first frame. No clustering or special centre-density at init time
(the static starfield spec's centre-density idea does not carry over).

### LCG spec

```
next = (state * 1664525 + 1013904223) & 0xFFFFFFFF
normalised = next / 0x100000000  // [0, 1)
```

Expose as `lcgRand(): number` in a small private helper — no external dependency needed.

---

## Behaviour

### `update(dt: number): void`

`dt` is milliseconds (consistent with the existing scene contract).

For each star:
1. Advance `y += SPEED[star.layer] * (dt / 1000)`.
2. If `y > 25`: reset `y = 2`, pick new random `col` (0–39 via LCG).
3. Clear `star.twinkled` (it was true for at most one frame).
4. Decrement `star.twinkleTimer -= dt`.
5. If `twinkleTimer <= 0`: set `twinkled = true`, reset `twinkleTimer` to a random
   value in [800, 3000] ms via LCG.

### `render(buffer: CharBuffer): void`

For each star, write one cell at `(Math.floor(star.y), star.col)`:
- `char`: layer char (`.` / `*` / `+`)
- `fg`: if `star.twinkled`, use twinkle colour (see table above); otherwise layer colour
- `bg`: always `'black'`

Draw order: layer 0 first, then layer 1, then layer 2, so near stars overwrite far ones
when they share a cell.

---

## Implementation

### Files to change

| File | Change |
|------|--------|
| `src/game/scenes/ShipScene.ts` | Replace static starfield rendering with `Starfield` instance |
| `src/game/scenes/Starfield.ts` | **New file** — `Starfield` class (owns stars, update, render) |
| `src/game/scenes/Starfield.test.ts` | **New file** — unit tests |
| `src/game/scenes/ship-scene.test.ts` | Update starfield-related test assertions |

### `Starfield` class interface

```typescript
class Starfield {
  constructor(seed?: number);          // default seed = 42
  update(dt: number): void;
  render(buffer: CharBuffer): void;
  // test-only accessors (not exported in production use):
  getStars(): Readonly<Star[]>;
}
```

Keeping `Starfield` separate from `ShipScene` makes it independently testable and
reusable in future scenes (e.g. a jump-sequence animation).

### `ShipScene` integration

```typescript
// In ShipScene constructor:
this.starfield = new Starfield();

// In ShipScene.update(dt):
this.starfield.update(dt);

// In ShipScene.render(buffer):
// ... draw status bar ...
this.starfield.render(buffer);
// ... draw buttons ...
```

---

## Test Coverage

### `Starfield.test.ts` — target 15–18 tests

**Initialisation:**
- Creates 33 stars total (18 + 10 + 5)
- All stars have y in [2, 25]
- All stars have col in [0, 39]
- Layer distribution is exactly 18/10/5
- Two `Starfield` instances with the same seed produce identical initial star positions

**`update(dt)`:**
- Stars advance y by `speed * (dt / 1000)` each layer
- A star at y = 25 or beyond wraps to y = 2
- Wrapped star gets a new col value (not necessarily the same)
- `twinkled` is cleared each frame (false at start of next update cycle)
- `twinkleTimer` decrements by `dt`
- When `twinkleTimer` reaches zero, `twinkled` is set to true and timer is reset > 0

**`render(buffer)`:**
- Layer 0 star renders `.` in `bright-black` at its floor row/col
- Layer 1 star renders `*` in `white` at its floor row/col
- Layer 2 star renders `+` in `bright-white` at its floor row/col
- A twinkled layer 0 star renders in `white` (upgraded colour)
- A twinkled layer 1 star renders in `bright-white`
- A twinkled layer 2 star renders in `bright-cyan`
- A near star (layer 2) overwrites a far star (layer 0) when sharing a cell

### `ship-scene.test.ts` — updated tests

- Remove assertions that check specific static star positions
- Add: `update` is forwarded to starfield (star y-positions advance after `scene.update(dt)`)
- Add: starfield cells are present in the rendered buffer (at least one non-space cell in
  rows 2–25)
- Existing status bar, button, navigation, and input-silencing tests: unchanged

---

## Acceptance Criteria

- ✓ Stars scroll smoothly downward at three distinct speeds in both browser and terminal
- ✓ Stars wrap from bottom to top with a new column on each pass
- ✓ Twinkle effect fires on individual stars without disturbing neighbours
- ✓ Scene is visually stable at the start (stars distributed across full viewport, not all
  bunched at the top)
- ✓ All new tests pass
- ✓ All existing tests continue to pass (100/100)
- ✓ `tsc --noEmit` passes with zero errors
- ✓ `npm run build` succeeds
- ✓ `init.sh` passes before and after
- ✓ Play-test in browser (`npm run dev`): enter Ship scene, observe three visible speeds,
  watch twinkle fire at least once in a 10-second observation
- ✓ Play-test in terminal (`npm run terminal`): same observation

---

## Notes for Engineer

- `dt` is already in milliseconds in existing scenes — confirm this holds for ShipScene
  before writing speed arithmetic.
- The LCG helper is private to `Starfield.ts`; do not export it or reuse it elsewhere
  in this feature.
- Terminal refresh rate is typically 30 fps; at that rate a near star (9 rows/sec) moves
  0.3 cells per frame — smooth enough to read as motion.
- The twinkle colour upgrade is per-frame only (single `render` call). Do not latch it
  across frames.
- Avoid `Math.random()` — use the LCG exclusively so tests are deterministic. To force a
  twinkle in a test, set `star.twinkleTimer = 0` directly and call `update(1)`.
- Do not implement shooting stars in this feature.
