# Feature 037 · Mission Foundation

## Goal

Establish the core data model, world data additions, mission generator, and `PlayerState` extensions that all subsequent mission features depend on.

---

## Acceptance criteria

- `MissionSpec`, `ActiveMission`, `MissionItem`, and `MissionStatus` types are exported from `src/game/world/types.ts`
- `WorldData` gains three new sections: `deliveryItems: DeliveryItem[]`, `npcNames: NpcNames`; each is populated with seed data (see Technical notes)
- `MissionGenerator` accepts a `Destination`, the full `WorldData`, and a seed integer; it returns 3–6 `MissionSpec` objects deterministically for a given seed
- Delivery missions use an item drawn from `WorldData.deliveryItems`; the `MissionSpec` carries `itemName` and `itemWeightKg` directly (not the `DeliveryItem` id)
- Supply missions specify one or more `{ commodityId, qty }` requirements drawn from the commodity list, weighted by the destination's `goodsBias`
- Every generated mission has a `giverName` (special full name ~30% of the time, otherwise random first + last from world data) and an optional `giverFactionId`
- `PlayerState` gains `activeMissions`, `missionItems`, and `missionItemsWeightKg`
- `PlayerState.cargoWeightKg` and all capacity checks include `missionItemsWeightKg`
- `PlayerState` exposes: `acceptMission(spec, giveItemNow)`, `collectMissionItem(missionId)`, `completeMission(missionId)`, `cancelMission(missionId)`, `getMissionsForPickup(destinationId)`, `getMissionsForDelivery(destinationId)`
- `acceptMission` with `giveItemNow = true` and a delivery spec adds a `MissionItem` to `missionItems`; with `giveItemNow = false` it does not
- `collectMissionItem` sets `pickupComplete = true` on the matching `ActiveMission` and adds its `MissionItem` to `missionItems`
- `completeMission` removes the mission from `activeMissions` and removes its `MissionItem` from `missionItems` (if present)
- `cancelMission` behaves identically to `completeMission` (credits are awarded by the caller for complete; none for cancel)
- `getMissionsForPickup` returns delivery missions where `pickupDestinationId` matches and `pickupComplete` is false
- `getMissionsForDelivery` returns missions where `deliveryDestinationId` matches and `getMissionStatus` returns `ready-to-deliver`
- `getMissionStatus(mission, player)` is a pure exported function returning `MissionStatus`: `pending-pickup` (delivery, `!pickupComplete`), `in-transit` (delivery, `pickupComplete`, not ready), `needs-supplies` (supply, missing commodities in player cargo), or `ready-to-deliver`
- `canAcceptMission(player, spec)` is a pure exported function returning `{ ok: boolean; reason?: string }`; it checks available cargo space (regular + mission) against the mission's weight requirement
- All new `PlayerState` methods are covered by unit tests; `MissionGenerator` output is tested for structure and determinism
- `npx tsc --noEmit` passes; `npm test` passes

---

## Out of scope

- Any UI scenes
- Mission board caching (lives in `Game`, added in feature 038)
- The `MENU` game action and chrome wiring (feature 039)

---

## Technical notes

### New types (`src/game/world/types.ts`)

```typescript
type MissionType = 'delivery' | 'supply';
type MissionStatus = 'pending-pickup' | 'in-transit' | 'needs-supplies' | 'ready-to-deliver';

interface DeliveryMissionSpec {
  type: 'delivery';
  itemName: string;
  itemWeightKg: number;
  pickupDestinationId: string;
  deliveryDestinationId: string;
}
interface SupplyMissionSpec {
  type: 'supply';
  requirements: { commodityId: string; qty: number }[];
  deliveryDestinationId: string;
}
interface MissionBase {
  id: string;
  title: string;
  description: string;
  reward: number;
  issuingDestinationId: string;
  giverName: string;
  giverFactionId?: string;
}
type MissionSpec = MissionBase & (DeliveryMissionSpec | SupplyMissionSpec);

interface ActiveMission extends MissionSpec {
  acceptedAt: number;
  pickupComplete: boolean;
}

interface MissionItem {
  missionId: string;
  itemName: string;
  weightKg: number;
}

interface DeliveryItem {
  id: string;
  name: string;
  weightKg: number;
}
interface NpcNames {
  special: string[];
  firstNames: string[];
  lastNames: string[];
}
```

`WorldData` gains `deliveryItems: DeliveryItem[]` and `npcNames: NpcNames`.

### World data seed content

Add two new sections to `docs/world/`:

**Delivery items** — at least 12 entries spanning a range of weights and flavours, e.g. lightweight data cores, mid-weight medical supplies, heavy machinery parts. Weight range: 5 kg – 200 kg.

**NPC names** — at least 6 special full names (e.g. "The Fixer", "The Handler", "Dispatch") and at least 12 first names + 12 last names from a sci-fi / multicultural mix.

### World data parsing

`src/game/world/world-data.ts` gains `getDeliveryItems(): DeliveryItem[]` and `getNpcNames(): NpcNames` helpers following the existing getter pattern.

### `MissionGenerator` (`src/game/mission-generator.ts`)

Exported class or module with a single function:

```typescript
generateMissions(destination: Destination, worldData: WorldData, seed: number): MissionSpec[]
```

Uses a seeded pseudo-random approach (same pattern as `Starfield` if one exists, or a simple LCG). Mission IDs are derived from the seed to ensure uniqueness per board. Description text is a placeholder prose string for this feature (flavour text generation is feature 041+).

Reward formula: base value + distance multiplier (delivery) or quantity × commodity base price fraction (supply). Exact coefficients are at the Engineer's discretion.

### `PlayerState` additions

New private fields: `_activeMissions: ActiveMission[]`, `_missionItems: MissionItem[]`.

`missionItemsWeightKg` sums `weightKg` across `_missionItems`. The existing `cargoWeightKg` getter must be updated to also include `missionItemsWeightKg` so capacity checks remain accurate.

The `getMissionsForDelivery` method calls `getMissionStatus` internally and filters to `ready-to-deliver`. For supply missions, `getMissionStatus` checks whether the player's `cargoHold` contains at least the required quantity of each required commodity.
