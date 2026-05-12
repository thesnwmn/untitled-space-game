import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText, writeCentered, drawBorder } from '../../shared/buffer-utils';

interface TraderItem {
  name: string;
  price: number;
}

interface Trader {
  name: string;
  buyList: TraderItem[];
  sellList: TraderItem[];
}

const TRADERS: Trader[] = [
  {
    name: 'MERCHANT KESS',
    buyList: [
      { name: 'Iron Ore', price: 120 },
      { name: 'Copper Wire', price: 85 },
      { name: 'Refined Fuel', price: 250 },
      { name: 'Circuit Board', price: 340 },
      { name: 'Titanium Sheet', price: 180 },
      { name: 'Rare Alloy', price: 420 },
    ],
    sellList: [
      { name: 'Water Supplies', price: 45 },
      { name: 'Oxygen Tank', price: 60 },
      { name: 'Nutrient Paste', price: 35 },
      { name: 'Medical Kit', price: 200 },
      { name: 'Armor Plating', price: 280 },
      { name: 'Navigation Module', price: 500 },
    ],
  },
];

type TabKey = 'BUY' | 'SELL';

const TAB_ROW = 5;
const BUY_TAB_COL = 10;
const SELL_TAB_COL = 17;
const ITEM_ROW_START = 7;
const ITEM_COL = 1;
const ITEM_CONTENT_WIDTH = 38;

export class TraderScene implements Scene {
  private readonly trader: Trader;
  private readonly context: GameContext;
  private activeTab: TabKey = 'BUY';
  private cursorIdx = 0;
  private activated = false;

  constructor(inputHandler: InputHandler, context: GameContext, onBack: () => void) {
    this.trader = TRADERS[0];
    this.context = context;

    inputHandler.onAction((action) => {
      if (this.activated) return;
      const items = this.currentItems();
      if (action === 'UP') {
        this.cursorIdx = (this.cursorIdx - 1 + items.length) % items.length;
      } else if (action === 'DOWN') {
        this.cursorIdx = (this.cursorIdx + 1) % items.length;
      } else if (action === 'LEFT') {
        this.activeTab = 'BUY';
        this.cursorIdx = 0;
      } else if (action === 'RIGHT') {
        this.activeTab = 'SELL';
        this.cursorIdx = 0;
      } else if (action === 'SELECT') {
        const item = this.currentItems()[this.cursorIdx];
        console.log(`[Trader] Selected ${item.name}`);
      } else if (action === 'BACK') {
        this.activated = true;
        onBack();
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((col, row) => {
        if (this.activated) return;
        if (row === TAB_ROW && col >= BUY_TAB_COL && col < BUY_TAB_COL + 5) {
          this.activeTab = 'BUY';
          this.cursorIdx = 0;
          return;
        }
        if (row === TAB_ROW && col >= SELL_TAB_COL && col < SELL_TAB_COL + 6) {
          this.activeTab = 'SELL';
          this.cursorIdx = 0;
          return;
        }
        const items = this.currentItems();
        for (let i = 0; i < items.length; i++) {
          if (row === ITEM_ROW_START + i) {
            this.cursorIdx = i;
            console.log(`[Trader] Selected ${items[i].name}`);
            return;
          }
        }
      });
    }
  }

  private currentItems(): TraderItem[] {
    return this.activeTab === 'BUY' ? this.trader.buyList : this.trader.sellList;
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

    drawBorder(buffer, 'white', 'black');

    writeCentered(buffer, 2, this.trader.name, 'bright-cyan', 'black');
    writeCentered(buffer, 3, '='.repeat(this.trader.name.length), 'cyan', 'black');

    const buyFg: Color = this.activeTab === 'BUY' ? 'bright-green' : 'white';
    const sellFg: Color = this.activeTab === 'SELL' ? 'bright-green' : 'white';
    writeText(buffer, TAB_ROW, BUY_TAB_COL, '[BUY]', buyFg, 'black');
    writeText(buffer, TAB_ROW, SELL_TAB_COL, '[SELL]', sellFg, 'black');

    const items = this.currentItems();
    for (let i = 0; i < items.length; i++) {
      const row = ITEM_ROW_START + i;
      if (row >= h) continue;
      const item = items[i];
      const isCursor = i === this.cursorIdx;
      const prefix = isCursor ? '> ' : '  ';
      const priceStr = `${item.price} CR`;
      const dotLen = Math.max(1, ITEM_CONTENT_WIDTH - prefix.length - item.name.length - 2 - priceStr.length);
      const itemText = `${prefix}${item.name} ${'.'.repeat(dotLen)} ${priceStr}`;
      const fg: Color = isCursor ? 'bright-green' : 'white';
      writeText(buffer, row, ITEM_COL, itemText, fg, 'black');
    }

    const footerRow = h - 3;
    const hint = this.context.primaryInput === 'touch'
      ? 'TAP to select   2-finger exit'
      : '↑↓ navigate   ESC return';
    writeCentered(buffer, footerRow, hint, 'bright-black', 'black');
  }
}
