import type { WorldData, GameSettings, GameBalance, StarSystem, Destination, JumpRoute, JumpDrive, Ship, StoryBeat, Commodity, CargoEntry, DeliveryItem, NpcNames, Faction, Economy } from './types';

let _world: WorldData | null = null;

export function initWorld(data: WorldData): void {
  _world = data;
}

export function getWorld(): WorldData {
  if (_world === null) throw new Error('World not initialised — call initWorld() before accessing world data');
  return _world;
}

export function getSystem(id: string): StarSystem | undefined {
  return getWorld().systems.find(s => s.id === id);
}

export function getDestination(id: string): Destination | undefined {
  return getWorld().destinations.find(d => d.id === id);
}

export function getRoutesFrom(systemId: string): JumpRoute[] {
  return getWorld().routes.filter(r => r.from === systemId || r.to === systemId);
}

export function getDrive(id: string): JumpDrive | undefined {
  return getWorld().drives.find(d => d.id === id);
}

export function getStoryBeat(id: string): StoryBeat | undefined {
  return getWorld().storyBeats.find(b => b.id === id);
}

export function getStoryBeatsByTrigger(trigger: string): StoryBeat[] {
  return getWorld().storyBeats.filter(b => b.trigger === trigger);
}

export function getGameSettings(): GameSettings {
  return getWorld().settings;
}

export function getGameBalance(): GameBalance {
  return getWorld().balance;
}

export function getShip(id: string): Ship | undefined {
  return getWorld().ships.find(s => s.id === id);
}

export function getRoute(fromId: string, toId: string): JumpRoute | undefined {
  return getWorld().routes.find(
    r => (r.from === fromId && r.to === toId) ||
         (r.from === toId   && r.to === fromId)
  );
}

export function getFaction(id: string): Faction | undefined {
  return getWorld().factions.find(f => f.id === id);
}

export function getCommodity(id: string): Commodity | undefined {
  return getWorld().commodities.find(c => c.id === id);
}

export function getCommodities(): Commodity[] {
  return getWorld().commodities;
}

export function getPublicSystems(): StarSystem[] {
  return getWorld().systems.filter(s => s.playerKnowledge === 'public');
}

export function getDeliveryItems(): DeliveryItem[] {
  return getWorld().deliveryItems;
}

export function getNpcNames(): NpcNames {
  return getWorld().npcNames;
}

export function computeCargoWeightKg(cargoHold: CargoEntry[]): number {
  return cargoHold.reduce((total, entry) => {
    const commodity = getCommodity(entry.commodityId);
    return total + entry.qty * (commodity?.weightKg ?? 0);
  }, 0);
}

export function getEconomy(id: string): Economy | undefined {
  return getWorld().economies.find(e => e.id === id);
}

export function computeEffectiveFactor(commodityId: string, system: StarSystem): number {
  const balance = getGameBalance();
  const factors: number[] = [];

  for (const economyId of system.economies) {
    const economy = getEconomy(economyId);
    if (!economy) continue;
    for (const c of economy.commodities) {
      if (c.id === commodityId) {
        factors.push(c.factor);
        break;
      }
    }
  }

  const avg = factors.length === 0 ? 1.0 : factors.reduce((a, b) => a + b, 0) / factors.length;
  return Math.max(balance.economies.minFactor, Math.min(balance.economies.maxFactor, avg));
}
