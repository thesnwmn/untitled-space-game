import type { InputHandler, GameContext, CharBuffer, MiniGameResult, MiniGameViewport, GameAction } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import type { PlayerState } from '../player-state';
import { BaseMiniGameScene } from './base-mini-game-scene';
import { updatePhysics } from '../mini-games/landing/physics';
import { generateTerrain, detectCollision, renderTerrain } from '../mini-games/landing/terrain';
import type { TerrainColumn, LandingPhysicsState, LandingPhysicsConfig } from '../mini-games/landing/types';
import { getGameBalance } from '../world/world-data';

const SPRITE_WIDTH = 3;
const SPRITE_HEIGHT = 2;

export class SurfaceLandingMiniGameScene extends BaseMiniGameScene {
  private readonly _gravityAccel: number;
  private readonly _airResistance: number;
  private readonly _thrustForce: number;
  private readonly _maxSafeSpeed: number;
  private readonly _crashSpeed: number;
  private readonly _offPadScoreMultiplier: number;
  private readonly _padWidth: number;
  private readonly _destId: string;

  private _ship: LandingPhysicsState = { x: 0, y: 0, vx: 0, vy: 1 };
  private _heldKeys = new Set<GameAction>();
  private _lastActionTime = 0;
  private readonly _actionTimeoutMs = 200;
  private _terrain: TerrainColumn[] | null = null;
  private _viewport: MiniGameViewport | null = null;
  private _landed = false;

  constructor(
    input: InputHandler,
    context: GameContext,
    player: PlayerState,
    onComplete?: (result: MiniGameResult) => void,
  ) {
    super(input, context, player, { navOptions: [], title: 'LANDING', onComplete });

    this._destId = player.destinationId ?? '';
    const { surface } = getGameBalance().miniGames;
    this._gravityAccel = surface.gravityAccel;
    this._airResistance = surface.airResistance;
    this._thrustForce = surface.thrustForce;
    this._maxSafeSpeed = surface.maxSafeSpeed;
    this._crashSpeed = surface.crashSpeed;
    this._offPadScoreMultiplier = surface.offPadScoreMultiplier;
    this._padWidth = surface.padWidth;
  }

  protected override handleAction(action: GameAction): void {
    super.handleAction(action);

    if (action === 'MENU') {
      if (!this._landed) {
        this._landed = true;
        this.complete({ outcome: 'skipped' });
      }
      return;
    }

    if (action === 'UP' || action === 'DOWN' || action === 'LEFT' || action === 'RIGHT') {
      this._heldKeys.add(action);
      this._lastActionTime = performance.now();
    }
  }

  public override update(dt: number): void {
    super.update(dt);

    if (this._landed || !this._terrain || !this._viewport) return;

    const dtSec = dt / 1000;
    this._clearExpiredKeys();

    const config: LandingPhysicsConfig = {
      gravity: this._gravityAccel,
      airResistance: this._airResistance,
      thrustForce: this._thrustForce,
    };

    const thrust = {
      up: this._heldKeys.has('UP'),
      down: this._heldKeys.has('DOWN'),
      left: this._heldKeys.has('LEFT'),
      right: this._heldKeys.has('RIGHT'),
    };

    this._ship = updatePhysics(this._ship, thrust, config, this._viewport.width, SPRITE_WIDTH, dtSec);

    const shipBottom = this._ship.y + (SPRITE_HEIGHT - 1);
    if (detectCollision(this._ship.x, shipBottom, this._terrain)) {
      this._land();
    }
  }

  private _land(): void {
    if (this._landed) return;
    this._landed = true;

    const speed = Math.hypot(this._ship.vx, this._ship.vy);
    const speedScore = Math.max(0, Math.min(1,
      1 - (speed - this._maxSafeSpeed) / (this._crashSpeed - this._maxSafeSpeed),
    ));

    const centerCol = Math.floor(this._ship.x) + 1;
    const terrain = this._terrain!;
    const onPad = centerCol >= 0 && centerCol < terrain.length && terrain[centerCol].isPad;

    const padScore = onPad ? 1.0 : this._offPadScoreMultiplier;
    const score = Math.round(speedScore * padScore * 100);

    this.complete({ outcome: 'completed', result: { score, speed, onPad } });
  }

  private _clearExpiredKeys(): void {
    if (performance.now() - this._lastActionTime > this._actionTimeoutMs) {
      this._heldKeys.clear();
    }
  }

  protected renderGame(buffer: CharBuffer, viewport: MiniGameViewport): void {
    if (!this._terrain) {
      this._terrain = generateTerrain(this._destId, viewport.width, viewport.height, this._padWidth, 'planet');
      this._ship = {
        x: (viewport.width - SPRITE_WIDTH) / 2,
        y: 1,
        vx: 0,
        vy: 1,
      };
    }
    this._viewport = viewport;

    renderTerrain(buffer, this._terrain, viewport.top, viewport.left, viewport.height, 'planet');
    this._renderShip(buffer, viewport);
    this._renderHUD(buffer, viewport);
  }

  private _renderShip(buffer: CharBuffer, viewport: MiniGameViewport): void {
    const col = viewport.left + Math.round(this._ship.x);
    const row = viewport.top + Math.round(this._ship.y);

    const sprite = [
      ['-', 'v', '-'],
      ['(', '+', ')'],
    ] as const;

    for (let r = 0; r < sprite.length; r++) {
      for (let c = 0; c < sprite[r].length; c++) {
        const bufRow = row + r;
        const bufCol = col + c;
        if (bufRow < 0 || bufRow >= buffer.length) continue;
        if (bufCol < 0 || bufCol >= (buffer[bufRow]?.length ?? 0)) continue;
        buffer[bufRow][bufCol] = { char: sprite[r][c], fg: 'bright-green', bg: 'black' };
      }
    }
  }

  private _renderHUD(buffer: CharBuffer, viewport: MiniGameViewport): void {
    const speed = Math.hypot(this._ship.vx, this._ship.vy);
    const speedStr = `SPD:${speed.toFixed(1)}`;
    const col = viewport.left + viewport.width - speedStr.length;
    writeText(buffer, viewport.top + 1, col, speedStr, 'white', 'black');

    if (speed > this._maxSafeSpeed) {
      const warnStr = '!! FAST';
      const warnCol = viewport.left + viewport.width - warnStr.length;
      writeText(buffer, viewport.top + 2, warnCol, warnStr, 'bright-yellow', 'black');
    }
  }
}
