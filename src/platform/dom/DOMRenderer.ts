import type { Renderer, CharBuffer } from '../../shared/types';
import { GRID_WIDTH, GRID_HEIGHT } from '../../shared/types';

const BASE_FONT_SIZE = 24;

function escapeHtml(char: string): string {
  if (char === '&') return '&amp;';
  if (char === '<') return '&lt;';
  if (char === '>') return '&gt;';
  return char;
}

export class DOMRenderer implements Renderer {
  private pre: HTMLPreElement;
  private charW = 0;
  private charH = 0;
  private resizeHandlers: Array<(w: number, h: number) => void> = [];
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.pre = document.createElement('pre');
    this.pre.className = 'game-screen';
    this.pre.dataset['gridCols'] = String(GRID_WIDTH);
    this.pre.dataset['gridRows'] = String(GRID_HEIGHT);
    document.body.appendChild(this.pre);

    const remeasure = () => { this.measureChar(); this.applyScale(); };

    // Wait for fonts.ready AND explicitly load VT323 so we measure the real font,
    // not the fallback (Google Fonts uses font-display:swap so fonts.ready can
    // resolve before VT323 has downloaded on first/cache-cleared visits).
    Promise.all([
      document.fonts.ready,
      document.fonts.load(`${BASE_FONT_SIZE}px "VT323"`).catch(() => null),
    ]).then(remeasure);

    // Re-measure after any font swap so late-arriving VT323 corrects the scale.
    document.fonts.addEventListener('loadingdone', remeasure);

    window.addEventListener('resize', () => {
      if (this.debounceTimer !== null) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.applyScale(), 100);
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

  private applyScale(): void {
    if (this.charW <= 0 || this.charH <= 0) return;
    const scale = Math.min(
      window.innerWidth  / (GRID_WIDTH  * this.charW),
      window.innerHeight / (GRID_HEIGHT * this.charH),
    );
    this.pre.style.fontSize = `${BASE_FONT_SIZE * scale}px`;
    this.pre.style.width    = `${GRID_WIDTH * this.charW * scale}px`;
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
