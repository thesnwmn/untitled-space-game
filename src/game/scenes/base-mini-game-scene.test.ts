import { describe, it, expect, vi } from 'vitest';
import { BaseMiniGameScene } from './base-mini-game-scene';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext, MiniGameResult, MiniGameViewport, MiniGameOptions } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';
import { CONTENT_TOP } from '../ui/screen-chrome';
import { contentBottom } from '../ui/screen-chrome';

class MockInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  onAction(h: (action: GameAction) => void): void { this.actionHandlers.push(h); }
}

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

const ctx: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

class TestMiniGameScene extends BaseMiniGameScene {
  capturedViewport: MiniGameViewport | null = null;

  renderGame(buffer: CharBuffer, viewport: MiniGameViewport): void {
    void buffer;
    this.capturedViewport = viewport;
  }

  triggerComplete(result: MiniGameResult): void {
    this.complete(result);
  }
}

function makeScene(opts: Partial<MiniGameOptions> = {}): TestMiniGameScene {
  const options: MiniGameOptions = {
    navOptions: [],
    ...opts,
  };
  return new TestMiniGameScene(new MockInputHandler(), ctx, makePlayer(), options);
}

describe('BaseMiniGameScene', () => {
  describe('viewport', () => {
    it('equals full content area when no canvas size given', () => {
      const scene = makeScene();
      const buf = makeBuffer(40, 30);
      scene.render(buf);

      const top = CONTENT_TOP;
      const bottom = contentBottom(30, true);
      expect(scene.capturedViewport).toEqual({
        top,
        left: 0,
        width: 40,
        height: bottom - top,
      });
    });

    it('is centred when canvas size is smaller than content area', () => {
      const scene = makeScene({ canvasWidth: 20, canvasHeight: 10 });
      const buf = makeBuffer(40, 30);
      scene.render(buf);

      const top = CONTENT_TOP;
      const bottom = contentBottom(30, true);
      const contentH = bottom - top;
      const expectedLeft = Math.floor((40 - 20) / 2);
      const expectedTop = top + Math.floor((contentH - 10) / 2);

      expect(scene.capturedViewport).toEqual({
        top: expectedTop,
        left: expectedLeft,
        width: 20,
        height: 10,
      });
    });
  });

  describe('complete()', () => {
    it('calls onComplete once with the result', () => {
      const cb = vi.fn();
      const scene = makeScene({ onComplete: cb });
      const result: MiniGameResult = { outcome: 'skipped' };
      scene.triggerComplete(result);
      expect(cb).toHaveBeenCalledOnce();
      expect(cb).toHaveBeenCalledWith(result);
    });

    it('is a no-op on the second call', () => {
      const cb = vi.fn();
      const scene = makeScene({ onComplete: cb });
      scene.triggerComplete({ outcome: 'skipped' });
      scene.triggerComplete({ outcome: 'skipped' });
      expect(cb).toHaveBeenCalledOnce();
    });

    it('does not throw when no callback is registered', () => {
      const scene = makeScene();
      expect(() => scene.triggerComplete({ outcome: 'skipped' })).not.toThrow();
    });
  });
});
