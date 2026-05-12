import type { InputHandler, GameContext, CharBuffer, Scene } from '../../shared/types';
import { writeText, writeCentered } from '../../shared/buffer-utils';
import { STATION_NAME } from '../constants';

const YEAR_HEADER = 'YEAR  2076';
const YEAR_ROW = 2;
const KEYBOARD_HINT = '[ PRESS ENTER TO CONTINUE ]';
const TOUCH_HINT = '[ TAP TO CONTINUE ]';

interface StoryLine {
  text: string;
  row: number;
}

const STORY_LINES: StoryLine[] = [
  { text: 'Hugo poured his last credits into', row: 4 },
  { text: 'a battered freighter — barely', row: 5 },
  { text: 'spaceworthy, but entirely his.', row: 6 },
  { text: 'Stories pulled him outward:', row: 8 },
  { text: `${STATION_NAME}, drifting in`, row: 9 },
  { text: "Jupiter's long shadow — where", row: 10 },
  { text: 'traders, chancers and fortune-', row: 11 },
  { text: 'seekers converge.', row: 12 },
  { text: 'Hugo eases into the docking bay,', row: 14 },
  { text: 'locks the clamps, steps aboard.', row: 15 },
  { text: 'Whatever comes next is up to him.', row: 17 },
];

export class StoryScene implements Scene {
  private readonly context: GameContext;
  private readonly onContinue: () => void;
  private activated = false;

  constructor(inputHandler: InputHandler, context: GameContext, onContinue: () => void) {
    this.context = context;
    this.onContinue = onContinue;

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

    writeCentered(buffer, YEAR_ROW, YEAR_HEADER, 'bright-yellow', 'black');

    for (const line of STORY_LINES) {
      writeText(buffer, line.row, 2, line.text, 'white', 'black');
    }

    const hint = this.context.primaryInput === 'touch' ? TOUCH_HINT : KEYBOARD_HINT;
    writeCentered(buffer, h - 3, hint, 'bright-black', 'black');
  }
}
