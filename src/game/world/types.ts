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

export interface Economy {
  id: string;
  summary: string;
  commodities: { id: string; factor: number }[];
}

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
  economies: string[];
  majorFactions: string[];
  destinations: string[];
  tags: string[];
  description: string;
}

export interface DestinationAmenities {
  trader: boolean;
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
  minMissions: number;
  missionChance: number;
  dangerLevel: DangerLevel;
  tags: string[];
  description: string;
  owningFactionId?: string;
  difficultyMultiplier?: number;
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
  fuelEfficiency: number;
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
  rivals: string[];
  allies: string[];
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
  startingShip: string;
}

export interface GameBalance {
  npc: {
    specialNameChance: number;
  };
  missions: {
    boardMaxCount: number;
    missionTtlMs: number;
    deliveryChance: number;
    deliveryBaseReward: number;
    deliveryRandomReward: number;
    supplyRewardMultiplierMin: number;
    supplyRewardMultiplierMax: number;
    supplyRequirementsMin: number;
    supplyRequirementsMax: number;
    supplyQtyMin: number;
    supplyQtyMax: number;
    deliveryDepositFraction: number;
  };
  trading: {
    stockCountMin: number;
    stockCountMax: number;
    stockQtyMin: number;
    stockQtyMax: number;
    stockTtlMs: number;
    stockRepCountBonusPerLevel: number;
    stockRepCountBonusMin: number;
    stockRepCountBonusMax: number;
    stockRepQtyBonusPerLevel: number;
    stockRepQtyBonusMin: number;
    stockRepQtyBonusMax: number;
  };
  fuel: {
    pricePerLitre: number;
    consumptionPerLy: number;
    inSystemBaseConsumptionL: number;
  };
  reputation: {
    levelUnfriendlyMin: number;
    levelNeutralMin: number;
    levelFriendlyMin: number;
    levelLikedMin: number;
    levelReveredMin: number;
    pointsMin: number;
    pointsMax: number;
    missionDeltaSmall: number;
    missionDeltaMedium: number;
    missionDeltaLarge: number;
    missionTierMediumReward: number;
    missionTierLargeReward: number;
    tradeModifierHated: number;
    tradeModifierUnfriendly: number;
    tradeModifierNeutral: number;
    tradeModifierFriendly: number;
    tradeModifierLiked: number;
    tradeModifierRevered: number;
    repPerCredit: number;
    maxRepPerVisit: number;
  };
  emergencyRescue: {
    towFee: number;
    fuelDropFee: number;
    fuelDropLitres: number;
  };
  economies: {
    minFactor: number;
    maxFactor: number;
  };
  miniGames: {
    maxHullDamageFraction: number;
    abandonDamageFraction: number;
    noDamageThreshold: number;
    [key: string]: unknown;
  };
}

export interface CargoEntry {
  commodityId: string;
  qty: number;
}

export interface TraderStockEntry {
  commodityId: string;
  qty: number;
  effectiveFactor?: number;
}

export type MissionType = 'delivery' | 'supply';
export type MissionStatus = 'pending-pickup' | 'in-transit' | 'needs-supplies' | 'ready-to-deliver';

export interface DeliveryMissionSpec {
  type: 'delivery';
  itemName: string;
  itemWeightKg: number;
  pickupDestinationId: string;
  deliveryDestinationId: string;
  deposit: number;
}

export interface SupplyMissionSpec {
  type: 'supply';
  requirements: { commodityId: string; qty: number }[];
  deliveryDestinationId: string;
}

export interface MissionBase {
  id: string;
  title: string;
  description: string;
  reward: number;
  issuingDestinationId: string;
  giverName: string;
  giverFactionId?: string;
}

export type MissionSpec = MissionBase & (DeliveryMissionSpec | SupplyMissionSpec);

export type ActiveMission = MissionSpec & {
  acceptedAt: number;
  pickupComplete: boolean;
};

export interface MissionItem {
  missionId: string;
  itemName: string;
  weightKg: number;
}

export interface DeliveryItem {
  id: string;
  name: string;
  weightKg: number;
}

export interface NpcNames {
  special: string[];
  firstNames: string[];
  lastNames: string[];
}

export interface WorldData {
  settings: GameSettings;
  balance: GameBalance;
  systems: StarSystem[];
  destinations: Destination[];
  routes: JumpRoute[];
  drives: JumpDrive[];
  ships: Ship[];
  factions: Faction[];
  commodities: Commodity[];
  economies: Economy[];
  storyBeats: StoryBeat[];
  deliveryItems: DeliveryItem[];
  npcNames: NpcNames;
}
