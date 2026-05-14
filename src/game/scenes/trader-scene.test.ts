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

const keyboardContext: GameContext = {
  environment: 'browser', primaryInput: 'keyboard', debug: false,
  systemId: 'sol', destinationId: 'elysium-station', credits: 5000,
};
const touchContext: GameContext = {
  environment: 'browser', primaryInput: 'touch', debug: false,
  systemId: 'sol', destinationId: 'elysium-station', credits: 5000,
};

// CONTENT_TOP = 3; tab row = CONTENT_TOP+2 = 5; item row start = CONTENT_TOP+4 = 7
const ITEM_ROW_START = 7;
const TAB_ROW = 5;

// Tab bar "| BUY | SELL |" left-aligned at col 2
// | at 2, ' BUY ' at 3-7, | at 8, ' SELL ' at 9-14, | at 15
const BUY_TAB_COL = 5;    // middle of ' BUY ' (cols 3-7)
const SELL_TAB_COL = 12;  // middle of ' SELL ' (cols 9-14)

// Footer at row 29 (h-1 for 40×30): ":: [1] UNDOCK :: [2] HUB :::..."
// [1] UNDOCK: button cols 3-12; [2] HUB: button cols 17-23
const FOOTER_ROW = 29;
const NAV_UNDOCK_COL = 3;
const NAV_HUB_COL = 17;

// ── tests ─────────────────────────────────────────────────────────────────────

describe('TraderScene', () => {
  describe('render — layout', () => {
    it('does not render a border', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).not.toBe('+');
    });

    it('chrome header row 0 contains system name SOL', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 0)).toContain('SOL');
    });

    it('chrome footer row h-1 contains [1] UNDOCK and [2] HUB', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, FOOTER_ROW)).toContain('[1]');
      expect(rowText(buf, FOOTER_ROW)).toContain('UNDOCK');
      expect(rowText(buf, FOOTER_ROW)).toContain('[2]');
      expect(rowText(buf, FOOTER_ROW)).toContain('HUB');
    });

    it('renders trader name at row 3 in bright-blue', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 3)).toContain('MERCHANT KESS');
      expect(buf[3].find((c, i) => c.char !== ' ' && i >= 2)?.fg).toBe('bright-blue');
    });

    it("renders ' underline at row 4 in bright-black", () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 4)).toContain("'");
      expect(buf[4].find(c => c.char === "'")?.fg).toBe('bright-black');
    });

    it('renders | BUY | SELL | tab bar at tab row', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = rowText(buf, TAB_ROW);
      expect(text).toContain('BUY');
      expect(text).toContain('SELL');
      // Active BUY tab has green background
      expect(buf[TAB_ROW][BUY_TAB_COL].bg).toBe('green');
      expect(buf[TAB_ROW][BUY_TAB_COL].fg).toBe('black');
      // Inactive SELL tab has black background
      expect(buf[TAB_ROW][SELL_TAB_COL].bg).toBe('black');
    });

    it('renders buy items in content area starting at row 7', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).toContain('Iron Ore');
      expect(rowText(buf, ITEM_ROW_START)).toContain('120 CR');
      expect(rowText(buf, ITEM_ROW_START + 1)).toContain('Copper Wire');
    });

    it('cursor starts on first item in bright-green', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).toContain('>');
      expect(rowFg(buf, ITEM_ROW_START, 2)).toBe('bright-green');
    });
  });

  describe('keyboard navigation', () => {
    it('DOWN moves cursor to next item', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      input.triggerAction('DOWN');
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START + 1)).toContain('>');
      expect(rowFg(buf, ITEM_ROW_START + 1, 2)).toBe('bright-green');
    });

    it('UP from first item wraps to last item', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      input.triggerAction('UP');
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START + 5)).toContain('>');
    });

    it('RIGHT switches to SELL tab and resets cursor', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      input.triggerAction('DOWN');
      input.triggerAction('RIGHT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[TAB_ROW][SELL_TAB_COL].bg).toBe('green');
      expect(buf[TAB_ROW][BUY_TAB_COL].bg).toBe('black');
      expect(rowText(buf, ITEM_ROW_START)).toContain('Water Supplies (x5)');
      expect(rowText(buf, ITEM_ROW_START)).toContain('>');
    });

    it('sell tab displays qty for each item', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      input.triggerAction('RIGHT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).toContain('Water Supplies (x5)');
      expect(rowText(buf, ITEM_ROW_START + 1)).toContain('Oxygen Tank (x3)');
      expect(rowText(buf, ITEM_ROW_START + 2)).toContain('Nutrient Paste (x8)');
    });

    it('LEFT switches back to BUY tab', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      input.triggerAction('RIGHT');
      input.triggerAction('LEFT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[TAB_ROW][BUY_TAB_COL].bg).toBe('green');
      expect(rowText(buf, ITEM_ROW_START)).toContain('Iron Ore');
    });

    it('SELECT on item logs placeholder', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      input.triggerAction('SELECT');
      expect(consoleSpy).toHaveBeenCalledWith('[Trader] Selected Iron Ore');
      consoleSpy.mockRestore();
    });

    it('BACK calls onHub and silences further input', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      new TraderScene(input, keyboardContext, 'elysium-station', onHub, vi.fn());
      input.triggerAction('BACK');
      expect(onHub).toHaveBeenCalledTimes(1);
      input.triggerAction('BACK');
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('NAV_2 calls onHub', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      new TraderScene(input, keyboardContext, 'elysium-station', onHub, vi.fn());
      input.triggerAction('NAV_2');
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('NAV_1 calls onUndock', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), onUndock);
      input.triggerAction('NAV_1');
      expect(onUndock).toHaveBeenCalledTimes(1);
    });
  });

  describe('touch navigation', () => {
    it('tap on BUY tab area switches back from SELL to BUY', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      input.triggerAction('RIGHT'); // switch to SELL first
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(BUY_TAB_COL, TAB_ROW);
      const buf2 = makeBuffer(40, 30);
      scene.render(buf2);
      expect(buf2[TAB_ROW][BUY_TAB_COL].bg).toBe('green');
      expect(rowText(buf2, ITEM_ROW_START)).toContain('Iron Ore');
    });

    it('tap on SELL tab area switches to SELL and shows qty', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(SELL_TAB_COL, TAB_ROW);
      const buf2 = makeBuffer(40, 30);
      scene.render(buf2);
      expect(buf2[TAB_ROW][SELL_TAB_COL].bg).toBe('green');
      expect(rowText(buf2, ITEM_ROW_START)).toContain('Water Supplies (x5)');
    });

    it('tap on item row logs placeholder', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      input.triggerTap(5, ITEM_ROW_START + 2);
      expect(consoleSpy).toHaveBeenCalledWith('[Trader] Selected Refined Fuel');
      consoleSpy.mockRestore();
    });

    it('tap on footer UNDOCK button fires onUndock and silences input', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), onUndock);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(NAV_UNDOCK_COL, FOOTER_ROW);
      expect(onUndock).toHaveBeenCalledTimes(1);
      input.triggerTap(NAV_UNDOCK_COL, FOOTER_ROW);
      expect(onUndock).toHaveBeenCalledTimes(1);
    });

    it('tap on footer HUB button fires onHub and silences input', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', onHub, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(NAV_HUB_COL, FOOTER_ROW);
      expect(onHub).toHaveBeenCalledTimes(1);
      input.triggerTap(NAV_HUB_COL, FOOTER_ROW);
      expect(onHub).toHaveBeenCalledTimes(1);
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = new TraderScene(input, keyboardContext, 'elysium-station', vi.fn(), vi.fn());
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });
});
