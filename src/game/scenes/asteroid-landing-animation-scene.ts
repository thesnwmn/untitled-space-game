import type { CharBuffer, GameContext } from '../../shared/types';
import { writeCentered } from '../../shared/buffer-utils';
import type { PlayerState } from '../player-state';
import { BaseTransitionScene } from './base-transition-scene';

const DURATION = 2500;
const APPROACH_FRAMES = ['>', '>>', '>>>'];

export class AsteroidLandingAnimationScene extends BaseTransitionScene {
  constructor(player: PlayerState, context: GameContext, onComplete: () => void) {
    super(player, context, DURATION, onComplete);
  }

  protected override renderContent(buffer: CharBuffer, _top: number, _bottom: number): void {
    const h = buffer.length;
    const mid = Math.floor(h / 2);
    const frameIdx = Math.floor(this.elapsed / 400) % 3;
    const remaining = Math.ceil((DURATION - this.elapsed) / 1000);
    const countdown = Math.max(1, Math.min(3, remaining));

    writeCentered(buffer, mid - 3, '[ APPROACH LOCKED ]', 'bright-yellow', 'black');
    writeCentered(buffer, mid + 2, APPROACH_FRAMES[frameIdx], 'bright-black', 'black');
    writeCentered(buffer, mid + 4, `CLAMPING IN ${countdown}S`, 'bright-black', 'black');
  }
}
