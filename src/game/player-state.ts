import { getShip, computeCargoWeightKg, getWorld } from './world/world-data';
import type { CargoEntry, MissionSpec, ActiveMission, MissionItem, MissionStatus, GameBalance } from './world/types';
import { isReputationEligible } from './reputation-utils';

interface PlayerStateInit {
  shipId: string;
  driveId: string;
  credits: number;
  systemId: string;
  destinationId: string | null;
}

export function getMissionStatus(mission: ActiveMission, player: PlayerState): MissionStatus {
  if (mission.type === 'delivery') {
    if (!mission.pickupComplete) return 'pending-pickup';
    if (player.destinationId === mission.deliveryDestinationId) return 'ready-to-deliver';
    return 'in-transit';
  }
  // supply mission
  const hasAll = mission.requirements.every(req => {
    const entry = player.cargoHold.find(e => e.commodityId === req.commodityId);
    return entry !== undefined && entry.qty >= req.qty;
  });
  return hasAll ? 'ready-to-deliver' : 'needs-supplies';
}

export function canAcceptMission(
  player: PlayerState,
  spec: MissionSpec,
): { ok: boolean; reason?: string } {
  if (spec.type === 'delivery') {
    const available = player.cargoCapacity - player.cargoWeightKg;
    if (available < spec.itemWeightKg) {
      return { ok: false, reason: 'Insufficient cargo space' };
    }
  }
  return { ok: true };
}

export class PlayerState {
  readonly shipId: string;
  readonly driveId: string;
  readonly fuelCapacityL: number;
  readonly cargoCapacity: number;

  private _fuelL: number;
  private _credits: number;
  private _systemId: string;
  private _destinationId: string | null;
  private _cargoHold: CargoEntry[];
  private _activeMissions: ActiveMission[];
  private _missionItems: MissionItem[];
  private _factionReputation: Map<string, number>;

  constructor(init: PlayerStateInit) {
    const ship = getShip(init.shipId);
    if (!ship) throw new Error(`Unknown ship: ${init.shipId}`);

    this.shipId = init.shipId;
    this.driveId = init.driveId;
    this.fuelCapacityL = ship.fuelCapacityL;
    this.cargoCapacity = ship.cargoCapacityKg;
    this._fuelL = ship.fuelCapacityL;
    this._credits = init.credits;
    this._systemId = init.systemId;
    this._destinationId = init.destinationId;
    this._cargoHold = [];
    this._activeMissions = [];
    this._missionItems = [];

    this._factionReputation = new Map();
    for (const faction of getWorld().factions) {
      if (isReputationEligible(faction)) {
        this._factionReputation.set(faction.id, 0);
      }
    }
  }

  // Fuel
  get fuelL(): number { return this._fuelL; }

  addFuel(litres: number): void {
    this._fuelL = Math.min(this.fuelCapacityL, this._fuelL + litres);
  }

  consumeFuel(litres: number): void {
    this._fuelL = Math.max(0, this._fuelL - litres);
  }

  // Credits
  get credits(): number { return this._credits; }

  addCredits(amount: number): void {
    this._credits += amount;
  }

  spendCredits(amount: number): void {
    this._credits -= amount;
  }

  // Cargo
  get cargoHold(): readonly CargoEntry[] { return this._cargoHold; }

  addCargo(commodityId: string, qty: number): void {
    const existing = this._cargoHold.find(e => e.commodityId === commodityId);
    if (existing) {
      existing.qty += qty;
    } else {
      this._cargoHold.push({ commodityId, qty });
    }
  }

  removeCargo(commodityId: string, qty?: number): void {
    const idx = this._cargoHold.findIndex(e => e.commodityId === commodityId);
    if (idx < 0) return;
    if (qty !== undefined && qty < this._cargoHold[idx].qty) {
      this._cargoHold[idx].qty -= qty;
    } else {
      this._cargoHold.splice(idx, 1);
    }
  }

  get missionItemsWeightKg(): number {
    return this._missionItems.reduce((sum, item) => sum + item.weightKg, 0);
  }

  get cargoWeightKg(): number {
    return computeCargoWeightKg(this._cargoHold) + this.missionItemsWeightKg;
  }

  // Location
  get systemId(): string { return this._systemId; }
  get destinationId(): string | null { return this._destinationId; }

  dock(destinationId: string): void {
    this._destinationId = destinationId;
  }

  undock(): void {
    this._destinationId = null;
  }

  jumpTo(systemId: string): void {
    this._systemId = systemId;
    this._destinationId = null;
  }

  // Missions
  get activeMissions(): readonly ActiveMission[] { return this._activeMissions; }
  get missionItems(): readonly MissionItem[] { return this._missionItems; }

  acceptMission(spec: MissionSpec, giveItemNow: boolean): void {
    const mission: ActiveMission = {
      ...spec,
      acceptedAt: Date.now(),
      pickupComplete: false,
    };
    this._activeMissions.push(mission);

    if (spec.type === 'delivery' && giveItemNow) {
      this._missionItems.push({
        missionId: spec.id,
        itemName: spec.itemName,
        weightKg: spec.itemWeightKg,
      });
      mission.pickupComplete = true;
    }
  }

  collectMissionItem(missionId: string): void {
    const mission = this._activeMissions.find(m => m.id === missionId);
    if (!mission || mission.type !== 'delivery') return;
    mission.pickupComplete = true;
    this._missionItems.push({
      missionId: mission.id,
      itemName: mission.itemName,
      weightKg: mission.itemWeightKg,
    });
  }

  completeMission(missionId: string): void {
    this._activeMissions = this._activeMissions.filter(m => m.id !== missionId);
    this._missionItems = this._missionItems.filter(i => i.missionId !== missionId);
  }

  cancelMission(missionId: string): void {
    this._activeMissions = this._activeMissions.filter(m => m.id !== missionId);
    this._missionItems = this._missionItems.filter(i => i.missionId !== missionId);
  }

  getMissionsForPickup(destinationId: string): ActiveMission[] {
    return this._activeMissions.filter(
      m => m.type === 'delivery' &&
           m.pickupDestinationId === destinationId &&
           !m.pickupComplete,
    );
  }

  getMissionsForDelivery(destinationId: string): ActiveMission[] {
    return this._activeMissions.filter(
      m => m.deliveryDestinationId === destinationId &&
           getMissionStatus(m, this) === 'ready-to-deliver',
    );
  }

  // Reputation
  getFactionReputation(factionId: string): number {
    return this._factionReputation.get(factionId) ?? 0;
  }

  modifyFactionReputation(factionId: string, delta: number, balance: GameBalance): void {
    const current = this.getFactionReputation(factionId);
    const updated = Math.min(balance.reputation.pointsMax, Math.max(balance.reputation.pointsMin, current + delta));
    this._factionReputation.set(factionId, updated);
  }
}
