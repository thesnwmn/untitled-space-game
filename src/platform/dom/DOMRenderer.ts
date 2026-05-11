import type { Renderer, CharBuffer } from '../../shared/types';
import { MIN_GRID_WIDTH, MIN_GRID_HEIGHT, MAX_GRID_WIDTH, MAX_GRID_HEIGHT } from '../../shared/types';

const BASE_FONT_SIZE = 16;

function escapeHtml(char: string): string {
  if (char === '&') return '&amp;';
  if (char === '<') return '&lt;';
  if (char === '>') return '&gt;';
  return char;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export class DOMRenderer implements Renderer {
  private pre: HTMLPreElement;
  private charW = 0;
  private charH = 0;
  private width: number;
  private height: number;
  private resizeHandlers: Array<(w: number, h: number) => void> = [];
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.pre = document.createElement('pre');
    this.pre.className = 'game-screen';
    document.body.appendChild(this.pre);

    // Initial dimensions before font measurement (charW=0 → MAX)
    this.width = MAX_GRID_WIDTH;
    this.height = MAX_GRID_HEIGHT;

    document.fonts.ready.then(() => {
      this.measureChar();
      this.applyResize();
    });

    window.addEventListener('resize', () => {
      if (this.debounceTimer !== null) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.applyResize(), 100);
    });
  }

  private measureChar(): void {
    const span = document.createElement('span');
    span.style.fontFamily = "'VT323', monospace";
    span.style.fontSize = `${BASE_FONT_SIZE}px`;
    span.style.lineHeight = '1em';
    span.style.position = 'absolute';
    span.style.visibility = 'hidden';
    span.textContent = 'M';
    document.body.appendChild(span);
    const rect = span.getBoundingClientRect();
    document.body.removeChild(span);
    this.charW = rect.width;
    this.charH = rect.height;
  }

  private applyResize(): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let cols: number;
    let rows: number;

    if (this.charW > 0 && this.charH > 0) {
      const naturalCols = Math.floor(vw / this.charW);
      const naturalRows = Math.floor(vh / this.charH);

      if (naturalCols < MIN_GRID_WIDTH || naturalRows < MIN_GRID_HEIGHT) {
        const scale = Math.min(
          vw / (MIN_GRID_WIDTH * this.charW),
          vh / (MIN_GRID_HEIGHT * this.charH)
        );
        this.pre.style.fontSize = `${BASE_FONT_SIZE * scale}px`;
        this.pre.style.width = `${MIN_GRID_WIDTH * this.charW * scale}px`;
        cols = MIN_GRID_WIDTH;
        rows = MIN_GRID_HEIGHT;
      } else {
        cols = clamp(naturalCols, MIN_GRID_WIDTH, MAX_GRID_WIDTH);
        rows = clamp(naturalRows, MIN_GRID_HEIGHT, MAX_GRID_HEIGHT);
        this.pre.style.fontSize = `${BASE_FONT_SIZE}px`;
        this.pre.style.width = `${cols * this.charW}px`;
      }
    } else {
      cols = MAX_GRID_WIDTH;
      rows = MAX_GRID_HEIGHT;
    }

    this.width = cols;
    this.height = rows;

    for (const handler of this.resizeHandlers) {
      handler(cols, rows);
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

  getWidth(): number { return this.width; }
  getHeight(): number { return this.height; }

  clear(): void {
    this.pre.innerHTML = '';
  }
}
