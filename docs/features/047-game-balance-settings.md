# Feature 047 · Game Balance Settings

## Goal

All gameplay balance constants — probabilities, reward ranges, stock quantities, cache timings, and fuel economics — are moved out of source code and into a declarative world-data file so they can be tuned without touching TypeScript.

---

## Acceptance criteria

- A `docs/world/settings/balance.md` file exists and contains all balance settings in YAML frontmatter, grouped into `npc`, `missions`, `trading`, and `fuel` sections
- `docs/world/game-settings.md` is moved to `docs/world/settings/new-game.md`; its content and parsed values are unchanged
- A `GameBalance` interface is defined in `src/game/world/types.ts`; `WorldData` carries a `balance` field of that type
- `world-parser.ts` parses `settings/balance.md` into `GameBalance` and `settings/new-game.md` into `GameSettings`; both path-match strings are updated accordingly
- `world-data.ts` exposes a `getGameBalance()` function
- `src/game/constants.ts` is deleted; its two fuel constants are consumed from `getGameBalance()` at call sites
- `src/game/game.ts` reads all trader stock, TTL, and qty values from `getGameBalance()` instead of module-level constants
- `src/game/mission-generator.ts` reads all mission probabilities, counts, reward values, and NPC name chance from `getGameBalance()` instead of hardcoded literals
- Changing a value in `balance.md` and reloading propagates to the game with no source-code edits required
- `npm test` passes; `npx tsc --noEmit` passes

---

## Out of scope

- Cockpit animation timings and starfield twinkle periods (visual engine constants, not gameplay balance)
- Multiple difficulty presets or runtime balance switching
- Any player-visible UI for balance values

---

## Technical notes

### New world data directory layout

```
docs/world/
  settings/
    new-game.md     (moved from docs/world/game-settings.md)
    balance.md      (new)
  systems/
  destinations/
  ...
```

Both loaders already traverse subdirectories recursively, so no changes to `world-loader-browser.ts` or `world-loader-terminal.ts` are needed.

### `balance.md` frontmatter shape

> suggestion

```yaml
---
id: balance

npc:
  special_name_chance: 0.3

missions:
  board_count_min: 3
  board_count_max: 6
  delivery_chance: 0.6
  delivery_base_reward: 200
  delivery_random_reward: 200
  supply_reward_margin: 0.4
  supply_random_reward: 150
  supply_requirements_min: 1
  supply_requirements_max: 2
  supply_qty_min: 1
  supply_qty_max: 4

trading:
  stock_count_min: 4
  stock_count_max: 6
  stock_qty_min: 1
  stock_qty_max: 8
  stock_ttl_ms: 120000
  mission_ttl_ms: 900000

fuel:
  price_per_litre: 10
  consumption_per_ly: 5
---
```

These default values must match the current hardcoded values exactly so behaviour is unchanged after the migration.

### `GameBalance` interface (`src/game/world/types.ts`)

Add alongside `GameSettings`:

```typescript
export interface GameBalance {
  npc: {
    specialNameChance: number;
  };
  missions: {
    boardCountMin: number;
    boardCountMax: number;
    deliveryChance: number;
    deliveryBaseReward: number;
    deliveryRandomReward: number;
    supplyRewardMargin: number;
    supplyRandomReward: number;
    supplyRequirementsMin: number;
    supplyRequirementsMax: number;
    supplyQtyMin: number;
    supplyQtyMax: number;
  };
  trading: {
    stockCountMin: number;
    stockCountMax: number;
    stockQtyMin: number;
    stockQtyMax: number;
    stockTtlMs: number;
    missionTtlMs: number;
  };
  fuel: {
    pricePerLitre: number;
    consumptionPerLy: number;
  };
}
```

Add `balance: GameBalance` to `WorldData`.

### `world-parser.ts` changes

- Path match for new-game: change `path === 'game-settings.md'` → `path === 'settings/new-game.md'`
- Add a new branch: `path === 'settings/balance.md'` → `world.balance = parseBalance(data)`
- Add a `parseBalance(data)` function that maps snake_case YAML keys to the camelCase `GameBalance` shape, with defaults matching the current hardcoded values
- The default `balance` value in the `world` initialiser object must be fully populated (all defaults) so the game functions even if the file is absent

### `world-data.ts` change

Add:

```typescript
export function getGameBalance(): GameBalance {
  return getWorld().balance;
}
```

### `src/game/constants.ts`

Delete this file entirely. Update the two call sites that currently import `FUEL_PER_LY` and `FUEL_PRICE_PER_L` to call `getGameBalance()` instead.

### `src/game/game.ts` changes

Remove the module-level `STOCK_TTL_MS` and `MISSION_TTL_MS` constants. Read `balance.trading.stockTtlMs`, `balance.trading.missionTtlMs`, `balance.trading.stockCountMin/Max`, and `balance.trading.stockQtyMin/Max` from `getGameBalance()` at the point of use.

### `src/game/mission-generator.ts` changes

Replace every hardcoded literal that corresponds to a `GameBalance` field with a read from `getGameBalance()`. The mapping is 1-to-1 with the frontmatter values listed above. The seeded RNG logic and LCG implementation are unchanged — only the bound values change source.

---

## Play-test instructions

This feature produces no player-visible changes; it is a pure refactoring. The play-test goal is to confirm nothing regressed.

### Browser (`npm run dev`)

1. Start a new game and confirm starting credits, location, and ship are unchanged.
2. Visit a mission board — confirm missions are generated (counts and types appear normal).
3. Visit a trader — confirm stock is present and quantities are in a believable range.
4. Travel between systems — confirm fuel consumption and fuel purchase prices are unchanged.
5. Modify a value in `balance.md` (e.g. raise `delivery_base_reward` to 9999), reload, and confirm the change is reflected in mission rewards.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

None
