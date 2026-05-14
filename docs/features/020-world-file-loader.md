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

Orchestrators call `initWorld(loadWorldData())` once before any scene is
created. Scene code and all tests continue to call `getSystem()`,
`getDestination()`, etc. without any changes.

---

## New file: `src/game/world/world-parser.ts`

### Entry point

```typescript
export function parseWorldFiles(files: Record<string, string>): WorldData
```

`files` is a map of **normalised relative path → raw file content**.
Paths are normalised to the segment after `docs/world/`:
  - `systems/sol.md`
  - `destinations/elysium-station.md`
  - `navigation/jump-routes.md`
  - etc.

The function builds and returns a `WorldData` object by routing each file to
the appropriate parser based on its path.

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

### Gray-matter usage

Use `gray-matter` (already in `devDependencies`) to split each file into
`{ data, content }`. `data` is the parsed YAML front matter; `content` is
the markdown body after the closing `---`.

### Description extraction (entities with individual files)

For `StarSystem`, `Destination`, `Faction`, `Ship`:

1. Split `content` into lines.
2. Skip lines that start with `#` (markdown headings).
3. Find the first run of consecutive non-blank lines.
4. Join that run with a single space and trim.
5. Store the result as `description`.

If no such run exists, store `''`.

For `StoryBeat`:

- `text` = `content.trim()` (the full body, preserving internal newlines).

For entries embedded in a front matter list (`Commodity`, `JumpDrive`,
`JumpRoute`, `GameSettings`), there is no body to extract. `description` for
`Commodity` entries comes from the `description` field within each list item
(already present in the YAML — see note below).

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

All unrecognised front matter keys (e.g. `map_position`) are silently ignored.

### Destination amenities mapping

Front matter:
```yaml
amenities:
  trader: true
  mission_board: true
  ship_repair: true
  fuel: true
  ship_dealer: false
```
Maps to:
```typescript
amenities: {
  trader: boolean,
  missionBoard: boolean,
  shipRepair: boolean,
  fuel: boolean,
  shipDealer: boolean,
}
```

### Commodity description note

The `commodities.md` front matter embeds `description` inline per-entry (not in
a markdown body). The parser reads it directly from the YAML list item.

### GameSettings mapping

Front matter:
```yaml
player:
  name: string
  starting_credits: number
starting_location:
  system: string
  destination: string
```
Maps to:
```typescript
{
  player: { name: string; startingCredits: number },
  startingLocation: { system: string; destination: string },
}
```

---

## New file: `src/game/world/world-loader-browser.ts`

```typescript
import matter from 'gray-matter';
import { parseWorldFiles } from './world-parser';
import type { WorldData } from './types';

export function loadWorldData(): WorldData {
  const raw = import.meta.glob(
    '../../../docs/world/**/*.md',
    { query: '?raw', eager: true, import: 'default' }
  ) as Record<string, string>;

  // Normalise keys: strip everything up to and including 'docs/world/'
  const files: Record<string, string> = {};
  for (const [path, content] of Object.entries(raw)) {
    const idx = path.indexOf('docs/world/');
    if (idx === -1) continue;
    files[path.slice(idx + 'docs/world/'.length)] = content;
  }

  return parseWorldFiles(files);
}
```

This file is only ever imported from Vite-compiled code (browser build, Vitest).

---

## New file: `src/game/world/world-loader-terminal.ts`

```typescript
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { parseWorldFiles } from './world-parser';
import type { WorldData } from './types';

function collectFiles(dir: string, base: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      Object.assign(result, collectFiles(full, base));
    } else if (entry.endsWith('.md')) {
      const rel = relative(base, full).replace(/\\/g, '/');
      result[rel] = readFileSync(full, 'utf8');
    }
  }
  return result;
}

export function loadWorldData(): WorldData {
  // Resolve docs/world/ relative to this file's location at runtime.
  // terminal.ts is at the project root; __dirname is src/game/world/.
  const worldDir = join(new URL(import.meta.url).pathname, '../../../../docs/world');
  return parseWorldFiles(collectFiles(worldDir, worldDir));
}
```

This file is only ever imported from `terminal.ts` (Bun execution).

---

## Modified file: `src/game/world/world-data.ts`

Remove the static `WORLD` object and all hardcoded data.

Replace with:

```typescript
import type {
  WorldData, StarSystem, Destination, JumpRoute, JumpDrive, StoryBeat
} from './types';

let _world: WorldData | null = null;

export function initWorld(data: WorldData): void {
  _world = data;
}

export function getWorld(): WorldData {
  if (!_world) throw new Error('initWorld() must be called before accessing world data');
  return _world;
}

export function getSystem(id: string): StarSystem | undefined {
  return getWorld().systems.find(s => s.id === id);
}

export function getDestination(id: string): Destination | undefined {
  return getWorld().destinations.find(d => d.id === id);
}

export function getRoutesFrom(systemId: string): JumpRoute[] {
  return getWorld().routes.filter(r => r.from === systemId || r.to === systemId);
}

export function getDrive(id: string): JumpDrive | undefined {
  return getWorld().drives.find(d => d.id === id);
}

export function getStoryBeat(id: string): StoryBeat | undefined {
  return getWorld().storyBeats.find(b => b.id === id);
}

export function getStoryBeatsByTrigger(trigger: string): StoryBeat[] {
  return getWorld().storyBeats.filter(b => b.trigger === trigger);
}

export function getGameSettings() {
  return getWorld().settings;
}
```

The `WORLD` named export is removed. Any code that referenced `WORLD` directly
must switch to `getWorld()`.

---

## Modified file: `src/main.ts`

Add at the top (before any scene construction):

```typescript
import { initWorld } from './game/world/world-data';
import { loadWorldData } from './game/world/world-loader-browser';

initWorld(loadWorldData());
```

This call must precede the creation of any scene that calls a world-data getter.

---

## Modified file: `terminal.ts`

Add at the top (before any scene construction):

```typescript
import { initWorld } from './src/game/world/world-data';
import { loadWorldData } from './src/game/world/world-loader-terminal';

initWorld(loadWorldData());
```

---

## Modified file: `src/tests/setup.ts`

Add world initialisation so all Vitest tests have access to world data without
per-test `beforeAll` calls:

```typescript
import { initWorld } from '../game/world/world-data';
import { loadWorldData } from '../game/world/world-loader-browser';

initWorld(loadWorldData());
```

Place this after the existing `document.fonts` polyfill.

---

## Tests

### New: `src/game/world/world-parser.test.ts`

Unit-test `parseWorldFiles` in isolation using inline fixture strings. Do not
read from disk.

Required test cases:

| Case | Description |
|---|---|
| System file | Front matter maps to `StarSystem`; camelCase fields correct; `description` = first body paragraph |
| Destination file | `amenities.missionBoard`, `amenities.shipRepair`, `amenities.shipDealer` are mapped correctly |
| Story beat file | `text` = full trimmed body; `playerKnowledge` mapped from `player_knowledge` |
| Jump routes file | Front matter list under `routes` key produces `JumpRoute[]` |
| Jump drives file | Front matter list under `drives` key produces `JumpDrive[]` |
| Commodities file | Front matter list under `commodities` key; `basePrice` and `weightKg` mapped |
| Game settings file | `startingCredits` and `startingLocation` mapped |
| Template skip | A file named `_template.md` is not included in any output array |
| Gitkeep skip | A file named `.gitkeep` produces no output |
| Unknown path | An unrecognised path pattern (e.g. `unknown/foo.md`) is silently skipped |
| Description heading skip | A body beginning with `# Heading` + paragraph extracts paragraph as description, not the heading |

### Modified: `src/game/world/world-data.test.ts`

- Remove the import of `WORLD` (no longer exported). Replace uses of `WORLD`
  with `getWorld()`.
- `initWorld` is now called globally by `src/tests/setup.ts`; no `beforeAll`
  is needed in this file.
- Tests that previously iterated `WORLD.routes`, `WORLD.destinations`, etc.
  iterate `getWorld().routes` etc. instead.
- All existing referential integrity tests (every system id resolves, every
  destination system field resolves, every route endpoint resolves) are
  preserved — they now test against the live parsed file data.

---

## Acceptance criteria

- `npm test` passes with zero failures (all existing tests + new parser tests).
- `npx tsc --noEmit` reports zero errors.
- `npm run dev` starts; the browser game runs identically to before this change.
- `npm run terminal` starts; the terminal game runs identically to before.
- `WORLD` is no longer exported from `world-data.ts` — no file imports it.
- `world-data.ts` contains no hardcoded world content (systems, destinations,
  routes, drives, ships, factions, commodities, story beats, settings).
- The parsed world includes ALL systems, destinations, factions, ships, story
  beats, and routes present in `docs/world/` — including content the Writer
  role has added beyond the original four systems (e.g. `tau-ceti`,
  `epsilon-eridani`, `sirius`, `procyon` systems and their destinations).
- `getSystem('sol')` and `getDestination('elysium-station')` return correctly
  typed objects with camelCase fields.
- `getStoryBeatsByTrigger('game-start')[0].text` contains the full opening
  story text (multi-paragraph, with internal newlines).

---

## Out of scope

- Validation or error-reporting for malformed world files (throw-on-missing is
  acceptable during development; hardening is a future concern).
- Hot-reloading world files during dev server operation.
- Async loading (everything must be synchronous, matching the current module
  evaluation model).
- Any changes to scene rendering or game behaviour.
- Adding new content to `docs/world/` — that is the Writer role's remit.

---

## Dependencies

- **018 · World Data Schemas & Seed Content** — the markdown files to be loaded.
- **019 · World Data TypeScript Types** — the `WorldData`, `StarSystem`,
  `Destination` etc. types the parser outputs.
- `gray-matter` ^4.0.3 — already in `devDependencies`, no install needed.
