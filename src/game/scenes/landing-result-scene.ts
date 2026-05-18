import type { CharBuffer, Color, GameContext, InputHandler } from '../../shared/types';
import type { PlayerState } from '../player-state';
import { BaseScene } from './base-scene';
import { writeCentered } from '../../shared/buffer-utils';

const DURATION = 3000;

export class LandingResultScene extends BaseScene {
  private elapsed = 0;
  private arrived = false;
  private readonly duration = DURATION;

  constructor(
    input: InputHandler,
    player: PlayerState,
    context: GameContext,
    private readonly outcomeLabel: string,
    private readonly score: number | null,
    private readonly damageFraction: number,
    private readonly onComplete: () => void,
  ) {
    super(input, context, player, { navOptions: [] });
    if (input.onTap) {
      input.onTap((col, row) => this.handleTapCustom(col, row));
    }
  }

  private handleTapCustom(col: number, row: number): void {
    const bufW = 40;
    const bufH = 30;
    const contentTop = 4;
    const contentH = bufH - contentTop - 2;
    const mid = contentTop + Math.floor(contentH / 2);

    if (Math.abs(row - mid) <= 2 && Math.abs(col - Math.floor(bufW / 2)) <= 15) {
      this.arrived = true;
      this.onComplete();
    }
  }

  public override update(dt: number): void {
    super.update(dt);
    if (this.arrived) return;
    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      this.elapsed = Infinity;
      this.arrived = true;
      this.onComplete();
    }
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

    writeCentered(buffer, mid + 5, 'tap to continue', 'bright-black', 'black');
  }

  private getOutcomeColor(): Color {
    if (this.score === null) return 'red';
    if (this.score < 40) return 'red';
    if (this.score < 70) return 'yellow';
    return 'bright-green';
  }
}
