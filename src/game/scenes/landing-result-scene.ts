import type { CharBuffer, Color, GameContext, InputHandler } from '../../shared/types';
import type { PlayerState } from '../player-state';
import { BaseScene } from './base-scene';
import { writeCentered } from '../../shared/buffer-utils';

const DURATION = 3000;

export class LandingResultScene extends BaseScene {
  private elapsed = 0;
  private arrived = false;
  private readonly duration = DURATION;
  private lastContentTop = 4;
  private lastContentBottom = 26;
  private buttonRow = 0;
  private buttonCol = 0;
  private readonly isTouch: boolean;

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
    this.isTouch = context.primaryInput === 'touch';

    if (input.onTap) {
      input.onTap((col, row) => this.handleTapCustom(col, row));
    }

    if (!this.isTouch) {
      input.onAction(() => {
        if (!this.arrived) {
          this.arrived = true;
          this.onComplete();
        }
      });
    }
  }

  private handleTapCustom(col: number, row: number): void {
    const buttonText = '[continue]';
    if (Math.abs(row - this.buttonRow) <= 0 && col >= this.buttonCol && col < this.buttonCol + buttonText.length) {
      this.arrived = true;
      this.onComplete();
    }
  }

  public override update(dt: number): void {
    super.update(dt);
    if (this.arrived) return;
    this.elapsed += dt;
  }

  protected override renderContent(buffer: CharBuffer, top: number, bottom: number): void {
    this.lastContentTop = top;
    this.lastContentBottom = bottom;

    const mid = Math.floor((top + bottom) / 2);
    const bufW = buffer[0]?.length ?? 40;

    const labelColor = this.getOutcomeColor();
    writeCentered(buffer, mid - 2, this.outcomeLabel, labelColor, 'black');

    if (this.score !== null) {
      writeCentered(buffer, mid, `SCORE: ${this.score} / 100`, 'white', 'black');
    }

    const damagePercent = Math.round(this.damageFraction * 100);
    const damageColor: Color = damagePercent === 0 ? 'bright-green' : 'yellow';
    writeCentered(buffer, mid + 2, `HULL DAMAGE: ${damagePercent}%`, damageColor, 'black');

    const buttonText = '[continue]';
    const buttonRow = mid + 5;
    const buttonCol = Math.floor((bufW - buttonText.length) / 2);
    this.buttonRow = buttonRow;
    this.buttonCol = buttonCol;

    const buttonColor: Color = this.isTouch ? 'bright-yellow' : 'bright-green';
    writeCentered(buffer, buttonRow, buttonText, buttonColor, 'black');
  }

  private getOutcomeColor(): Color {
    if (this.score === null) return 'red';
    if (this.score < 40) return 'red';
    if (this.score < 70) return 'yellow';
    return 'bright-green';
  }
}
