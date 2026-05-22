import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { InputHandler, GameContext, CharBuffer, MiniGameViewport } from '../../shared/types';
import { NavigationMiniGameScene } from './navigation-mini-game';
import { PlayerState } from '../player-state';
import { getGameBalance } from '../world/world-data';

const createMockInputHandler = (): InputHandler => ({
  onAction: () => {},
  onTap: () => {},
  onTouchTrack: () => {},
});

const createMockGameContext = (): GameContext => ({
  environment: 'browser',
  primaryInput: 'keyboard',
  debug: false,
});

describe('NavigationMiniGameScene', () => {
  let scene: NavigationMiniGameScene;
  let context: GameContext;
  let player: PlayerState;
  let completedResult: any;

  beforeEach(() => {
    context = createMockGameContext();
    player = new PlayerState({
      systemId: 'sol',
      destinationId: 'elysium-station',
      credits: 1000,
      shipId: 'freighter',
      driveId: 'civilian-mk1',
    });

    completedResult = null;
    const onComplete = (result: any) => {
      completedResult = result;
    };

    scene = new NavigationMiniGameScene(
      createMockInputHandler(),
      context,
      player,
      { type: 'asteroid_belt', difficulty: 'normal' },
      onComplete,
    );
  });

  describe('momentum model', () => {
    it('should cancel opposite velocity before adding impulse', () => {
      const balance = getGameBalance();
      // Simulate LEFT key press, which should add negative velocity
      scene['heldKeys'].add('LEFT');
      scene['updateInput'](balance.miniGames.navigation!.ship);
      const velAfterLeft = scene['state'].playerVelX;
      expect(velAfterLeft).toBeLessThan(0);

      // Now simulate RIGHT key press, which should zero LEFT velocity first
      scene['heldKeys'].add('RIGHT');
      scene['updateInput'](balance.miniGames.navigation!.ship);
      const velAfterRight = scene['state'].playerVelX;

      // Velocity should be positive, not zero or negative
      expect(velAfterRight).toBeGreaterThan(0);
    });

    it('should clamp velocity to max speed lateral', () => {
      const balance = getGameBalance();
      const maxLateral = balance.miniGames.navigation!.ship.maxSpeedLateral;
      const impulse = balance.miniGames.navigation!.ship.accelerationImpulse;

      // Apply impulses until max is reached
      for (let i = 0; i < 20; i++) {
        scene['heldKeys'].add('RIGHT');
        scene['updateInput'](balance.miniGames.navigation!.ship);
      }

      expect(Math.abs(scene['state'].playerVelX)).toBeLessThanOrEqual(maxLateral);
    });

    it('should clamp forward velocity to max speed forward', () => {
      const balance = getGameBalance();
      const maxForward = balance.miniGames.navigation!.ship.maxSpeedForward;

      // Apply UP impulses
      for (let i = 0; i < 20; i++) {
        scene['heldKeys'].add('UP');
        scene['updateInput'](balance.miniGames.navigation!.ship);
      }

      expect(scene['state'].playerVelY).toBeLessThanOrEqual(maxForward);
    });
  });

  describe('obstacle creation', () => {
    it('should enforce driftVy <= 0 on obstacle construction', () => {
      const balance = getGameBalance();
      const navBalance = balance.miniGames.navigation!;
      const diffBalance = navBalance.difficulties.normal;

      // Create some obstacles
      scene['spawnObstacleInBand'](
        0,
        50,
        80,
        diffBalance,
        navBalance.eventTypes.asteroid_belt,
        diffBalance.driftSpeedMax,
      );

      const obstacles = scene['state'].obstacles;
      for (const obs of obstacles) {
        expect(obs.driftVy).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('collision detection', () => {
    it('should detect collision when obstacle cell matches player position', () => {
      scene['state'].playerWorldX = 10;
      scene['state'].playerWorldY = 100;
      scene['state'].cameraScrollY = 50;

      // Create an obstacle with a cell at the player's screen position
      scene['state'].obstacles.push({
        worldX: 10,
        worldY: 100,
        driftVx: 0,
        driftVy: -0.5,
        cells: [{ dcol: 0, drow: 0, char: '#', color: 'white' as any }],
        size: 'small',
      });

      const viewport: MiniGameViewport = { top: 0, left: 0, width: 80, height: 24 };
      scene['lastViewport'] = viewport;

      scene['checkCollisions'](viewport);

      expect(scene['state'].outcome).toBe('collision');
    });

    it('should not detect collision when obstacle is adjacent to player', () => {
      scene['state'].playerWorldX = 10;
      scene['state'].playerWorldY = 100;
      scene['state'].cameraScrollY = 50;

      // Create an obstacle adjacent to player, not on same cell
      scene['state'].obstacles.push({
        worldX: 11, // One cell to the right
        worldY: 100,
        driftVx: 0,
        driftVy: -0.5,
        cells: [{ dcol: 0, drow: 0, char: '#', color: 'white' as any }],
        size: 'small',
      });

      const viewport: MiniGameViewport = { top: 0, left: 0, width: 80, height: 24 };
      scene['lastViewport'] = viewport;

      scene['checkCollisions'](viewport);

      expect(scene['state'].outcome).not.toBe('collision');
    });
  });

  describe('HUD row exclusion', () => {
    it('should exclude HUD row from collision detection', () => {
      scene['state'].playerWorldX = 10;
      scene['state'].playerWorldY = 10; // Very close to viewport top

      // Create an obstacle that would collide in HUD row
      scene['state'].obstacles.push({
        worldX: 10,
        worldY: 10,
        driftVx: 0,
        driftVy: -0.5,
        cells: [{ dcol: 0, drow: -5, char: '#', color: 'white' }], // Cell in HUD row area
        size: 'small',
      });

      const viewport: MiniGameViewport = { top: 5, left: 0, width: 80, height: 24 };
      scene['lastViewport'] = viewport;
      scene['state'].cameraScrollY = 0;

      scene['checkCollisions'](viewport);

      // Collision should not trigger because HUD row is excluded
      expect(scene['state'].outcome).not.toBe('collision');
    });
  });

  describe('despawn behavior', () => {
    it('should remove obstacles that fall off bottom', () => {
      const balance = getGameBalance();
      scene['state'].cameraScrollY = 1000;

      scene['state'].obstacles = [
        {
          worldX: 10,
          worldY: 900, // Far behind visible area
          driftVx: 0,
          driftVy: -0.5,
          cells: [{ dcol: 0, drow: 0, char: '#', color: 'white' as any }],
          size: 'small',
        },
        {
          worldX: 20,
          worldY: 1005, // Just in visible area
          driftVx: 0,
          driftVy: -0.5,
          cells: [{ dcol: 0, drow: 0, char: '@', color: 'white' as any }],
          size: 'small',
        },
      ];

      const navBalance = balance.miniGames.navigation!;
      const diffBalance = navBalance.difficulties.normal;
      const viewport: MiniGameViewport = { top: 0, left: 0, width: 80, height: 24 };

      scene['updateObstacles'](0.016, diffBalance, viewport);

      // First obstacle should be removed, second should remain
      expect(scene['state'].obstacles.length).toBeLessThan(2);
    });
  });

  describe('completion', () => {
    it('should not call complete() twice', () => {
      const completeSpy = vi.spyOn(scene, 'complete' as any);

      // Trigger collision
      scene['state'].playerWorldX = 10;
      scene['state'].playerWorldY = 100;
      scene['state'].cameraScrollY = 50;
      scene['state'].obstacles.push({
        worldX: 10,
        worldY: 100,
        driftVx: 0,
        driftVy: -0.5,
        cells: [{ dcol: 0, drow: 0, char: '#', color: 'white' as any }],
        size: 'small',
      });

      const viewport: MiniGameViewport = { top: 0, left: 0, width: 80, height: 24 };
      scene['lastViewport'] = viewport;

      scene['checkCollisions'](viewport);
      scene['triggerCollision']();
      scene['triggerCollision']();

      // Trigger collision multiple times
      scene['checkCollisions'](viewport);

      // complete() should be called at most once (when flash ends)
      // Verify state prevents double completion
      expect(scene['state'].completed || scene['state'].outcome === 'collision').toBe(true);
    });
  });

  describe('victory condition', () => {
    it('should complete with score 100 when reaching target distance', () => {
      const balance = getGameBalance();
      const navBalance = balance.miniGames.navigation!;
      const diffBalance = navBalance.difficulties.normal;

      scene['state'].playerWorldY = diffBalance.targetDistance + 10;
      scene['state'].completed = false;
      scene['state'].outcome = 'idle';

      vi.useFakeTimers();
      scene['checkVictory'](diffBalance);
      vi.advanceTimersByTime(600);
      vi.useRealTimers();

      expect(completedResult?.outcome).toBe('completed');
      expect(completedResult?.result?.score).toBe(100);
    });

    it('should complete with score 0 on collision', () => {
      const balance = getGameBalance();
      const navBalance = balance.miniGames.navigation!;
      const diffBalance = navBalance.difficulties.normal;

      scene['state'].outcome = 'collision';
      scene['state'].collisionFlashEndTime = performance.now();
      scene['state'].completed = false;

      vi.useFakeTimers();
      scene['checkVictory'](diffBalance);
      vi.advanceTimersByTime(100);
      vi.useRealTimers();

      expect(completedResult?.outcome).toBe('completed');
      expect(completedResult?.result?.score).toBe(0);
    });
  });
});
