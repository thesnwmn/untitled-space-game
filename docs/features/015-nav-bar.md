# Feature 015: Station Nav Bar

**Status:** READY
**Depends on:** 011

## Summary

Add a two-row nav bar at the top of every station-context screen
(StationMenuScene, TraderScene, MissionBoardScene):

- **Row 0** — station name (all caps, centered, `bright-cyan`)
- **Row 1** — context-specific navigation buttons (centered, `white`)

Both the station name and the set of nav buttons are provided by each scene.

The buttons read as a **breadcrumb trail** — outermost destination on the left,
nearest destination on the right — so the order is always `[UNDOCK]` then `[HUB]`.

Additional navigation changes bundled with this feature:

| Screen | ESC / BACK | Nav buttons (left → right) |
|---|---|---|
| StationMenuScene | Undock (new) | `[UNDOCK]` |
| TraderScene | Return to hub (unchanged) | `[UNDOCK]  [HUB]` |
| MissionBoardScene | Return to hub (unchanged) | `[UNDOCK]  [HUB]` |

StationMenuScene's scene title changes from the station name to **"HUB"**, and its
**UNDOCK menu item is removed** — undocking is now done via ESC or the nav bar.

---

## NavBar Component

### File: `src/game/ui/NavBar.ts`

Pure rendering and hit-testing helper; scenes own all state.

```typescript
export interface NavOption {
  id: string;
  label: string;  // rendered as [LABEL]
}

export class NavBar {
  constructor(stationName: string, options: ReadonlyArray<NavOption>)

  render(buffer: CharBuffer): void
  // Row 0: stationName centered, bright-cyan
  // Row 1: buttons centered, white; each button is "[LABEL]"; one space between
  // Caches button column ranges for hitTest after every render call.

  hitTest(col: number, row: number): string | null
  // Returns the id of the tapped option, or null.
  // Only row 1 is tappable (row 0 is informational).
  // Uses column ranges cached by the most recent render() call.
  // Returns null if render() has never been called.
}
```

### Button layout computation

```
buttonStrings[i] = `[${options[i].label}]`
totalWidth       = sum(buttonStrings.map(s => s.length)) + (N - 1)  // 1 space gap
startCol         = Math.floor((w - totalWidth) / 2)
```

Each button occupies consecutive columns from `startCol` (accumulated by prior
buttons and gaps). These ranges are stored after each `render()` call and
reused by `hitTest()`.

---

## Visual Layout

### TraderScene / MissionBoardScene (hub + undock)

```
        ELYSIUM STATION          ← row 0, bright-cyan, centered
        [UNDOCK] [HUB]           ← row 1, white, centered (breadcrumb: outer → inner)
        MERCHANT KESS            ← row 2, scene title, unchanged
        =============            ← row 3, rule, unchanged
```

Rows 0 and 1 were previously blank, so inserting the two-row nav bar there
does not move any existing content.

### StationMenuScene (undock only)

```
        ELYSIUM STATION          ← row 0, bright-cyan, centered
           [UNDOCK]              ← row 1, white, centered
                                 ← row 2 empty
              HUB                ← row 2, scene title (was station name), unchanged row
              ===                ← row 3, rule (3 chars to match "HUB")
                                 ...
           >  TRADER             ← items start at row 14 (unchanged)
              MISSION BOARD
```

---

## Scene Changes

### StationMenuScene

**Title passed to BaseMenuScene:** `'HUB'` (was `STATION_NAME.toUpperCase()`)

**Items passed to BaseMenuScene:**
```typescript
[
  { label: 'TRADER',        action: onTrader },
  { label: 'MISSION BOARD', action: onMissionBoard },
  // UNDOCK removed
]
```

**New field:**
```typescript
private navActivated = false;
private readonly navBar = new NavBar(
  STATION_NAME.toUpperCase(),
  [{ id: 'undock', label: 'UNDOCK' }],
);
```

**Override render():**
```typescript
override render(buffer: CharBuffer): void {
  super.render(buffer);       // clears buffer, draws HUB title, items, footer
  this.navBar.render(buffer); // overlays nav bar on the now-blank rows 0–1
}
```

**Additional onAction handler** (registered in StationMenuScene's constructor,
after `super()`):
```typescript
inputHandler.onAction((action) => {
  if (this.navActivated) return;
  if (action === 'BACK') {
    this.navActivated = true;
    onShip();
  }
});
```

**Additional onTap handler:**
```typescript
if (inputHandler.onTap) {
  inputHandler.onTap((col, row) => {
    if (this.navActivated) return;
    if (this.navBar.hitTest(col, row) === 'undock') {
      this.navActivated = true;
      onShip();
    }
  });
}
```

**Constructor signature: unchanged.**
`(inputHandler, context, onTrader, onMissionBoard, onShip)`

---

### TraderScene

**Constructor signature change:**
```
before: (inputHandler, context, onBack: () => void)
after:  (inputHandler, context, onHub: () => void, onUndock: () => void)
```

`onBack` is renamed `onHub`; `onUndock` is added. The BACK action continues
to call `onHub` (same behaviour, clearer name).

**New field:**
```typescript
private readonly navBar = new NavBar(
  STATION_NAME.toUpperCase(),
  [{ id: 'undock', label: 'UNDOCK' }, { id: 'hub', label: 'HUB' }],
);
```

**render():** call `this.navBar.render(buffer)` immediately after the
buffer-clear loop.

**onTap handler — check nav bar first:**
```typescript
if (this.activated) return;
const navHit = this.navBar.hitTest(col, row);
if (navHit === 'hub')    { this.activated = true; onHub();    return; }
if (navHit === 'undock') { this.activated = true; onUndock(); return; }
// existing tab/item checks unchanged
```

**BACK action:** calls `onHub()` (renamed from `onBack`, same behavior).

---

### MissionBoardScene

Identical changes to TraderScene.

---

### main.ts and terminal.ts

```typescript
// before
new TraderScene(input, ctx, goToStation)
new MissionBoardScene(input, ctx, goToStation)

// after
new TraderScene(input, ctx, goToStation, goToShip)
new MissionBoardScene(input, ctx, goToStation, goToShip)
```

`goToShip` already exists in both files. No new top-level functions needed.

---

## Test Coverage

### `src/game/ui/NavBar.test.ts` (14 tests)

Use a buffer wide enough to clearly show centering (e.g. 40 cols).

| # | Description |
|---|---|
| 1 | Station name text appears on row 0 |
| 2 | Station name is centered (first char at expected col) |
| 3 | Station name color is `bright-cyan` |
| 4 | Single option `[UNDOCK]` appears on row 1 centered |
| 5 | Two options: `[UNDOCK]` appears at computed start col on row 1 |
| 6 | Two options: `[HUB]` appears one space after `[UNDOCK]` |
| 7 | Button text color is `white` |
| 8 | `hitTest` on row 0 → `null` (station name row is not interactive) |
| 9 | `hitTest` on `[UNDOCK]` col range, row 1 → `'undock'` |
| 10 | `hitTest` on gap col between buttons → `null` |
| 11 | `hitTest` on `[HUB]` col range, row 1 → `'hub'` |
| 12 | `hitTest` past last button col → `null` |
| 13 | Single option: `hitTest` on `[UNDOCK]` col range → `'undock'` |
| 14 | `hitTest` before render → `null` |

### StationMenuScene changes (6 tests: 4 new, 2 updated)

| # | Description |
|---|---|
| 1 | Nav bar row 0 contains station name text |
| 2 | Nav bar row 1 contains `[UNDOCK]` |
| 3 | Scene title at row 2 reads `HUB` |
| 4 | No UNDOCK text appears in the menu item rows (14–15) |
| 5 | ESC fires `onShip` once and silences further input |
| 6 | Tap on `[UNDOCK]` nav button fires `onShip` |

### TraderScene changes (4 new tests, 1 updated)

| # | Description |
|---|---|
| 1 | Nav bar row 0 contains station name text |
| 2 | Nav bar row 1 contains both `[HUB]` and `[UNDOCK]` |
| 3 | Tap on `[HUB]` nav button fires `onHub` and silences input |
| 4 | Tap on `[UNDOCK]` nav button fires `onUndock` and silences input |
| — | Existing ESC test updated: callback name `onBack` → `onHub` |

### MissionBoardScene changes

Same four new tests and one updated test as TraderScene.

---

## Acceptance Criteria

- ✓ `NavBar` component passes all unit tests
- ✓ All station screens show station name at row 0 and nav buttons at row 1, both centered
- ✓ StationMenuScene shows "HUB" as scene title; no UNDOCK menu item
- ✓ ESC at hub → undocks to ship scene
- ✓ ESC at trader / mission board → returns to hub
- ✓ Tapping `[HUB]` returns to hub; tapping `[UNDOCK]` goes to ship
- ✓ `tsc --noEmit` zero errors
- ✓ All tests pass
- ✓ `npm run build` succeeds
- ✓ `init.sh` passes before and after

---

## Play-Test Instructions

1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — all tests pass
3. **Browser** `npm run dev` — navigate to station:
   - Hub: "ELYSIUM STATION" at top, "[UNDOCK]" centered below, "HUB" scene title, two menu items (TRADER / MISSION BOARD), no UNDOCK item
   - Press ESC at hub → goes to Ship scene; ESC / DOCK returns to hub
   - Open TRADER: "ELYSIUM STATION" at top, "[UNDOCK] [HUB]" below
     - Tap `[HUB]` → returns to hub
     - Re-open TRADER, tap `[UNDOCK]` → goes to Ship scene
     - Re-open TRADER, press ESC → returns to hub
   - Repeat above from MISSION BOARD
4. **Touch emulation** (DevTools): all nav button taps produce the same results
5. **Terminal** `npm run terminal`: nav bar visible at top of each station screen; ESC navigates correctly throughout
