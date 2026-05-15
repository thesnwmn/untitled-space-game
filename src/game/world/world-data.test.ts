import { describe, it, expect } from 'vitest';
import {
  getWorld,
  getSystem,
  getDestination,
  getRoutesFrom,
  getDrive,
  getShip,
  getRoute,
  getStoryBeat,
  getStoryBeatsByTrigger,
  getCommodity,
  getCommodities,
  computeCargoWeightKg,
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
    for (const route of getWorld().routes) {
      expect(getSystem(route.from), `route.from '${route.from}' should resolve`).toBeDefined();
      expect(getSystem(route.to), `route.to '${route.to}' should resolve`).toBeDefined();
    }
  });
});

describe('destination integrity', () => {
  it('every destination system field resolves via getSystem', () => {
    for (const dest of getWorld().destinations) {
      expect(getSystem(dest.system), `destination '${dest.id}' system '${dest.system}' should resolve`).toBeDefined();
    }
  });
});

describe('system integrity', () => {
  it('every system destinations array entry resolves via getDestination', () => {
    for (const system of getWorld().systems) {
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

describe('getShip', () => {
  it('returns the freighter with correct fuelCapacityL', () => {
    const ship = getShip('freighter');
    expect(ship).toBeDefined();
    expect(ship!.fuelCapacityL).toBe(100);
    expect(ship!.defaultJumpDrive).toBe('civilian-mk1');
  });

  it('returns undefined for unknown ship id', () => {
    expect(getShip('battleship')).toBeUndefined();
  });
});

describe('getRoute', () => {
  it('returns the route between sol and alpha-centauri (forward direction)', () => {
    const route = getRoute('sol', 'alpha-centauri');
    expect(route).toBeDefined();
    expect(route!.distance).toBe(4.3);
  });

  it('returns the route between sol and alpha-centauri (reverse direction)', () => {
    const route = getRoute('alpha-centauri', 'sol');
    expect(route).toBeDefined();
    expect(route!.distance).toBe(4.3);
  });

  it('returns undefined for a route that does not exist', () => {
    expect(getRoute('sol', 'wolf-359')).toBeDefined(); // sol-wolf-359 exists
    expect(getRoute('alpha-centauri', 'wolf-359')).toBeUndefined(); // no direct route
  });
});

describe('commodities', () => {
  it('all commodity basePrice values are positive numbers', () => {
    for (const commodity of getWorld().commodities) {
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

describe('getCommodity', () => {
  it('returns iron-ore with correct basePrice', () => {
    const c = getCommodity('iron-ore');
    expect(c).toBeDefined();
    expect(c!.basePrice).toBe(80);
    expect(c!.weightKg).toBe(40);
  });

  it('returns undefined for unknown commodity id', () => {
    expect(getCommodity('no-such-commodity')).toBeUndefined();
  });
});

describe('getCommodities', () => {
  it('returns all commodities', () => {
    const list = getCommodities();
    expect(list.length).toBe(getWorld().commodities.length);
    expect(list.length).toBeGreaterThan(0);
  });
});

describe('computeCargoWeightKg', () => {
  it('returns 0 for empty hold', () => {
    expect(computeCargoWeightKg([])).toBe(0);
  });

  it('sums weight correctly across multiple entries', () => {
    // iron-ore: 40 kg × 3 = 120; electronics: 8 kg × 5 = 40; total = 160
    const hold = [
      { commodityId: 'iron-ore', qty: 3 },
      { commodityId: 'electronics', qty: 5 },
    ];
    expect(computeCargoWeightKg(hold)).toBe(160);
  });

  it('ignores unknown commodity ids (contributes 0)', () => {
    const hold = [{ commodityId: 'nonexistent', qty: 100 }];
    expect(computeCargoWeightKg(hold)).toBe(0);
  });
});

describe('jump route reachability — surface/asteroid destinations accessible', () => {
  function reachableSystems(startId: string): Set<string> {
    const visited = new Set<string>();
    const queue = [startId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      for (const route of getRoutesFrom(current)) {
        const neighbor = route.from === current ? route.to : route.from;
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }
    return visited;
  }

  it('tau-ceti (has surface destination ceti-landfall) is reachable from sol', () => {
    expect(reachableSystems('sol').has('tau-ceti')).toBe(true);
  });

  it('epsilon-eridani (has asteroid destination eridani-anchorage) is reachable from sol', () => {
    expect(reachableSystems('sol').has('epsilon-eridani')).toBe(true);
  });

  it('alpha-centauri to tau-ceti route exists', () => {
    const routes = getRoutesFrom('alpha-centauri');
    const found = routes.some(r => {
      const other = r.from === 'alpha-centauri' ? r.to : r.from;
      return other === 'tau-ceti';
    });
    expect(found).toBe(true);
  });

  it('barnards-star to epsilon-eridani route exists', () => {
    const routes = getRoutesFrom('barnards-star');
    const found = routes.some(r => {
      const other = r.from === 'barnards-star' ? r.to : r.from;
      return other === 'epsilon-eridani';
    });
    expect(found).toBe(true);
  });
});
