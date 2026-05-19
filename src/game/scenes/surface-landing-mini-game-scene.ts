import type { InputHandler, GameContext, CharBuffer, MiniGameResult, MiniGameViewport, GameAction } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import type { PlayerState } from '../player-state';
import { BaseMiniGameScene } from './base-mini-game-scene';
import { updatePhysics } from '../mini-games/landing/physics';
import { generateTerrain, detectCollision, renderTerrain } from '../mini-games/landing/terrain';
import type { TerrainColumn, LandingPhysicsState, LandingPhysicsConfig } from '../mini-games/landing/types';
import { getGameBalance } from '../world/world-data';
import { CONTENT_TOP } from '../ui/screen-chrome';

const SPRITE_WIDTH = 3;
const SPRITE_HEIGHT = 2;
const MAX_PHYSICS_STEP = 1 / 60;
const JOYSTICK_DEAD_ZONE = 1;

export class SurfaceLandingMiniGameScene extends BaseMiniGameScene {
  private readonly _primaryInput: 'keyboard' | 'touch';
  private readonly _gravityAccel: number;
  private readonly _airResistance: number;
  private readonly _thrustForce: number;
  private readonly _maxSafeSpeed: number;
  private readonly _crashSpeed: number;
  private readonly _offPadScoreMultiplier: number;
  private readonly _padWidth: number;
  private readonly _maxVerticalSpeed: number;
  private readonly _destId: string;

  private _ship: LandingPhysicsState = { x: 0, y: 0, vx: 0, vy: 1 };
  private _heldKeys = new Set<GameAction>();
  private _lastActionTime = 0;
  private readonly _actionTimeoutMs = 200;
  private _terrain: TerrainColumn[] | null = null;
  private _viewport: MiniGameViewport | null = null;
  private _landed = false;

  private _joystick: {
    centerCol: number;
    centerRow: number;
    currentCol: number;
    currentRow: number;
    id: number;
  } | null = null;

  constructor(
    input: InputHandler,
    context: GameContext,
    player: PlayerState,
    onComplete?: (result: MiniGameResult) => void,
  ) {
    super(input, context, player, { navOptions: [], title: 'LANDING', onComplete });

    this._destId = player.destinationId ?? '';
    this._primaryInput = context.primaryInput;
    const { surface } = getGameBalance().miniGames;
    this._gravityAccel = surface.gravityAccel;
    this._airResistance = surface.airResistance;
    this._thrustForce = surface.thrustForce;
    this._maxSafeSpeed = surface.maxSafeSpeed;
    this._crashSpeed = surface.crashSpeed;
    this._offPadScoreMultiplier = surface.offPadScoreMultiplier;
    this._padWidth = surface.padWidth;
    this._maxVerticalSpeed = surface.maxVerticalSpeed;

    if (input.onTouchTrack) {
      input.onTouchTrack({
        start: (col, row, id) => {
          if (row < CONTENT_TOP) return;
          this._joystick = { centerCol: col, centerRow: row, currentCol: col, currentRow: row, id };
        },
        move: (col, row, id) => {
          if (!this._joystick || this._joystick.id !== id) return;
          this._joystick.currentCol = col;
          this._joystick.currentRow = row;
        },
        end: (id) => {
          if (this._joystick?.id === id) {
            this._joystick = null;
            this._heldKeys.clear();
          }
        },
      });
    }
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

    // On touch, the joystick drives direction; ignore swipe-derived directional actions
    if (this._primaryInput === 'touch') return;

    if (action === 'UP' || action === 'DOWN' || action === 'LEFT' || action === 'RIGHT') {
      this._heldKeys.add(action);
      this._lastActionTime = performance.now();
    }
  }

  public override update(dt: number): void {
    super.update(dt);

    if (this._landed || !this._terrain || !this._viewport) return;

    // Derive heldKeys from joystick if active; otherwise expire keyboard keys
    if (this._joystick) {
      const dCol = this._joystick.currentCol - this._joystick.centerCol;
      const dRow = this._joystick.currentRow - this._joystick.centerRow;
      this._heldKeys.clear();
      if (dRow < -JOYSTICK_DEAD_ZONE) this._heldKeys.add('UP');
      if (dRow > JOYSTICK_DEAD_ZONE) this._heldKeys.add('DOWN');
      if (dCol < -JOYSTICK_DEAD_ZONE) this._heldKeys.add('LEFT');
      if (dCol > JOYSTICK_DEAD_ZONE) this._heldKeys.add('RIGHT');
    } else {
      this._clearExpiredKeys();
    }

    const config: LandingPhysicsConfig = {
      gravity: this._gravityAccel,
      airResistance: this._airResistance,
      thrustForce: this._thrustForce,
      maxVerticalSpeed: this._maxVerticalSpeed,
    };

    const thrust = {
      up: this._heldKeys.has('UP'),
      down: this._heldKeys.has('DOWN'),
      left: this._heldKeys.has('LEFT'),
      right: this._heldKeys.has('RIGHT'),
    };

    // Sub-step physics to prevent passing through terrain at high velocity
    let remaining = dt / 1000;
    while (remaining > 0 && !this._landed) {
      const step = Math.min(remaining, MAX_PHYSICS_STEP);
      remaining -= step;
      this._ship = updatePhysics(this._ship, thrust, config, this._viewport.width, SPRITE_WIDTH, step);
      const shipBottom = this._ship.y + (SPRITE_HEIGHT - 1);
      if (detectCollision(this._ship.x, shipBottom, this._terrain)) {
        const impactSpeed = Math.hypot(this._ship.vx, this._ship.vy);
        this._snapToSurface();
        this._land(impactSpeed);
        break;
      }
    }
  }

  private _snapToSurface(): void {
    if (!this._terrain) return;
    const shipLeft = Math.floor(this._ship.x);
    const shipRight = shipLeft + SPRITE_WIDTH - 1;
    let minSurface = Infinity;
    for (let col = shipLeft; col <= shipRight; col++) {
      if (col >= 0 && col < this._terrain.length) {
        minSurface = Math.min(minSurface, this._terrain[col].surfaceRow);
      }
    }
    if (minSurface < Infinity) {
      // Ship body (bottom row) rests at minSurface - 1; ship top at minSurface - SPRITE_HEIGHT
      this._ship = { ...this._ship, y: minSurface - SPRITE_HEIGHT, vx: 0, vy: 0 };
    }
  }

  private _land(impactSpeed?: number): void {
    if (this._landed) return;
    this._landed = true;

    const speed = impactSpeed ?? Math.hypot(this._ship.vx, this._ship.vy);
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
    this._renderJoystick(buffer, viewport);
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

  private _renderJoystick(buffer: CharBuffer, viewport: MiniGameViewport): void {
    if (this._primaryInput !== 'touch') return;

    if (!this._joystick) {
      // Hint when no touch active — place it just above the highest terrain point
      const hint = 'HOLD & DRAG TO THRUST';
      const minSurface = this._terrain
        ? Math.min(...this._terrain.map(tc => tc.surfaceRow))
        : viewport.height - 2;
      const hintRow = viewport.top + Math.max(0, minSurface - 2);
      const hintCol = viewport.left + Math.floor((viewport.width - hint.length) / 2);
      writeText(buffer, hintRow, hintCol, hint, 'bright-black', 'black');
      return;
    }

    const { centerCol, centerRow, currentCol, currentRow } = this._joystick;
    const dCol = currentCol - centerCol;
    const dRow = currentRow - centerRow;
    const anyThrust = this._heldKeys.size > 0;

    const safeWrite = (row: number, col: number, char: string, fg: typeof buffer[0][0]['fg']) => {
      if (row < 0 || row >= buffer.length || col < 0 || col >= (buffer[row]?.length ?? 0)) return;
      buffer[row][col] = { char, fg, bg: 'black' };
    };

    // Center marker
    safeWrite(centerRow, centerCol, 'o', anyThrust ? 'bright-white' : 'white');

    // Directional indicators around center
    if (dRow < -JOYSTICK_DEAD_ZONE) safeWrite(centerRow - 2, centerCol, '^', 'bright-green');
    if (dRow > JOYSTICK_DEAD_ZONE)  safeWrite(centerRow + 2, centerCol, 'v', 'bright-green');
    if (dCol < -JOYSTICK_DEAD_ZONE) safeWrite(centerRow, centerCol - 2, '<', 'bright-green');
    if (dCol > JOYSTICK_DEAD_ZONE)  safeWrite(centerRow, centerCol + 2, '>', 'bright-green');
  }
}
