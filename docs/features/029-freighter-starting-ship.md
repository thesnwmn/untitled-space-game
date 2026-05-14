# Feature 029 · Freighter as Starting Ship

## Goal

Wire the player's starting ship to world data. The `game-settings` doc already
holds the starting location and credits; it should also declare the starting ship.
`ShipScene` currently initialises player state from a hardcoded `INITIAL_STATE`
with placeholder values (50 T cargo, 5 000 CR) that don't match any real ship.
After this feature the values are derived from the world data ship record.

## Changes

### 1 · `docs/world/game-settings.md`

Add a `starting_ship` field to the front matter:

```yaml
---
id: game-settings

player:
  name: Captain
  starting_credits: 100

starting_location:
  system: sol
  destination: elysium-station

starting_ship: freighter
---
```

### 2 · `src/game/world/types.ts`

Add `startingShip: string` to `GameSettings`:

```ts
export interface GameSettings {
  player: {
    name: string;
    startingCredits: number;
  };
  startingLocation: {
    system: string;
    destination: string;
  };
  startingShip: string;   // ← new
}
```

### 3 · `src/game/world/world-data.ts`

**a)** Add `startingShip` to the hardcoded `WORLD.settings` object:

```ts
settings: {
  player: { name: 'Captain', startingCredits: 100 },
  startingLocation: { system: 'sol', destination: 'elysium-station' },
  startingShip: 'freighter',
},
```

**b)** Export a `getShip` lookup (alongside the existing `getDrive`, `getSystem`, etc.):

```ts
export function getShip(id: string): Ship | undefined {
  return WORLD.ships.find(s => s.id === id);
}
```

### 4 · `src/game/scenes/ShipScene.ts`

Remove `INITIAL_STATE` entirely. In the constructor, look up the starting ship
and derive the initial `PlayerState` from it:

```ts
import { getDestination, getSystem, getGameSettings, getShip } from '../world/world-data';

// inside constructor, replacing `this.state = { ...INITIAL_STATE }`:
const settings = getGameSettings();
const ship = getShip(settings.startingShip)!;
this.state = {
  fuel: 100,                          // always start full (percentage)
  cargo: 0,                           // empty hold
  cargoCapacity: ship.cargoCapacityKg,
  credits: settings.player.startingCredits,
};
```

Update the status bar render line to use the `KG` unit (matching the world data
field name `cargoCapacityKg`):

```ts
// was:  `FUEL:${this.state.fuel}% | CARGO:${this.state.cargo}/${this.state.cargoCapacity}T | CR:${this.state.credits}`
const statusText = `FUEL:${this.state.fuel}% | CARGO:${this.state.cargo}/${this.state.cargoCapacity}KG | CR:${this.state.credits}`;
```

### 5 · `src/game/scenes/ship-scene.test.ts`

Update the status bar test to expect the freighter's real values:

```ts
// was:
expect(text).toContain('CARGO:0/50T');
expect(text).toContain('CR:5000');

// becomes:
expect(text).toContain('CARGO:0/2000KG');
expect(text).toContain('CR:100');
```

## Acceptance Criteria

- `npx tsc --noEmit` passes with zero errors.
- `npm test` passes with zero failures (including the updated status bar test).
- Running the game shows `FUEL:100% | CARGO:0/2000KG | CR:100` in the status bar.
- No other scenes or tests are affected.

## Play-test Instructions

1. `npm run dev` → open in browser.
2. Navigate past the main menu to the Ship scene.
3. Status bar (top row) reads: `FUEL:100% | CARGO:0/2000KG | CR:100`.
4. Location row, window frame, TRAVEL/DOCK buttons, and footer hint are unchanged.

## Out of Scope

- Feature 020 (world file loader) is not a dependency — the hardcoded
  `WORLD` object in `world-data.ts` is the authoritative source for now.
  When 020 lands it will parse `game-settings.md` automatically.
- Ship selection at game start is a future feature.
- The `fuel` field stays as a percentage (0–100); fuel-in-litres tracking is
  a future feature.
