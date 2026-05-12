import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MainMenuScene } from './MainMenuScene';
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

const browserContext: GameContext = { environment: 'browser', primaryInput: 'keyboard' };
const terminalContext: GameContext = { environment: 'terminal', primaryInput: 'keyboard' };
const touchContext: GameContext = { environment: 'browser', primaryInput: 'touch' };

// Menu col for a 40-wide grid: Math.floor((40 - 10) / 2) = 15
// "NEW GAME" (8 chars) + 2 prefix = 10; "QUIT" (4 chars) + 2 prefix = 6; max = 10
const MENU_COL = 15;
const MENU_ROW_START = 16; // 0-indexed

// ── tests ─────────────────────────────────────────────────────────────────────

describe('MainMenuScene', () => {
  describe('render — layout', () => {
    it('clears buffer to black spaces before drawing', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      const buf = makeBuffer(40, 30);
      // pre-fill an interior cell with junk (not covered by border or content)
      buf[20][15] = { char: 'X', fg: 'red', bg: 'red' };
      scene.render(buf);
      expect(buf[20][15]).toEqual({ char: ' ', fg: 'black', bg: 'black' });
    });

    it('renders a border around the screen edges', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // corners
      expect(buf[0][0].char).toBe('+');
      expect(buf[0][39].char).toBe('+');
      expect(buf[29][0].char).toBe('+');
      expect(buf[29][39].char).toBe('+');
      // top/bottom edges
      expect(buf[0][1].char).toBe('-');
      expect(buf[29][20].char).toBe('-');
      // left/right edges
      expect(buf[15][0].char).toBe('|');
      expect(buf[15][39].char).toBe('|');
    });

    it('renders title lines in bright-cyan within rows 1–11', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // "UNTITLED" (8 chars) centred in 40 cols: col = (40-8)/2 = 16
      expect(rowText(buf, 4)).toContain('UNTITLED');
      expect(rowFg(buf, 4, 16)).toBe('bright-cyan');
      // "SPACE GAME" (10 chars) centred in 40 cols: col = (40-10)/2 = 15
      expect(rowText(buf, 7)).toContain('SPACE GAME');
      expect(rowFg(buf, 7, 15)).toBe('bright-cyan');
    });

    it('renders tagline in white on row 11 (0-indexed)', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // "- An ASCII space adventure -" (28 chars) centred in 40 cols: col = (40-28)/2 = 6
      expect(rowText(buf, 11)).toContain('An ASCII space adventure');
      expect(rowFg(buf, 11, 6)).toBe('white');
    });

    it('renders cursor on first item in bright-green', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = rowText(buf, MENU_ROW_START);
      expect(text).toContain('> NEW GAME');
      expect(rowFg(buf, MENU_ROW_START, MENU_COL)).toBe('bright-green');
    });

    it('renders keyboard footer 3 rows from bottom in bright-black', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const footerRow = 30 - 3; // 27
      expect(rowText(buf, footerRow)).toContain('ENTER select');
      // skip border columns (0 and w-1) when checking footer colour
      expect(buf[footerRow].find((c, i) => c.char !== ' ' && i > 0 && i < 39)?.fg).toBe('bright-black');
    });

    it('renders touch footer 3 rows from bottom for touch context', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, touchContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 27)).toContain('tap an option to select');
    });

    it('renders footer at h-3 on a smaller grid', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      const buf = makeBuffer(40, 20);
      scene.render(buf);
      const footerRow = 20 - 3; // 17
      expect(rowText(buf, footerRow)).toContain('ENTER select');
    });
  });

  describe('render — browser vs terminal items', () => {
    it('shows only NEW GAME in browser context', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START)).toContain('NEW GAME');
      expect(rowText(buf, MENU_ROW_START + 1)).not.toContain('QUIT');
    });

    it('shows NEW GAME and QUIT in terminal context', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, terminalContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START)).toContain('NEW GAME');
      expect(rowText(buf, MENU_ROW_START + 1)).toContain('QUIT');
    });

    it('QUIT is unselected (white) when cursor is on NEW GAME', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, terminalContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowFg(buf, MENU_ROW_START + 1, MENU_COL)).toBe('white');
    });
  });

  describe('keyboard navigation', () => {
    it('DOWN moves cursor to next item', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, terminalContext);
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START)).not.toContain('> ');
      expect(rowText(buf, MENU_ROW_START + 1)).toContain('> QUIT');
      expect(rowFg(buf, MENU_ROW_START + 1, MENU_COL)).toBe('bright-green');
    });

    it('UP wraps cursor from first item to last', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, terminalContext);
      input.triggerAction('UP');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START + 1)).toContain('> QUIT');
    });

    it('DOWN wraps cursor from last item to first', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, terminalContext);
      input.triggerAction('DOWN'); // -> QUIT
      input.triggerAction('DOWN'); // -> NEW GAME (wrap)
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START)).toContain('> NEW GAME');
    });

    it('SELECT on NEW GAME logs and sets activated', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      input.triggerAction('SELECT');
      expect(consoleSpy).toHaveBeenCalledWith('[MainMenu] Starting game…');
      consoleSpy.mockRestore();
      // After activation, further input is ignored (cursor stays)
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START)).toContain('> NEW GAME');
    });

    it('BACK has no effect', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, terminalContext);
      input.triggerAction('BACK');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START)).toContain('> NEW GAME');
    });

    it('ignores input after activation', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      input.triggerAction('SELECT'); // activates
      input.triggerAction('SELECT'); // should be ignored
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });
  });

  describe('touch navigation', () => {
    it('tap on menu item row activates that item', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      input.triggerTap(10, MENU_ROW_START);
      expect(consoleSpy).toHaveBeenCalledWith('[MainMenu] Starting game…');
      consoleSpy.mockRestore();
    });

    it('tap on non-menu row has no effect', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      input.triggerTap(10, 0);
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('tap on QUIT row activates QUIT', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, terminalContext);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as () => never);
      input.triggerTap(10, MENU_ROW_START + 1); // tap QUIT row
      expect(consoleSpy).toHaveBeenCalledWith('[MainMenu] Quitting…');
      expect(exitSpy).toHaveBeenCalledWith(0);
      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });

    it('tap ignored after activation', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      input.triggerTap(0, MENU_ROW_START); // activate
      input.triggerTap(0, MENU_ROW_START); // ignored
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = new MainMenuScene(input, browserContext);
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });
});
