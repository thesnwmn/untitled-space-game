import type { CharBuffer, GameContext } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import { getSystem, getDestination } from '../world/world-data';

export interface NavOption {
  id: string;
  label: string;
}

export interface ChromeConfig {
  showHeader: boolean;
  showFooter: boolean;
  navOptions: ReadonlyArray<NavOption>;
}

export const CONTENT_TOP = 3;
export const CONTENT_TOP_NO_HEADER = 0;

export function contentBottom(h: number, showFooter: boolean): number {
  return showFooter ? h - 2 : h;
}

interface ButtonRange {
  id: string;
  startCol: number;
  endCol: number; // exclusive
}

function formatCredits(n: number): string {
  return n.toLocaleString('en-US');
}

export class ScreenChrome {
  private readonly context: GameContext;
  private buttonRanges: ButtonRange[] | null = null;
  private footerRow = -1;

  constructor(context: GameContext) {
    this.context = context;
  }

  render(buffer: CharBuffer, config: ChromeConfig): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;
    this.footerRow = -1;
    this.buttonRanges = null;

    if (config.showHeader) {
      this.renderHeaderRow0(buffer, w);
      this.renderHeaderRow1(buffer, w);
      // Row 2 is the gap — already cleared by the scene
    }

    if (config.showFooter) {
      this.renderFooter(buffer, h, w, config.navOptions);
      this.footerRow = h - 1;
    }
  }

  private renderHeaderRow0(buffer: CharBuffer, w: number): void {
    const sys = getSystem(this.context.systemId);
    const sysName = sys ? sys.name.toUpperCase() : this.context.systemId.toUpperCase();

    // Left prefix: "::" (bright-black)
    const prefix = '::';
    writeText(buffer, 0, 0, prefix, 'bright-black', 'black');

    // System name (bright-cyan)
    writeText(buffer, 0, prefix.length, sysName, 'bright-cyan', 'black');

    // Right zone: "[M] MENU ::" (10 chars)
    // [M] is bright-green, " MENU" is bright-white, "::" is bright-black
    const rightZoneWidth = 10;
    const fillCount = w - prefix.length - sysName.length - rightZoneWidth;
    let col = prefix.length + sysName.length;

    // Fill with ":"
    for (let i = 0; i < fillCount; i++) {
      buffer[0][col + i] = { char: ':', fg: 'bright-black', bg: 'black' };
    }
    col += fillCount;

    // "[M] MENU ::"
    writeText(buffer, 0, col, '[M]', 'white', 'black');
    col += 3;
    writeText(buffer, 0, col, ' MENU', 'white', 'black');
    col += 5;
    writeText(buffer, 0, col, '::', 'bright-black', 'black');
  }

  private renderHeaderRow1(buffer: CharBuffer, w: number): void {
    const dest = this.context.destinationId
      ? getDestination(this.context.destinationId)
      : null;
    const destName = dest ? dest.name.toUpperCase() : 'IN SPACE';
    const creditsStr = formatCredits(this.context.credits);

    // Right zone width = creditsStr.length + 5 (" CR::")
    const rightZoneWidth = creditsStr.length + 5;

    const prefix = '::';
    writeText(buffer, 1, 0, prefix, 'bright-black', 'black');
    writeText(buffer, 1, prefix.length, destName, 'cyan', 'black');

    const fillCount = w - prefix.length - destName.length - rightZoneWidth;
    let col = prefix.length + destName.length;

    for (let i = 0; i < fillCount; i++) {
      buffer[1][col + i] = { char: ':', fg: 'bright-black', bg: 'black' };
    }
    col += fillCount;

    // Credits (green) + " CR" (white) + "::" (bright-black)
    writeText(buffer, 1, col, creditsStr, 'green', 'black');
    col += creditsStr.length;
    writeText(buffer, 1, col, ' CR', 'white', 'black');
    col += 3;
    writeText(buffer, 1, col, '::', 'bright-black', 'black');
  }

  private renderFooter(
    buffer: CharBuffer,
    h: number,
    w: number,
    navOptions: ReadonlyArray<NavOption>,
  ): void {
    const row = h - 1;
    const ranges: ButtonRange[] = [];

    if (navOptions.length === 0) {
      for (let c = 0; c < w; c++) {
        buffer[row][c] = { char: ':', fg: 'bright-black', bg: 'black' };
      }
      this.buttonRanges = [];
      return;
    }

    // "::" prefix
    writeText(buffer, row, 0, '::', 'bright-black', 'black');
    let col = 2;

    for (let i = 0; i < navOptions.length; i++) {
      if (i > 0) {
        writeText(buffer, row, col, '::', 'bright-black', 'black');
        col += 2;
      }
      const opt = navOptions[i];
      const bracketLabel = `[${i + 1}]`;
      const labelText = ` ${opt.label}`;

      const btnStart = col;
      writeText(buffer, row, col, bracketLabel, 'white', 'black');
      col += bracketLabel.length;
      writeText(buffer, row, col, labelText, 'white', 'black');
      col += labelText.length;

      ranges.push({ id: opt.id, startCol: btnStart, endCol: col });
    }

    // Fill remainder with ":"
    for (let c = col; c < w; c++) {
      buffer[row][c] = { char: ':', fg: 'bright-black', bg: 'black' };
    }

    this.buttonRanges = ranges;
  }

  hitTestNav(col: number, row: number): string | null {
    if (this.footerRow < 0 || this.buttonRanges === null) return null;
    if (row !== this.footerRow) return null;
    for (const range of this.buttonRanges) {
      if (col >= range.startCol && col < range.endCol) {
        return range.id;
      }
    }
    return null;
  }
}
