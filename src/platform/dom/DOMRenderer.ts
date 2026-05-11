import type { Renderer, CharBuffer } from '../../shared/types';
import { GRID_WIDTH, GRID_HEIGHT } from '../../shared/types';

function escapeHtml(char: string): string {
  if (char === '&') return '&amp;';
  if (char === '<') return '&lt;';
  if (char === '>') return '&gt;';
  return char;
}

export class DOMRenderer implements Renderer {
  private pre: HTMLPreElement | null = null;

  private getOrCreatePre(): HTMLPreElement | null {
    if (typeof document === 'undefined') return null;
    if (!this.pre) {
      this.pre = document.createElement('pre');
      this.pre.className = 'game-screen';
      document.body.appendChild(this.pre);
    }
    return this.pre;
  }

  drawBuffer(buffer: CharBuffer): void {
    const pre = this.getOrCreatePre();
    if (!pre) return;
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
    pre.innerHTML = rows.join('\n');
  }

  getWidth(): number { return GRID_WIDTH; }
  getHeight(): number { return GRID_HEIGHT; }

  clear(): void {
    const pre = this.getOrCreatePre();
    if (!pre) return;
    pre.innerHTML = '';
  }
}
