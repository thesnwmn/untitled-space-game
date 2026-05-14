import type { InputHandler, GameContext, CharBuffer, Scene } from '../../shared/types';
import { writeText, writeCentered, wrapText } from '../../shared/buffer-utils';
import { getStoryBeatsByTrigger } from '../world/world-data';

const YEAR_ROW = 2;
const KEYBOARD_HINT = '[ PRESS ENTER TO CONTINUE ]';
const TOUCH_HINT = '[ TAP TO CONTINUE ]';

export class StoryScene implements Scene {
  private readonly context: GameContext;
  private readonly onContinue: () => void;
  private activated = false;
  private readonly yearHeader: string;
  private readonly bodyLines: string[];

  constructor(inputHandler: InputHandler, context: GameContext, onContinue: () => void) {
    this.context = context;
    this.onContinue = onContinue;

    const beat = getStoryBeatsByTrigger('game-start')[0];
    const paragraphs = beat.text.split('\n\n');
    const firstPara = paragraphs[0].trim();
    let bodyParagraphs: string[];
    if (/^YEAR\s+\d{4}$/.test(firstPara)) {
      this.yearHeader = firstPara;
      bodyParagraphs = paragraphs.slice(1);
    } else {
      this.yearHeader = '';
      bodyParagraphs = paragraphs;
    }

    const allLines: string[] = [];
    for (let i = 0; i < bodyParagraphs.length; i++) {
      const normalized = bodyParagraphs[i].replace(/\n/g, ' ');
      const wrapped = wrapText(normalized, 36);
      if (i > 0) allLines.push('');
      allLines.push(...wrapped);
    }
    this.bodyLines = allLines;

    inputHandler.onAction((action) => {
      if (this.activated) return;
      if (action === 'SELECT') {
        this.activated = true;
        this.onContinue();
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((_col, _row) => {
        if (this.activated) return;
        this.activated = true;
        this.onContinue();
      });
    }
  }

  update(_dt: number): void {}

  render(buffer: CharBuffer): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;

    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };
      }
    }

    if (this.yearHeader) {
      writeCentered(buffer, YEAR_ROW, this.yearHeader, 'bright-yellow', 'black');
    }

    let row = 4;
    for (const line of this.bodyLines) {
      if (row >= h - 4) break;
      if (line === '') {
        row++;
      } else {
        writeText(buffer, row, 2, line, 'white', 'black');
        row++;
      }
    }

    const hint = this.context.primaryInput === 'touch' ? TOUCH_HINT : KEYBOARD_HINT;
    writeCentered(buffer, h - 3, hint, 'bright-black', 'black');
  }
}
