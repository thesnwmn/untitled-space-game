# 020 · World Data File Loader — DONE

## What it added

Replaced the static hardcoded `WORLD` object in `world-data.ts` with a file-based
loader. `world-parser.ts` parses `docs/world/**/*.md` via `gray-matter`, routing
files by path pattern and mapping snake_case front matter to camelCase TypeScript
types. The browser build uses Vite's `import.meta.glob`; the terminal build uses
Bun/Node `fs` APIs. All entry points and the Vitest setup file now call
`initWorld(loadWorldData())` once at startup.

## Key files

- `src/game/world/world-parser.ts` — pure parse function (new)
- `src/game/world/world-loader-browser.ts` — Vite glob loader (new)
- `src/game/world/world-loader-terminal.ts` — Bun fs loader (new)
- `src/game/world/world-data.ts` — removed WORLD; added initWorld/getWorld
- `src/game/world/world-parser.test.ts` — 14 unit tests (new)
- `src/ambient-node.d.ts` — minimal fs/path/process ambient declarations (new)
- `src/tests/setup.ts` — now calls initWorld so all tests get live world data
- `docs/world/game-settings.md` — corrected starting_credits to 5000

## Architectural decisions embedded

- `initWorld` / `getWorld` pattern: world data is loaded once before any scene
  construction and accessed via a module-level singleton; no async loading.
- Ambient `.d.ts` stub for `fs`/`path`/`process` avoids adding `@types/node`
  as a dependency while satisfying tsc for the terminal-only loader.
