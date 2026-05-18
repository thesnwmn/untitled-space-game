import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DockingMiniGameScene } from './docking-mini-game-scene';
import type { InputHandler, GameAction, GameContext, MiniGameResult } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';

class MockInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  onAction(h: (action: GameAction) => void): void { this.actionHandlers.push(h); }
  fireAction(action: GameAction): void {
    for (const h of this.actionHandlers) h(action);
  }
}

const ctx: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

function makeSceneWithInput(): { scene: DockingMiniGameScene; input: MockInputHandler; } {
  const input = new MockInputHandler();
  const player = makePlayer();
  player.dock('elysium-station');
  const scene = new DockingMiniGameScene(input, ctx, player);
  return { scene, input };
}

function makeScene(onComplete?: (result: MiniGameResult) => void): DockingMiniGameScene {
  const input = new MockInputHandler();
  const player = makePlayer();
  player.dock('elysium-station');
  return new DockingMiniGameScene(input, ctx, player, onComplete);
}

describe('DockingMiniGameScene', () => {
  describe('score calculation', () => {
    it('score is 100 when inside airlock radius', () => {
      const cb = vi.fn();
      const scene = makeScene(cb);

      (scene as any).state.shipX = (scene as any).state.airlockX;
      (scene as any).state.shipY = (scene as any).state.airlockY;

      (scene as any).state.timeRemaining = 0.001;
      scene.update(1);

      expect(cb).toHaveBeenCalled();
      const result = cb.mock.calls[0][0];
      expect(result.outcome).toBe('completed');
      expect(result.result.score).toBe(100);
    });

    it('score is high just outside airlock radius', () => {
      const cb = vi.fn();
      const scene = makeScene(cb);

      (scene as any).state.airlockX = (scene as any).state.shipX;
      (scene as any).state.airlockY = (scene as any).state.shipY + 2.0;
      (scene as any).state.timeRemaining = 0.001;
      scene.update(1);

      const result = cb.mock.calls[0][0];
      expect(result.result.score).toBeGreaterThan(50);
    });

    it('score decreases as distance increases', () => {
      const scores: number[] = [];

      for (let distance = 2.0; distance <= 10; distance += 2) {
        const cb = vi.fn();
        const scene = makeScene(cb);

        (scene as any).state.airlockX = (scene as any).state.shipX;
        (scene as any).state.airlockY = (scene as any).state.shipY + distance;
        (scene as any).state.timeRemaining = 0.001;
        scene.update(1);

        const result = cb.mock.calls[0][0];
        scores.push(result.result.score);
      }

      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
      }
    });

    it('score approaches 0 at very large distance', () => {
      const cb = vi.fn();
      const scene = makeScene(cb);

      (scene as any).state.shipX = 0;
      (scene as any).state.shipY = 0;
      (scene as any).state.airlockX = 100;
      (scene as any).state.airlockY = 100;
      (scene as any).state.timeRemaining = 0.001;
      scene.update(1);

      const result = cb.mock.calls[0][0];
      expect(result.result.score).toBeLessThan(10);
    });
  });

  describe('complete() callback', () => {
    it('is called when countdown reaches 0', () => {
      const cb = vi.fn();
      const scene = makeScene(cb);

      (scene as any).state.timeRemaining = 0.001;
      scene.update(1);

      expect(cb).toHaveBeenCalledOnce();
      expect(cb.mock.calls[0][0].outcome).toBe('completed');
    });

    it('is not called twice', () => {
      const cb = vi.fn();
      const scene = makeScene(cb);

      (scene as any).state.timeRemaining = 0.001;
      scene.update(1);
      scene.update(1);

      expect(cb).toHaveBeenCalledOnce();
    });

    it('is called with skipped outcome when MENU is pressed', () => {
      const cb = vi.fn();
      const input = new MockInputHandler();
      const player = makePlayer();
      player.dock('elysium-station');
      const scene = new DockingMiniGameScene(input, ctx, player, cb);

      input.fireAction('MENU');

      expect(cb).toHaveBeenCalledOnce();
      expect(cb.mock.calls[0][0].outcome).toBe('skipped');
    });

    it('MENU does not call callback twice', () => {
      const cb = vi.fn();
      const input = new MockInputHandler();
      const player = makePlayer();
      player.dock('elysium-station');
      const scene = new DockingMiniGameScene(input, ctx, player, cb);

      input.fireAction('MENU');
      input.fireAction('MENU');

      expect(cb).toHaveBeenCalledOnce();
    });
  });

  describe('input handling', () => {
    it('tracks held directions', () => {
      const scene = makeScene();
      const input = (scene as any) as any;

      // The scene should have a heldKeys set that tracks directions
      expect((scene as any).heldKeys).toBeDefined();
    });
  });
});
