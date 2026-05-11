import { describe, it, expect } from 'vitest';
import { DOMRenderer } from '../platform/dom/DOMRenderer';
import { DOMInputHandler } from '../platform/dom/DOMInputHandler';
import { TerminalRenderer } from '../platform/terminal/TerminalRenderer';
import { TerminalInputHandler } from '../platform/terminal/TerminalInputHandler';

const GRID_WIDTH = 40;
const GRID_HEIGHT = 60;

describe('DOMRenderer', () => {
  it('returns correct grid dimensions', () => {
    const r = new DOMRenderer();
    expect(r.getWidth()).toBe(GRID_WIDTH);
    expect(r.getHeight()).toBe(GRID_HEIGHT);
  });

  it('drawBuffer and clear do not throw', () => {
    const r = new DOMRenderer();
    expect(() => r.clear()).not.toThrow();
    expect(() => r.drawBuffer([])).not.toThrow();
  });
});

describe('TerminalRenderer', () => {
  it('returns correct grid dimensions', () => {
    const r = new TerminalRenderer();
    expect(r.getWidth()).toBe(GRID_WIDTH);
    expect(r.getHeight()).toBe(GRID_HEIGHT);
  });

  it('drawBuffer and clear do not throw', () => {
    const r = new TerminalRenderer();
    expect(() => r.clear()).not.toThrow();
    expect(() => r.drawBuffer([])).not.toThrow();
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
