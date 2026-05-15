# Travel System

The travel system covers movement both within a star system (between destinations) and between star systems (via jump routes). Both flows converge on a single unified scene rather than separate menus.

## TravelMenuScene (feature 026)

`TravelMenuScene` handles two distinct player situations with one scene:

1. **From ship** (`currentDestinationId: string`) — player is docked at a destination. The DESTINATIONS tab shows all locations in the current system; the player's current location is displayed in `bright-black` and is not selectable.
2. **Arrival mode** (`currentDestinationId: null`) — player has just jumped; they are "in space" with no docked destination. No item is greyed out.

**Constructor signature** (after feature 033):
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

`player.systemId`, `player.destinationId`, `player.fuelL`, `player.fuelCapacityL`,
and `player.driveId` replace the former individual parameters.

**Tabs:** LEFT/RIGHT switch between DESTINATIONS and JUMPS. The active tab is highlighted `bright-green`; the inactive tab is `white`. Switching a tab resets the cursor to 0.

**DESTINATIONS tab items:**
- All destination ids from `getSystem(systemId).destinations`, resolved via `getDestination`
- A sentinel "FLY INTO SPACE" item at the end (`id: '__space__'`), disabled (greyed) when the player is already in space (`currentDestinationId === null`)

**JUMPS tab items:** All routes from `getRoutesFrom(systemId)`, each rendered as `NAME  XLY  [STABILITY]`.

**Layout constants:** `TITLE_ROW=3`, `TAB_ROW=6`, `ITEM_ROW_START=8`, `ITEM_COL=2`.

## ShipScene in-space state (feature 026)

`ShipScene` receives `destinationId: string | null` via `GameContext`. When `null`, the ship is "in space" — not docked anywhere:

- Location label shows `IN SPACE  ·  <SYSTEM NAME>` instead of `<DESTINATION>  ·  <SYSTEM>`
- The DOCK button is rendered as `[ - ] DOCK` in `bright-black` and is not selectable
- No station glyph is rendered in the starfield
- Cursor navigation wraps over one item only (TRAVEL)

## Game state: destinationId

`player.destinationId: string | null` (on `PlayerState`) is the single source of
truth for whether the ship is docked:

- `string` → docked at a known destination
- `null` → in space (no destination)

The orchestrators update it exclusively via named methods:
- `player.dock(destinationId)` on `onDestinationSelected` (in-system travel)
- `player.undock()` on `goToFlyIntoSpace`
- `player.jumpTo(systemId)` on `onJumpSelected` (also updates `systemId`, clears destination)

All scenes that depend on dock/space state (ShipScene, TravelMenuScene) read
`player.destinationId` directly.

## Animation scenes

All animation scenes extend `BaseTransitionScene` (`src/game/scenes/base-transition-scene.ts`), accept no `InputHandler`, and auto-advance via an elapsed-time guard. They are kept as separate classes (rather than parameterised) to allow future visual divergence.

**Constructor signature for all six scenes:**
```typescript
(player: PlayerState, context: GameContext, onComplete: () => void)
```
`InSystemTravelAnimationScene` adds an optional fourth parameter:
```typescript
(player: PlayerState, context: GameContext, onComplete: () => void, targetLabel?: string)
```
`targetLabel` is used verbatim as the destination name in the content area when the player has no `destinationId` (e.g. fly-into-space passes `'OPEN SPACE'`).

| Scene | Duration | Fired by | Advances to | Chrome override |
|---|---|---|---|---|
| `JumpAnimationScene` | 5 000 ms | `onJumpSelected` | `goToArrival` → TravelMenuScene | `systemLabel: 'IN TRANSIT'`, `destinationLabel: null` |
| `InSystemTravelAnimationScene` | 2 000 ms | `onDestinationSelected` / `goToFlyIntoSpace` | `goToShip` → ShipScene | `destinationLabel: 'IN TRANSIT'` |
| `SurfaceLandingAnimationScene` | 2 500 ms | `goToLandOrDock` (surface dest) | `goToStation` → StationMenuScene | none (default chrome) |
| `AsteroidLandingAnimationScene` | 2 500 ms | `goToLandOrDock` (asteroid dest) | `goToStation` → StationMenuScene | none (default chrome) |
| `SurfaceTakeOffAnimationScene` | 1 500 ms | `goToTakeOffOrUndock` (surface dest) | `goToShip` → ShipScene | none (default chrome) |
| `AsteroidTakeOffAnimationScene` | 1 500 ms | `goToTakeOffOrUndock` (asteroid dest) | `goToShip` → ShipScene | none (default chrome) |

**Routing methods in `game.ts`:**
- `goToLandOrDock()` — called from `goToShip`'s dock callback; checks `player.destinationId`'s `locationType` and plays the appropriate landing animation, or calls `goToStation()` directly for orbital/deep-space.
- `goToTakeOffOrUndock()` — passed as the `onShip` callback to `StationMenuScene`; plays the appropriate take-off animation, or calls `goToShip()` directly for orbital/deep-space.
