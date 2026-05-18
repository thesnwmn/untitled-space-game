import type { CharBuffer, Color } from '../../shared/types';

export function hashStringToSeed(s: string): number {
  if (s.length === 0) return 2166136261;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h === 0 ? 1 : h;
}

export interface Star {
  row: number;
  col: number;
  layer: 0 | 1 | 2;
  twinklePhase: number;
  twinklePeriod: number;
}

const LAYER_COUNT = [18, 10, 5] as const;
const LAYER_CHAR = ['.', '*', '+'] as const;

const PERIOD_MIN = [4000, 2000, 800] as const;
const PERIOD_MAX = [9000, 5000, 2500] as const;

type ColorOrNull = Color | null;
const LAYER_DIM_COLOR: ColorOrNull[] = [null, 'bright-black', 'white'];
const LAYER_NORMAL_COLOR: Color[] = ['bright-black', 'white', 'bright-white'];
const LAYER_BRIGHT_COLOR: Color[] = ['white', 'bright-white', 'bright-cyan'];

const DEFAULT_INT_ROW_START = 3;
const DEFAULT_INT_ROW_END = 25;
const DEFAULT_INT_COL_START = 2;
const DEFAULT_INT_COL_END = 37;

const TWO_PI = 2 * Math.PI;

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
  private boundsSet = false;

  constructor(seed = 42) {
    this.rand = lcgRand(seed);
    this.stars = [];

    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < LAYER_COUNT[layer]; i++) {
        const col = DEFAULT_INT_COL_START + Math.floor(
          this.rand() * (DEFAULT_INT_COL_END - DEFAULT_INT_COL_START + 1)
        );
        const row = DEFAULT_INT_ROW_START + Math.floor(
          this.rand() * (DEFAULT_INT_ROW_END - DEFAULT_INT_ROW_START + 1)
        );
        const twinklePhase = this.rand() * TWO_PI;
        const twinklePeriod = PERIOD_MIN[layer] + this.rand() * (PERIOD_MAX[layer] - PERIOD_MIN[layer]);
        this.stars.push({ col, row, layer: layer as 0 | 1 | 2, twinklePhase, twinklePeriod });
      }
    }
  }

  update(dt: number): void {
    for (const star of this.stars) {
      star.twinklePhase += (TWO_PI / star.twinklePeriod) * dt;
    }
  }

  render(
    buffer: CharBuffer,
    intRowStart: number,
    intRowEnd: number,
    intColStart: number,
    intColEnd: number,
  ): void {
    if (!this.boundsSet) {
      this.boundsSet = true;
      const defaultRowSpan = DEFAULT_INT_ROW_END - DEFAULT_INT_ROW_START;
      const defaultColSpan = DEFAULT_INT_COL_END - DEFAULT_INT_COL_START;
      if (defaultRowSpan > 0 && defaultColSpan > 0) {
        const rowScale = (intRowEnd - intRowStart) / defaultRowSpan;
        const colScale = (intColEnd - intColStart) / defaultColSpan;
        for (const star of this.stars) {
          star.row = Math.round(intRowStart + (star.row - DEFAULT_INT_ROW_START) * rowScale);
          star.col = Math.round(intColStart + (star.col - DEFAULT_INT_COL_START) * colScale);
        }
      }
    }

    for (const star of this.stars) {
      const { row, col, layer } = star;
      if (row < intRowStart || row > intRowEnd || col < intColStart || col > intColEnd) continue;

      const b = Math.sin(star.twinklePhase);
      let fg: ColorOrNull;
      if (b >= 0.5) {
        fg = LAYER_BRIGHT_COLOR[layer];
      } else if (b >= -0.5) {
        fg = LAYER_NORMAL_COLOR[layer];
      } else {
        fg = LAYER_DIM_COLOR[layer];
      }

      if (fg === null) continue;
      buffer[row][col] = { char: LAYER_CHAR[layer], fg, bg: 'black' };
    }
  }

  getStars(): Readonly<Star[]> {
    return this.stars;
  }
}
