import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import { ScreenChrome, CONTENT_TOP, contentBottom } from '../ui/ScreenChrome';
import type { NavOption, ChromeConfig } from '../ui/ScreenChrome';

export interface MenuItemDef {
  label: string;
  info?: string;
  infoFg?: Color;       // overrides default fg for the info text
  details?: string[];
  disabled?: boolean;
  icon?: string;        // prefix text rendered before the label (e.g. '[R] ')
  iconFg?: Color;       // fg for the icon text
  action: () => void;
}

export interface TabDef {
  label: string;
  items: MenuItemDef[];
}

// Layout
// Row CONTENT_TOP (3):   title in bright-white
// Row CONTENT_TOP+1 (4): underline in bright-black
// Row CONTENT_TOP+2 (5): blank (separator)
// If tabs:
//   Row CONTENT_TOP+3 (6): tab bar
//   Row CONTENT_TOP+4 (7): items start
// Else:
//   Row CONTENT_TOP+3+infoLines.length (6+): items start
//   (infoLines at CONTENT_TOP+2 … CONTENT_TOP+1+n, then implicit blank)

export abstract class BaseMenuScene implements Scene {
  private readonly title: string;
  private readonly _staticItems: MenuItemDef[];
  protected readonly tabs: TabDef[] | null;
  protected activeTabIdx = 0;
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
    tabs: TabDef[] | null = null,
  ) {
    this.title = title;
    this._staticItems = items;
    this.tabs = tabs;
    this.context = context;
    this.chrome = new ScreenChrome(context);
    this.navOptions = navOptions;
    this.infoLines = infoLines;
    this.itemStartRow = tabs !== null
      ? CONTENT_TOP + 4          // tab bar at CONTENT_TOP+3, items at +4
      : CONTENT_TOP + 3 + infoLines.length;

    inputHandler.onAction((action) => {
      if (this.activated) return;
      if (action === 'UP') {
        this.moveCursor(-1);
      } else if (action === 'DOWN') {
        this.moveCursor(1);
      } else if (action === 'LEFT' && this.tabs !== null) {
        this.activeTabIdx = Math.max(0, this.activeTabIdx - 1);
        this.cursorIdx = 0;
      } else if (action === 'RIGHT' && this.tabs !== null) {
        this.activeTabIdx = Math.min(this.tabs.length - 1, this.activeTabIdx + 1);
        this.cursorIdx = 0;
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
        // Tab bar hit test
        if (this.tabs !== null && row === CONTENT_TOP + 3) {
          let c = 3; // content starts after opening | at col 2
          for (let i = 0; i < this.tabs.length; i++) {
            const len = this.tabs[i].label.length + 2; // ' LABEL '
            if (col >= c && col < c + len) {
              this.activeTabIdx = i;
              this.cursorIdx = 0;
              return;
            }
            c += len + 1; // +1 for | separator
          }
        }
        const itemIdx = this.rowToVisibleItemIndex(row);
        if (itemIdx !== null) {
          this.cursorIdx = itemIdx;
          this.activateCurrent();
        }
      });
    }
  }

  protected get items(): MenuItemDef[] {
    if (this.tabs !== null) {
      return this.tabs[this.activeTabIdx]?.items ?? [];
    }
    return this._staticItems;
  }

  private moveCursor(delta: number): void {
    const n = this.items.length;
    if (n === 0) return;
    this.cursorIdx = (this.cursorIdx + delta + n) % n;
  }

  protected activateCurrent(): void {
    if (this.items.length === 0) return;
    const item = this.items[this.cursorIdx];
    if (item.disabled) return;
    this.activated = true;
    item.action();
  }

  private rowToVisibleItemIndex(row: number): number | null {
    let r = this.itemStartRow;
    const items = this.items;
    for (let i = 0; i < items.length; i++) {
      const itemHeight = 1 + (items[i].details?.length ?? 0);
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

    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++)
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };

    const config = this.buildChromeConfig();
    this.chrome.render(buffer, config);

    // Title (bright-white) and underline
    writeText(buffer, CONTENT_TOP, 2, this.title, 'bright-white', 'black');
    writeText(buffer, CONTENT_TOP + 1, 2, "'".repeat(this.title.length), 'bright-black', 'black');

    // Info lines (start at CONTENT_TOP+2; blank gap at CONTENT_TOP+2+n is implicit)
    for (let i = 0; i < this.infoLines.length; i++) {
      writeText(buffer, CONTENT_TOP + 2 + i, 2, this.infoLines[i], 'bright-black', 'black');
    }

    // Tab bar (only when tabs are configured)
    if (this.tabs !== null) {
      const tabRow = CONTENT_TOP + 3;
      let tc = 2;
      buffer[tabRow][tc] = { char: '|', fg: 'bright-black', bg: 'black' };
      tc++;
      for (let i = 0; i < this.tabs.length; i++) {
        const isActive = i === this.activeTabIdx;
        const content = ` ${this.tabs[i].label} `;
        const fg: Color = isActive ? 'black' : 'white';
        const bg: Color = isActive ? 'green' : 'black';
        for (const ch of content) {
          if (tc < w) buffer[tabRow][tc] = { char: ch, fg, bg };
          tc++;
        }
        if (tc < w) buffer[tabRow][tc] = { char: '|', fg: 'bright-black', bg: 'black' };
        tc++;
      }
    }

    // Pagination
    const contentEnd = contentBottom(h, config.showFooter);
    const lastContentRow = contentEnd - 1;
    const availableRows = lastContentRow - this.itemStartRow;
    const items = this.items;
    const allHeights = items.map(item => 1 + (item.details?.length ?? 0));
    const totalHeight = allHeights.reduce((a, b) => a + b, 0);
    const needsPager = totalHeight > availableRows;
    const pageRows = needsPager ? availableRows - 1 : availableRows;

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
      const item = items[i];
      const isCursor = i === this.cursorIdx;
      const cursorFg: Color = item.disabled ? 'bright-black' : isCursor ? 'bright-green' : 'white';
      const infoFg: Color = item.infoFg ?? cursorFg;

      const maxWidth = w - 4; // 2-char gutter each side

      if (item.icon !== undefined) {
        // Icon items: cursor(1) + icon + label + dots + info
        const iconLen = item.icon.length;
        const cursorChar = isCursor ? '>' : ' ';
        writeText(buffer, row, 2, cursorChar, cursorFg, 'black');
        writeText(buffer, row, 3, item.icon, item.iconFg ?? cursorFg, 'black');
        if (item.info !== undefined) {
          const dotLen = Math.max(1, maxWidth - 1 - iconLen - item.label.length - 2 - item.info.length);
          writeText(buffer, row, 3 + iconLen, item.label + ' ', cursorFg, 'black');
          writeText(buffer, row, 3 + iconLen + item.label.length + 1, '.'.repeat(dotLen), 'bright-black', 'black');
          writeText(buffer, row, 3 + iconLen + item.label.length + 1 + dotLen + 1, item.info, infoFg, 'black');
        } else {
          writeText(buffer, row, 3 + iconLen, item.label.slice(0, maxWidth - 1 - iconLen), cursorFg, 'black');
        }
      } else if (item.info !== undefined) {
        const prefix = isCursor ? '> ' : '  ';
        const dotLen = Math.max(1, maxWidth - 2 - item.label.length - 2 - item.info.length);
        writeText(buffer, row, 2, prefix + item.label + ' ', cursorFg, 'black');
        writeText(buffer, row, 2 + prefix.length + item.label.length + 1, '.'.repeat(dotLen), 'bright-black', 'black');
        writeText(buffer, row, 2 + prefix.length + item.label.length + 1 + dotLen + 1, item.info, infoFg, 'black');
      } else if (item.details !== undefined && item.details.length > 0) {
        const prefix = isCursor ? '> ' : '  ';
        writeText(buffer, row, 2, (prefix + item.label).slice(0, maxWidth), cursorFg, 'black');
        for (let d = 0; d < item.details.length; d++) {
          if (row + 1 + d <= lastContentRow) {
            writeText(buffer, row + 1 + d, 2, ('  ' + item.details[d]).slice(0, maxWidth), 'bright-black', 'black');
          }
        }
      } else {
        const prefix = isCursor ? '> ' : '  ';
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
