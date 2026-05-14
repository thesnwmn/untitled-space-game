import { describe, it, expect } from 'vitest';
import {
  WORLD,
  getSystem,
  getDestination,
  getRoutesFrom,
  getDrive,
  getStoryBeat,
  getStoryBeatsByTrigger,
} from './world-data';

describe('getSystem', () => {
  it('resolves all four system ids', () => {
    expect(getSystem('sol')).toBeDefined();
    expect(getSystem('alpha-centauri')).toBeDefined();
    expect(getSystem('barnards-star')).toBeDefined();
    expect(getSystem('wolf-359')).toBeDefined();
  });

  it('returns undefined for unknown id', () => {
    expect(getSystem('unknown-system')).toBeUndefined();
  });
});

describe('getDestination', () => {
  it('returns elysium-station with trader amenity and NPC', () => {
    const dest = getDestination('elysium-station');
    expect(dest).toBeDefined();
    expect(dest!.amenities.trader).toBe(true);
    expect(dest!.npcs.trader).toBe('Merchant Kess');
  });

  it('returns undefined for unknown id', () => {
    expect(getDestination('nowhere')).toBeUndefined();
  });
});

describe('getRoutesFrom', () => {
  it('returns at least three routes from sol', () => {
    const routes = getRoutesFrom('sol');
    expect(routes.length).toBeGreaterThanOrEqual(3);
  });

  it('includes sol routes when queried from connected systems', () => {
    const routes = getRoutesFrom('alpha-centauri');
    const hasSolRoute = routes.some(r => r.from === 'sol' || r.to === 'sol');
    expect(hasSolRoute).toBe(true);
  });
});

describe('route integrity', () => {
  it('every route from and to resolves via getSystem', () => {
    for (const route of WORLD.routes) {
      expect(getSystem(route.from), `route.from '${route.from}' should resolve`).toBeDefined();
      expect(getSystem(route.to), `route.to '${route.to}' should resolve`).toBeDefined();
    }
  });
});

describe('destination integrity', () => {
  it('every destination system field resolves via getSystem', () => {
    for (const dest of WORLD.destinations) {
      expect(getSystem(dest.system), `destination '${dest.id}' system '${dest.system}' should resolve`).toBeDefined();
    }
  });
});

describe('system integrity', () => {
  it('every system destinations array entry resolves via getDestination', () => {
    for (const system of WORLD.systems) {
      for (const destId of system.destinations) {
        expect(getDestination(destId), `system '${system.id}' destination '${destId}' should resolve`).toBeDefined();
      }
    }
  });
});

describe('getDrive', () => {
  it('returns civilian-mk1 with maxDistanceLy === 4', () => {
    const drive = getDrive('civilian-mk1');
    expect(drive).toBeDefined();
    expect(drive!.maxDistanceLy).toBe(4);
  });

  it('returns undefined for unknown drive', () => {
    expect(getDrive('warp-drive')).toBeUndefined();
  });
});

describe('commodities', () => {
  it('all commodity basePrice values are positive numbers', () => {
    for (const commodity of WORLD.commodities) {
      expect(commodity.basePrice, `commodity '${commodity.id}' basePrice`).toBeGreaterThan(0);
    }
  });
});

describe('getStoryBeatsByTrigger', () => {
  it('returns at least one beat for game-start trigger', () => {
    const beats = getStoryBeatsByTrigger('game-start');
    expect(beats.length).toBeGreaterThanOrEqual(1);
  });

  it('returns empty array for unknown trigger', () => {
    expect(getStoryBeatsByTrigger('never-fires')).toEqual([]);
  });
});

describe('getStoryBeat', () => {
  it('returns opening-arrival with skippable === true', () => {
    const beat = getStoryBeat('opening-arrival');
    expect(beat).toBeDefined();
    expect(beat!.skippable).toBe(true);
  });

  it('returns undefined for unknown id', () => {
    expect(getStoryBeat('no-such-beat')).toBeUndefined();
  });
});
