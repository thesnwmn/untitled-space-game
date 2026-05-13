import { describe, it, expect } from 'vitest';
import { Starfield } from './Starfield';
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

    it('layer distribution is exactly 24/6/3', () => {
      const sf = new Starfield(42);
      const stars = sf.getStars();
      const counts = [0, 0, 0];
      for (const s of stars) counts[s.layer]++;
      expect(counts).toEqual([24, 6, 3]);
    });

    it('all stars have y within interior row range', () => {
      const sf = new Starfield(42);
      for (const s of sf.getStars()) {
        expect(s.y).toBeGreaterThanOrEqual(INT_ROW_START);
        expect(s.y).toBeLessThan(INT_ROW_END);
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
        expect(s1[i].y).toBe(s2[i].y);
        expect(s1[i].col).toBe(s2[i].col);
      }
    });
  });

  describe('update(dt)', () => {
    it('layer 0 stars advance y by 0.3 * dt/1000 per update', () => {
      const sf = new Starfield(42);
      const star = sf.getStars()[0]; // layer 0
      star.y = 5.0;
      sf.update(100);
      expect(star.y).toBeCloseTo(5.0 + 0.3 * 0.1, 10);
    });

    it('layer 1 stars advance y by 1.0 * dt/1000 per update', () => {
      const sf = new Starfield(42);
      const star = sf.getStars()[24]; // first layer 1 star
      star.y = 5.0;
      sf.update(100);
      expect(star.y).toBeCloseTo(5.0 + 1.0 * 0.1, 10);
    });

    it('layer 2 stars advance y by 2.5 * dt/1000 per update', () => {
      const sf = new Starfield(42);
      const star = sf.getStars()[30]; // first layer 2 star
      star.y = 5.0;
      sf.update(100);
      expect(star.y).toBeCloseTo(5.0 + 2.5 * 0.1, 10);
    });

    it('star at y = INT_ROW_END wraps to INT_ROW_START', () => {
      const sf = new Starfield(42);
      const star = sf.getStars()[0]; // layer 0, speed 1.5
      star.y = INT_ROW_END; // at boundary; +0.0015 → > INT_ROW_END → wraps
      sf.update(1);
      expect(star.y).toBe(INT_ROW_START);
    });

    it('wrapped star gets a new col within interior', () => {
      const sf = new Starfield(42);
      const star = sf.getStars()[0];
      star.y = INT_ROW_END;
      sf.update(1);
      expect(star.col).toBeGreaterThanOrEqual(INT_COL_START);
      expect(star.col).toBeLessThanOrEqual(INT_COL_END);
    });

    it('twinkled is false at start of each update cycle', () => {
      const sf = new Starfield(42);
      const star = sf.getStars()[0];
      star.twinkled = true; // force it on
      star.twinkleTimer = 9999; // prevent re-trigger
      sf.update(1);
      // twinkled gets cleared to false before timer check
      expect(star.twinkled).toBe(false);
    });

    it('twinkleTimer decrements by dt', () => {
      const sf = new Starfield(42);
      const star = sf.getStars()[0];
      star.twinkleTimer = 1000;
      sf.update(200);
      expect(star.twinkleTimer).toBeCloseTo(800);
    });

    it('twinkled is set true and timer resets when timer reaches 0', () => {
      const sf = new Starfield(42);
      const star = sf.getStars()[0];
      star.twinkleTimer = 0;
      sf.update(1); // timer → -1 → fires
      expect(star.twinkled).toBe(true);
      expect(star.twinkleTimer).toBeGreaterThan(0);
    });
  });

  describe('render(buffer)', () => {
    it('layer 0 stars render . in bright-black', () => {
      const sf = new Starfield(42);
      const buf = renderBuf(sf);
      const stars = sf.getStars().filter(s => s.layer === 0);
      for (const star of stars) {
        const cell = buf[Math.floor(star.y)][star.col];
        if (cell.char === '.') {
          expect(cell.fg).toBe('bright-black');
        }
      }
      expect(stars.some(s => buf[Math.floor(s.y)][s.col].char === '.')).toBe(true);
    });

    it('layer 1 stars render * in white', () => {
      const sf = new Starfield(42);
      const buf = renderBuf(sf);
      const stars = sf.getStars().filter(s => s.layer === 1);
      for (const star of stars) {
        const cell = buf[Math.floor(star.y)][star.col];
        if (cell.char === '*') {
          expect(cell.fg).toBe('white');
        }
      }
      expect(stars.some(s => buf[Math.floor(s.y)][s.col].char === '*')).toBe(true);
    });

    it('layer 2 stars render + in bright-white', () => {
      const sf = new Starfield(42);
      const buf = renderBuf(sf);
      const stars = sf.getStars().filter(s => s.layer === 2);
      for (const star of stars) {
        const cell = buf[Math.floor(star.y)][star.col];
        if (cell.char === '+') {
          expect(cell.fg).toBe('bright-white');
        }
      }
      expect(stars.some(s => buf[Math.floor(s.y)][s.col].char === '+')).toBe(true);
    });

    it('twinkled layer 0 star renders in white', () => {
      const sf = new Starfield(42);
      const star = sf.getStars()[0]; // layer 0
      star.y = 5.0;
      star.col = 10;
      star.twinkleTimer = 0;
      sf.update(1); // triggers twinkle
      const buf = renderBuf(sf);
      expect(buf[5][10].char).toBe('.');
      expect(buf[5][10].fg).toBe('white');
    });

    it('twinkled layer 1 star renders in bright-white', () => {
      const sf = new Starfield(42);
      const star = sf.getStars()[24]; // first layer 1 star
      star.y = 6.0;
      star.col = 15;
      star.twinkleTimer = 0;
      sf.update(1);
      const buf = renderBuf(sf);
      expect(buf[6][15].char).toBe('*');
      expect(buf[6][15].fg).toBe('bright-white');
    });

    it('twinkled layer 2 star renders in bright-cyan', () => {
      const sf = new Starfield(42);
      const star = sf.getStars()[30]; // first layer 2 star
      star.y = 7.0;
      star.col = 20;
      star.twinkleTimer = 0;
      sf.update(1);
      const buf = renderBuf(sf);
      expect(buf[7][20].char).toBe('+');
      expect(buf[7][20].fg).toBe('bright-cyan');
    });

    it('near star (layer 2) overwrites far star (layer 0) at same cell', () => {
      const sf = new Starfield(42);
      const stars = sf.getStars();
      // Put a layer 0 and layer 2 star at the exact same cell
      stars[0].y = 10.0;
      stars[0].col = 20;
      stars[30].y = 10.0;
      stars[30].col = 20;
      const buf = renderBuf(sf);
      // Layer 2 ('+', bright-white) should win
      expect(buf[10][20].char).toBe('+');
      expect(buf[10][20].fg).toBe('bright-white');
    });
  });
});
