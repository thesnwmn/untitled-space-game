import { describe, it, expect } from 'vitest';
import { NavBar } from './NavBar';
import type { CharBuffer, Color } from '../../shared/types';

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

function rowText(buffer: CharBuffer, row: number): string {
  return buffer[row].map(c => c.char).join('').trimEnd();
}

// Width=40 column positions:
// "ELYSIUM STATION" (15 chars) → startCol = floor((40-15)/2) = 12
// [UNDOCK] (8 chars) single → startCol = floor((40-8)/2) = 16  → cols 16–23
// [UNDOCK][HUB] two-opt → totalWidth=14 → startCol=13; [UNDOCK] 13–20, [HUB] 22–26

describe('NavBar', () => {
  it('station name text appears on row 0', () => {
    const nav = new NavBar('ELYSIUM STATION', [{ id: 'undock', label: 'UNDOCK' }]);
    const buf = makeBuffer(40, 5);
    nav.render(buf);
    expect(rowText(buf, 0)).toContain('ELYSIUM STATION');
  });

  it('station name is centered (first char at expected col)', () => {
    const nav = new NavBar('ELYSIUM STATION', [{ id: 'undock', label: 'UNDOCK' }]);
    const buf = makeBuffer(40, 5);
    nav.render(buf);
    expect(buf[0][12].char).toBe('E');
  });

  it('station name color is bright-cyan', () => {
    const nav = new NavBar('ELYSIUM STATION', [{ id: 'undock', label: 'UNDOCK' }]);
    const buf = makeBuffer(40, 5);
    nav.render(buf);
    expect(buf[0][12].fg).toBe('bright-cyan');
  });

  it('single option [UNDOCK] appears on row 1 centered', () => {
    const nav = new NavBar('ELYSIUM STATION', [{ id: 'undock', label: 'UNDOCK' }]);
    const buf = makeBuffer(40, 5);
    nav.render(buf);
    expect(rowText(buf, 1)).toContain('[UNDOCK]');
    expect(buf[1][16].char).toBe('[');
  });

  it('two options: [UNDOCK] appears at computed start col on row 1', () => {
    const nav = new NavBar('ELYSIUM STATION', [
      { id: 'undock', label: 'UNDOCK' },
      { id: 'hub', label: 'HUB' },
    ]);
    const buf = makeBuffer(40, 5);
    nav.render(buf);
    expect(buf[1][13].char).toBe('[');
    expect(rowText(buf, 1)).toContain('[UNDOCK]');
  });

  it('two options: [HUB] appears one space after [UNDOCK]', () => {
    const nav = new NavBar('ELYSIUM STATION', [
      { id: 'undock', label: 'UNDOCK' },
      { id: 'hub', label: 'HUB' },
    ]);
    const buf = makeBuffer(40, 5);
    nav.render(buf);
    // [UNDOCK] ends at col 20, space at col 21, [HUB] starts at col 22
    expect(buf[1][21].char).toBe(' ');
    expect(buf[1][22].char).toBe('[');
    expect(rowText(buf, 1)).toContain('[HUB]');
  });

  it('button text color is white', () => {
    const nav = new NavBar('ELYSIUM STATION', [{ id: 'undock', label: 'UNDOCK' }]);
    const buf = makeBuffer(40, 5);
    nav.render(buf);
    expect(buf[1][16].fg).toBe('white');
  });

  it('hitTest on row 0 returns null (station name row is not interactive)', () => {
    const nav = new NavBar('ELYSIUM STATION', [{ id: 'undock', label: 'UNDOCK' }]);
    const buf = makeBuffer(40, 5);
    nav.render(buf);
    expect(nav.hitTest(16, 0)).toBeNull();
  });

  it('hitTest on [UNDOCK] col range row 1 returns undock (two options)', () => {
    const nav = new NavBar('ELYSIUM STATION', [
      { id: 'undock', label: 'UNDOCK' },
      { id: 'hub', label: 'HUB' },
    ]);
    const buf = makeBuffer(40, 5);
    nav.render(buf);
    // [UNDOCK] at cols 13–20
    expect(nav.hitTest(13, 1)).toBe('undock');
    expect(nav.hitTest(20, 1)).toBe('undock');
  });

  it('hitTest on gap col between buttons returns null', () => {
    const nav = new NavBar('ELYSIUM STATION', [
      { id: 'undock', label: 'UNDOCK' },
      { id: 'hub', label: 'HUB' },
    ]);
    const buf = makeBuffer(40, 5);
    nav.render(buf);
    // gap at col 21
    expect(nav.hitTest(21, 1)).toBeNull();
  });

  it('hitTest on [HUB] col range row 1 returns hub', () => {
    const nav = new NavBar('ELYSIUM STATION', [
      { id: 'undock', label: 'UNDOCK' },
      { id: 'hub', label: 'HUB' },
    ]);
    const buf = makeBuffer(40, 5);
    nav.render(buf);
    // [HUB] at cols 22–26
    expect(nav.hitTest(22, 1)).toBe('hub');
    expect(nav.hitTest(26, 1)).toBe('hub');
  });

  it('hitTest past last button col returns null', () => {
    const nav = new NavBar('ELYSIUM STATION', [
      { id: 'undock', label: 'UNDOCK' },
      { id: 'hub', label: 'HUB' },
    ]);
    const buf = makeBuffer(40, 5);
    nav.render(buf);
    // endCol for [HUB] is 27
    expect(nav.hitTest(27, 1)).toBeNull();
  });

  it('single option: hitTest on [UNDOCK] col range returns undock', () => {
    const nav = new NavBar('ELYSIUM STATION', [{ id: 'undock', label: 'UNDOCK' }]);
    const buf = makeBuffer(40, 5);
    nav.render(buf);
    // [UNDOCK] at cols 16–23
    expect(nav.hitTest(16, 1)).toBe('undock');
    expect(nav.hitTest(23, 1)).toBe('undock');
  });

  it('hitTest before render returns null', () => {
    const nav = new NavBar('ELYSIUM STATION', [{ id: 'undock', label: 'UNDOCK' }]);
    expect(nav.hitTest(16, 1)).toBeNull();
  });
});
