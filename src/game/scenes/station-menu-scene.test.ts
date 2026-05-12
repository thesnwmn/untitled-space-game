import { describe, it, expect, vi } from 'vitest';
import { StationMenuScene } from './StationMenuScene';
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

function rowFg(buffer: CharBuffer, row: number, col: number): Color {
  return buffer[row][col].fg;
}

const keyboardContext: GameContext = { environment: 'browser', primaryInput: 'keyboard' };
const touchContext: GameContext = { environment: 'browser', primaryInput: 'touch' };

// maxItemWidth = "MISSION BOARD".length + 2 = 15
// menuCol = Math.floor((40 - 15) / 2) = 12
const MENU_COL = 12;
const MENU_ROW_START = 14;

// ── tests ─────────────────────────────────────────────────────────────────────

describe('StationMenuScene', () => {
  describe('render — layout', () => {
    it('renders a border on rows 0 and 29', () => {
      const input = new MockInputHandler();
      new StationMenuScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      buf[10][10] = { char: 'X', fg: 'red', bg: 'red' };
      new StationMenuScene(input, keyboardContext, vi.fn()).render(buf);
      expect(buf[0][0].char).toBe('+');
      expect(buf[0][39].char).toBe('+');
      expect(buf[29][0].char).toBe('+');
      expect(buf[29][39].char).toBe('+');
      expect(buf[0][1].char).toBe('-');
      expect(buf[15][0].char).toBe('|');
    });

    it('renders station title ELYSIUM STATION at row 2 in bright-cyan', () => {
      const input = new MockInputHandler();
      const scene = new StationMenuScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 2)).toContain('ELYSIUM STATION');
      expect(rowFg(buf, 2, 12)).toBe('bright-cyan');
    });

    it('renders title rule =============== at row 3 in cyan', () => {
      const input = new MockInputHandler();
      const scene = new StationMenuScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 3)).toContain('===============');
      expect(rowFg(buf, 3, 12)).toBe('cyan');
    });

    it('renders TRADER at row 14, MISSION BOARD at row 15, UNDOCK at row 16', () => {
      const input = new MockInputHandler();
      const scene = new StationMenuScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 14)).toContain('TRADER');
      expect(rowText(buf, 15)).toContain('MISSION BOARD');
      expect(rowText(buf, 16)).toContain('UNDOCK');
    });

    it('cursor starts on TRADER in bright-green', () => {
      const input = new MockInputHandler();
      const scene = new StationMenuScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START)).toContain('> TRADER');
      expect(rowFg(buf, MENU_ROW_START, MENU_COL)).toBe('bright-green');
    });

    it('renders keyboard footer hint at row 27 in bright-black', () => {
      const input = new MockInputHandler();
      const scene = new StationMenuScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 27)).toContain('ENTER select');
      expect(buf[27].find((c, i) => c.char !== ' ' && i > 0 && i < 39)?.fg).toBe('bright-black');
    });

    it('renders touch footer hint at row 27 for touch context', () => {
      const input = new MockInputHandler();
      const scene = new StationMenuScene(input, touchContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 27)).toContain('tap an option to select');
    });
  });

  describe('keyboard navigation', () => {
    it('DOWN moves cursor through items and wraps from UNDOCK to TRADER', () => {
      const input = new MockInputHandler();
      const scene = new StationMenuScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);

      input.triggerAction('DOWN');
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START + 1)).toContain('> MISSION BOARD');

      input.triggerAction('DOWN');
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START + 2)).toContain('> UNDOCK');

      input.triggerAction('DOWN');
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START)).toContain('> TRADER');
    });

    it('UP from TRADER wraps to UNDOCK', () => {
      const input = new MockInputHandler();
      const scene = new StationMenuScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      input.triggerAction('UP');
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START + 2)).toContain('> UNDOCK');
    });

    it('SELECT on TRADER logs placeholder message', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new StationMenuScene(input, keyboardContext, vi.fn());
      input.triggerAction('SELECT');
      expect(consoleSpy).toHaveBeenCalledWith('[Station] Opening trader…');
      consoleSpy.mockRestore();
    });

    it('SELECT on MISSION BOARD logs placeholder message', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new StationMenuScene(input, keyboardContext, vi.fn());
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      expect(consoleSpy).toHaveBeenCalledWith('[Station] Opening mission board…');
      consoleSpy.mockRestore();
    });

    it('SELECT on UNDOCK calls onUndock once then silences input', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      new StationMenuScene(input, keyboardContext, onUndock);
      input.triggerAction('DOWN');
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      expect(onUndock).toHaveBeenCalledTimes(1);
      input.triggerAction('SELECT');
      expect(onUndock).toHaveBeenCalledTimes(1);
    });

    it('input silenced after any selection (second SELECT ignored)', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new StationMenuScene(input, keyboardContext, vi.fn());
      input.triggerAction('SELECT');
      input.triggerAction('SELECT');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });
  });

  describe('touch navigation', () => {
    it('tap on row 14 activates TRADER', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new StationMenuScene(input, keyboardContext, vi.fn());
      input.triggerTap(10, MENU_ROW_START);
      expect(consoleSpy).toHaveBeenCalledWith('[Station] Opening trader…');
      consoleSpy.mockRestore();
    });

    it('tap on row 15 activates MISSION BOARD', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new StationMenuScene(input, keyboardContext, vi.fn());
      input.triggerTap(10, MENU_ROW_START + 1);
      expect(consoleSpy).toHaveBeenCalledWith('[Station] Opening mission board…');
      consoleSpy.mockRestore();
    });

    it('tap on row 16 activates UNDOCK and calls onUndock', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      new StationMenuScene(input, keyboardContext, onUndock);
      input.triggerTap(10, MENU_ROW_START + 2);
      expect(onUndock).toHaveBeenCalledTimes(1);
    });

    it('tap on non-item row does nothing', () => {
      const onUndock = vi.fn();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new StationMenuScene(input, keyboardContext, onUndock);
      input.triggerTap(10, 0);
      input.triggerTap(10, 10);
      input.triggerTap(10, 29);
      expect(onUndock).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = new StationMenuScene(input, keyboardContext, vi.fn());
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });
});
