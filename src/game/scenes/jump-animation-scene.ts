import type { CharBuffer, GameContext } from '../../shared/types';
import { writeCentered } from '../../shared/buffer-utils';
import { getSystem } from '../world/world-data';
import type { PlayerState } from '../player-state';
import { BaseTransitionScene } from './base-transition-scene';
import type { ChromeConfig } from '../ui/screen-chrome';

const ELLIPSIS_FRAMES = ['[. . .]', '[: : :]', '[* * *]'];
const JUMP_DURATION = 5000;

export class JumpAnimationScene extends BaseTransitionScene {
  constructor(player: PlayerState, context: GameContext, onArrival: () => void) {
    super(player, context, JUMP_DURATION, onArrival);
  }

  protected override getChromeConfig(): ChromeConfig {
    return { showHeader: true, showFooter: true, navOptions: [], systemLabel: 'IN TRANSIT', destinationLabel: null };
  }

  protected override renderContent(buffer: CharBuffer): void {
    const h = buffer.length;
    const mid = Math.floor(h / 2);
    const frameIdx = Math.floor(this.elapsed / 500) % 3;
    const remaining = Math.ceil((JUMP_DURATION - this.elapsed) / 1000);
    const countdown = Math.max(1, Math.min(5, remaining));

    const sys = getSystem(this.player.systemId);
    const targetSystemName = sys ? sys.name.toUpperCase() : this.player.systemId.toUpperCase();

    writeCentered(buffer, mid - 3, '[ JUMP DRIVE ENGAGED ]', 'bright-cyan', 'black');
    writeCentered(buffer, mid - 1, 'DESTINATION:', 'bright-black', 'black');
    writeCentered(buffer, mid, targetSystemName, 'bright-white', 'black');
    writeCentered(buffer, mid + 2, ELLIPSIS_FRAMES[frameIdx], 'bright-black', 'black');
    writeCentered(buffer, mid + 4, `ARRIVING IN ${countdown}S`, 'bright-black', 'black');
  }
}
