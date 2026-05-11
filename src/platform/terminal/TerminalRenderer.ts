import type { Renderer, CharBuffer } from '../../shared/types';
import { GRID_WIDTH, GRID_HEIGHT } from '../../shared/types';

export class TerminalRenderer implements Renderer {
  drawBuffer(_buffer: CharBuffer): void {}
  getWidth(): number { return GRID_WIDTH; }
  getHeight(): number { return GRID_HEIGHT; }
  clear(): void {}
}
