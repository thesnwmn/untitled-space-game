import type { CharBuffer, Color } from './types';

export function writeText(buffer: CharBuffer, row: number, col: number, text: string, fg: Color, bg: Color): void {
  if (row < 0 || row >= buffer.length) return;
  const rowCells = buffer[row];
  for (let i = 0; i < text.length; i++) {
    const c = col + i;
    if (c >= 0 && c < rowCells.length) {
      rowCells[c] = { char: text[i], fg, bg };
    }
  }
}

export function writeCentered(buffer: CharBuffer, row: number, text: string, fg: Color, bg: Color): void {
  if (row < 0 || row >= buffer.length) return;
  const w = buffer[row].length;
  const col = Math.max(0, Math.floor((w - text.length) / 2));
  writeText(buffer, row, col, text, fg, bg);
}

export function drawBorder(buffer: CharBuffer, fg: Color, bg: Color): void {
  const h = buffer.length;
  const w = h > 0 ? buffer[0].length : 0;
  if (h < 2 || w < 2) return;
  for (let c = 0; c < w; c++) {
    const isCorner = c === 0 || c === w - 1;
    buffer[0][c]     = { char: isCorner ? '+' : '-', fg, bg };
    buffer[h - 1][c] = { char: isCorner ? '+' : '-', fg, bg };
  }
  for (let r = 1; r < h - 1; r++) {
    buffer[r][0]     = { char: '|', fg, bg };
    buffer[r][w - 1] = { char: '|', fg, bg };
  }
}
