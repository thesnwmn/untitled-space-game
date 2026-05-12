import { describe, it, expect } from 'vitest';
import { DOMInputHandler } from '../platform/dom/DOMInputHandler';
import type { GameAction } from '../shared/types';

function fireKey(key: string, cancelable = false): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable });
  document.dispatchEvent(event);
  return event;
}

describe('DOMInputHandler', () => {
  it('maps all specified keys to the correct GameActions', () => {
    const h = new DOMInputHandler();
    const received: GameAction[] = [];
    h.onAction((a) => received.push(a));
    h.connect();

    const cases: [string, GameAction][] = [
      ['ArrowUp', 'UP'],
      ['ArrowDown', 'DOWN'],
      ['ArrowLeft', 'LEFT'],
      ['ArrowRight', 'RIGHT'],
      ['PageUp', 'PAGE_UP'],
      ['PageDown', 'PAGE_DOWN'],
      ['Enter', 'SELECT'],
      ['Escape', 'BACK'],
      ['p', 'PAUSE'],
      ['P', 'PAUSE'],
    ];
    for (const [key] of cases) fireKey(key);
    h.disconnect();

    expect(received).toEqual(cases.map(([, a]) => a));
  });

  it('calls all registered onAction handlers independently', () => {
    const h = new DOMInputHandler();
    const r1: GameAction[] = [];
    const r2: GameAction[] = [];
    h.onAction((a) => r1.push(a));
    h.onAction((a) => r2.push(a));
    h.connect();
    fireKey('Enter');
    h.disconnect();

    expect(r1).toEqual(['SELECT']);
    expect(r2).toEqual(['SELECT']);
  });

  it('calls preventDefault for arrow and page keys', () => {
    const h = new DOMInputHandler();
    h.onAction(() => {});
    h.connect();

    for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown']) {
      expect(fireKey(key, true).defaultPrevented, `${key} should prevent default`).toBe(true);
    }
    for (const key of ['Enter', 'Escape', 'p', 'P']) {
      expect(fireKey(key, true).defaultPrevented, `${key} should not prevent default`).toBe(false);
    }

    h.disconnect();
  });

  it('does not fire actions after disconnect', () => {
    const h = new DOMInputHandler();
    const received: GameAction[] = [];
    h.onAction((a) => received.push(a));
    h.connect();
    fireKey('Enter');
    h.disconnect();
    fireKey('Enter');

    expect(received).toEqual(['SELECT']);
  });

  it('ignores unmapped keys', () => {
    const h = new DOMInputHandler();
    const received: GameAction[] = [];
    h.onAction((a) => received.push(a));
    h.connect();
    fireKey('a');
    fireKey(' ');
    fireKey('Tab');
    h.disconnect();

    expect(received).toEqual([]);
  });
});
