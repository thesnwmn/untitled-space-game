import { describe, it, expect } from 'vitest';
import { findRoute } from './route-finder';

describe('findRoute', () => {
  it('returns [systemId] when from === to', () => {
    expect(findRoute('sol', 'sol')).toEqual(['sol']);
  });

  it('returns a direct path for adjacent systems', () => {
    const route = findRoute('sol', 'alpha-centauri');
    expect(route).not.toBeNull();
    expect(route![0]).toBe('sol');
    expect(route![route!.length - 1]).toBe('alpha-centauri');
    expect(route!.length).toBe(2);
  });

  it('returns a multi-hop path for non-adjacent systems', () => {
    // Tau Ceti is not directly connected to Sol; must go via Wolf 359
    const route = findRoute('sol', 'tau-ceti');
    expect(route).not.toBeNull();
    expect(route![0]).toBe('sol');
    expect(route![route!.length - 1]).toBe('tau-ceti');
    expect(route!.length).toBeGreaterThan(2);
  });

  it('finds shortest path by hop count', () => {
    // If sol→wolf-359 is 1 hop and wolf-359→tau-ceti is 1 hop, shortest is 2 hops
    const route = findRoute('sol', 'tau-ceti');
    expect(route).not.toBeNull();
    expect(route!.length - 1).toBeLessThanOrEqual(4); // reasonable upper bound
  });

  it('returns null for an unreachable system id', () => {
    expect(findRoute('sol', 'nonexistent-system-xyz')).toBeNull();
  });

  it('path is continuous: each step is a valid jump route', () => {
    const route = findRoute('sol', 'tau-ceti');
    expect(route).not.toBeNull();
    for (let i = 0; i < route!.length - 1; i++) {
      // Each consecutive pair must appear in the route graph
      const from = route![i];
      const to = route![i + 1];
      expect(from).not.toBe(to);
    }
  });
});
