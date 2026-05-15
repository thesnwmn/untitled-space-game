import type { CharBuffer, GameAction } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';

export interface NumberFieldDef {
  label: string;
  initialValue: number;
  min: number;
  max: number;
}

export interface DerivedRowDef {
  label: string;
  compute: (value: number) => string;
}

export interface ModalFormDef {
  title: string;
  field: NumberFieldDef;
  derivedRows: DerivedRowDef[];
  confirmLabel: string;
  onConfirm: (value: number) => void;
  onCancel: () => void;
}

type Focus = 'field' | 'confirm' | 'cancel';

interface Rect { col: number; row: number; width: number; }

const DIALOG_WIDTH = 30;

export class ModalInputDialog {
  private readonly formDef: ModalFormDef;
  private value: number;
  private focus: Focus = 'field';
  private replaceNextDigit = true;

  private confirmRect: Rect | null = null;
  private cancelRect: Rect | null = null;

  constructor(formDef: ModalFormDef) {
    this.formDef = formDef;
    this.value = Math.max(formDef.field.min, Math.min(formDef.field.max, formDef.field.initialValue));
  }

  handleAction(action: GameAction): void {
    const { field } = this.formDef;

    if (action === 'BACK') { this.formDef.onCancel(); return; }
    if (action === 'UP')    { this.value = Math.min(field.max, this.value + 1);  return; }
    if (action === 'DOWN')  { this.value = Math.max(field.min, this.value - 1);  return; }
    if (action === 'RIGHT') { this.value = Math.min(field.max, this.value + 10); return; }
    if (action === 'LEFT')  { this.value = Math.max(field.min, this.value - 10); return; }

    if (action === 'TAB') {
      if (this.focus === 'field') this.focus = 'confirm';
      else if (this.focus === 'confirm') this.focus = 'cancel';
      else this.focus = 'field';
      return;
    }

    if (action === 'SELECT') {
      if (this.focus === 'cancel') this.formDef.onCancel();
      else this.formDef.onConfirm(this.value);
    }
  }

  handleCharInput(char: string): void {
    if (this.focus !== 'field') return;
    const { field } = this.formDef;

    if (char === '\b') {
      this.value = Math.floor(this.value / 10);
      if (this.value === 0) this.replaceNextDigit = true;
    } else if (char >= '0' && char <= '9') {
      const digit = parseInt(char, 10);
      if (this.replaceNextDigit) {
        this.value = Math.max(field.min, Math.min(field.max, digit));
        this.replaceNextDigit = false;
      } else {
        this.value = Math.min(field.max, this.value * 10 + digit);
      }
    }
  }

  handleTap(col: number, row: number): void {
    if (this.confirmRect && row === this.confirmRect.row &&
        col >= this.confirmRect.col && col < this.confirmRect.col + this.confirmRect.width) {
      this.formDef.onConfirm(this.value);
    } else if (this.cancelRect && row === this.cancelRect.row &&
               col >= this.cancelRect.col && col < this.cancelRect.col + this.cancelRect.width) {
      this.formDef.onCancel();
    }
  }

  render(buffer: CharBuffer): void {
    const bufH = buffer.length;
    const bufW = bufH > 0 ? buffer[0].length : 0;

    const { title, field, derivedRows, confirmLabel } = this.formDef;
    const D = derivedRows.length;
    const dialogH = 8 + D;
    const dialogW = DIALOG_WIDTH;

    const dialogCol = Math.floor((bufW - dialogW) / 2);
    const dialogRow = Math.floor((bufH - dialogH) / 2);

    // Fill dialog area with black background
    for (let r = 0; r < dialogH; r++) {
      for (let c = 0; c < dialogW; c++) {
        const br = dialogRow + r;
        const bc = dialogCol + c;
        if (br >= 0 && br < bufH && bc >= 0 && bc < bufW) {
          buffer[br][bc] = { char: ' ', fg: 'white', bg: 'black' };
        }
      }
    }

    // Helper to set a single border cell
    const setCell = (br: number, bc: number, char: string): void => {
      if (br >= 0 && br < bufH && bc >= 0 && bc < bufW) {
        buffer[br][bc] = { char, fg: 'white', bg: 'black' };
      }
    };

    // Top border
    setCell(dialogRow, dialogCol, '+');
    setCell(dialogRow, dialogCol + dialogW - 1, '+');
    for (let c = 1; c < dialogW - 1; c++) setCell(dialogRow, dialogCol + c, '-');

    // Bottom border
    setCell(dialogRow + dialogH - 1, dialogCol, '+');
    setCell(dialogRow + dialogH - 1, dialogCol + dialogW - 1, '+');
    for (let c = 1; c < dialogW - 1; c++) setCell(dialogRow + dialogH - 1, dialogCol + c, '-');

    // Side borders
    for (let r = 1; r < dialogH - 1; r++) {
      setCell(dialogRow + r, dialogCol, '|');
      setCell(dialogRow + r, dialogCol + dialogW - 1, '|');
    }

    // Inner width = dialogW - 2 = 28
    const innerW = dialogW - 2;

    // Title (row 1), centered in inner
    const titleRow = dialogRow + 1;
    const titleStartCol = dialogCol + 1 + Math.floor((innerW - title.length) / 2);
    writeText(buffer, titleRow, titleStartCol, title, 'bright-white', 'black');

    // Underline (row 2)
    writeText(buffer, dialogRow + 2, titleStartCol, "'".repeat(title.length), 'bright-black', 'black');

    // Compute label column width for field + derived rows
    const allLabels = [field.label, ...derivedRows.map(r => r.label)];
    const labelWidth = Math.max(...allLabels.map(l => l.length));

    // Value box starts at: dialogCol + 1 (content) + labelWidth + 3 (" : ")
    const valueBoxCol = dialogCol + 1 + labelWidth + 3;
    const fieldRow = dialogRow + 4;

    // Number field row (row 4)
    const fieldFocused = this.focus === 'field';
    writeText(buffer, fieldRow, dialogCol + 1, field.label.padEnd(labelWidth) + ' : ', 'white', 'black');
    const valueStr = this.value.toString().padStart(5);
    writeText(buffer, fieldRow, valueBoxCol, valueStr,
      fieldFocused ? 'black' : 'white',
      fieldFocused ? 'green' : 'black');

    // Derived rows (rows 5..4+D)
    for (let i = 0; i < D; i++) {
      const dr = derivedRows[i];
      const drRow = dialogRow + 5 + i;
      const computed = dr.compute(this.value);
      writeText(buffer, drRow, dialogCol + 1, dr.label.padEnd(labelWidth) + ' : ', 'white', 'black');
      writeText(buffer, drRow, valueBoxCol, computed, 'white', 'black');
    }

    // Button row at dialogRow + 4 + D + 2
    const btnRow = dialogRow + 4 + D + 2;

    const confirmFull = `[ ${confirmLabel} ]`;
    const cancelFull = `[ CANCEL ]`;
    const gap = 3;
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
  }
}
