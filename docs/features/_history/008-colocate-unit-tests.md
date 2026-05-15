# 008 · Colocate Unit Tests with Source Modules — DONE

## What it added
Moved all test files out of the central `src/tests/` directory and placed them alongside the source modules they test. Updated Vitest's `include` pattern from `src/tests/**/*.test.ts` to `src/**/*.test.ts`. No tests were added, removed, or changed.

## Key files
- `vite.config.ts` — `include` pattern widened to `src/**/*.test.ts`
- `src/platform/dom/DOMRenderer.test.ts`, `DOMInputHandler.test.ts`
- `src/platform/terminal/TerminalRenderer.test.ts`, `TerminalInputHandler.test.ts`

## Architectural decisions embedded
- `src/tests/setup.ts` remains at its original path (test infrastructure only, not colocated with any single module).
