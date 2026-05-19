import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DockingMiniGameScene } from './docking-mini-game-scene';
import type { InputHandler, GameAction, GameContext, MiniGameResult, TouchTrackHandlers } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';

class MockInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  onAction(h: (action: GameAction) => void): void { this.actionHandlers.push(h); }
  fireAction(action: GameAction): void {
    for (const h of this.actionHandlers) h(action);
  }
}

class MockTouchInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  private touchHandlers: TouchTrackHandlers | null = null;

  onAction(h: (action: GameAction) => void): void { this.actionHandlers.push(h); }
  onTouchTrack(handlers: TouchTrackHandlers): void { this.touchHandlers = handlers; }

  fireAction(action: GameAction): void {
    for (const h of this.actionHandlers) h(action);
  }
  touchStart(col: number, row: number, id: number): void { this.touchHandlers?.start(col, row, id); }
  touchMove(col: number, row: number, id: number): void { this.touchHandlers?.move(col, row, id); }
  touchEnd(id: number): void { this.touchHandlers?.end(id); }
}

const ctx: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };
const touchCtx: GameContext = { environment: 'browser', primaryInput: 'touch', debug: false };

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
      expect((scene as any).heldKeys).toBeDefined();
    });
  });

  describe('joystick (touch) controls', () => {
    function makeTouchScene(): { scene: DockingMiniGameScene; input: MockTouchInputHandler } {
      const input = new MockTouchInputHandler();
      const player = makePlayer();
      player.dock('elysium-station');
      const scene = new DockingMiniGameScene(input, touchCtx, player);
      return { scene, input };
    }

    it('dragging up past dead zone sets UP in heldKeys', () => {
      const { scene, input } = makeTouchScene();
      input.touchStart(16, 10, 1);
      input.touchMove(16, 8, 1);   // dRow = -2, past dead zone of 1
      scene.update(16);
      expect((scene as any).heldKeys.has('UP')).toBe(true);
    });

    it('dragging down past dead zone sets DOWN in heldKeys', () => {
      const { scene, input } = makeTouchScene();
      input.touchStart(16, 10, 1);
      input.touchMove(16, 12, 1);  // dRow = +2
      scene.update(16);
      expect((scene as any).heldKeys.has('DOWN')).toBe(true);
    });

    it('dragging left past dead zone sets LEFT in heldKeys', () => {
      const { scene, input } = makeTouchScene();
      input.touchStart(16, 10, 1);
      input.touchMove(14, 10, 1);  // dCol = -2
      scene.update(16);
      expect((scene as any).heldKeys.has('LEFT')).toBe(true);
    });

    it('dragging right past dead zone sets RIGHT in heldKeys', () => {
      const { scene, input } = makeTouchScene();
      input.touchStart(16, 10, 1);
      input.touchMove(18, 10, 1);  // dCol = +2
      scene.update(16);
      expect((scene as any).heldKeys.has('RIGHT')).toBe(true);
    });

    it('movement within dead zone sets no direction', () => {
      const { scene, input } = makeTouchScene();
      input.touchStart(16, 10, 1);
      input.touchMove(17, 10, 1);  // dCol = +1, exactly at dead zone boundary
      scene.update(16);
      expect((scene as any).heldKeys.size).toBe(0);
    });

    it('touch end clears heldKeys', () => {
      const { scene, input } = makeTouchScene();
      input.touchStart(16, 10, 1);
      input.touchMove(16, 8, 1);
      scene.update(16);
      expect((scene as any).heldKeys.has('UP')).toBe(true);
      input.touchEnd(1);
      expect((scene as any).heldKeys.size).toBe(0);
    });

    it('second touch id does not move joystick started by first id', () => {
      const { scene, input } = makeTouchScene();
      input.touchStart(16, 10, 1);
      input.touchMove(16, 8, 2);  // different id
      scene.update(16);
      expect((scene as any).heldKeys.size).toBe(0);
    });

    it('touch start in header rows (0-2) is ignored', () => {
      const { scene, input } = makeTouchScene();
      for (const headerRow of [0, 1, 2]) {
        input.touchStart(16, headerRow, 1);
        input.touchMove(16, headerRow - 1, 1);
        scene.update(16);
        expect((scene as any)._joystick, `row ${headerRow} should be rejected`).toBeNull();
        input.touchEnd(1);
      }
    });

    it('touch start in content area (row >= 3) is accepted', () => {
      const { scene, input } = makeTouchScene();
      input.touchStart(16, 3, 1);
      scene.update(16);
      expect((scene as any)._joystick).not.toBeNull();
    });
  });
});
