import { describe, it, expect } from 'vitest';
import { DOMRenderer } from '../platform/dom/DOMRenderer';
import { DOMInputHandler } from '../platform/dom/DOMInputHandler';
import { TerminalRenderer } from '../platform/terminal/TerminalRenderer';
import { TerminalInputHandler } from '../platform/terminal/TerminalInputHandler';
import { MAX_GRID_WIDTH, MAX_GRID_HEIGHT } from '../shared/types';

describe('DOMRenderer', () => {
  it('returns correct grid dimensions', () => {
    const r = new DOMRenderer();
    expect(r.getWidth()).toBe(MAX_GRID_WIDTH);
    expect(r.getHeight()).toBe(MAX_GRID_HEIGHT);
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

  it('onResize handlers are called with numeric dimensions when resize fires', () => {
    const r = new DOMRenderer();
    let receivedW: number | undefined;
    let receivedH: number | undefined;
    r.onResize((w, h) => { receivedW = w; receivedH = h; });
    window.dispatchEvent(new Event('resize'));
    // debounce is 100ms — advance timers
    return new Promise<void>(resolve => setTimeout(() => {
      expect(typeof receivedW).toBe('number');
      expect(typeof receivedH).toBe('number');
      resolve();
    }, 150));
  });
});

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

describe('DOMInputHandler', () => {
  it('onAction and onTap are callable', () => {
    const h = new DOMInputHandler();
    expect(() => h.onAction(() => {})).not.toThrow();
    expect(() => h.onTap?.(() => {})).not.toThrow();
  });
});

describe('TerminalInputHandler', () => {
  it('onAction is callable', () => {
    const h = new TerminalInputHandler();
    expect(() => h.onAction(() => {})).not.toThrow();
  });
});
