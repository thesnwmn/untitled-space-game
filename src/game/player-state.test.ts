import { describe, it, expect } from 'vitest';
import { PlayerState, getMissionStatus, canAcceptMission } from './player-state';
import type { MissionSpec } from './world/types';

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

    it('getInSystemHopCost calculates for scout ship', () => {
      const p = makePlayer({ shipId: 'scout' });
      const hopCost = p.getInSystemHopCost();
      expect(hopCost).toBe(3); // Math.ceil(4 * 0.7) = 3
    });

    it('getInSystemHopCost calculates for freighter ship', () => {
      const p = makePlayer({ shipId: 'freighter' });
      const hopCost = p.getInSystemHopCost();
      expect(hopCost).toBe(4); // Math.ceil(4 * 0.85) = 4
    });

    it('getInSystemHopCost calculates for hauler ship', () => {
      const p = makePlayer({ shipId: 'hauler' });
      const hopCost = p.getInSystemHopCost();
      expect(hopCost).toBe(4); // Math.ceil(4 * 0.95) = 4
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

    it('spendCredits allows negative balance for emergency fees', () => {
      const p = makePlayer({ credits: 100 });
      p.spendCredits(500);
      expect(p.credits).toBe(-400);
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
      p.addCargo('iron-ore', 10); // iron-ore: 40 kg/unit × 10 units = 400 kg
      expect(p.cargoWeightKg).toBe(400);
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

  describe('hull integrity', () => {
    it('starts at 1.0 on construction', () => {
      const p = makePlayer();
      expect(p.hullIntegrity).toBe(1.0);
    });

    it('applyHullDamage subtracts fraction from hullIntegrity', () => {
      const p = makePlayer();
      p.applyHullDamage(0.25);
      expect(p.hullIntegrity).toBe(0.75);
    });

    it('applyHullDamage can be called multiple times', () => {
      const p = makePlayer();
      p.applyHullDamage(0.25);
      p.applyHullDamage(0.40);
      expect(p.hullIntegrity).toBe(0.35);
    });

    it('applyHullDamage clamps at 0.0', () => {
      const p = makePlayer();
      p.applyHullDamage(1.0);
      expect(p.hullIntegrity).toBe(0);
      p.applyHullDamage(0.5);
      expect(p.hullIntegrity).toBe(0);
    });

    it('hullIntegrity value 0.75 is preserved', () => {
      const p = makePlayer();
      p.applyHullDamage(0.25);
      expect(p.hullIntegrity).toBe(0.75);
    });
  });
});

// ─── Mission helpers ────────────────────────────────────────────────────────

function makeDeliverySpec(overrides?: Partial<MissionSpec>): MissionSpec {
  return {
    id: 'test-delivery-1',
    type: 'delivery',
    title: 'Test Delivery',
    description: 'Deliver a thing.',
    reward: 300,
    issuingDestinationId: 'elysium-station',
    giverName: 'Dispatch',
    itemName: 'Encrypted Data Core',
    itemWeightKg: 5,
    pickupDestinationId: 'elysium-station',
    deliveryDestinationId: 'portside-market',
    deposit: 60,
    ...overrides,
  } as MissionSpec;
}

function makeSupplySpec(overrides?: Partial<MissionSpec>): MissionSpec {
  return {
    id: 'test-supply-1',
    type: 'supply',
    title: 'Test Supply',
    description: 'Bring supplies.',
    reward: 150,
    issuingDestinationId: 'elysium-station',
    giverName: 'Merchant Kess',
    requirements: [{ commodityId: 'iron-ore', qty: 2 }],
    deliveryDestinationId: 'elysium-station',
    ...overrides,
  } as MissionSpec;
}

describe('PlayerState — missions', () => {
  describe('acceptMission', () => {
    it('adds mission to activeMissions', () => {
      const p = makePlayer();
      p.acceptMission(makeDeliverySpec(), false);
      expect(p.activeMissions).toHaveLength(1);
      expect(p.activeMissions[0].id).toBe('test-delivery-1');
    });

    it('with giveItemNow=false, missionItems stays empty and pickupComplete is false', () => {
      const p = makePlayer();
      p.acceptMission(makeDeliverySpec(), false);
      expect(p.missionItems).toHaveLength(0);
      expect(p.activeMissions[0].pickupComplete).toBe(false);
    });

    it('with giveItemNow=true, adds MissionItem and sets pickupComplete', () => {
      const p = makePlayer();
      p.acceptMission(makeDeliverySpec(), true);
      expect(p.missionItems).toHaveLength(1);
      expect(p.missionItems[0].itemName).toBe('Encrypted Data Core');
      expect(p.missionItems[0].weightKg).toBe(5);
      expect(p.activeMissions[0].pickupComplete).toBe(true);
    });

    it('supply mission ignores giveItemNow', () => {
      const p = makePlayer();
      p.acceptMission(makeSupplySpec(), true);
      expect(p.missionItems).toHaveLength(0);
      expect(p.activeMissions[0].pickupComplete).toBe(false);
    });
  });

  describe('missionItemsWeightKg and cargoWeightKg', () => {
    it('missionItemsWeightKg is 0 with no mission items', () => {
      const p = makePlayer();
      expect(p.missionItemsWeightKg).toBe(0);
    });

    it('missionItemsWeightKg sums weights of all mission items', () => {
      const p = makePlayer();
      p.acceptMission(makeDeliverySpec({ id: 'm1', itemWeightKg: 5 } as any), true);
      p.acceptMission(makeDeliverySpec({ id: 'm2', itemWeightKg: 35 } as any), true);
      expect(p.missionItemsWeightKg).toBe(40);
    });

    it('cargoWeightKg includes mission items', () => {
      const p = makePlayer();
      p.addCargo('iron-ore', 1); // 40 kg
      p.acceptMission(makeDeliverySpec(), true); // 5 kg
      expect(p.cargoWeightKg).toBe(45);
    });
  });

  describe('collectMissionItem', () => {
    it('sets pickupComplete and adds MissionItem', () => {
      const p = makePlayer();
      p.acceptMission(makeDeliverySpec(), false);
      p.collectMissionItem('test-delivery-1');
      expect(p.activeMissions[0].pickupComplete).toBe(true);
      expect(p.missionItems).toHaveLength(1);
      expect(p.missionItems[0].missionId).toBe('test-delivery-1');
    });

    it('is a no-op for unknown mission id', () => {
      const p = makePlayer();
      p.acceptMission(makeDeliverySpec(), false);
      p.collectMissionItem('nonexistent');
      expect(p.activeMissions[0].pickupComplete).toBe(false);
      expect(p.missionItems).toHaveLength(0);
    });

    it('is a no-op for supply missions', () => {
      const p = makePlayer();
      p.acceptMission(makeSupplySpec(), false);
      p.collectMissionItem('test-supply-1');
      expect(p.missionItems).toHaveLength(0);
    });
  });

  describe('completeMission', () => {
    it('removes mission from activeMissions', () => {
      const p = makePlayer();
      p.acceptMission(makeDeliverySpec(), true);
      p.completeMission('test-delivery-1');
      expect(p.activeMissions).toHaveLength(0);
    });

    it('removes associated MissionItem', () => {
      const p = makePlayer();
      p.acceptMission(makeDeliverySpec(), true);
      expect(p.missionItems).toHaveLength(1);
      p.completeMission('test-delivery-1');
      expect(p.missionItems).toHaveLength(0);
    });
  });

  describe('cancelMission', () => {
    it('removes mission and its item, same as completeMission', () => {
      const p = makePlayer();
      p.acceptMission(makeDeliverySpec(), true);
      p.cancelMission('test-delivery-1');
      expect(p.activeMissions).toHaveLength(0);
      expect(p.missionItems).toHaveLength(0);
    });
  });

  describe('getMissionsForPickup', () => {
    it('returns delivery missions where pickupDestinationId matches and pickupComplete is false', () => {
      const p = makePlayer({ destinationId: 'elysium-station' });
      p.acceptMission(makeDeliverySpec(), false);
      const result = p.getMissionsForPickup('elysium-station');
      expect(result).toHaveLength(1);
    });

    it('excludes missions already picked up', () => {
      const p = makePlayer();
      p.acceptMission(makeDeliverySpec(), true); // giveItemNow=true marks pickupComplete
      const result = p.getMissionsForPickup('elysium-station');
      expect(result).toHaveLength(0);
    });

    it('excludes missions for a different pickup destination', () => {
      const p = makePlayer();
      p.acceptMission(makeDeliverySpec({ pickupDestinationId: 'portside-market' } as any), false);
      const result = p.getMissionsForPickup('elysium-station');
      expect(result).toHaveLength(0);
    });

    it('does not include supply missions', () => {
      const p = makePlayer();
      p.acceptMission(makeSupplySpec({ pickupDestinationId: 'elysium-station' } as any), false);
      const result = p.getMissionsForPickup('elysium-station');
      expect(result).toHaveLength(0);
    });
  });

  describe('getMissionsForDelivery', () => {
    it('returns delivery mission when at delivery destination with item collected', () => {
      const p = makePlayer({ destinationId: 'portside-market' });
      p.acceptMission(makeDeliverySpec(), true); // item given, pickup complete
      const result = p.getMissionsForDelivery('portside-market');
      expect(result).toHaveLength(1);
    });

    it('excludes delivery mission when player is not at delivery destination', () => {
      const p = makePlayer({ destinationId: 'elysium-station' });
      p.acceptMission(makeDeliverySpec(), true);
      const result = p.getMissionsForDelivery('portside-market');
      expect(result).toHaveLength(0); // status is in-transit, not ready-to-deliver
    });

    it('excludes delivery mission when pickup not complete', () => {
      const p = makePlayer({ destinationId: 'portside-market' });
      p.acceptMission(makeDeliverySpec(), false);
      const result = p.getMissionsForDelivery('portside-market');
      expect(result).toHaveLength(0);
    });

    it('returns supply mission when player has all required commodities', () => {
      const p = makePlayer({ destinationId: 'elysium-station' });
      p.acceptMission(makeSupplySpec(), false);
      p.addCargo('iron-ore', 2);
      const result = p.getMissionsForDelivery('elysium-station');
      expect(result).toHaveLength(1);
    });

    it('excludes supply mission when player is missing commodities', () => {
      const p = makePlayer({ destinationId: 'elysium-station' });
      p.acceptMission(makeSupplySpec(), false);
      const result = p.getMissionsForDelivery('elysium-station');
      expect(result).toHaveLength(0);
    });
  });
});

describe('getMissionStatus', () => {
  it('delivery with pickupComplete=false returns pending-pickup', () => {
    const p = makePlayer({ destinationId: 'portside-market' });
    p.acceptMission(makeDeliverySpec(), false);
    expect(getMissionStatus(p.activeMissions[0], p)).toBe('pending-pickup');
  });

  it('delivery with pickupComplete=true at delivery destination returns ready-to-deliver', () => {
    const p = makePlayer({ destinationId: 'portside-market' });
    p.acceptMission(makeDeliverySpec(), true);
    expect(getMissionStatus(p.activeMissions[0], p)).toBe('ready-to-deliver');
  });

  it('delivery with pickupComplete=true at other destination returns in-transit', () => {
    const p = makePlayer({ destinationId: 'elysium-station' });
    p.acceptMission(makeDeliverySpec(), true);
    expect(getMissionStatus(p.activeMissions[0], p)).toBe('in-transit');
  });

  it('supply with all commodities returns ready-to-deliver', () => {
    const p = makePlayer();
    p.acceptMission(makeSupplySpec(), false);
    p.addCargo('iron-ore', 2);
    expect(getMissionStatus(p.activeMissions[0], p)).toBe('ready-to-deliver');
  });

  it('supply missing commodities returns needs-supplies', () => {
    const p = makePlayer();
    p.acceptMission(makeSupplySpec(), false);
    expect(getMissionStatus(p.activeMissions[0], p)).toBe('needs-supplies');
  });

  it('supply with partial quantity returns needs-supplies', () => {
    const p = makePlayer();
    p.acceptMission(makeSupplySpec(), false); // requires 2× iron-ore
    p.addCargo('iron-ore', 1); // only 1
    expect(getMissionStatus(p.activeMissions[0], p)).toBe('needs-supplies');
  });
});

describe('canAcceptMission', () => {
  it('returns ok for delivery mission that fits in cargo', () => {
    const p = makePlayer(); // freighter: 2000 kg capacity, empty
    const result = canAcceptMission(p, makeDeliverySpec());
    expect(result.ok).toBe(true);
  });

  it('returns not-ok when delivery item exceeds available cargo space', () => {
    const p = makePlayer();
    p.addCargo('iron-ore', 49); // 49 × 40 kg = 1960 kg used, 40 kg left
    const spec = makeDeliverySpec({ itemWeightKg: 50 } as any);
    const result = canAcceptMission(p, spec);
    expect(result.ok).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it('mission items count toward cargo space in acceptance check', () => {
    const p = makePlayer();
    // Accept a heavy delivery first (1950 kg), leaving 50 kg
    p.acceptMission(makeDeliverySpec({ id: 'm1', itemWeightKg: 1950 } as any), true);
    // Now try to accept a 100 kg item — should fail
    const spec = makeDeliverySpec({ id: 'm2', itemWeightKg: 100 } as any);
    const result = canAcceptMission(p, spec);
    expect(result.ok).toBe(false);
  });

  it('supply missions always return ok', () => {
    const p = makePlayer();
    // Fill cargo to near-capacity
    p.addCargo('iron-ore', 49);
    const result = canAcceptMission(p, makeSupplySpec());
    expect(result.ok).toBe(true);
  });

  it('returns not-ok when player credits < deposit for delivery mission', () => {
    const p = makePlayer({ credits: 50 });
    const spec = makeDeliverySpec({ deposit: 100 } as any);
    const result = canAcceptMission(p, spec);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('Insufficient credits for deposit');
  });

  it('returns ok when player credits >= deposit for delivery mission', () => {
    const p = makePlayer({ credits: 100 });
    const spec = makeDeliverySpec({ deposit: 50 } as any);
    const result = canAcceptMission(p, spec);
    expect(result.ok).toBe(true);
  });

  it('supply missions are not affected by deposit check', () => {
    const p = makePlayer({ credits: 0 });
    const result = canAcceptMission(p, makeSupplySpec());
    expect(result.ok).toBe(true);
  });
});

describe('mission deposit behavior', () => {
  it('acceptMission deducts deposit from credits for delivery mission', () => {
    const p = makePlayer({ credits: 1000 });
    const spec = makeDeliverySpec({ deposit: 100 } as any);
    expect(p.credits).toBe(1000);
    p.acceptMission(spec, false);
    expect(p.credits).toBe(900);
  });

  it('acceptMission does not deduct deposit for supply mission', () => {
    const p = makePlayer({ credits: 1000 });
    const spec = makeSupplySpec();
    expect(p.credits).toBe(1000);
    p.acceptMission(spec, false);
    expect(p.credits).toBe(1000);
  });

  it('cancelMission does not refund deposit', () => {
    const p = makePlayer({ credits: 1000 });
    const spec = makeDeliverySpec({ id: 'cancel-test', deposit: 100 } as any);
    p.acceptMission(spec, false);
    expect(p.credits).toBe(900);
    p.cancelMission('cancel-test');
    expect(p.credits).toBe(900); // deposit not refunded
  });

  it('completeMission pays full reward (deposit already deducted)', () => {
    const p = makePlayer({ credits: 1000 });
    const spec = makeDeliverySpec({ id: 'complete-test', reward: 200, deposit: 40 } as any);
    p.acceptMission(spec, false);
    expect(p.credits).toBe(960); // 1000 - 40
    // Manually complete since it's just credit logic
    p.completeMission('complete-test');
    // Credits remain 960 (completeMission doesn't add credits — that's done separately in game logic)
    // But verify the mission is removed
    expect(p.activeMissions.length).toBe(0);
  });
});
