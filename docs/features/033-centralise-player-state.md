# Feature 033 · Centralise Player State

## Goal

Replace the ad-hoc `playerState` object and scattered `currentSystemId` /
`currentDestinationId` / `context.credits` variables in the orchestrators with a
single typed `PlayerState` class that owns all persistent game state, and pass it
to scenes as one argument instead of many individual parameters.

## Acceptance criteria

- `src/game/PlayerState.ts` exists; `PlayerState` is a class with named getters and
  named update methods (no public field mutation).
- `CargoEntry` is defined in `src/game/world/types.ts` (pulled forward from 031).
- Both `src/main.ts` and `terminal.ts` construct a single `PlayerState` at startup.
  The old `playerState` plain object, `currentSystemId`, `currentDestinationId`, and
  the `drive` constant are removed. The `context.X = ...` sync lines before every
  scene construction are removed.
- `GameContext` contains only `environment`, `primaryInput`, and `debug`.  The fields
  `systemId`, `destinationId`, and `credits` are removed.
- `ScreenChrome` accepts `player: PlayerState` alongside `context: GameContext` and
  reads location and credits from `player` rather than `context`.
- `BaseMenuScene` gains a `player: PlayerState` constructor parameter (third argument,
  after `context`). All subclasses are updated.
- `StationMenuScene` drops individual `fuelL`, `fuelCapacityL`, and `credits` params.
- `TravelMenuScene` drops individual `systemId`, `currentDestinationId`, `fuelL`,
  `fuelCapacityL`, and `driveId` params.
- `ShipScene` drops individual `systemId`, `destinationId`, and the
  `PlayerStateView` spread; the `PlayerStateView` interface is deleted.
- `npx tsc --noEmit` passes with zero errors.
- `npm test` passes with zero failures.

## Out of scope

- Save / load persistence.
- Multiple ships or ship upgrades.
- Drive swapping.
- Validation beyond: fuel clamped to `[0, fuelCapacityL]` and credits never go below
  zero (caller guards; `spendCredits` trusts that the caller checked affordability).

## Technical notes

### 1 · `CargoEntry` in `src/game/world/types.ts`

Add after existing type definitions (feature 031 imports this; it no longer needs to
define it):

```typescript
export interface CargoEntry {
  commodityId: string;
  qty: number;
}
```

### 2 · `src/game/PlayerState.ts` (new file)

```typescript
import type { CargoEntry } from './world/types';
import { getShip } from './world/world-data';

export class PlayerState {
  private readonly _shipId: string;
  private readonly _fuelCapacityL: number;
  private readonly _cargoCapacity: number;
  private readonly _driveId: string;
  private _fuelL: number;
  private _credits: number;
  private readonly _cargoHold: CargoEntry[] = [];
  private _systemId: string;
  private _destinationId: string | null;

  constructor(params: {
    shipId: string;
    driveId: string;
    credits: number;
    systemId: string;
    destinationId: string | null;
  }) {
    const ship = getShip(params.shipId)!;
    this._shipId        = params.shipId;
    this._driveId       = params.driveId;
    this._fuelCapacityL = ship.fuelCapacityL;
    this._cargoCapacity = ship.cargoCapacityKg;
    this._fuelL         = ship.fuelCapacityL; // starts full
    this._credits       = params.credits;
    this._systemId      = params.systemId;
    this._destinationId = params.destinationId;
  }

  // Ship (immutable after construction)
  get shipId(): string        { return this._shipId; }
  get driveId(): string       { return this._driveId; }
  get fuelCapacityL(): number { return this._fuelCapacityL; }
  get cargoCapacity(): number { return this._cargoCapacity; }

  // Fuel
  get fuelL(): number { return this._fuelL; }
  addFuel(litres: number): void {
    this._fuelL = Math.min(this._fuelL + litres, this._fuelCapacityL);
  }
  consumeFuel(litres: number): void {
    this._fuelL = Math.max(0, this._fuelL - litres);
  }

  // Credits
  get credits(): number { return this._credits; }
  addCredits(amount: number): void   { this._credits += amount; }
  spendCredits(amount: number): void { this._credits -= amount; }

  // Cargo (feature 031 adds cargoWeightKg once commodity weights are available)
  get cargoHold(): readonly CargoEntry[] { return this._cargoHold; }
  addCargo(commodityId: string, qty: number): void {
    const existing = this._cargoHold.find(e => e.commodityId === commodityId);
    if (existing) existing.qty += qty;
    else this._cargoHold.push({ commodityId, qty });
  }
  removeCargo(commodityId: string): void {
    const idx = this._cargoHold.findIndex(e => e.commodityId === commodityId);
    if (idx !== -1) this._cargoHold.splice(idx, 1);
  }

  // Location
  get systemId(): string             { return this._systemId; }
  get destinationId(): string | null { return this._destinationId; }
  dock(destinationId: string): void  { this._destinationId = destinationId; }
  undock(): void                     { this._destinationId = null; }
  jumpTo(systemId: string): void     {
    this._systemId      = systemId;
    this._destinationId = null;
  }
}
```

`_driveId` is `readonly` for now; a drive-upgrade feature can relax that later.

### 3 · `src/shared/types.ts` — slim down `GameContext`

Remove `systemId`, `destinationId`, and `credits`:

```typescript
export interface GameContext {
  environment: RuntimeEnvironment;
  primaryInput: PrimaryInput;
  debug: boolean;
}
```

### 4 · `src/game/ui/ScreenChrome.ts`

Add `PlayerState` import and a second constructor parameter:

```typescript
import type { PlayerState } from '../PlayerState';

export class ScreenChrome {
  private readonly context: GameContext;
  private readonly player: PlayerState;

  constructor(context: GameContext, player: PlayerState) {
    this.context = context;
    this.player  = player;
  }
  ...
}
```

Replace all references inside `ScreenChrome`:

| Old | New |
|---|---|
| `this.context.systemId` | `this.player.systemId` |
| `this.context.destinationId` | `this.player.destinationId` |
| `this.context.credits` | `this.player.credits` |

### 5 · `src/game/scenes/BaseMenuScene.ts`

Add `player: PlayerState` as the **third** constructor parameter (after `context`,
before any title / items / nav args). Pass it to `new ScreenChrome(context, player)`.

Store it as `protected readonly player: PlayerState` so subclasses can read state
directly without receiving it again as a separate parameter.

### 6 · Scene constructor changes

**BaseMenuScene subclasses** — each gains `player: PlayerState` after `context` and
passes it to `super(...)`. Individual state parameters are removed where they are now
available via `player`:

| Scene | Parameters removed | Behaviour change |
|---|---|---|
| `StationMenuScene` | `fuelL`, `fuelCapacityL`, `credits` | reads `this.player.*` |
| `MainMenuScene` | — | player threaded through to chrome |
| `StoryScene` | — | player threaded through to chrome |
| `TraderScene` | — | player threaded through to chrome |
| `MissionBoardScene` | — | player threaded through to chrome |

**Custom scenes** — `ShipScene` and `TravelMenuScene` both hold a `PlayerState`
reference and construct `ScreenChrome` themselves:

**`ShipScene` new constructor:**
```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  player: PlayerState,
  onTravel: () => void,
  onDock: () => void,
)
```
- `PlayerStateView` interface is deleted.
- Reads `player.systemId`, `player.destinationId`, `player.fuelL`, `player.fuelCapacityL`,
  `player.credits` directly. (`player.cargoWeightKg` and `player.cargoCapacity` are used
  once feature 031 adds them.)

**`TravelMenuScene` new constructor:**
```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  player: PlayerState,
  onDestinationSelected: (destinationId: string) => void,
  onJumpSelected: (targetSystemId: string) => void,
  onFlyIntoSpace: () => void,
  onShip: () => void,
)
```
- Reads `player.systemId`, `player.destinationId`, `player.fuelL`, `player.fuelCapacityL`,
  `player.driveId` directly.

### 7 · Orchestrator changes (`src/main.ts` and `terminal.ts`)

Both files are changed identically.

**Remove:**
- `let currentSystemId`, `let currentDestinationId`
- `const playerState = { ... }`
- `const drive = getDrive(...)!`
- Every `context.systemId = ...`, `context.destinationId = ...`, `context.credits = ...`
  line before scene construction

**Add:**
```typescript
import { PlayerState } from './game/PlayerState';

const player = new PlayerState({
  shipId:       settings.startingShip,
  driveId:      ship.defaultJumpDrive,
  credits:      settings.player.startingCredits,
  systemId:     startingLocation.system,
  destinationId: startingLocation.destination,
});
```

**`GameContext` construction becomes:**
```typescript
const context: GameContext = {
  environment: 'browser', // or 'terminal'
  primaryInput,
  debug,
};
```

**Updated callbacks:**

```typescript
// Refuel (inside goToStation)
(litres: number, refuelCost: number) => {
  player.spendCredits(refuelCost);
  player.addFuel(litres);
  goToStation();
}

const onJumpSelected = (targetSystemId: string) => {
  const route = getRoute(player.systemId, targetSystemId)!;
  const drive = getDrive(player.driveId)!;
  const used  = Math.ceil(FUEL_PER_LY * route.distance * drive.fuelEfficiency);
  player.consumeFuel(used);
  player.jumpTo(targetSystemId);
  currentScene = new JumpAnimationScene(getSystem(targetSystemId)!.name, goToArrival);
};

const onDestinationSelected = (destinationId: string) => {
  player.dock(destinationId);
  currentScene = new InSystemTravelAnimationScene(
    getDestination(destinationId)!.name, goToShip,
  );
};

const goToFlyIntoSpace = () => {
  player.undock();
  currentScene = new InSystemTravelAnimationScene('OPEN SPACE', goToShip, 'LAUNCHING...');
};

const goToArrival = () => {
  // player.jumpTo() already called in onJumpSelected
  currentScene = new TravelMenuScene(
    input, context, player,
    onDestinationSelected, onJumpSelected, goToFlyIntoSpace, goToShip,
  );
};
```

Each `goTo*` function passes `player` as the third argument; all individual state
params are gone:

```typescript
// Before
new TravelMenuScene(
  input, context,
  currentSystemId, currentDestinationId,
  playerState.fuelL, playerState.fuelCapacityL, playerState.driveId,
  onDestinationSelected, onJumpSelected, goToFlyIntoSpace, goToShip,
);

// After
new TravelMenuScene(input, context, player,
  onDestinationSelected, onJumpSelected, goToFlyIntoSpace, goToShip,
);
```

```typescript
// Before
new StationMenuScene(
  input, context, currentDestinationId!,
  playerState.fuelL, playerState.fuelCapacityL, playerState.credits,
  onRefuel, goToTrader, goToMissionBoard, goToShip,
);

// After
new StationMenuScene(
  input, context, player, currentDestinationId!,
  onRefuel, goToTrader, goToMissionBoard, goToShip,
);
```

Note: `currentDestinationId!` remains as a local derived from `player.destinationId`
until the Engineer judges it cleaner to inline — either approach is fine.

### 8 · Tests

**New: `src/game/player-state.test.ts`** (~12 tests)

| # | Test |
|---|---|
| 1 | `addFuel` does not exceed `fuelCapacityL` |
| 2 | `consumeFuel` does not go below 0 |
| 3 | `addCredits` increases credits |
| 4 | `spendCredits` decreases credits |
| 5 | `addCargo` creates new entry for unknown commodity |
| 6 | `addCargo` merges qty for existing commodity |
| 7 | `removeCargo` deletes entry |
| 8 | `removeCargo` is a no-op for unknown commodity |
| 9 | `dock` sets `destinationId` |
| 10 | `undock` clears `destinationId` to null |
| 11 | `jumpTo` sets `systemId` and clears `destinationId` |
| 12 | Constructor starts `fuelL` at full capacity |

**Update all scene test files** that construct scenes: add `player` parameter. A shared
`makePlayer()` test helper (in e.g. `src/tests/makePlayer.ts`) avoids repeating the
constructor call in every test file.

## Dependencies

**030** ✓ (done)
