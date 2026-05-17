# Scene System

All game screens implement the `Scene` interface from `shared/types.ts`:

```typescript
export interface Scene {
  update(dt: number): void;
  render(buffer: CharBuffer): void;
  suspend(): void;
  resume(): void;
}
```

The game loop calls `update(dt)` and `render(buffer)` on the active scene each frame.

## BaseScene

`BaseScene` (`src/game/scenes/base-scene.ts`) is the abstract base for all scenes except `MainMenuScene`. Subclasses implement one method:

```typescript
protected abstract renderContent(buffer: CharBuffer, top: number, bottom: number): void;
```

`top` and `bottom` are the content boundaries for the current chrome/title/tab configuration:

```
base = CONTENT_TOP (3) if showHeader, else 0
top  = base                     (no title)
top  = base + 3 + N             (title, no tabs, N summary lines)
top  = base + 5 + N             (title + tabs, N summary lines)
bottom = h - 2                  (with footer)
bottom = h                      (no footer)
```

`BaseScene` handles before `renderContent` is called: buffer clearing, `ScreenChrome` rendering, title + apostrophe-underline, summary lines, and tab bar. It also wires all input: MENU → `onMenu()`, LEFT/RIGHT → tab switch, nav footer taps → `handleNavTap()`, header menu tap → `onMenu()`, tab-bar taps → tab switch. Anything else reaches `handleAction`, `handleTap`, or `handleCharInput`.

Constructor options:

```typescript
interface BaseSceneOptions {
  navOptions: ReadonlyArray<NavOption>;
  showHeader?: boolean;   // default true
  showFooter?: boolean;   // default true
  title?: string;
  summary?: string[];     // lines rendered below title/underline
  tabs?: string[];        // tab labels; BaseScene owns activeTabIdx
  onMenu?: () => void;
}
```

Hooks subclasses can override:

| Hook | Called when |
|---|---|
| `handleAction(action)` | Any action not consumed by BaseScene |
| `handleTap(col, row)` | Any tap not consumed by BaseScene |
| `handleNavTap(navId)` | Nav footer button tapped |
| `handleCharInput(char)` | Character input received |
| `onTabChange(newIdx)` | Active tab changed by BaseScene |
| `preHandleAction(action): boolean` | Before BaseScene processes any action; return `true` to consume (used by modal routing) |
| `preHandleTap(col, row): boolean` | Before BaseScene processes any tap; return `true` to consume |
| `buildChromeConfig(): ChromeConfig` | Override to customise chrome labels (e.g. during animations) |

## Menu scenes (BaseMenuScene)

`BaseMenuScene` (`src/game/scenes/base-menu-scene.ts`) extends `BaseScene` and adds cursor navigation, item rendering, pagination, and modal support. Pass configuration through the constructor:

```typescript
constructor(
  title: string,
  items: MenuItemDef[],
  navOptions: ReadonlyArray<NavOption>,
  inputHandler: InputHandler,
  context: GameContext,
  player: PlayerState,
  infoLines?: string[],   // rendered as summary lines above items
  tabs?: TabDef[] | null, // tabs with per-tab item lists
  onMenu?: () => void,
)
```

`MenuItemDef` fields:

| Field | Type | Notes |
|---|---|---|
| `label` | `string` | Required |
| `action` | `() => void` | Required; called on SELECT or tap |
| `info` | `string?` | Right-aligned value with dotted separator |
| `infoFg` | `Color?` | Colour override for the info value |
| `details` | `string[]?` | Sub-rows rendered below the label in bright-black |
| `detailsFg` | `Color?` | Colour override for detail rows |
| `disabled` | `boolean?` | Item is shown but not selectable; cursor skips it |
| `icon` | `string?` | Short prefix string rendered before the label |
| `iconFg` | `Color?` | Colour for the icon |
| `accentFg` | `Color?` | Non-cursor, non-disabled item colour (default `'white'`) |

Key behaviours:
- Cursor starts on the first non-disabled item.
- `activated` is set to `true` on SELECT or tap, silencing all further input.
- `openModal(modal)` resets `activated = false` so the modal receives subsequent input.
- Items are paginated automatically when they overflow the available rows.
- Subclasses can override `handleNavAction(action)` for keyboard nav-bar routing and `handleNavTap(navId)` for tap nav-bar routing.

Current `BaseMenuScene` subclasses: `StationMenuScene`, `TraderScene`, `MissionBoardScene`, `MissionDetailScene`, `MissionLogScene`, `GlobalMenuScene`, `TravelMenuScene`.

## Transition scenes (BaseTransitionScene)

`BaseTransitionScene` (`src/game/scenes/base-transition-scene.ts`) extends `BaseScene`. It owns the timing loop and calls `onComplete()` after `duration` ms. Subclasses implement `renderContent(buffer, top, bottom)` only; they may also override `buildChromeConfig()` to set chrome label overrides during the animation.

All eight animation scenes use this pattern. See `docs/decisions/travel-system.md` for durations and routing.

## Direct BaseScene subclasses

Scenes that need non-menu layout but standard chrome extend `BaseScene` directly:

| Scene | Purpose |
|---|---|
| `GalaxyMapScene` | Hub-and-spoke chart + route planner; two tabs (MAP / ROUTE) |
| `ShipCockpitScene` | Animated cockpit view with gauges, radar, and starfield |
| `StoryScene` | Scrolling story text with pagination |
| `CargoScene` | Display-only cargo hold; two tabs (COMMODITIES / MISSION GOODS) |

## Splash screen

`MainMenuScene` implements `Scene` directly. It is the splash screen and intentionally has no chrome or standard layout.

## Shared drawing helpers

`src/shared/buffer-utils.ts` exports helpers used by scenes:

- `writeText(buffer, row, col, text, fg, bg)` — writes a string at a fixed position
- `writeCentered(buffer, row, text, fg, bg)` — centres a string on a row
- `drawBorder(buffer, fg, bg)` — draws a `+`/`-`/`|` border around the full buffer
- `wrapText(text, maxWidth)` — wraps a string to an array of lines
- `drawSeparator(buffer, row, w, fg?)` — writes a full-width `'-'` separator
- `renderPager(buffer, row, w, page, total)` — renders a `|<| n/total |>|` pager indicator

## Scene wiring

Creating scenes and passing callbacks is the responsibility of the two entry points — `src/main.ts` (browser) and `src/platform/terminal/terminal.ts` (Bun). Both must be kept in sync when adding new scenes. Game state lives in `PlayerState`, constructed once at startup and passed to every scene.
