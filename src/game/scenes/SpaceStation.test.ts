import { describe, it, expect } from 'vitest';
import { SpaceStation } from './SpaceStation';
import { STATION_TYPES } from './station-types';
import type { CharBuffer, Color } from '../../shared/types';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

// Reference interior bounds for 40×30 grid
const INT_ROW_START = 3;
const INT_ROW_END = 25;
const INT_COL_START = 1;
const INT_COL_END = 38;

function makeRelay(): SpaceStation {
  return new SpaceStation(STATION_TYPES.RELAY, INT_ROW_START, INT_ROW_END, INT_COL_START, INT_COL_END);
}

// Anchor for RELAY on 40×30 grid (verified by spec formula):
// anchorRow = 3 + floor((25-3)/2) - floor(3/2) = 3 + 11 - 1 = 13
// anchorCol = 1 + floor((38-1)*0.60) - floor(5/2) = 1 + 22 - 2 = 21
const ANCHOR_ROW = 13;
const ANCHOR_COL = 21;

// ── tests ─────────────────────────────────────────────────────────────────────

describe('SpaceStation', () => {
  describe('initial position', () => {
    it('display row equals anchor row before any update (sin(0)=0 means driftRow=0)', () => {
      const st = makeRelay();
      const pos = st.getDisplayPosition();
      expect(pos.row).toBe(ANCHOR_ROW);
    });

    it('display position is within interior bounds before any update', () => {
      const st = makeRelay();
      const pos = st.getDisplayPosition();
      expect(pos.row).toBeGreaterThanOrEqual(INT_ROW_START);
      expect(pos.row).toBeLessThanOrEqual(INT_ROW_END - STATION_TYPES.RELAY.glyph.rows.length + 1);
      expect(pos.col).toBeGreaterThanOrEqual(INT_COL_START);
      expect(pos.col).toBeLessThanOrEqual(INT_COL_END - 5 + 1); // glyphWidth=5
    });
  });

  describe('update and drift', () => {
    it('display row changes after update advances time to quarter row period', () => {
      const st = makeRelay();
      const before = st.getDisplayPosition().row;
      st.update(2250); // quarter of 9000ms row period → peak row drift
      const after = st.getDisplayPosition().row;
      expect(after).not.toBe(before);
    });

    it('display position stays within interior at quarter-period', () => {
      const st = makeRelay();
      st.update(2250);
      const pos = st.getDisplayPosition();
      expect(pos.row).toBeGreaterThanOrEqual(INT_ROW_START);
      expect(pos.row).toBeLessThanOrEqual(INT_ROW_END - STATION_TYPES.RELAY.glyph.rows.length + 1);
      expect(pos.col).toBeGreaterThanOrEqual(INT_COL_START);
      expect(pos.col).toBeLessThanOrEqual(INT_COL_END - 5 + 1);
    });

    it('display position stays within interior at full row period', () => {
      const st = makeRelay();
      st.update(9000); // full row period — sin returns to ~0
      const pos = st.getDisplayPosition();
      expect(pos.row).toBeGreaterThanOrEqual(INT_ROW_START);
      expect(pos.col).toBeGreaterThanOrEqual(INT_COL_START);
      expect(pos.col).toBeLessThanOrEqual(INT_COL_END - 5 + 1);
    });

    it('large dt still clamps display position to interior (safety net)', () => {
      const st = makeRelay();
      st.update(999_999_999); // enormous dt
      const pos = st.getDisplayPosition();
      expect(pos.row).toBeGreaterThanOrEqual(INT_ROW_START);
      expect(pos.row).toBeLessThanOrEqual(INT_ROW_END - STATION_TYPES.RELAY.glyph.rows.length + 1);
      expect(pos.col).toBeGreaterThanOrEqual(INT_COL_START);
      expect(pos.col).toBeLessThanOrEqual(INT_COL_END - 5 + 1);
    });
  });

  describe('render', () => {
    it('writes RELAY glyph chars at display position with bright-yellow fg', () => {
      const st = makeRelay();
      const pos = st.getDisplayPosition();
      const buf = makeBuffer(40, 30);
      st.render(buf);
      // RELAY row 0: '>---<' — all 5 chars are non-space
      expect(buf[pos.row][pos.col].char).toBe('>');
      expect(buf[pos.row][pos.col].fg).toBe('bright-yellow');
      expect(buf[pos.row][pos.col + 1].char).toBe('-');
      expect(buf[pos.row][pos.col + 4].char).toBe('<');
    });

    it('space characters in glyph are not written to buffer', () => {
      const st = makeRelay();
      const pos = st.getDisplayPosition();
      const buf = makeBuffer(40, 30);
      // Place a marker at position of the leading space in RELAY row 1 (' |*|')
      buf[pos.row + 1][pos.col] = { char: '.', fg: 'bright-black', bg: 'black' };
      st.render(buf);
      // The space at row+1, col+0 must NOT overwrite our marker
      expect(buf[pos.row + 1][pos.col].char).toBe('.');
    });

    it('station glyph chars overwrite prior content at the same cell', () => {
      const st = makeRelay();
      const pos = st.getDisplayPosition();
      const buf = makeBuffer(40, 30);
      // Pre-fill with a star
      buf[pos.row][pos.col] = { char: '*', fg: 'bright-white', bg: 'black' };
      st.render(buf);
      // Station glyph ('>') must overwrite it
      expect(buf[pos.row][pos.col].char).toBe('>');
      expect(buf[pos.row][pos.col].fg).toBe('bright-yellow');
    });
  });
});
