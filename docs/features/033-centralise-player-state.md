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
- `GameContext` contains only `environment`, `primaryInput`, and `debug`. The fields
  `systemId`, `destinationId`, and `credits` are removed.
- `ScreenChrome` accepts `player: PlayerState` alongside `context: GameContext` and
  reads location and credits from `player` rather than `context`.
- `BaseMenuScene` gains a `player: PlayerState` constructor parameter (third argument,
  after `context`). All subclasses are updated.
- `StationMenuScene` drops individual `fuelL`, `fuelCapacityL`, and `credits` params.
- `TravelMenuScene` drops individual `systemId`, `currentDestinationId`, `fuelL`,
  `fuelCapacityL`, and `driveId` params.
- `ShipScene` drops individual `systemId`, `destinationId`, and the `PlayerStateView`
  spread; the `PlayerStateView` interface is deleted.
- `npx tsc --noEmit` passes with zero errors.
- `npm test` passes with zero failures.

## Out of scope

- Save / load persistence.
- Multiple ships or ship upgrades.
- Drive swapping.
- Validation beyond: fuel clamped to `[0, fuelCapacityL]` and credits never go below
  zero (caller guards; `spendCredits` trusts that the caller checked affordability).

## Technical notes

### `CargoEntry` in `src/game/world/types.ts`

```typescript
export interface CargoEntry {
  commodityId: string;
  qty: number;
}
```

### `PlayerState` public API (`src/game/PlayerState.ts`)

Constructor takes `{ shipId, driveId, credits, systemId, destinationId }`. Reads the
ship record from world data to populate `fuelCapacityL` and `cargoCapacity`. Starts
`fuelL` at full capacity.

Ship (immutable after construction): `shipId`, `driveId`, `fuelCapacityL`, `cargoCapacity`

Fuel: `fuelL` getter; `addFuel(litres)` clamps at capacity; `consumeFuel(litres)` clamps at 0

Credits: `credits` getter; `addCredits(amount)`; `spendCredits(amount)`

Cargo: `cargoHold: readonly CargoEntry[]` getter; `addCargo(commodityId, qty)` merges
into existing entry or pushes new; `removeCargo(commodityId)` removes entry (no-op if absent)

Location: `systemId` and `destinationId` getters; `dock(destinationId)`; `undock()`
clears to null; `jumpTo(systemId)` sets system and clears destination

Leave `cargoWeightKg` as a stub returning 0 — feature 031 will replace it.

### `GameContext` (`src/shared/types.ts`)

Remove `systemId`, `destinationId`, and `credits`. Keep only `environment`,
`primaryInput`, and `debug`.

### `ScreenChrome` (`src/game/ui/ScreenChrome.ts`)

Add `player: PlayerState` as a second constructor parameter. Replace all reads of
`context.systemId`, `context.destinationId`, and `context.credits` with `player.*`.

### `BaseMenuScene` (`src/game/scenes/BaseMenuScene.ts`)

Add `player: PlayerState` as the third constructor parameter (after `context`). Pass
it to `new ScreenChrome(context, player)`. Store as `protected readonly player` so
subclasses can access player state without receiving it as a separate parameter.

### Scene constructor changes

| Scene | Parameters removed | Notes |
|---|---|---|
| `StationMenuScene` | `fuelL`, `fuelCapacityL`, `credits` | reads `this.player.*` |
| `MainMenuScene` | — | player threaded through to chrome |
| `StoryScene` | — | player threaded through to chrome |
| `TraderScene` | — | player threaded through to chrome |
| `MissionBoardScene` | — | player threaded through to chrome |
| `ShipScene` | `systemId`, `destinationId`, `PlayerStateView` spread | reads `player.*`; `PlayerStateView` deleted |
| `TravelMenuScene` | `systemId`, `currentDestinationId`, `fuelL`, `fuelCapacityL`, `driveId` | reads `player.*` |

### Orchestrator changes (`src/main.ts` and `terminal.ts`)

Remove: `playerState` plain object, `currentSystemId`, `currentDestinationId`, `drive`
constant, all `context.X = ...` sync lines before scene construction.

Add: construct one `PlayerState` at startup from game settings. `GameContext` no longer
includes any player state fields. Pass `player` as the third argument to every scene
constructor; remove all individual state arguments that are now on `player`.

### Tests

Add `src/game/player-state.test.ts` covering each public method: fuel clamping,
credit mutation, cargo merge and remove (including no-op remove), location transitions,
and the full-fuel initial state.

Add a shared `makePlayer()` test helper (e.g. `src/tests/makePlayer.ts`) so every
scene test that constructs a scene can add `player` without repeating the `PlayerState`
constructor call.

## Dependencies

**030** ✓ (done)
