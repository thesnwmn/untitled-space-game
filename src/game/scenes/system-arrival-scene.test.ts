import { describe, it, expect, vi } from 'vitest';
import { SystemArrivalScene } from './SystemArrivalScene';
import { getSystem } from '../world/world-data';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';

class MockInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  private tapHandlers: Array<(col: number, row: number) => void> = [];

  onAction(handler: (action: GameAction) => void): void {
    this.actionHandlers.push(handler);
  }

  onTap(handler: (col: number, row: number) => void): void {
    this.tapHandlers.push(handler);
  }

  triggerAction(action: GameAction): void {
    for (const h of this.actionHandlers) h(action);
  }
}

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

const context: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

describe('SystemArrivalScene', () => {
  describe('render', () => {
    it('does not throw for system id "alpha-centauri"', () => {
      const input = new MockInputHandler();
      const scene = new SystemArrivalScene(input, context, 'alpha-centauri', vi.fn());
      const buf = makeBuffer(40, 30);
      expect(() => scene.render(buf)).not.toThrow();
    });

    it('renders the system name as title', () => {
      const input = new MockInputHandler();
      const scene = new SystemArrivalScene(input, context, 'alpha-centauri', vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(allText).toContain('ALPHA CENTAURI');
    });

    it('renders security level info line', () => {
      const input = new MockInputHandler();
      const scene = new SystemArrivalScene(input, context, 'alpha-centauri', vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(allText).toContain('SECURITY:');
    });

    it('renders destination names from the system', () => {
      const input = new MockInputHandler();
      const scene = new SystemArrivalScene(input, context, 'alpha-centauri', vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
      const system = getSystem('alpha-centauri')!;
      expect(system.destinations.length).toBeGreaterThan(0);
      expect(allText).toContain('NEW HORIZON PORT');
    });
  });

  describe('keyboard interaction', () => {
    it('SELECT on the first item calls onDock with the correct destination id', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new SystemArrivalScene(input, context, 'alpha-centauri', onDock);
      input.triggerAction('SELECT');
      expect(onDock).toHaveBeenCalledTimes(1);
      const system = getSystem('alpha-centauri')!;
      expect(onDock).toHaveBeenCalledWith(system.destinations[0]);
    });

    it('SELECT on the second item calls onDock with the second destination id', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new SystemArrivalScene(input, context, 'alpha-centauri', onDock);
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      const system = getSystem('alpha-centauri')!;
      expect(onDock).toHaveBeenCalledWith(system.destinations[1]);
    });
  });
});
