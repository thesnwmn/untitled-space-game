# Decision Register

## Rendering: DOM + `<pre>` Buffer

Given the game's selected aesthetic:
- Terminal / old-school ASCII aesthetic throughout
- ASCII characters used for art, UI elements, and decoration
- Animations achieved by cycling ASCII art frames and CSS effects (scanlines, flicker, glow)
- Monospace font enforced globally

The game renders using a DOM-based approach rather than Canvas or WebGL.

**How it works:**
- A single `<pre>` element fills the screen
- A 2D array of `Cell` objects is maintained in JavaScript as a "screen buffer"
- Each cell stores a character, a foreground colour, and a background colour
- Each frame, the buffer is serialised into a string of `<span>` elements and written to the element
- A monospace font (e.g. VT323 from Google Fonts) keeps characters snapped to a grid

**Why not Canvas?**
Canvas treats text as pixels, losing the natural character-grid behaviour that makes
terminal-style games easy to reason about. Positioning, colouring, and animating
individual characters is trivial with the DOM and cumbersome with Canvas.

**Why not a game framework (e.g. Phaser)?**
Phaser is Canvas/WebGL-first. Its strengths don't align with a menu-heavy, ASCII-art
game. It would add significant dependency weight while providing little relevant value.

## Architecture: Platform Abstraction Layers

The codebase is divided into three distinct layers so that game logic is fully decoupled from rendering and input:

```
[ Game Logic & State ]  ← pure TypeScript, no platform knowledge
        ↓
[ Renderer Interface ]  ← shared contract all targets implement
        ↓
[ DOM Renderer ]        [ Terminal Renderer ]
[ Input: touch/mouse/kb][ Input: keyboard ]
```

**File structure:**
```
src/
  game/
    constants.ts  ← game-wide constants (e.g. STATION_NAME)
    scenes/       ← all scene implementations
  platform/
    dom/          ← DOMRenderer, DOMInputHandler
    terminal/     ← TerminalRenderer, TerminalInputHandler
  shared/
    types.ts      ← CharBuffer, Renderer, InputHandler, Scene, Color interfaces
    buffer-utils.ts ← shared drawing helpers (writeText, writeCentered, drawBorder)
index.html        ← browser entry point (Vite)
terminal.ts       ← terminal entry point (Bun)
```

**Naming conventions:**
- **Folders:** single lowercase word where possible; multi-word folders use kebab-case (e.g. `game-objects/`)
- **Source files exporting a class:** PascalCase matching the class name (e.g. `DOMRenderer.ts`)
- **Other source files:** lowercase or kebab-case (e.g. `main.ts`, `types.ts`)
- **Test files:** kebab-case with `.test.ts` suffix (e.g. `dom-input-handler.test.ts`)
- **Documentation:** SCREAMING_SNAKE_CASE for root-level docs (`BACKLOG.md`); kebab-case with numeric prefix for feature specs (`002-char-buffer-dom-renderer.md`)

**Core types (`shared/types.ts`):**
```typescript
export type Color =
  | 'black' | 'red' | 'green' | 'yellow'
  | 'blue' | 'magenta' | 'cyan' | 'white'
  | 'bright-black' | 'bright-red' | 'bright-green' | 'bright-yellow'
  | 'bright-blue' | 'bright-magenta' | 'bright-cyan' | 'bright-white'
  | 'transparent';

export interface Cell {
  char: string;
  fg: Color;
  bg: Color;
}

export type CharBuffer = Cell[][];

export interface Renderer {
  drawBuffer(buffer: CharBuffer): void;
  getWidth(): number;
  getHeight(): number;
  clear(): void;
  onResize(handler: (width: number, height: number) => void): void;
}

export interface InputHandler {
  onAction(handler: (action: GameAction) => void): void;
  onTap?(handler: (col: number, row: number) => void): void;
}

export interface Scene {
  update(dt: number): void;
  render(buffer: CharBuffer): void;
}

export type GameAction =
  | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  | 'SELECT' | 'BACK' | 'PAUSE'
  | 'PAGE_UP' | 'PAGE_DOWN';

export type RuntimeEnvironment = 'browser' | 'terminal';
export type PrimaryInput = 'keyboard' | 'touch';

export interface GameContext {
  environment: RuntimeEnvironment;
  primaryInput: PrimaryInput;
  debug: boolean;
}
```

## Scene System

All game screens implement the `Scene` interface from `shared/types.ts`. The game loop calls `update(dt)` and `render(buffer)` on the active scene each frame.

**Menu scenes** extend `BaseMenuScene` (`src/game/scenes/BaseMenuScene.ts`), which provides:
- Cursor navigation (UP/DOWN with wrap-around)
- Tap-to-item mapping (`onTap` row → item index)
- `activated` guard — set on the first SELECT or tap, silences all further input
- Standard `render()` layout: white border, bright-cyan title centred at row 2, cyan rule at row 3, bright-green/white items from row 14, bright-black footer hint at row h−3

Individual menu scenes pass a title, items array, and per-item callbacks to the `BaseMenuScene` constructor. They contain no input or rendering logic of their own.

**Custom scenes** implement `Scene` directly (not via `BaseMenuScene`) when they require non-standard layout or behaviour that the base class cannot accommodate:
- `TravelMenuScene` — two tabs (DESTINATIONS / JUMPS) with LEFT/RIGHT switching; uses row 6 for tabs and row 8+ for items rather than BaseMenuScene's row 14 layout
- `JumpAnimationScene` — timer-driven, no player input at all; auto-advances after 5 000 ms
- `InSystemTravelAnimationScene` — same pattern as above but 2 000 ms; kept separate from JumpAnimationScene to allow future visual divergence

**Shared drawing helpers** (`src/shared/buffer-utils.ts`):
- `writeText(buffer, row, col, text, fg, bg)` — writes a string at a fixed position
- `writeCentered(buffer, row, text, fg, bg)` — centres a string on a row
- `drawBorder(buffer, fg, bg)` — draws a `+`/`-`/`|` border around the full buffer

**Scene wiring** (creating scenes and passing callbacks between them) lives entirely in the two entry points — `src/main.ts` (browser) and `terminal.ts` (Bun). Both must be kept in sync when adding new scenes.

## Colour

The game uses a named 16-colour palette — the classic set supported by every terminal since the 1980s. The game logic only ever references named colours (e.g. `'bright-green'`); each renderer translates these to its own system:

- **DOMRenderer** → CSS classes (`.fg-green`, `.bg-bright-blue`, etc.) defined in a single stylesheet. Swapping the full visual theme (e.g. phosphor green → amber) requires only changing CSS variables.
- **TerminalRenderer** → ANSI escape codes. Consecutive cells with identical colours skip the escape sequence for performance.

The named palette approach means colour themes are a stylesheet concern, not a game logic concern.

## Input

Input is abstracted into semantic `GameAction` events and an optional positional `onTap` signal. Neither the game loop nor any scene ever sees a raw keycode, ANSI byte sequence, or raw touch coordinate.

| Action | Browser keyboard | Touch | Terminal |
|---|---|---|---|
| UP / DOWN / LEFT / RIGHT | Arrow keys | Swipe | Arrow keys |
| PAGE_UP / PAGE_DOWN | Page Up / Page Down | — | `\x1b[5~` / `\x1b[6~` |
| SELECT | Enter | — (see below) | Enter |
| BACK | Escape | Two-finger tap | Escape |
| PAUSE | P | — | P |

**Touch and menus:** Touch does not use incremental UP/DOWN to move a cursor. Instead, a tap fires `onTap(col, row)` with grid coordinates. Menu scenes map the tapped row directly to a menu item and activate it — one tap, no cursor movement. Swipes fire directional `GameAction` events and are reserved for future in-game use.

## Runtime Context

Scenes sometimes need to know what environment they are running in — for example, to hide a QUIT option that is meaningless in a browser, or to show touch-appropriate hints instead of keyboard hints. This is expressed as `GameContext`, injected into each scene's constructor:

```typescript
const context: GameContext = { environment: 'browser', primaryInput: 'touch' };
const scene = new MainMenuScene(inputHandler, context);
```

`GameContext` is constructed once in each entry point and passed down. It never changes at runtime.

**`environment`** — set statically by the entry point:
- `terminal.ts` (Bun): always `'terminal'`
- `index.ts` (browser): always `'browser'`

**`primaryInput`** — detected once at startup:
- Terminal: always `'keyboard'`
- Browser: `navigator.maxTouchPoints > 0` → `'touch'`; otherwise `'keyboard'`

Scenes use `context` to drive presentation decisions (which options to show, which hints to display) but never use it to bypass game logic. Platform-specific *behaviour* belongs in the renderer and input handler; `GameContext` is only for *presentation* choices that game-layer code needs to make.

## Build Tooling: Vite + TypeScript + Bun

**Vite** handles the browser build:
- Near-instant startup and hot module reloading
- First-class TypeScript support with no extra config
- Produces clean static files suitable for GitHub Pages deployment
- Minimal configuration overhead — stays out of the way

**Bun** handles the terminal build:
- Runs TypeScript natively with no compile step
- Bundles to a single installable executable (`bun build`)
- Handles raw stdin keyboard input cleanly

**TypeScript** is used for all game logic and rendering code:
- Type safety across the character buffer, game state, and UI layer
- Helps Claude Code make accurate, consistent changes across the codebase
- No additional frameworks (React, Vue, etc.) — vanilla TS only

**Scripts:**
```
npm run dev        → Vite dev server (browser)
npm run build      → Vite build for GitHub Pages
bun run terminal   → Run game in terminal directly
bun build          → Bundle terminal version to standalone binary
```

## Layout

The game uses a fixed character grid of **40 columns × 30 rows** (`GRID_WIDTH` and `GRID_HEIGHT` in `shared/types.ts`).

- **Browser:** After `document.fonts.ready`, `DOMRenderer` measures the pixel size of a character cell at `BASE_FONT_SIZE = 24px`. On construction and on each debounced `window.resize` event (~100ms), it computes `scale = min(vw / (GRID_WIDTH × charW), vh / (GRID_HEIGHT × charH))` and applies it as a scaled `font-size` and explicit `<pre>` width. Grid dimensions are always 40 × 30.
- **Terminal:** `TerminalRenderer` returns `GRID_WIDTH`/`GRID_HEIGHT` statically. No terminal dimension reading or `SIGWINCH` handling.

The `Renderer` interface exposes `onResize(handler)` and both renderers implement it, but since the grid is fixed, registered handlers are never invoked.

Scenes must be designed to work within exactly 40 × 30 cells.

## Deployment
- Source hosted on GitHub
- Browser build deployed via GitHub Pages from Vite output
- Terminal build installable via Bun
- No local machine required for development — changes made via Claude Code on the web

## Travel System

The travel system covers movement both within a star system (between destinations) and between star systems (via jump routes). Both flows converge on a single unified scene rather than separate menus.

### TravelMenuScene (feature 026)

`TravelMenuScene` handles two distinct player situations with one scene:

1. **From ship** (`currentDestinationId: string`) — player is docked at a destination. The DESTINATIONS tab shows all locations in the current system; the player's current location is displayed in `bright-black` and is not selectable.
2. **Arrival mode** (`currentDestinationId: null`) — player has just jumped; they are "in space" with no docked destination. No item is greyed out.

**Constructor signature:**
```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  systemId: string,
  currentDestinationId: string | null,
  onDestinationSelected: (destinationId: string) => void,
  onJumpSelected: (targetSystemId: string) => void,
  onFlyIntoSpace: () => void,
  onShip: () => void,
)
```

**Tabs:** LEFT/RIGHT switch between DESTINATIONS and JUMPS. The active tab is highlighted `bright-green`; the inactive tab is `white`. Switching a tab resets the cursor to 0.

**DESTINATIONS tab items:**
- All destination ids from `getSystem(systemId).destinations`, resolved via `getDestination`
- A sentinel "FLY INTO SPACE" item at the end (`id: '__space__'`), disabled (greyed) when the player is already in space (`currentDestinationId === null`)

**JUMPS tab items:** All routes from `getRoutesFrom(systemId)`, each rendered as `NAME  XLY  [STABILITY]`.

**NavBar:** A `NavBar` with a single SHIP button is rendered at the top. Both the BACK action and a tap on the SHIP button call `onShip()`.

**Layout constants:** `TITLE_ROW=3`, `TAB_ROW=6`, `ITEM_ROW_START=8`, `ITEM_COL=2`.

### ShipScene in-space state (feature 026)

`ShipScene` receives `destinationId: string | null`. When `null`, the ship is "in space" — not docked anywhere:

- Location label shows `IN SPACE  ·  <SYSTEM NAME>` instead of `<DESTINATION>  ·  <SYSTEM>`
- The DOCK button is rendered as `[ - ] DOCK` in `bright-black` and is not selectable
- No station glyph is rendered in the starfield
- Cursor navigation wraps over one item only (TRAVEL)

### Game state: currentDestinationId

`currentDestinationId: string | null` is the single source of truth for whether the ship is docked:

- `string` → docked at a known destination
- `null` → in space (no destination)

The orchestrators (`main.ts`, `terminal.ts`) set this:
- To a destination id on `onDestinationSelected` (in-system travel)
- To `null` on `goToFlyIntoSpace` (player chose FLY INTO SPACE from a dock)
- To `null` on `goToArrival` (after a jump completes)

All scenes that depend on dock/space state (ShipScene, TravelMenuScene) derive their behaviour from this single field.

### Animation scenes

Both animation scenes implement `Scene` directly, accept no `InputHandler`, and auto-advance via an elapsed-time guard:

| Scene | Duration | Fired by | Advances to |
|---|---|---|---|
| `JumpAnimationScene` | 5 000 ms | `onJumpSelected` | `goToArrival` → TravelMenuScene (arrival mode) |
| `InSystemTravelAnimationScene` | 2 000 ms | `onDestinationSelected` | `goToStation` → StationMenuScene |

They are kept as separate classes (rather than parameterised) to allow future visual divergence (different text, effects, or durations).

## Decision Log
| Decision | Choice | Rationale |
|---|---|---|
| Renderer | DOM + `<pre>` | Natural character grid, easy ASCII art, CSS animation support |
| Language | TypeScript | Type safety, better agent-led development experience |
| Browser build tool | Vite | Simple config, fast dev loop, easy GitHub Pages deploy |
| Terminal build tool | Bun | Native TS support, single binary output, clean stdin handling |
| Game framework | None | No framework matches the DOM+pre rendering approach |
| Styling | CSS classes + monospace font | CRT/terminal effects achievable without Canvas; easy theming |
| Colour palette | 16 named ANSI colours | Authentic retro feel, works in both DOM and terminal |
| Input model | Semantic GameActions | Decouples game logic from platform-specific input events |
| Layout | Fixed 40 × 30 grid, font scales to fill viewport | Fixed canvas simplifies scene layout; scaling preserves crisp character grid at any viewport size |
| Menu scene pattern | `BaseMenuScene` abstract class | Centralises cursor navigation, tap-to-item mapping, and input-silencing logic; individual menus only configure title, items, and callbacks |
| Travel scene | Single `TravelMenuScene` with two tabs | Unifies in-system and inter-system travel menus; arrival mode (null destination) reuses the same scene without a separate SystemArrivalScene |
| In-space state | `currentDestinationId: string \| null` | A single nullable field drives ShipScene display, DOCK availability, TravelMenuScene greying, and FLY INTO SPACE selectability — no separate boolean flags needed |
| Separate animation scenes | `JumpAnimationScene` + `InSystemTravelAnimationScene` | Distinct classes preserve the option to diverge visually (different durations, effects, text) without conditional branching inside a shared class |
