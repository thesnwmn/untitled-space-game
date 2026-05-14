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

export interface GameSettings {
  player: {
    name: string;
    startingCredits: number;
  };
  startingLocation: {
    system: string;
    destination: string;
  };
}

export interface WorldData {
  settings: GameSettings;
  systems: StarSystem[];
  destinations: Destination[];
  routes: JumpRoute[];
  drives: JumpDrive[];
  ships: Ship[];
  factions: Faction[];
  commodities: Commodity[];
  storyBeats: StoryBeat[];
}
