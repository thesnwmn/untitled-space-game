# Feature 036 · Cockpit Ship View

## Goal

Replace the current ship view with an animated cockpit-style display: a coloured gauge strip, a borderless starfield viewport with floating crosshair and HUD overlay, a bottom section with two button panels flanking a radar, and a single-line info/comms ticker.

---

## Acceptance criteria

- The screen is divided into six horizontal zones: screen chrome header (2 rows + gap), gauge strip (2 rows), starfield viewport (variable, grows with grid height), bottom panels (5 rows), info/comms ticker (1 row), screen chrome footer nav bar (1 row)
- Four gauges render as label char + 10 fill cells each; filled cells use a solid coloured background, empty cells use `bright-black` background
- Fuel and cargo gauges are stacked (row 2 / row 3) on the left side of the gauge strip; shields and hull gauges are stacked on the right side; each pair is flanked by button clusters
- Shield and hull gauges display placeholder full values until those player stats are added in a later feature
- Gauge fill for fuel and cargo reflects live `PlayerState` values
- A gauge at or below 20% fill blinks — its filled cells alternate between their colour and `bright-black` on approximately a 1-second cycle
- Button clusters in the gauge strip and bottom panels contain `●` `○` `▪` `◉` chars at irregular positions; each button cycles independently between an active colour and `bright-black` dim state every 2–8 seconds
- The starfield renders from the existing `Starfield` class across the full 40-column width with no border frame
- HUD stats (velocity, attitude, rotation) overlay the first row of the starfield as static placeholder text in `bright-black`
- A crosshair renders in the starfield with a centre `╋` and four floating bracket corners (`┌ ┐ └ ┘`) that are spaced several columns and rows away from the centre — neither tight to the centre nor at the viewport edges
- The radar in the bottom section is a solid `bright-black` background block with no drawn border; 3–6 contacts drift slowly within it as `○` and `◈` characters, wrapping when they reach the radar boundary
- Each radar edge (top row, bottom row, left column, right column) shows the corresponding arrow character (`▴` `▾` `◂` `▸`) when any contact is within approximately 2 cells of that edge; otherwise that edge cell is part of the dark field; multiple edge arrows can appear simultaneously
- Two button panels flank the radar; the left panel contains TRAVEL rendered as a word with amber (`yellow`) background; the right panel contains DOCK rendered with cyan background
- DOCK is dimmed (`bright-black` background) when the player has no current destination (is in open space)
- Pressing SELECT with cursor on TRAVEL (or tapping the TRAVEL area) triggers `onTravel`; pressing SELECT with cursor on DOCK (or tapping the DOCK area) triggers `onDock` when a destination exists
- UP / DOWN keyboard navigation moves the cursor between TRAVEL and DOCK
- The active action (cursor position) is indicated by a brighter or inverted state on the corresponding word
- Tapping the cargo gauge area (rows 2–3, cargo gauge columns) triggers `onCargo`
- The bottom-of-screen ticker row is split left (~27 cols) and right (~13 cols); the left portion scrolls a queue of preset flavour strings leftward; the right portion shows a speaker icon `◁` and the text `CLEAR` as a static placeholder, on a `bright-black` background to visually separate it
- Ticker messages are prefixed with `>` and separated by a brief pause and dot-separator between entries
- All animations (button flickers, radar drift, ticker scroll) are driven by the `dt` argument passed to `update()`; no `setTimeout` or `Date.now()` calls
- The scene renders without errors at both `MIN_GRID_HEIGHT` (30 rows) and `MAX_GRID_HEIGHT` (50 rows); the starfield viewport absorbs the extra rows

---

## Out of scope

- Real shield and hull player stats (gauges show placeholders)
- Animated speaker grill or real comms messages (comms section is a static placeholder)
- Radar contacts with gameplay significance
- Multiple cockpit layouts or ship-specific designs
- The `SpaceStation` model that currently renders inside the starfield — removed in this design
- The `[C] CARGO` text hint from the current view

---

## Technical notes

### Screen chrome

`ScreenChrome` is rendered with `showHeader: true` and `showFooter: true`. The footer nav bar carries a single option: CARGO (triggers `onCargo`). This keeps the CARGO shortcut visible now that the `[C] CARGO` hint inside the viewport is removed.

The chrome occupies rows 0–1 (header) and row `h-1` (footer). Row 2 is the chrome gap and is cleared to black by the scene before any other rendering. The gauge strip begins at row 3.

### New file

`src/game/scenes/ship-cockpit-scene.ts` — exports `ShipCockpitScene`, a class implementing the `Scene` interface. This file replaces `ship-scene.ts` in the orchestrators; `ship-scene.ts` is deleted.

The public constructor signature is identical to the current `ShipScene`:

```
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  player: PlayerState,
  onTravel: () => void,
  onDock: () => void,
  onCargo: () => void,
  starfieldSeed?: number,
)
```

The optional `starfieldSeed` parameter follows the pattern introduced in feature 025. If 025 is already merged, wire it the same way. If not, default to seed 42 and add a `// TODO 025` comment.

### Row layout

> strong suggestion — row allocations reflect explicit design intent

```
rows 0–1      : screen chrome header
row  2        : chrome gap (cleared to black)
rows 3–4      : gauge strip
rows 5–(h-8)  : starfield viewport
rows (h-7)–(h-3) : bottom panels (5 rows)
row  (h-2)    : info/comms ticker
row  (h-1)    : screen chrome footer nav bar
```

`h` is the live buffer height. The starfield is the only variable zone; at `h = 30` it occupies 18 rows, at `h = 50` it occupies 38 rows.

### Gauge strip (rows 3–4)

Five zones left to right across 40 columns:

| Zone | Width | Content |
|---|---|---|
| Left buttons | ~5 cols | button cluster |
| Fuel / Cargo | 11 cols | `F` + 10 fill cells (row 2) / `C` + 10 fill cells (row 3) |
| Mid buttons | ~4 cols | button cluster |
| Shields / Hull | 11 cols | `S` + 10 fill cells (row 2) / `H` + 10 fill cells (row 3) |
| Right buttons | ~5 cols | button cluster |

Gauge colours: fuel = `yellow`, cargo = `blue`, shields = `cyan`, hull = `green`. Fill fraction for fuel = `fuelL / fuelCapacityL`; for cargo = `cargoWeightKg / cargoCapacity`. Shield and hull are hardcoded to 1.0 (full) until those stats exist.

The blink for low gauges is keyed to a single accumulated phase in `update()` that all low gauges share, so they pulse together.

Button clusters in the strip use fixed but irregular col/row offsets — not a uniform grid. The exact positions are the Engineer's choice; the intent is deliberate asymmetry. Button state timers are per-button random values.

### Starfield viewport (rows 5 to h-8)

Reuse `Starfield` unchanged. Pass the viewport bounds (rows 5 to `h-8`, cols 0 to 39) into `render()`.

**HUD overlay** — row 5, written after the starfield renders so stars behind the text are overwritten:

> suggestion: `VEL:----` left-aligned at col 1, `ATT:---°` centred, `ROT:--°` right-aligned at col 38. All `bright-black` fg, `black` bg (transparent over starfield).

**Crosshair** — centre at the vertical midpoint of the viewport, col 20. Corner brackets float approximately 5 columns and 3 rows from centre. Rendered in `bright-green`. The brackets and centre char are drawn after the starfield so they appear over stars.

> suggestion: corners at ±5 cols, ±3 rows from centre. Engineer may adjust for visual balance.

### Bottom panels (rows h-7 to h-3, 5 rows)

Three zones across 40 columns:

| Zone | Width |
|---|---|
| Left panel (TRAVEL) | ~13 cols |
| Radar | ~14 cols |
| Right panel (DOCK) | ~13 cols |

**Radar zone**: fill every cell with a space on `bright-black` background — no border characters. Place 3–6 contacts at construction time with random positions and slow random drift velocities (sub-cell per second; accumulate fractional position). Contact chars alternate between `○` and `◈` on a slow individual timer for a flickering effect. Contacts wrap at the radar boundary. Edge detection: after updating positions, scan each edge row/column for contacts within 2 cells; place the arrow char on the nearest edge cell if found.

**Button panels**: same construction approach as the gauge strip clusters. TRAVEL / DOCK are full-width word buttons positioned in the bottom row of their panel (row `h-3`). They use a coloured background across their column span:
- TRAVEL: `black` fg on `yellow` bg; when cursor is on TRAVEL, swap to `bright-yellow` bg
- DOCK active: `black` fg on `cyan` bg; when cursor is on DOCK, swap to `bright-cyan` bg
- DOCK inactive (no destination): `bright-black` fg on `bright-black` bg

### Info/comms ticker (row h-2)

Left 27 cols: a scrolling display. Maintains an internal message queue (hardcoded array of 6–10 flavour strings, e.g. system status messages, ambient chatter). Scrolls the current message leftward one character every ~80 ms (accumulate dt). When a message fully exits the left edge, wait ~500 ms then begin the next. Prefix each message with `> `.

Right 13 cols: static. Render `◁ CLEAR` in `white` fg on `bright-black` bg, left-padded to the zone.

### Orchestrator changes

In both `main.ts` and `terminal.ts`: replace the `ShipScene` import with `ShipCockpitScene`. No other orchestrator changes needed beyond the import swap (constructor signature is identical).

### Input hit regions for tap

| Region | Action |
|---|---|
| Rows 3–4, cols spanning cargo gauge | `onCargo()` |
| Row h-3, cols within left bottom panel | `onTravel()` |
| Row h-3, cols within right bottom panel | `onDock()` if destination exists |
| Footer nav bar CARGO option (via ScreenChrome hit-test) | `onCargo()` |

---

## Play-test instructions

### Browser (`npm run dev`)

1. Undock from a station — confirm all four gauges render with coloured fill
2. Watch the gauge strip for ~10 s — button lights should flicker independently
3. Verify the starfield fills the full width with no border frame
4. Confirm HUD text appears at the top of the starfield and the crosshair floats with clear space around it
5. Watch the radar for ~15 s — contacts should drift slowly; edge arrows should appear and disappear as contacts approach edges
6. Confirm TRAVEL highlights when navigated to with UP/DOWN; pressing SELECT navigates away
7. Confirm DOCK is dimmed while in open space (undocked) and active at a destination
8. Watch the ticker — messages should scroll leftward and cycle
9. Resize the browser window to a tall aspect — verify the viewport grows and panels remain anchored at the bottom

### Terminal (`npm run terminal`)

Repeat steps 1, 6, 7, 8 using keyboard navigation.

---

## Dependencies

Feature 025 (randomise station star patterns) and feature 036 both touch `ShipScene` (now `ShipCockpitScene`) and the orchestrators. Either:
- Complete 025 first, then 036 adopts its `starfieldSeed` wiring as described above, or
- Complete 036 first with the seed stub, and treat 025 as superseded (the orchestrator seed logic in 025 should be applied to `ShipCockpitScene` instead)

Feature 035 (landing/take-off animations) does not modify `ShipScene` internally and can be merged in either order with this feature.
