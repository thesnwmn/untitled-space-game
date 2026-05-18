import type { CharBuffer, Color, GameContext, InputHandler } from '../../shared/types';
import type { PlayerState } from '../player-state';
import { BaseTransitionScene } from './base-transition-scene';
import { writeCentered } from '../../shared/buffer-utils';

const DURATION = 3000;

export class LandingResultScene extends BaseTransitionScene {
  private _skipRequested = false;

  constructor(
    private readonly input: InputHandler,
    player: PlayerState,
    context: GameContext,
    private readonly outcomeLabel: string,
    private readonly score: number | null,
    private readonly damageFraction: number,
    onComplete: () => void,
  ) {
    super(player, context, DURATION, onComplete);
    input.onAction(() => { this._skipRequested = true; });
  }

  override update(dt: number): void {
    if (this._skipRequested) {
      this.elapsed = Infinity;
      this._skipRequested = false;
    }
    super.update(dt);
  }

  protected override renderContent(buffer: CharBuffer, top: number, bottom: number): void {
    const mid = Math.floor((top + bottom) / 2);

    const labelColor = this.getOutcomeColor();
    writeCentered(buffer, mid - 2, this.outcomeLabel, labelColor, 'black');

    if (this.score !== null) {
      writeCentered(buffer, mid, `SCORE: ${this.score} / 100`, 'white', 'black');
    }

    const damagePercent = Math.round(this.damageFraction * 100);
    const damageColor: Color = damagePercent === 0 ? 'bright-green' : 'yellow';
    writeCentered(buffer, mid + 2, `HULL DAMAGE: ${damagePercent}%`, damageColor, 'black');
  }

  private getOutcomeColor(): Color {
    if (this.score === null) return 'red';
    if (this.score < 40) return 'red';
    if (this.score < 70) return 'yellow';
    return 'bright-green';
  }
}
