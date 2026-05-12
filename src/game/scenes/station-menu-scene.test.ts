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

function makeScene(
  input: MockInputHandler,
  ctx: GameContext,
  onTrader = vi.fn(),
  onMissionBoard = vi.fn(),
  onShip = vi.fn(),
): StationMenuScene {
  return new StationMenuScene(input, ctx, onTrader, onMissionBoard, onShip);
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('StationMenuScene', () => {
  describe('render — layout', () => {
    it('renders a border on rows 0 and 29', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).toBe('+');
      expect(buf[0][39].char).toBe('+');
      expect(buf[29][0].char).toBe('+');
      expect(buf[29][39].char).toBe('+');
      expect(buf[0][1].char).toBe('-');
      expect(buf[15][0].char).toBe('|');
    });

    it('renders station title ELYSIUM STATION at row 2 in bright-cyan', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 2)).toContain('ELYSIUM STATION');
      expect(rowFg(buf, 2, 12)).toBe('bright-cyan');
    });

    it('renders title rule =============== at row 3 in cyan', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 3)).toContain('===============');
      expect(rowFg(buf, 3, 12)).toBe('cyan');
    });

    it('renders TRADER at row 14, MISSION BOARD at row 15, UNDOCK at row 16', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 14)).toContain('TRADER');
      expect(rowText(buf, 15)).toContain('MISSION BOARD');
      expect(rowText(buf, 16)).toContain('UNDOCK');
    });

    it('cursor starts on TRADER in bright-green', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START)).toContain('> TRADER');
      expect(rowFg(buf, MENU_ROW_START, MENU_COL)).toBe('bright-green');
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
    it('DOWN moves cursor through items and wraps from UNDOCK to TRADER', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
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
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      input.triggerAction('UP');
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START + 2)).toContain('> UNDOCK');
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

    it('SELECT on UNDOCK calls onShip once then silences input', () => {
      const onShip = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, keyboardContext, vi.fn(), vi.fn(), onShip);
      input.triggerAction('DOWN');
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      expect(onShip).toHaveBeenCalledTimes(1);
      input.triggerAction('SELECT');
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

    it('tap on row 16 activates UNDOCK and calls onShip', () => {
      const onShip = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, keyboardContext, vi.fn(), vi.fn(), onShip);
      input.triggerTap(10, MENU_ROW_START + 2);
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
