# 005 · Keyboard Input Handler (Terminal) — DONE

## What it added
Implemented `TerminalInputHandler` in `src/platform/terminal/TerminalInputHandler.ts`, parsing raw ANSI escape sequences from `process.stdin` (raw mode) and mapping them to the same `GameAction` values used by the browser handler. `q`, `Q`, and Ctrl+C trigger `process.exit(0)`.

## Key files
- `src/platform/terminal/TerminalInputHandler.ts` — `TerminalInputHandler` implementing `InputHandler`

## Architectural decisions embedded
- Bare escape (`\x1b` single byte) maps to BACK; arrow sequences (3-byte `\x1b[A/B/C/D`) map to directional actions; page sequences (4-byte `\x1b[5~/6~`) map to PAGE_UP/PAGE_DOWN.
- `onTap` is not implemented — positional input has no terminal equivalent.
- `connect()` / `disconnect()` are concrete methods, not part of the shared interface.
