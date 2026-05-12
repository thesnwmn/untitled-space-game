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

const JUMP_ROW = 25;
const DOCK_ROW = 26;
const FOOTER_ROW = 27;

// ── tests ─────────────────────────────────────────────────────────────────────

describe('ShipScene', () => {
  describe('render — layout', () => {
    it('has no border (row 0 is status bar, not border)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).not.toBe('+');
      expect(buf[0][0].char).not.toBe('-');
    });

    it('renders status bar at row 0 with fuel, cargo, and credits', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = rowText(buf, 0);
      expect(text).toContain('FUEL:100%');
      expect(text).toContain('CARGO:0/50T');
      expect(text).toContain('CR:5000');
    });

    it('status bar is in bright-cyan', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][1].fg).toBe('bright-cyan');
    });

    it('renders location at row 1 with station name', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 1)).toContain('Location:');
      expect(rowText(buf, 1)).toContain('ELYSIUM STATION');
      expect(buf[1][1].fg).toBe('bright-cyan');
    });

    it('starfield area (rows 2-24) contains star characters', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      let starCount = 0;
      for (let r = 2; r <= 24; r++) {
        for (let c = 0; c < 40; c++) {
          if (buf[r][c].char === '.' || buf[r][c].char === '*') starCount++;
        }
      }
      expect(starCount).toBeGreaterThan(0);
    });

    it('star characters are in bright-black', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      for (let r = 2; r <= 24; r++) {
        for (let c = 0; c < 40; c++) {
          const cell = buf[r][c];
          if (cell.char === '.' || cell.char === '*') {
            expect(cell.fg).toBe('bright-black');
          }
        }
      }
    });

    it('renders JUMP button at row 25 in bright-yellow', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, JUMP_ROW)).toContain('[ J ] JUMP');
      expect(buf[JUMP_ROW].find(c => c.char !== ' ')?.fg).toBe('bright-yellow');
    });

    it('renders DOCK button at row 26 in bright-yellow', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, DOCK_ROW)).toContain('[ D ] DOCK');
      expect(buf[DOCK_ROW].find(c => c.char !== ' ')?.fg).toBe('bright-yellow');
    });

    it('cursor starts on JUMP button (row 25 has >)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, JUMP_ROW)).toContain('>');
      expect(rowText(buf, DOCK_ROW)).not.toContain('>');
    });

    it('renders keyboard footer hint with navigate and select (no ESC)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, FOOTER_ROW)).toContain('ENTER select');
      expect(rowText(buf, FOOTER_ROW)).not.toContain('ESC');
      expect(buf[FOOTER_ROW].find(c => c.char !== ' ')?.fg).toBe('bright-black');
    });

    it('renders touch footer hint without 2-finger exit', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, touchContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, FOOTER_ROW)).toContain('TAP to select');
      expect(rowText(buf, FOOTER_ROW)).not.toContain('2-finger');
    });
  });

  describe('keyboard navigation', () => {
    it('DOWN moves cursor from JUMP to DOCK', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, DOCK_ROW)).toContain('>');
      expect(rowText(buf, JUMP_ROW)).not.toContain('>');
    });

    it('UP from JUMP wraps to DOCK', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      input.triggerAction('UP');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, DOCK_ROW)).toContain('>');
    });

    it('DOWN from DOCK wraps back to JUMP', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      input.triggerAction('DOWN');
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, JUMP_ROW)).toContain('>');
    });

    it('SELECT on JUMP logs [Ship] Jumping…', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, vi.fn());
      input.triggerAction('SELECT');
      expect(consoleSpy).toHaveBeenCalledWith('[Ship] Jumping…');
      consoleSpy.mockRestore();
    });

    it('SELECT on DOCK calls onDock and silences further input', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, onDock);
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      expect(onDock).toHaveBeenCalledTimes(1);
      input.triggerAction('SELECT');
      expect(onDock).toHaveBeenCalledTimes(1);
    });

    it('BACK action does nothing (not applicable in ship scene)', () => {
      const onDock = vi.fn();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, onDock);
      input.triggerAction('BACK');
      expect(onDock).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('touch navigation', () => {
    it('tap on JUMP row logs placeholder', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, vi.fn());
      input.triggerTap(20, JUMP_ROW);
      expect(consoleSpy).toHaveBeenCalledWith('[Ship] Jumping…');
      consoleSpy.mockRestore();
    });

    it('tap on DOCK row calls onDock', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, onDock);
      input.triggerTap(20, DOCK_ROW);
      expect(onDock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn());
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });
});
