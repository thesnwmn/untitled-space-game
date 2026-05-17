import type { InputHandler, CharBuffer, GameContext } from '../../shared/types';
import { writeText, wrapText, renderPager } from '../../shared/buffer-utils';
import { getStoryBeatsByTrigger } from '../world/world-data';
import type { PlayerState } from '../player-state';
import { BaseScene } from './base-scene';

export class StoryScene extends BaseScene {
  private readonly onContinue: () => void;
  private readonly yearHeader: string;
  private readonly bodyLines: string[];
  private pageIndex = 0;

  constructor(inputHandler: InputHandler, context: GameContext, player: PlayerState, onContinue: () => void) {
    super(inputHandler, context, player, { navOptions: [] });
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
  }

  protected override handleAction(action: string): void {
    if (action === 'SELECT') {
      this.activated = true;
      this.onContinue();
    } else if (action === 'LEFT') {
      if (this.pageIndex > 0) this.pageIndex--;
    } else if (action === 'RIGHT') {
      this.pageIndex++;
    }
  }

  protected override handleTap(_col: number, _row: number): void {
    this.activated = true;
    this.onContinue();
  }

  protected override renderContent(buffer: CharBuffer, top: number, bottom: number): void {
    const w = buffer.length > 0 ? buffer[0].length : 0;

    if (this.yearHeader) {
      const col = Math.max(0, Math.floor((w - this.yearHeader.length) / 2));
      writeText(buffer, top, col, this.yearHeader, 'bright-yellow', 'black');
    }

    const bodyStart = top + 2;
    const pagerRow = bottom - 1;
    const bodyRows = pagerRow - bodyStart;
    const linesPerPage = Math.max(1, bodyRows);

    const totalPages = Math.max(1, Math.ceil(this.bodyLines.length / linesPerPage));
    if (this.pageIndex >= totalPages) this.pageIndex = totalPages - 1;

    const needsPager = totalPages > 1;
    const startLine = this.pageIndex * linesPerPage;
    const endLine = Math.min(startLine + linesPerPage, this.bodyLines.length);

    let row = bodyStart;
    for (let i = startLine; i < endLine; i++) {
      const line = this.bodyLines[i];
      if (line !== '') {
        writeText(buffer, row, 2, line, 'white', 'black');
      }
      row++;
    }

    if (needsPager) {
      renderPager(buffer, pagerRow, w, this.pageIndex, totalPages);
    }
  }
}
