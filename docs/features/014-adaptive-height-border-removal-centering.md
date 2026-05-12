# 014 · Adaptive Height, Border Removal & Screen Centering Fix

## Background

Three presentation issues are addressed together because they share underlying causes
and test changes:

1. **Adaptive height** — the grid is fixed at 30 rows. On mobile portrait and other tall
   viewports the game could use 30–50 rows, giving scenes more vertical breathing room.
2. **Border removal** — five scenes call `drawBorder()` at their outer edges. The borders
   feel heavy and box-like; removing them gives a cleaner terminal look.
3. **Centering bug** — `DOMRenderer.measureChar()` measures the VT323 fallback font but
   the game now renders in Share Tech Mono. The resulting `<pre>` explicit width is wrong,
   so the screen is left-aligned with dead space on the right.

---

## 1. Constants (`src/shared/types.ts`)

Replace the fixed height constant:

```ts
// before
export const GRID_HEIGHT = 30;

// after
export const MIN_GRID_HEIGHT = 30;
export const MAX_GRID_HEIGHT = 50;
```

`GRID_WIDTH = 40` is unchanged.

---

## 2. DOMRenderer (`src/platform/dom/DOMRenderer.ts`)

### 2a. Fix font measurement (centering bug)

In `measureChar()`, change the test span's `fontFamily` from `"'VT323', monospace"` to
`"'Share Tech Mono', monospace"` so the measured cell dimensions match the font the
`<pre>` actually renders in.

### 2b. Adaptive height

Add instance field:

```ts
private gridH: number = MIN_GRID_HEIGHT;
```

Replace the scale computation in `applyScale()` with:

```
scale = min(vw / (GRID_WIDTH * charW),
            vh / (MIN_GRID_HEIGHT * charH))
rows  = clamp(floor(vh / (charH * scale)), MIN_GRID_HEIGHT, MAX_GRID_HEIGHT)
```

Then apply:
- `this.pre.style.fontSize = BASE_FONT_SIZE * scale + 'px'`
- `this.pre.style.width    = GRID_WIDTH * charW * scale + 'px'`
- If `rows !== this.gridH`: update `this.gridH = rows`, update
  `this.pre.dataset.gridRows`, then fire all `onResize(GRID_WIDTH, rows)` handlers.

### 2c. `getHeight()`

```ts
getHeight(): number { return this.gridH; }
```

`main.ts` already calls `renderer.getWidth()`/`getHeight()` each frame inside
`makeBuffer()`, so no further wiring is required.

---

## 3. TerminalRenderer (`src/platform/terminal/TerminalRenderer.ts`)

Replace the static `GRID_HEIGHT` return with a live clamped read:

```ts
import { GRID_WIDTH, MIN_GRID_HEIGHT, MAX_GRID_HEIGHT } from '../../shared/types';

getHeight(): number {
  const rows = process.stdout.rows ?? MIN_GRID_HEIGHT;
  return Math.max(MIN_GRID_HEIGHT, Math.min(MAX_GRID_HEIGHT, rows));
}
```

Width stays static (`GRID_WIDTH`).

---

## 4. Border removal

Remove the `drawBorder(buffer, 'white', 'black')` call **and** the `drawBorder` import
from each of the five scenes that currently use it:

| File | Line (approx) |
|---|---|
| `src/game/scenes/MainMenuScene.ts` | 82 |
| `src/game/scenes/BaseMenuScene.ts` | 62 |
| `src/game/scenes/StoryScene.ts` | 68 |
| `src/game/scenes/TraderScene.ts` | 127 |
| `src/game/scenes/MissionBoardScene.ts` | 81 |

`drawBorder` stays in `buffer-utils.ts` for potential future use (pop-up overlays, etc.).

### Content-width adjustment

`TraderScene` and `MissionBoardScene` compute item-row text width as `w - 3` to leave
one gap before the now-removed right border. Change both to `w - 2` (preserving a
1-column right margin; content at col 1 unchanged).

---

## 5. StoryScene footer row

`FOOTER_ROW = 27` is currently hardcoded. Change the hint render call to use the
relative position `h - 3` (matching every other scene's footer convention), so the hint
appears near the bottom on any grid height.

```ts
// before
writeCentered(buffer, FOOTER_ROW, hint, 'bright-black', 'black');

// after
writeCentered(buffer, h - 3, hint, 'bright-black', 'black');
```

The `FOOTER_ROW` constant can be removed.

---

## 6. Scenes that need no layout changes

All scenes compute content rows from `buffer.length` (`h`) and all use `h - 3` for the
footer already (after item 5 above). Extra rows at the bottom of a taller grid are
simply black space.

`ShipScene` buttons at rows 25/26 remain at fixed positions — extra black space below
is acceptable until a future scene-redesign spec addresses it.

---

## 7. Test updates

### `DOMRenderer.test.ts`
- Remove `GRID_HEIGHT` import; import `MIN_GRID_HEIGHT` instead.
- Change the `getHeight()` assertion to `expect(r.getHeight()).toBe(MIN_GRID_HEIGHT)`.

### `TerminalRenderer.test.ts`
- Same import and assertion change as DOMRenderer.

### Border tests (5 scene test files)
Each has a `'renders a border…'` test. Replace with a negative assertion:

```ts
it('does not render a border', () => {
  const buf = makeBuffer();
  scene.render(buf);
  expect(buf[0][0].char).toBe(' ');
  expect(buf[0][0].fg).toBe('black');
});
```

### `story-scene.test.ts`
- Change the two footer-row assertions from `rowText(buf, 27)` to `rowText(buf, h - 3)`
  where `h = buf.length`.
- Remove the "tap on row 0 (border) also triggers onContinue" test or retitle it as
  "tap on row 0 (empty row) triggers onContinue" (the tap behaviour itself is unchanged).

### Content-width tests (`trader-scene.test.ts`, `mission-board-scene.test.ts`)
Update any test that asserts an exact dot-fill count to use `w - 2` math instead of
`w - 3`.

---

## Evidence of correctness

1. `npx tsc --noEmit` — zero errors
2. `npm test` — all tests pass
3. **Browser centering**: open the game; the `<pre>` should have equal empty space on
   both sides at any viewport width.
4. **Adaptive height**: resize the browser window to a tall narrow shape (e.g. ~375 × 812
   px via DevTools); the rendered grid should have more than 30 rows of content area.
5. **No borders**: navigate through all scenes — no `+`/`-`/`|` frame around any screen.
