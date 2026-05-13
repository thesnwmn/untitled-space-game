# Feature 017: Static Starfield with Twinkling — Ship Scene

**Status:** READY
**Depends on:** 012 (Starfield and SpaceStation must exist)

## Summary

The ship screen's star field currently scrolls downward using a three-layer parallax
system. This reads as falling rain rather than outer space. This feature replaces
scrolling with stationary stars that independently pulse through dim / normal / bright
states using a sinusoidal brightness cycle. The space station continues to drift on
its Lissajous path unchanged.

---

## Behaviour Change

| | Before | After |
|---|---|---|
| Star position | Moves downward; wraps at bottom | Fixed row and col for lifetime of scene |
| Motion cue | Scrolling parallax | None — this is a parked-in-orbit view |
| Visual rhythm | Stars flash once per 0.8–3 s (one frame) | Stars pulse in and out over 0.8–9 s (many frames) |
| Station | Lissajous drift | Unchanged |

---

## Star Data Structure

Remove the fields that drove scrolling and the old one-frame twinkle; add fields for
continuous sinusoidal brightness.

```typescript
interface Star {
  row: number;              // integer; fixed for the star's lifetime
  col: number;              // integer; fixed for the star's lifetime
  layer: 0 | 1 | 2;
  twinklePhase: number;     // current angle in radians; advances each update
  twinklePeriod: number;    // ms per full cycle, LCG-assigned at init
}
```

Removed fields: `y` (floating-point), `twinkleTimer`, `twinkled`.

---

## Initialisation

Stars are seeded with LCG seed `42` (unchanged). Initial `row` and `col` are drawn
from the interior bounds exactly as `y` and `col` were before, except `row` is the
integer-rounded value and is never updated again.

The initial `twinklePhase` for each star is drawn from the LCG and scaled to
`[0, 2π)` so stars begin the scene at different points in their cycle.

The `twinklePeriod` for each star is drawn from the LCG within the layer's range:

| Layer | Period range |
|-------|-------------|
| 0 | 4 000 – 9 000 ms |
| 1 | 2 000 – 5 000 ms |
| 2 | 800 – 2 500 ms |

---

## `update(dt: number): void`

For each star, advance its phase:

```
star.twinklePhase += (2π / star.twinklePeriod) * dt
```

No other update is needed. Stars do not move. `twinklePhase` naturally wraps as a
continuous angle — no explicit modulo is required (sine is periodic).

The `Starfield` class no longer needs a `totalTime` accumulator; per-star phase is
sufficient.

---

## `render(buffer: CharBuffer): void`

For each star, compute brightness from the current phase:

```
b = sin(star.twinklePhase)
```

Map `b` to one of three states:

| `b` range | State |
|-----------|-------|
| `b ≥ 0.5` | **bright** |
| `-0.5 ≤ b < 0.5` | **normal** |
| `b < -0.5` | **dim** |

Render the star using the colour from the table below. If the resolved colour is
`transparent` (marked `—` below), **skip rendering** that cell entirely.

| Layer | Char | Dim colour | Normal colour | Bright colour |
|-------|------|-----------|--------------|--------------|
| 0 | `.` | — (not rendered) | `bright-black` | `white` |
| 1 | `*` | `bright-black` | `white` | `bright-white` |
| 2 | `+` | `white` | `bright-white` | `bright-cyan` |

Layer 0 stars blink out during their dim phase — distant stars occasionally disappear
from view, which reads as natural cosmic flicker.

Draw order remains layer 0 → 1 → 2 so near stars overwrite distant ones.

---

## Space Station

No changes to `SpaceStation` or to `ShipScene`'s forwarding of `update(dt)` and
`render(buffer)` to the station. The Lissajous drift continues exactly as in
feature 012.

---

## Files to Change

| File | Change |
|------|--------|
| `src/game/scenes/Starfield.ts` | Remove scrolling; replace timer-based twinkle with sinusoidal phase model |
| `src/game/scenes/Starfield.test.ts` | Remove scroll/wrap tests; add phase-advance and brightness-state tests |

No other files need changing. `ShipScene`, `SpaceStation`, and `station-types.ts` are
untouched.

---

## `Starfield` Class Interface

The public interface is unchanged:

```typescript
class Starfield {
  constructor(seed?: number);    // default seed = 42
  update(dt: number): void;
  render(
    buffer: CharBuffer,
    intRowStart: number,
    intRowEnd: number,
    intColStart: number,
    intColEnd: number
  ): void;
  getStars(): Readonly<Star[]>;  // test-only
}
```

`Star` is updated as specified above.

---

## Test Coverage

### Tests to remove

- Star `y` advances by `speed * dt / 1000` per layer
- Star at `INT_ROW_END` wraps to `INT_ROW_START`
- Wrapped star receives a new random col
- `twinkled` flag is false at start of each update cycle
- `twinkleTimer` decrements by `dt`
- When timer ≤ 0, `twinkled` set true and timer resets
- Twinkled star renders bright colour for one frame then reverts

### Tests to add

**Initialisation:**
- Each star has `row` (not `y`) and it is an integer within `[intRowStart, intRowEnd]`
- Each star has `twinklePhase` in `[0, 2π)` at initialisation
- Each star has `twinklePeriod` within its layer's range (Layer 0: 4000–9000, Layer 1: 2000–5000, Layer 2: 800–2500)
- Two instances with the same seed produce identical initial phases and periods

**`update(dt)` — no scrolling:**
- After `update(dt)`, all star `row` values are unchanged
- After `update(dt)`, all star `col` values are unchanged

**`update(dt)` — phase advance:**
- After `update(dt)`, `star.twinklePhase` increases by `(2π / star.twinklePeriod) * dt`

**`render(buffer)` — brightness states:**
- Star with `sin(phase) ≥ 0.5`: Layer 0 renders `white`, Layer 1 renders `bright-white`, Layer 2 renders `bright-cyan`
- Star with `-0.5 ≤ sin(phase) < 0.5`: Layer 0 renders `bright-black`, Layer 1 renders `white`, Layer 2 renders `bright-white`
- Star with `sin(phase) < -0.5`: Layer 0 is **not rendered** (cell stays as background), Layer 1 renders `bright-black`, Layer 2 renders `white`

**Unchanged tests to keep:**
- 33 stars total (18 + 10 + 5)
- Layer distribution exactly 18/10/5
- All stars have `col` within interior col range
- Two instances with the same seed produce identical positions
- Layer 0 renders `.`, Layer 1 renders `*`, Layer 2 renders `+`
- Near star (layer 2) overwrites far star (layer 0) at shared cell

---

## Acceptance Criteria

- ✓ Stars are stationary — no row or col position changes after any number of `update` calls
- ✓ Each star cycles smoothly through dim / normal / bright states; no single-frame flicker
- ✓ Layer 0 stars become invisible at the bottom of their dim phase
- ✓ Layer 2 stars twinkle noticeably faster than layer 0 stars
- ✓ Space station drift continues unchanged
- ✓ All new tests pass
- ✓ All existing tests continue to pass
- ✓ `tsc --noEmit` passes with zero errors
- ✓ `npm run build` succeeds
- ✓ `init.sh` passes before and after
- ✓ Play-test browser (`npm run dev`): enter Ship scene; stars are stationary; individual stars visibly brighten and dim over 10 s; station drifts; no scrolling rain effect
- ✓ Play-test terminal (`npm run terminal`): same

---

## Notes for Engineer

- The LCG is already private to `Starfield.ts`. Use it for `twinklePhase` and
  `twinklePeriod` initialisation exactly as it was used for `y` and `col`.
- `twinklePhase` advances continuously — no wrap or reset needed since `sin` is periodic.
- To force a specific brightness in a test, construct the star with a known `twinklePhase`
  (e.g. `Math.PI / 2` → `sin = 1` → bright state) and call `render` without calling
  `update`. Do not expose internal phase setters; use `getStars()` to read and a test
  helper to construct controlled states.
- `ShipScene.update(dt)` already forwards `dt` to `this.starfield.update(dt)` — no
  change needed there.
- Do not add a `mode` flag or any other branching to `Starfield`. This is the only
  usage site and the scrolling behaviour is fully replaced.
- The `ship-scene.test.ts` assertion "at least one non-space cell in interior region
  after render" still passes because normal-state stars are always rendered. No changes
  needed to ship scene tests.
