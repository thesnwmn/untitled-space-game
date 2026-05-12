import type { Renderer, CharBuffer } from '../../shared/types';
import { GRID_WIDTH, GRID_HEIGHT } from '../../shared/types';

const FONT_SIZE = 24;

function escapeHtml(char: string): string {
  if (char === '&') return '&amp;';
  if (char === '<') return '&lt;';
  if (char === '>') return '&gt;';
  return char;
}

export class DOMRenderer implements Renderer {
  private pre: HTMLPreElement;
  private resizeHandlers: Array<(w: number, h: number) => void> = [];

  constructor() {
    this.pre = document.createElement('pre');
    this.pre.className = 'game-screen';
    this.pre.style.fontSize = `${FONT_SIZE}px`;
    this.pre.dataset['gridCols'] = String(GRID_WIDTH);
    this.pre.dataset['gridRows'] = String(GRID_HEIGHT);
    document.body.appendChild(this.pre);

    document.fonts.ready.then(() => {
      this.setPreWidth();
    });
  }

  private setPreWidth(): void {
    const span = document.createElement('span');
    span.style.fontFamily = "'VT323', monospace";
    span.style.fontSize = `${FONT_SIZE}px`;
    span.style.lineHeight = '1em';
    span.style.position = 'absolute';
    span.style.visibility = 'hidden';
    span.textContent = 'M';
    document.body.appendChild(span);
    const rect = span.getBoundingClientRect();
    document.body.removeChild(span);
    if (rect.width > 0) {
      this.pre.style.width = `${GRID_WIDTH * rect.width}px`;
    }
  }

  onResize(handler: (width: number, height: number) => void): void {
    this.resizeHandlers.push(handler);
  }

  drawBuffer(buffer: CharBuffer): void {
    const rows: string[] = [];
    for (const row of buffer) {
      let rowHtml = '';
      for (const cell of row) {
        const fgClass = cell.fg !== 'transparent' ? `fg-${cell.fg}` : '';
        const bgClass = cell.bg !== 'transparent' ? `bg-${cell.bg}` : '';
        const classes = fgClass && bgClass ? `${fgClass} ${bgClass}` : fgClass || bgClass;
        const classAttr = classes ? ` class="${classes}"` : '';
        rowHtml += `<span${classAttr}>${escapeHtml(cell.char)}</span>`;
      }
      rows.push(rowHtml);
    }
    this.pre.innerHTML = rows.join('\n');
  }

  getWidth(): number { return GRID_WIDTH; }
  getHeight(): number { return GRID_HEIGHT; }

  clear(): void {
    this.pre.innerHTML = '';
  }
}
