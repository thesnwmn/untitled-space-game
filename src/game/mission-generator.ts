import type { Destination, WorldData, MissionSpec } from './world/types';
import { getGameBalance, getWorld, getSystem, computeEffectiveFactor } from './world/world-data';
import { isReputationEligible } from './reputation-utils';

function lcgRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function pickIndex(rand: () => number, length: number): number {
  return Math.floor(rand() * length);
}

function pickItem<T>(rand: () => number, arr: T[]): T {
  return arr[pickIndex(rand, arr.length)];
}

function buildGiverName(rand: () => number, worldData: WorldData): { giverName: string; giverFactionId?: string } {
  const { special, firstNames, lastNames } = worldData.npcNames;
  if (rand() < getGameBalance().npc.specialNameChance && special.length > 0) {
    const name = pickItem(rand, special);
    return { giverName: name };
  }
  const first = firstNames.length > 0 ? pickItem(rand, firstNames) : 'Unknown';
  const last = lastNames.length > 0 ? pickItem(rand, lastNames) : 'Agent';
  return { giverName: `${first} ${last}` };
}

function candidateDeliveryDestinations(destination: Destination, worldData: WorldData): Destination[] {
  return worldData.destinations.filter(d => d.id !== destination.id);
}

function legalCommodities(worldData: WorldData) {
  return worldData.commodities.filter(c => c.legal);
}

function weightedPickDeliveryItem(rand: () => number, items: Array<{ id: string; name: string; weightKg: number }>): typeof items[0] {
  const totalWeight = items.reduce((sum, item) => sum + item.weightKg, 0);
  if (totalWeight === 0) return items[0];
  let pick = rand() * totalWeight;
  for (const item of items) {
    pick -= item.weightKg;
    if (pick < 0) return item;
  }
  return items[items.length - 1];
}

function generateDeliveryMission(
  rand: () => number,
  destination: Destination,
  worldData: WorldData,
  missionId: string,
): MissionSpec | null {
  const items = worldData.deliveryItems;
  if (items.length === 0) return null;

  const candidates = candidateDeliveryDestinations(destination, worldData);
  if (candidates.length === 0) return null;

  const item = weightedPickDeliveryItem(rand, items);
  const deliveryDest = pickItem(rand, candidates);
  const giver = buildGiverName(rand, worldData);

  const { deliveryBaseReward, deliveryRandomReward, deliveryDepositFraction } = getGameBalance().missions;
  const weightBonus = Math.floor(item.weightKg * 1.5);
  const reward = deliveryBaseReward + weightBonus + Math.floor(rand() * deliveryRandomReward);
  const deposit = Math.floor(reward * deliveryDepositFraction);

  const giverFactionId = destination.owningFactionId
    ? getWorld().factions.find(f => f.id === destination.owningFactionId && isReputationEligible(f))?.id
    : undefined;

  return {
    ...giver,
    giverFactionId,
    id: missionId,
    type: 'delivery',
    title: item.name,
    description: `A package needs transporting. Pick up the ${item.name} from ${destination.name} and deliver it to ${deliveryDest.name}. Handle with care.`,
    reward,
    issuingDestinationId: destination.id,
    itemName: item.name,
    itemWeightKg: item.weightKg,
    pickupDestinationId: destination.id,
    deliveryDestinationId: deliveryDest.id,
    deposit,
  };
}

function generateSupplyMission(
  rand: () => number,
  destination: Destination,
  worldData: WorldData,
  missionId: string,
): MissionSpec | null {
  const commodities = legalCommodities(worldData);
  if (commodities.length === 0) return null;

  // Weight commodities by system economy: commodities with above-1.0 effective factor
  // (i.e., the system needs them) get doubled weight. Fall back to all commodities
  // if none have above-1.0 factors.
  const system = getSystem(destination.system);
  const weighted: typeof commodities = [];
  const neededCommodities: typeof commodities = [];

  for (const c of commodities) {
    const effectiveFactor = system ? computeEffectiveFactor(c.id, system) : 1.0;
    if (effectiveFactor > 1.0) {
      neededCommodities.push(c);
    }
    weighted.push(c);
  }

  const candidates = neededCommodities.length > 0 ? neededCommodities : commodities;
  for (const c of candidates) {
    weighted.push(c); // double weight for commodities the system needs
  }

  const { supplyRequirementsMin, supplyRequirementsMax, supplyQtyMin, supplyQtyMax } = getGameBalance().missions;
  const reqCount = supplyRequirementsMin + Math.floor(rand() * (supplyRequirementsMax - supplyRequirementsMin + 1));
  const requirements: { commodityId: string; qty: number }[] = [];
  const used = new Set<string>();

  for (let i = 0; i < reqCount; i++) {
    let attempts = 0;
    while (attempts < 10) {
      const c = pickItem(rand, weighted);
      if (!used.has(c.id)) {
        used.add(c.id);
        const qty = supplyQtyMin + Math.floor(rand() * (supplyQtyMax - supplyQtyMin + 1));
        requirements.push({ commodityId: c.id, qty });
        break;
      }
      attempts++;
    }
  }

  if (requirements.length === 0) return null;

  const totalMaterialCost = requirements.reduce((sum, r) => {
    const comm = worldData.commodities.find(c => c.id === r.commodityId);
    return sum + (comm?.basePrice ?? 100) * r.qty;
  }, 0);

  const totalSupplyWeight = requirements.reduce((sum, r) => {
    const comm = worldData.commodities.find(c => c.id === r.commodityId);
    return sum + (comm?.weightKg ?? 1) * r.qty;
  }, 0);

  const { supplyRewardMultiplierMin, supplyRewardMultiplierMax } = getGameBalance().missions;
  const weightBias = Math.min(1, totalSupplyWeight / 500);
  const rawRand = rand();
  const nudged = rawRand + weightBias * (1 - rawRand) * 0.15;
  const multiplier = supplyRewardMultiplierMin + nudged * (supplyRewardMultiplierMax - supplyRewardMultiplierMin);
  const reward = Math.floor(totalMaterialCost * multiplier);

  const giver = buildGiverName(rand, worldData);
  const reqSummary = requirements
    .map(r => {
      const comm = worldData.commodities.find(c => c.id === r.commodityId);
      return `${r.qty}× ${comm?.name ?? r.commodityId}`;
    })
    .join(', ');

  const giverFactionId = destination.owningFactionId
    ? getWorld().factions.find(f => f.id === destination.owningFactionId && isReputationEligible(f))?.id
    : undefined;

  return {
    ...giver,
    giverFactionId,
    id: missionId,
    type: 'supply',
    title: destination.name,
    description: `${destination.name} needs supplies. Deliver ${reqSummary} to fulfil the contract.`,
    reward,
    issuingDestinationId: destination.id,
    requirements,
    deliveryDestinationId: destination.id,
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

export function generateMissions(
  destination: Destination,
  worldData: WorldData,
  seed: number,
): MissionSpec[] {
  const balance = getGameBalance();

  // When seed is 0 (production call from Game), use time-window-based determinism
  // Otherwise (test call), use the provided seed directly for consistent test results
  let finalSeed: number;
  if (seed === 0) {
    const windowMs = balance.missions.missionTtlMs;
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const destHash = hashString(destination.id);
    finalSeed = destHash ^ window;
  } else {
    finalSeed = seed;
  }

  const rand = lcgRand(finalSeed);
  const { boardMaxCount, deliveryChance } = balance.missions;

  const missions: MissionSpec[] = [];

  // Generate minMissions baseline
  for (let i = 0; i < destination.minMissions && missions.length < boardMaxCount; i++) {
    const missionId = `m-${(finalSeed >>> 0).toString(16)}-${missions.length}`;
    const isDelivery = rand() < deliveryChance;
    const mission = isDelivery
      ? generateDeliveryMission(rand, destination, worldData, missionId)
      : generateSupplyMission(rand, destination, worldData, missionId);
    if (mission) missions.push(mission);
  }

  // Loop rolling missionChance until failure or max reached
  while (missions.length < boardMaxCount && rand() < destination.missionChance) {
    const missionId = `m-${(finalSeed >>> 0).toString(16)}-${missions.length}`;
    const isDelivery = rand() < deliveryChance;
    const mission = isDelivery
      ? generateDeliveryMission(rand, destination, worldData, missionId)
      : generateSupplyMission(rand, destination, worldData, missionId);
    if (mission) missions.push(mission);
  }

  return missions;
}
