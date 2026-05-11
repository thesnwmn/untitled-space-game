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
}

export interface InputHandler {
  onAction(handler: (action: GameAction) => void): void;
}

export type GameAction =
  | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  | 'SELECT' | 'BACK' | 'PAUSE';
```

## Colour

The game uses a named 16-colour palette — the classic set supported by every terminal since the 1980s. The game logic only ever references named colours (e.g. `'bright-green'`); each renderer translates these to its own system:

- **DOMRenderer** → CSS classes (`.fg-green`, `.bg-bright-blue`, etc.) defined in a single stylesheet. Swapping the full visual theme (e.g. phosphor green → amber) requires only changing CSS variables.
- **TerminalRenderer** → ANSI escape codes. Consecutive cells with identical colours skip the escape sequence for performance.

The named palette approach means colour themes are a stylesheet concern, not a game logic concern.

## Input

Input is abstracted into semantic `GameAction` events. Neither the game loop nor any scene ever sees a raw keycode, ANSI byte sequence, or touch coordinate.

| Action | Browser | Terminal |
|---|---|---|
| UP / DOWN / LEFT / RIGHT | Arrow keys or swipe | Arrow keys |
| SELECT | Enter or tap | Enter |
| BACK | Escape or swipe | Escape |
| PAUSE | P or menu button | P |

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

The game targets a fixed character grid (e.g. 40×60 characters) designed for a portrait/phone aspect ratio.

- **Browser:** The `<pre>` is centred and letterboxed with CSS. Wider viewports show more background — the game area stays fixed. No JavaScript layout logic needed.
- **Terminal:** Grid is clamped to the fixed size; terminal dimensions are read via `process.stdout.columns` / `process.stdout.rows`.

ASCII art and layouts are designed once for the fixed grid and work across both targets without reflowing.

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
| Layout | Fixed character grid | Design once, works across browser and terminal targets |
| Build tool | Vite | Simple config, fast dev loop, easy GitHub Pages deploy |
| Game framework | None | No framework matches the DOM+pre rendering approach |
| Styling | CSS + monospace font | CRT/terminal effects achievable without Canvas |
