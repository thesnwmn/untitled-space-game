# Scene System

All game screens implement the `Scene` interface from `shared/types.ts`. The game loop calls `update(dt)` and `render(buffer)` on the active scene each frame.

**`BaseScene`** (`src/game/scenes/base-scene.ts`) is the abstract base for all scenes except `MainMenuScene`. It owns:
- Buffer clearing each frame
- `ScreenChrome` construction and rendering
- Title + apostrophe-underline rendering (when `title` is provided)
- Summary lines rendering (when `summary` is provided)
- Tab bar rendering and LEFT/RIGHT tab-switching (when `tabs` is provided)
- All input routing: MENU → `onMenu()`, nav footer taps → `handleNavTap()`, header menu tap → `onMenu()`, tab-bar taps → tab switch; everything else delegates to `handleAction`, `handleTap`, or `handleCharInput`
- `suspend()` / `resume()` / `update()` lifecycle

Subclasses implement `renderContent(buffer, top, bottom)`, receiving the correct content boundaries for their chrome/title/tab configuration. The `top`/`bottom` boundary formula:

```
base = CONTENT_TOP (3) if showHeader, else 0
top  = base                              (no title)
top  = base + 3 + N                     (title, no tabs, N summary lines)
top  = base + 5 + N                     (title + tabs, N summary lines)
bottom = contentBottom(h, showFooter)   (= h-2 with footer, h without)
```

**Menu scenes** extend `BaseMenuScene` (`src/game/scenes/base-menu-scene.ts`), which extends `BaseScene` and adds:
- Cursor navigation (UP/DOWN with wrap-around, disabled-item skipping)
- Tap-to-item mapping (`onTap` row → item index)
- `activated` guard — set on the first SELECT or item tap, silences all further input; reset to `false` by `openModal()` so modals receive subsequent input
- Pagination — `PAGE_UP`/`PAGE_DOWN` and a `renderPager` footer indicator
- Item rendering (all variants: icon, info, details, disabled)
- Modal support — `openModal()` / `closeModal()`; modal intercepts all actions and taps while open

Individual menu scenes pass a title, items array, info lines, nav options, and per-item callbacks to the `BaseMenuScene` constructor. They contain no input or rendering logic of their own except `handleNavAction`/`handleNavTap` for footer button routing.

**Transition scenes** extend `BaseTransitionScene` (`src/game/scenes/base-transition-scene.ts`), which extends `BaseScene`. The base class handles timing and auto-advance; subclasses implement only `renderContent(buffer, top, bottom)`. Subclasses may optionally override `buildChromeConfig()` to suppress or override chrome fields during animation (e.g. `systemLabel: 'IN TRANSIT'`). All eight animation scenes use this pattern:
- `JumpAnimationScene`, `InSystemTravelAnimationScene` — travel transitions
- `SurfaceLandingAnimationScene`, `AsteroidLandingAnimationScene`, `OrbitalDockingAnimationScene` — docking/landing transitions
- `SurfaceTakeOffAnimationScene`, `AsteroidTakeOffAnimationScene`, `OrbitalUndockingAnimationScene` — take-off/undocking transitions

Transition scenes accept no real `InputHandler` (a no-op is created internally) and auto-advance once elapsed time reaches their duration. See `docs/decisions/travel-system.md` for durations, chrome overrides, and routing.

**`MainMenuScene`** implements `Scene` directly. It is the splash screen and intentionally has no chrome or standard layout.

**ScreenChrome** (`src/game/ui/screen-chrome.ts`) provides the consistent 2-row header and 1-row footer nav used by all scenes except `MainMenuScene`:
- Row 0: system name + `[M] MENU` shortcut
- Row 1: destination name + credits
- Footer: `:: [1] LABEL :: [2] LABEL ::::` nav buttons
- Exports `CONTENT_TOP = 3`, `CONTENT_TOP_NO_HEADER = 0`, `contentBottom(h, showFooter)`, `hitTestNav(col, row)`, `hitTestHeader(col, row)`

**Shared drawing helpers** (`src/shared/buffer-utils.ts`):
- `writeText(buffer, row, col, text, fg, bg)` — writes a string at a fixed position
- `writeCentered(buffer, row, text, fg, bg)` — centres a string on a row
- `drawBorder(buffer, fg, bg)` — draws a `+`/`-`/`|` border around the full buffer
- `wrapText(text, maxWidth)` — wraps a string to an array of lines
- `drawSeparator(buffer, row, w, fg?)` — writes a full-width `'-'` separator
- `renderPager(buffer, row, w, page, total)` — renders a `|<| n/total |>|` pager indicator

**Scene wiring** (creating scenes and passing callbacks between them) lives entirely in the two entry points — `src/main.ts` (browser) and `terminal.ts` (Bun). Both must be kept in sync when adding new scenes.

**GameContext fields** (slimmed to runtime-only after feature 033):
```typescript
export interface GameContext {
  environment: RuntimeEnvironment;
  primaryInput: PrimaryInput;
  debug: boolean;
}
```

Game state (location, credits, fuel, cargo) moved to `PlayerState`
(`src/game/player-state.ts`), which is constructed once at startup and passed to
every scene alongside `context`. `ScreenChrome` reads from `PlayerState` for its
header rows (system name, destination name, credits).
