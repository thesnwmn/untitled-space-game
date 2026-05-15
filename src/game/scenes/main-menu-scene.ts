import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import type { PlayerState } from '../PlayerState';
import { writeText, writeCentered } from '../../shared/buffer-utils';

const TITLE_LINES = ['UNTITLED', 'SPACE GAME'];
const TITLE_ROW_START = 4;
const TITLE_ROW_STEP = 3;
const TAGLINE = '- An ASCII space adventure -';
const TAGLINE_ROW = 11;
const MENU_ROW_START = 16;

interface MenuItem {
  label: string;
  action: () => void;
}

export class MainMenuScene implements Scene {
  private readonly items: MenuItem[];
  private cursorIdx = 0;
  private activated = false;

  constructor(inputHandler: InputHandler, context: GameContext, _player: PlayerState, onNewGame: () => void) {
    this.items = [
      {
        label: 'NEW GAME',
        action: () => {
          this.activated = true;
          onNewGame();
        },
      },
    ];

    if (context.environment === 'terminal') {
      this.items.push({
        label: 'QUIT',
        action: () => {
          console.log('[MainMenu] Quitting…');
          process.exit(0);
        },
      });
    }

    inputHandler.onAction((action) => {
      if (this.activated) return;
      if (action === 'UP') {
        this.cursorIdx = (this.cursorIdx - 1 + this.items.length) % this.items.length;
      } else if (action === 'DOWN') {
        this.cursorIdx = (this.cursorIdx + 1) % this.items.length;
      } else if (action === 'SELECT') {
        this.items[this.cursorIdx].action();
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((_col, row) => {
        if (this.activated) return;
        for (let i = 0; i < this.items.length; i++) {
          if (row === MENU_ROW_START + i) {
            this.cursorIdx = i;
            this.items[i].action();
            return;
          }
        }
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

    for (let i = 0; i < TITLE_LINES.length; i++) {
      writeCentered(buffer, TITLE_ROW_START + i * TITLE_ROW_STEP, TITLE_LINES[i], 'bright-cyan', 'black');
    }

    writeCentered(buffer, TAGLINE_ROW, TAGLINE, 'white', 'black');

    const maxItemWidth = this.items.reduce((max, item) => Math.max(max, item.label.length + 2), 0);
    const menuCol = Math.max(0, Math.floor((w - maxItemWidth) / 2));

    for (let i = 0; i < this.items.length; i++) {
      const row = MENU_ROW_START + i;
      if (row >= h) continue;
      const isCursor = i === this.cursorIdx;
      const prefix = isCursor ? '> ' : '  ';
      const fg: Color = isCursor ? 'bright-green' : 'white';
      writeText(buffer, row, menuCol, prefix + this.items[i].label, fg, 'black');
    }
  }
}
