# Feature 013: Menu Pagination

**Status:** READY
**Depends on:** 011

## Summary

Add a reusable `Pager` component that paginates lists in `MissionBoardScene` and `TraderScene` when item count exceeds the visible content area height. When active, a one-row pager bar appears at the bottom of the content region showing `< Page N/X >`. The player navigates pages with LEFT/RIGHT (Mission Board) or PAGE_UP/PAGE_DOWN (Trader, where LEFT/RIGHT is already used for tab switching), and can also tap the `<`/`>` arrow characters directly or swipe left/right (which already fires LEFT/RIGHT).

---

## Pager Component

### File: `src/game/ui/Pager.ts`

```typescript
export class Pager {
  constructor(itemCount: number, contentHeight: number)

  readonly isMultiPage: boolean    // true when itemCount > contentHeight
  readonly pageCount: number       // number of pages (1 when !isMultiPage)
  readonly pageSize: number        // items per page (= contentHeight - 1 when multiPage, else itemCount)
  get currentPage(): number        // 0-indexed internally
  get displayPage(): number        // 1-indexed, for rendering "Page N/X"
  get startIndex(): number         // first item index on current page
  get endIndex(): number           // exclusive end index (startIndex + pageSize, clamped to itemCount)

  nextPage(): void                 // wraps last → first
  prevPage(): void                 // wraps first → last

  render(buffer: CharBuffer, row: number): void
  // Does nothing when !isMultiPage.
  // Writes "<" at col 2 (bright-white), ">" at col w-3 (bright-white),
  // "Page N/X" centered across the row (see visual layout).

  isLeftArrow(col: number, bufferWidth: number): boolean   // col === 2
  isRightArrow(col: number, bufferWidth: number): boolean  // col === bufferWidth - 3
}
```

### Page size logic

```
effectivePageSize = contentHeight - 1   (reserves 1 row for the pager bar)
isMultiPage       = itemCount > contentHeight
pageSize          = isMultiPage ? effectivePageSize : itemCount
pageCount         = isMultiPage ? Math.ceil(itemCount / effectivePageSize) : 1
```

Example with `contentHeight = 20`:
- 20 items → single page, no pager
- 21 items → 2 pages of 19 and 2, pager visible

Example with `contentHeight = 5` (small test buffer):
- 7 items → 2 pages of 4 and 3, pager visible

---

## Visual Layout

Pager bar rendered at the designated row (last row of the content region when active):

```
< Page 2/4 >
```

- `<` at col 2, `bright-white`
- `>` at col `w - 3`, `bright-white`
- `Page ` centred across the full row, `bright-black`
- `N` (current page number, 1-indexed), `white`
- `/`, `bright-black`
- `X` (total pages), `white`

The label `Page N/X` is centered using `writeCentered` on the same row after the arrows are placed, so the arrows remain visible at their fixed cols. For all realistic page counts (1–99 pages), the centered label does not overlap cols 2 or `w-3` at any supported grid width (≥ 20 cols).

---

## Integration: MissionBoardScene

### Content area

- Rows 5–24 (20 rows, derived from `contentStart = 5`, `contentEnd = h - 6`)
- `contentHeight = contentEnd - contentStart` (= 19 for a 30-row buffer, border + footer rows account for the rest; but use the actual buffer height dynamically)

Wait — use concrete rows:
- `CONTENT_ROW_START = 5`
- `CONTENT_ROW_END = h - 6` (leaves room for footer at h-3 and border at h-1)
- `contentHeight = CONTENT_ROW_END - CONTENT_ROW_START`

The Pager is constructed with `itemCount = MISSIONS.length` and `contentHeight`.

### Input handling

LEFT/RIGHT → `pager.prevPage()` / `pager.nextPage()` + cursor reset to 0
PAGE_UP/PAGE_DOWN → same as LEFT/RIGHT
UP/DOWN → cursor within current page (wraps within `0..pager.pageSize-1`)
SELECT → `MISSIONS[pager.startIndex + relativeCursorIdx]`

On tap:
- If `pager.isMultiPage` and row is the pager row:
  - `pager.isLeftArrow(col, w)` → `pager.prevPage()` + cursor reset
  - `pager.isRightArrow(col, w)` → `pager.nextPage()` + cursor reset
- Else row falls in content area → select item at `pager.startIndex + (row - CONTENT_ROW_START)`

### Render

```
for (let i = 0; i < pager.pageSize; i++) {
  const itemIdx = pager.startIndex + i;
  if (itemIdx >= MISSIONS.length) break;
  // render mission at CONTENT_ROW_START + i
}
if (pager.isMultiPage) pager.render(buffer, CONTENT_ROW_START + pager.pageSize);
```

### Footer hint update

- Keyboard (no pager): `↑↓ navigate   ESC return`
- Keyboard (with pager): `↑↓ navigate   ←→ page   ESC return`
- Touch (no pager): `tap an option   2-finger tap to exit`
- Touch (with pager): `tap item or arrows   2-finger tap exit`

---

## Integration: TraderScene

LEFT/RIGHT is already consumed by tab switching (BUY ↔ SELL). Pager for the item list within a tab uses PAGE_UP/PAGE_DOWN instead.

Each tab gets its own `Pager` instance (one for `buyList`, one for `sellList`). On tab switch, the new tab's pager is used (its page state persists — switching back to BUY remembers your page position within BUY).

### Content area

- `CONTENT_ROW_START = 7`, `CONTENT_ROW_END = h - 6`
- Same construction as Mission Board: `new Pager(items.length, contentHeight)`

### Input handling

LEFT/RIGHT → switch tab (existing behaviour, cursor resets to 0, page resets to 0 on the new tab)
PAGE_UP/PAGE_DOWN → `pager.prevPage()` / `pager.nextPage()` + cursor reset
UP/DOWN → cursor within current tab's current page
SELECT → `currentList[pager.startIndex + relativeCursorIdx]`

On tap:
- Tab row (row 5) → switch tabs
- Pager row → prev/next page via arrow hit-test
- Content rows → select item

### Footer hint update

- Keyboard (pager inactive): `↑↓ navigate   ←→ tab   ESC return`
- Keyboard (pager active): `↑↓ navigate   ←→ tab   PgUp/Dn page   ESC return`
- Touch: unchanged (swipe is already tab-switch; arrows tap for page nav)

---

## Test Coverage

### `src/game/ui/Pager.test.ts` (12–14 tests)

- `isMultiPage = false` when `itemCount <= contentHeight`
- `isMultiPage = true` when `itemCount > contentHeight`
- `pageSize = itemCount` when single page
- `pageSize = contentHeight - 1` when multi-page
- `pageCount` correct for various item/height combos
- `startIndex` and `endIndex` on page 0
- `nextPage` advances page; `startIndex`/`endIndex` update correctly
- `prevPage` decrements page; `startIndex`/`endIndex` update correctly
- `nextPage` wraps from last page to first
- `prevPage` wraps from first page to last
- `render` does nothing when `!isMultiPage`
- `render` writes `<` at col 2 when multi-page
- `render` writes `>` at col `w - 3` when multi-page
- `isLeftArrow` / `isRightArrow` return correct booleans

### `MissionBoardScene` additions (4–6 new tests)

Use a small test buffer (height ≤ 10) to force pagination with the existing 7 missions:

- Pager bar is absent when buffer is large enough to show all missions
- Pager bar appears at correct row when buffer is small
- LEFT navigates to previous page (wraps)
- RIGHT navigates to next page (wraps)
- Cursor resets to first item on page change
- Tap on `<` col navigates previous page; tap on `>` col navigates next page

### `TraderScene` additions (4–6 new tests)

- Pager bar absent when all items in a tab fit
- PAGE_UP / PAGE_DOWN change page within current tab
- LEFT/RIGHT still switches tabs (no page interference)
- Tab switch resets that tab's page to 0
- Tap on pager arrows changes page
- Absolute item index is correctly derived from page state

---

## Acceptance Criteria

- ✓ `Pager` class passes all unit tests
- ✓ `MissionBoardScene` paginates correctly in browser and terminal
- ✓ `TraderScene` paginates per-tab correctly in browser and terminal
- ✓ Page wraps: last → first, first → last
- ✓ Cursor resets on page change
- ✓ Pager bar absent when single-page (zero visual footprint)
- ✓ Tap on `<`/`>` and swipe left/right both trigger page navigation
- ✓ `tsc --noEmit` zero errors
- ✓ All tests pass
- ✓ `npm run build` succeeds
- ✓ `init.sh` passes before and after

---

## Play-Test Instructions

1. Run `bash init.sh` — must print `=== Environment ready ===`
2. Run `npm test` — all tests pass
3. **Browser** `npm run dev`:
   - Open station → MISSION BOARD
   - Narrow the DevTools viewport until the pager bar `< Page 1/X >` appears at the bottom of the mission list
   - Press `←`/`→` to flip pages; cursor resets to first mission each time
   - On touch emulation: tap `<` and `>` arrows; swipe left/right to page
   - Widen viewport: pager disappears and all missions show
4. **Browser** → TRADER:
   - With a short item list, no pager appears
   - Narrow viewport until pager appears; use PageUp/PageDown to navigate
   - `←`/`→` still switches BUY/SELL tabs; each tab's page position is independent
5. **Terminal** `npm run terminal`:
   - Same navigation; PageUp/PageDown via `\x1b[5~`/`\x1b[6~`

---

## Notes for Engineer

- `Pager` has no dependency on scenes — it only imports `CharBuffer` and `Color` from `src/shared/types.ts` and uses `writeCentered`/`writeText` from `src/shared/buffer-utils.ts`. Keep it pure.
- The `contentHeight` passed to `Pager` must be recomputed in `render()` using the actual buffer height, not a constant — the grid is responsive (30–60 rows). Reconstruct the `Pager` (or expose a `reset(itemCount, contentHeight)` method) each render frame, or compute once in the constructor and re-instantiate on resize via the renderer's `onResize` callback.
- Simplest approach: construct a fresh `Pager` in `render()` each frame using the current buffer height, but carry `_currentPage` as scene state to preserve page position between frames. The Pager then becomes a stateless layout helper and `currentPage` is passed in as a constructor argument.
- Alternatively, keep the Pager stateful but re-instantiate it on resize. The scene holds a `pageIdx` number that survives re-instantiation by being clamped to the new `pageCount - 1`.
- Either approach is acceptable; choose whichever produces cleaner, more testable code.
