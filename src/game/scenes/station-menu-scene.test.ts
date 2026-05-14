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

const keyboardContext: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };
const touchContext: GameContext = { environment: 'browser', primaryInput: 'touch', debug: false };

// maxItemWidth = "MISSION BOARD".length + 2 = 15
// menuCol = Math.floor((40 - 15) / 2) = 12
const MENU_COL = 12;
const MENU_ROW_START = 14;

// NavBar single [UNDOCK] (8 chars) in 40-col buffer: startCol = floor((40-8)/2) = 16
const NAV_UNDOCK_COL = 16;

function makeScene(
  input: MockInputHandler,
  ctx: GameContext,
  onTrader = vi.fn(),
  onMissionBoard = vi.fn(),
  onShip = vi.fn(),
): StationMenuScene {
  return new StationMenuScene(input, ctx, 'elysium-station', onTrader, onMissionBoard, onShip);
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('StationMenuScene', () => {
  describe('render — layout', () => {
    it('does not render a border', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).toBe(' ');
      expect(buf[0][0].fg).toBe('black');
    });

    it('nav bar row 0 contains station name ELYSIUM STATION in bright-cyan', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 0)).toContain('ELYSIUM STATION');
      expect(rowFg(buf, 0, 12)).toBe('bright-cyan');
    });

    it('nav bar row 1 contains [UNDOCK]', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 1)).toContain('[UNDOCK]');
    });

    it('scene title at row 3 reads HUB in cyan', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 3)).toContain('HUB');
      expect(buf[3].find(c => c.char === 'H')?.fg).toBe('cyan');
    });

    it('renders title rule === at row 4 in cyan', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 4)).toContain('===');
      expect(buf[4].find(c => c.char === '=')?.fg).toBe('cyan');
    });

    it('renders TRADER at row 14 and MISSION BOARD at row 15 for elysium-station; no UNDOCK in items', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 14)).toContain('TRADER');
      expect(rowText(buf, 15)).toContain('MISSION BOARD');
      expect(rowText(buf, 14)).not.toContain('UNDOCK');
      expect(rowText(buf, 15)).not.toContain('UNDOCK');
    });

    it('cursor starts on TRADER in bright-green', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START)).toContain('> TRADER');
      expect(rowFg(buf, MENU_ROW_START, MENU_COL)).toBe('bright-green');
    });

    it('renders description lines at row 5 in bright-black', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = rowText(buf, 5);
      expect(text.trim().length).toBeGreaterThan(0);
      expect(buf[5].find((c, i) => c.char !== ' ' && i >= 2)?.fg).toBe('bright-black');
    });

    it('renders DANGER: line below description in bright-black', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // elysium-station description wraps to 3 lines; DANGER at row 5+3+1=9
      const dangerRow = rowText(buf, 9);
      expect(dangerRow).toContain('DANGER:');
      expect(buf[9].find((c, i) => c.char !== ' ' && i >= 2)?.fg).toBe('bright-black');
    });

    it('does not show TRADER item when amenities.trader is false', () => {
      const input = new MockInputHandler();
      const scene = new StationMenuScene(input, keyboardContext, 'tycho-orbital', vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // tycho-orbital has trader=false; only MISSION BOARD should appear at row 14
      expect(rowText(buf, 14)).toContain('MISSION BOARD');
      expect(rowText(buf, 14)).not.toContain('TRADER');
    });

    it('renders keyboard footer hint at row 27 in bright-black', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 27)).toContain('ENTER select');
      expect(buf[27].find((c, i) => c.char !== ' ' && i > 0 && i < 39)?.fg).toBe('bright-black');
    });

    it('renders touch footer hint at row 27 for touch context', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, touchContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 27)).toContain('tap an option to select');
    });
  });

  describe('keyboard navigation', () => {
    it('DOWN moves cursor from TRADER to MISSION BOARD and wraps back to TRADER', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);

      input.triggerAction('DOWN');
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START + 1)).toContain('> MISSION BOARD');

      input.triggerAction('DOWN');
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START)).toContain('> TRADER');
    });

    it('UP from TRADER wraps to MISSION BOARD', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      input.triggerAction('UP');
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START + 1)).toContain('> MISSION BOARD');
    });

    it('SELECT on TRADER calls onTrader callback once', () => {
      const onTrader = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, keyboardContext, onTrader);
      input.triggerAction('SELECT');
      expect(onTrader).toHaveBeenCalledTimes(1);
    });

    it('SELECT on MISSION BOARD calls onMissionBoard callback once', () => {
      const onMissionBoard = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, keyboardContext, vi.fn(), onMissionBoard);
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      expect(onMissionBoard).toHaveBeenCalledTimes(1);
    });

    it('ESC fires onShip once and silences further input', () => {
      const onShip = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, keyboardContext, vi.fn(), vi.fn(), onShip);
      input.triggerAction('BACK');
      expect(onShip).toHaveBeenCalledTimes(1);
      input.triggerAction('BACK');
      expect(onShip).toHaveBeenCalledTimes(1);
    });

    it('input silenced after any selection (second SELECT ignored)', () => {
      const onTrader = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, keyboardContext, onTrader);
      input.triggerAction('SELECT');
      input.triggerAction('SELECT');
      expect(onTrader).toHaveBeenCalledTimes(1);
    });
  });

  describe('touch navigation', () => {
    it('tap on row 14 activates TRADER', () => {
      const onTrader = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, keyboardContext, onTrader);
      input.triggerTap(10, MENU_ROW_START);
      expect(onTrader).toHaveBeenCalledTimes(1);
    });

    it('tap on row 15 activates MISSION BOARD', () => {
      const onMissionBoard = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, keyboardContext, vi.fn(), onMissionBoard);
      input.triggerTap(10, MENU_ROW_START + 1);
      expect(onMissionBoard).toHaveBeenCalledTimes(1);
    });

    it('tap on [UNDOCK] nav button fires onShip', () => {
      const onShip = vi.fn();
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext, vi.fn(), vi.fn(), onShip);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(NAV_UNDOCK_COL, 1);
      expect(onShip).toHaveBeenCalledTimes(1);
    });

    it('tap on non-item row does nothing', () => {
      const onTrader = vi.fn();
      const onMissionBoard = vi.fn();
      const onShip = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, keyboardContext, onTrader, onMissionBoard, onShip);
      input.triggerTap(10, 0);
      input.triggerTap(10, 10);
      input.triggerTap(10, 29);
      expect(onTrader).not.toHaveBeenCalled();
      expect(onMissionBoard).not.toHaveBeenCalled();
      expect(onShip).not.toHaveBeenCalled();
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });
});
