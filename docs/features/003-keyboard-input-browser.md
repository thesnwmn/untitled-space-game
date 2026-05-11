# Feature 003 · Keyboard input handler (browser)

**Goal:** Map browser keyboard events to semantic `GameAction` events so game scenes can respond to input without knowing about raw keycodes.

## Acceptance criteria

- `DOMInputHandler` is implemented in `src/platform/dom/DOMInputHandler.ts` and implements the `InputHandler` interface from `src/shared/types.ts`.
- `onAction(handler)` registers a callback. Multiple registrations are all called independently.
- Key mappings:

  | Key | GameAction |
  |---|---|
  | ArrowUp | UP |
  | ArrowDown | DOWN |
  | ArrowLeft | LEFT |
  | ArrowRight | RIGHT |
  | Enter | SELECT |
  | Escape | BACK |
  | P / p | PAUSE |

- Arrow key events call `event.preventDefault()` to suppress browser scroll.
- The handler is activated by calling `connect()` (attaches a `keydown` listener to `document`) and deactivated by calling `disconnect()` (removes the listener). No `GameAction` events fire after `disconnect()` is called.
- `DOMInputHandler` is instantiated and connected in the browser entry point and a smoke-test callback logs each received `GameAction` to `console.log`. This can be left in place until the main menu is wired up.
- `tsc --noEmit` passes with zero errors.

## Out of scope

- Touch/swipe input (item 004)
- WASD or other alternative key bindings
- Key repeat suppression — each `keydown` event fires one action, including repeats from held keys

## Technical notes

- Listen exclusively on `document.addEventListener('keydown', ...)`.
- The `InputHandler` interface's `onAction` is the sole public API for consumers. No direct key-state checking.
- `connect()` and `disconnect()` are not part of the shared `InputHandler` interface (which only requires `onAction`); they are concrete methods on `DOMInputHandler` called from the entry point.

## Dependencies

- 001 · Scaffold
