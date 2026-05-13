import type { CharBuffer, Color } from '../../shared/types';

export interface Star {
  col: number;
  y: number;
  layer: 0 | 1 | 2;
  twinkleTimer: number;
  twinkled: boolean;
}

const LAYER_COUNT = [24, 6, 3] as const;
const LAYER_CHAR = ['.', '*', '+'] as const;
const LAYER_SPEED = [0.3, 1.0, 2.5] as const;
const LAYER_COLOR: Color[] = ['bright-black', 'white', 'bright-white'];
const LAYER_TWINKLE_COLOR: Color[] = ['white', 'bright-white', 'bright-cyan'];
const TWINKLE_MIN = 800;
const TWINKLE_MAX = 3000;

// Default interior bounds based on 40×30 reference grid
const DEFAULT_INT_ROW_START = 3;
const DEFAULT_INT_ROW_END = 25;
const DEFAULT_INT_COL_START = 2;
const DEFAULT_INT_COL_END = 37;

function lcgRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export class Starfield {
  private stars: Star[];
  private rand: () => number;
  private intRowStart = DEFAULT_INT_ROW_START;
  private intRowEnd = DEFAULT_INT_ROW_END;
  private intColStart = DEFAULT_INT_COL_START;
  private intColEnd = DEFAULT_INT_COL_END;
  private boundsSet = false;

  constructor(seed = 42) {
    this.rand = lcgRand(seed);
    this.stars = [];

    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < LAYER_COUNT[layer]; i++) {
        const col = DEFAULT_INT_COL_START + Math.floor(
          this.rand() * (DEFAULT_INT_COL_END - DEFAULT_INT_COL_START + 1)
        );
        const y = DEFAULT_INT_ROW_START + this.rand() * (DEFAULT_INT_ROW_END - DEFAULT_INT_ROW_START);
        const twinkleTimer = TWINKLE_MIN + this.rand() * (TWINKLE_MAX - TWINKLE_MIN);
        this.stars.push({ col, y, layer: layer as 0 | 1 | 2, twinkleTimer, twinkled: false });
      }
    }
  }

  update(dt: number): void {
    for (const star of this.stars) {
      star.y += LAYER_SPEED[star.layer] * (dt / 1000);
      if (star.y > this.intRowEnd) {
        star.y = this.intRowStart;
        star.col = this.intColStart + Math.floor(
          this.rand() * (this.intColEnd - this.intColStart + 1)
        );
      }
      star.twinkled = false;
      star.twinkleTimer -= dt;
      if (star.twinkleTimer <= 0) {
        star.twinkled = true;
        star.twinkleTimer = TWINKLE_MIN + this.rand() * (TWINKLE_MAX - TWINKLE_MIN);
      }
    }
  }

  render(
    buffer: CharBuffer,
    intRowStart: number,
    intRowEnd: number,
    intColStart: number,
    intColEnd: number,
  ): void {
    // On first render, proportionally remap initial positions to actual interior bounds
    // so a taller/wider screen is fully populated from frame one.
    if (!this.boundsSet) {
      this.boundsSet = true;
      const defaultRowSpan = DEFAULT_INT_ROW_END - DEFAULT_INT_ROW_START;
      const defaultColSpan = DEFAULT_INT_COL_END - DEFAULT_INT_COL_START;
      if (defaultRowSpan > 0 && defaultColSpan > 0) {
        const rowScale = (intRowEnd - intRowStart) / defaultRowSpan;
        const colScale = (intColEnd - intColStart) / defaultColSpan;
        for (const star of this.stars) {
          star.y = intRowStart + (star.y - DEFAULT_INT_ROW_START) * rowScale;
          star.col = Math.round(intColStart + (star.col - DEFAULT_INT_COL_START) * colScale);
        }
      }
    }

    this.intRowStart = intRowStart;
    this.intRowEnd = intRowEnd;
    this.intColStart = intColStart;
    this.intColEnd = intColEnd;

    for (const star of this.stars) {
      const row = Math.floor(star.y);
      const col = star.col;
      if (row < intRowStart || row > intRowEnd || col < intColStart || col > intColEnd) continue;
      const fg: Color = star.twinkled ? LAYER_TWINKLE_COLOR[star.layer] : LAYER_COLOR[star.layer];
      buffer[row][col] = { char: LAYER_CHAR[star.layer], fg, bg: 'black' };
    }
  }

  getStars(): Readonly<Star[]> {
    return this.stars;
  }
}
