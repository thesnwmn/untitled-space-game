import type { InputHandler, GameContext, CharBuffer, MiniGameResult, MiniGameViewport, GameAction, Color } from '../../shared/types';
import type { PlayerState } from '../player-state';
import { BaseMiniGameScene } from '../scenes/base-mini-game-scene';
import { CONTENT_TOP } from '../ui/screen-chrome';
import { getGameBalance } from '../world/world-data';

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

interface ObstacleCell {
  dcol: number;
  drow: number;
  char: string;
  color: Color;
}

interface Obstacle {
  worldX: number;
  worldY: number;
  driftVx: number;
  driftVy: number;
  cells: ObstacleCell[];
  size: 'large' | 'medium' | 'small';
}

interface NavigationState {
  playerWorldX: number;
  playerWorldY: number;
  playerVelX: number;
  playerVelY: number;
  cameraScrollY: number;
  obstacles: Obstacle[];
  spawnFrontierY: number;
  lastEdgeSpawnFrame: number;
  frameCount: number;
  completed: boolean;
  collisionFlashEndTime: number;
  outcome: 'idle' | 'collision' | 'victory';
}

type EventType = 'asteroid_belt' | 'space_debris' | 'space_storm';
type Difficulty = 'easy' | 'normal' | 'hard';

export class NavigationMiniGameScene extends BaseMiniGameScene {
  private state: NavigationState;
  private heldKeys = new Set<string>();
  private rand: () => number;
  private eventType: EventType;
  private difficulty: Difficulty;
  private lastViewport: { top: number; left: number; width: number; height: number } = { top: 0, left: 0, width: 80, height: 24 };
  private _joystick: { centerCol: number; centerRow: number; currentCol: number; currentRow: number; id: number } | null = null;
  private readonly _primaryInput: 'keyboard' | 'touch';

  constructor(
    input: InputHandler,
    context: GameContext,
    player: PlayerState,
    params: URLSearchParams | Record<string, string>,
    onComplete?: (result: MiniGameResult) => void,
  ) {
    super(input, context, player, {
      navOptions: [],
      title: 'NAVIGATION',
      onComplete,
    });

    this._primaryInput = context.primaryInput;

    let eventType: string | null = null;
    let difficulty: string | null = null;

    if (params instanceof URLSearchParams) {
      eventType = params.get('type');
      difficulty = params.get('difficulty');
    } else {
      eventType = params.type ?? null;
      difficulty = params.difficulty ?? null;
    }

    this.eventType = (eventType ?? 'asteroid_belt') as EventType;
    this.difficulty = (difficulty ?? 'normal') as Difficulty;

    const seed = hashStringToSeed(player.destinationId ?? '');
    this.rand = lcgRand(seed);

    const balance = getGameBalance();
    const navBalance = balance.miniGames.navigation as any;
    const diffBalance = navBalance.difficulties[this.difficulty];
    const targetDistance = diffBalance.targetDistance;

    this.state = {
      playerWorldX: 40, // center horizontally (assuming 80-char viewport)
      playerWorldY: 0,
      playerVelX: 0,
      playerVelY: 0,
      cameraScrollY: -15, // start camera showing player in lower third
      obstacles: [],
      spawnFrontierY: -20, // start spawning from top of viewport
      lastEdgeSpawnFrame: 0,
      frameCount: 0,
      completed: false,
      collisionFlashEndTime: 0,
      outcome: 'idle',
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
    }
  }

  public override update(dt: number): void {
    super.update(dt);

    if (this.state.completed) return;

    const dtSeconds = dt / 1000;
    const balance = getGameBalance();
    const navBalance = balance.miniGames.navigation as any;
    const diffBalance = navBalance.difficulties[this.difficulty];
    const shipBalance = navBalance.ship;

    // Handle joystick input
    if (this._joystick) {
      const JOYSTICK_DEAD_ZONE = 1;
      const dCol = this._joystick.currentCol - this._joystick.centerCol;
      const dRow = this._joystick.currentRow - this._joystick.centerRow;
      this.heldKeys.clear();
      if (dRow < -JOYSTICK_DEAD_ZONE) this.heldKeys.add('UP');
      if (dRow > JOYSTICK_DEAD_ZONE) this.heldKeys.add('DOWN');
      if (dCol < -JOYSTICK_DEAD_ZONE) this.heldKeys.add('LEFT');
      if (dCol > JOYSTICK_DEAD_ZONE) this.heldKeys.add('RIGHT');
    }

    this.updateInput(shipBalance);
    this.updatePosition(dtSeconds, diffBalance);
    this.spawnObstacles(this.lastViewport, diffBalance, navBalance);
    this.updateObstacles(dtSeconds, diffBalance, this.lastViewport);
    this.checkCollisions(this.lastViewport);
    this.checkVictory(diffBalance);

    this.state.frameCount++;
  }

  private updateInput(shipBalance: any): void {
    const accelImpulse = shipBalance.accelerationImpulse;
    const maxLateral = shipBalance.maxSpeedLateral;
    const maxForward = shipBalance.maxSpeedForward;

    // Momentum model: zero opposing velocity before adding impulse
    if (this.heldKeys.has('LEFT')) {
      if (this.state.playerVelX > 0) this.state.playerVelX = 0;
      this.state.playerVelX -= accelImpulse;
    }
    if (this.heldKeys.has('RIGHT')) {
      if (this.state.playerVelX < 0) this.state.playerVelX = 0;
      this.state.playerVelX += accelImpulse;
    }
    if (this.heldKeys.has('UP')) {
      if (this.state.playerVelY < 0) this.state.playerVelY = 0;
      this.state.playerVelY += accelImpulse;
    }
    if (this.heldKeys.has('DOWN')) {
      this.state.playerVelY -= accelImpulse;
    }

    // Clamp velocities
    this.state.playerVelX = Math.max(-maxLateral, Math.min(maxLateral, this.state.playerVelX));
    this.state.playerVelY = Math.max(-maxForward, Math.min(maxForward, this.state.playerVelY));

    this.heldKeys.clear();
  }

  private updatePosition(dt: number, diffBalance: any): void {
    const minScrollSpeed = diffBalance.minScrollSpeed;
    const balance = getGameBalance();
    const playerRowPreference = (balance.miniGames.navigation as any).ship.playerRowPreference;

    // Effective forward speed is at least minScrollSpeed
    const effectiveVelY = Math.max(this.state.playerVelY, minScrollSpeed);
    this.state.playerWorldX += this.state.playerVelX * dt;
    this.state.playerWorldY += effectiveVelY * dt;

    // Update camera to keep player at preferred row (never decrease camera Y)
    const { height } = this.lastViewport;
    const targetCameraY = this.state.playerWorldY - height * playerRowPreference;
    this.state.cameraScrollY = Math.max(this.state.cameraScrollY, targetCameraY);
  }

  private spawnObstacles(viewport: MiniGameViewport, diffBalance: any, eventTypeBalance: any): void {
    const { width, height } = viewport;
    const targetDensity = diffBalance.obstacleDensity;
    const edgeSpawnInterval = diffBalance.edgeSpawnIntervalFrames;
    const maxDriftSpeed = diffBalance.driftSpeedMax;
    const eventTypeRatios = eventTypeBalance.eventTypes[this.eventType];

    // Lead spawn: fill a band ahead of visible area
    const bandHeight = height;
    const nextBandTop = this.state.spawnFrontierY;
    const nextBandBottom = nextBandTop + bandHeight;
    const viewportTop = this.state.cameraScrollY;
    const viewportBottom = viewportTop + height;

    if (nextBandTop < viewportBottom) {
      // Frontier band is visible or soon will be; push it forward
      this.state.spawnFrontierY += bandHeight;

      // Count existing obstacles in the band to reach target density
      let count = 0;
      for (const obs of this.state.obstacles) {
        const obsBottom = obs.worldY + 5;
        if (obs.worldY < nextBandBottom && obsBottom > nextBandTop) count++;
      }

      const target = Math.ceil(targetDensity * bandHeight);
      while (count < target) {
        this.spawnObstacleInBand(nextBandTop, nextBandBottom, width, diffBalance, eventTypeRatios, maxDriftSpeed);
        count++;
      }
    }

    // Edge spawn: periodically spawn at left/right edges
    if (this.state.frameCount - this.state.lastEdgeSpawnFrame >= edgeSpawnInterval) {
      this.state.lastEdgeSpawnFrame = this.state.frameCount;
      const side = this.rand() < 0.5 ? 'left' : 'right';
      const edgeWorldY = this.state.playerWorldY + (this.rand() - 0.5) * 20;
      this.spawnObstacleAtEdge(side, edgeWorldY, width, diffBalance, eventTypeRatios, maxDriftSpeed);
    }
  }

  private spawnObstacleInBand(top: number, bottom: number, width: number, diffBalance: any, eventTypeRatios: any, maxDriftSpeed: number): void {
    const size = this.pickSize(eventTypeRatios);
    const obstacle = this.createObstacle(size, diffBalance, maxDriftSpeed);
    obstacle.worldY = top + this.rand() * (bottom - top);
    obstacle.worldX = Math.max(0, Math.min(width - 2, this.rand() * width));
    this.state.obstacles.push(obstacle);
  }

  private spawnObstacleAtEdge(side: 'left' | 'right', worldY: number, width: number, diffBalance: any, eventTypeRatios: any, maxDriftSpeed: number): void {
    const size = this.pickSize(eventTypeRatios);
    const obstacle = this.createObstacle(size, diffBalance, maxDriftSpeed);
    obstacle.worldY = worldY;
    if (side === 'left') {
      obstacle.worldX = -10;
      obstacle.driftVx = maxDriftSpeed * (0.3 + 0.4 * this.rand());
    } else {
      obstacle.worldX = width + 5;
      obstacle.driftVx = -maxDriftSpeed * (0.3 + 0.4 * this.rand());
    }
    this.state.obstacles.push(obstacle);
  }

  private pickSize(eventTypeRatios: any): 'large' | 'medium' | 'small' {
    const r = this.rand();
    if (r < eventTypeRatios.large_ratio) return 'large';
    if (r < eventTypeRatios.large_ratio + eventTypeRatios.medium_ratio) return 'medium';
    return 'small';
  }

  private createObstacle(size: 'large' | 'medium' | 'small', diffBalance: any, maxDriftSpeed: number): Obstacle {
    const cells = this.getObstacleCells(size);
    const driftVy = -Math.max(0.1, maxDriftSpeed * (0.3 + 0.7 * this.rand()));

    return {
      worldX: 0,
      worldY: 0,
      driftVx: 0,
      driftVy,
      cells,
      size,
    };
  }

  private getObstacleCells(size: 'large' | 'medium' | 'small'): ObstacleCell[] {
    const chars = this.getObstacleChars();

    if (size === 'large') {
      if (this.eventType === 'asteroid_belt') {
        return [
          { dcol: 0, drow: 0, char: '#', color: 'white' as Color },
          { dcol: 1, drow: 0, char: '@', color: 'white' as Color },
          { dcol: 2, drow: 0, char: 'O', color: 'white' as Color },
          { dcol: 1, drow: 1, char: '#', color: 'white' as Color },
          { dcol: 0, drow: 2, char: '@', color: 'white' as Color },
          { dcol: 1, drow: 2, char: '#', color: 'white' as Color },
          { dcol: 2, drow: 2, char: 'O', color: 'white' as Color },
        ];
      } else if (this.eventType === 'space_debris') {
        return [
          { dcol: 0, drow: 0, char: '=', color: 'bright-black' as Color },
          { dcol: 1, drow: 0, char: '-', color: 'bright-black' as Color },
          { dcol: 2, drow: 0, char: '[', color: 'bright-black' as Color },
          { dcol: 3, drow: 0, char: ']', color: 'bright-black' as Color },
          { dcol: 0, drow: 1, char: '[', color: 'bright-black' as Color },
          { dcol: 1, drow: 1, char: '=', color: 'bright-black' as Color },
          { dcol: 2, drow: 1, char: '-', color: 'bright-black' as Color },
          { dcol: 3, drow: 1, char: ']', color: 'bright-black' as Color },
        ];
      } else {
        return [
          { dcol: 0, drow: 0, char: '.', color: 'cyan' as Color },
          { dcol: 2, drow: 0, char: "'", color: 'cyan' as Color },
          { dcol: 4, drow: 0, char: '`', color: 'cyan' as Color },
          { dcol: 1, drow: 2, char: ',', color: 'cyan' as Color },
          { dcol: 3, drow: 2, char: '.', color: 'cyan' as Color },
        ];
      }
    } else if (size === 'medium') {
      const medChars = chars.medium;
      return [
        { dcol: 0, drow: 0, char: medChars[0], color: chars.mediumColor as Color },
        { dcol: 1, drow: 0, char: medChars[1], color: chars.mediumColor as Color },
        { dcol: 0, drow: 1, char: medChars[2], color: chars.mediumColor as Color },
        { dcol: 1, drow: 1, char: medChars[3], color: chars.mediumColor as Color },
      ];
    } else {
      return [{ dcol: 0, drow: 0, char: chars.small[0], color: chars.smallColor as Color }];
    }
  }

  private getObstacleChars(): any {
    if (this.eventType === 'asteroid_belt') {
      return {
        medium: ['o', '*', '@', 'o'],
        mediumColor: 'bright-white',
        small: ['o', '*', '@'],
        smallColor: 'bright-white',
      };
    } else if (this.eventType === 'space_debris') {
      return {
        medium: ['+', '=', '-', '/'],
        mediumColor: 'bright-black',
        small: ['+', '=', '-', '/', '\\'],
        smallColor: 'bright-black',
      };
    } else {
      return {
        medium: ['.', "'", '`', ','],
        mediumColor: 'cyan',
        small: ['.', "'", '`', ','],
        smallColor: 'cyan',
      };
    }
  }

  private updateObstacles(dt: number, diffBalance: any, viewport: MiniGameViewport): void {
    const { height } = viewport;

    for (const obs of this.state.obstacles) {
      obs.worldX += obs.driftVx * dt;
      obs.worldY += obs.driftVy * dt;
    }

    // Remove off-screen obstacles
    this.state.obstacles = this.state.obstacles.filter((obs) => {
      const obsBottom = obs.worldY + 5;
      return obsBottom > this.state.cameraScrollY - 5;
    });
  }

  private checkCollisions(viewport: MiniGameViewport): void {
    if (this.state.outcome === 'collision') return;

    const playerScreenCol = Math.round(this.state.playerWorldX);
    const playerScreenRow = Math.round(this.state.playerWorldY - this.state.cameraScrollY);

    // Skip if player is in HUD row or above
    if (playerScreenRow <= viewport.top) return;

    for (const obs of this.state.obstacles) {
      for (const cell of obs.cells) {
        const cellScreenCol = Math.round(obs.worldX + cell.dcol);
        const cellScreenRow = Math.round(obs.worldY + cell.drow - this.state.cameraScrollY);

        // Skip HUD row
        if (cellScreenRow <= viewport.top) continue;

        if (cellScreenCol === playerScreenCol && cellScreenRow === playerScreenRow) {
          this.triggerCollision();
          return;
        }
      }
    }
  }

  private triggerCollision(): void {
    if (this.state.completed) return;
    this.state.outcome = 'collision';
    this.state.collisionFlashEndTime = performance.now() + 400;
  }

  private checkVictory(diffBalance: any): void {
    if (this.state.completed) return;

    if (this.state.playerWorldY >= diffBalance.targetDistance) {
      if (this.state.outcome === 'collision') return;
      this.state.outcome = 'victory';
      this.state.completed = true;
      setTimeout(() => {
        this.complete({ outcome: 'completed', result: { score: 100 } });
      }, 500);
    } else if (this.state.outcome === 'collision') {
      if (performance.now() > this.state.collisionFlashEndTime) {
        this.state.completed = true;
        this.complete({ outcome: 'completed', result: { score: 0 } });
      }
    }
  }

  private checkOutOfBounds(viewport: MiniGameViewport): void {
    if (this.state.completed) return;

    const playerScreenRow = Math.round(this.state.playerWorldY - this.state.cameraScrollY);
    const bottomBound = viewport.top + viewport.height - 1;

    if (playerScreenRow > bottomBound) {
      this.triggerCollision();
    }
  }

  protected renderGame(buffer: CharBuffer, viewport: MiniGameViewport): void {
    this.lastViewport = viewport;
    const { top, left, width, height } = viewport;

    // Clear viewport
    for (let row = top; row < top + height; row++) {
      if (row >= 0 && row < buffer.length) {
        for (let col = left; col < left + width; col++) {
          if (col >= 0 && col < buffer[row].length) {
            buffer[row][col] = { char: ' ', fg: 'white' as Color, bg: 'black' as Color };
          }
        }
      }
    }

    // Draw HUD row
    this.drawHud(buffer, viewport);

    // Draw obstacles (skip HUD row)
    for (const obs of this.state.obstacles) {
      for (const cell of obs.cells) {
        const screenCol = left + Math.round(obs.worldX + cell.dcol);
        const screenRow = top + Math.round(obs.worldY + cell.drow - this.state.cameraScrollY);

        if (screenRow > top && screenRow >= top && screenRow < top + height && screenCol >= left && screenCol < left + width) {
          if (screenRow < buffer.length && screenCol < buffer[screenRow].length) {
            buffer[screenRow][screenCol] = { char: cell.char, fg: cell.color, bg: 'black' };
          }
        }
      }
    }

    // Draw player ship (or flash if collision)
    const playerScreenCol = left + Math.round(this.state.playerWorldX);
    const playerScreenRow = top + Math.round(this.state.playerWorldY - this.state.cameraScrollY);

    if (playerScreenRow >= top && playerScreenRow < top + height && playerScreenCol >= left && playerScreenCol < left + width) {
      if (playerScreenRow < buffer.length && playerScreenCol < buffer[playerScreenRow].length) {
        const isFlashing = this.state.outcome === 'collision' && (Math.floor((performance.now() - (this.state.collisionFlashEndTime - 400)) / 100) % 2 === 0);
        const color: Color = isFlashing ? 'bright-red' : 'bright-green';
        buffer[playerScreenRow][playerScreenCol] = { char: '^', fg: color, bg: 'black' as Color };
      }
    }

    // Draw joystick if in touch mode
    if (this._primaryInput === 'touch') {
      this.renderJoystick(buffer, viewport);
    }
  }

  private renderJoystick(buffer: CharBuffer, viewport: MiniGameViewport): void {
    const { top, left, width, height } = viewport;

    const safeWrite = (row: number, col: number, char: string, fg: Color) => {
      if (row < 0 || row >= buffer.length || col < 0 || col >= (buffer[row]?.length ?? 0)) return;
      buffer[row][col] = { char, fg, bg: 'black' as Color };
    };

    if (!this._joystick) {
      const hint = 'DRAG TO NAVIGATE';
      const hintRow = top + height - 2;
      const hintCol = left + Math.floor((width - hint.length) / 2);
      for (let i = 0; i < hint.length && hintCol + i < left + width; i++) {
        safeWrite(hintRow, hintCol + i, hint[i], 'bright-black' as Color);
      }
      return;
    }

    const { centerCol, centerRow, currentCol, currentRow } = this._joystick;
    const dCol = currentCol - centerCol;
    const dRow = currentRow - centerRow;
    const JOYSTICK_DEAD_ZONE = 1;

    safeWrite(centerRow, centerCol, 'o', 'bright-white' as Color);

    if (dRow < -JOYSTICK_DEAD_ZONE) safeWrite(centerRow - 2, centerCol, '^', 'bright-green' as Color);
    if (dRow > JOYSTICK_DEAD_ZONE) safeWrite(centerRow + 2, centerCol, 'v', 'bright-green' as Color);
    if (dCol < -JOYSTICK_DEAD_ZONE) safeWrite(centerRow, centerCol - 2, '<', 'bright-green' as Color);
    if (dCol > JOYSTICK_DEAD_ZONE) safeWrite(centerRow, centerCol + 2, '>', 'bright-green' as Color);
  }

  private drawHud(buffer: CharBuffer, viewport: MiniGameViewport): void {
    const { top, left, width } = viewport;
    const balance = getGameBalance();
    const navBalance = balance.miniGames.navigation as any;
    const diffBalance = navBalance.difficulties[this.difficulty];
    const targetDist = diffBalance.targetDistance;
    const currentDist = this.state.playerWorldY;
    const progress = Math.min(1, Math.max(0, currentDist / targetDist));

    const barWidth = 20;
    const filledWidth = Math.round(barWidth * progress);
    let bar = '';
    for (let i = 0; i < filledWidth; i++) bar += '█';
    for (let i = filledWidth; i < barWidth; i++) bar += '░';

    const distStr = Math.round(currentDist).toString();
    const label = `DIST [${bar}] ${distStr}u`;

    if (top < buffer.length) {
      let col = left;
      for (const char of label) {
        if (col < left + width && col < buffer[top].length) {
          buffer[top][col] = { char, fg: 'bright-yellow' as Color, bg: 'black' as Color };
        }
        col++;
      }
    }
  }
}
