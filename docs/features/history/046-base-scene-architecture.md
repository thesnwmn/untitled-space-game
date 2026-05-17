# Feature 046 · Base Scene Architecture

## Goal

Eliminate rendering duplication across all game scenes by introducing `BaseScene` as the
universal abstract base that owns buffer clearing, `ScreenChrome`, title, summary lines,
and tab bar — freeing every scene from reimplementing these identically.

---

## Acceptance criteria

- `BaseScene` abstract class exists in `src/game/scenes/base-scene.ts`, implementing `Scene`
- Every scene except `MainMenuScene` extends `BaseScene` directly or transitively (through
  `BaseMenuScene` or `BaseTransitionScene`)
- Buffer clearing is performed exclusively in `BaseScene.render`
- `ScreenChrome` is constructed and rendered exclusively in `BaseScene`
- When a title is provided, the title + apostrophe-underline are rendered exclusively in
  `BaseScene`
- When summary lines are provided, they are rendered exclusively in `BaseScene`
- When tabs are provided, the tab bar is rendered exclusively in `BaseScene`; LEFT/RIGHT tab
  switching and tab-bar tap hit-testing are handled exclusively in `BaseScene`
- `renderContent(buffer, top, bottom)` is called each frame with the correct content
  boundaries for every scene
- `BaseMenuScene` retains cursor navigation, pagination, item rendering, and modal support;
  it gives up chrome, buffer clearing, title, summary lines, and tab bar to `BaseScene`
- `BaseTransitionScene` retains timing and auto-advance logic; it gives up chrome and buffer
  clearing to `BaseScene`
- `GalaxyMapScene` gives up chrome, title, tab bar, and tab switching to `BaseScene`; its
  duplicated `renderTabBar` method is deleted
- `StoryScene` gives up chrome and buffer clearing to `BaseScene`
- `ShipCockpitScene` gives up chrome and buffer clearing to `BaseScene`
- `CargoScene` is rewritten as a `BaseScene` subclass with full `ScreenChrome`, a `[1] BACK`
  footer button, standard `[M] MENU` header access, two tabs (`COMMODITIES` / `MISSION GOODS`),
  a list display per tab, and the combined weight/capacity total always visible as the last
  content row regardless of active tab
- `buffer-utils.ts` gains `drawSeparator(buffer, row, w, fg?)` replacing all inline
  `'-'.repeat(w)` calls across scenes
- `buffer-utils.ts` gains `renderPager(buffer, row, w, page, total)` replacing both divergent
  pager styles; style is consistent between `BaseMenuScene` and `StoryScene`
- The `onMenuCallback` protected field is removed from `BaseMenuScene`; all menu callbacks
  flow through `BaseSceneOptions.onMenu` and are routed centrally by `BaseScene`
- `npm test` passes; `npx tsc --noEmit` produces zero errors
- Existing scene tests are updated to match refactored constructors
- New tests for `BaseScene` cover: buffer clearing, chrome rendering, title/underline
  rendering, summary rendering, tab bar rendering, tab switching via action and tap, and
  content boundary calculation

---

## Out of scope

- `MainMenuScene` — splash screen; intentionally has no chrome; not migrated
- Changes to game logic, world data, or mission systems
- Selectable actions on cargo hold items (the screen is display-only)
- Visual redesign of any screen beyond `CargoScene` gaining standard chrome

---

## Technical notes

### `BaseScene` public interface

```typescript
interface BaseSceneOptions {
  navOptions: ReadonlyArray<NavOption>;
  showHeader?: boolean;   // default true
  showFooter?: boolean;   // default true
  title?: string;
  summary?: string[];     // pre-formatted lines rendered below title; combinable with tabs
  tabs?: string[];        // tab labels; BaseScene owns activeTabIdx
  onMenu?: () => void;
}

abstract class BaseScene implements Scene {
  protected readonly player: PlayerState;
  protected readonly chrome: ScreenChrome;
  protected activeTabIdx: number;
  protected activated: boolean;

  constructor(inputHandler: InputHandler, context: GameContext, player: PlayerState, options: BaseSceneOptions)

  protected buildChromeConfig(): ChromeConfig      // overridable; default built from options
  protected handleAction(action: string): void     // empty default; override as needed
  protected handleTap(col: number, row: number): void
  protected handleNavTap(navId: string): void
  protected handleCharInput(char: string): void
  protected onTabChange(newIdx: number): void      // called when BaseScene changes activeTabIdx

  protected abstract renderContent(buffer: CharBuffer, top: number, bottom: number): void

  public suspend(): void   // sets activated = true
  public resume(): void    // sets activated = false
  public update(dt: number): void        // empty; override as needed
  public render(buffer: CharBuffer): void  // not overridable
}
```

**Input routing in `BaseScene`:** All `inputHandler` callbacks are registered in the
`BaseScene` constructor. `BaseScene` handles directly:

- MENU action → `onMenu()` if set
- LEFT/RIGHT → tab switch + `onTabChange()` (only when `tabs` is configured)
- Nav footer taps → `handleNavTap(navId)`
- Header menu tap → `onMenu()` if set
- Tab-bar row taps → tab switch + `onTabChange()`

Everything else delegates to `handleAction`, `handleTap`, or `handleCharInput`.

**Content boundary calculation:** Let `base` = `CONTENT_TOP` (3) when `showHeader` is true,
else `CONTENT_TOP_NO_HEADER` (0). Let N = `summary.length` (0 if absent).

> suggestion
> ```
> title row:          base                       (only if title provided)
> underline row:      base + 1                   (only if title provided)
> summary rows:       base + 2 … base + 1 + N    (0 rows if no summary; row base+2 is blank)
> blank gap:          base + 2 + N               (always implicit after title/summary block)
> tab bar:            base + 3 + N               (only if tabs configured)
> tab blank:          base + 4 + N               (only if tabs configured)
> ─────────────────────────────────────────────────────────────────────────────────────
> contentTop  (no title, no summary, no tabs):   base
> contentTop  (title present, no tabs):          base + 3 + N
> contentTop  (title present, with tabs):        base + 5 + N
> contentBottom:  contentBottom(h, showFooter)   (exclusive — footer row or end of buffer)
> ```

This formula exactly reproduces the existing `itemStartRow` values in `BaseMenuScene` for all
current configurations. The Engineer should verify boundary arithmetic across all migrated
scenes.

Summary and tabs may be used together. The layout remains consistent: summary lines always
appear immediately below the title/underline block, and the tab bar always appears one blank
row below the last summary line (or below the underline if no summary).

### `BaseMenuScene` refactor

The constructor calls `super()` with
`{ navOptions, title, summary: infoLines, tabs: tabDefs?.map(t => t.label), onMenu }`.

What moves to `BaseScene`:
- `new ScreenChrome(context, player)` construction
- Buffer clearing loop
- `chrome.render(buffer, config)` call
- Title + underline rendering
- Summary (info lines) rendering
- Tab bar rendering
- LEFT/RIGHT tab-switching input

What `BaseMenuScene` retains:
- `TabDef[]` (tabs with items, not just labels)
- Cursor navigation — `moveCursor`, `resetCursor`, `activateCurrent`
- Pagination — page index, page count, item layout
- Item rendering (all variants: icon, info, details)
- Modal routing — `openModal`, `closeModal`, and `handleCharInput` override
- `handleAction`, `handleTap`, `handleNavTap` overrides for its own input

`render()` becomes `renderContent(buffer, top, bottom)`. `top` replaces the `itemStartRow`
field. The pager renders at `bottom - 1` using the shared `renderPager` helper.

`onMenuCallback` is removed as a protected field; callers that previously set it pass
`onMenu` through `BaseSceneOptions` instead.

`onTabChange(idx)` is overridden to call `resetCursor()`.

### `BaseTransitionScene` refactor

Extends `BaseScene` instead of implementing `Scene` directly. The constructor calls
`super()` with `{ navOptions: [] }` (standard header/footer, no title, no tabs).

`getChromeConfig()` is renamed `buildChromeConfig()` to match `BaseScene`'s hook name.
Subclasses that currently override it continue to override `buildChromeConfig()` with no
other changes.

The abstract `renderContent(buffer: CharBuffer)` gains `top` and `bottom` params. Existing
transition subclasses add the params to their signatures; they may ignore the bounds since
they render full-viewport animations and work from absolute buffer coordinates.

### `GalaxyMapScene` refactor

Extends `BaseScene`. The constructor passes:
`{ title: 'GALAXY MAP', tabs: ['MAP', 'ROUTE'], navOptions: [{ id: 'back', label: 'BACK' }], onMenu }`.

`renderTabBar()` is deleted entirely.

`activeTab: 'map' | 'route'` is replaced by reading `this.activeTabIdx` (0 = MAP, 1 = ROUTE).

`onTabChange()` is overridden to clear `searchText`.

`handleAction()` dispatches to `handleMapAction` or `handleRouteAction` based on
`this.activeTabIdx`. The BACK action (including its search-text-clear shortcut) and char
input for search both move into their respective hooks.

`renderContent(buffer, top, bottom)` contains the map or route tab rendering. Row constants
that are currently computed as `CONTENT_TOP + N` are recalculated relative to `top` so the
scene is not sensitive to chrome height changes.

### `StoryScene` refactor

Extends `BaseScene` with `{ navOptions: [] }` (standard header/footer, no title, no tabs).

LEFT/RIGHT reach `handleAction` because `BaseScene` does not intercept them when no tabs
are configured.

`renderContent(buffer, top, bottom)` renders the year header at `top`, body text from
`top + 2`, and calls `renderPager` at `bottom - 1` when pagination is needed.

### `ShipCockpitScene` refactor

Extends `BaseScene` with `{ navOptions: [], onMenu }`.

All rendering logic moves into `renderContent(buffer, top, bottom)`. Most layout constants
remain relative to `h` and `w` (the cockpit has a fixed internal layout); the gauge strip
starts at `top` (= 3 with standard header) rather than hardcoding row 3.

Input moves into `handleAction` and `handleTap` overrides.

### `CargoScene` redesign

`CargoScene` is rewritten as a `BaseScene` subclass. It does not extend `BaseMenuScene`
because cargo items are display-only — no cursor navigation is needed.

Constructor passes:
`{ title: 'CARGO HOLD', tabs: ['COMMODITIES', 'MISSION GOODS'], navOptions: [{ id: 'back', label: 'BACK' }], onMenu }`.

`handleNavTap('back')` triggers the back callback. The `[M] MENU` header link uses the
standard `onMenu` routing inherited from `BaseScene`.

`renderContent(buffer, top, bottom)` renders whichever tab `this.activeTabIdx` selects:
tab 0 shows commodity cargo entries, tab 1 shows mission cargo entries. The combined
weight/capacity total (summed across both tabs) is always rendered as the last content row
at `bottom - 1`, regardless of which tab is active.

The current `[ESC] BACK` footer text is replaced by the standard `[1] BACK`
`ScreenChrome` footer button.

### Shared utility additions to `buffer-utils.ts`

**`drawSeparator(buffer, row, w, fg?: Color)`** — writes a full-width `'-'` separator at
the given row. Replaces all inline `'-'.repeat(w)` calls in `GalaxyMapScene` (four sites)
and `CargoScene` (one site).

**`renderPager(buffer, row, w, page, total)`** — renders a pager indicator centred on the
given row. Replaces the `|<|..1/3..|>|` style in `BaseMenuScene` and the `< 1/3 >` style
in `StoryScene`. Style is the Engineer's choice; it must be identical in both call sites.

### Downstream spec impact

**Feature 044** specs `KnowledgeSystemScene` rendering "directly in `render()`" — that
method no longer exists after this feature. The Engineer implementing 044 should use
`renderContent(buffer, top, bottom)` and offset from `top`.

**Features 044 and 045** spec new scenes extending `BaseMenuScene`. No spec changes are
required — `BaseMenuScene`'s external API is unchanged. All future scenes should extend
`BaseScene` (directly or via `BaseMenuScene`).

---

## Dependencies

None. Recommended build order: 046 first, then 025, then 044 and 045 — those features
touch the same scene files this one refactors.
