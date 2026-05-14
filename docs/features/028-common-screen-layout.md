# Feature 028 · Common Screen Layout

**Status:** READY
**Depends on:** 011, 015

---

## Goal

Introduce a `ScreenChrome` component that renders a consistent 2-row header and
1-row footer chrome into every scene's buffer. All scenes render their content
within a well-defined zone defined by exported layout constants, so changing the
chrome component updates every screen automatically.

Replaces the existing `NavBar` component (feature 015).

---

## Chrome Layout

Default layout (header + footer both active):

```
Row 0:  :: SYSTEM NAME :::::::::::::::::: [M] MENU ::
Row 1:  :: DESTINATION NAME ::::::::::::: 5,000 CR ::
Row 2:  (empty)
        ... content ...
Row h-2: (empty)
Row h-1: :: [1] NAV1 :: [2] NAV2 ::::::::::::::::::::
```

Layout constants (exported from `ScreenChrome.ts`):

```
CHROME_HEADER_ROWS  = 2     (rows 0–1)
CHROME_HEADER_GAP   = 1     (row 2, always empty when header shown)
CHROME_FOOTER_GAP   = 1     (row h-2, always empty when footer shown)
CHROME_FOOTER_ROWS  = 1     (row h-1)

CONTENT_TOP                 = 3   (when showHeader = true)
CONTENT_TOP_NO_HEADER       = 0   (when showHeader = false)
contentBottom(h, showFooter) = showFooter ? h - 2 : h   (exclusive)
```

---

## Header Rendering

### Row 0 — System + Menu

```
:: ELYSIUM SYSTEM ::::::::::::::: [M] MENU ::
```

- `:: ` — `bright-black` (3 chars, left edge)
- system name — `bright-white`, from `getSystem(context.systemId).name.toUpperCase()`
- fill — `:` chars to `bright-black`, fills gap between name and right zone
- right zone — fixed string ` [M] MENU ::` where `[M]` is `bright-green`,
  ` MENU ` is `bright-white`, `::` is `bright-black`

Right zone width = 12 chars. Fill = `w - 3 - systemName.length - 12` colons.

### Row 1 — Destination + Credits

```
:: ELYSIUM STATION ::::::::::::: 5,000 CR ::
```

- `:: ` — `bright-black` (3 chars)
- destination name — `bright-white`, from
  `getDestination(context.destinationId)?.name.toUpperCase()` or `'IN SPACE'`
  if `context.destinationId` is `null`
- fill — `:` chars, `bright-black`
- credits — formatted with commas (e.g. `5,000`), `bright-green`
- ` CR ` — `bright-white`
- `::` — `bright-black`

Right zone width = `credits_str.length + 6` (space + CR + space + `::`).

### Footer Row — Nav

```
:: [1] UNDOCK :: [2] HUB :::::::::::::::::::::
```

- `:: ` — `bright-black` (3 chars)
- for each nav option (1-indexed): `[N]` in `bright-green`, ` LABEL` in
  `bright-white`
- ` :: ` — `bright-black` separator between items
- remaining cols — `:` in `bright-black` to fill full width

If `navOptions` is empty: entire row is `:` chars in `bright-black`.

---

## `ScreenChrome` Component

**File:** `src/game/ui/ScreenChrome.ts`

```typescript
export interface NavOption {
  id: string;
  label: string;
}

export interface ChromeConfig {
  showHeader: boolean;
  showFooter: boolean;
  navOptions: ReadonlyArray<NavOption>;
}

export const CONTENT_TOP = 3;
export const CONTENT_TOP_NO_HEADER = 0;
export function contentBottom(h: number, showFooter: boolean): number {
  return showFooter ? h - 2 : h;
}

export class ScreenChrome {
  constructor(context: GameContext) {}

  render(buffer: CharBuffer, config: ChromeConfig): void;

  // Returns the id of a tapped footer nav button, or null.
  // Only valid after a render() call with showFooter = true.
  hitTestNav(col: number, row: number): string | null;
}
```

`hitTestNav` caches button column ranges from the most recent `render()` call.
Returns `null` if `render()` has not been called yet or `showFooter` was false.

---

## `GameContext` Extension

Add player state to `GameContext` in `src/shared/types.ts`:

```typescript
export interface GameContext {
  environment: RuntimeEnvironment;
  primaryInput: PrimaryInput;
  debug: boolean;
  systemId: string;
  destinationId: string | null;
  credits: number;
}
```

`main.ts` and `terminal.ts` initialise `systemId`, `destinationId`, and `credits`
when building the context object. Scenes read location from context rather than
receiving it as a constructor parameter — `ShipScene` drops its `systemId` and
`destinationId` constructor params accordingly.

---

## Menu Screen Layout

Content zone (rows `CONTENT_TOP` to `contentBottom(h, true) - 1`):

```
Page title                    ← white, left-aligned at col 2, CONTENT_TOP
''''''''''                    ← backtick chars, same length as title
Info line 1 (grey)            ← optional, omitted when not applicable
Info line 2 (grey)

[ Tab 1 | Tab 2 | Tab 3 ]    ← optional, omitted when no tabs

> Option 1
  Option 2
  Option 3

|<|           1/n        |>| ← pager, omitted when all items fit
```

Title underline character is `` ` `` (backtick), matching the title length.

### Menu Item Types

```typescript
export interface MenuItemDef {
  label: string;
  info?: string;      // right-aligned with dot fill; omit for simple items
  details?: string[]; // additional grey lines below label; omit for single-line
  action: () => void;
}
```

**Simple** (no `info`, no `details`):

```
> Option 1
  Option 2
```

One row per item. All `white`.

**Info** (`info` present):

```
> Option 1 .......... 500 CR
  Option 2 ............ 80 CR
```

Single row. Name left-aligned, dots (`bright-black`) fill to col `w - 3`, info
right-aligned. All text `white`; cursor `>` in `bright-green`.

Content column range starts at col 2 (indent) and fills to col `w - 2`.
Dot count = `(w - 2) - 2 - label.length - info.length - 2` (spaces either side of dots).

**Multi-line** (`details` present):

```
> Option 1
  Detail line 1           ← bright-black
  Detail line 2           ← bright-black
  Option 2
  Detail line 1
```

Label on top row (`white`), details on subsequent rows (`bright-black`). Cursor
applies only to the label row. Each item occupies `1 + details.length` rows.

### Tabs

Format: `[ Tab 1 | Tab 2 | Tab 3 ]`

- Outer `[` and `]` — `bright-black`
- Separator `|` — `bright-black`
- **Active tab**: space + label + space — `black` fg, `green` bg (inverted).
- **Inactive tab**: space + label + space — `white` fg, `black` bg

Tab bar is centered in the content zone width. LEFT/RIGHT keys switch tabs.

### Pager

Shown only when total items exceed available content rows. Occupies the last row
of the content zone.

```
|<|           1/5        |>|
```

Full content zone width. `|<|` and `|>|` in `white` (tappable). Page number
centered in `bright-black`. PAGE_UP/PAGE_DOWN or `[`/`]` navigates pages.
Wrapping: page 1 → last page → page 1.

---

## Scene-by-Scene Changes

### `BaseMenuScene`

- Add `ScreenChrome` instance; render before scene content each frame.
- Default config: `showHeader: true`, `showFooter: true`, nav options passed in
  from subclass.
- All content rows shift to start at `CONTENT_TOP` (was row 3 previously but
  coincidentally the same value).
- **Title**: left-aligned at col 2, row `CONTENT_TOP`, color `white` (was centered,
  color `cyan`).
- **Underline**: backtick chars at row `CONTENT_TOP + 1`, same length as title,
  color `bright-black`.
- Menu items start at `CONTENT_TOP + 2` (or lower if info lines present).
- Subclasses supply `navOptions` and optional `infoLines: string[]` at construction.
- `MenuItemDef` updated as described above; item height accounting updated for
  multi-line items.

### `StationMenuScene`

- `navOptions`: `[{ id: 'undock', label: 'UNDOCK' }]`
- Remove internal `NavBar` instance.
- Footer hit test via `this.chrome.hitTestNav(col, row)`.

### `TraderScene`

- `navOptions`: `[{ id: 'undock', label: 'UNDOCK' }, { id: 'hub', label: 'HUB' }]`
- Remove internal `NavBar` instance.
- Tab bar shifts to `CONTENT_TOP + 2` (was row 5).
- Item list starts at `CONTENT_TOP + 4` (was row 7).
- Footer hit test via `this.chrome.hitTestNav(col, row)`.

### `MissionBoardScene`

- Identical changes to `TraderScene`.

### `TravelMenuScene`

- `navOptions`: `[]` (empty → footer is all `:` chars).
- Render chrome; content within zone.

### `MainMenuScene`

- `showHeader: false`, `showFooter: false` (full-screen title card, unchanged).

### `StoryScene`

- `showHeader: false`, `showFooter: false`.
- Content fills rows 0 to `h - 1`.
- **Paging**: when wrapped text exceeds available rows, render `< n/n >` at
  bottom-right (col `w - 9`, row `h - 1`), color `bright-black`. LEFT/RIGHT
  navigate pages.

### `ShipScene`

- `showHeader: true`, `showFooter: false`.
- Constructor drops `systemId` and `destinationId` params; reads from `context`.
- Content zone: rows `CONTENT_TOP` to `h - 1` (no footer reserved).
- **Fuel/cargo info**: row `CONTENT_TOP`, left-aligned at col 2, `bright-black`.
  Format: `FUEL: 100%   CARGO: 0/50T`
- **Viewport**: rows `CONTENT_TOP + 1` to `h - 4`.
- **Separator**: row `h - 3`, dashes fill left half, space+`|`+space centre,
  dashes fill right half. Color `bright-black`.
  Format: `----- … ------ | ------ … -----`
- **Action buttons**: row `h - 2`. Left half: cursor + `[ T ] TRAVEL`,
  right half: cursor + `[ D ] DOCK` (greyed when in space). Layout unchanged
  from current implementation.
- **Hint**: row `h - 1`, centered, `bright-black`.

---

## Files Changed

| File | Change |
|---|---|
| `src/shared/types.ts` | Add `systemId`, `destinationId`, `credits` to `GameContext` |
| `src/game/ui/ScreenChrome.ts` | **New** — chrome component |
| `src/game/ui/ScreenChrome.test.ts` | **New** — unit tests |
| `src/game/ui/NavBar.ts` | **Deleted** — superseded by ScreenChrome |
| `src/game/ui/NavBar.test.ts` | **Deleted** |
| `src/game/scenes/BaseMenuScene.ts` | Updated `MenuItemDef`, title style, chrome wiring |
| `src/game/scenes/StationMenuScene.ts` | Remove NavBar, use chrome |
| `src/game/scenes/TraderScene.ts` | Remove NavBar, use chrome; shift tab/item rows |
| `src/game/scenes/MissionBoardScene.ts` | Remove NavBar, use chrome; shift tab/item rows |
| `src/game/scenes/TravelMenuScene.ts` | Use chrome |
| `src/game/scenes/MainMenuScene.ts` | Pass `showHeader/Footer: false` (no visual change) |
| `src/game/scenes/StoryScene.ts` | Suppress chrome; add paging |
| `src/game/scenes/ShipScene.ts` | Header chrome only; drop location params; new viewport/button layout |
| `main.ts` | Populate new context fields; update scene construction |
| `terminal.ts` | Same as `main.ts` |

---

## Test Coverage

### `ScreenChrome.test.ts` (14 tests)

| # | Description |
|---|---|
| 1 | Row 0 contains system name from context |
| 2 | Row 0 right zone shows `[M] MENU` |
| 3 | Row 0 fill cells between name and right zone are `:` |
| 4 | Row 1 contains destination name from context |
| 5 | Row 1 shows `IN SPACE` when `context.destinationId` is null |
| 6 | Row 1 right zone shows credits formatted with comma separator |
| 7 | Row 2 is empty (space chars) when showHeader = true |
| 8 | Footer row (h-1) shows numbered nav labels |
| 9 | Footer row fills remainder with `:` chars |
| 10 | Footer row is entirely `:` when navOptions is empty |
| 11 | No chrome rows written when showHeader = false |
| 12 | No chrome rows written at h-1 when showFooter = false |
| 13 | `hitTestNav` returns nav id when column falls within that button |
| 14 | `hitTestNav` returns null before render() and for non-footer rows |

### `BaseMenuScene.test.ts` (additions, 6 tests)

| # | Description |
|---|---|
| 1 | Title at row `CONTENT_TOP`, col 2, color `white` |
| 2 | Backtick underline at row `CONTENT_TOP + 1`, length matches title |
| 3 | Simple item: single row, white |
| 4 | Info item: label left, info right, dots fill, white |
| 5 | Multi-line item: label white, details `bright-black` below |
| 6 | Multi-line item cursor on label row only |

---

## Acceptance Criteria

- ✓ Every scene shows the 2-row chrome header with current system, destination, and credits
- ✓ Credits in header update when player state changes
- ✓ `[M] MENU` renders at top-right; pressing `M` is a no-op placeholder (no menu scene yet)
- ✓ Footer nav shows correct buttons for each scene; pressing number keys activates them (per feature 024)
- ✓ Footer is all `:` on screens with no nav options
- ✓ Story screen shows no header or footer; paging works with LEFT/RIGHT
- ✓ Ship screen shows header; no nav footer; viewport and action buttons unchanged in behaviour
- ✓ Menu titles are left-aligned with backtick underline
- ✓ Active tab: green background, black text (or bright-green text on terminal fallback)
- ✓ Pager appears only when items exceed visible rows; PAGE_UP/PAGE_DOWN and `[`/`]` work
- ✓ All existing keyboard and touch navigation behaves as before
- ✓ `tsc --noEmit` — zero errors
- ✓ All tests pass
- ✓ `npm run build` succeeds
- ✓ `init.sh` passes before and after

---

## Play-Test Instructions

1. `bash init.sh` — must print `=== Environment ready ===`
2. `npm test` — all tests pass

**Browser** (`npm run dev`):

3. **Story screen** — no header or footer; text is left-aligned. If text is long,
   LEFT/RIGHT pages through it and `< n/n >` appears bottom-right.
4. **Main menu** — full-screen, no chrome.
5. **Ship scene** — header shows system + destination + credits at top.
   No nav footer. Fuel/cargo line below header. Viewport. Separator + TRAVEL/DOCK
   buttons at bottom.
6. **Station hub** — header shows location + credits. Footer shows `[1] UNDOCK`.
   Press `1` or tap `[1] UNDOCK` → undock.
7. **Trader** — footer shows `[1] UNDOCK [2] HUB`. Both work. Tabs render with
   active tab in green background.
8. **Mission board** — same chrome as Trader.
9. Change a credit amount in the orchestrator and confirm the header updates on
   every scene without modifying any scene file.

**Terminal** (`npm run terminal`): repeat steps 3–8.
