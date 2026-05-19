import { describe, it, expect, vi } from 'vitest';
import { AsteroidLandingMiniGameScene } from './asteroid-landing-mini-game-scene';
import type { InputHandler, GameAction, GameContext, MiniGameResult } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';
import { generateTerrain, detectCollision } from '../mini-games/landing/terrain';
import { updatePhysics } from '../mini-games/landing/physics';

class MockInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  onAction(h: (action: GameAction) => void): void { this.actionHandlers.push(h); }
  fireAction(action: GameAction): void { for (const h of this.actionHandlers) h(action); }
}

const ctx: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

function makeBuffer(w: number, h: number) {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as const, bg: 'black' as const }))
  );
}

function makeScene(onComplete?: (result: MiniGameResult) => void): {
  scene: AsteroidLandingMiniGameScene;
  input: MockInputHandler;
} {
  const input = new MockInputHandler();
  const player = makePlayer({ destinationId: 'asteroid-alpha' });
  const scene = new AsteroidLandingMiniGameScene(input, ctx, player, onComplete);
  return { scene, input };
}

function initScene(scene: AsteroidLandingMiniGameScene): void {
  const buf = makeBuffer(40, 30);
  scene.render(buf);
}

describe('AsteroidLandingMiniGameScene', () => {
  describe('physics — no gravity', () => {
    it('vertical velocity unchanged without thrust', () => {
      const state = { x: 10, y: 5, vx: 0, vy: 2 };
      const config = { gravity: 0, airResistance: 1.0, thrustForce: 8 };
      const next = updatePhysics(state, { up: false, down: false, left: false, right: false }, config, 40, 3, 1);
      expect(next.vy).toBe(state.vy);
    });

    it('vertical position changes at constant velocity', () => {
      const state = { x: 10, y: 5, vx: 0, vy: 2 };
      const config = { gravity: 0, airResistance: 1.0, thrustForce: 8 };
      const next = updatePhysics(state, { up: false, down: false, left: false, right: false }, config, 40, 3, 1);
      expect(next.y).toBe(state.y + state.vy);
    });
  });

  describe('physics — no air resistance', () => {
    it('horizontal velocity unchanged without thrust', () => {
      const state = { x: 10, y: 5, vx: 5, vy: 0 };
      const config = { gravity: 0, airResistance: 1.0, thrustForce: 8 };
      const next = updatePhysics(state, { up: false, down: false, left: false, right: false }, config, 40, 3, 1);
      expect(next.vx).toBe(state.vx);
    });

    it('horizontal position persists at constant velocity', () => {
      const state = { x: 10, y: 5, vx: 5, vy: 0 };
      const config = { gravity: 0, airResistance: 1.0, thrustForce: 8 };
      const next = updatePhysics(state, { up: false, down: false, left: false, right: false }, config, 40, 3, 1);
      expect(next.x).toBe(state.x + state.vx);
    });
  });

  describe('score — on pad at maxSafeSpeed', () => {
    it('returns score 100', () => {
      const cb = vi.fn();
      const { scene } = makeScene(cb);
      initScene(scene);

      const maxSafeSpeed = (scene as any)._maxSafeSpeed as number;
      const terrain = (scene as any)._terrain as Array<{ surfaceRow: number; isPad: boolean }>;
      // Find the first pad column; ship center = floor(x)+1 should land on it
      const padIdx = terrain.findIndex(tc => tc.isPad);
      const x = padIdx - 1; // center col = padIdx
      const surfaceRow = terrain[padIdx].surfaceRow;

      // Place ship bottom exactly at terrain surface
      (scene as any)._ship = { x, y: surfaceRow - 1, vx: 0, vy: maxSafeSpeed };
      (scene as any)._viewport = { top: 0, left: 0, width: 40, height: 30 };

      scene.update(1);

      expect(cb).toHaveBeenCalled();
      const result = cb.mock.calls[0][0];
      expect(result.outcome).toBe('completed');
      expect(result.result.score).toBe(100);
      expect(result.result.onPad).toBe(true);
    });
  });

  describe('score — off pad at maxSafeSpeed', () => {
    it('returns offPadScoreMultiplier * 100', () => {
      const cb = vi.fn();
      const { scene } = makeScene(cb);
      initScene(scene);

      const maxSafeSpeed = (scene as any)._maxSafeSpeed as number;
      const offPadMult = (scene as any)._offPadScoreMultiplier as number;
      const terrain = (scene as any)._terrain as Array<{ surfaceRow: number; isPad: boolean }>;
      // Find a non-pad column
      const nonPadIdx = terrain.findIndex(tc => !tc.isPad);
      const x = Math.max(0, nonPadIdx - 1);
      const surfaceRow = terrain[Math.min(nonPadIdx, terrain.length - 1)].surfaceRow;

      (scene as any)._ship = { x, y: surfaceRow - 1, vx: 0, vy: maxSafeSpeed };
      (scene as any)._viewport = { top: 0, left: 0, width: 40, height: 30 };

      scene.update(1);

      expect(cb).toHaveBeenCalled();
      const result = cb.mock.calls[0][0];
      expect(result.outcome).toBe('completed');
      expect(result.result.score).toBe(Math.round(offPadMult * 100));
      expect(result.result.onPad).toBe(false);
    });
  });

  describe('score — at or above crashSpeed', () => {
    it('returns score 0', () => {
      const cb = vi.fn();
      const { scene } = makeScene(cb);
      initScene(scene);

      const crashSpeed = (scene as any)._crashSpeed as number;
      const terrain = (scene as any)._terrain as Array<{ surfaceRow: number; isPad: boolean }>;
      const surfaceRow = terrain[0].surfaceRow;

      (scene as any)._ship = { x: 0, y: surfaceRow - 1, vx: 0, vy: crashSpeed };
      (scene as any)._viewport = { top: 0, left: 0, width: 40, height: 30 };

      scene.update(1);

      expect(cb).toHaveBeenCalled();
      const result = cb.mock.calls[0][0];
      expect(result.outcome).toBe('completed');
      expect(result.result.score).toBe(0);
    });
  });

  describe('MENU → skipped outcome', () => {
    it('calls complete with skipped immediately', () => {
      const cb = vi.fn();
      const { scene, input } = makeScene(cb);
      initScene(scene);

      input.fireAction('MENU');

      expect(cb).toHaveBeenCalledOnce();
      expect(cb.mock.calls[0][0].outcome).toBe('skipped');
    });

    it('does not call complete twice', () => {
      const cb = vi.fn();
      const { scene, input } = makeScene(cb);
      initScene(scene);

      input.fireAction('MENU');
      input.fireAction('MENU');

      expect(cb).toHaveBeenCalledOnce();
    });
  });

  describe('terrain reproducibility', () => {
    it('generates identical terrain for the same destination seed', () => {
      const t1 = generateTerrain('asteroid-alpha', 40, 30, 6, 'asteroid');
      const t2 = generateTerrain('asteroid-alpha', 40, 30, 6, 'asteroid');
      expect(t1).toEqual(t2);
    });

    it('generates different terrain for different seeds', () => {
      const t1 = generateTerrain('asteroid-alpha', 40, 30, 6, 'asteroid');
      const t2 = generateTerrain('asteroid-beta', 40, 30, 6, 'asteroid');
      expect(t1).not.toEqual(t2);
    });

    it('contains exactly one flat pad region', () => {
      const terrain = generateTerrain('asteroid-alpha', 40, 30, 6, 'asteroid');
      const padCols = terrain.filter(tc => tc.isPad);
      expect(padCols.length).toBe(6);
      const padSurfaceRows = new Set(padCols.map(tc => tc.surfaceRow));
      expect(padSurfaceRows.size).toBe(1);
    });
  });

  describe('collision detection', () => {
    it('detects collision when ship bottom reaches terrain surface row', () => {
      const terrain = generateTerrain('test', 40, 30, 6, 'asteroid');
      const col = 5;
      const surfaceRow = terrain[col].surfaceRow;
      const shipX = col - 1;
      const hit = detectCollision(shipX, surfaceRow, terrain);
      expect(hit).toBe(true);
    });

    it('no collision when ship is above terrain', () => {
      const terrain = generateTerrain('test', 40, 30, 6, 'asteroid');
      const col = 5;
      const surfaceRow = terrain[col].surfaceRow;
      const shipX = col - 1;
      const hit = detectCollision(shipX, surfaceRow - 2, terrain);
      expect(hit).toBe(false);
    });
  });
});
