# Feature 015: Station Nav Bar

**Status:** READY
**Depends on:** 011

## Summary

Add a persistent navigation bar at row 0 of every station-context screen
(StationMenuScene, TraderScene, MissionBoardScene). The bar shows up to two
buttons: `[HUB]` (return to StationMenuScene) and `[UNDOCK]` (go directly to
ShipScene). `[HUB]` is omitted when the player is already at the hub. The bar
provides a tappable physical control integrated with the world context, in
addition to existing keyboard shortcuts.

ShipScene receives no nav bar: it is already outside the station context and
has its own DOCK/JUMP controls.

---

## NavBar Component

### File: `src/game/ui/NavBar.ts`

The component is a pure rendering and hit-testing helper — scenes own all
state, following the same pattern as the planned `Pager` component.

```typescript
export class NavBar {
  constructor(showHub: boolean)

  render(buffer: CharBuffer): void
  hitTest(col: number, row: number): 'hub' | 'undock' | null
}
```

`showHub` is set at construction time and does not change during a scene's
lifetime (a scene either is or is not the hub).

### Visual layout: hub + undock (sub-scenes)

```
 [HUB] [UNDOCK]
 ^     ^
 col 1  col 7
```

- `[HUB]` — cols 1–5, row 0, color `white`
- `[UNDOCK]` — cols 7–14, row 0, color `white`

### Visual layout: undock only (StationMenuScene)

```
 [UNDOCK]
 ^
 col 1
```

- `[UNDOCK]` — cols 1–8, row 0, color `white`

### hitTest logic

```
row !== 0                            → null
showHub && col in [1, 5]             → 'hub'
showHub && col in [7, 14]            → 'undock'
!showHub && col in [1, 8]            → 'undock'
otherwise                            → null
```

---

## Row layout (all station scenes after this change)

```
Row 0:  [HUB] [UNDOCK]  ← nav bar (or [UNDOCK] alone at hub)
Row 1:  (empty)
Row 2:  TITLE           ← bright-cyan, unchanged
Row 3:  =====           ← cyan rule, unchanged
...
```

Nothing below row 0 moves. The nav bar occupies a previously blank row.

---

## Integration: TraderScene

### Constructor signature change

```
before: (inputHandler, context, onBack: () => void)
after:  (inputHandler, context, onHub: () => void, onUndock: () => void)
```

`onBack` is renamed `onHub`; `onUndock` is added. The BACK action continues
to call `onHub` (same behaviour, clearer name).

### New field

```typescript
private readonly navBar = new NavBar(true);
```

### render()

Call `this.navBar.render(buffer)` immediately after the buffer-clear loop,
before any other draw calls.

### onTap handler — check nav bar first

```typescript
if (this.activated) return;
const navAction = this.navBar.hitTest(col, row);
if (navAction === 'hub') { this.activated = true; onHub(); return; }
if (navAction === 'undock') { this.activated = true; onUndock(); return; }
// existing tab/item checks follow unchanged
```

---

## Integration: MissionBoardScene

Identical pattern to TraderScene:

- Constructor: replace `onBack` with `onHub`, add `onUndock`.
- Field: `private readonly navBar = new NavBar(true)`.
- `render()`: call `this.navBar.render(buffer)` after clear.
- `onTap`: nav bar hit test before mission row checks.
- BACK action: `onHub()` (renamed from `onBack`, same behaviour).

---

## Integration: StationMenuScene

StationMenuScene extends BaseMenuScene, whose constructor registers all tap
handling. To add nav bar support without altering BaseMenuScene:

1. Store `onShip` as a field (it is already passed to the constructor).
2. Register an additional `onTap` handler in StationMenuScene's own
   constructor, guarded by a local `navActivated` flag.
3. Override `render()` to call `super.render()` then `this.navBar.render()`.

```typescript
export class StationMenuScene extends BaseMenuScene {
  private navActivated = false;
  private readonly navBar = new NavBar(false);

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    onTrader: () => void,
    onMissionBoard: () => void,
    onShip: () => void,
  ) {
    super(STATION_NAME.toUpperCase(), [...], inputHandler, context);

    if (inputHandler.onTap) {
      inputHandler.onTap((col, row) => {
        if (this.navActivated) return;
        if (this.navBar.hitTest(col, row) === 'undock') {
          this.navActivated = true;
          onShip();
        }
      });
    }
  }

  override render(buffer: CharBuffer): void {
    super.render(buffer);          // clears buffer, draws title/items/footer
    this.navBar.render(buffer);    // overlays nav bar at row 0
  }
}
```

The constructor signature of StationMenuScene is unchanged. `navActivated` is
separate from BaseMenuScene's private `activated`; both independently guard
against double-fire.

---

## main.ts and terminal.ts changes

```typescript
// before
function goToTrader()       { currentScene = new TraderScene(input, ctx, goToStation); }
function goToMissionBoard() { currentScene = new MissionBoardScene(input, ctx, goToStation); }

// after
function goToTrader()       { currentScene = new TraderScene(input, ctx, goToStation, goToShip); }
function goToMissionBoard() { currentScene = new MissionBoardScene(input, ctx, goToStation, goToShip); }
```

`goToShip` already exists (wires up ShipScene). No new top-level functions needed.

---

## Footer hints

No changes. The nav bar is self-documenting by its placement. Existing keyboard
hint (`ESC return`) and touch hint (`2-finger exit`) remain as-is.

---

## Test Coverage

### `src/game/ui/NavBar.test.ts` (12 tests)

| # | Description |
|---|---|
| 1 | `render` writes `[` at row 0, col 1 when `showHub: true` |
| 2 | `render` writes `[` at row 0, col 7 (start of UNDOCK) when `showHub: true` |
| 3 | `render` writes `[` at row 0, col 1 (start of UNDOCK) when `showHub: false` |
| 4 | `render` does not write `H` at row 0, col 2 when `showHub: false` |
| 5 | `hitTest(1, 0)` → `'hub'` when `showHub: true` |
| 6 | `hitTest(5, 0)` → `'hub'` (last col of `[HUB]`) when `showHub: true` |
| 7 | `hitTest(6, 0)` → `null` (gap col) when `showHub: true` |
| 8 | `hitTest(7, 0)` → `'undock'` when `showHub: true` |
| 9 | `hitTest(14, 0)` → `'undock'` (last col of `[UNDOCK]`) when `showHub: true` |
| 10 | `hitTest(15, 0)` → `null` when `showHub: true` |
| 11 | `hitTest(1, 0)` → `'undock'` when `showHub: false` |
| 12 | `hitTest(1, 1)` → `null` (wrong row) |

### `TraderScene` updates (4 tests — replaces 1 existing)

| # | Description |
|---|---|
| 1 | `render` writes `[HUB]` starting at row 0, col 1 |
| 2 | `render` writes `[UNDOCK]` starting at row 0, col 7 |
| 3 | Tap at (col 1, row 0) calls `onHub` and silences further input |
| 4 | Tap at (col 7, row 0) calls `onUndock` and silences further input |
| — | Existing ESC test updated: parameter renamed `onBack` → `onHub` |

### `MissionBoardScene` updates (4 tests — replaces 1 existing)

Same four tests as TraderScene.

### `StationMenuScene` additions (3 tests)

| # | Description |
|---|---|
| 1 | `render` writes `[UNDOCK]` starting at row 0, col 1 |
| 2 | `render` does not write `[HUB]` (row 0, col 1 is `[`, but col 2 is `U` not `H`) |
| 3 | Tap at (col 1, row 0) calls `onShip` |

---

## Acceptance Criteria

- ✓ `NavBar` component passes all unit tests
- ✓ `StationMenuScene` shows `[UNDOCK]` at row 0; tapping it undocks
- ✓ `TraderScene` shows `[HUB] [UNDOCK]` at row 0; tapping each fires correct callback
- ✓ `MissionBoardScene` shows `[HUB] [UNDOCK]` at row 0; tapping each fires correct callback
- ✓ ESC still fires `onHub` in TraderScene and MissionBoardScene (unchanged)
- ✓ Two-finger tap still fires BACK (unchanged)
- ✓ `tsc --noEmit` zero errors
- ✓ All tests pass
- ✓ `npm run build` succeeds
- ✓ `init.sh` passes before and after

---

## Play-Test Instructions

1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — all tests pass
3. **Browser** `npm run dev`:
   - Navigate to station hub — `[UNDOCK]` visible at top; tap it → goes to Ship scene
   - Navigate to TRADER — `[HUB]` and `[UNDOCK]` visible at top
     - Tap `[HUB]` → returns to station menu
     - Re-enter TRADER, tap `[UNDOCK]` → goes to Ship scene
   - Repeat above from MISSION BOARD
   - Confirm ESC still returns to hub from TRADER and MISSION BOARD
4. **Touch emulation** (DevTools): tap each nav button in all three scenes;
   two-finger tap still works as before
5. **Terminal** `npm run terminal`: nav bar visible at top of each station scene;
   ESC navigates as before
