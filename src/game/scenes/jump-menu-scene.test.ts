import { describe, it, expect, vi } from 'vitest';
import { JumpMenuScene } from './JumpMenuScene';
import { getRoutesFrom, getSystem } from '../world/world-data';
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

describe('JumpMenuScene', () => {
  describe('render', () => {
    it('does not throw for system id "sol"', () => {
      const input = new MockInputHandler();
      const scene = new JumpMenuScene(input, context, 'sol', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      expect(() => scene.render(buf)).not.toThrow();
    });

    it('renders JUMP as the title', () => {
      const input = new MockInputHandler();
      const scene = new JumpMenuScene(input, context, 'sol', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(allText).toContain('JUMP');
    });

    it('renders the current system name', () => {
      const input = new MockInputHandler();
      const scene = new JumpMenuScene(input, context, 'sol', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(allText).toContain('SOL');
    });

    it('renders route destination names from world data', () => {
      const input = new MockInputHandler();
      const scene = new JumpMenuScene(input, context, 'sol', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
      const routes = getRoutesFrom('sol');
      expect(routes.length).toBeGreaterThan(0);
      const targetId = routes[0].from === 'sol' ? routes[0].to : routes[0].from;
      const targetName = getSystem(targetId)!.name.toUpperCase();
      expect(allText).toContain(targetName);
    });
  });

  describe('keyboard interaction', () => {
    it('SELECT on the first item calls onJumpSelected with a valid system id', () => {
      const onJumpSelected = vi.fn();
      const input = new MockInputHandler();
      new JumpMenuScene(input, context, 'sol', onJumpSelected, vi.fn());
      input.triggerAction('SELECT');
      expect(onJumpSelected).toHaveBeenCalledTimes(1);
      const calledId = onJumpSelected.mock.calls[0][0] as string;
      expect(getSystem(calledId)).toBeDefined();
    });

    it('BACK calls onBack', () => {
      const onBack = vi.fn();
      const input = new MockInputHandler();
      new JumpMenuScene(input, context, 'sol', vi.fn(), onBack);
      input.triggerAction('BACK');
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('BACK does not call onJumpSelected', () => {
      const onJumpSelected = vi.fn();
      const input = new MockInputHandler();
      new JumpMenuScene(input, context, 'sol', onJumpSelected, vi.fn());
      input.triggerAction('BACK');
      expect(onJumpSelected).not.toHaveBeenCalled();
    });
  });
});
