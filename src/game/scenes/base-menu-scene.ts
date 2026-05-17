import type { InputHandler, GameContext, CharBuffer, Color, GameAction } from '../../shared/types';
import { writeText, renderPager } from '../../shared/buffer-utils';
import { contentBottom } from '../ui/screen-chrome';
import type { NavOption } from '../ui/screen-chrome';
import type { PlayerState } from '../player-state';
import type { Modal } from '../ui/modal';
import { BaseScene } from './base-scene';
import { CONTENT_TOP } from '../ui/screen-chrome';

export interface MenuItemDef {
  label: string;
  info?: string;
  infoFg?: Color;
  details?: string[];
  detailsFg?: Color;
  detailsColored?: Array<{
    left: Array<{ text: string; fg: Color }>;
    right?: { text: string; fg: Color };
  }>;
  disabled?: boolean;
  icon?: string;
  iconFg?: Color;
  accentFg?: Color;
  action: () => void;
}

export interface TabDef {
  label: string;
  items: MenuItemDef[];
}

// Layout (with title, no summary, no tabs):
//   Row CONTENT_TOP (3):   title
//   Row CONTENT_TOP+1 (4): underline
//   Row CONTENT_TOP+2 (5): blank
//   Row CONTENT_TOP+3 (6): items start
// With tabs (no summary):
//   Row CONTENT_TOP+3 (6): tab bar (rendered by BaseScene)
//   Row CONTENT_TOP+4 (7): blank
//   Row CONTENT_TOP+5 (8): items start

export abstract class BaseMenuScene extends BaseScene {
  private readonly _staticItems: MenuItemDef[];
  protected readonly tabs: TabDef[] | null;
  protected readonly infoLines: string[];
  protected cursorIdx = -1;
  private pageIndex = 0;
  private lastPageCount = 1;
  protected modal: Modal | null = null;
  protected lastContentTop = 0;

  constructor(
    title: string,
    items: MenuItemDef[],
    navOptions: ReadonlyArray<NavOption>,
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    infoLines: string[] = [],
    tabs: TabDef[] | null = null,
    onMenu?: () => void,
  ) {
    super(inputHandler, context, player, {
      navOptions,
      title,
      summary: infoLines,
      tabs: tabs !== null ? tabs.map(t => t.label) : undefined,
      onMenu,
    });
    this._staticItems = items;
    this.tabs = tabs;
    this.infoLines = infoLines;
    const N = infoLines.length;
    this.lastContentTop = tabs !== null ? CONTENT_TOP + 5 + N : CONTENT_TOP + 3 + N;
    this.resetCursor();
  }

  protected get items(): MenuItemDef[] {
    if (this.tabs !== null) {
      return this.tabs[this.activeTabIdx]?.items ?? [];
    }
    return this._staticItems;
  }

  protected override preHandleAction(action: GameAction): boolean {
    if (this.modal !== null) {
      this.modal.handleAction(action);
      return true;
    }
    return false;
  }

  protected override preHandleTap(col: number, row: number): boolean {
    if (this.modal !== null) {
      this.modal.handleTap(col, row);
      return true;
    }
    return false;
  }

  protected override handleCharInput(char: string): void {
    if (this.modal !== null) {
      this.modal.handleCharInput(char);
    }
  }

  protected override onTabChange(_newIdx: number): void {
    this.resetCursor();
  }

  protected override handleAction(action: GameAction): void {
    if (action === 'UP') {
      this.moveCursor(-1);
    } else if (action === 'DOWN') {
      this.moveCursor(1);
    } else if (action === 'PAGE_UP') {
      this.pageIndex = (this.pageIndex - 1 + this.lastPageCount) % this.lastPageCount;
      this.resetCursor();
    } else if (action === 'PAGE_DOWN') {
      this.pageIndex = (this.pageIndex + 1) % this.lastPageCount;
      this.resetCursor();
    } else if (action === 'SELECT') {
      this.activateCurrent();
    } else {
      this.handleNavAction(action);
    }
  }

  protected override handleTap(col: number, row: number): void {
    const itemIdx = this.rowToVisibleItemIndex(row);
    if (itemIdx !== null && !this.items[itemIdx].disabled) {
      this.cursorIdx = itemIdx;
      this.activateCurrent();
    }
  }

  private moveCursor(delta: number): void {
    const items = this.items;
    const n = items.length;
    if (n === 0) return;
    const start = this.cursorIdx === -1
      ? (delta > 0 ? n - 1 : 0)
      : this.cursorIdx;
    for (let tries = 0; tries < n; tries++) {
      const next = ((start + delta * (tries + 1)) % n + n) % n;
      if (!items[next].disabled) {
        this.cursorIdx = next;
        return;
      }
    }
  }

  protected activateCurrent(): void {
    if (this.items.length === 0 || this.cursorIdx === -1) return;
    const item = this.items[this.cursorIdx];
    if (item.disabled) return;
    this.activated = true;
    item.action();
  }

  private rowToVisibleItemIndex(row: number): number | null {
    let r = this.lastContentTop;
    const items = this.items;
    for (let i = 0; i < items.length; i++) {
      const itemHeight = 1 + (items[i].details?.length ?? 0) + (items[i].detailsColored?.length ?? 0);
      if (row >= r && row < r + itemHeight) return i;
      r += itemHeight;
    }
    return null;
  }

  protected resetCursor(): void {
    const items = this.items;
    for (let i = 0; i < items.length; i++) {
      if (!items[i].disabled) {
        this.cursorIdx = i;
        return;
      }
    }
    this.cursorIdx = -1;
  }

  protected handleNavAction(_action: string): void {}

  protected openModal(modal: Modal): void {
    this.modal = modal;
    this.activated = false;
  }

  protected closeModal(): void {
    this.modal = null;
  }

  protected override renderContent(buffer: CharBuffer, top: number, bottom: number): void {
    this.lastContentTop = top;

    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;

    const lastContentRow = bottom - 1;
    const availableRows = lastContentRow - top;
    const items = this.items;
    const allHeights = items.map(item => 1 + (item.details?.length ?? 0) + (item.detailsColored?.length ?? 0));
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

    let row = top;
    for (const i of pageItems) {
      const item = items[i];
      const isCursor = i === this.cursorIdx;
      const cursorFg: Color = item.disabled ? 'bright-black' : isCursor ? 'bright-green' : (item.accentFg ?? 'white');
      const infoFg: Color = item.infoFg ?? cursorFg;

      const maxWidth = w - 4;

      if (item.icon !== undefined) {
        const iconLen = item.icon.length;
        const cursorChar = isCursor ? '>' : ' ';
        writeText(buffer, row, 2, cursorChar, cursorFg, 'black');
        writeText(buffer, row, 3, item.icon, item.iconFg ?? cursorFg, 'black');
        if (item.info !== undefined) {
          const infoLen = item.info.length;
          const maxLabelLen = Math.max(0, maxWidth - 1 - iconLen - 2 - infoLen - 1);
          const truncLabel = item.label.length > maxLabelLen ? item.label.slice(0, maxLabelLen) : item.label;
          const dotLen = Math.max(1, maxWidth - 1 - iconLen - truncLabel.length - 2 - infoLen);
          writeText(buffer, row, 3 + iconLen, truncLabel + ' ', cursorFg, 'black');
          writeText(buffer, row, 3 + iconLen + truncLabel.length + 1, '.'.repeat(dotLen), 'bright-black', 'black');
          writeText(buffer, row, 3 + iconLen + truncLabel.length + 1 + dotLen + 1, item.info, infoFg, 'black');
        } else {
          writeText(buffer, row, 3 + iconLen, item.label.slice(0, maxWidth - 1 - iconLen), cursorFg, 'black');
        }
        for (let d = 0; d < (item.details?.length ?? 0); d++) {
          if (row + 1 + d <= lastContentRow) {
            writeText(buffer, row + 1 + d, 2, ('  ' + item.details![d]).slice(0, maxWidth), item.detailsFg ?? 'bright-black', 'black');
          }
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
            writeText(buffer, row + 1 + d, 2, ('  ' + item.details[d]).slice(0, maxWidth), item.detailsFg ?? 'bright-black', 'black');
          }
        }
      } else {
        const prefix = isCursor ? '> ' : '  ';
        writeText(buffer, row, 2, (prefix + item.label).slice(0, maxWidth), cursorFg, 'black');
      }
      const detailsOffset = item.details?.length ?? 0;
      for (let d = 0; d < (item.detailsColored?.length ?? 0); d++) {
        const detailRow = row + 1 + detailsOffset + d;
        if (detailRow <= lastContentRow) {
          const line = item.detailsColored![d];
          let col = 4;
          for (const seg of line.left) {
            writeText(buffer, detailRow, col, seg.text, seg.fg, 'black');
            col += seg.text.length;
          }
          if (line.right !== undefined) {
            const rightCol = maxWidth - 2 - line.right.text.length;
            writeText(buffer, detailRow, rightCol, line.right.text, line.right.fg, 'black');
          }
        }
      }
      row += 1 + detailsOffset + (item.detailsColored?.length ?? 0);
    }

    if (needsPager) {
      renderPager(buffer, lastContentRow, w, this.pageIndex, this.lastPageCount);
    }

    if (this.modal !== null) {
      this.modal.render(buffer);
    }
  }
}
