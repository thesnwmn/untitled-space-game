# Feature 043 · Knowledge Base — Discovery

> **Prerequisites**: feature 039 (Global Menu Shell) must be built first. Feature 044 (Knowledge Base Screens) depends on this feature.

## Goal

The game silently records what the player has discovered as they travel. Systems entered, destinations docked at, and locations mentioned by NPCs are all noted in the player's knowledge base. This is a data-only feature; the screens that display this data come in the next feature.

---

## Knowledge levels

Two levels apply to both systems and destinations:

- **`known`** — the place's existence is recorded (name only); no further details are held
- **`visited`** — the player has been there; the full record is available

A place can only be upgraded (`known` → `visited`). Status never regresses.

---

## Acceptance criteria

- `PlayerState` exposes methods to: record a system as visited (along with its public destinations and direct jump neighbours), upgrade a destination to visited, and record NPC mentions of a system or destination
- On game start, the player's knowledge already reflects their starting location: starting system is `visited`; starting destination is `visited`; all other destinations in the starting system are `known`; all systems directly connected to the starting system by a jump route are `known`
- When a jump completes, the arrival system becomes `visited`; its destinations become `known`; its direct jump-route neighbours become `known` (existing higher status is not overwritten)
- When a dock or landing completes, the destination becomes `visited`
- NPC mention methods set the target to `known` without overwriting a higher existing status
- All recording is idempotent — triggering the same event twice produces the same state as triggering it once
- Status never regresses — a `visited` system or destination cannot become `known`
- `PlayerState` exposes read access sufficient to: look up whether a specific system or destination is known or visited, list all known/visited systems, and list all known/visited destinations within a given system
- Unit tests cover each acquisition path (game start, jump, dock, NPC mention), idempotency, non-regression, and read access
- `npx tsc --noEmit` passes; `npm test` passes

---

## Out of scope

- Any screen displaying this data (next feature)
- Secret or private destinations (all destinations are treated as public for now)
- Persistent save/load of knowledge state across sessions

---

## Technical notes

### New types (`src/game/world/types.ts`)

```typescript
type SystemKnowledge = 'known' | 'visited';
type DestinationKnowledge = 'known' | 'visited';
```

The Engineer should choose appropriate data structures for storing per-system and per-destination knowledge in `PlayerState`. The structure must support the read-access requirements listed above.

### `PlayerState` additions (`src/game/player-state.ts`)

Suggested method signatures:

```typescript
// Called when the player arrives in a system (jump complete or game start)
discoverSystem(systemId: string, destinationIds: string[], neighbourSystemIds: string[]): void

// Called when docking or landing is complete
visitDestination(destinationId: string): void

// Called from NPC dialogue (future use, but defined now)
mentionSystem(systemId: string): void
mentionDestination(systemId: string, destinationId: string): void

// Read access
getSystemKnowledge(systemId: string): SystemKnowledge | undefined
getDestinationKnowledge(systemId: string, destinationId: string): DestinationKnowledge | undefined
get knownSystems(): ReadonlyMap<string, ...>  // structure at Engineer's discretion
```

The caller is responsible for passing the correct destination IDs and neighbour IDs; `PlayerState` does not look these up itself.

### Discovery triggers (`src/game/game.ts`)

Three points in `Game` need to call the new methods:

1. **Game start** (after constructing `PlayerState`): call `discoverSystem` with the starting system, its destinations, and its jump-route neighbours; then call `visitDestination` for the starting destination. Use `getSystem()` and `getRoutesFrom()` from `world-data.ts` to resolve the IDs.

2. **Jump completion** (in `onJumpSelected`, after `player.jumpTo()`): call `discoverSystem` for the arrival system before the jump animation begins, so the knowledge is correct when the player arrives.

3. **Dock/land completion** (in the animation callbacks that precede `goToStation()`): call `visitDestination` before handing off to the station scene.
