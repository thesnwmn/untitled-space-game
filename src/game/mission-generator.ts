import type { Destination, WorldData, MissionSpec } from './world/types';

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
  if (rand() < 0.3 && special.length > 0) {
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

  const item = pickItem(rand, items);
  const deliveryDest = pickItem(rand, candidates);
  const giver = buildGiverName(rand, worldData);

  const baseReward = 200;
  const weightBonus = Math.floor(item.weightKg * 1.5);
  const reward = baseReward + weightBonus + Math.floor(rand() * 200);

  return {
    ...giver,
    id: missionId,
    type: 'delivery',
    title: `Deliver: ${item.name}`,
    description: `A package needs transporting. Pick up the ${item.name} from ${destination.name} and deliver it to ${deliveryDest.name}. Handle with care.`,
    reward,
    issuingDestinationId: destination.id,
    itemName: item.name,
    itemWeightKg: item.weightKg,
    pickupDestinationId: destination.id,
    deliveryDestinationId: deliveryDest.id,
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

  // Weight commodities by goodsBias: commodities whose category keyword appears
  // in goodsBias get doubled weight.
  const biasKeywords = destination.goodsBias.map(b => b.toLowerCase());
  const weighted: typeof commodities = [];
  for (const c of commodities) {
    const boosted = biasKeywords.some(k => c.category.includes(k) || c.id.includes(k) || k.includes(c.category));
    weighted.push(c);
    if (boosted) weighted.push(c); // double weight for biased commodities
  }

  const reqCount = 1 + Math.floor(rand() * 2); // 1 or 2 requirements
  const requirements: { commodityId: string; qty: number }[] = [];
  const used = new Set<string>();

  for (let i = 0; i < reqCount; i++) {
    let attempts = 0;
    while (attempts < 10) {
      const c = pickItem(rand, weighted);
      if (!used.has(c.id)) {
        used.add(c.id);
        const qty = 1 + Math.floor(rand() * 4); // 1–4 units
        requirements.push({ commodityId: c.id, qty });
        break;
      }
      attempts++;
    }
  }

  if (requirements.length === 0) return null;

  const totalValue = requirements.reduce((sum, r) => {
    const comm = worldData.commodities.find(c => c.id === r.commodityId);
    return sum + (comm?.basePrice ?? 100) * r.qty;
  }, 0);
  const reward = Math.floor(totalValue * 0.4) + Math.floor(rand() * 150);

  const giver = buildGiverName(rand, worldData);
  const reqSummary = requirements
    .map(r => {
      const comm = worldData.commodities.find(c => c.id === r.commodityId);
      return `${r.qty}× ${comm?.name ?? r.commodityId}`;
    })
    .join(', ');

  return {
    ...giver,
    id: missionId,
    type: 'supply',
    title: `Supply Run: ${destination.name}`,
    description: `${destination.name} needs supplies. Deliver ${reqSummary} to fulfil the contract.`,
    reward,
    issuingDestinationId: destination.id,
    requirements,
    deliveryDestinationId: destination.id,
  };
}

export function generateMissions(
  destination: Destination,
  worldData: WorldData,
  seed: number,
): MissionSpec[] {
  const rand = lcgRand(seed);
  const count = 3 + Math.floor(rand() * 4); // 3–6

  const missions: MissionSpec[] = [];
  for (let i = 0; i < count; i++) {
    const missionId = `m-${(seed >>> 0).toString(16)}-${i}`;
    const isDelivery = rand() < 0.6;
    const mission = isDelivery
      ? generateDeliveryMission(rand, destination, worldData, missionId)
      : generateSupplyMission(rand, destination, worldData, missionId);
    if (mission) missions.push(mission);
  }

  return missions;
}
