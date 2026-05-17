# Feature 053 · BaseChoiceScene

## Goal

Introduce `BaseChoiceScene`, a new abstract base class for screens that present
rich content with a small fixed set of choices anchored at the bottom, and migrate
`MissionDetailScene` to it, removing the fragile spacer-line hack it currently uses.

---

## Acceptance criteria

- `BaseChoiceScene` exists in `src/game/scenes/base-choice-scene.ts` and extends `BaseScene`.
- The constructor accepts a `choices: ChoiceItem[]` array and an `onBack: () => void` callback.
- The BACK game action always calls `onBack`, regardless of cursor position.
- Choices are always rendered at the bottom of the content area, above the chrome footer, separated from content by a full-width separator line.
- UP/DOWN moves a cursor through non-disabled choices (wrap-around); SELECT activates the highlighted choice; tapping a choice row activates it.
- No choice is highlighted on construction if all are disabled; otherwise the first non-disabled choice is highlighted.
- Child scenes implement `renderContent(buffer, top, contentBottom)` where `contentBottom` is computed to exclude the separator and all choice rows (including any `details` lines).
- `MissionDetailScene` extends `BaseChoiceScene` instead of `BaseMenuScene`; the `DETAIL_SPACER_LINES` constant, the blank spacer array, and the `infoLines` workaround are all removed.
- All existing `MissionDetailScene` tests pass after migration; new unit tests cover choice cursor navigation, SELECT activation, BACK callback, disabled-choice skipping, and tap-to-activate.
- `tsc --noEmit` passes with zero errors; `npm test` passes.

---

## Out of scope

- Content scrolling / paging (content that overflows `contentBottom` is clipped silently; this is no worse than today and can be addressed separately).
- Migration of any scene other than `MissionDetailScene`.
- Rich rendering variants on `ChoiceItem` (no `icon`, `info`, `detailsColored` — those belong to `MenuItemDef` in menu scenes).

---

## Technical notes

### ChoiceItem interface

```typescript
export interface ChoiceItem {
  label: string;
  disabled?: boolean;
  details?: string[];   // always rendered below the label; use for disabled reasons
  action: () => void;
}
```

`details` lines are always visible (not only on hover), making choice area height
deterministic. This lets the base class compute `contentBottom` once per render
without needing cursor state.

### Layout

The base class computes the choices area height as:

```
choicesHeight = sum of (1 + details.length) for each ChoiceItem
```

Then:

```
separatorRow  = bottom - choicesHeight - 1
contentBottom = separatorRow - 1   (passed to child's renderContent)
```

Where `bottom = contentBottom(h, showFooter)` from `ScreenChrome` (unchanged
semantics). The separator is drawn with `drawSeparator`. Each choice renders with
a `>` cursor character for the highlighted item, a space for all others; disabled
items render in `bright-black`; the highlighted non-disabled item renders in
`bright-green`.

The child receives `(buffer, top, contentBottom)` — the same signature as
`BaseScene.renderContent` — so the `top` boundary is unchanged from `BaseScene`'s
title/chrome logic.

> suggestion — approximate layout (40 cols, 30 rows, 2 choices, 1 detail line):
> ```
> row  0-2   chrome header
> row  3     title
> row  4     underline
> row  5     [content starts — child owns rows 5..22]
>  ...
> row 22     content ends
> row 23     ----------------------------------------  separator
> row 24     > ACCEPT MISSION
> row 25       Not enough cargo space             ← detail line
> row 26       BACK
> row 27     [blank — chrome footer row is h-1]
> row 28     chrome footer
> row 29     [not used / out of buffer]
> ```

### Cursor initialisation and reset

On construction, `cursorIdx` is set to the first non-disabled item index, or `-1`
if all items are disabled. There is no `resetCursor` call on activation — once
activated the scene is done.

### MissionDetailScene migration

- Constructor signature is unchanged (same parameters, same callers in `main.ts`
  and `terminal.ts`).
- The `choices` array passed to `BaseChoiceScene` is `[acceptItem, backItem]`
  (same `MenuItemDef`-shaped objects, converted to `ChoiceItem`).
- `onBack` is `() => onBack()` (passed separately, as it was handled via
  `handleNavAction` before).
- `renderContent` override calls `renderDetail(buffer, top)` directly; `top` is now
  the genuine content start, so no offset arithmetic is needed. Clip at
  `contentBottom` exactly as before (replacing the old `contentLimit` check).
- `lastContentTop` is no longer needed and is removed.

### Files affected

- **New:** `src/game/scenes/base-choice-scene.ts` — the class and `ChoiceItem` export.
- **New:** `src/game/scenes/base-choice-scene.test.ts` — unit tests.
- **Modified:** `src/game/scenes/mission-detail-scene.ts` — migrated to `BaseChoiceScene`.
- **Modified:** `src/game/scenes/mission-detail-scene.test.ts` — updated for new base class; existing acceptance-criteria tests retained.

---

## Play-test instructions

### Browser (`npm run dev`)

1. Dock at any station → open Mission Board → select a mission.
2. Confirm the mission detail screen shows the detail content above a separator, with ACCEPT MISSION and BACK below it.
3. Press UP/DOWN to move the cursor between the two choices; confirm highlight changes.
4. Press SELECT on ACCEPT MISSION — mission is accepted.
5. Open a mission you cannot accept (e.g. insufficient cargo); confirm ACCEPT MISSION is dimmed with the reason shown and cursor skips it, landing on BACK.
6. Press BACK (Escape / back button) — returns to Mission Board regardless of cursor position.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

None
