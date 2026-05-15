# Colour, Input & Runtime Context

## Colour

The game uses a named 16-colour palette — the classic set supported by every terminal since the 1980s. The game logic only ever references named colours (e.g. `'bright-green'`); each renderer translates these to its own system:

- **DOMRenderer** → CSS classes (`.fg-green`, `.bg-bright-blue`, etc.) defined in a single stylesheet. Swapping the full visual theme (e.g. phosphor green → amber) requires only changing CSS variables.
- **TerminalRenderer** → ANSI escape codes. Consecutive cells with identical colours skip the escape sequence for performance.

The named palette approach means colour themes are a stylesheet concern, not a game logic concern.

---

## Input

Input is abstracted into semantic `GameAction` events and an optional positional `onTap` signal. Neither the game loop nor any scene ever sees a raw keycode, ANSI byte sequence, or raw touch coordinate.

| Action | Browser keyboard | Touch | Terminal |
|---|---|---|---|
| UP / DOWN / LEFT / RIGHT | Arrow keys | Swipe | Arrow keys |
| PAGE_UP / PAGE_DOWN | `[` / `]` | — | `\x1b[5~` / `\x1b[6~` |
| SELECT | Enter | — (see below) | Enter |
| BACK | Escape | Two-finger tap | Escape |
| PAUSE | P | — | P |
| NAV_1–NAV_9 | Digit keys 1–9 | — | Digit keys 1–9 |

**Touch and menus:** Touch does not use incremental UP/DOWN to move a cursor. Instead, a tap fires `onTap(col, row)` with grid coordinates. Menu scenes map the tapped row directly to a menu item and activate it — one tap, no cursor movement. Swipes fire directional `GameAction` events and are reserved for future in-game use.

**NAV_1–NAV_9** are used by `ScreenChrome` footer nav buttons (e.g. `[1] UNDOCK`, `[2] HUB`). Digit keys and their touch equivalents via `hitTestNav()` fire these actions.

---

## Runtime Context

Scenes sometimes need to know what environment they are running in — for example, to hide a QUIT option that is meaningless in a browser, or to show touch-appropriate hints instead of keyboard hints. This is expressed as `GameContext`, injected into each scene's constructor:

```typescript
const context: GameContext = {
  environment: 'browser',
  primaryInput: 'touch',
  debug: false,
  systemId: 'sol',
  destinationId: 'elysium-station',
  credits: 5000,
};
const scene = new MainMenuScene(inputHandler, context);
```

`GameContext` is constructed once in each entry point and passed down. `systemId`, `destinationId`, and `credits` are mutated by the orchestrator as the player navigates.

**`environment`** — set statically by the entry point:
- `terminal.ts` (Bun): always `'terminal'`
- `src/main.ts` (browser): always `'browser'`

**`primaryInput`** — detected once at startup:
- Terminal: always `'keyboard'`
- Browser: `navigator.maxTouchPoints > 0` → `'touch'`; otherwise `'keyboard'`

Scenes use `context` to drive presentation decisions (which options to show, which hints to display) but never use it to bypass game logic. Platform-specific *behaviour* belongs in the renderer and input handler; `GameContext` is only for *presentation* choices that game-layer code needs to make.
