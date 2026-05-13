import type { CharBuffer } from '../../shared/types';
import { writeCentered, writeText } from '../../shared/buffer-utils';

export interface NavOption {
  id: string;
  label: string;
}

interface ButtonRange {
  id: string;
  startCol: number;
  endCol: number; // exclusive
}

export class NavBar {
  private readonly stationName: string;
  private readonly options: ReadonlyArray<NavOption>;
  private buttonRanges: ButtonRange[] | null = null;

  constructor(stationName: string, options: ReadonlyArray<NavOption>) {
    this.stationName = stationName;
    this.options = options;
  }

  render(buffer: CharBuffer): void {
    const w = buffer.length > 0 ? buffer[0].length : 0;

    writeCentered(buffer, 0, this.stationName, 'bright-cyan', 'black');

    const buttonStrings = this.options.map(o => `[${o.label}]`);
    const totalWidth = buttonStrings.reduce((sum, s) => sum + s.length, 0)
      + Math.max(0, this.options.length - 1);
    const startCol = Math.floor((w - totalWidth) / 2);

    const ranges: ButtonRange[] = [];
    let col = startCol;
    for (let i = 0; i < buttonStrings.length; i++) {
      if (i > 0) col += 1;
      const btn = buttonStrings[i];
      writeText(buffer, 1, col, btn, 'white', 'black');
      ranges.push({ id: this.options[i].id, startCol: col, endCol: col + btn.length });
      col += btn.length;
    }
    this.buttonRanges = ranges;
  }

  hitTest(col: number, row: number): string | null {
    if (this.buttonRanges === null) return null;
    if (row !== 1) return null;
    for (const range of this.buttonRanges) {
      if (col >= range.startCol && col < range.endCol) {
        return range.id;
      }
    }
    return null;
  }
}
