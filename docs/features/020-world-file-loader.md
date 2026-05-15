# 020 · World Data File Loader

## Goal

Replace the static `WORLD` object in `world-data.ts` with a loader that parses
the canonical markdown files in `docs/world/`. The browser build uses Vite's
`import.meta.glob` to bundle them at compile time; the terminal build reads them
from disk via Bun's fs APIs. Both paths produce the same typed `WorldData`
structure consumed by all existing helper functions. No scene code changes.

---

## Player-visible changes

None. This is a pure infrastructure change. The world data consumed by scenes
is identical in shape; only its source moves from a hardcoded TypeScript object
to parsed markdown files.

---

## Architecture overview

Four modules carry the work:

```
src/game/world/
  world-parser.ts          new — pure fn: Record<string,string> → WorldData
  world-loader-browser.ts  new — uses import.meta.glob (Vite / Vitest only)
  world-loader-terminal.ts new — uses Bun fs APIs (terminal only)
  world-data.ts            modified — initWorld() + same public getter API
  types.ts                 unchanged
```

Orchestrators call `initWorld(loadWorldData())` once before any scene is created.
Scene code and all tests continue to call `getSystem()`, `getDestination()`, etc.
without any changes.

---

## New file: `src/game/world/world-parser.ts`

**Entry point:** `parseWorldFiles(files: Record<string, string>): WorldData`

`files` is a map of **normalised relative path → raw file content**, with paths
relative to `docs/world/` (e.g. `systems/sol.md`, `navigation/jump-routes.md`).

### File routing

| Path pattern | Entity | Strategy |
|---|---|---|
| `systems/<id>.md` | `StarSystem` | front matter + body extract |
| `destinations/<id>.md` | `Destination` | front matter + body extract |
| `factions/<id>.md` | `Faction` | front matter + body extract |
| `ships/<id>.md` | `Ship` | front matter + body extract |
| `ships/components/jump-drives.md` | `JumpDrive[]` | front matter list (`drives` key) |
| `navigation/jump-routes.md` | `JumpRoute[]` | front matter list (`routes` key) |
| `commodities.md` | `Commodity[]` | front matter list (`commodities` key) |
| `story/<id>.md` | `StoryBeat` | front matter + full body as `text` |
| `game-settings.md` | `GameSettings` | front matter only |

Files whose basename is `_template.md` or `.gitkeep` are silently skipped.
Files outside the recognised patterns are silently skipped (no error thrown).

Use `gray-matter` (already in `devDependencies`) to split each file into
`{ data, content }`.

### Description extraction

For `StarSystem`, `Destination`, `Faction`, `Ship`: skip heading lines (starting with
`#`), find the first run of consecutive non-blank lines, join with a single space.
Store as `description`. Empty string if no such run exists.

For `StoryBeat`: `text` = the full trimmed body, preserving internal newlines.

For list entries (`Commodity`, `JumpDrive`, `JumpRoute`, `GameSettings`): no body.
`Commodity.description` comes from the `description` field within each YAML list item.

### Field name mapping (snake_case → camelCase)

| Front matter key | TypeScript field |
|---|---|
| `star_type` | `starType` |
| `distance_from_sol` | `distanceFromSol` |
| `danger_level` | `dangerLevel` |
| `player_knowledge` | `playerKnowledge` |
| `location_type` | `locationType` |
| `mission_board` (amenities) | `missionBoard` |
| `ship_repair` (amenities) | `shipRepair` |
| `ship_dealer` (amenities) | `shipDealer` |
| `goods_bias` | `goodsBias` |
| `home_system` | `homeSystem` |
| `cargo_capacity_kg` | `cargoCapacityKg` |
| `fuel_capacity_l` | `fuelCapacityL` |
| `hull_points` | `hullPoints` |
| `default_jump_drive` | `defaultJumpDrive` |
| `max_distance_ly` | `maxDistanceLy` |
| `fuel_efficiency` | `fuelEfficiency` |
| `base_price` | `basePrice` |
| `weight_kg` | `weightKg` |
| `starting_credits` (player sub-key) | `startingCredits` |
| `starting_location` | `startingLocation` |

All unrecognised front matter keys are silently ignored.

### Destination amenities

The `amenities` front matter block maps to `Destination.amenities`. Boolean sub-keys
`trader` and `fuel` are passed through directly; snake_case sub-keys map as above.

### GameSettings

`player.starting_credits` → `settings.player.startingCredits`.
`starting_location.system` / `starting_location.destination` → `settings.startingLocation.*`.

---

## New file: `src/game/world/world-loader-browser.ts`

Single export `loadWorldData(): WorldData`. Uses `import.meta.glob` with `?raw` and
`eager: true` to load all `docs/world/**/*.md` files as strings at bundle time. Strip
the path prefix up to and including `docs/world/` to normalise keys, then pass to
`parseWorldFiles`.

This file is only ever imported from Vite-compiled code (browser build, Vitest).

---

## New file: `src/game/world/world-loader-terminal.ts`

Single export `loadWorldData(): WorldData`. Recursively reads all `.md` files under
`docs/world/` using synchronous fs APIs, keyed by path relative to `docs/world/`
(forward-slash normalised). Pass to `parseWorldFiles`.

This file is only ever imported from `terminal.ts` (Bun execution).

---

## Modified file: `src/game/world/world-data.ts`

Remove the static `WORLD` object and all hardcoded data. New public API:

- `initWorld(data: WorldData): void` — stores the data; must be called before any getter
- `getWorld(): WorldData` — throws if `initWorld` not yet called
- `getSystem(id)`, `getDestination(id)`, `getRoutesFrom(systemId)`, `getDrive(id)`,
  `getStoryBeat(id)`, `getStoryBeatsByTrigger(trigger)`, `getGameSettings()` — all
  unchanged signatures, now delegating to `getWorld()` internally

`WORLD` named export is removed. Any code that referenced it must switch to `getWorld()`.

---

## Modified files: `src/main.ts`, `terminal.ts`, `src/tests/setup.ts`

Each calls `initWorld(loadWorldData())` once at startup, before any scene construction.
Use the browser loader in `main.ts` and `setup.ts`; the terminal loader in `terminal.ts`.

---

## Tests

### New: `src/game/world/world-parser.test.ts`

Unit-test `parseWorldFiles` in isolation using inline fixture strings. Do not read from disk.

Cover: system file (camelCase fields correct; description extracted from first body
paragraph, not from headings); destination file (amenity field mapping); story beat
(full body as `text`; `playerKnowledge` mapped); jump routes list; jump drives list;
commodities list (`basePrice` and `weightKg` mapped); game settings (`startingCredits`
and `startingLocation`); `_template.md` skipped; `.gitkeep` skipped; unknown path
pattern silently skipped.

### Modified: `src/game/world/world-data.test.ts`

Remove import of `WORLD` (no longer exported). Replace `WORLD.*` references with
`getWorld().*`. `initWorld` is called globally by `setup.ts` — no `beforeAll` needed.
Preserve all existing referential integrity tests.

---

## Acceptance criteria

- `npm test` passes with zero failures (all existing tests + new parser tests).
- `npx tsc --noEmit` reports zero errors.
- `npm run dev` starts; the browser game runs identically to before this change.
- `npm run terminal` starts; the terminal game runs identically to before.
- `WORLD` is no longer exported from `world-data.ts` — no file imports it.
- `world-data.ts` contains no hardcoded world content.
- The parsed world includes all systems, destinations, factions, ships, story beats,
  and routes present in `docs/world/`.
- `getSystem('sol')` and `getDestination('elysium-station')` return correctly typed
  objects with camelCase fields.
- `getStoryBeatsByTrigger('game-start')[0].text` contains the full opening story text
  with internal newlines.

---

## Out of scope

- Validation or error-reporting for malformed world files.
- Hot-reloading world files during dev server operation.
- Async loading (everything must be synchronous).
- Any changes to scene rendering or game behaviour.
- Adding new content to `docs/world/`.

---

## Dependencies

- **018 · World Data Schemas & Seed Content** — the markdown files to be loaded.
- **019 · World Data TypeScript Types** — the `WorldData`, `StarSystem`, etc. types.
- `gray-matter` ^4.0.3 — already in `devDependencies`, no install needed.
