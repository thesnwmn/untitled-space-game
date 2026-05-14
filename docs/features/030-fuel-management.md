# Feature 030 · Fuel Management

## Goal

Introduce a real fuel system: track fuel in litres, deduct it on every jump, grey out
unreachable systems in the jump menu, show fuel as `x/yL` in the ship status bar, and
let the player buy fuel at stations that stock it.

**Depends on:** 029 (freighter as starting ship — derives ship/drive records needed here)

---

## Design decisions

### Fuel per jump

Base rate: **5 L per light-year**, scaled by the drive's `fuelEfficiency` multiplier, rounded
up to the nearest whole litre.

```
fuelUsed = Math.ceil(FUEL_PER_LY × route.distance × drive.fuelEfficiency)
```

`fuelEfficiency` is a cost multiplier: `0.6` = uses 60% of base fuel (more efficient);
`0.95` = uses 95% of base fuel (nearly full cost).

Representative costs at launch with the freighter (civilian-mk1, eff=0.8, 100 L tank):

| Route | Distance | Fuel used |
|-------|----------|-----------|
| Sol → Alpha Centauri | 4.3 LY | 18 L |
| Sol → Barnard's Star | 5.9 LY | 24 L |
| Sol → Wolf 359 | 7.9 LY | 32 L |
| Barnard's Star → Wolf 359 | 3.1 LY | 13 L |

The freighter can make roughly 3–5 full-distance jumps per tank depending on route length,
giving the fuel economy enough texture without being punishing.

### Fuel price

**10 CR per litre.** A freighter full refuel costs 1 000 CR; a single typical jump burns
roughly 130–320 CR of fuel, making refuelling a meaningful but not crippling expense after
a trade run or two.

---

## State changes

### Lift `PlayerState` to the orchestrators

`PlayerState` currently lives inside `ShipScene` and resets on every scene transition.
Fuel must survive scene changes (jumps, station visits). Move the mutable state to
module level in both `src/main.ts` and `terminal.ts`, initialised once from world data.

```typescript
// src/main.ts  (and terminal.ts identically)
import { getGameSettings, getShip, getDrive } from './game/world/world-data';

const settings  = getGameSettings();
const ship      = getShip(settings.startingShip)!;
const drive     = getDrive(ship.defaultJumpDrive)!;

const playerState = {
  fuelL:         ship.fuelCapacityL,   // start full
  fuelCapacityL: ship.fuelCapacityL,
  driveId:       ship.defaultJumpDrive,
  cargo:         0,
  cargoCapacity: ship.cargoCapacityKg,
  credits:       settings.player.startingCredits,
};
```

`ShipScene` no longer owns `INITIAL_STATE`. Instead the orchestrator passes the current
values in and `ShipScene` becomes a pure display scene for player state.

---

## Changed files

### 1 · `src/game/constants.ts`

Add the two fuel constants (file is currently empty):

```typescript
export const FUEL_PER_LY      = 5;   // base litres per light-year
export const FUEL_PRICE_PER_L = 10;  // credits per litre of fuel
```

### 2 · `src/game/world/world-data.ts`

Export a `getShip` lookup (parallel to the existing `getDrive`):

```typescript
export function getShip(id: string): Ship | undefined {
  return WORLD.ships.find(s => s.id === id);
}
```

Export a `getRoute` helper to look up a specific jump route from both directions:

```typescript
export function getRoute(fromId: string, toId: string): JumpRoute | undefined {
  return WORLD.routes.find(
    r => (r.from === fromId && r.to === toId) ||
         (r.from === toId   && r.to === fromId)
  );
}
```

Also add `startingShip: string` to `GameSettings` and `startingShip: 'freighter'` to
`WORLD.settings` (this is the same change specified in feature 029; skip if 029 is
already done).

### 3 · `src/main.ts` and `terminal.ts`

**a) Initialise `playerState` at module level** (as shown above in the State changes
section). Remove any reference to a fuel percentage; fuel is now always in litres.

**b) Deduct fuel after a jump.** Modify `onJumpSelected`:

```typescript
const onJumpSelected = (targetSystemId: string) => {
  const route = getRoute(currentSystemId, targetSystemId)!;
  const drive = getDrive(playerState.driveId)!;
  const used  = Math.ceil(FUEL_PER_LY * route.distance * drive.fuelEfficiency);
  playerState.fuelL = Math.max(0, playerState.fuelL - used);

  currentSystemId = targetSystemId;
  const targetName = getSystem(targetSystemId)!.name;
  currentScene = new JumpAnimationScene(targetName, goToArrival);
};
```

**c) Thread fuel into `goToShip`:**

```typescript
const goToShip = () => {
  currentScene = new ShipScene(
    input, context,
    currentSystemId, currentDestinationId,
    playerState,          // ← pass whole state object (read-only in ShipScene)
    goToTravelMenu, goToStation,
  );
};
```

**d) Thread fuel into `goToTravelMenu`:**

```typescript
const goToTravelMenu = () => {
  currentScene = new TravelMenuScene(
    input, context,
    currentSystemId, currentDestinationId,
    playerState.fuelL, playerState.fuelCapacityL, playerState.driveId,
    onDestinationSelected, onJumpSelected, goToFlyIntoSpace, goToShip,
  );
};
```

Same change in `goToArrival`.

**e) Thread fuel into `goToStation` and handle refuel:**

```typescript
const goToStation = () => {
  currentScene = new StationMenuScene(
    input, context, currentDestinationId!,
    playerState.fuelL, playerState.fuelCapacityL, playerState.credits,
    (refuelCost: number) => {
      playerState.credits -= refuelCost;
      playerState.fuelL    = playerState.fuelCapacityL;
    },
    goToTrader, goToMissionBoard, goToShip,
  );
};
```

### 4 · `src/game/scenes/ShipScene.ts`

**a)** Remove `INITIAL_STATE` and the internal `state: PlayerState`.

**b)** Accept `playerState` as a constructor parameter (typed as a read-only view):

```typescript
interface PlayerStateView {
  fuelL: number;
  fuelCapacityL: number;
  cargo: number;
  cargoCapacity: number;
  credits: number;
}

constructor(
  inputHandler: InputHandler,
  context: GameContext,
  systemId: string,
  destinationId: string | null,
  playerState: PlayerStateView,
  onTravel: () => void,
  onDock: () => void,
)
```

**c)** Update the status bar display. Replace `FUEL:${fuel}%` with `FUEL:${fuelL}/${fuelCapacityL}L`:

```
FUEL:82/100L | CARGO:0/2000KG | CR:4820
```

### 5 · `src/game/scenes/TravelMenuScene.ts`

**a)** Extend the constructor signature:

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  systemId: string,
  currentDestinationId: string | null,
  fuelL: number,
  fuelCapacityL: number,
  driveId: string,
  onDestinationSelected: (destinationId: string) => void,
  onJumpSelected: (targetSystemId: string) => void,
  onFlyIntoSpace: () => void,
  onShip: () => void,
)
```

**b)** When building the `jumps` array, compute fuel needed for each route and record it
on the item:

```typescript
interface JumpItem {
  id: string;
  label: string;
  fuelNeeded: number;
  disabled: boolean;    // ← new: true when fuelNeeded > fuelL
}
```

```typescript
import { getDrive } from '../world/world-data';
import { FUEL_PER_LY } from '../constants';

const drive = getDrive(driveId)!;

this.jumps = getRoutesFrom(systemId).map((route) => {
  const targetId = route.from === systemId ? route.to : route.from;
  const targetSystem = getSystem(targetId)!;
  const stability = route.stability.toUpperCase();
  const fuelNeeded = Math.ceil(FUEL_PER_LY * route.distance * drive.fuelEfficiency);
  return {
    id: targetId,
    label: `${targetSystem.name.toUpperCase()}  ${route.distance}LY  [${stability}]`.slice(0, 36),
    fuelNeeded,
    disabled: fuelNeeded > fuelL,
  };
});
```

**c)** In `handleSelect`, skip disabled jump items (same guard as disabled destinations):

```typescript
const item = this.jumps[this.cursorIdx];
if (item && !item.disabled) {
  this.activated = true;
  onJumpSelected(item.id);
}
```

**d)** In `render`, colour disabled jump items `'bright-black'` (same as disabled
destinations):

```typescript
const fg: Color = item.disabled
  ? 'bright-black'
  : isCursor ? 'bright-green' : 'white';
```

### 6 · `src/game/scenes/StationMenuScene.ts`

**a)** Extend the constructor signature:

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  destinationId: string,
  fuelL: number,
  fuelCapacityL: number,
  credits: number,
  onRefuel: (cost: number) => void,
  onTrader: () => void,
  onMissionBoard: () => void,
  onShip: () => void,
)
```

**b)** Conditionally insert a `BUY FUEL` menu item when the destination has
`amenities.fuel === true` **and** `fuelL < fuelCapacityL`:

```typescript
const fuelNeeded = fuelCapacityL - fuelL;
const refuelCost = fuelNeeded * FUEL_PRICE_PER_L;

if (dest.amenities.fuel && fuelNeeded > 0) {
  items.push({
    label: `BUY FUEL  +${fuelNeeded}L  ${refuelCost}CR`,
    action: () => onRefuel(refuelCost),
  });
}
```

If the ship is already full (`fuelL === fuelCapacityL`) the item is not shown.

The refuel action calls `onRefuel` and immediately navigates back to the station menu
(which will rebuild with the new fuel state). The orchestrator's `onRefuel` callback
updates `playerState` then calls `goToStation()`:

```typescript
(refuelCost: number) => {
  playerState.credits -= refuelCost;
  playerState.fuelL    = playerState.fuelCapacityL;
  goToStation();
},
```

---

## Tests to update

| Test file | Change |
|-----------|--------|
| `ship-scene.test.ts` | Update constructor call to pass a `playerState` object; verify status bar renders `FUEL:100/100L` |
| `travel-menu-scene.test.ts` | Update constructor to include `fuelL`, `fuelCapacityL`, `driveId`; add a test that a jump requiring more fuel than `fuelL` is greyed out and not selectable |
| `station-menu-scene.test.ts` | Update constructor; add tests: BUY FUEL appears when `amenities.fuel && fuelL < fuelCapacityL`, is absent when full, absent when no fuel amenity |
| `world-data.test.ts` | Add test for `getShip` and `getRoute` |

---

## Play-test checklist (for Engineer)

1. Start the game → Ship screen shows `FUEL:100/100L` in the status bar.
2. Open travel menu → JUMPS tab shows routes; all are reachable from a full tank.
3. Jump to another system → return to Ship screen; fuel reading is reduced by the
   correct amount (e.g. Sol → Alpha Centauri on freighter: 100 − 18 = 82 L).
4. Jump repeatedly until a route becomes unreachable → that entry is greyed out in
   the JUMPS tab and pressing SELECT on it does nothing.
5. Dock at a station with `amenities.fuel: true` (e.g. Elysium Station) → `BUY FUEL`
   item appears showing cost.
6. Select BUY FUEL → fuel returns to max, credits decrease by the correct amount.
7. Dock at a station with `amenities.fuel: false` → no BUY FUEL option.
8. Dock at a station with `amenities.fuel: true` but tank already full → no BUY FUEL
   option.
