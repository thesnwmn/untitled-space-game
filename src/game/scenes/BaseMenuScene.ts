import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import { ScreenChrome, CONTENT_TOP, contentBottom } from '../ui/ScreenChrome';
import type { NavOption, ChromeConfig } from '../ui/ScreenChrome';

export interface MenuItemDef {
  label: string;
  info?: string;
  details?: string[];
  action: () => void;
}

export abstract class BaseMenuScene implements Scene {
  private readonly title: string;
  protected readonly items: MenuItemDef[];
  private readonly context: GameContext;
  protected readonly chrome: ScreenChrome;
  private readonly navOptions: ReadonlyArray<NavOption>;
  protected readonly infoLines: string[];
  protected readonly itemStartRow: number;
  protected cursorIdx = 0;
  private pageIndex = 0;
  private lastPageCount = 1;
  protected activated = false;

  constructor(
    title: string,
    items: MenuItemDef[],
    navOptions: ReadonlyArray<NavOption>,
    inputHandler: InputHandler,
    context: GameContext,
    infoLines: string[] = [],
  ) {
    this.title = title;
    this.items = items;
    this.context = context;
    this.chrome = new ScreenChrome(context);
    this.navOptions = navOptions;
    this.infoLines = infoLines;
    this.itemStartRow = CONTENT_TOP + 2 + (infoLines.length > 0 ? infoLines.length + 1 : 0);

    inputHandler.onAction((action) => {
      if (this.activated) return;
      if (action === 'UP') {
        this.moveCursor(-1);
      } else if (action === 'DOWN') {
        this.moveCursor(1);
      } else if (action === 'PAGE_UP') {
        this.pageIndex = (this.pageIndex - 1 + this.lastPageCount) % this.lastPageCount;
        this.cursorIdx = 0;
      } else if (action === 'PAGE_DOWN') {
        this.pageIndex = (this.pageIndex + 1) % this.lastPageCount;
        this.cursorIdx = 0;
      } else if (action === 'SELECT') {
        this.activateCurrent();
      } else {
        this.handleNavAction(action);
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((col, row) => {
        if (this.activated) return;
        const navId = this.chrome.hitTestNav(col, row);
        if (navId !== null) {
          this.handleNavTap(navId);
          return;
        }
        const itemIdx = this.rowToVisibleItemIndex(row);
        if (itemIdx !== null) {
          this.cursorIdx = itemIdx;
          this.activateCurrent();
        }
      });
    }
  }

  private moveCursor(delta: number): void {
    const n = this.items.length;
    if (n === 0) return;
    this.cursorIdx = (this.cursorIdx + delta + n) % n;
  }

  private activateCurrent(): void {
    if (this.items.length === 0) return;
    this.activated = true;
    this.items[this.cursorIdx].action();
  }

  // Row → item index (for tap). Uses simple item heights (no paging taken into account).
  private rowToVisibleItemIndex(row: number): number | null {
    let r = this.itemStartRow;
    for (let i = 0; i < this.items.length; i++) {
      const itemHeight = 1 + (this.items[i].details?.length ?? 0);
      if (row >= r && row < r + itemHeight) return i;
      r += itemHeight;
    }
    return null;
  }

  protected handleNavAction(_action: string): void {}
  protected handleNavTap(_navId: string): void {}

  protected buildChromeConfig(): ChromeConfig {
    return { showHeader: true, showFooter: true, navOptions: this.navOptions };
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

    const config = this.buildChromeConfig();
    this.chrome.render(buffer, config);

    writeText(buffer, CONTENT_TOP, 2, this.title, 'bright-blue', 'black');
    writeText(buffer, CONTENT_TOP + 1, 2, "'".repeat(this.title.length), 'bright-black', 'black');

    for (let i = 0; i < this.infoLines.length; i++) {
      writeText(buffer, CONTENT_TOP + 2 + i, 2, this.infoLines[i], 'bright-black', 'black');
    }

    // Pagination
    const contentEnd = contentBottom(h, config.showFooter);
    const lastContentRow = contentEnd - 1;
    const availableRows = lastContentRow - this.itemStartRow;
    const allHeights = this.items.map(item => 1 + (item.details?.length ?? 0));
    const totalHeight = allHeights.reduce((a, b) => a + b, 0);
    const needsPager = totalHeight > availableRows;
    const pageRows = needsPager ? availableRows - 1 : availableRows;

    // Build pages
    const pages: number[][] = [];
    let currentPage: number[] = [];
    let rowsUsed = 0;
    for (let i = 0; i < allHeights.length; i++) {
      if (rowsUsed + allHeights[i] > pageRows) {
        if (currentPage.length > 0) pages.push(currentPage);
        currentPage = [i];
        rowsUsed = allHeights[i];
      } else {
        currentPage.push(i);
        rowsUsed += allHeights[i];
      }
    }
    if (currentPage.length > 0) pages.push(currentPage);

    this.lastPageCount = Math.max(1, pages.length);
    if (this.pageIndex >= this.lastPageCount) this.pageIndex = this.lastPageCount - 1;

    const pageItems = pages[this.pageIndex] ?? [];

    let row = this.itemStartRow;
    for (const i of pageItems) {
      const item = this.items[i];
      const isCursor = i === this.cursorIdx;
      const prefix = isCursor ? '> ' : '  ';
      const cursorFg: Color = isCursor ? 'bright-green' : 'white';

      const maxWidth = w - 4; // 2-char gutter on each side
      if (item.info !== undefined) {
        const dotLen = Math.max(1, (w - 4) - 2 - item.label.length - item.info.length - 2);
        writeText(buffer, row, 2, prefix + item.label + ' ', cursorFg, 'black');
        writeText(buffer, row, 2 + prefix.length + item.label.length + 1,
          '.'.repeat(dotLen), 'bright-black', 'black');
        writeText(buffer, row, 2 + prefix.length + item.label.length + 1 + dotLen + 1,
          item.info, cursorFg, 'black');
      } else if (item.details !== undefined && item.details.length > 0) {
        writeText(buffer, row, 2, (prefix + item.label).slice(0, maxWidth), cursorFg, 'black');
        for (let d = 0; d < item.details.length; d++) {
          if (row + 1 + d <= lastContentRow) {
            writeText(buffer, row + 1 + d, 2, ('  ' + item.details[d]).slice(0, maxWidth), 'bright-black', 'black');
          }
        }
      } else {
        writeText(buffer, row, 2, (prefix + item.label).slice(0, maxWidth), cursorFg, 'black');
      }
      row += 1 + (item.details?.length ?? 0);
    }

    if (needsPager) {
      const pageStr = `${this.pageIndex + 1}/${this.lastPageCount}`;
      const pagerRow = lastContentRow;
      writeText(buffer, pagerRow, 0, '|<|', 'white', 'black');
      const centerCol = Math.floor((w - pageStr.length) / 2);
      writeText(buffer, pagerRow, centerCol, pageStr, 'bright-black', 'black');
      writeText(buffer, pagerRow, w - 3, '|>|', 'white', 'black');
    }
  }
}
