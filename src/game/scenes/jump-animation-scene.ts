import type { CharBuffer, Scene } from '../../shared/types';
import { writeCentered } from '../../shared/buffer-utils';

const ELLIPSIS_FRAMES = ['[. . .]', '[: : :]', '[* * *]'];
const JUMP_DURATION = 5000;

export class JumpAnimationScene implements Scene {
  private readonly targetSystemName: string;
  private readonly onArrival: () => void;
  private elapsed = 0;
  private arrived = false;

  constructor(targetSystemName: string, onArrival: () => void) {
    this.targetSystemName = targetSystemName.toUpperCase();
    this.onArrival = onArrival;
  }

  update(dt: number): void {
    if (this.arrived) return;
    this.elapsed += dt;
    if (this.elapsed >= JUMP_DURATION) {
      this.arrived = true;
      this.onArrival();
    }
  }

  render(buffer: CharBuffer): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;

    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };
      }
    }

    const mid = Math.floor(h / 2);
    const frameIdx = Math.floor(this.elapsed / 500) % 3;
    const remaining = Math.ceil((JUMP_DURATION - this.elapsed) / 1000);
    const countdown = Math.max(1, Math.min(5, remaining));

    writeCentered(buffer, mid - 3, '[ JUMP DRIVE ENGAGED ]', 'bright-cyan', 'black');
    writeCentered(buffer, mid - 1, 'DESTINATION:', 'bright-black', 'black');
    writeCentered(buffer, mid, this.targetSystemName, 'bright-white', 'black');
    writeCentered(buffer, mid + 2, ELLIPSIS_FRAMES[frameIdx], 'bright-black', 'black');
    writeCentered(buffer, mid + 4, `ARRIVING IN ${countdown}S`, 'bright-black', 'black');
  }
}
