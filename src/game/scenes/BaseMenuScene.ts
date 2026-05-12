import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText, writeCentered } from '../../shared/buffer-utils';

export interface MenuItemDef {
  label: string;
  action: () => void;
}

const MENU_ROW_START = 14;

export abstract class BaseMenuScene implements Scene {
  private readonly title: string;
  private readonly items: MenuItemDef[];
  private readonly context: GameContext;
  private cursorIdx = 0;
  private activated = false;

  constructor(title: string, items: MenuItemDef[], inputHandler: InputHandler, context: GameContext) {
    this.title = title;
    this.items = items;
    this.context = context;

    inputHandler.onAction((action) => {
      if (this.activated) return;
      if (action === 'UP') {
        this.cursorIdx = (this.cursorIdx - 1 + this.items.length) % this.items.length;
      } else if (action === 'DOWN') {
        this.cursorIdx = (this.cursorIdx + 1) % this.items.length;
      } else if (action === 'SELECT') {
        this.activated = true;
        this.items[this.cursorIdx].action();
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((_col, row) => {
        if (this.activated) return;
        for (let i = 0; i < this.items.length; i++) {
          if (row === MENU_ROW_START + i) {
            this.activated = true;
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

    writeCentered(buffer, 2, this.title, 'bright-cyan', 'black');
    writeCentered(buffer, 3, '='.repeat(this.title.length), 'cyan', 'black');

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
