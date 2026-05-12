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
  game/           ← all game logic, state, scenes (pure TS)
  platform/
    dom/          ← DOMRenderer, DOMInputHandler
    terminal/     ← TerminalRenderer, TerminalInputHandler
  shared/
    types.ts      ← CharBuffer, Renderer, InputHandler, Color interfaces
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

export type GameAction =
  | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  | 'SELECT' | 'BACK' | 'PAUSE'
  | 'PAGE_UP' | 'PAGE_DOWN';

export type RuntimeEnvironment = 'browser' | 'terminal';
export type PrimaryInput = 'keyboard' | 'touch';

export interface GameContext {
  environment: RuntimeEnvironment;
  primaryInput: PrimaryInput;
}
```

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

The game targets a responsive character grid bounded between **20–40 columns × 30–60 rows** (`MIN_GRID_WIDTH/HEIGHT` and `MAX_GRID_WIDTH/HEIGHT` in `shared/types.ts`), designed for a portrait/phone aspect ratio.

- **Browser:** After `document.fonts.ready`, `DOMRenderer` measures the actual pixel size of a character cell. On construction and on each debounced `window.resize` event (~100ms), it computes the largest grid that fits the viewport within the min/max bounds. If the viewport is smaller than the minimum grid, the font is scaled down proportionally so the minimum grid always fits. All registered `onResize` handlers are fired with the new dimensions.
- **Terminal:** `TerminalRenderer` reads `process.stdout.columns`/`rows` at construction and clamps them to the min/max bounds. A `SIGWINCH` listener (guarded by try/catch) recomputes dimensions and fires `onResize` handlers when the terminal is resized.

The `Renderer` interface exposes `onResize(handler)` so game-layer code can react to dimension changes without platform knowledge. ASCII art and layouts must be designed to work within the full range of allowed grid sizes.

## Deployment
- Source hosted on GitHub
- Browser build deployed via GitHub Pages from Vite output
- Terminal build installable via Bun
- No local machine required for development — changes made via Claude Code on the web

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
| Layout | Responsive grid (20–40 × 30–60) | Fills available viewport; font scales down for small screens; fixed design target avoids per-platform layout logic |
