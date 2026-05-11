import type { Renderer, CharBuffer } from '../../shared/types';
import { MIN_GRID_WIDTH, MIN_GRID_HEIGHT, MAX_GRID_WIDTH, MAX_GRID_HEIGHT } from '../../shared/types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export class TerminalRenderer implements Renderer {
  private width: number;
  private height: number;
  private resizeHandlers: Array<(w: number, h: number) => void> = [];

  constructor() {
    this.width = this.readCols();
    this.height = this.readRows();

    try {
      process.on('SIGWINCH', () => this.applyResize());
    } catch (_) {}
  }

  private readCols(): number {
    return clamp(process.stdout.columns || MAX_GRID_WIDTH, MIN_GRID_WIDTH, MAX_GRID_WIDTH);
  }

  private readRows(): number {
    return clamp(process.stdout.rows || MAX_GRID_HEIGHT, MIN_GRID_HEIGHT, MAX_GRID_HEIGHT);
  }

  private applyResize(): void {
    this.width = this.readCols();
    this.height = this.readRows();
    for (const handler of this.resizeHandlers) {
      handler(this.width, this.height);
    }
  }

  onResize(handler: (width: number, height: number) => void): void {
    this.resizeHandlers.push(handler);
  }

  drawBuffer(_buffer: CharBuffer): void {}
  getWidth(): number { return this.width; }
  getHeight(): number { return this.height; }
  clear(): void {}
}
