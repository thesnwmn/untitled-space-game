import { describe, it, expect } from 'vitest';
import { DOMRenderer } from './DOMRenderer';
import { GRID_WIDTH, MIN_GRID_HEIGHT } from '../../shared/types';

describe('DOMRenderer', () => {
  it('returns correct grid dimensions', () => {
    const r = new DOMRenderer();
    expect(r.getWidth()).toBe(GRID_WIDTH);
    expect(r.getHeight()).toBe(MIN_GRID_HEIGHT);
  });

  it('drawBuffer and clear do not throw', () => {
    const r = new DOMRenderer();
    expect(() => r.clear()).not.toThrow();
    expect(() => r.drawBuffer([])).not.toThrow();
  });

  it('onResize registers a handler without throwing', () => {
    const r = new DOMRenderer();
    expect(() => r.onResize(() => {})).not.toThrow();
  });
});
