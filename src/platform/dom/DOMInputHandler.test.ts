import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DOMInputHandler } from './DOMInputHandler';
import type { GameAction } from '../../shared/types';

describe('DOMInputHandler', () => {
  it('onAction and onTap are callable', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
    expect(() => h.onAction(() => {})).not.toThrow();
    expect(() => h.onTap?.(() => {})).not.toThrow();
  });
});

function fireKey(key: string, cancelable = false): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable });
  document.dispatchEvent(event);
  return event;
}

describe('DOMInputHandler', () => {
  it('maps all specified keys to the correct GameActions', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
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
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
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
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
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
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
    const received: GameAction[] = [];
    h.onAction((a) => received.push(a));
    h.connect();
    fireKey('Enter');
    h.disconnect();
    fireKey('Enter');

    expect(received).toEqual(['SELECT']);
  });

  it('ignores unmapped keys', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
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

describe('DOMInputHandler — touch', () => {
  let mockPre: HTMLElement;

  function fireTouchStart(touches: Array<{ identifier: number; clientX: number; clientY: number }>): TouchEvent {
    const event = new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      changedTouches: touches.map(t => ({ ...t, target: document.body })) as unknown as Touch[],
    });
    document.body.dispatchEvent(event);
    return event;
  }

  function fireTouchEnd(touches: Array<{ identifier: number; clientX: number; clientY: number }>): TouchEvent {
    const event = new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
      changedTouches: touches.map(t => ({ ...t, target: document.body })) as unknown as Touch[],
    });
    document.body.dispatchEvent(event);
    return event;
  }

  beforeEach(() => {
    mockPre = document.createElement('pre');
    mockPre.className = 'game-screen';
    mockPre.dataset['gridCols'] = '40';
    mockPre.dataset['gridRows'] = '60';
    vi.spyOn(mockPre, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 400, height: 600,
      right: 400, bottom: 600, x: 0, y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    document.body.appendChild(mockPre);
  });

  afterEach(() => {
    document.body.removeChild(mockPre);
    vi.restoreAllMocks();
  });

  it('calls onTap handlers with correct grid coordinates on single tap', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
    const taps: Array<[number, number]> = [];
    h.onTap((col, row) => taps.push([col, row]));
    h.connect();

    // cell size: 400/40=10 x 600/60=10; tap end at (106,156) → col=10, row=15
    fireTouchStart([{ identifier: 1, clientX: 105, clientY: 155 }]);
    fireTouchEnd([{ identifier: 1, clientX: 106, clientY: 156 }]);

    h.disconnect();
    expect(taps).toEqual([[10, 15]]);
  });

  it('calls all registered onTap handlers independently', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
    const r1: Array<[number, number]> = [];
    const r2: Array<[number, number]> = [];
    h.onTap((col, row) => r1.push([col, row]));
    h.onTap((col, row) => r2.push([col, row]));
    h.connect();

    fireTouchStart([{ identifier: 1, clientX: 50, clientY: 50 }]);
    fireTouchEnd([{ identifier: 1, clientX: 52, clientY: 51 }]);

    h.disconnect();
    expect(r1).toEqual([[5, 5]]);
    expect(r2).toEqual([[5, 5]]);
  });

  it('tap does not fire a GameAction', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
    const actions: GameAction[] = [];
    h.onAction((a) => actions.push(a));
    h.connect();

    fireTouchStart([{ identifier: 1, clientX: 100, clientY: 100 }]);
    fireTouchEnd([{ identifier: 1, clientX: 101, clientY: 101 }]);

    h.disconnect();
    expect(actions).toEqual([]);
  });

  it('swipe right fires RIGHT', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
    const actions: GameAction[] = [];
    h.onAction((a) => actions.push(a));
    h.connect();
    fireTouchStart([{ identifier: 1, clientX: 100, clientY: 100 }]);
    fireTouchEnd([{ identifier: 1, clientX: 160, clientY: 105 }]);
    h.disconnect();
    expect(actions).toEqual(['RIGHT']);
  });

  it('swipe left fires LEFT', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
    const actions: GameAction[] = [];
    h.onAction((a) => actions.push(a));
    h.connect();
    fireTouchStart([{ identifier: 1, clientX: 160, clientY: 100 }]);
    fireTouchEnd([{ identifier: 1, clientX: 100, clientY: 105 }]);
    h.disconnect();
    expect(actions).toEqual(['LEFT']);
  });

  it('swipe down fires DOWN', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
    const actions: GameAction[] = [];
    h.onAction((a) => actions.push(a));
    h.connect();
    fireTouchStart([{ identifier: 1, clientX: 100, clientY: 100 }]);
    fireTouchEnd([{ identifier: 1, clientX: 105, clientY: 160 }]);
    h.disconnect();
    expect(actions).toEqual(['DOWN']);
  });

  it('swipe up fires UP', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
    const actions: GameAction[] = [];
    h.onAction((a) => actions.push(a));
    h.connect();
    fireTouchStart([{ identifier: 1, clientX: 100, clientY: 160 }]);
    fireTouchEnd([{ identifier: 1, clientX: 105, clientY: 100 }]);
    h.disconnect();
    expect(actions).toEqual(['UP']);
  });

  it('swipe does not call onTap', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
    const taps: Array<[number, number]> = [];
    h.onTap((col, row) => taps.push([col, row]));
    h.connect();
    fireTouchStart([{ identifier: 1, clientX: 100, clientY: 100 }]);
    fireTouchEnd([{ identifier: 1, clientX: 160, clientY: 105 }]);
    h.disconnect();
    expect(taps).toEqual([]);
  });

  it('two-finger tap fires BACK', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
    const actions: GameAction[] = [];
    h.onAction((a) => actions.push(a));
    h.connect();

    fireTouchStart([
      { identifier: 1, clientX: 100, clientY: 100 },
      { identifier: 2, clientX: 200, clientY: 200 },
    ]);
    fireTouchEnd([
      { identifier: 1, clientX: 102, clientY: 101 },
      { identifier: 2, clientX: 201, clientY: 202 },
    ]);

    h.disconnect();
    expect(actions).toEqual(['BACK']);
  });

  it('no touch events after disconnect', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
    const taps: Array<[number, number]> = [];
    const actions: GameAction[] = [];
    h.onTap((col, row) => taps.push([col, row]));
    h.onAction((a) => actions.push(a));
    h.connect();
    h.disconnect();

    fireTouchStart([{ identifier: 1, clientX: 100, clientY: 100 }]);
    fireTouchEnd([{ identifier: 1, clientX: 101, clientY: 101 }]);
    fireTouchStart([{ identifier: 1, clientX: 100, clientY: 100 }]);
    fireTouchEnd([{ identifier: 1, clientX: 160, clientY: 100 }]);

    expect(taps).toEqual([]);
    expect(actions).toEqual([]);
  });

  it('calls preventDefault on touchstart and touchend', () => {
    const h = new DOMInputHandler({ environment: 'browser', primaryInput: 'keyboard', debug: false });
    h.connect();

    const startEvent = fireTouchStart([{ identifier: 1, clientX: 100, clientY: 100 }]);
    const endEvent = fireTouchEnd([{ identifier: 1, clientX: 101, clientY: 101 }]);

    h.disconnect();
    expect(startEvent.defaultPrevented).toBe(true);
    expect(endEvent.defaultPrevented).toBe(true);
  });
});
