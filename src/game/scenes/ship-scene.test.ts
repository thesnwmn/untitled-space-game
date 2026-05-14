import { describe, it, expect, vi } from 'vitest';
import { ShipScene } from './ShipScene';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';

// ── helpers ──────────────────────────────────────────────────────────────────

class MockInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  private tapHandlers: Array<(col: number, row: number) => void> = [];

  onAction(handler: (action: GameAction) => void): void {
    this.actionHandlers.push(handler);
  }

  onTap(handler: (col: number, row: number) => void): void {
    this.tapHandlers.push(handler);
  }

  triggerAction(action: GameAction): void {
    for (const h of this.actionHandlers) h(action);
  }

  triggerTap(col: number, row: number): void {
    for (const h of this.tapHandlers) h(col, row);
  }
}

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

function rowText(buffer: CharBuffer, row: number): string {
  return buffer[row].map(c => c.char).join('').trimEnd();
}

const keyboardContext: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };
const touchContext: GameContext = { environment: 'browser', primaryInput: 'touch', debug: false };

// Layout constants for 40×30 reference grid
const WINDOW_TOP = 2;
const WINDOW_SILL = 26;  // h - 4
const WINDOW_BOT = 27;   // h - 3
const INT_ROW_START = 3;
const INT_ROW_END = 25;
const BUTTONS_ROW = 28;  // h - 2
const FOOTER_ROW = 29;   // h - 1

// ── tests ─────────────────────────────────────────────────────────────────────

describe('ShipScene', () => {
  describe('render — layout', () => {
    it('has no border (row 0 is status bar, not border)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).not.toBe('+');
      expect(buf[0][0].char).not.toBe('-');
    });

    it('renders status bar at row 0 with fuel, cargo, and credits', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = rowText(buf, 0);
      expect(text).toContain('FUEL:100%');
      expect(text).toContain('CARGO:0/50T');
      expect(text).toContain('CR:5000');
    });

    it('status bar is in bright-cyan', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][1].fg).toBe('bright-cyan');
    });

    it('renders location at row 1 with destination and system name from world data', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = rowText(buf, 1);
      expect(text).toContain('ELYSIUM STATION');
      expect(text).toContain('SOL');
      expect(buf[1][1].fg).toBe('bright-cyan');
    });

    it('top border row has \\ at col 1, _ in middle, / at col w-2', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[WINDOW_TOP][1].char).toBe('\\');
      expect(buf[WINDOW_TOP][38].char).toBe('/');
      expect(buf[WINDOW_TOP][20].char).toBe('_');
    });

    it('interior rows have | at col 1 and col w-2', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      for (let r = INT_ROW_START; r <= INT_ROW_END; r++) {
        expect(buf[r][1].char).toBe('|');
        expect(buf[r][38].char).toBe('|');
      }
    });

    it('sill row has | at col 1, _ in middle, | at col w-2', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[WINDOW_SILL][1].char).toBe('|');
      expect(buf[WINDOW_SILL][38].char).toBe('|');
      expect(buf[WINDOW_SILL][20].char).toBe('_');
    });

    it('corners row has / at col 1, space in middle, \\ at col w-2', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[WINDOW_BOT][1].char).toBe('/');
      expect(buf[WINDOW_BOT][38].char).toBe('\\');
      expect(buf[WINDOW_BOT][20].char).toBe(' ');
    });

    it('interior region contains non-space cells after render (stars or station)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      let nonSpace = false;
      outer: for (let r = INT_ROW_START; r <= INT_ROW_END; r++) {
        for (let c = 1; c <= 38; c++) {
          if (buf[r][c].char !== ' ') { nonSpace = true; break outer; }
        }
      }
      expect(nonSpace).toBe(true);
    });

    it('civilian destination produces HUB station glyph (contains HUB characters in interior)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // HUB glyph contains '[H]' — scan interior for '[' then 'H' then ']'
      let hubFound = false;
      outer: for (let r = INT_ROW_START; r <= INT_ROW_END; r++) {
        for (let c = 2; c <= 37; c++) {
          if (buf[r][c].char === '[' && buf[r][c + 1]?.char === 'H' && buf[r][c + 2]?.char === ']') {
            hubFound = true;
            break outer;
          }
        }
      }
      expect(hubFound).toBe(true);
    });

    it('military destination produces RELAY station glyph (bright-yellow in interior)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'tycho-orbital', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // RELAY glyph is bright-yellow; scan interior for bright-yellow cell
      let relayFound = false;
      outer: for (let r = INT_ROW_START; r <= INT_ROW_END; r++) {
        for (let c = 2; c <= 37; c++) {
          if (buf[r][c].fg === 'bright-yellow' && buf[r][c].char !== ' ') {
            relayFound = true;
            break outer;
          }
        }
      }
      expect(relayFound).toBe(true);
    });

    it('both JUMP and DOCK labels appear on BUTTONS_ROW', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const line = rowText(buf, BUTTONS_ROW);
      expect(line).toContain('[ J ] JUMP');
      expect(line).toContain('[ D ] DOCK');
    });

    it('cursor starts on JUMP (> prefix appears on BUTTONS_ROW)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const line = rowText(buf, BUTTONS_ROW);
      expect(line).toContain('>');
      expect(line.indexOf('>')).toBeLessThan(line.indexOf('DOCK'));
    });

    it('renders keyboard footer hint with navigate and select (no ESC)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, FOOTER_ROW)).toContain('ENTER select');
      expect(rowText(buf, FOOTER_ROW)).not.toContain('ESC');
      expect(buf[FOOTER_ROW].find(c => c.char !== ' ')?.fg).toBe('bright-black');
    });

    it('renders touch footer hint without 2-finger exit', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, touchContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, FOOTER_ROW)).toContain('TAP to select');
      expect(rowText(buf, FOOTER_ROW)).not.toContain('2-finger');
    });
  });

  describe('window border colours', () => {
    it('all border cells are in bright-black', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[WINDOW_TOP][1].fg).toBe('bright-black');
      expect(buf[WINDOW_TOP][20].fg).toBe('bright-black');
      expect(buf[INT_ROW_START][1].fg).toBe('bright-black');
      expect(buf[WINDOW_SILL][1].fg).toBe('bright-black');
      expect(buf[WINDOW_BOT][1].fg).toBe('bright-black');
    });
  });

  describe('animation forwarding', () => {
    it('update advances starfield (interior cells differ after large dt)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf1 = makeBuffer(40, 30);
      scene.render(buf1);
      scene.update(5000);
      const buf2 = makeBuffer(40, 30);
      scene.render(buf2);
      let changed = false;
      outer: for (let r = INT_ROW_START; r <= INT_ROW_END; r++) {
        for (let c = 1; c <= 38; c++) {
          if (buf1[r][c].char !== buf2[r][c].char) { changed = true; break outer; }
        }
      }
      expect(changed).toBe(true);
    });

    it('update advances station (no throw, renders after update)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf); // lazy-init station
      expect(() => scene.update(2250)).not.toThrow();
      expect(() => scene.render(buf)).not.toThrow();
    });
  });

  describe('keyboard navigation', () => {
    it('DOWN moves cursor so > appears near DOCK on BUTTONS_ROW', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const line = rowText(buf, BUTTONS_ROW);
      expect(line.indexOf('>')).toBeGreaterThan(line.indexOf('JUMP'));
    });

    it('UP from JUMP wraps cursor to DOCK', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      input.triggerAction('UP');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const line = rowText(buf, BUTTONS_ROW);
      expect(line.indexOf('>')).toBeGreaterThan(line.indexOf('JUMP'));
    });

    it('DOWN from DOCK wraps back to JUMP', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      input.triggerAction('DOWN');
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const line = rowText(buf, BUTTONS_ROW);
      expect(line.indexOf('>')).toBeLessThan(line.indexOf('DOCK'));
    });

    it('SELECT on JUMP calls onJump', () => {
      const onJump = vi.fn();
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, 'elysium-station', onJump, vi.fn());
      input.triggerAction('SELECT');
      expect(onJump).toHaveBeenCalledTimes(1);
    });

    it('SELECT on DOCK calls onDock and silences further input', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), onDock);
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      expect(onDock).toHaveBeenCalledTimes(1);
      input.triggerAction('SELECT');
      expect(onDock).toHaveBeenCalledTimes(1);
    });

    it('BACK action does nothing (not applicable in ship scene)', () => {
      const onJump = vi.fn();
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, 'elysium-station', onJump, onDock);
      input.triggerAction('BACK');
      expect(onJump).not.toHaveBeenCalled();
      expect(onDock).not.toHaveBeenCalled();
    });
  });

  describe('touch navigation', () => {
    it('tap left half of BUTTONS_ROW calls onJump', () => {
      const onJump = vi.fn();
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, 'elysium-station', onJump, vi.fn());
      input.triggerTap(10, BUTTONS_ROW); // col 10 < 20 (w/2) → JUMP
      expect(onJump).toHaveBeenCalledTimes(1);
    });

    it('tap right half of BUTTONS_ROW calls onDock', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), onDock);
      input.triggerTap(30, BUTTONS_ROW); // col 30 >= 20 (w/2) → DOCK
      expect(onDock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });
});
