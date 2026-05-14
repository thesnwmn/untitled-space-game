# 026 · Jump System

## Goal

Allow the player to jump their ship from the current star system to a connected
system via a three-screen flow: jump selection menu → jump animation →
system arrival and docking. All system, route, and destination data is read
from the static world data module (`src/game/world/world-data.ts`).

## Player Flow

1. **ShipScene** — Player selects `[ J ] JUMP`. Scene calls `onJump()`.
2. **JumpMenuScene** — Lists all jump routes from the current system (fed by
   `getRoutesFrom`). Player selects a destination system. Scene calls
   `onJumpSelected(targetSystemId)`.
3. **JumpAnimationScene** — Displays a "jump in progress" screen. After 5
   seconds, automatically calls `onArrival()`. No player input is accepted.
4. **SystemArrivalScene** — Lists all destinations in the arrived system (fed by
   `getSystem` + `getDestination`). Player selects one. Scene calls
   `onDock(destinationId)`.
5. The orchestrator updates `currentSystemId` and `currentDestinationId`, then
   calls `goToStation()` to show the existing `StationMenuScene`.

## Acceptance Criteria

- Pressing JUMP in `ShipScene` opens `JumpMenuScene`.
- `JumpMenuScene` lists routes from the current system via `getRoutesFrom()`.
  Items show the remote system name, distance in ly, and stability tag.
- Selecting a system from `JumpMenuScene` transitions to `JumpAnimationScene`
  with the target system name displayed.
- BACK from `JumpMenuScene` returns to `ShipScene` without changing game state.
- `JumpAnimationScene` auto-advances to `SystemArrivalScene` after exactly
  5 000 ms. No earlier, no input needed.
- `SystemArrivalScene` lists all destinations in the arrived system.
  Items show destination name.
- Selecting a destination from `SystemArrivalScene` transitions to
  `StationMenuScene` for that destination.
- The `ShipScene` location label updates to reflect the current destination
  after jumping and docking.
- Both `src/main.ts` (browser) and `terminal.ts` (Bun) are updated and in sync.
- `npx tsc --noEmit` passes with zero errors.
- `npm test` passes.

## New Scenes

### JumpMenuScene

**File:** `src/game/scenes/JumpMenuScene.ts`

Extends `BaseMenuScene`.

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  systemId: string,
  onJumpSelected: (targetSystemId: string) => void,
  onBack: () => void,
)
```

- **Title:** `"JUMP"`
- **Info lines** (written before items, rows 5–8):
  ```
  CURRENT SYSTEM: <SYSTEM NAME>
  SELECT DESTINATION:
  ```
  Use `getSystem(systemId).name.toUpperCase()` for the system name.
- **Items:** one per route returned by `getRoutesFrom(systemId)`. For each
  route resolve the "other" system id (if `route.from === systemId` use
  `route.to`, else `route.from`). Display item as:
  ```
  ALPHA CENTAURI  4.3LY  [STABLE]
  ```
  Max 36 chars per item label (fits comfortably inside the 40-col border).
  Stability is one of `STABLE`, `UNSTABLE`, `DANGEROUS` — uppercase.
- **On SELECT:** call `onJumpSelected(targetSystemId)`.
- **On BACK:** call `onBack()`.

### JumpAnimationScene

**File:** `src/game/scenes/JumpAnimationScene.ts`

Implements `Scene` directly — does **not** extend `BaseMenuScene`.

```typescript
constructor(targetSystemName: string, onArrival: () => void)
```

No `InputHandler` parameter. This scene accepts no player input.

**Update logic:** accumulate `dt` in `update(dt)`. Once the total reaches
`>= 5000`, call `onArrival()` exactly once (guard with an `arrived: boolean`
flag).

**Render** (all on a black/black background, no border):

| Row          | Content                          | Colour          |
|--------------|----------------------------------|-----------------|
| `h/2 − 3`   | `[ JUMP DRIVE ENGAGED ]`         | `bright-cyan`   |
| `h/2 − 1`   | `DESTINATION:` (left-padded)     | `bright-black`  |
| `h/2`        | target system name, e.g. `ALPHA CENTAURI` | `bright-white` |
| `h/2 + 2`   | animated ellipsis (see below)    | `bright-black`  |
| `h/2 + 4`   | countdown text (see below)       | `bright-black`  |

All rows are centred with `writeCentered`.

**Animated ellipsis** cycles through `[. . .]`, `[: : :]`, `[* * *]` at
~500 ms per frame using `Math.floor(elapsed / 500) % 3`.

**Countdown** shows `ARRIVING IN Xs` where X is
`Math.ceil((5000 − elapsed) / 1000)` clamped to `[1, 5]`.

### SystemArrivalScene

**File:** `src/game/scenes/SystemArrivalScene.ts`

Extends `BaseMenuScene`.

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  systemId: string,
  onDock: (destinationId: string) => void,
)
```

- **Title:** `getSystem(systemId).name.toUpperCase()`, e.g. `"ALPHA CENTAURI"`.
- **Info lines** (rows 5–8):
  ```
  SECURITY: <LEVEL>
  SELECT DOCKING DESTINATION:
  ```
  Use `getSystem(systemId).security.toUpperCase()` for the level.
- **Items:** one per destination id listed in `getSystem(systemId).destinations`.
  Resolve each via `getDestination(id)`. Display
  `destination.name.toUpperCase()`.
- **On SELECT:** call `onDock(destinationId)`.
- No BACK action — the player must dock somewhere to proceed.

## Changes to Existing Scenes

### ShipScene

- Remove the `STATION_NAME` import.
- Add `destinationId: string` as a new constructor parameter (before the
  callbacks).
- In `render()`, look up `getDestination(destinationId).name` for the location
  label on row 1 (`LOCATION_ROW`).
- The JUMP action now calls an `onJump()` callback instead of `console.log`.

New constructor signature:
```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  destinationId: string,
  onJump: () => void,
  onDock: () => void,
)
```

### StationMenuScene, TraderScene, MissionBoardScene

> **Note:** Feature 027 (World-Driven Story, Station, and System Display) adds
> `destinationId: string` constructor parameters to all three scenes and removes
> the `STATION_NAME` import. If 027 is merged before this feature, these scenes
> already accept `destinationId`; the Engineer must pass `currentDestinationId`
> from the orchestrator state rather than a static constant. No constructor
> signature changes are needed.

If 027 has **not** shipped, the Engineer should apply the following changes
(otherwise skip them — they are already done):

- **Remove** the `STATION_NAME` import from each.
- **Add** `destinationId: string` as the first constructor parameter of each
  scene (before `inputHandler`).
- Use `getDestination(destinationId)!.name` in place of `STATION_NAME` for the
  NavBar title.

Updated constructor signatures (post-027):

```typescript
// StationMenuScene
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  destinationId: string,
  onTrader: () => void,
  onMissionBoard: () => void,
  onShip: () => void,
)

// TraderScene
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  destinationId: string,
  onStation: () => void,
  onShip: () => void,
)

// MissionBoardScene
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  destinationId: string,
  onStation: () => void,
  onShip: () => void,
)
```

## Orchestrator Changes

Both `src/main.ts` and `terminal.ts` must be kept in sync.

### New state variables (module scope)

```typescript
let currentSystemId = 'sol';
let currentDestinationId = 'elysium-station';
```

### New / updated functions

```typescript
function goToShip(): void {
  // Pass currentDestinationId and goToJumpMenu as new args
  scene = new ShipScene(inputHandler, context, currentDestinationId, goToJumpMenu, goToStation);
}

function goToJumpMenu(): void {
  scene = new JumpMenuScene(inputHandler, context, currentSystemId, onJumpSelected, goToShip);
}

function onJumpSelected(targetSystemId: string): void {
  currentSystemId = targetSystemId;
  const targetName = getSystem(targetSystemId)!.name;
  scene = new JumpAnimationScene(targetName, goToSystemArrival);
}

function goToSystemArrival(): void {
  scene = new SystemArrivalScene(inputHandler, context, currentSystemId, onDockSelected);
}

function onDockSelected(destinationId: string): void {
  currentDestinationId = destinationId;
  goToStation();
}

function goToStation(): void {
  const destName = getDestination(currentDestinationId)!.name;
  scene = new StationMenuScene(destName, inputHandler, context, goToTrader, goToMissionBoard, goToShip);
}

function goToTrader(): void {
  const destName = getDestination(currentDestinationId)!.name;
  scene = new TraderScene(destName, inputHandler, context, goToStation, goToShip);
}

function goToMissionBoard(): void {
  const destName = getDestination(currentDestinationId)!.name;
  scene = new MissionBoardScene(destName, inputHandler, context, goToStation, goToShip);
}
```

## Tests

### `src/game/scenes/jump-animation-scene.test.ts`

- After accumulating exactly 5 000 ms via `update()`, `onArrival` has been
  called exactly once.
- Calling `update()` for additional time beyond 5 000 ms does not call
  `onArrival` again.
- `render()` does not throw for a valid target system name.

### `src/game/scenes/jump-menu-scene.test.ts`

- `render()` does not throw for system id `'sol'`.
- SELECT on the first item calls `onJumpSelected` with a valid system id.
- BACK calls `onBack`.

### `src/game/scenes/system-arrival-scene.test.ts`

- `render()` does not throw for system id `'alpha-centauri'`.
- SELECT on the first item calls `onDock` with the correct destination id.

## Dependencies

**019 · World Data TypeScript Types** — this feature imports `getRoutesFrom`,
`getSystem`, and `getDestination` from `src/game/world/world-data.ts`.

**027 · World-Driven Story, Station, and System Display** — adds `destinationId`
constructor parameters to the scenes this feature also modifies. Build 027 first
to avoid conflicting changes to the same scene files.
