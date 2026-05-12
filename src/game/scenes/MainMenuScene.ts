import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';

const TITLE_LINES = ['UNTITLED', 'SPACE GAME'];
const TITLE_ROW_START = 4;  // 0-indexed; rows 4 and 7 in a 40-row grid
const TITLE_ROW_STEP = 3;
const TAGLINE = '- An ASCII space adventure -';
const TAGLINE_ROW = 11;     // 0-indexed; 3 rows below second title line
const MENU_ROW_START = 16;  // 0-indexed; 4 rows below tagline
// Footer is pinned 3 rows from the bottom (row 37 in a 40-row grid).

interface MenuItem {
  label: string;
  action: () => void;
}

function writeText(buffer: CharBuffer, row: number, col: number, text: string, fg: Color, bg: Color): void {
  if (row < 0 || row >= buffer.length) return;
  const rowCells = buffer[row];
  for (let i = 0; i < text.length; i++) {
    const c = col + i;
    if (c >= 0 && c < rowCells.length) {
      rowCells[c] = { char: text[i], fg, bg };
    }
  }
}

function writeCentered(buffer: CharBuffer, row: number, text: string, fg: Color, bg: Color): void {
  if (row < 0 || row >= buffer.length) return;
  const w = buffer[row].length;
  const col = Math.max(0, Math.floor((w - text.length) / 2));
  writeText(buffer, row, col, text, fg, bg);
}

export class MainMenuScene implements Scene {
  private readonly items: MenuItem[];
  private readonly context: GameContext;
  private cursorIdx = 0;
  private activated = false;

  constructor(inputHandler: InputHandler, context: GameContext) {
    this.context = context;

    this.items = [
      {
        label: 'NEW GAME',
        action: () => {
          console.log('[MainMenu] Starting game…');
          this.activated = true;
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

    const footerRow = h - 3;
    const hint = this.context.primaryInput === 'touch'
      ? 'tap an option to select'
      : '↑↓ navigate   ENTER select';
    writeCentered(buffer, footerRow, hint, 'bright-black', 'black');
  }
}
