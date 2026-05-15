import type { CharBuffer, GameContext, Scene } from '../../shared/types';
import { ScreenChrome, type ChromeConfig } from '../ui/screen-chrome';
import type { PlayerState } from '../player-state';

export abstract class BaseTransitionScene implements Scene {
  protected readonly player: PlayerState;
  protected elapsed = 0;
  private readonly chrome: ScreenChrome;
  private readonly duration: number;
  private readonly onComplete: () => void;
  private arrived = false;

  constructor(player: PlayerState, context: GameContext, duration: number, onComplete: () => void) {
    this.player = player;
    this.chrome = new ScreenChrome(context, player);
    this.duration = duration;
    this.onComplete = onComplete;
  }

  update(dt: number): void {
    if (this.arrived) return;
    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      this.arrived = true;
      this.onComplete();
    }
  }

  render(buffer: CharBuffer): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;
    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++)
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };
    this.chrome.render(buffer, this.getChromeConfig());
    this.renderContent(buffer);
  }

  protected getChromeConfig(): ChromeConfig {
    return { showHeader: true, showFooter: true, navOptions: [] };
  }

  protected abstract renderContent(buffer: CharBuffer): void;
}
