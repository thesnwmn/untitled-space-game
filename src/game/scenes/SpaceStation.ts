import type { CharBuffer, Color } from '../../shared/types';
import type { SpaceStationDef } from './station-types';

const AMP_ROW = 2;
const AMP_COL = 3;
const OMEGA_ROW = (2 * Math.PI) / 9000;   // rad/ms — one full cycle per 9 s
const OMEGA_COL = (2 * Math.PI) / 12000;  // rad/ms — one full cycle per 12 s
const PHASE_COL = Math.PI / 3;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export class SpaceStation {
  private def: SpaceStationDef;
  private anchorRow: number;
  private anchorCol: number;
  private time = 0;
  private intRowStart: number;
  private intRowEnd: number;
  private intColStart: number;
  private intColEnd: number;
  private glyphHeight: number;
  private glyphWidth: number;

  constructor(
    def: SpaceStationDef,
    intRowStart: number,
    intRowEnd: number,
    intColStart: number,
    intColEnd: number,
  ) {
    this.def = def;
    this.intRowStart = intRowStart;
    this.intRowEnd = intRowEnd;
    this.intColStart = intColStart;
    this.intColEnd = intColEnd;

    this.glyphHeight = def.glyph.rows.length;
    this.glyphWidth = Math.max(...def.glyph.rows.map(r => r.length));

    this.anchorRow = intRowStart
      + Math.floor((intRowEnd - intRowStart) / 2)
      - Math.floor(this.glyphHeight / 2);
    this.anchorCol = intColStart
      + Math.floor((intColEnd - intColStart) * 0.60)
      - Math.floor(this.glyphWidth / 2);
  }

  update(dt: number): void {
    this.time += dt;
  }

  getDisplayPosition(): { row: number; col: number } {
    const driftRow = Math.round(AMP_ROW * Math.sin(this.time * OMEGA_ROW));
    const driftCol = Math.round(AMP_COL * Math.sin(this.time * OMEGA_COL + PHASE_COL));

    const row = clamp(
      this.anchorRow + driftRow,
      this.intRowStart,
      this.intRowEnd - this.glyphHeight + 1,
    );
    const col = clamp(
      this.anchorCol + driftCol,
      this.intColStart,
      this.intColEnd - this.glyphWidth + 1,
    );
    return { row, col };
  }

  render(buffer: CharBuffer): void {
    const { row: displayRow, col: displayCol } = this.getDisplayPosition();
    const fg: Color = this.def.glyph.fg;

    for (let r = 0; r < this.def.glyph.rows.length; r++) {
      const rowStr = this.def.glyph.rows[r];
      for (let c = 0; c < rowStr.length; c++) {
        const ch = rowStr[c];
        if (ch === ' ') continue;
        const bufRow = displayRow + r;
        const bufCol = displayCol + c;
        if (bufRow >= 0 && bufRow < buffer.length && bufCol >= 0 && bufCol < buffer[bufRow].length) {
          buffer[bufRow][bufCol] = { char: ch, fg, bg: 'black' };
        }
      }
    }
  }
}
