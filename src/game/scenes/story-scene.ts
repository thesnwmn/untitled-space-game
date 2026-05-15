import type { InputHandler, CharBuffer, Scene } from '../../shared/types';
import { writeText, wrapText } from '../../shared/buffer-utils';
import { getStoryBeatsByTrigger } from '../world/world-data';

const YEAR_ROW = 2;
const BODY_START_ROW = 4;

export class StoryScene implements Scene {
  private readonly onContinue: () => void;
  private activated = false;
  private readonly yearHeader: string;
  private readonly bodyLines: string[];
  private pageIndex = 0;

  constructor(inputHandler: InputHandler, _context: unknown, _player: unknown, onContinue: () => void) {
    this.onContinue = onContinue;

    const beat = getStoryBeatsByTrigger('game-start')[0];
    const paragraphs = beat.text.split('\n\n');
    const firstPara = paragraphs[0].trim();
    let bodyParagraphs: string[];
    if (/^YEAR\s+\d{4}$/.test(firstPara)) {
      this.yearHeader = firstPara;
      bodyParagraphs = paragraphs.slice(1);
    } else {
      this.yearHeader = '';
      bodyParagraphs = paragraphs;
    }

    const allLines: string[] = [];
    for (let i = 0; i < bodyParagraphs.length; i++) {
      const normalized = bodyParagraphs[i].replace(/\n/g, ' ');
      const wrapped = wrapText(normalized, 36);
      if (i > 0) allLines.push('');
      allLines.push(...wrapped);
    }
    this.bodyLines = allLines;

    inputHandler.onAction((action) => {
      if (this.activated) return;
      if (action === 'SELECT') {
        this.activated = true;
        this.onContinue();
      } else if (action === 'LEFT') {
        if (this.pageIndex > 0) this.pageIndex--;
      } else if (action === 'RIGHT') {
        // advance to next page; will be clamped in render
        this.pageIndex++;
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((_col, _row) => {
        if (this.activated) return;
        this.activated = true;
        this.onContinue();
      });
    }
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

    if (this.yearHeader) {
      const col = Math.max(0, Math.floor((w - this.yearHeader.length) / 2));
      writeText(buffer, YEAR_ROW, col, this.yearHeader, 'bright-yellow', 'black');
    }

    // Rows available for body text (last row reserved for pager if needed)
    const bodyRows = h - 1 - BODY_START_ROW; // rows BODY_START_ROW..h-2 inclusive
    const linesPerPage = bodyRows;

    const totalPages = Math.max(1, Math.ceil(this.bodyLines.length / linesPerPage));
    if (this.pageIndex >= totalPages) this.pageIndex = totalPages - 1;

    const needsPager = totalPages > 1;
    const startLine = this.pageIndex * linesPerPage;
    const endLine = Math.min(startLine + linesPerPage, this.bodyLines.length);

    let row = BODY_START_ROW;
    for (let i = startLine; i < endLine; i++) {
      const line = this.bodyLines[i];
      if (line !== '') {
        writeText(buffer, row, 2, line, 'white', 'black');
      }
      row++;
    }

    if (needsPager) {
      const pageStr = `< ${this.pageIndex + 1}/${totalPages} >`;
      const col = w - 9;
      writeText(buffer, h - 1, col, pageStr, 'bright-black', 'black');
    }
  }
}
