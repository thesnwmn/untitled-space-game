import { describe, it, expect, vi } from 'vitest';
import { MissionBoardScene } from './MissionBoardScene';
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

const MISSION_ROW_START = 5;

// NavBar two options [UNDOCK][HUB] in 40-col buffer: totalWidth=14, startCol=13
// [UNDOCK] cols 13–20, [HUB] cols 22–26
const NAV_UNDOCK_COL = 13;
const NAV_HUB_COL = 22;

// ── tests ─────────────────────────────────────────────────────────────────────

describe('MissionBoardScene', () => {
  describe('render — layout', () => {
    it('does not render a border', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).toBe(' ');
      expect(buf[0][0].fg).toBe('black');
    });

    it('nav bar row 0 contains station name ELYSIUM STATION', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 0)).toContain('ELYSIUM STATION');
      expect(buf[0].find(c => c.char !== ' ')?.fg).toBe('bright-cyan');
    });

    it('nav bar row 1 contains both [UNDOCK] and [HUB]', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 1)).toContain('[UNDOCK]');
      expect(rowText(buf, 1)).toContain('[HUB]');
    });

    it('renders MISSION BOARD title at row 3 in cyan', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 3)).toContain('MISSION BOARD');
      expect(buf[3].find((c, i) => c.char !== ' ' && i > 0 && i < 39)?.fg).toBe('cyan');
    });

    it('renders rule at row 4 in cyan', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 4)).toContain('=============');
      expect(buf[4].find(c => c.char === '=')?.fg).toBe('cyan');
    });

    it('renders mission list starting at row 5', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, MISSION_ROW_START)).toContain('Find the Lost Crew');
      expect(rowText(buf, MISSION_ROW_START + 1)).toContain('Deliver Fuel Core');
      expect(rowText(buf, MISSION_ROW_START + 6)).toContain('Eliminate Smugglers');
    });

    it('renders type icons in bright-yellow', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // [R] icon at row 5, col 2 (after cursor at col 1)
      expect(buf[MISSION_ROW_START][2].char).toBe('[');
      expect(buf[MISSION_ROW_START][2].fg).toBe('bright-yellow');
      expect(buf[MISSION_ROW_START][3].char).toBe('R');
      expect(buf[MISSION_ROW_START][3].fg).toBe('bright-yellow');
    });

    it('renders rewards in bright-green', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // First mission reward "500 CR" should appear somewhere on row 5
      expect(rowText(buf, MISSION_ROW_START)).toContain('500 CR');
      const rewardStart = buf[MISSION_ROW_START].findIndex((_, i) =>
        buf[MISSION_ROW_START].slice(i, i + 3).map(c => c.char).join('') === '500'
      );
      expect(buf[MISSION_ROW_START][rewardStart].fg).toBe('bright-green');
    });

    it('cursor starts on first mission', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[MISSION_ROW_START][1].char).toBe('>');
      expect(buf[MISSION_ROW_START][1].fg).toBe('bright-green');
    });

    it('renders keyboard footer hint', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 27)).toContain('ESC return');
      expect(buf[27].find((c, i) => c.char !== ' ' && i > 0 && i < 39)?.fg).toBe('bright-black');
    });

    it('renders touch footer hint for touch context', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, touchContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 27)).toContain('TAP to select');
    });
  });

  describe('keyboard navigation', () => {
    it('DOWN moves cursor to next mission', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[MISSION_ROW_START + 1][1].char).toBe('>');
    });

    it('UP from first mission wraps to last', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      input.triggerAction('UP');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[MISSION_ROW_START + 6][1].char).toBe('>');
    });

    it('DOWN wraps from last mission back to first', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      for (let i = 0; i < 7; i++) input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[MISSION_ROW_START][1].char).toBe('>');
    });

    it('SELECT on mission logs placeholder with title', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      input.triggerAction('SELECT');
      expect(consoleSpy).toHaveBeenCalledWith('[MissionBoard] Selected: Find the Lost Crew');
      consoleSpy.mockRestore();
    });

    it('BACK calls onHub and silences further input', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      new MissionBoardScene(input, keyboardContext, onHub, vi.fn());
      input.triggerAction('BACK');
      expect(onHub).toHaveBeenCalledTimes(1);
      input.triggerAction('BACK');
      expect(onHub).toHaveBeenCalledTimes(1);
    });
  });

  describe('touch navigation', () => {
    it('tap on mission row selects it and logs placeholder', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      input.triggerTap(5, MISSION_ROW_START + 2);
      expect(consoleSpy).toHaveBeenCalledWith('[MissionBoard] Selected: Clear Pirate Outpost');
      consoleSpy.mockRestore();
    });

    it('tap on [UNDOCK] nav button fires onUndock and silences input', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), onUndock);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(NAV_UNDOCK_COL, 1);
      expect(onUndock).toHaveBeenCalledTimes(1);
      input.triggerTap(NAV_UNDOCK_COL, 1);
      expect(onUndock).toHaveBeenCalledTimes(1);
    });

    it('tap on [HUB] nav button fires onHub and silences input', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, onHub, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(NAV_HUB_COL, 1);
      expect(onHub).toHaveBeenCalledTimes(1);
      input.triggerTap(NAV_HUB_COL, 1);
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('tap on non-mission row does nothing', () => {
      const onHub = vi.fn();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const input = new MockInputHandler();
      new MissionBoardScene(input, keyboardContext, onHub, vi.fn());
      input.triggerTap(5, 0);
      input.triggerTap(5, 29);
      expect(onHub).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = new MissionBoardScene(input, keyboardContext, vi.fn(), vi.fn());
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });
});
