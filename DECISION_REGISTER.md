# Decision Register

## Rendering: DOM + `<pre>` Buffer

Goven the games selected aesthetic
- Terminal / old-school ASCII aesthetic throughout
- ASCII characters used for art, UI elements, and decoration
- Animations achieved by cycling ASCII art frames and CSS effects (scanlines, flicker, glow)
- Monospace font enforced globally

The game renders using a DOM-based approach rather than Canvas or WebGL.

**How it works:**
- A single `<pre>` element fills the screen
- A 2D array of characters is maintained in JavaScript as a "screen buffer"
- Each frame, the buffer is serialised into a string and written to the element
- Individual characters or regions can be coloured using `<span>` elements
- A monospace font (e.g. VT323 from Google Fonts) keeps characters snapped to a grid

**Why not Canvas?**
Canvas treats text as pixels, losing the natural character-grid behaviour that makes
terminal-style games easy to reason about. Positioning, colouring, and animating
individual characters is trivial with the DOM and cumbersome with Canvas.

**Why not a game framework (e.g. Phaser)?**
Phaser is Canvas/WebGL-first. Its strengths don't align with a menu-heavy, ASCII-art
game. It would add significant dependency weight while providing little relevant value.

## Build Tooling: Vite + TypeScript

**Vite** is used as the build tool and dev server.

- Near-instant startup and hot module reloading
- First-class TypeScript support with no extra config
- Produces clean static files suitable for GitHub Pages deployment
- Minimal configuration overhead — stays out of the way

**TypeScript** is used for all game logic and rendering code.

- Type safety across the character buffer, game state, and UI layer
- Helps Claude Code make accurate, consistent changes across the codebase
- No additional frameworks (React, Vue, etc.) — vanilla TS only

## Deployment
- Source hosted on GitHub
- Deployed via GitHub Pages from the build output
- No local machine required for development — changes made via Claude Code on the web

## Decision Log
| Decision | Choice | Rationale |
|---|---|---|
| Renderer | DOM + `<pre>` | Natural character grid, easy ASCII art, CSS animation support |
| Language | TypeScript | Type safety, better agent-led development experience |
| Build tool | Vite | Simple config, fast dev loop, easy GitHub Pages deploy |
| Game framework | None | No framework matches the DOM+pre rendering approach |
| Styling | CSS + monospace font | CRT/terminal effects achievable without Canvas |
