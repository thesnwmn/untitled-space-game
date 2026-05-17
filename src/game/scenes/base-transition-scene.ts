import type { CharBuffer, GameContext } from '../../shared/types';
import type { ChromeConfig } from '../ui/screen-chrome';
import type { PlayerState } from '../player-state';
import { BaseScene } from './base-scene';
import type { InputHandler } from '../../shared/types';

export abstract class BaseTransitionScene extends BaseScene {
  protected elapsed = 0;
  private readonly duration: number;
  private readonly onComplete: () => void;
  private arrived = false;

  constructor(player: PlayerState, context: GameContext, duration: number, onComplete: () => void) {
    const noopInput: InputHandler = { onAction: () => {} };
    super(noopInput, context, player, { navOptions: [] });
    this.duration = duration;
    this.onComplete = onComplete;
  }

  override update(dt: number): void {
    if (this.arrived) return;
    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      this.arrived = true;
      this.onComplete();
    }
  }

  protected override buildChromeConfig(): ChromeConfig {
    return { showHeader: true, showFooter: true, navOptions: [] };
  }

  protected abstract override renderContent(buffer: CharBuffer, top: number, bottom: number): void;
}
