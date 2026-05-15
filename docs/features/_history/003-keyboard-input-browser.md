# 003 · Keyboard Input Handler (Browser) — DONE

## What it added
Implemented `DOMInputHandler` in `src/platform/dom/DOMInputHandler.ts`, mapping browser `keydown` events to semantic `GameAction` values (UP, DOWN, LEFT, RIGHT, PAGE_UP, PAGE_DOWN, SELECT, BACK, PAUSE) so game scenes receive abstract actions rather than raw keycodes.

## Key files
- `src/platform/dom/DOMInputHandler.ts` — `DOMInputHandler` implementing `InputHandler`
- `src/shared/types.ts` — `GameAction` union type and `InputHandler` interface

## Architectural decisions embedded
- `connect()` / `disconnect()` are concrete methods on `DOMInputHandler`, not part of the shared `InputHandler` interface.
- Arrow and Page Up/Down events call `event.preventDefault()` to suppress browser scroll.
- Key repeat is intentional: every `keydown` fires one action, including held-key repeats.
