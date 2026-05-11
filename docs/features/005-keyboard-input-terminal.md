# Feature 005 · Keyboard input handler (terminal)

**Goal:** Map raw terminal keyboard input — including ANSI escape sequences for arrow keys — to semantic `GameAction` events for the Bun terminal entry point.

## Acceptance criteria

- `TerminalInputHandler` is implemented in `src/platform/terminal/TerminalInputHandler.ts` and implements the `InputHandler` interface from `src/shared/types.ts`.
- `onAction(handler)` registers a callback. Multiple registrations are all called independently.
- Key mappings:

  | Input bytes | GameAction |
  |---|---|
  | `\x1b[A` | UP |
  | `\x1b[B` | DOWN |
  | `\x1b[C` | RIGHT |
  | `\x1b[D` | LEFT |
  | `\x1b[5~` | PAGE_UP |
  | `\x1b[6~` | PAGE_DOWN |
  | `\r` or `\n` | SELECT |
  | `\x1b` (bare, single byte) | BACK |
  | `p` or `P` | PAUSE |

- `q`, `Q`, and `Ctrl+C` (`\x03`) trigger a clean shutdown: `process.exit(0)`. These are not `GameAction` events.
- `connect()` sets `process.stdin` to raw mode (`process.stdin.setRawMode(true)`) and begins reading. `disconnect()` removes the data listener and restores cooked mode. No events fire after `disconnect()`.
- Running `bun run terminal` shows a smoke-test that logs each received `GameAction` to `console.log`. This can be left in place until the main menu is wired up.
- `tsc --noEmit` passes with zero errors.

## Out of scope

- Mouse input in terminal
- `onTap` (positional input has no terminal equivalent)
- Any rendering

## Technical notes

- Use `process.stdin.on('data', (chunk: Buffer) => ...)` in raw mode. Each keypress arrives as a `Buffer`.
- Distinguish bare Escape from arrow/page sequences by byte length and content: arrow sequences are exactly 3 bytes (`\x1b`, `[`, `A/B/C/D`); page sequences are 4 bytes (`\x1b`, `[`, `5`/`6`, `~`). A single `\x1b` byte is a bare Escape.
- `connect()` and `disconnect()` are concrete methods on `TerminalInputHandler`, not part of the shared `InputHandler` interface.

## Dependencies

- 001 · Scaffold
