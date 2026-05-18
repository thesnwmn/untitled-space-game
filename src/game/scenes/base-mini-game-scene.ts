import type { InputHandler, GameContext, CharBuffer, MiniGameResult, MiniGameViewport, MiniGameOptions } from '../../shared/types';
import type { PlayerState } from '../player-state';
import { BaseScene } from './base-scene';

export abstract class BaseMiniGameScene extends BaseScene {
  private readonly _onComplete?: (result: MiniGameResult) => void;
  private readonly _canvasWidth?: number;
  private readonly _canvasHeight?: number;
  private _completed = false;

  constructor(
    input: InputHandler,
    context: GameContext,
    player: PlayerState,
    options: MiniGameOptions,
  ) {
    super(input, context, player, { navOptions: options.navOptions, title: options.title });
    this._onComplete = options.onComplete;
    this._canvasWidth = options.canvasWidth;
    this._canvasHeight = options.canvasHeight;
  }

  protected abstract renderGame(buffer: CharBuffer, viewport: MiniGameViewport): void;

  protected renderContent(buffer: CharBuffer, top: number, bottom: number): void {
    const bufW = buffer[0]?.length ?? 0;
    const bufH = buffer.length;
    const contentH = bottom - top;

    const width = this._canvasWidth ?? bufW;
    const height = this._canvasHeight ?? contentH;

    let left = Math.floor((bufW - width) / 2);
    let vpTop = top + Math.floor((contentH - height) / 2);

    const maxLeft = Math.max(0, bufW - width);
    const maxTop = Math.max(0, bufH - height);
    left = Math.max(0, Math.min(left, maxLeft));
    vpTop = Math.max(0, Math.min(vpTop, maxTop));

    this.renderGame(buffer, { top: vpTop, left, width, height });
  }

  protected complete(result: MiniGameResult): void {
    if (this._completed) return;
    this._completed = true;
    this._onComplete?.(result);
  }
}
