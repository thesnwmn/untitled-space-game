import type { InputHandler, GameContext, CharBuffer, GameAction, Color } from '../../shared/types';
import { writeText, drawSeparator } from '../../shared/buffer-utils';
import { CONTENT_TOP, contentBottom } from '../ui/screen-chrome';
import type { NavOption } from '../ui/screen-chrome';
import type { PlayerState } from '../player-state';
import { BaseScene } from './base-scene';

export interface ChoiceItem {
  label: string;
  disabled?: boolean;
  details?: string[];
  action: () => void;
}

export abstract class BaseChoiceScene extends BaseScene {
  private readonly _choices: ChoiceItem[];
  private readonly _onBack: () => void;
  private cursorIdx = -1;
  private lastChoicesStartRow = 0;

  constructor(
    title: string,
    choices: ChoiceItem[],
    onBack: () => void,
    navOptions: ReadonlyArray<NavOption>,
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
  ) {
    super(inputHandler, context, player, {
      navOptions,
      title,
    });
    this._choices = choices;
    this._onBack = onBack;
    this.resetCursor();
  }

  protected override preHandleAction(action: GameAction): boolean {
    if (action === 'BACK') {
      this.activated = true;
      this._onBack();
      return true;
    }
    return false;
  }

  protected override handleAction(action: GameAction): void {
    if (action === 'UP') {
      this.moveCursor(-1);
    } else if (action === 'DOWN') {
      this.moveCursor(1);
    } else if (action === 'SELECT') {
      this.activateCurrent();
    }
  }

  protected override handleTap(col: number, row: number): void {
    const itemIdx = this.rowToChoiceIndex(row);
    if (itemIdx !== null && !this._choices[itemIdx].disabled) {
      this.cursorIdx = itemIdx;
      this.activateCurrent();
    }
  }

  private moveCursor(delta: number): void {
    const choices = this._choices;
    const n = choices.length;
    if (n === 0) return;
    const start = this.cursorIdx === -1 ? (delta > 0 ? n - 1 : 0) : this.cursorIdx;
    for (let tries = 0; tries < n; tries++) {
      const next = ((start + delta * (tries + 1)) % n + n) % n;
      if (!choices[next].disabled) {
        this.cursorIdx = next;
        return;
      }
    }
  }

  private activateCurrent(): void {
    if (this._choices.length === 0 || this.cursorIdx === -1) return;
    const choice = this._choices[this.cursorIdx];
    if (choice.disabled) return;
    this.activated = true;
    choice.action();
  }

  private resetCursor(): void {
    const choices = this._choices;
    for (let i = 0; i < choices.length; i++) {
      if (!choices[i].disabled) {
        this.cursorIdx = i;
        return;
      }
    }
    this.cursorIdx = -1;
  }

  private computeChoicesHeight(): number {
    let height = 0;
    for (const choice of this._choices) {
      height += 1 + (choice.details?.length ?? 0);
    }
    return height;
  }

  private rowToChoiceIndex(row: number): number | null {
    if (row < this.lastChoicesStartRow) return null;
    let r = this.lastChoicesStartRow;
    for (let i = 0; i < this._choices.length; i++) {
      const itemHeight = 1 + (this._choices[i].details?.length ?? 0);
      if (row >= r && row < r + itemHeight) return i;
      r += itemHeight;
    }
    return null;
  }

  protected abstract renderContent(buffer: CharBuffer, top: number, contentBottom: number): void;

  public override render(buffer: CharBuffer): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;

    // Clear buffer
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };
      }
    }

    const config = this.buildChromeConfig();
    this.chrome.render(buffer, config);

    const showFooter = true;
    const base = CONTENT_TOP;
    const bottom = contentBottom(h, showFooter);

    // Render title and underline
    const title = (this as any).opts.title;
    if (title !== undefined) {
      writeText(buffer, base, 2, title, 'bright-white', 'black');
      writeText(buffer, base + 1, 2, "'".repeat(title.length), 'bright-black', 'black');
    }

    // Content starts after title + underline
    const contentTop = base + 2;

    // Compute choice area layout
    const choicesHeight = this.computeChoicesHeight();
    const separatorRow = bottom - choicesHeight - 1;
    const contentAreaBottom = separatorRow - 1;

    // Render child content
    this.renderContent(buffer, contentTop, contentAreaBottom);

    // Render separator
    if (separatorRow >= 0 && separatorRow < h) {
      drawSeparator(buffer, separatorRow, w);
    }

    // Render choices
    let choiceRow = separatorRow + 1;
    this.lastChoicesStartRow = choiceRow;
    for (let i = 0; i < this._choices.length; i++) {
      const choice = this._choices[i];
      const isCursor = i === this.cursorIdx;
      const cursorChar = isCursor ? '>' : ' ';
      const cursorFg: Color = choice.disabled ? 'bright-black' : isCursor ? 'bright-green' : 'white';

      if (choiceRow < h) {
        writeText(buffer, choiceRow, 2, cursorChar, cursorFg, 'black');
        writeText(buffer, choiceRow, 3, choice.label, cursorFg, 'black');
      }
      choiceRow++;

      // Render details lines
      if (choice.details) {
        for (const detail of choice.details) {
          if (choiceRow < h) {
            writeText(buffer, choiceRow, 4, detail.slice(0, w - 4), 'bright-black', 'black');
          }
          choiceRow++;
        }
      }
    }
  }
}
