import { describe, it, expect } from 'vitest';
import { TerminalRenderer } from './TerminalRenderer';
import { MAX_GRID_WIDTH, MAX_GRID_HEIGHT } from '../../shared/types';

describe('TerminalRenderer', () => {
  it('returns correct grid dimensions', () => {
    const r = new TerminalRenderer();
    expect(r.getWidth()).toBe(MAX_GRID_WIDTH);
    expect(r.getHeight()).toBe(MAX_GRID_HEIGHT);
  });

  it('drawBuffer and clear do not throw', () => {
    const r = new TerminalRenderer();
    expect(() => r.clear()).not.toThrow();
    expect(() => r.drawBuffer([])).not.toThrow();
  });

  it('onResize registers a handler without throwing', () => {
    const r = new TerminalRenderer();
    expect(() => r.onResize(() => {})).not.toThrow();
  });
});
