import type { Renderer, CharBuffer } from '../../shared/types';
import { GRID_WIDTH, MIN_GRID_HEIGHT, MAX_GRID_HEIGHT } from '../../shared/types';

export class TerminalRenderer implements Renderer {
  private resizeHandlers: Array<(w: number, h: number) => void> = [];

  drawBuffer(_buffer: CharBuffer): void {}
  getWidth(): number { return GRID_WIDTH; }
  getHeight(): number {
    const rows = process.stdout.rows ?? MIN_GRID_HEIGHT;
    return Math.max(MIN_GRID_HEIGHT, Math.min(MAX_GRID_HEIGHT, rows));
  }
  clear(): void {}

  onResize(handler: (width: number, height: number) => void): void {
    this.resizeHandlers.push(handler);
  }
}
