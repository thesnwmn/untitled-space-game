import { describe, it, expect } from 'vitest';
import { PlayerState } from './player-state';

function makePlayer(overrides?: {
  shipId?: string;
  driveId?: string;
  credits?: number;
  systemId?: string;
  destinationId?: string | null;
}): PlayerState {
  return new PlayerState({
    shipId: overrides?.shipId ?? 'freighter',
    driveId: overrides?.driveId ?? 'civilian-mk1',
    credits: overrides?.credits ?? 1000,
    systemId: overrides?.systemId ?? 'sol',
    destinationId: overrides?.destinationId !== undefined ? overrides.destinationId : 'elysium-station',
  });
}

describe('PlayerState', () => {
  describe('construction', () => {
    it('starts with full fuel tank based on ship data', () => {
      const p = makePlayer();
      expect(p.fuelL).toBe(p.fuelCapacityL);
    });

    it('loads fuelCapacityL and cargoCapacity from ship record', () => {
      const p = makePlayer({ shipId: 'freighter' });
      expect(p.fuelCapacityL).toBe(100);
      expect(p.cargoCapacity).toBe(2000);
    });

    it('throws for unknown ship id', () => {
      expect(() => makePlayer({ shipId: 'nonexistent-ship' })).toThrow('Unknown ship');
    });

    it('stores initial credits', () => {
      const p = makePlayer({ credits: 500 });
      expect(p.credits).toBe(500);
    });

    it('stores initial systemId and destinationId', () => {
      const p = makePlayer({ systemId: 'alpha-centauri', destinationId: null });
      expect(p.systemId).toBe('alpha-centauri');
      expect(p.destinationId).toBeNull();
    });
  });

  describe('fuel', () => {
    it('addFuel increases fuelL', () => {
      const p = makePlayer();
      p.consumeFuel(50);
      p.addFuel(20);
      expect(p.fuelL).toBe(70);
    });

    it('addFuel clamps at capacity', () => {
      const p = makePlayer();
      p.addFuel(1000);
      expect(p.fuelL).toBe(p.fuelCapacityL);
    });

    it('consumeFuel decreases fuelL', () => {
      const p = makePlayer();
      p.consumeFuel(30);
      expect(p.fuelL).toBe(70);
    });

    it('consumeFuel clamps at 0', () => {
      const p = makePlayer();
      p.consumeFuel(9999);
      expect(p.fuelL).toBe(0);
    });
  });

  describe('credits', () => {
    it('addCredits increases credits', () => {
      const p = makePlayer({ credits: 100 });
      p.addCredits(50);
      expect(p.credits).toBe(150);
    });

    it('spendCredits decreases credits', () => {
      const p = makePlayer({ credits: 200 });
      p.spendCredits(75);
      expect(p.credits).toBe(125);
    });
  });

  describe('cargo', () => {
    it('cargoHold is empty on construction', () => {
      const p = makePlayer();
      expect(p.cargoHold).toHaveLength(0);
    });

    it('addCargo creates a new entry', () => {
      const p = makePlayer();
      p.addCargo('iron-ore', 10);
      expect(p.cargoHold).toHaveLength(1);
      expect(p.cargoHold[0]).toEqual({ commodityId: 'iron-ore', qty: 10 });
    });

    it('addCargo merges into existing entry', () => {
      const p = makePlayer();
      p.addCargo('iron-ore', 10);
      p.addCargo('iron-ore', 5);
      expect(p.cargoHold).toHaveLength(1);
      expect(p.cargoHold[0].qty).toBe(15);
    });

    it('addCargo pushes new entry for different commodity', () => {
      const p = makePlayer();
      p.addCargo('iron-ore', 10);
      p.addCargo('copper-wire', 3);
      expect(p.cargoHold).toHaveLength(2);
    });

    it('removeCargo removes the matching entry', () => {
      const p = makePlayer();
      p.addCargo('iron-ore', 10);
      p.addCargo('copper-wire', 3);
      p.removeCargo('iron-ore');
      expect(p.cargoHold).toHaveLength(1);
      expect(p.cargoHold[0].commodityId).toBe('copper-wire');
    });

    it('removeCargo is a no-op for absent commodity', () => {
      const p = makePlayer();
      p.addCargo('iron-ore', 10);
      p.removeCargo('nonexistent');
      expect(p.cargoHold).toHaveLength(1);
    });

    it('cargoWeightKg returns computed weight from hold', () => {
      const p = makePlayer();
      p.addCargo('iron-ore', 10); // iron-ore: 10 kg/unit × 10 units = 100 kg
      expect(p.cargoWeightKg).toBe(100);
    });
  });

  describe('location transitions', () => {
    it('dock sets destinationId', () => {
      const p = makePlayer({ destinationId: null });
      p.dock('elysium-station');
      expect(p.destinationId).toBe('elysium-station');
    });

    it('undock clears destinationId to null', () => {
      const p = makePlayer({ destinationId: 'elysium-station' });
      p.undock();
      expect(p.destinationId).toBeNull();
    });

    it('jumpTo sets systemId and clears destinationId', () => {
      const p = makePlayer({ systemId: 'sol', destinationId: 'elysium-station' });
      p.jumpTo('alpha-centauri');
      expect(p.systemId).toBe('alpha-centauri');
      expect(p.destinationId).toBeNull();
    });

    it('full transition: dock → undock → jumpTo', () => {
      const p = makePlayer({ systemId: 'sol', destinationId: null });
      p.dock('elysium-station');
      expect(p.destinationId).toBe('elysium-station');
      p.undock();
      expect(p.destinationId).toBeNull();
      p.jumpTo('barnards-star');
      expect(p.systemId).toBe('barnards-star');
      expect(p.destinationId).toBeNull();
    });
  });
});
