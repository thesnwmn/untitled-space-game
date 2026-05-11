import type { Renderer, CharBuffer } from '../../shared/types';

const GRID_WIDTH = 40;
const GRID_HEIGHT = 60;

export class TerminalRenderer implements Renderer {
  drawBuffer(_buffer: CharBuffer): void {}
  getWidth(): number { return GRID_WIDTH; }
  getHeight(): number { return GRID_HEIGHT; }
  clear(): void {}
}
