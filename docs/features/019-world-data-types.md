# 019 · World Data TypeScript Types

## Goal

Define TypeScript interfaces for every world entity type and expose a typed
static `WorldData` module that any game scene can import to access systems,
stations, routes, ships, factions, and commodities — without any file I/O.

## Acceptance criteria

- `src/game/world/types.ts` exists and exports the interfaces listed in the
  Technical notes section. No implementation code, only types.
- `src/game/world/world-data.ts` exports a `const WORLD: WorldData` value that
  contains all seed data from Feature 018 (four systems, all destinations, all
  factions, three ships, four drives, all routes, all commodities, all story
  beats).
  The file also exports four lookup helpers:
  - `getSystem(id: string): StarSystem | undefined`
  - `getDestination(id: string): Destination | undefined`
  - `getRoutesFrom(systemId: string): JumpRoute[]`
  - `getDrive(id: string): JumpDrive | undefined`
  - `getStoryBeat(id: string): StoryBeat | undefined`
  - `getStoryBeatsByTrigger(trigger: string): StoryBeat[]`
- `src/game/world/world-data.test.ts` passes with the following tests:
  - All four system ids resolve via `getSystem()`.
  - `getDestination('elysium-station')` returns a destination with
    `amenities.trader === true` and `npcs.trader === 'Merchant Kess'`.
  - `getRoutesFrom('sol')` returns at least three routes.
  - Every route's `from` and `to` resolves via `getSystem()`.
  - Every destination's `system` field resolves via `getSystem()`.
  - Every system's `destinations` array entries resolve via `getDestination()`.
  - `getDrive('civilian-mk1')` returns a drive with `maxDistanceLy === 4`.
  - All commodity `basePrice` values are positive numbers.
  - `getStoryBeatsByTrigger('game-start')` returns at least one beat.
  - `getStoryBeat('opening-arrival')` returns a beat with `skippable === true`.
  - `tsc --noEmit` passes with zero errors.
  - `npm test` passes.

## Out of scope

- Loading or parsing markdown files at runtime (Feature 020).
- Connecting world data to any scene UI (future features).
- Pricing logic, supply/demand calculations.
- Ship purchasing or fleet management.

## Technical notes

### `src/game/world/types.ts`

```typescript
export type SecurityLevel = 'none' | 'low' | 'medium' | 'high';
export type DangerLevel = 'none' | 'low' | 'medium' | 'high' | 'extreme';
export type PopulationLevel = 'none' | 'low' | 'medium' | 'high' | 'massive';
export type KnowledgeLevel = 'public' | 'private';
export type Zone = 'core' | 'frontier' | 'outer';
export type LocationType = 'orbital' | 'surface' | 'asteroid' | 'deep-space';
export type DestinationType = 'civilian' | 'military' | 'black-market' | 'research';
export type StoryBeatType = 'intro' | 'discovery' | 'mission' | 'system-enter' | 'station-arrive' | 'combat-end' | 'custom';
export type FactionType = 'government' | 'corporation' | 'criminal' | 'guild' | 'independent';
export type FactionSize = 'small' | 'medium' | 'large';
export type CommodityCategory = 'raw-material' | 'manufactured' | 'consumable' | 'contraband';
export type ShipClass = 'freighter' | 'scout' | 'hauler' | 'fighter';
export type RouteStability = 'stable' | 'unstable' | 'dangerous';

export interface StarSystem {
  id: string;
  name: string;
  starType: string;
  distanceFromSol: number;
  zone: Zone;
  security: SecurityLevel;
  population: PopulationLevel;
  dangerLevel: DangerLevel;
  playerKnowledge: KnowledgeLevel;
  economy: string[];
  majorFactions: string[];
  destinations: string[];
  tags: string[];
  description: string;
}

export interface DestinationAmenities {
  trader: boolean;
  missionBoard: boolean;
  shipRepair: boolean;
  fuel: boolean;
  shipDealer: boolean;
}

export interface Destination {
  id: string;
  name: string;
  system: string;
  locationType: LocationType;
  type: DestinationType;
  amenities: DestinationAmenities;
  npcs: { trader?: string };
  goodsBias: string[];
  dangerLevel: DangerLevel;
  tags: string[];
  description: string;
}

export interface StoryBeat {
  id: string;
  title: string;
  trigger: string;
  type: StoryBeatType;
  location?: string;
  skippable: boolean;
  playerKnowledge: KnowledgeLevel;
  text: string;
}

export interface JumpRoute {
  from: string;
  to: string;
  distance: number;
  stability: RouteStability;
  security: SecurityLevel;
}

export interface JumpDrive {
  id: string;
  name: string;
  maxDistanceLy: number;
  fuelEfficiency: number;
  cost: number;
}

export interface Ship {
  id: string;
  name: string;
  class: ShipClass;
  cost: number;
  cargoCapacityKg: number;
  fuelCapacityL: number;
  hullPoints: number;
  defaultJumpDrive: string;
  tags: string[];
  description: string;
}

export interface Faction {
  id: string;
  name: string;
  type: FactionType;
  homeSystem: string;
  size: FactionSize;
  influence: string[];
  tags: string[];
  description: string;
}

export interface Commodity {
  id: string;
  name: string;
  basePrice: number;
  category: CommodityCategory;
  legal: boolean;
  weightKg: number;
  description: string;
}

export interface WorldData {
  systems: StarSystem[];
  destinations: Destination[];
  routes: JumpRoute[];
  drives: JumpDrive[];
  ships: Ship[];
  factions: Faction[];
  commodities: Commodity[];
  storyBeats: StoryBeat[];
}
```

### `src/game/world/world-data.ts`

```typescript
import type { WorldData, StarSystem, Station, JumpRoute, JumpDrive } from './types';

export const WORLD: WorldData = { /* ... all seed data ... */ };

export function getSystem(id: string): StarSystem | undefined {
  return WORLD.systems.find(s => s.id === id);
}

export function getDestination(id: string): Destination | undefined {
  return WORLD.destinations.find(d => d.id === id);
}

export function getRoutesFrom(systemId: string): JumpRoute[] {
  return WORLD.routes.filter(r => r.from === systemId || r.to === systemId);
}

export function getDrive(id: string): JumpDrive | undefined {
  return WORLD.drives.find(d => d.id === id);
}

export function getStoryBeat(id: string): StoryBeat | undefined {
  return WORLD.storyBeats.find(b => b.id === id);
}

export function getStoryBeatsByTrigger(trigger: string): StoryBeat[] {
  return WORLD.storyBeats.filter(b => b.trigger === trigger);
}
```

All `description` strings in the static data should be single-sentence summaries;
full prose body text is in the markdown docs and will be loaded in Feature 020.

The `camelCase` field names in TypeScript map to the `snake_case` front-matter
names in the markdown docs. Feature 020 (the loader) is responsible for that
translation. The static data in `world-data.ts` uses camelCase throughout.

## Dependencies

**018 · World Data Schemas & Seed Content** — TypeScript data must match
the finalized schemas and content from Feature 018.
