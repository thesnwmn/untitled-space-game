import { describe, it, expect, vi } from 'vitest';
import { TraderScene } from './TraderScene';
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

const keyboardContext: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };
const touchContext: GameContext = { environment: 'browser', primaryInput: 'touch', debug: false };

const ITEM_ROW_START = 7;
const TAB_ROW = 5;
const BUY_TAB_COL = 10;
const SELL_TAB_COL = 17;

// ── tests ─────────────────────────────────────────────────────────────────────

describe('TraderScene', () => {
  describe('render — layout', () => {
    it('renders a border on rows 0 and 29', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).toBe('+');
      expect(buf[0][39].char).toBe('+');
      expect(buf[29][0].char).toBe('+');
      expect(buf[29][39].char).toBe('+');
    });

    it('renders trader name at row 2 in bright-cyan', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 2)).toContain('MERCHANT KESS');
      expect(buf[2].find((c, i) => c.char !== ' ' && i > 0 && i < 39)?.fg).toBe('bright-cyan');
    });

    it('renders title rule at row 3 in cyan', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 3)).toContain('=============');
      expect(buf[3].find(c => c.char === '=')?.fg).toBe('cyan');
    });

    it('renders [BUY] tab active (bright-green) and [SELL] inactive (white) by default', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, TAB_ROW)).toContain('[BUY]');
      expect(rowText(buf, TAB_ROW)).toContain('[SELL]');
      expect(rowFg(buf, TAB_ROW, BUY_TAB_COL)).toBe('bright-green');
      expect(rowFg(buf, TAB_ROW, SELL_TAB_COL)).toBe('white');
    });

    it('renders buy items in content area starting at row 7', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).toContain('Iron Ore');
      expect(rowText(buf, ITEM_ROW_START)).toContain('120 CR');
      expect(rowText(buf, ITEM_ROW_START + 1)).toContain('Copper Wire');
    });

    it('cursor starts on first item in bright-green', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).toContain('>');
      expect(rowFg(buf, ITEM_ROW_START, 1)).toBe('bright-green');
    });

    it('renders keyboard footer hint', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 27)).toContain('ESC return');
      expect(buf[27].find((c, i) => c.char !== ' ' && i > 0 && i < 39)?.fg).toBe('bright-black');
    });

    it('renders touch footer hint for touch context', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, touchContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 27)).toContain('TAP to select');
    });
  });

  describe('keyboard navigation', () => {
    it('DOWN moves cursor to next item', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      input.triggerAction('DOWN');
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START + 1)).toContain('>');
      expect(rowFg(buf, ITEM_ROW_START + 1, 1)).toBe('bright-green');
    });

    it('UP from first item wraps to last item', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      input.triggerAction('UP');
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START + 5)).toContain('>');
    });

    it('RIGHT switches to SELL tab and resets cursor', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      input.triggerAction('DOWN');
      input.triggerAction('RIGHT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowFg(buf, TAB_ROW, SELL_TAB_COL)).toBe('bright-green');
      expect(rowFg(buf, TAB_ROW, BUY_TAB_COL)).toBe('white');
      expect(rowText(buf, ITEM_ROW_START)).toContain('Water Supplies (x5)');
      expect(rowText(buf, ITEM_ROW_START)).toContain('>');
    });

    it('sell tab displays qty for each item', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      input.triggerAction('RIGHT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).toContain('Water Supplies (x5)');
      expect(rowText(buf, ITEM_ROW_START + 1)).toContain('Oxygen Tank (x3)');
      expect(rowText(buf, ITEM_ROW_START + 2)).toContain('Nutrient Paste (x8)');
    });

    it('LEFT switches back to BUY tab', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      input.triggerAction('RIGHT');
      input.triggerAction('LEFT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowFg(buf, TAB_ROW, BUY_TAB_COL)).toBe('bright-green');
      expect(rowText(buf, ITEM_ROW_START)).toContain('Iron Ore');
    });

    it('SELECT on item logs placeholder', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new TraderScene(input, keyboardContext, vi.fn());
      input.triggerAction('SELECT');
      expect(consoleSpy).toHaveBeenCalledWith('[Trader] Selected Iron Ore');
      consoleSpy.mockRestore();
    });

    it('BACK calls onBack and silences further input', () => {
      const onBack = vi.fn();
      const input = new MockInputHandler();
      new TraderScene(input, keyboardContext, onBack);
      input.triggerAction('BACK');
      expect(onBack).toHaveBeenCalledTimes(1);
      input.triggerAction('BACK');
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('touch navigation', () => {
    it('tap on BUY tab switches back from SELL to BUY', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      input.triggerAction('RIGHT'); // switch to SELL first
      input.triggerTap(BUY_TAB_COL, TAB_ROW); // tap BUY
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowFg(buf, TAB_ROW, BUY_TAB_COL)).toBe('bright-green');
      expect(rowText(buf, ITEM_ROW_START)).toContain('Iron Ore');
    });

    it('tap on SELL tab switches to SELL and shows qty', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      input.triggerTap(SELL_TAB_COL, TAB_ROW);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowFg(buf, TAB_ROW, SELL_TAB_COL)).toBe('bright-green');
      expect(rowText(buf, ITEM_ROW_START)).toContain('Water Supplies (x5)');
    });

    it('tap on item row logs placeholder', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new TraderScene(input, keyboardContext, vi.fn());
      input.triggerTap(5, ITEM_ROW_START + 2);
      expect(consoleSpy).toHaveBeenCalledWith('[Trader] Selected Refined Fuel');
      consoleSpy.mockRestore();
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, vi.fn());
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });
});
