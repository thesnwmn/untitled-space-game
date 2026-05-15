import { getShip, computeCargoWeightKg } from './world/world-data';
import type { CargoEntry } from './world/types';

interface PlayerStateInit {
  shipId: string;
  driveId: string;
  credits: number;
  systemId: string;
  destinationId: string | null;
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

  get cargoWeightKg(): number { return computeCargoWeightKg(this._cargoHold); }

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
}
