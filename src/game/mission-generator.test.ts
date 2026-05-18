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
});
