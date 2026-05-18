import { safeLoad } from 'js-yaml';
import type {
  WorldData,
  StarSystem,
  Destination,
  DestinationAmenities,
  Faction,
  Ship,
  JumpDrive,
  JumpRoute,
  Commodity,
  StoryBeat,
  GameSettings,
  GameBalance,
  DeliveryItem,
  NpcNames,
  Economy,
} from './types';

function parseFrontMatter(source: string): { data: Record<string, unknown>; content: string } {
  if (!source.startsWith('---\n')) {
    return { data: {}, content: source };
  }
  const closeIdx = source.indexOf('\n---', 4);
  if (closeIdx === -1) {
    return { data: {}, content: source };
  }
  const yamlStr = source.slice(4, closeIdx);
  const afterClose = source.slice(closeIdx + 4);
  const body = afterClose.startsWith('\n') ? afterClose.slice(1) : afterClose;
  const data = (safeLoad(yamlStr) as Record<string, unknown>) ?? {};
  return { data, content: body };
}

const DEFAULT_BALANCE: GameBalance = {
  npc: { specialNameChance: 0.3 },
  missions: {
    boardMaxCount: 8,
    missionTtlMs: 900000,
    deliveryChance: 0.6,
    deliveryBaseReward: 200,
    deliveryRandomReward: 200,
    supplyRewardMultiplierMin: 1.15,
    supplyRewardMultiplierMax: 1.50,
    supplyRequirementsMin: 1,
    supplyRequirementsMax: 2,
    supplyQtyMin: 3,
    supplyQtyMax: 10,
    deliveryDepositFraction: 0.20,
  },
  trading: {
    stockCountMin: 4,
    stockCountMax: 6,
    stockQtyMin: 5,
    stockQtyMax: 10,
    stockTtlMs: 120000,
    stockRepCountBonusPerLevel: 1,
    stockRepCountBonusMin: -2,
    stockRepCountBonusMax: 3,
    stockRepQtyBonusPerLevel: 2,
    stockRepQtyBonusMin: -4,
    stockRepQtyBonusMax: 6,
  },
  fuel: {
    pricePerLitre: 10,
    consumptionPerLy: 5,
    inSystemBaseConsumptionL: 4,
  },
  reputation: {
    levelUnfriendlyMin: -300,
    levelNeutralMin: -100,
    levelFriendlyMin: 100,
    levelLikedMin: 300,
    levelReveredMin: 600,
    pointsMin: -600,
    pointsMax: 1000,
    missionDeltaSmall: 25,
    missionDeltaMedium: 75,
    missionDeltaLarge: 200,
    missionTierMediumReward: 300,
    missionTierLargeReward: 600,
    tradeModifierHated: 1.20,
    tradeModifierUnfriendly: 1.10,
    tradeModifierNeutral: 1.00,
    tradeModifierFriendly: 0.92,
    tradeModifierLiked: 0.85,
    tradeModifierRevered: 0.80,
    repPerCredit: 0.01,
    maxRepPerVisit: 10,
  },
  emergencyRescue: {
    towFee: 500,
    fuelDropFee: 800,
    fuelDropLitres: 15,
  },
  economies: {
    minFactor: 0.75,
    maxFactor: 1.25,
  },
  miniGames: {
    maxHullDamageFraction: 0.10,
    abandonDamageFraction: 0.05,
    noDamageThreshold: 90,
  },
};

export function parseWorldFiles(files: Record<string, string>): WorldData {
  const world: WorldData = {
    settings: {
      player: { name: 'Captain', startingCredits: 0 },
      startingLocation: { system: '', destination: '' },
      startingShip: '',
    },
    balance: { ...DEFAULT_BALANCE },
    systems: [],
    destinations: [],
    routes: [],
    drives: [],
    ships: [],
    factions: [],
    commodities: [],
    economies: [],
    storyBeats: [],
    deliveryItems: [],
    npcNames: { special: [], firstNames: [], lastNames: [] },
  };

  for (const [path, content] of Object.entries(files)) {
    const basename = path.split('/').pop() ?? '';
    if (basename === '_template.md' || basename === '.gitkeep') continue;

    const { data, content: body } = parseFrontMatter(content);

    if (/^systems\/[^/]+\.md$/.test(path)) {
      world.systems.push(parseSystem(data, body));
    } else if (/^destinations\/[^/]+\.md$/.test(path)) {
      world.destinations.push(parseDestination(data, body));
    } else if (/^factions\/[^/]+\.md$/.test(path)) {
      world.factions.push(parseFaction(data, body));
    } else if (/^ships\/[^/]+\.md$/.test(path)) {
      world.ships.push(parseShip(data, body));
    } else if (path === 'ships/components/jump-drives.md') {
      world.drives = parseDrives(data);
    } else if (path === 'navigation/jump-routes.md') {
      world.routes = parseRoutes(data);
    } else if (path === 'commodities.md') {
      world.commodities = parseCommodities(data);
    } else if (path === 'economies.md') {
      world.economies = parseEconomies(data);
    } else if (/^story\/[^/]+\.md$/.test(path)) {
      world.storyBeats.push(parseStoryBeat(data, body));
    } else if (path === 'settings/new-game.md') {
      world.settings = parseSettings(data);
    } else if (path === 'settings/balance.md') {
      world.balance = parseBalance(data);
    } else if (path === 'delivery-items.md') {
      world.deliveryItems = parseDeliveryItems(data);
    } else if (path === 'npc-names.md') {
      world.npcNames = parseNpcNames(data);
    }
    // unknown paths silently skipped
  }

  return world;
}

function extractDescription(body: string): string {
  const run: string[] = [];
  let started = false;

  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) continue;
    if (trimmed === '') {
      if (started) break;
    } else {
      started = true;
      run.push(trimmed);
    }
  }

  return run.join(' ');
}

function parseSystem(data: { [key: string]: any }, body: string): StarSystem {
  return {
    id: data.id,
    name: data.name,
    starType: data.star_type,
    distanceFromSol: data.distance_from_sol,
    zone: data.zone,
    security: data.security,
    population: data.population,
    dangerLevel: data.danger_level,
    playerKnowledge: data.player_knowledge,
    economies: data.economies ?? [],
    majorFactions: data.major_factions ?? [],
    destinations: data.destinations ?? [],
    tags: data.tags ?? [],
    description: extractDescription(body),
  };
}

function parseDestination(data: { [key: string]: any }, body: string): Destination {
  const a = data.amenities ?? {};
  const amenities: DestinationAmenities = {
    trader: a.trader ?? false,
    shipRepair: a.ship_repair ?? false,
    fuel: a.fuel ?? false,
    shipDealer: a.ship_dealer ?? false,
  };

  return {
    id: data.id,
    name: data.name,
    system: data.system,
    locationType: data.location_type,
    type: data.type,
    amenities,
    npcs: data.npcs ?? {},
    minMissions: data.min_missions ?? 0,
    missionChance: data.mission_chance ?? 0.0,
    dangerLevel: data.danger_level,
    tags: data.tags ?? [],
    description: extractDescription(body),
    owningFactionId: data.owning_faction,
    difficultyMultiplier: data.difficulty_multiplier !== undefined ? parseFloat(data.difficulty_multiplier) : undefined,
  };
}

function parseFaction(data: { [key: string]: any }, body: string): Faction {
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    homeSystem: data.home_system,
    size: data.size,
    influence: data.influence ?? [],
    tags: data.tags ?? [],
    description: extractDescription(body),
    rivals: data.rivals ?? [],
    allies: data.allies ?? [],
  };
}

function parseShip(data: { [key: string]: any }, body: string): Ship {
  return {
    id: data.id,
    name: data.name,
    class: data.class,
    cost: data.cost,
    cargoCapacityKg: data.cargo_capacity_kg,
    fuelCapacityL: data.fuel_capacity_l,
    hullPoints: data.hull_points,
    defaultJumpDrive: data.default_jump_drive,
    fuelEfficiency: data.fuel_efficiency,
    tags: data.tags ?? [],
    description: extractDescription(body),
  };
}

function parseDrives(data: { [key: string]: any }): JumpDrive[] {
  const list: any[] = data.drives ?? [];
  return list.map((d): JumpDrive => ({
    id: d.id,
    name: d.name,
    maxDistanceLy: d.max_distance_ly,
    fuelEfficiency: d.fuel_efficiency,
    cost: d.cost,
  }));
}

function parseRoutes(data: { [key: string]: any }): JumpRoute[] {
  const list: any[] = data.routes ?? [];
  return list.map((r): JumpRoute => ({
    from: r.from,
    to: r.to,
    distance: r.distance,
    stability: r.stability,
    security: r.security,
  }));
}

function parseCommodities(data: { [key: string]: any }): Commodity[] {
  const list: any[] = data.commodities ?? [];
  return list.map((c): Commodity => ({
    id: c.id,
    name: c.name,
    basePrice: c.base_price,
    category: c.category,
    legal: c.legal,
    weightKg: c.weight_kg,
    description: c.description ?? '',
  }));
}

function parseStoryBeat(data: { [key: string]: any }, body: string): StoryBeat {
  return {
    id: data.id,
    title: data.title,
    trigger: data.trigger,
    type: data.type,
    location: data.location,
    skippable: data.skippable,
    playerKnowledge: data.player_knowledge,
    text: body.trim(),
  };
}

function parseSettings(data: { [key: string]: any }): GameSettings {
  return {
    player: {
      name: data.player?.name ?? 'Captain',
      startingCredits: data.player?.starting_credits ?? 0,
    },
    startingLocation: {
      system: data.starting_location?.system ?? '',
      destination: data.starting_location?.destination ?? '',
    },
    startingShip: data.starting_ship ?? '',
  };
}

function parseDeliveryItems(data: { [key: string]: any }): DeliveryItem[] {
  const list: any[] = data.delivery_items ?? [];
  return list.map((item): DeliveryItem => ({
    id: item.id,
    name: item.name,
    weightKg: item.weight_kg,
  }));
}

function parseNpcNames(data: { [key: string]: any }): NpcNames {
  const names = data.npc_names ?? {};
  return {
    special: names.special ?? [],
    firstNames: names.first_names ?? [],
    lastNames: names.last_names ?? [],
  };
}

function parseEconomies(data: { [key: string]: any }): Economy[] {
  const list: any[] = data.economies ?? [];
  return list.map((e): Economy => ({
    id: e.id,
    summary: e.summary,
    commodities: (e.commodities ?? []).map((c: any) => ({
      id: c.id,
      factor: c.factor,
    })),
  }));
}

function parseBalance(data: { [key: string]: any }): GameBalance {
  const d = DEFAULT_BALANCE;
  const npc = data.npc ?? {};
  const missions = data.missions ?? {};
  const trading = data.trading ?? {};
  const fuel = data.fuel ?? {};
  const rep = data.reputation ?? {};
  const rescue = data.emergency_rescue ?? {};
  const econ = data.economies ?? {};
  const mg = data.mini_games ?? {};
  return {
    npc: {
      specialNameChance: npc.special_name_chance ?? d.npc.specialNameChance,
    },
    missions: {
      boardMaxCount: missions.board_max_count ?? d.missions.boardMaxCount,
      missionTtlMs: missions.mission_ttl_ms ?? d.missions.missionTtlMs,
      deliveryChance: missions.delivery_chance ?? d.missions.deliveryChance,
      deliveryBaseReward: missions.delivery_base_reward ?? d.missions.deliveryBaseReward,
      deliveryRandomReward: missions.delivery_random_reward ?? d.missions.deliveryRandomReward,
      supplyRewardMultiplierMin: missions.supply_reward_multiplier_min ?? d.missions.supplyRewardMultiplierMin,
      supplyRewardMultiplierMax: missions.supply_reward_multiplier_max ?? d.missions.supplyRewardMultiplierMax,
      supplyRequirementsMin: missions.supply_requirements_min ?? d.missions.supplyRequirementsMin,
      supplyRequirementsMax: missions.supply_requirements_max ?? d.missions.supplyRequirementsMax,
      supplyQtyMin: missions.supply_qty_min ?? d.missions.supplyQtyMin,
      supplyQtyMax: missions.supply_qty_max ?? d.missions.supplyQtyMax,
      deliveryDepositFraction: missions.delivery_deposit_fraction ?? d.missions.deliveryDepositFraction,
    },
    trading: {
      stockCountMin: trading.stock_count_min ?? d.trading.stockCountMin,
      stockCountMax: trading.stock_count_max ?? d.trading.stockCountMax,
      stockQtyMin: trading.stock_qty_min ?? d.trading.stockQtyMin,
      stockQtyMax: trading.stock_qty_max ?? d.trading.stockQtyMax,
      stockTtlMs: trading.stock_ttl_ms ?? d.trading.stockTtlMs,
      stockRepCountBonusPerLevel: trading.stock_rep_count_bonus_per_level ?? d.trading.stockRepCountBonusPerLevel,
      stockRepCountBonusMin: trading.stock_rep_count_bonus_min ?? d.trading.stockRepCountBonusMin,
      stockRepCountBonusMax: trading.stock_rep_count_bonus_max ?? d.trading.stockRepCountBonusMax,
      stockRepQtyBonusPerLevel: trading.stock_rep_qty_bonus_per_level ?? d.trading.stockRepQtyBonusPerLevel,
      stockRepQtyBonusMin: trading.stock_rep_qty_bonus_min ?? d.trading.stockRepQtyBonusMin,
      stockRepQtyBonusMax: trading.stock_rep_qty_bonus_max ?? d.trading.stockRepQtyBonusMax,
    },
    fuel: {
      pricePerLitre: fuel.price_per_litre ?? d.fuel.pricePerLitre,
      consumptionPerLy: fuel.consumption_per_ly ?? d.fuel.consumptionPerLy,
      inSystemBaseConsumptionL: fuel.in_system_base_consumption_l ?? d.fuel.inSystemBaseConsumptionL,
    },
    reputation: {
      levelUnfriendlyMin: rep.level_unfriendly_min ?? d.reputation.levelUnfriendlyMin,
      levelNeutralMin: rep.level_neutral_min ?? d.reputation.levelNeutralMin,
      levelFriendlyMin: rep.level_friendly_min ?? d.reputation.levelFriendlyMin,
      levelLikedMin: rep.level_liked_min ?? d.reputation.levelLikedMin,
      levelReveredMin: rep.level_revered_min ?? d.reputation.levelReveredMin,
      pointsMin: rep.points_min ?? d.reputation.pointsMin,
      pointsMax: rep.points_max ?? d.reputation.pointsMax,
      missionDeltaSmall: rep.mission_delta_small ?? d.reputation.missionDeltaSmall,
      missionDeltaMedium: rep.mission_delta_medium ?? d.reputation.missionDeltaMedium,
      missionDeltaLarge: rep.mission_delta_large ?? d.reputation.missionDeltaLarge,
      missionTierMediumReward: rep.mission_tier_medium_reward ?? d.reputation.missionTierMediumReward,
      missionTierLargeReward: rep.mission_tier_large_reward ?? d.reputation.missionTierLargeReward,
      tradeModifierHated: rep.trade_modifier_hated ?? d.reputation.tradeModifierHated,
      tradeModifierUnfriendly: rep.trade_modifier_unfriendly ?? d.reputation.tradeModifierUnfriendly,
      tradeModifierNeutral: rep.trade_modifier_neutral ?? d.reputation.tradeModifierNeutral,
      tradeModifierFriendly: rep.trade_modifier_friendly ?? d.reputation.tradeModifierFriendly,
      tradeModifierLiked: rep.trade_modifier_liked ?? d.reputation.tradeModifierLiked,
      tradeModifierRevered: rep.trade_modifier_revered ?? d.reputation.tradeModifierRevered,
      repPerCredit: rep.rep_per_credit ?? d.reputation.repPerCredit,
      maxRepPerVisit: rep.max_rep_per_visit ?? d.reputation.maxRepPerVisit,
    },
    emergencyRescue: {
      towFee: rescue.tow_fee ?? d.emergencyRescue.towFee,
      fuelDropFee: rescue.fuel_drop_fee ?? d.emergencyRescue.fuelDropFee,
      fuelDropLitres: rescue.fuel_drop_litres ?? d.emergencyRescue.fuelDropLitres,
    },
    economies: {
      minFactor: econ.min_factor ?? d.economies.minFactor,
      maxFactor: econ.max_factor ?? d.economies.maxFactor,
    },
    miniGames: {
      maxHullDamageFraction: mg.max_hull_damage_fraction ?? d.miniGames.maxHullDamageFraction,
      abandonDamageFraction: mg.abandon_damage_fraction ?? d.miniGames.abandonDamageFraction,
      noDamageThreshold: mg.no_damage_threshold ?? d.miniGames.noDamageThreshold,
    },
  };
}
