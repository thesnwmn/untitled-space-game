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

const keyboardContext: GameContext = {
  environment: 'browser', primaryInput: 'keyboard', debug: false,
  systemId: 'sol', destinationId: 'elysium-station', credits: 5000,
};
const touchContext: GameContext = {
  environment: 'browser', primaryInput: 'touch', debug: false,
  systemId: 'sol', destinationId: 'elysium-station', credits: 5000,
};

// elysium-station description wraps to 3 lines + dangerLine = 4 info lines
// itemStartRow = CONTENT_TOP + 2 + 4 + 1 = 10
const MENU_ROW_START = 10;

// Footer at row 29 (h-1 for 40×30)
const FOOTER_ROW = 29;
// ":: [1] UNDOCK ::::::::::::..."
// UNDOCK button: cols 3-12
const NAV_UNDOCK_COL = 3;

// Default: full tank (no BUY FUEL item), 5000 credits
function makeScene(
  input: MockInputHandler,
  ctx: GameContext,
  onTrader = vi.fn(),
  onMissionBoard = vi.fn(),
  onShip = vi.fn(),
  fuelL = 100,
  fuelCapacityL = 100,
  credits = 5000,
  onRefuel = vi.fn(),
): StationMenuScene {
  return new StationMenuScene(input, ctx, 'elysium-station', fuelL, fuelCapacityL, credits, onRefuel, onTrader, onMissionBoard, onShip);
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('StationMenuScene', () => {
  describe('render — layout', () => {
    it('does not render a border', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).not.toBe('+');
    });

    it('chrome header row 0 contains system name SOL', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 0)).toContain('SOL');
    });

    it('chrome header row 1 contains destination name ELYSIUM STATION', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 1)).toContain('ELYSIUM STATION');
    });

    it('chrome footer row h-1 contains [1] UNDOCK', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, FOOTER_ROW)).toContain('[1]');
      expect(rowText(buf, FOOTER_ROW)).toContain('UNDOCK');
    });

    it('scene title at row 3 reads HUB in bright-white', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 3)).toContain('HUB');
      expect(buf[3].find((c, i) => c.char !== ' ' && i >= 2)?.fg).toBe('bright-white');
    });

    it("renders ' underline at row 4 in bright-black", () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 4)).toContain("'");
      expect(buf[4].find(c => c.char === "'")?.fg).toBe('bright-black');
    });

    it('renders TRADER at row 10 and MISSION BOARD at row 11 (full tank — no BUY FUEL)', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START)).toContain('TRADER');
      expect(rowText(buf, MENU_ROW_START + 1)).toContain('MISSION BOARD');
    });

    it('cursor starts on TRADER in bright-green', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MENU_ROW_START)).toContain('> TRADER');
      expect(rowFg(buf, MENU_ROW_START, 2)).toBe('bright-green');
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
      // elysium-station description wraps to 3 lines; danger at row 5+3=8
      const dangerRow = rowText(buf, 8);
      expect(dangerRow).toContain('DANGER:');
      expect(buf[8].find((c, i) => c.char !== ' ' && i >= 2)?.fg).toBe('bright-black');
    });

    it('does not show TRADER item when amenities.trader is false', () => {
      const input = new MockInputHandler();
      // tycho-orbital: trader=false; only MISSION BOARD
      const ctx: GameContext = { ...keyboardContext, destinationId: 'tycho-orbital' };
      const scene = new StationMenuScene(input, ctx, 'tycho-orbital', 100, 100, 5000, vi.fn(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // First item should be MISSION BOARD
      let foundMission = false;
      let foundTrader = false;
      for (let r = 0; r < 30; r++) {
        const t = rowText(buf, r);
        if (t.includes('MISSION BOARD')) foundMission = true;
        if (t.includes('TRADER') && !t.includes('MISSION')) foundTrader = true;
      }
      expect(foundMission).toBe(true);
      expect(foundTrader).toBe(false);
    });
  });

  describe('BUY FUEL', () => {
    it('BUY FUEL appears when amenities.fuel is true and tank is not full', () => {
      const input = new MockInputHandler();
      // elysium-station has amenities.fuel = true; 80/100 L
      const scene = makeScene(input, keyboardContext, vi.fn(), vi.fn(), vi.fn(), 80, 100);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      let found = false;
      for (let r = 0; r < buf.length; r++) {
        if (rowText(buf, r).includes('BUY FUEL')) { found = true; break; }
      }
      expect(found).toBe(true);
    });

    it('BUY FUEL shows correct litre and cost values', () => {
      const input = new MockInputHandler();
      // 80 L tank, cap 100 L → needs 20 L → cost 200 CR
      const scene = makeScene(input, keyboardContext, vi.fn(), vi.fn(), vi.fn(), 80, 100);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      let found = false;
      for (let r = 0; r < buf.length; r++) {
        const text = rowText(buf, r);
        if (text.includes('BUY FUEL')) {
          expect(text).toContain('+20L');
          expect(text).toContain('200CR');
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    it('BUY FUEL is absent when tank is already full', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext, vi.fn(), vi.fn(), vi.fn(), 100, 100);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      for (let r = 0; r < buf.length; r++) {
        expect(rowText(buf, r)).not.toContain('BUY FUEL');
      }
    });

    it.skip('BUY FUEL is absent at a station with no fuel amenity', () => {
      // TODO: all current world-data destinations have amenities.fuel = true, so there
      // is no station to test the fuel=false branch against. Enable this test when a
      // destination with fuel=false is added to world-data.ts.
    });

    it('selecting BUY FUEL calls onRefuel with correct cost', () => {
      const onRefuel = vi.fn();
      const input = new MockInputHandler();
      // elysium-station: fuel=true, fuelL=80, cap=100 → cost = 20 * 10 = 200 CR
      const scene = makeScene(input, keyboardContext, vi.fn(), vi.fn(), vi.fn(), 80, 100, 5000, onRefuel);
      // BUY FUEL is item at index 2 (TRADER=0, MISSION BOARD=1, BUY FUEL=2)
      input.triggerAction('DOWN');
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      expect(onRefuel).toHaveBeenCalledTimes(1);
      expect(onRefuel).toHaveBeenCalledWith(200);
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

    it('BACK fires onShip once and silences further input', () => {
      const onShip = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, keyboardContext, vi.fn(), vi.fn(), onShip);
      input.triggerAction('BACK');
      expect(onShip).toHaveBeenCalledTimes(1);
      input.triggerAction('BACK');
      expect(onShip).toHaveBeenCalledTimes(1);
    });

    it('NAV_1 fires onShip', () => {
      const onShip = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, keyboardContext, vi.fn(), vi.fn(), onShip);
      input.triggerAction('NAV_1');
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
    it('tap on row 10 activates TRADER', () => {
      const onTrader = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, keyboardContext, onTrader);
      input.triggerTap(10, MENU_ROW_START);
      expect(onTrader).toHaveBeenCalledTimes(1);
    });

    it('tap on row 11 activates MISSION BOARD', () => {
      const onMissionBoard = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, keyboardContext, vi.fn(), onMissionBoard);
      input.triggerTap(10, MENU_ROW_START + 1);
      expect(onMissionBoard).toHaveBeenCalledTimes(1);
    });

    it('tap on footer UNDOCK button fires onShip', () => {
      const onShip = vi.fn();
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext, vi.fn(), vi.fn(), onShip);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(NAV_UNDOCK_COL, FOOTER_ROW);
      expect(onShip).toHaveBeenCalledTimes(1);
    });

    it('tap on non-item row does nothing', () => {
      const onTrader = vi.fn();
      const onMissionBoard = vi.fn();
      const onShip = vi.fn();
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext, onTrader, onMissionBoard, onShip);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Row 0 is chrome header, row 4 is underline - neither activates items/nav
      input.triggerTap(10, 4);
      input.triggerTap(10, 9);
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
