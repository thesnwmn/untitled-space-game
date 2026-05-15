import { describe, it, expect, vi } from 'vitest';
import { MissionBoardScene } from './mission-board-scene';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';

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

const keyboardContext: GameContext = {
  environment: 'browser', primaryInput: 'keyboard', debug: false,
};

// CONTENT_TOP = 3; MISSION_ROW_START = CONTENT_TOP + 3 = 6
const MISSION_ROW_START = 6;

// Footer at row 29 (h-1 for 40×30)
const FOOTER_ROW = 29;
// ":: [1] UNDOCK :: [2] HUB :::..."
// UNDOCK button: cols 3-12; HUB button: cols 17-23
const NAV_UNDOCK_COL = 3;
const NAV_HUB_COL = 17;

// ── tests ─────────────────────────────────────────────────────────────────────

describe('MissionBoardScene', () => {
  describe('render — layout', () => {
    it('does not render a border', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).not.toBe('+');
    });

    it('chrome header row 0 contains system name SOL', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 0)).toContain('SOL');
    });

    it('chrome footer row h-1 contains [1] UNDOCK and [2] HUB', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, FOOTER_ROW)).toContain('[1]');
      expect(rowText(buf, FOOTER_ROW)).toContain('UNDOCK');
      expect(rowText(buf, FOOTER_ROW)).toContain('[2]');
      expect(rowText(buf, FOOTER_ROW)).toContain('HUB');
    });

    it('renders MISSION BOARD title at row 3 in bright-white', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 3)).toContain('MISSION BOARD');
      expect(buf[3].find((c, i) => c.char !== ' ' && i >= 2)?.fg).toBe('bright-white');
    });

    it("renders ' underline at row 4 in bright-black", () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 4)).toContain("'");
      expect(buf[4].find(c => c.char === "'")?.fg).toBe('bright-black');
    });

    it('renders mission list starting at row 5', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MISSION_ROW_START)).toContain('Find the Lost Crew');
      expect(rowText(buf, MISSION_ROW_START + 1)).toContain('Deliver Fuel Core');
      expect(rowText(buf, MISSION_ROW_START + 6)).toContain('Eliminate Smugglers');
    });

    it('renders type icons in bright-yellow', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // [R] icon at row 5: cursor at col 2, [ at col 3
      expect(buf[MISSION_ROW_START][3].char).toBe('[');
      expect(buf[MISSION_ROW_START][3].fg).toBe('bright-yellow');
      expect(buf[MISSION_ROW_START][4].char).toBe('R');
      expect(buf[MISSION_ROW_START][4].fg).toBe('bright-yellow');
    });

    it('renders rewards in bright-green', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MISSION_ROW_START)).toContain('500 CR');
      const rewardStart = buf[MISSION_ROW_START].findIndex((_, i) =>
        buf[MISSION_ROW_START].slice(i, i + 3).map(c => c.char).join('') === '500'
      );
      expect(buf[MISSION_ROW_START][rewardStart].fg).toBe('bright-green');
    });

    it('cursor starts on first mission', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[MISSION_ROW_START][2].char).toBe('>');
      expect(buf[MISSION_ROW_START][2].fg).toBe('bright-green');
    });
  });

  describe('keyboard navigation', () => {
    it('DOWN moves cursor to next mission', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[MISSION_ROW_START + 1][2].char).toBe('>');
    });

    it('UP from first mission wraps to last', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      input.triggerAction('UP');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[MISSION_ROW_START + 6][2].char).toBe('>');
    });

    it('DOWN wraps from last mission back to first', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      for (let i = 0; i < 7; i++) input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[MISSION_ROW_START][2].char).toBe('>');
    });

    it('SELECT on mission logs placeholder with title', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      input.triggerAction('SELECT');
      expect(consoleSpy).toHaveBeenCalledWith('[MissionBoard] Selected: Find the Lost Crew');
      consoleSpy.mockRestore();
    });

    it('BACK calls onHub and silences further input', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', onHub, vi.fn());
      input.triggerAction('BACK');
      expect(onHub).toHaveBeenCalledTimes(1);
      input.triggerAction('BACK');
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('NAV_2 calls onHub', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', onHub, vi.fn());
      input.triggerAction('NAV_2');
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('NAV_1 calls onUndock', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), onUndock);
      input.triggerAction('NAV_1');
      expect(onUndock).toHaveBeenCalledTimes(1);
    });
  });

  describe('touch navigation', () => {
    it('tap on mission row selects it and logs placeholder', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      input.triggerTap(5, MISSION_ROW_START + 2);
      expect(consoleSpy).toHaveBeenCalledWith('[MissionBoard] Selected: Clear Pirate Outpost');
      consoleSpy.mockRestore();
    });

    it('tap on footer UNDOCK button fires onUndock and silences input', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), onUndock);
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
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', onHub, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(NAV_HUB_COL, FOOTER_ROW);
      expect(onHub).toHaveBeenCalledTimes(1);
      input.triggerTap(NAV_HUB_COL, FOOTER_ROW);
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('tap on non-mission row does nothing', () => {
      const onHub = vi.fn();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', onHub, vi.fn());
      input.triggerTap(5, 0);
      // row 4 is underline row, row 12 is past missions
      input.triggerTap(5, 4);
      input.triggerTap(5, 20);
      expect(onHub).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, makePlayer(), 'elysium-station', vi.fn(), vi.fn());
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });
});
