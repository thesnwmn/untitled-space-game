import type { CharBuffer, Scene } from '../../shared/types';
import { writeCentered } from '../../shared/buffer-utils';

const TRAVEL_DURATION = 2000;
const ELLIPSIS_FRAMES = ['[ —   ]', '[  —  ]', '[   — ]'];

export class InSystemTravelAnimationScene implements Scene {
  private readonly destinationName: string;
  private readonly onArrival: () => void;
  private elapsed = 0;
  private arrived = false;

  constructor(destinationName: string, onArrival: () => void) {
    this.destinationName = destinationName.toUpperCase();
    this.onArrival = onArrival;
  }

  update(dt: number): void {
    if (this.arrived) return;
    this.elapsed += dt;
    if (this.elapsed >= TRAVEL_DURATION) {
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
    const frameIdx = Math.floor(this.elapsed / 300) % 3;
    const remaining = Math.ceil((TRAVEL_DURATION - this.elapsed) / 1000);
    const countdown = Math.max(1, Math.min(2, remaining));

    writeCentered(buffer, mid - 3, '[ THRUSTERS ENGAGED ]', 'bright-yellow', 'black');
    writeCentered(buffer, mid - 1, 'HEADING TO:', 'bright-black', 'black');
    writeCentered(buffer, mid, this.destinationName, 'bright-white', 'black');
    writeCentered(buffer, mid + 2, ELLIPSIS_FRAMES[frameIdx], 'bright-black', 'black');
    writeCentered(buffer, mid + 4, `DOCKING IN ${countdown}S`, 'bright-black', 'black');
  }
}
