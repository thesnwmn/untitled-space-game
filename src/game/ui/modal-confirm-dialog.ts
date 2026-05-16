import type { CharBuffer, GameAction } from '../../shared/types';
import type { Modal } from './modal';
import { writeText, wrapText } from '../../shared/buffer-utils';

export interface ModalConfirmDialogOptions {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

type Focus = 'confirm' | 'cancel';

interface Rect { col: number; row: number; width: number; }

const DIALOG_WIDTH = 40;

export class ModalConfirmDialog implements Modal {
  private readonly opts: ModalConfirmDialogOptions;
  private focus: Focus = 'confirm';
  private confirmRect: Rect | null = null;
  private cancelRect: Rect | null = null;

  constructor(opts: ModalConfirmDialogOptions) {
    this.opts = opts;
  }

  handleAction(action: GameAction): void {
    if (action === 'BACK') {
      this.opts.onConfirm();
      return;
    }

    if (action === 'LEFT' || action === 'RIGHT' || action === 'TAB') {
      if (this.opts.cancelLabel !== undefined) {
        this.focus = this.focus === 'confirm' ? 'cancel' : 'confirm';
      }
      return;
    }

    if (action === 'SELECT') {
      if (this.focus === 'cancel') {
        this.opts.onCancel?.();
      } else {
        this.opts.onConfirm();
      }
    }
  }

  handleCharInput(_char: string): void {}

  handleTap(col: number, row: number): void {
    if (this.confirmRect &&
        row === this.confirmRect.row &&
        col >= this.confirmRect.col &&
        col < this.confirmRect.col + this.confirmRect.width) {
      this.opts.onConfirm();
    } else if (this.cancelRect &&
               row === this.cancelRect.row &&
               col >= this.cancelRect.col &&
               col < this.cancelRect.col + this.cancelRect.width) {
      this.opts.onCancel?.();
    }
  }

  render(buffer: CharBuffer): void {
    const bufH = buffer.length;
    const bufW = bufH > 0 ? buffer[0].length : 0;

    const { title, body, confirmLabel, cancelLabel } = this.opts;
    const innerW = DIALOG_WIDTH - 2;
    const bodyLines = wrapText(body, innerW);
    const bodyH = bodyLines.length;

    // top border + title + underline + blank + body lines + blank + buttons + bottom border
    const dialogH = 1 + 1 + 1 + 1 + bodyH + 1 + 1 + 1;
    const dialogW = DIALOG_WIDTH;

    const dialogCol = Math.floor((bufW - dialogW) / 2);
    const dialogRow = Math.floor((bufH - dialogH) / 2);

    for (let r = 0; r < dialogH; r++) {
      for (let c = 0; c < dialogW; c++) {
        const br = dialogRow + r;
        const bc = dialogCol + c;
        if (br >= 0 && br < bufH && bc >= 0 && bc < bufW) {
          buffer[br][bc] = { char: ' ', fg: 'white', bg: 'black' };
        }
      }
    }

    const setCell = (br: number, bc: number, char: string): void => {
      if (br >= 0 && br < bufH && bc >= 0 && bc < bufW) {
        buffer[br][bc] = { char, fg: 'white', bg: 'black' };
      }
    };

    setCell(dialogRow, dialogCol, '+');
    setCell(dialogRow, dialogCol + dialogW - 1, '+');
    for (let c = 1; c < dialogW - 1; c++) setCell(dialogRow, dialogCol + c, '-');

    setCell(dialogRow + dialogH - 1, dialogCol, '+');
    setCell(dialogRow + dialogH - 1, dialogCol + dialogW - 1, '+');
    for (let c = 1; c < dialogW - 1; c++) setCell(dialogRow + dialogH - 1, dialogCol + c, '-');

    for (let r = 1; r < dialogH - 1; r++) {
      setCell(dialogRow + r, dialogCol, '|');
      setCell(dialogRow + r, dialogCol + dialogW - 1, '|');
    }

    const titleTrunc = title.slice(0, innerW);
    const titleRow = dialogRow + 1;
    const titleStartCol = dialogCol + 1 + Math.floor((innerW - titleTrunc.length) / 2);
    writeText(buffer, titleRow, titleStartCol, titleTrunc, 'bright-white', 'black');
    writeText(buffer, dialogRow + 2, titleStartCol, "'".repeat(titleTrunc.length), 'bright-black', 'black');

    for (let i = 0; i < bodyLines.length; i++) {
      writeText(buffer, dialogRow + 4 + i, dialogCol + 1, bodyLines[i], 'white', 'black');
    }

    const btnRow = dialogRow + 4 + bodyH + 1;

    const confirmFull = `[ ${confirmLabel} ]`;

    if (cancelLabel !== undefined) {
      const cancelFull = `[ ${cancelLabel} ]`;
      const gap = 2;
      const totalBtns = confirmFull.length + gap + cancelFull.length;
      const btnLeftPad = Math.floor((innerW - totalBtns) / 2);

      const confirmBtnCol = dialogCol + 1 + btnLeftPad;
      const cancelBtnCol = confirmBtnCol + confirmFull.length + gap;

      this.confirmRect = { col: confirmBtnCol, row: btnRow, width: confirmFull.length };
      this.cancelRect = { col: cancelBtnCol, row: btnRow, width: cancelFull.length };

      const confirmFocused = this.focus === 'confirm';
      const cancelFocused = this.focus === 'cancel';
      writeText(buffer, btnRow, confirmBtnCol, confirmFull,
        confirmFocused ? 'black' : 'white',
        confirmFocused ? 'green' : 'black');
      writeText(buffer, btnRow, cancelBtnCol, cancelFull,
        cancelFocused ? 'black' : 'white',
        cancelFocused ? 'green' : 'black');
    } else {
      const btnLeftPad = Math.floor((innerW - confirmFull.length) / 2);
      const confirmBtnCol = dialogCol + 1 + btnLeftPad;

      this.confirmRect = { col: confirmBtnCol, row: btnRow, width: confirmFull.length };
      this.cancelRect = null;

      writeText(buffer, btnRow, confirmBtnCol, confirmFull, 'black', 'green');
    }
  }
}
