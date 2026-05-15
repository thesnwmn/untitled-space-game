# Rendering & Architecture

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

---

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
