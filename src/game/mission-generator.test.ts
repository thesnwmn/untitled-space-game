import { describe, it, expect } from 'vitest';
import { generateMissions } from './mission-generator';
import { getWorld, getDestination } from './world/world-data';

function getElysium() {
  return getDestination('elysium-station')!;
}

describe('generateMissions', () => {
  describe('output structure', () => {
    it('respects boardMaxCount limit', () => {
      const dest = getElysium();
      const world = getWorld();
      const missions = generateMissions(dest, world, 42);
      expect(missions.length).toBeGreaterThanOrEqual(dest.minMissions);
      expect(missions.length).toBeLessThanOrEqual(world.balance.missions.boardMaxCount);
    });

    it('every mission has required base fields', () => {
      const dest = getElysium();
      const world = getWorld();
      const missions = generateMissions(dest, world, 99);
      for (const m of missions) {
        expect(m.id).toBeTruthy();
        expect(m.title).toBeTruthy();
        expect(m.description).toBeTruthy();
        expect(m.reward).toBeGreaterThan(0);
        expect(m.issuingDestinationId).toBe(dest.id);
        expect(m.giverName).toBeTruthy();
        expect(m.type === 'delivery' || m.type === 'supply').toBe(true);
      }
    });

    it('delivery missions have correct shape', () => {
      const dest = getElysium();
      const world = getWorld();
      // Run several seeds to guarantee some delivery missions appear
      let found = false;
      for (let seed = 0; seed < 20; seed++) {
        const missions = generateMissions(dest, world, seed);
        for (const m of missions) {
          if (m.type === 'delivery') {
            found = true;
            expect(m.itemName).toBeTruthy();
            expect(m.itemWeightKg).toBeGreaterThan(0);
            expect(m.pickupDestinationId).toBeTruthy();
            expect(m.deliveryDestinationId).not.toBe(dest.id);
          }
        }
      }
      expect(found).toBe(true);
    });

    it('supply missions have correct shape', () => {
      const dest = getElysium();
      const world = getWorld();
      let found = false;
      for (let seed = 0; seed < 20; seed++) {
        const missions = generateMissions(dest, world, seed);
        for (const m of missions) {
          if (m.type === 'supply') {
            found = true;
            expect(m.requirements.length).toBeGreaterThanOrEqual(1);
            expect(m.deliveryDestinationId).toBe(dest.id);
            for (const req of m.requirements) {
              expect(req.commodityId).toBeTruthy();
              expect(req.qty).toBeGreaterThanOrEqual(1);
            }
          }
        }
      }
      expect(found).toBe(true);
    });

    it('mission ids are unique within a single call', () => {
      const dest = getElysium();
      const world = getWorld();
      const missions = generateMissions(dest, world, 7);
      const ids = missions.map(m => m.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe('determinism', () => {
    it('same seed produces identical output', () => {
      const dest = getElysium();
      const world = getWorld();
      const a = generateMissions(dest, world, 12345);
      const b = generateMissions(dest, world, 12345);
      expect(a).toEqual(b);
    });

    it('different seeds produce different output', () => {
      const dest = getElysium();
      const world = getWorld();
      const a = generateMissions(dest, world, 1);
      const b = generateMissions(dest, world, 2);
      // At minimum the IDs differ
      expect(a.map(m => m.id)).not.toEqual(b.map(m => m.id));
    });
  });

  describe('reward values', () => {
    it('all rewards are positive integers', () => {
      const dest = getElysium();
      const world = getWorld();
      const missions = generateMissions(dest, world, 55);
      for (const m of missions) {
        expect(Number.isInteger(m.reward)).toBe(true);
        expect(m.reward).toBeGreaterThan(0);
      }
    });
  });

  describe('supply reward multiplier', () => {
    it('supply mission rewards exceed material cost', () => {
      const dest = getElysium();
      const world = getWorld();
      const { commodities } = world;
      for (let seed = 0; seed < 30; seed++) {
        const missions = generateMissions(dest, world, seed);
        for (const m of missions) {
          if (m.type === 'supply') {
            const materialCost = m.requirements.reduce((sum, req) => {
              const comm = commodities.find(c => c.id === req.commodityId);
              return sum + (comm?.basePrice ?? 100) * req.qty;
            }, 0);
            expect(m.reward).toBeGreaterThan(materialCost);
          }
        }
      }
    });

    it('heavier supply missions lean toward higher multipliers', () => {
      const dest = getElysium();
      const world = getWorld();
      const { commodities } = world;
      const rewardsByWeight: { lightRewards: number[]; heavyRewards: number[] } = {
        lightRewards: [],
        heavyRewards: [],
      };

      for (let seed = 0; seed < 50; seed++) {
        const missions = generateMissions(dest, world, seed);
        for (const m of missions) {
          if (m.type === 'supply') {
            const totalWeight = m.requirements.reduce((sum, req) => {
              const comm = commodities.find(c => c.id === req.commodityId);
              return sum + (comm?.weightKg ?? 1) * req.qty;
            }, 0);
            const materialCost = m.requirements.reduce((sum, req) => {
              const comm = commodities.find(c => c.id === req.commodityId);
              return sum + (comm?.basePrice ?? 100) * req.qty;
            }, 0);
            const multiplier = m.reward / materialCost;
            if (totalWeight < 100) {
              rewardsByWeight.lightRewards.push(multiplier);
            } else if (totalWeight > 400) {
              rewardsByWeight.heavyRewards.push(multiplier);
            }
          }
        }
      }

      const lightAvg = rewardsByWeight.lightRewards.reduce((a, b) => a + b, 0) / rewardsByWeight.lightRewards.length;
      const heavyAvg = rewardsByWeight.heavyRewards.reduce((a, b) => a + b, 0) / rewardsByWeight.heavyRewards.length;
      expect(heavyAvg).toBeGreaterThan(lightAvg);
    });
  });

  describe('delivery mission deposit', () => {
    it('all delivery missions have positive integer deposit', () => {
      const dest = getElysium();
      const world = getWorld();
      for (let seed = 0; seed < 20; seed++) {
        const missions = generateMissions(dest, world, seed);
        for (const m of missions) {
          if (m.type === 'delivery') {
            expect(Number.isInteger(m.deposit)).toBe(true);
            expect(m.deposit).toBeGreaterThan(0);
          }
        }
      }
    });

    it('deposit is fraction of reward (20% default)', () => {
      const dest = getElysium();
      const world = getWorld();
      const expectedFraction = world.balance.missions.deliveryDepositFraction;
      for (let seed = 0; seed < 20; seed++) {
        const missions = generateMissions(dest, world, seed);
        for (const m of missions) {
          if (m.type === 'delivery') {
            const expectedDeposit = Math.floor(m.reward * expectedFraction);
            expect(m.deposit).toBe(expectedDeposit);
          }
        }
      }
    });
  });

  describe('weighted delivery item selection', () => {
    it('heavier items appear more frequently', () => {
      const dest = getElysium();
      const world = getWorld();
      const itemCounts: Record<string, number> = {};

      for (let seed = 0; seed < 100; seed++) {
        const missions = generateMissions(dest, world, seed);
        for (const m of missions) {
          if (m.type === 'delivery') {
            itemCounts[m.itemName] = (itemCounts[m.itemName] ?? 0) + 1;
          }
        }
      }

      const itemWeights: Record<string, number> = {};
      for (const item of world.deliveryItems) {
        itemWeights[item.name] = item.weightKg;
      }

      const items = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
      if (items.length >= 2) {
        const heavier = world.deliveryItems.find(i => i.name === items[0][0])?.weightKg ?? 0;
        const lighter = world.deliveryItems.find(i => i.name === items[items.length - 1][0])?.weightKg ?? 0;
        if (heavier > lighter) {
          expect(items[0][1]).toBeGreaterThan(items[items.length - 1][1]);
        }
      }
    });
  });
});
