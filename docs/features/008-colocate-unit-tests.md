# Feature 008 — Colocate Unit Tests with Source Modules

**Goal:** Move test files out of the central `src/tests/` directory and place them alongside the source modules they test, so tests are trivially discoverable and naturally travel with their modules.

## Acceptance criteria

- `src/tests/scaffold.test.ts` is deleted; its four describe blocks become four new colocated files:
  - `src/platform/dom/DOMRenderer.test.ts` — `describe('DOMRenderer')` block
  - `src/platform/terminal/TerminalRenderer.test.ts` — `describe('TerminalRenderer')` block
  - `src/platform/terminal/TerminalInputHandler.test.ts` — `describe('TerminalInputHandler')` block
  - `describe('DOMInputHandler')` from scaffold merged into the file below
- `src/tests/dom-input-handler.test.ts` is deleted; its content plus the merged DOMInputHandler describe from scaffold becomes `src/platform/dom/DOMInputHandler.test.ts`
- `src/tests/setup.ts` remains at its current path (test infrastructure only)
- `vite.config.ts` test `include` pattern updated from `src/tests/**/*.test.ts` to `src/**/*.test.ts`
- `tsc --noEmit` passes with zero errors
- `npm test` passes all tests with the same test count as before — no tests added or removed

## Out of scope

- Adding, removing, or changing any test logic
- Changing any source code
- Moving `src/tests/setup.ts`

## Technical notes

- The `setupFiles` entry in `vite.config.ts` (`src/tests/setup.ts`) does not change — only the `include` pattern changes.
- The DOMInputHandler describe in `scaffold.test.ts` is a basic smoke test (`onAction and onTap are callable`); it should appear as a separate describe block in `DOMInputHandler.test.ts` alongside the existing detailed tests, not merged into an existing describe.

## Dependencies

None.
