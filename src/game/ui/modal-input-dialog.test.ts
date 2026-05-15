import { describe, it, expect, vi } from 'vitest';
import { ModalInputDialog, type ModalFormDef } from './modal-input-dialog';
import type { CharBuffer, Color } from '../../shared/types';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

function rowText(buf: CharBuffer, row: number): string {
  return buf[row].map(c => c.char).join('');
}

function cellBg(buf: CharBuffer, row: number, col: number): Color {
  return buf[row][col].bg;
}

function cellFg(buf: CharBuffer, row: number, col: number): Color {
  return buf[row][col].fg;
}

// Standard form used across most tests
function makeForm(overrides: Partial<ModalFormDef> = {}): ModalFormDef {
  return {
    title: 'BUY IRON ORE',
    field: { label: 'Quantity', initialValue: 3, min: 0, max: 10 },
    derivedRows: [{ label: 'Total', compute: (qty: number) => `${qty * 80} CR` }],
    confirmLabel: 'BUY',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
}

// For a 40×30 buffer with 1 derived row: dialogH = 9
// dialogCol = floor((40-30)/2) = 5
// dialogRow = floor((30-9)/2) = 10
const BUF_W = 40;
const BUF_H = 30;
const DIALOG_COL = 5;
const DIALOG_ROW = 10;
const DIALOG_H = 9; // 8 + 1 derived row

// ── tests ─────────────────────────────────────────────────────────────────────

describe('ModalInputDialog — layout', () => {
  it('top border has + corners and - fill', () => {
    const dialog = new ModalInputDialog(makeForm());
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    expect(buf[DIALOG_ROW][DIALOG_COL].char).toBe('+');
    expect(buf[DIALOG_ROW][DIALOG_COL + 29].char).toBe('+');
    expect(buf[DIALOG_ROW][DIALOG_COL + 1].char).toBe('-');
  });

  it('bottom border at correct row', () => {
    const dialog = new ModalInputDialog(makeForm());
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const bottomRow = DIALOG_ROW + DIALOG_H - 1;
    expect(buf[bottomRow][DIALOG_COL].char).toBe('+');
    expect(buf[bottomRow][DIALOG_COL + 29].char).toBe('+');
  });

  it('side borders render as |', () => {
    const dialog = new ModalInputDialog(makeForm());
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    expect(buf[DIALOG_ROW + 1][DIALOG_COL].char).toBe('|');
    expect(buf[DIALOG_ROW + 1][DIALOG_COL + 29].char).toBe('|');
  });

  it('title renders at row 1 of dialog in bright-white', () => {
    const dialog = new ModalInputDialog(makeForm());
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const titleRow = DIALOG_ROW + 1;
    expect(rowText(buf, titleRow)).toContain('BUY IRON ORE');
    const firstTitleCol = buf[titleRow].findIndex(c => c.char !== ' ' && c.char !== '|');
    expect(buf[titleRow][firstTitleCol].fg).toBe('bright-white');
  });

  it('underline row 2 contains apostrophes in bright-black', () => {
    const dialog = new ModalInputDialog(makeForm());
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const underlineRow = DIALOG_ROW + 2;
    const underlineCell = buf[underlineRow].find(c => c.char === "'");
    expect(underlineCell).toBeDefined();
    expect(underlineCell!.fg).toBe('bright-black');
  });

  it('field label and initial value render on row 4', () => {
    const dialog = new ModalInputDialog(makeForm());
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const fieldRow = DIALOG_ROW + 4;
    const text = rowText(buf, fieldRow);
    expect(text).toContain('Quantity');
    expect(text).toContain('3'); // initial value
  });

  it('derived row renders with label and computed value', () => {
    const dialog = new ModalInputDialog(makeForm());
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const derivedRow = DIALOG_ROW + 5;
    const text = rowText(buf, derivedRow);
    expect(text).toContain('Total');
    expect(text).toContain('240 CR'); // 3 * 80
  });

  it('confirm and cancel button text present on button row', () => {
    const dialog = new ModalInputDialog(makeForm());
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const btnRow = DIALOG_ROW + 7; // row 4 + 1 derived + 2 = 7
    const text = rowText(buf, btnRow);
    expect(text).toContain('BUY');
    expect(text).toContain('CANCEL');
  });
});

describe('ModalInputDialog — focus styling', () => {
  it('field value box is green (focused) when field has focus', () => {
    const dialog = new ModalInputDialog(makeForm());
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const fieldRow = DIALOG_ROW + 4;
    // labelWidth = max(8,5) = 8; valueBoxCol = 5+1+8+3 = 17
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    expect(cellBg(buf, fieldRow, valueBoxCol)).toBe('green');
    expect(cellFg(buf, fieldRow, valueBoxCol)).toBe('black');
  });

  it('field value box is black (unfocused) when confirm has focus', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('TAB'); // field → confirm
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const fieldRow = DIALOG_ROW + 4;
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    expect(cellBg(buf, fieldRow, valueBoxCol)).toBe('black');
  });

  it('confirm button is green when focused', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('TAB'); // field → confirm
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const btnRow = DIALOG_ROW + 7;
    // Find the '[' of confirm button
    const confirmCol = buf[btnRow].findIndex(c => c.char === '[');
    expect(cellBg(buf, btnRow, confirmCol)).toBe('green');
  });

  it('cancel button is green when focused', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('TAB'); // field → confirm
    dialog.handleAction('TAB'); // confirm → cancel
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const btnRow = DIALOG_ROW + 7;
    // Find the last '[' (cancel button)
    const cancelCol = buf[btnRow].map((c, i) => c.char === '[' ? i : -1).filter(i => i >= 0).pop()!;
    expect(cellBg(buf, btnRow, cancelCol)).toBe('green');
  });
});

describe('ModalInputDialog — UP/DOWN adjust value by 1', () => {
  it('UP increments value by 1', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('UP');
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    expect(rowText(buf, DIALOG_ROW + 4)).toContain('4');
  });

  it('DOWN decrements value by 1', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('DOWN');
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    expect(rowText(buf, DIALOG_ROW + 4)).toContain('2');
  });

  it('UP clamps at max', () => {
    const dialog = new ModalInputDialog(makeForm({ field: { label: 'Quantity', initialValue: 10, min: 0, max: 10 } }));
    dialog.handleAction('UP');
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const fieldText = rowText(buf, DIALOG_ROW + 4);
    expect(fieldText).toContain('10');
    expect(fieldText).not.toContain('11');
  });

  it('DOWN clamps at min (0)', () => {
    const dialog = new ModalInputDialog(makeForm({ field: { label: 'Quantity', initialValue: 0, min: 0, max: 10 } }));
    dialog.handleAction('DOWN');
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    const valueStr = buf[DIALOG_ROW + 4].slice(valueBoxCol, valueBoxCol + 5).map(c => c.char).join('').trim();
    expect(valueStr).toBe('0');
  });
});

describe('ModalInputDialog — LEFT/RIGHT adjust value by 10', () => {
  it('RIGHT increments value by 10', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('RIGHT'); // 3 + 10 = 10 (clamped at max)
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    expect(rowText(buf, DIALOG_ROW + 4)).toContain('10');
  });

  it('LEFT decrements value by 10', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('LEFT'); // 3 - 10 = -7 → clamped to 0
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    const valueStr = buf[DIALOG_ROW + 4].slice(valueBoxCol, valueBoxCol + 5).map(c => c.char).join('').trim();
    expect(valueStr).toBe('0');
  });

  it('RIGHT clamps at max', () => {
    const dialog = new ModalInputDialog(makeForm({ field: { label: 'Quantity', initialValue: 8, min: 0, max: 10 } }));
    dialog.handleAction('RIGHT'); // 8 + 10 = 18 → clamped to 10
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const fieldText = rowText(buf, DIALOG_ROW + 4);
    expect(fieldText).toContain('10');
    expect(fieldText).not.toContain('18');
  });

  it('LEFT clamps at min', () => {
    const dialog = new ModalInputDialog(makeForm({ field: { label: 'Quantity', initialValue: 3, min: 0, max: 10 } }));
    dialog.handleAction('LEFT'); // 3 - 10 → clamped to 0
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    const valueStr = buf[DIALOG_ROW + 4].slice(valueBoxCol, valueBoxCol + 5).map(c => c.char).join('').trim();
    expect(valueStr).toBe('0');
  });

  it('RIGHT adjusts value when confirm is focused', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('TAB'); // → confirm
    dialog.handleAction('RIGHT'); // 3 + 10 = 10 (clamped)
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    expect(rowText(buf, DIALOG_ROW + 4)).toContain('10');
  });
});

describe('ModalInputDialog — char input', () => {
  it('first digit replaces initial value', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleCharInput('1'); // replaces 3 → 1
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    const valueStr = buf[DIALOG_ROW + 4].slice(valueBoxCol, valueBoxCol + 5).map(c => c.char).join('').trim();
    expect(valueStr).toBe('1');
  });

  it('second digit appends', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleCharInput('1'); // 1 (replaces)
    dialog.handleCharInput('0'); // 10 (appends)
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    const valueStr = buf[DIALOG_ROW + 4].slice(valueBoxCol, valueBoxCol + 5).map(c => c.char).join('').trim();
    expect(valueStr).toBe('10');
  });

  it('digit input is clamped at max', () => {
    const dialog = new ModalInputDialog(makeForm({ field: { label: 'Quantity', initialValue: 3, min: 0, max: 5 } }));
    dialog.handleCharInput('9'); // 9 > max=5 → clamped to 5
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    const valueStr = buf[DIALOG_ROW + 4].slice(valueBoxCol, valueBoxCol + 5).map(c => c.char).join('').trim();
    expect(valueStr).toBe('5');
  });

  it('backspace removes last digit (integer-divide by 10)', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleCharInput('1'); // 1
    dialog.handleCharInput('0'); // 10
    dialog.handleCharInput('\b'); // backspace → 1
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    const valueStr = buf[DIALOG_ROW + 4].slice(valueBoxCol, valueBoxCol + 5).map(c => c.char).join('').trim();
    expect(valueStr).toBe('1');
  });

  it('backspace to zero resets replaceNextDigit so next digit replaces', () => {
    const dialog = new ModalInputDialog(makeForm({ field: { label: 'Quantity', initialValue: 3, min: 0, max: 10 } }));
    dialog.handleCharInput('1'); // 1 (replaces 3)
    dialog.handleCharInput('\b'); // 0 (backspace: 1/10=0 → replaceNextDigit=true)
    dialog.handleCharInput('7'); // 7 (replaces 0)
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    const valueStr = buf[DIALOG_ROW + 4].slice(valueBoxCol, valueBoxCol + 5).map(c => c.char).join('').trim();
    expect(valueStr).toBe('7');
  });

  it('char input is ignored when confirm is focused', () => {
    const onConfirm = vi.fn();
    const dialog = new ModalInputDialog(makeForm({ onConfirm }));
    dialog.handleAction('TAB'); // → confirm
    dialog.handleCharInput('5'); // should be ignored
    // Value stays 3 (initial)
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    const valueStr = buf[DIALOG_ROW + 4].slice(valueBoxCol, valueBoxCol + 5).map(c => c.char).join('').trim();
    expect(valueStr).toBe('3');
  });
});

describe('ModalInputDialog — TAB cycles focus', () => {
  it('TAB from field moves to confirm', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('TAB');
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    // Field box should be unfocused (black bg)
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    expect(cellBg(buf, DIALOG_ROW + 4, valueBoxCol)).toBe('black');
    // Confirm button should be green
    const btnRow = DIALOG_ROW + 7;
    const firstBracket = buf[btnRow].findIndex(c => c.char === '[');
    expect(cellBg(buf, btnRow, firstBracket)).toBe('green');
  });

  it('TAB from confirm moves to cancel', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('TAB'); // → confirm
    dialog.handleAction('TAB'); // → cancel
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const btnRow = DIALOG_ROW + 7;
    const brackets = buf[btnRow].map((c, i) => c.char === '[' ? i : -1).filter(i => i >= 0);
    // cancel bracket (second '[') should be green
    expect(cellBg(buf, btnRow, brackets[1])).toBe('green');
    // confirm bracket (first '[') should NOT be green
    expect(cellBg(buf, btnRow, brackets[0])).toBe('black');
  });

  it('TAB from cancel wraps back to field', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('TAB'); // → confirm
    dialog.handleAction('TAB'); // → cancel
    dialog.handleAction('TAB'); // → field
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    expect(cellBg(buf, DIALOG_ROW + 4, valueBoxCol)).toBe('green');
  });
});

describe('ModalInputDialog — action routing', () => {
  it('SELECT on field fires onConfirm with current value', () => {
    const onConfirm = vi.fn();
    const dialog = new ModalInputDialog(makeForm({ onConfirm }));
    dialog.handleAction('SELECT');
    expect(onConfirm).toHaveBeenCalledWith(3);
  });

  it('SELECT on confirm fires onConfirm', () => {
    const onConfirm = vi.fn();
    const dialog = new ModalInputDialog(makeForm({ onConfirm }));
    dialog.handleAction('TAB'); // → confirm
    dialog.handleAction('SELECT');
    expect(onConfirm).toHaveBeenCalledWith(3);
  });

  it('SELECT on cancel fires onCancel', () => {
    const onCancel = vi.fn();
    const dialog = new ModalInputDialog(makeForm({ onCancel }));
    dialog.handleAction('TAB'); // → confirm
    dialog.handleAction('TAB'); // → cancel
    dialog.handleAction('SELECT');
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('BACK fires onCancel from any focus', () => {
    const onCancel = vi.fn();
    const dialog = new ModalInputDialog(makeForm({ onCancel }));
    dialog.handleAction('BACK');
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('BACK fires onCancel when confirm is focused', () => {
    const onCancel = vi.fn();
    const dialog = new ModalInputDialog(makeForm({ onCancel }));
    dialog.handleAction('TAB'); // → confirm
    dialog.handleAction('BACK');
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('LEFT decrements value by 10 when cancel is focused', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('TAB'); // → confirm
    dialog.handleAction('TAB'); // → cancel
    dialog.handleAction('LEFT'); // 3 - 10 → clamped to 0
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    const valueStr = buf[DIALOG_ROW + 4].slice(valueBoxCol, valueBoxCol + 5).map(c => c.char).join('').trim();
    expect(valueStr).toBe('0');
  });

  it('UP increments value by 1 when cancel is focused', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('TAB'); // → confirm
    dialog.handleAction('TAB'); // → cancel
    dialog.handleAction('UP');  // 3 → 4
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const valueBoxCol = DIALOG_COL + 1 + 8 + 3;
    const valueStr = buf[DIALOG_ROW + 4].slice(valueBoxCol, valueBoxCol + 5).map(c => c.char).join('').trim();
    expect(valueStr).toBe('4');
  });

  it('NAV_1 through NAV_9 are ignored', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const dialog = new ModalInputDialog(makeForm({ onConfirm, onCancel }));
    dialog.handleAction('NAV_1');
    dialog.handleAction('NAV_5');
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe('ModalInputDialog — tap hit-testing', () => {
  it('tap on confirm button area fires onConfirm', () => {
    const onConfirm = vi.fn();
    const dialog = new ModalInputDialog(makeForm({ onConfirm }));
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    // Button row = dialogRow + 7 = 17
    const btnRow = DIALOG_ROW + 7;
    // Find confirm button '[' position by scanning the rendered buffer
    const confirmCol = buf[btnRow].findIndex(c => c.char === '[');
    dialog.handleTap(confirmCol, btnRow);
    expect(onConfirm).toHaveBeenCalledWith(3);
  });

  it('tap on cancel button area fires onCancel', () => {
    const onCancel = vi.fn();
    const dialog = new ModalInputDialog(makeForm({ onCancel }));
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    const btnRow = DIALOG_ROW + 7;
    // Find last '[' (cancel button)
    const cancelCol = buf[btnRow].map((c, i) => c.char === '[' ? i : -1).filter(i => i >= 0).pop()!;
    dialog.handleTap(cancelCol, btnRow);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('tap outside buttons does nothing before render', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const dialog = new ModalInputDialog(makeForm({ onConfirm, onCancel }));
    // handleTap before render — rects are null
    dialog.handleTap(20, 17);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe('ModalInputDialog — derived row updates', () => {
  it('derived row computed value updates when value changes via UP', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleAction('UP'); // 3 → 4
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    expect(rowText(buf, DIALOG_ROW + 5)).toContain('320 CR'); // 4*80
  });

  it('derived row updates when value changed via char input', () => {
    const dialog = new ModalInputDialog(makeForm());
    dialog.handleCharInput('2'); // replaces 3 → 2
    const buf = makeBuffer(BUF_W, BUF_H);
    dialog.render(buf);
    expect(rowText(buf, DIALOG_ROW + 5)).toContain('160 CR'); // 2*80
  });
});

describe('ModalInputDialog — zero derived rows', () => {
  it('renders with no derived rows; height is 8', () => {
    const dialog = new ModalInputDialog({
      title: 'TEST',
      field: { label: 'Val', initialValue: 1, min: 0, max: 9 },
      derivedRows: [],
      confirmLabel: 'OK',
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
    });
    // For a 40×30 buffer with 0 derived rows: dialogH=8, dialogRow=floor((30-8)/2)=11
    const buf = makeBuffer(40, 30);
    dialog.render(buf);
    const dRow = Math.floor((30 - 8) / 2);
    expect(buf[dRow][5].char).toBe('+');
    expect(buf[dRow + 7][5].char).toBe('+'); // bottom border at row dRow+7
  });
});
