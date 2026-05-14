import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import { getDestination } from '../world/world-data';
import { ScreenChrome, CONTENT_TOP, contentBottom } from '../ui/ScreenChrome';

interface TraderItem {
  name: string;
  price: number;
  qty?: number;
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
      { name: 'Water Supplies', price: 45,  qty: 5 },
      { name: 'Oxygen Tank',    price: 60,  qty: 3 },
      { name: 'Nutrient Paste', price: 35,  qty: 8 },
      { name: 'Medical Kit',    price: 200, qty: 2 },
      { name: 'Armor Plating',  price: 280, qty: 1 },
      { name: 'Nav Module',     price: 500, qty: 1 },
    ],
  },
];

type TabKey = 'BUY' | 'SELL';

const TAB_ROW = CONTENT_TOP + 2;
const ITEM_ROW_START = CONTENT_TOP + 4;
const ITEM_COL = 2;

export class TraderScene implements Scene {
  private readonly trader: Trader;
  private readonly traderName: string;
  private readonly chrome: ScreenChrome;
  private readonly onHub: () => void;
  private readonly onUndock: () => void;
  private activeTab: TabKey = 'BUY';
  private cursorIdx = 0;
  private activated = false;

  // Tab column ranges (computed in render, used for tap)
  private buyTabStart = 0;
  private buyTabEnd = 0;
  private sellTabStart = 0;
  private sellTabEnd = 0;

  constructor(inputHandler: InputHandler, context: GameContext, destinationId: string, onHub: () => void, onUndock: () => void) {
    const dest = getDestination(destinationId)!;
    this.traderName = dest.npcs.trader?.toUpperCase() ?? 'TRADER';
    this.trader = TRADERS[0];
    this.chrome = new ScreenChrome(context);
    this.onHub = onHub;
    this.onUndock = onUndock;

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
      } else if (action === 'BACK' || action === 'NAV_2') {
        this.activated = true;
        onHub();
      } else if (action === 'NAV_1') {
        this.activated = true;
        onUndock();
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((col, row) => {
        if (this.activated) return;
        const navHit = this.chrome.hitTestNav(col, row);
        if (navHit === 'hub')    { this.activated = true; onHub();    return; }
        if (navHit === 'undock') { this.activated = true; onUndock(); return; }

        if (row === TAB_ROW) {
          if (col >= this.buyTabStart && col < this.buyTabEnd) {
            this.activeTab = 'BUY'; this.cursorIdx = 0; return;
          }
          if (col >= this.sellTabStart && col < this.sellTabEnd) {
            this.activeTab = 'SELL'; this.cursorIdx = 0; return;
          }
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

  private displayName(item: TraderItem): string {
    if (this.activeTab === 'SELL' && item.qty !== undefined) {
      return `${item.name} (x${item.qty})`;
    }
    return item.name;
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

    this.chrome.render(buffer, {
      showHeader: true,
      showFooter: true,
      navOptions: [{ id: 'undock', label: 'UNDOCK' }, { id: 'hub', label: 'HUB' }],
    });

    // Title + underline
    writeText(buffer, CONTENT_TOP, 2, this.traderName, 'bright-blue', 'black');
    writeText(buffer, CONTENT_TOP + 1, 2, "'".repeat(this.traderName.length), 'bright-black', 'black');

    // Tab bar: | BUY | SELL | left-aligned
    const buyLabel = ' BUY ';
    const sellLabel = ' SELL ';
    const tabStartCol = 2;

    // Draw pipe chars
    buffer[TAB_ROW][tabStartCol] = { char: '|', fg: 'bright-black', bg: 'black' };

    let tc = tabStartCol + 1;
    this.buyTabStart = tc;
    const buyFg: Color = this.activeTab === 'BUY' ? 'black' : 'white';
    const buyBg: Color = this.activeTab === 'BUY' ? 'green' : 'black';
    for (const ch of buyLabel) {
      buffer[TAB_ROW][tc] = { char: ch, fg: buyFg, bg: buyBg };
      tc++;
    }
    this.buyTabEnd = tc;

    buffer[TAB_ROW][tc] = { char: '|', fg: 'bright-black', bg: 'black' };
    tc++;

    this.sellTabStart = tc;
    const sellFg: Color = this.activeTab === 'SELL' ? 'black' : 'white';
    const sellBg: Color = this.activeTab === 'SELL' ? 'green' : 'black';
    for (const ch of sellLabel) {
      buffer[TAB_ROW][tc] = { char: ch, fg: sellFg, bg: sellBg };
      tc++;
    }
    this.sellTabEnd = tc;

    buffer[TAB_ROW][tc] = { char: '|', fg: 'bright-black', bg: 'black' };

    const contentEnd = contentBottom(h, true);
    const items = this.currentItems();
    for (let i = 0; i < items.length; i++) {
      const row = ITEM_ROW_START + i;
      if (row >= contentEnd - 1) break;
      const item = items[i];
      const isCursor = i === this.cursorIdx;
      const prefix = isCursor ? '> ' : '  ';
      const name = this.displayName(item);
      const priceStr = `${item.price} CR`;
      const dotLen = Math.max(1, (w - 4) - prefix.length - name.length - 2 - priceStr.length);
      const fg: Color = isCursor ? 'bright-green' : 'white';
      writeText(buffer, row, ITEM_COL, prefix + name + ' ', fg, 'black');
      writeText(buffer, row, ITEM_COL + prefix.length + name.length + 1,
        '.'.repeat(dotLen), 'bright-black', 'black');
      writeText(buffer, row, ITEM_COL + prefix.length + name.length + 1 + dotLen + 1,
        priceStr, fg, 'black');
    }
  }
}
