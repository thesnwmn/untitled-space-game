# Feature 011: Game Scenes — Trader, Mission Board, Ship

**Status:** READY

## Summary

Add three new scenes accessible from the station menu, establishing a basic game loop where the player can navigate between the hub (station), trader, mission board, and ship. Each scene is visually distinct and supports returning to the hub.

## Scenes

### Trader Scene

**Access:** Station menu → TRADER

**Layout:**
- Title bar: `BRIGHT CYAN` trader name (e.g. "MERCHANT KESS") centred at row 2
- Rule: cyan `=` rule below title at row 3 (matching title width)
- Tabs at row 5: `[BUY]` and `[SELL]` tabs, 2 cols apart, starting at col 10
  - Active tab: bright-green
  - Inactive tab: white
- Content area rows 7–24: current tab's item list
  - Each item: `item-name ... price` (left-aligned item name, right-aligned price in credits)
  - 18 rows available, non-scrollable (fits ~6–8 items per tab for now)
  - Cursor: green `>` prefix on selected item (no activation on select yet)
- Footer at row 27: `[ ↑↓ navigate   ESC return ]` (keyboard) or `[ TAP to select   2-finger TAP to exit ]` (touch)

**Trader data:**
- Trader name (one of 3–4 hardcoded names, e.g. "MERCHANT KESS", "CARAVAN CORP", "VOID DEALER")
- Two fixed lists of 6–8 items each:
  - **BUY list:** items player can buy (ore, fuel, alloys, circuits, etc.)
  - **SELL list:** items player can sell (same or different items)
  - Each item has a name and price in credits (random within a range, e.g. 100–500)

**Behavior:**
- On open, default to BUY tab
- UP/DOWN cursor moves through current tab's items (wrapping)
- LEFT/RIGHT switches tabs
- SELECT on an item: no-op for now (logs placeholder)
- BACK or two-finger tap: return to station menu
- Touch tap on a tab: switches tabs
- Touch tap on an item row: selects it (no-op, log placeholder)

**Test coverage:**
- 10–12 tests: title/rule rendering, tab rendering (active/inactive), item list layout, cursor navigation (UP/DOWN wrap, LEFT/RIGHT tab switch), BACK action, tap on tabs, tap on items, SELECT on items

---

### Mission Board Scene

**Access:** Station menu → MISSION BOARD

**Layout:**
- Title: "MISSION BOARD" in bright-cyan centred at row 2
- Rule: cyan `=` rule below title at row 3
- Content area rows 5–24: list of missions (non-scrollable)
  - Each mission row (20 rows available): `[T]  mission-title ................ reward`
    - `[T]` = mission type icon/letter (e.g. `[R]` for Rescue, `[C]` for Combat, `[D]` for Delivery)
    - Type: bright-yellow or cyan
    - Mission title: white, left-aligned
    - Reward: right-aligned, bright-green
  - ~6–7 missions total (hardcoded for now)
  - Cursor: green `>` prefix on selected mission
- Footer at row 27: `[ ↑↓ navigate   ESC return ]` (keyboard) or `[ TAP to select   2-finger TAP to exit ]` (touch)

**Mission data:**
Each mission has:
- Type: 'rescue' | 'delivery' | 'combat' | 'salvage' (icon: R/D/C/S)
- Title: short description (e.g. "Find the Lost Crew", "Deliver Fuel Core", "Clear Pirates")
- Reward: integer credits (100–1000)

Hardcode 6–7 missions at the top of `MissionBoardScene.ts`.

**Behavior:**
- UP/DOWN cursor moves through missions (wrapping)
- SELECT on a mission: no-op for now (logs placeholder with mission title)
- BACK or two-finger tap: return to station menu
- Touch tap on a mission row: selects it (no-op, log placeholder)

**Test coverage:**
- 8–10 tests: title/rule rendering, mission list layout, type icons, cursor navigation (UP/DOWN wrap), BACK action, tap on missions, SELECT on missions

---

### Ship Scene

**Access:** Station menu → UNDOCK

**Layout:**
- No title/border (different visual style from menus)
- Row 1: status bar in bright-cyan: `FUEL: 100% | CARGO: 0/50 TONS | CREDITS: 5000`
  - Compact left-aligned info separated by `|`
- Row 2–25: "viewport" — static ASCII art of stars (Bright-black dots on black background)
  - Pattern: scattered `*` and `.` characters at various rows/cols, representing stars
  - Centre area row 14–16: slightly denser cluster
  - Starfield is static (no animation for now)
- Row 26–28: action buttons (centred, one per row)
  - Row 26: `[ J ] JUMP` (bright-yellow)
  - Row 27: `[ D ] DOCK` (bright-yellow)
  - Cursor: green `>` prefix on selected button (starts on JUMP)
- Footer at row 28: `[ ↑↓ navigate   ENTER select   ESC return ]` (keyboard) or `[ TAP to select   2-finger TAP to exit ]` (touch)

**Data (game state stub):**
- Player inventory: `{ fuel: 100, cargoTons: 0, credits: 5000 }`
- These are hardcoded for now and don't update (future feature: spending credits, consuming fuel, etc.)

**Behavior:**
- Startup: displays ship scene with static starfield, cursor on JUMP button
- UP/DOWN: cycle through the two buttons (wrapping)
- SELECT on button: no-op for now (logs placeholder: `[Ship] Jumping…` or `[Ship] Docking…`)
- BACK: return to station menu
- Touch tap on JUMP button: select it (no-op, log placeholder)
- Touch tap on DOCK button: select it (no-op, log placeholder)
- Two-finger tap: return to station menu

**Test coverage:**
- 12–15 tests: status bar rendering (fuel/cargo/credits), starfield rendering, button layout and colours, cursor starts on JUMP, UP/DOWN cursor navigation (wrapping), SELECT on button, BACK action, tap on buttons, two-finger tap to return

---

## Scene Wiring

**Flow:**
```
StationMenuScene
  ├─ TRADER → TraderScene → [BACK or 2-finger tap] → StationMenuScene
  ├─ MISSION BOARD → MissionBoardScene → [BACK or 2-finger tap] → StationMenuScene
  └─ UNDOCK → ShipScene → [BACK or 2-finger tap] → StationMenuScene
```

Both `src/main.ts` (browser) and `terminal.ts` (Bun) must wire these scenes identically. Use callback functions passed between scenes (same pattern as `StoryScene` → `StationMenuScene`).

---

## Data Structures

### Trader

```typescript
interface TraderItem {
  name: string;
  price: number; // credits
}

interface Trader {
  name: string;
  buyList: TraderItem[];
  sellList: TraderItem[];
}

// Hardcode 1 trader; future features will add more.
const TRADERS: Trader[] = [
  {
    name: 'MERCHANT KESS',
    buyList: [
      { name: 'Iron Ore', price: 120 },
      { name: 'Copper Wire', price: 85 },
      { name: 'Refined Fuel', price: 250 },
      { name: 'Circuit Board', price: 340 },
      { name: 'Titanium Sheet', price: 180 },
      { name: 'Rare Alloy', price: 420 },
    ],
    sellList: [
      { name: 'Water Supplies', price: 45 },
      { name: 'Oxygen Tank', price: 60 },
      { name: 'Nutrient Paste', price: 35 },
      { name: 'Medical Kit', price: 200 },
      { name: 'Armor Plating', price: 280 },
      { name: 'Navigation Module', price: 500 },
    ],
  },
];
```

### Mission

```typescript
interface Mission {
  id: string;
  type: 'rescue' | 'delivery' | 'combat' | 'salvage';
  title: string;
  reward: number; // credits
}

const MISSIONS: Mission[] = [
  { id: 'M001', type: 'rescue', title: 'Find the Lost Crew', reward: 500 },
  { id: 'M002', type: 'delivery', title: 'Deliver Fuel Core', reward: 300 },
  { id: 'M003', type: 'combat', title: 'Clear Pirate Outpost', reward: 750 },
  { id: 'M004', type: 'salvage', title: 'Salvage Station Debris', reward: 400 },
  { id: 'M005', type: 'rescue', title: 'Rescue Stranded Vessel', reward: 600 },
  { id: 'M006', type: 'delivery', title: 'Transport Supplies', reward: 250 },
  { id: 'M007', type: 'combat', title: 'Eliminate Smugglers', reward: 800 },
];
```

### Player State

```typescript
interface PlayerState {
  fuel: number; // 0–100 percentage
  cargo: number; // tons used
  cargoCapacity: number; // max tons
  credits: number;
}

// Initial state
const INITIAL_STATE: PlayerState = {
  fuel: 100,
  cargo: 0,
  cargoCapacity: 50,
  credits: 5000,
};
```

---

## Implementation Steps

1. **Create TraderScene**
   - Extend `BaseMenuScene` or implement `Scene` directly
   - Data structure: `TRADERS` constant
   - Tab switching logic (LEFT/RIGHT or custom input)
   - Render tab bar, item list, cursor

2. **Create MissionBoardScene**
   - Extend `BaseMenuScene`
   - Data structure: `MISSIONS` constant
   - Render mission type icon, title, reward
   - Cursor navigation

3. **Create ShipScene**
   - Implement `Scene` directly (not a menu)
   - Data structure: `INITIAL_STATE` constant
   - Render status bar, starfield, buttons
   - Handle SELECT/BACK, no cursor

4. **Update StationMenuScene**
   - Wire TRADER action to `goToTrader` callback
   - Wire MISSION BOARD action to `goToMissionBoard` callback
   - Keep UNDOCK action as `goToShip` callback

5. **Wire scenes in `src/main.ts` and `terminal.ts`**
   - Add `goToTrader`, `goToMissionBoard`, `goToShip` callbacks
   - Pass callbacks to `StationMenuScene`
   - Each new scene receives `goToStation` as return callback

6. **Write unit tests**
   - One `.test.ts` file per scene (colocated with source)
   - Test rendering, navigation, actions, tap handlers

7. **Run full test suite and init.sh**
   - Ensure all tests pass
   - Ensure init.sh passes before and after

---

## Acceptance Criteria

- ✓ All three scenes render correctly (no layout errors)
- ✓ Navigation works: forward (SELECT/tap), backward (BACK/2-finger tap)
- ✓ No state persists between scene transitions (fresh data on re-entry)
- ✓ All tests pass (100/100)
- ✓ Type checking passes (`tsc --noEmit`)
- ✓ `npm run build` succeeds
- ✓ `init.sh` passes before and after
- ✓ Play-test in both browser (`npm run dev`) and terminal (`npm run terminal`)
  - Main menu → NEW GAME → Story → Station menu
  - From station: navigate to TRADER, select items (no-op), return to station
  - From station: navigate to MISSION BOARD, select missions (no-op), return to station
  - From station: UNDOCK to ship, view starfield and inventory, return to station
  - All transitions silent (no console logs except placeholders)

---

## Notes for Engineer

- **Styling consistency:** Use the colour scheme from existing scenes (bright-cyan titles, cyan rules, bright-green cursors, white text)
- **Grid dimensions:** All scenes must fit within 40 cols × 30 rows (6 rows for title/rule + ~18 rows for content + 3–4 for footer/buttons)
- **Touch hints:** Remember to vary footer hint text based on `context.primaryInput` (keyboard vs. touch)
- **Tap-to-item logic:** Use row-based detection like `BaseMenuScene` does (`row === MENU_ROW_START + i`)
- **ShipScene cursor:** Cannot extend `BaseMenuScene` (custom layout). Implement cursor state tracking manually: `cursorIdx = 0` (JUMP) or `1` (DOCK), UP/DOWN toggles it with wrapping, SELECT fires the button action. Same `activated` guard pattern as `BaseMenuScene` to silence input after first activation.
- **Starfield:** Simple dot pattern (no animation) — safe random seed or hardcoded positions if reproducibility matters
- **Data:** All mission/trader/player data can stay hardcoded in scene constructors; future features will externalize state management
