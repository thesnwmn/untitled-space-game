import type { InputHandler, GameContext, CharBuffer, MiniGameResult, MiniGameViewport, GameAction } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import type { PlayerState } from '../player-state';
import { BaseMiniGameScene } from './base-mini-game-scene';
import { CONTENT_TOP } from '../ui/screen-chrome';

function hashStringToSeed(s: string): number {
  if (s.length === 0) return 2166136261;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h === 0 ? 1 : h;
}

function lcgRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const JOYSTICK_DEAD_ZONE = 1;

interface DockingState {
  shipX: number;
  shipY: number;
  shipVelX: number;
  shipVelY: number;
  airlockX: number;
  airlockY: number;
  driftTargetX: number;
  driftTargetY: number;
  driftTimer: number;
  timeRemaining: number;
  completed: boolean;
}

export class DockingMiniGameScene extends BaseMiniGameScene {
  private state: DockingState;
  private heldKeys = new Set<string>();
  private lastActionTime = 0;
  private actionTimeoutMs = 200;
  private rand: () => number;
  private readonly canvasWidth = 32;
  private readonly canvasHeight = 18;
  private readonly countdownSeconds = 15;
  private readonly thrustForce = 8;
  private readonly maxVelocity = 6;
  private readonly driftIntervalMs = 3000;
  private readonly driftMaxDistanceChars = 4;
  private readonly driftSpeedCharsPerSec = 0.8;
  private readonly perfectRadiusChars = 5;
  private readonly airlockWidth = 5;
  private readonly airlockHeight = 3;
  private lastViewport: { top: number; left: number; width: number; height: number } = { top: 0, left: 0, width: 32, height: 18 };
  private readonly _primaryInput: 'keyboard' | 'touch';
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
    const destId = player.destinationId ?? '';
    super(input, context, player, {
      navOptions: [],
      title: 'DOCKING',
      canvasWidth: 32,
      canvasHeight: 18,
      onComplete,
    });

    this._primaryInput = context.primaryInput;
    this.rand = lcgRand(hashStringToSeed(destId));

    const centerX = (this.canvasWidth - 1) / 2;
    const centerY = (this.canvasHeight - 1) / 2;

    this.state = {
      shipX: centerX,
      shipY: centerY,
      shipVelX: 0,
      shipVelY: 0,
      airlockX: centerX,
      airlockY: centerY,
      driftTargetX: centerX,
      driftTargetY: centerY,
      driftTimer: this.driftIntervalMs * (0.8 + 0.4 * this.rand()),
      timeRemaining: this.countdownSeconds,
      completed: false,
    };

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
            this.heldKeys.clear();
          }
        },
      });
    }
  }

  protected override renderContent(buffer: CharBuffer, top: number, bottom: number): void {
    const bufW = buffer[0]?.length ?? 0;
    const bufH = buffer.length;
    const contentH = bottom - top;

    const canvasWidth = this.canvasWidth;
    // In touch mode the joystick is rendered inside the canvas; no extra rows needed
    const canvasHeight = this._primaryInput === 'touch'
      ? this.canvasHeight
      : this.canvasHeight + 3;

    let left = Math.floor((bufW - canvasWidth) / 2);
    let vpTop = top + Math.floor((contentH - canvasHeight) / 2);

    const maxLeft = Math.max(0, bufW - this.canvasWidth);
    const maxTop = Math.max(0, bufH - this.canvasHeight);
    left = Math.max(0, Math.min(left, maxLeft));
    vpTop = Math.max(0, Math.min(vpTop, maxTop));

    this.renderGame(buffer, { top: vpTop, left, width: this.canvasWidth, height: this.canvasHeight });
  }

  protected override handleAction(action: GameAction): void {
    super.handleAction(action);

    if (action === 'MENU') {
      if (!this.state.completed) {
        this.state.completed = true;
        this.complete({ outcome: 'skipped' });
      }
      return;
    }

    if (action === 'UP' || action === 'DOWN' || action === 'LEFT' || action === 'RIGHT') {
      this.heldKeys.add(action);
      this.lastActionTime = performance.now();
    }
  }

  protected override handleTap(col: number, row: number): void {
    if (this.state.completed) {
      super.handleTap(col, row);
      return;
    }

    // In touch mode the joystick replaces the D-pad tap buttons
    if (this._primaryInput === 'touch') {
      super.handleTap(col, row);
      return;
    }

    const { top: vpTop, left, width, height } = this.lastViewport;
    const centerX = left + Math.floor(width / 2);
    const canvasBottom = vpTop + height;

    const upBtnRow = canvasBottom + 1;
    const downBtnRow = canvasBottom + 3;
    const leftBtnCol = centerX - 5;
    const rightBtnCol = centerX + 3;
    const centerBtnCol = centerX;

    if (row === upBtnRow && col >= centerBtnCol - 1 && col <= centerBtnCol + 1) {
      this.handleAction('UP');
    } else if (row === downBtnRow && col >= centerBtnCol - 1 && col <= centerBtnCol + 1) {
      this.handleAction('DOWN');
    } else if (col >= leftBtnCol && col <= leftBtnCol + 2 && row === upBtnRow + 1) {
      this.handleAction('LEFT');
    } else if (col >= rightBtnCol && col <= rightBtnCol + 2 && row === upBtnRow + 1) {
      this.handleAction('RIGHT');
    } else {
      super.handleTap(col, row);
    }
  }

  public override update(dt: number): void {
    super.update(dt);

    const dtSeconds = dt / 1000;

    if (this.state.completed) return;

    if (this._joystick) {
      const dCol = this._joystick.currentCol - this._joystick.centerCol;
      const dRow = this._joystick.currentRow - this._joystick.centerRow;
      this.heldKeys.clear();
      if (dRow < -JOYSTICK_DEAD_ZONE) this.heldKeys.add('UP');
      if (dRow > JOYSTICK_DEAD_ZONE) this.heldKeys.add('DOWN');
      if (dCol < -JOYSTICK_DEAD_ZONE) this.heldKeys.add('LEFT');
      if (dCol > JOYSTICK_DEAD_ZONE) this.heldKeys.add('RIGHT');
    } else {
      this.clearExpiredActions();
    }

    this.updateMovement(dtSeconds);
    this.updateAirlockDrift(dtSeconds);
    this.updateCountdown(dtSeconds);

    if (this.state.timeRemaining <= 0) {
      const distance = Math.hypot(
        this.state.shipX - this.state.airlockX,
        this.state.shipY - this.state.airlockY,
      );
      const airlockRadius = 1.5;
      const score = distance <= airlockRadius ? 100 : Math.round(Math.max(0, Math.min(1, 1 / (1 + (distance - airlockRadius) / this.perfectRadiusChars))) * 100);
      this.state.completed = true;
      this.complete({ outcome: 'completed', result: { score } });
    }
  }

  private updateMovement(dt: number): void {
    const s = this.state;

    if (this.heldKeys.has('UP')) s.shipVelY -= this.thrustForce * dt;
    if (this.heldKeys.has('DOWN')) s.shipVelY += this.thrustForce * dt;
    if (this.heldKeys.has('LEFT')) s.shipVelX -= this.thrustForce * dt;
    if (this.heldKeys.has('RIGHT')) s.shipVelX += this.thrustForce * dt;

    s.shipVelX = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, s.shipVelX));
    s.shipVelY = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, s.shipVelY));

    s.shipX += s.shipVelX * dt;
    s.shipY += s.shipVelY * dt;

    const margin = 0.5;
    s.shipX = Math.max(margin, Math.min(this.canvasWidth - 1 - margin, s.shipX));
    s.shipY = Math.max(margin, Math.min(this.canvasHeight - 1 - margin, s.shipY));
  }

  private updateAirlockDrift(dt: number): void {
    const s = this.state;
    const dx = s.driftTargetX - s.airlockX;
    const dy = s.driftTargetY - s.airlockY;
    const dist = Math.hypot(dx, dy);

    if (dist < 0.1) {
      const angle = this.rand() * 2 * Math.PI;
      const radius = this.rand() * this.driftMaxDistanceChars;
      const centerX = (this.canvasWidth - 1) / 2;
      const centerY = (this.canvasHeight - 1) / 2;
      s.driftTargetX = centerX + Math.cos(angle) * radius;
      s.driftTargetY = centerY + Math.sin(angle) * radius;
      s.driftTimer = this.driftIntervalMs * (0.8 + 0.4 * this.rand());
    } else {
      const moveDistance = this.driftSpeedCharsPerSec * dt;
      const moveRatio = Math.min(1, moveDistance / dist);
      s.airlockX += dx * moveRatio;
      s.airlockY += dy * moveRatio;
    }
  }

  private updateCountdown(dt: number): void {
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining - dt);
  }

  private clearExpiredActions(): void {
    const now = performance.now();
    if (now - this.lastActionTime > this.actionTimeoutMs) {
      this.heldKeys.clear();
    }
  }

  protected renderGame(buffer: CharBuffer, viewport: MiniGameViewport): void {
    const { top, left, width, height } = viewport;
    this.lastViewport = { top, left, width, height };

    this.drawBorder(buffer, top, left, width, height);
    this.drawAirlock(buffer, top, left);
    this.drawShip(buffer, top, left);
    this.drawCountdown(buffer, top, left, width);
    this.drawDistance(buffer, top, left, height);

    if (this._primaryInput === 'touch') {
      this._renderJoystick(buffer, viewport);
    } else {
      this.drawControlButtons(buffer, top, left, width, height);
    }
  }

  private _renderJoystick(buffer: CharBuffer, viewport: MiniGameViewport): void {
    const { top, left, width, height } = viewport;

    const safeWrite = (row: number, col: number, char: string, fg: CharBuffer[0][0]['fg']) => {
      if (row < 0 || row >= buffer.length || col < 0 || col >= (buffer[row]?.length ?? 0)) return;
      buffer[row][col] = { char, fg, bg: 'black' };
    };

    if (!this._joystick) {
      const hint = 'DRAG TO DOCK';
      const hintRow = top + height - 2;
      const hintCol = left + Math.floor((width - hint.length) / 2);
      writeText(buffer, hintRow, hintCol, hint, 'bright-black', 'black');
      return;
    }

    const { centerCol, centerRow, currentCol, currentRow } = this._joystick;
    const dCol = currentCol - centerCol;
    const dRow = currentRow - centerRow;
    const anyThrust = this.heldKeys.size > 0;

    safeWrite(centerRow, centerCol, 'o', anyThrust ? 'bright-white' : 'white');

    if (dRow < -JOYSTICK_DEAD_ZONE) safeWrite(centerRow - 2, centerCol, '^', 'bright-green');
    if (dRow > JOYSTICK_DEAD_ZONE)  safeWrite(centerRow + 2, centerCol, 'v', 'bright-green');
    if (dCol < -JOYSTICK_DEAD_ZONE) safeWrite(centerRow, centerCol - 2, '<', 'bright-green');
    if (dCol > JOYSTICK_DEAD_ZONE)  safeWrite(centerRow, centerCol + 2, '>', 'bright-green');
  }

  private drawBorder(buffer: CharBuffer, top: number, left: number, width: number, height: number): void {
    const right = left + width - 1;
    const bottom = top + height - 1;

    for (let col = left; col <= right; col++) {
      if (top < buffer.length && col < buffer[top].length) {
        buffer[top][col] = { char: '+', fg: 'white', bg: 'black' };
      }
      if (bottom < buffer.length && col < buffer[bottom].length) {
        buffer[bottom][col] = { char: '+', fg: 'white', bg: 'black' };
      }
    }

    for (let row = top + 1; row < bottom; row++) {
      if (row < buffer.length) {
        if (left < buffer[row].length) {
          buffer[row][left] = { char: '|', fg: 'white', bg: 'black' };
        }
        if (right < buffer[row].length) {
          buffer[row][right] = { char: '|', fg: 'white', bg: 'black' };
        }
      }
    }
  }

  private drawAirlock(buffer: CharBuffer, top: number, left: number): void {
    const centerCol = left + 1 + Math.round(this.state.airlockX);
    const centerRow = top + 1 + Math.round(this.state.airlockY);

    const startCol = centerCol - Math.floor(this.airlockWidth / 2);
    const startRow = centerRow - Math.floor(this.airlockHeight / 2);

    const airlockPattern = [
      ['+', '-', '+', '-', '+'],
      ['|', ' ', '+', ' ', '|'],
      ['+', '-', '+', '-', '+'],
    ];

    for (let r = 0; r < this.airlockHeight; r++) {
      for (let c = 0; c < this.airlockWidth; c++) {
        const row = startRow + r;
        const col = startCol + c;
        if (row >= top && row < top + this.canvasHeight && col >= left && col < left + this.canvasWidth) {
          if (row < buffer.length && col < buffer[row].length) {
            const char = airlockPattern[r][c];
            buffer[row][col] = { char, fg: 'bright-yellow', bg: 'black' };
          }
        }
      }
    }
  }

  private drawShip(buffer: CharBuffer, top: number, left: number): void {
    const col = left + 1 + Math.round(this.state.shipX);
    const row = top + 1 + Math.round(this.state.shipY);
    if (col >= left && col < left + this.canvasWidth && row >= top && row < top + this.canvasHeight) {
      if (row < buffer.length && col < buffer[row].length) {
        buffer[row][col] = { char: '(', fg: 'bright-green', bg: 'black' };
      }
      if (col + 1 < left + this.canvasWidth && row < buffer.length && col + 1 < buffer[row].length) {
        buffer[row][col + 1] = { char: '+', fg: 'bright-green', bg: 'black' };
      }
      if (col + 2 < left + this.canvasWidth && row < buffer.length && col + 2 < buffer[row].length) {
        buffer[row][col + 2] = { char: ')', fg: 'bright-green', bg: 'black' };
      }
    }
  }

  private drawCountdown(buffer: CharBuffer, top: number, left: number, width: number): void {
    const timeStr = `T: ${Math.ceil(this.state.timeRemaining)}`;
    const col = left + width - 1 - timeStr.length;
    const row = top + 1;
    writeText(buffer, row, col, timeStr, 'white', 'black');
  }

  private drawDistance(buffer: CharBuffer, top: number, left: number, height: number): void {
    const distance = Math.hypot(
      this.state.shipX - this.state.airlockX,
      this.state.shipY - this.state.airlockY,
    );
    const distStr = `DIST: ${distance.toFixed(1)}`;
    const row = top + height - 1;
    writeText(buffer, row, left + 2, distStr, 'white', 'black');
  }

  private drawControlButtons(buffer: CharBuffer, top: number, left: number, width: number, height: number): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;
    const canvasBottom = top + height;
    const centerX = left + Math.floor(width / 2);

    const upActive = this.heldKeys.has('UP');
    const downActive = this.heldKeys.has('DOWN');
    const leftActive = this.heldKeys.has('LEFT');
    const rightActive = this.heldKeys.has('RIGHT');

    const activeFg = 'bright-green';
    const inactiveFg = 'bright-black';
    const btnText = (char: string) => `[${char}]`;

    const upBtnRow = canvasBottom + 1;
    const midBtnRow = canvasBottom + 2;
    const downBtnRow = canvasBottom + 3;
    const leftBtnCol = centerX - 5;
    const rightBtnCol = centerX + 3;

    if (upBtnRow < h && centerX - 1 >= 0 && centerX + 1 < w) {
      const text = btnText('^');
      const col = centerX - 1;
      for (let i = 0; i < text.length; i++) {
        if (col + i >= 0 && col + i < w) {
          buffer[upBtnRow][col + i] = { char: text[i], fg: upActive ? activeFg : inactiveFg, bg: 'black' };
        }
      }
    }

    if (midBtnRow < h) {
      const text = btnText('<');
      for (let i = 0; i < text.length; i++) {
        if (leftBtnCol + i >= 0 && leftBtnCol + i < w) {
          buffer[midBtnRow][leftBtnCol + i] = { char: text[i], fg: leftActive ? activeFg : inactiveFg, bg: 'black' };
        }
      }

      const text2 = btnText('>');
      for (let i = 0; i < text2.length; i++) {
        if (rightBtnCol + i >= 0 && rightBtnCol + i < w) {
          buffer[midBtnRow][rightBtnCol + i] = { char: text2[i], fg: rightActive ? activeFg : inactiveFg, bg: 'black' };
        }
      }
    }

    if (downBtnRow < h && centerX - 1 >= 0 && centerX + 1 < w) {
      const text = btnText('v');
      const col = centerX - 1;
      for (let i = 0; i < text.length; i++) {
        if (col + i >= 0 && col + i < w) {
          buffer[downBtnRow][col + i] = { char: text[i], fg: downActive ? activeFg : inactiveFg, bg: 'black' };
        }
      }
    }
  }
}

