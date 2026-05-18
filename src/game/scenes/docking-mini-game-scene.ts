import type { InputHandler, GameContext, CharBuffer, MiniGameResult, MiniGameViewport, GameAction } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import type { PlayerState } from '../player-state';
import { BaseMiniGameScene } from './base-mini-game-scene';

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
  private readonly countdownSeconds = 30;
  private readonly thrustForce = 8;
  private readonly maxVelocity = 6;
  private readonly driftIntervalMs = 3000;
  private readonly driftMaxDistanceChars = 8;
  private readonly driftSpeedCharsPerSec = 1.2;
  private readonly perfectRadiusChars = 5;
  private readonly airlockWidth = 5;
  private readonly airlockHeight = 3;

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
    super.handleTap(col, row);

    if (this.state.completed) return;

    const bufW = 40;
    const bufH = 30;
    const contentTop = 4;
    const contentH = bufH - contentTop - 2;

    const left = Math.floor((bufW - this.canvasWidth) / 2);
    const vpTop = contentTop + Math.floor((contentH - this.canvasHeight) / 2);

    const centerX = left + Math.floor(this.canvasWidth / 2);
    const centerY = vpTop + Math.floor(this.canvasHeight / 2);

    const upBtnRow = vpTop - 2;
    const downBtnRow = vpTop + this.canvasHeight + 1;
    const leftBtnCol = left - 3;
    const rightBtnCol = left + this.canvasWidth + 2;

    const tapDist = Math.max(Math.abs(col - centerX), Math.abs(row - centerY));
    const btnSize = 1;

    if (row === upBtnRow && Math.abs(col - centerX) <= btnSize) {
      this.handleAction('UP');
    } else if (row === downBtnRow && Math.abs(col - centerX) <= btnSize) {
      this.handleAction('DOWN');
    } else if (col === leftBtnCol && Math.abs(row - centerY) <= btnSize) {
      this.handleAction('LEFT');
    } else if (col === rightBtnCol && Math.abs(row - centerY) <= btnSize) {
      this.handleAction('RIGHT');
    }
  }

  public override update(dt: number): void {
    super.update(dt);

    const dtSeconds = dt / 1000;

    if (this.state.completed) return;

    this.clearExpiredActions();
    this.updateMovement(dtSeconds);
    this.updateAirlockDrift(dtSeconds);
    this.updateCountdown(dtSeconds);

    if (this.state.timeRemaining <= 0) {
      const distance = Math.hypot(
        this.state.shipX - this.state.airlockX,
        this.state.shipY - this.state.airlockY,
      );
      const rawScore = Math.max(0, Math.min(1, 1 / (1 + distance / this.perfectRadiusChars)));
      const score = Math.round(rawScore * 100);
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

    this.drawBorder(buffer, top, left, width, height);
    this.drawAirlock(buffer, top, left);
    this.drawShip(buffer, top, left);
    this.drawCountdown(buffer, top, left, width);
    this.drawDistance(buffer, top, left, height);
    this.drawControlButtons(buffer, top, left, width, height);
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
    const canvasRight = left + width;
    const canvasBottom = top + height;

    const upActive = this.heldKeys.has('UP');
    const downActive = this.heldKeys.has('DOWN');
    const leftActive = this.heldKeys.has('LEFT');
    const rightActive = this.heldKeys.has('RIGHT');

    const activeFg = 'bright-green';
    const inactiveFg = 'bright-black';

    const centerY = top + Math.floor(height / 2);
    const centerX = left + Math.floor(width / 2);

    const upBtnRow = top - 2;
    const downBtnRow = canvasBottom + 1;
    const leftBtnCol = left - 4;
    const rightBtnCol = canvasRight + 3;

    const btnWidth = 3;
    const btnText = (char: string) => `[${char}]`;

    if (upBtnRow >= 0 && centerX - 1 >= 0 && centerX + 1 < w) {
      const text = btnText('^');
      const col = centerX - 1;
      for (let i = 0; i < text.length; i++) {
        if (col + i < w) {
          buffer[upBtnRow][col + i] = { char: text[i], fg: upActive ? activeFg : inactiveFg, bg: 'black' };
        }
      }
    }

    if (downBtnRow < h && centerX - 1 >= 0 && centerX + 1 < w) {
      const text = btnText('v');
      const col = centerX - 1;
      for (let i = 0; i < text.length; i++) {
        if (col + i < w) {
          buffer[downBtnRow][col + i] = { char: text[i], fg: downActive ? activeFg : inactiveFg, bg: 'black' };
        }
      }
    }

    if (centerY >= 0 && centerY < h && leftBtnCol >= 0 && leftBtnCol + 2 < w) {
      const text = btnText('<');
      for (let i = 0; i < text.length; i++) {
        if (leftBtnCol + i >= 0 && leftBtnCol + i < w) {
          buffer[centerY][leftBtnCol + i] = { char: text[i], fg: leftActive ? activeFg : inactiveFg, bg: 'black' };
        }
      }
    }

    if (centerY >= 0 && centerY < h && rightBtnCol >= 0 && rightBtnCol + 2 < w) {
      const text = btnText('>');
      for (let i = 0; i < text.length; i++) {
        if (rightBtnCol + i < w) {
          buffer[centerY][rightBtnCol + i] = { char: text[i], fg: rightActive ? activeFg : inactiveFg, bg: 'black' };
        }
      }
    }
  }
}
