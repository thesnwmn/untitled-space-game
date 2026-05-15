import { describe, it, expect } from 'vitest';
import { Starfield } from './starfield';
import type { CharBuffer, Color } from '../../shared/types';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

// Reference interior bounds for 40×30 grid (border inset 1 col each side)
const INT_ROW_START = 3;
const INT_ROW_END = 25;
const INT_COL_START = 2;
const INT_COL_END = 37;

const TWO_PI = 2 * Math.PI;

function renderBuf(sf: Starfield): CharBuffer {
  const buf = makeBuffer(40, 30);
  sf.render(buf, INT_ROW_START, INT_ROW_END, INT_COL_START, INT_COL_END);
  return buf;
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('Starfield', () => {
  describe('initialisation', () => {
    it('creates 33 stars total (18 + 10 + 5)', () => {
      const sf = new Starfield(42);
      expect(sf.getStars().length).toBe(33);
    });

    it('layer distribution is exactly 18/10/5', () => {
      const sf = new Starfield(42);
      const stars = sf.getStars();
      const counts = [0, 0, 0];
      for (const s of stars) counts[s.layer]++;
      expect(counts).toEqual([18, 10, 5]);
    });

    it('all stars have row as integer within [intRowStart, intRowEnd]', () => {
      const sf = new Starfield(42);
      for (const s of sf.getStars()) {
        expect(Number.isInteger(s.row)).toBe(true);
        expect(s.row).toBeGreaterThanOrEqual(INT_ROW_START);
        expect(s.row).toBeLessThanOrEqual(INT_ROW_END);
      }
    });

    it('all stars have col within interior col range', () => {
      const sf = new Starfield(42);
      for (const s of sf.getStars()) {
        expect(s.col).toBeGreaterThanOrEqual(INT_COL_START);
        expect(s.col).toBeLessThanOrEqual(INT_COL_END);
      }
    });

    it('two instances with the same seed produce identical initial positions', () => {
      const sf1 = new Starfield(42);
      const sf2 = new Starfield(42);
      const s1 = sf1.getStars();
      const s2 = sf2.getStars();
      for (let i = 0; i < s1.length; i++) {
        expect(s1[i].row).toBe(s2[i].row);
        expect(s1[i].col).toBe(s2[i].col);
      }
    });

    it('each star has twinklePhase in [0, 2π) at initialisation', () => {
      const sf = new Starfield(42);
      for (const s of sf.getStars()) {
        expect(s.twinklePhase).toBeGreaterThanOrEqual(0);
        expect(s.twinklePhase).toBeLessThan(TWO_PI);
      }
    });

    it('layer 0 twinklePeriod is within 4000–9000 ms', () => {
      const sf = new Starfield(42);
      for (const s of sf.getStars().filter(s => s.layer === 0)) {
        expect(s.twinklePeriod).toBeGreaterThanOrEqual(4000);
        expect(s.twinklePeriod).toBeLessThanOrEqual(9000);
      }
    });

    it('layer 1 twinklePeriod is within 2000–5000 ms', () => {
      const sf = new Starfield(42);
      for (const s of sf.getStars().filter(s => s.layer === 1)) {
        expect(s.twinklePeriod).toBeGreaterThanOrEqual(2000);
        expect(s.twinklePeriod).toBeLessThanOrEqual(5000);
      }
    });

    it('layer 2 twinklePeriod is within 800–2500 ms', () => {
      const sf = new Starfield(42);
      for (const s of sf.getStars().filter(s => s.layer === 2)) {
        expect(s.twinklePeriod).toBeGreaterThanOrEqual(800);
        expect(s.twinklePeriod).toBeLessThanOrEqual(2500);
      }
    });

    it('two instances with the same seed produce identical phases and periods', () => {
      const sf1 = new Starfield(42);
      const sf2 = new Starfield(42);
      const s1 = sf1.getStars();
      const s2 = sf2.getStars();
      for (let i = 0; i < s1.length; i++) {
        expect(s1[i].twinklePhase).toBe(s2[i].twinklePhase);
        expect(s1[i].twinklePeriod).toBe(s2[i].twinklePeriod);
      }
    });
  });

  describe('update(dt)', () => {
    it('after update(dt), all star row values are unchanged', () => {
      const sf = new Starfield(42);
      const rowsBefore = sf.getStars().map(s => s.row);
      sf.update(500);
      const rowsAfter = sf.getStars().map(s => s.row);
      expect(rowsAfter).toEqual(rowsBefore);
    });

    it('after update(dt), all star col values are unchanged', () => {
      const sf = new Starfield(42);
      const colsBefore = sf.getStars().map(s => s.col);
      sf.update(500);
      const colsAfter = sf.getStars().map(s => s.col);
      expect(colsAfter).toEqual(colsBefore);
    });

    it('after update(dt), twinklePhase advances by (2π / twinklePeriod) * dt', () => {
      const sf = new Starfield(42);
      const star = sf.getStars()[0];
      const phaseBefore = star.twinklePhase;
      const dt = 100;
      sf.update(dt);
      const expected = phaseBefore + (TWO_PI / star.twinklePeriod) * dt;
      expect(star.twinklePhase).toBeCloseTo(expected, 10);
    });
  });

  describe('render(buffer) — characters', () => {
    it('layer 0 stars render `.` character', () => {
      const sf = new Starfield(42);
      const star = sf.getStars().filter(s => s.layer === 0)[0];
      star.row = 10;
      star.col = 15;
      star.twinklePhase = 0; // sin(0) = 0 → normal state, renders
      const buf = renderBuf(sf);
      expect(buf[10][15].char).toBe('.');
    });

    it('layer 1 stars render `*` character', () => {
      const sf = new Starfield(42);
      const star = sf.getStars().filter(s => s.layer === 1)[0];
      star.row = 10;
      star.col = 15;
      star.twinklePhase = 0;
      const buf = renderBuf(sf);
      expect(buf[10][15].char).toBe('*');
    });

    it('layer 2 stars render `+` character', () => {
      const sf = new Starfield(42);
      const star = sf.getStars().filter(s => s.layer === 2)[0];
      star.row = 10;
      star.col = 15;
      star.twinklePhase = 0;
      const buf = renderBuf(sf);
      expect(buf[10][15].char).toBe('+');
    });

    it('near star (layer 2) overwrites far star (layer 0) at same cell', () => {
      const sf = new Starfield(42);
      const stars = sf.getStars();
      stars[0].row = 10;
      stars[0].col = 20;
      stars[0].twinklePhase = 0; // normal state
      stars[28].row = 10; // first layer-2 star (18+10 = index 28)
      stars[28].col = 20;
      stars[28].twinklePhase = 0; // normal state → bright-white
      const buf = renderBuf(sf);
      expect(buf[10][20].char).toBe('+');
      expect(buf[10][20].fg).toBe('bright-white');
    });
  });

  describe('render(buffer) — brightness states', () => {
    it('bright state (sin ≥ 0.5): Layer 0 → white, Layer 1 → bright-white, Layer 2 → bright-cyan', () => {
      const sf = new Starfield(42);
      const stars = sf.getStars();
      const phase = Math.PI / 2; // sin = 1
      const layer0 = stars.filter(s => s.layer === 0)[0];
      const layer1 = stars.filter(s => s.layer === 1)[0];
      const layer2 = stars.filter(s => s.layer === 2)[0];
      layer0.row = 5; layer0.col = 5; layer0.twinklePhase = phase;
      layer1.row = 6; layer1.col = 5; layer1.twinklePhase = phase;
      layer2.row = 7; layer2.col = 5; layer2.twinklePhase = phase;
      const buf = renderBuf(sf);
      expect(buf[5][5].fg).toBe('white');
      expect(buf[6][5].fg).toBe('bright-white');
      expect(buf[7][5].fg).toBe('bright-cyan');
    });

    it('normal state (-0.5 ≤ sin < 0.5): Layer 0 → bright-black, Layer 1 → white, Layer 2 → bright-white', () => {
      const sf = new Starfield(42);
      const stars = sf.getStars();
      const phase = 0; // sin = 0
      const layer0 = stars.filter(s => s.layer === 0)[0];
      const layer1 = stars.filter(s => s.layer === 1)[0];
      const layer2 = stars.filter(s => s.layer === 2)[0];
      layer0.row = 5; layer0.col = 5; layer0.twinklePhase = phase;
      layer1.row = 6; layer1.col = 5; layer1.twinklePhase = phase;
      layer2.row = 7; layer2.col = 5; layer2.twinklePhase = phase;
      const buf = renderBuf(sf);
      expect(buf[5][5].fg).toBe('bright-black');
      expect(buf[6][5].fg).toBe('white');
      expect(buf[7][5].fg).toBe('bright-white');
    });

    it('dim state (sin < -0.5): Layer 0 not rendered, Layer 1 → bright-black, Layer 2 → white', () => {
      const sf = new Starfield(42);
      const stars = sf.getStars();
      const phase = -Math.PI / 2; // sin = -1
      const layer0 = stars.filter(s => s.layer === 0)[0];
      const layer1 = stars.filter(s => s.layer === 1)[0];
      const layer2 = stars.filter(s => s.layer === 2)[0];
      layer0.row = 5; layer0.col = 5; layer0.twinklePhase = phase;
      layer1.row = 6; layer1.col = 5; layer1.twinklePhase = phase;
      layer2.row = 7; layer2.col = 5; layer2.twinklePhase = phase;
      const buf = renderBuf(sf);
      expect(buf[5][5].char).toBe(' '); // layer 0 not rendered
      expect(buf[6][5].fg).toBe('bright-black');
      expect(buf[7][5].fg).toBe('white');
    });
  });
});
