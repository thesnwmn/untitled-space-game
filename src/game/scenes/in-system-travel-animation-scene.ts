import type { CharBuffer, GameContext } from '../../shared/types';
import { writeCentered } from '../../shared/buffer-utils';
import { getDestination } from '../world/world-data';
import type { PlayerState } from '../player-state';
import { BaseTransitionScene } from './base-transition-scene';
import type { ChromeConfig } from '../ui/screen-chrome';

const TRAVEL_DURATION = 2000;
const ELLIPSIS_FRAMES = ['[ —   ]', '[  —  ]', '[   — ]'];

export class InSystemTravelAnimationScene extends BaseTransitionScene {
  private readonly targetLabel: string | undefined;

  constructor(player: PlayerState, context: GameContext, onArrival: () => void, targetLabel?: string) {
    super(player, context, TRAVEL_DURATION, onArrival);
    this.targetLabel = targetLabel;
  }

  protected override getChromeConfig(): ChromeConfig {
    return { showHeader: true, showFooter: true, navOptions: [], destinationLabel: 'IN TRANSIT' };
  }

  protected override renderContent(buffer: CharBuffer): void {
    const h = buffer.length;
    const mid = Math.floor(h / 2);
    const frameIdx = Math.floor(this.elapsed / 300) % 3;
    const remaining = Math.ceil((TRAVEL_DURATION - this.elapsed) / 1000);
    const countdown = Math.max(1, Math.min(2, remaining));

    const destName = this.targetLabel !== undefined
      ? this.targetLabel.toUpperCase()
      : (() => { const d = this.player.destinationId ? getDestination(this.player.destinationId) : null; return d ? d.name.toUpperCase() : 'UNKNOWN'; })();

    writeCentered(buffer, mid - 3, '[ THRUSTERS ENGAGED ]', 'bright-yellow', 'black');
    writeCentered(buffer, mid - 1, 'HEADING TO:', 'bright-black', 'black');
    writeCentered(buffer, mid, destName, 'bright-white', 'black');
    writeCentered(buffer, mid + 2, ELLIPSIS_FRAMES[frameIdx], 'bright-black', 'black');
    writeCentered(buffer, mid + 4, `ARRIVING IN ${countdown}S`, 'bright-black', 'black');
  }
}
