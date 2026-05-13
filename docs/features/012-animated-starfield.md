# Feature 012: Animated Starfield & Space Station View — Ship Scene

**Status:** READY
**Depends on:** 011 (ShipScene must exist)

## Summary

Overhaul the Ship scene's visual layout with three changes:

1. The ship viewport fills all rows between the status/location header and the action area, framed by an ASCII border that reads as a cockpit window.
2. The three-layer parallax starfield fills the window interior and continues to scroll.
3. A space station is always visible inside the viewport, gently drifting on a sinusoidal path — it never exits the window.

---

## Layout

### Full-screen layout (40 × 30 reference grid)

```
Row 0:  FUEL:100% | CARGO:0/50T | CR:5000        ← status bar (bright-cyan)
Row 1:  Location: KEPLER STATION                  ← location (bright-cyan)
Row 2:  \______________________________________/   ← window top border
Row 3:  |  .          *       .         .      |  ← starfield interior
Row 4:  |        .                  *          |
  ...   |     (stars and station here)         |
Row 25: |     .    [*]      .       *          |
Row 26: /______________________________________\   ← window bottom border
Row 27:           > [ J ] JUMP                    ← JUMP button (bright-yellow)
Row 28:             [ D ] DOCK                    ← DOCK button (bright-yellow)
Row 29:        ↑↓ navigate   ENTER select         ← footer hint (bright-black)
```

The layout uses `h = buffer.length` and `w = buffer[0].length` so it adapts to terminal
size. All row constants below are expressed relative to `h` and `w`.

### Window border

```
WINDOW_TOP    = 2
WINDOW_BOTTOM = h - 4
INT_ROW_START = WINDOW_TOP + 1          // first interior row (row 3 on 30-row grid)
INT_ROW_END   = WINDOW_BOTTOM - 1       // last interior row  (row 25 on 30-row grid)
INT_COL_START = 1                       // first interior col
INT_COL_END   = w - 2                   // last interior col  (col 38 on 40-col grid)
```

Border characters (all `bright-black` on `black`):

| Position             | Char |
|----------------------|------|
| Top-left (WINDOW_TOP, 0)          | `\`  |
| Top-right (WINDOW_TOP, w-1)       | `/`  |
| Top fill (WINDOW_TOP, 1 … w-2)    | `_`  |
| Bottom-left (WINDOW_BOTTOM, 0)    | `/`  |
| Bottom-right (WINDOW_BOTTOM, w-1) | `\`  |
| Bottom fill (WINDOW_BOTTOM, 1 … w-2) | `_` |
| Left side (INT_ROW_START … INT_ROW_END, 0)   | `\|` |
| Right side (INT_ROW_START … INT_ROW_END, w-1) | `\|` |

### Action area

```
JUMP_ROW   = h - 3
DOCK_ROW   = h - 2
FOOTER_ROW = h - 1
```

---

## Starfield

### Layers

| Layer | Stars | Char | Colour        | Speed (rows/sec) | Meaning      |
|-------|-------|------|---------------|-----------------|--------------|
| 0     | 18    | `.`  | `bright-black`| 1.5             | Distant      |
| 1     | 10    | `*`  | `white`       | 4.0             | Mid-field    |
| 2     | 5     | `+`  | `bright-white`| 9.0             | Near / fast  |

Total: 33 stars simultaneously on screen.

### Star bounds

Stars are confined to the window interior:

- `y` (floating-point): `[INT_ROW_START, INT_ROW_END]`
- `col` (integer): `[INT_COL_START, INT_COL_END]`

When `y > INT_ROW_END`, the star wraps: `y = INT_ROW_START`, new random col drawn
from `[INT_COL_START, INT_COL_END]` via LCG.

### Twinkle

Each star has an independent twinkle timer. When it fires the star upgrades colour
for exactly one render frame, then reverts. Timer resets to a random value in
[800, 3000] ms.

| Layer | Normal colour | Twinkle colour |
|-------|---------------|----------------|
| 0     | `bright-black`| `white`        |
| 1     | `white`       | `bright-white` |
| 2     | `bright-white`| `bright-cyan`  |

### Motion direction

Stars move **downward** (y increases), reading as the ship moving forward through
space.

---

## Space Station

### Overview

One space station is permanently visible in the viewport. It has a fixed type (shape
and colour defined in a catalogue) and a slowly drifting position that oscillates
sinusoidally in both axes. The clamping rule guarantees it can never exit the window.

### Station type catalogue (`station-types.ts`)

Four built-in types. The catalogue will grow as future modular station docs are added.
Each type is a named constant in `station-types.ts`; `ShipScene` imports the one it
needs.

**BEACON** — navigation beacon, 2 rows × 3 cols, colour `bright-yellow`:
```
[*]
 |
```

**RELAY** — communications relay, 3 rows × 5 cols, colour `bright-yellow`:
```
>---<
 |*|
  |
```

**RING** — orbital ring station, 3 rows × 3 cols, colour `cyan`:
```
/-\
|O|
\-/
```

**HUB** — central trading hub, 5 rows × 5 cols, colour `white`:
```
  *
--+--
 [H]
  |
  *
```

The initial implementation uses **RELAY**. The Engineer must not change the catalogue
without a Designer session.

### Data structures

```typescript
interface StationGlyph {
  rows: string[];  // each string is one row of ASCII art; rows may differ in length
  fg: Color;       // foreground colour applied to every non-space char
}

interface SpaceStationDef {
  name: string;
  glyph: StationGlyph;
}

interface SpaceStationState {
  def: SpaceStationDef;
  anchorRow: number;   // interior row for the glyph's top edge, fixed at construction
  anchorCol: number;   // interior col for the glyph's left edge, fixed at construction
  time: number;        // accumulated ms, reset to 0 on construction
}
```

### Anchor placement

The anchor is computed once in the `SpaceStation` constructor from the interior
dimensions passed in at construction time:

```
anchorRow = INT_ROW_START + floor((INT_ROW_END - INT_ROW_START) / 2) - floor(glyphHeight / 2)
anchorCol = INT_COL_START + floor((INT_COL_END - INT_COL_START) * 0.60) - floor(glyphWidth / 2)
```

This places the station centre at roughly 50% vertical, 60% horizontal — right-of-centre
so it does not occlude the busiest part of the star field.

### Drift motion

The station oscillates around its anchor using two independent sinusoids with different
periods, producing a Lissajous-like path:

```
driftRow = round(AMP_ROW * sin(time * ω_ROW))
driftCol = round(AMP_COL * sin(time * ω_COL + π/3))

displayRow = anchorRow + driftRow
displayCol = anchorCol + driftCol
```

Drift parameters:

| Param    | Value                            | Notes                     |
|----------|----------------------------------|---------------------------|
| AMP_ROW  | 2                                | rows of vertical range    |
| AMP_COL  | 3                                | cols of horizontal range  |
| ω_ROW    | 2π / 9000 rad/ms                 | one full cycle per 9 s    |
| ω_COL    | 2π / 12000 rad/ms                | one full cycle per 12 s   |
| phase    | π/3 on col axis                  | prevents x–y alignment    |

After computing `displayRow` / `displayCol`, clamp to keep the glyph fully inside
the interior:

```
displayRow = clamp(displayRow, INT_ROW_START, INT_ROW_END - glyphHeight + 1)
displayCol = clamp(displayCol, INT_COL_START, INT_COL_END - glyphWidth + 1)
```

Because `AMP_ROW = 2` and `AMP_COL = 3`, and the anchor is placed clear of the walls,
clamping should never activate during normal play — it is a safety net only.

### Rendering the station

Draw each glyph character at `(displayRow + r, displayCol + c)`. **Skip space
characters** — this composites the station onto the starfield without overwriting the
background.

Draw order: stars first, station second (station glyphs overwrite stars at the same
cell).

Station colour: `fg` from the `StationGlyph`; `bg` always `'black'`.

---

## State

### Star data structure

```typescript
interface Star {
  col: number;          // INT_COL_START–INT_COL_END, integer
  y: number;            // floating-point row within [INT_ROW_START, INT_ROW_END]
  layer: 0 | 1 | 2;
  twinkleTimer: number; // ms until next twinkle
  twinkled: boolean;    // true for exactly one render frame during a twinkle event
}
```

### Initialisation

Stars seeded with LCG seed `42`. Initial `y` values distributed across the full
interior height so the field looks populated from frame one. The station defaults to
RELAY type.

### LCG spec

```
next       = (state * 1664525 + 1013904223) & 0xFFFFFFFF
normalised = next / 0x100000000   // [0, 1)
```

Exposed as `lcgRand(): number` — a private helper inside `Starfield.ts` only.

---

## Behaviour

### `update(dt: number): void`

**Starfield — for each star:**

1. `y += SPEED[star.layer] * (dt / 1000)`.
2. If `y > INT_ROW_END`: `y = INT_ROW_START`, new random col via LCG.
3. Clear `star.twinkled` (false at start of each cycle).
4. `star.twinkleTimer -= dt`.
5. If `twinkleTimer <= 0`: `twinkled = true`, reset timer to random [800, 3000] ms via LCG.

**Space station:**

1. `state.time += dt`.
2. Compute `displayRow` and `displayCol` as above (lazy — only needed at render time).

### `render(buffer: CharBuffer): void`

1. Clear buffer to `{ char: ' ', fg: 'black', bg: 'black' }`.
2. Write status bar (row 0) and location (row 1).
3. Draw window border (bright-black) — top, bottom, sides.
4. Draw stars (layer 0 → 1 → 2, so near overwrites far).
5. Draw station on top of stars.
6. Draw JUMP / DOCK buttons and cursor.
7. Draw footer hint.

---

## Implementation

### Files to change

| File | Change |
|------|--------|
| `src/game/scenes/ShipScene.ts` | Updated layout constants; wire `Starfield` and `SpaceStation`; draw border |
| `src/game/scenes/Starfield.ts` | **New file** — `Starfield` class, updated interior bounds |
| `src/game/scenes/SpaceStation.ts` | **New file** — `SpaceStation` class (drift, render) |
| `src/game/scenes/station-types.ts` | **New file** — catalogue of built-in `SpaceStationDef` objects |
| `src/game/scenes/Starfield.test.ts` | **New file** — unit tests |
| `src/game/scenes/SpaceStation.test.ts` | **New file** — unit tests |
| `src/game/scenes/ship-scene.test.ts` | Update starfield/layout assertions |

### `Starfield` class interface

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

Passing interior bounds at render time (not constructor time) makes `Starfield`
reusable across differently-sized scenes.

### `SpaceStation` class interface

```typescript
class SpaceStation {
  constructor(
    def: SpaceStationDef,
    intRowStart: number,
    intRowEnd: number,
    intColStart: number,
    intColEnd: number
  );
  update(dt: number): void;
  render(buffer: CharBuffer): void;
  getDisplayPosition(): { row: number; col: number };  // test-only
}
```

The interior bounds are stored in the constructor so the station can compute its own
anchor and clamp without the caller passing them again at render time.

### `ShipScene` integration

```typescript
// Layout constants (computed from buffer dimensions in render())
const STATUS_ROW    = 0;
const LOCATION_ROW  = 1;
const WINDOW_TOP    = 2;
// WINDOW_BOTTOM = h - 4
// INT_ROW_START = WINDOW_TOP + 1
// INT_ROW_END   = h - 5
// INT_COL_START = 1
// INT_COL_END   = w - 2
// JUMP_ROW   = h - 3
// DOCK_ROW   = h - 2
// FOOTER_ROW = h - 1

// In ShipScene constructor (after reading an initial buffer size or using defaults):
this.starfield = new Starfield();
this.station   = new SpaceStation(STATION_TYPES.RELAY, intRowStart, intRowEnd, intColStart, intColEnd);

// In ShipScene.update(dt):
this.starfield.update(dt);
this.station.update(dt);

// In ShipScene.render(buffer):
const h = buffer.length, w = buffer[0].length;
const intRowStart = WINDOW_TOP + 1;
const intRowEnd   = h - 5;
const intColStart = 1;
const intColEnd   = w - 2;

// ... clear, status, location ...
// drawBorder(buffer, WINDOW_TOP, h - 4, w);
this.starfield.render(buffer, intRowStart, intRowEnd, intColStart, intColEnd);
this.station.render(buffer);
// ... buttons, footer ...
```

The `SpaceStation` constructor receives the interior bounds once; `render()` uses the
stored bounds and needs no extra arguments.

> **Construction-time sizing:** `ShipScene` needs to know `h` and `w` to pass interior
> bounds to `SpaceStation`. The simplest approach is to read them from the context or
> from a first `render()` call. The Engineer may defer `SpaceStation` construction to
> the first `render()` call (lazy init) to avoid needing dimensions in the constructor.
> Document the chosen approach in code.

---

## Test Coverage

### `Starfield.test.ts` — 15–18 tests

**Initialisation:**
- Creates 33 stars total (18 + 10 + 5)
- All stars have `y` within interior row range
- All stars have `col` within interior col range
- Layer distribution is exactly 18/10/5
- Two instances with the same seed produce identical initial positions

**`update(dt)`:**
- Stars advance `y` by `speed * (dt / 1000)` per layer
- Star at `y = INT_ROW_END` wraps to `INT_ROW_START`
- Wrapped star gets a (potentially different) new col
- `twinkled` is false at start of each update cycle
- `twinkleTimer` decrements by `dt`
- When timer ≤ 0: `twinkled` set to true, timer resets > 0

**`render(buffer)`:**
- Layer 0 renders `.` in `bright-black`
- Layer 1 renders `*` in `white`
- Layer 2 renders `+` in `bright-white`
- Twinkled layer 0 renders in `white`
- Twinkled layer 1 renders in `bright-white`
- Twinkled layer 2 renders in `bright-cyan`
- Near star (layer 2) overwrites far star (layer 0) at shared cell

### `SpaceStation.test.ts` — 8–10 tests

- Display position equals anchor (before any update, drift = 0)
- After `update(dt)`, display position may differ from anchor
- Display position stays within interior at quarter-period, half-period, full-period
- Large dt still clamps to interior (clamping safety net)
- Render writes glyph chars at computed display position with correct fg colour
- Space chars in glyph are **not** written to buffer
- Station glyph chars overwrite whatever was at the same cell (draw-order test)

### `ship-scene.test.ts` — updated

- Remove assertions tied to old static starfield positions
- Add: `update` forwarded to starfield (star y-positions advance after `scene.update(dt)`)
- Add: `update` forwarded to station (time accumulates)
- Add: border chars at `WINDOW_TOP` row (`\` at col 0, `_` in middle, `/` at w-1)
- Add: `|` chars at left/right edge in interior rows
- Add: at least one non-space cell in interior region after render
- Existing status bar, button, navigation, input-silencing tests: unchanged

---

## Acceptance Criteria

- ✓ Window border renders correctly: `\`/`/` corners, `_` top and bottom fills, `|` sides
- ✓ Stars are confined to the window interior (no star overwrites a border char)
- ✓ Stars scroll at three distinct speeds in both browser and terminal
- ✓ Stars wrap from bottom to top of interior with a new column
- ✓ Space station is visible in the right-centre area of the viewport on entry
- ✓ Station drifts visibly during a 15-second observation
- ✓ Station never exits the window border during a 60-second observation
- ✓ Twinkle fires on individual stars without disturbing neighbours
- ✓ All new tests pass
- ✓ All existing tests continue to pass (100/100)
- ✓ `tsc --noEmit` passes with zero errors
- ✓ `npm run build` succeeds
- ✓ `init.sh` passes before and after
- ✓ Play-test browser (`npm run dev`): enter Ship scene, observe station + three star
  speeds, watch twinkle fire at least once in 10 s
- ✓ Play-test terminal (`npm run terminal`): same

---

## Notes for Engineer

- `dt` is in milliseconds in all existing scenes — confirm before writing speed arithmetic.
- The LCG helper is **private** to `Starfield.ts`. `SpaceStation` uses `Math.sin`
  directly (deterministic given `time`), so no shared PRNG is needed.
- Terminal refresh rate is ~30 fps. At that rate a near star (9 rows/s) moves 0.3 cells
  per frame — perceptible as motion. The station's drift (~0.04 rows per frame at peak)
  is subtle but visible over several seconds.
- The twinkle colour upgrade is per-frame only. Do not latch it across frames.
- Do not implement multiple stations or shooting stars in this feature.
- `station-types.ts` is the extension point for future station definitions. Future
  engineers will add entries there once modular station docs are written; no changes to
  `SpaceStation.ts` should be required.
- If lazy-init is chosen for `SpaceStation` construction (to read buffer dimensions),
  guard the `update()` path: skip if the station is not yet constructed.
- Avoid `Math.random()` in `Starfield`. Use the LCG. To force a twinkle in a test,
  set `star.twinkleTimer = 0` and call `update(1)`.
