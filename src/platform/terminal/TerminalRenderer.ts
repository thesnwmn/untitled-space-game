import type { Renderer, CharBuffer } from '../../shared/types';
import { GRID_WIDTH, GRID_HEIGHT } from '../../shared/types';

export class TerminalRenderer implements Renderer {
  private resizeHandlers: Array<(w: number, h: number) => void> = [];

  drawBuffer(_buffer: CharBuffer): void {}
  getWidth(): number { return GRID_WIDTH; }
  getHeight(): number { return GRID_HEIGHT; }
  clear(): void {}

  onResize(handler: (width: number, height: number) => void): void {
    this.resizeHandlers.push(handler);
  }
}
