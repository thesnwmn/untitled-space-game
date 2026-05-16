import { describe, it, expect, vi } from 'vitest';
import { MissionBoardScene } from './mission-board-scene';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';
import type { MissionSpec } from '../world/types';
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

// Items start at CONTENT_TOP + 3 = 6 (no infoLines)
const ITEM_START = 6;
// Footer at row 29 (h-1 for 40×30)
const FOOTER_ROW = 29;
// Nav button columns (from screen-chrome rendering):
// "::[1] UNDOCK::[2] HUB::..."
const NAV_UNDOCK_COL = 3;
const NAV_HUB_COL = 17;

function makeMissions(count = 3): MissionSpec[] {
  const all: MissionSpec[] = [
    {
      id: 'm-001',
      type: 'delivery',
      title: 'Deliver: Test Package',
      description: 'A test delivery.',
      reward: 500,
      issuingDestinationId: 'elysium-station',
      giverName: 'John Doe',
      itemName: 'Test Package',
      itemWeightKg: 50,
      pickupDestinationId: 'elysium-station',
      deliveryDestinationId: 'ceti-landfall',
    },
    {
      id: 'm-002',
      type: 'supply',
      title: 'Supply Run: Sol Station',
      description: 'Supplies needed.',
      reward: 300,
      issuingDestinationId: 'elysium-station',
      giverName: 'Jane Smith',
      requirements: [{ commodityId: 'rations', qty: 2 }],
      deliveryDestinationId: 'elysium-station',
    },
    {
      id: 'm-003',
      type: 'delivery',
      title: 'Deliver: Emergency Parts',
      description: 'Urgent delivery.',
      reward: 700,
      issuingDestinationId: 'elysium-station',
      giverName: 'Al Chen',
      itemName: 'Emergency Parts',
      itemWeightKg: 100,
      pickupDestinationId: 'elysium-station',
      deliveryDestinationId: 'mars-anchor',
    },
  ];
  return all.slice(0, count);
}

function makeScene(
  input: MockInputHandler,
  missions: MissionSpec[],
  onMissionSelected = vi.fn(),
  onHub = vi.fn(),
  onUndock = vi.fn(),
) {
  return new MissionBoardScene(
    input, keyboardContext, makePlayer(), 'elysium-station',
    () => missions,
    onMissionSelected,
    onHub,
    onUndock,
  );
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('MissionBoardScene', () => {
  describe('render — layout', () => {
    it('does not render a border', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).not.toBe('+');
    });

    it('chrome header row 0 contains system name SOL', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 0)).toContain('SOL');
    });

    it('chrome footer row h-1 contains [1] UNDOCK and [2] HUB', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, FOOTER_ROW)).toContain('[1]');
      expect(rowText(buf, FOOTER_ROW)).toContain('UNDOCK');
      expect(rowText(buf, FOOTER_ROW)).toContain('[2]');
      expect(rowText(buf, FOOTER_ROW)).toContain('HUB');
    });

    it('renders MISSION BOARD title at row 3 in bright-white', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 3)).toContain('MISSION BOARD');
      expect(buf[3].find((c, i) => c.char !== ' ' && i >= 2)?.fg).toBe('bright-white');
    });

    it("renders underline at row 4 in bright-black", () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 4)).toContain("'");
      expect(buf[4].find(c => c.char === "'")?.fg).toBe('bright-black');
    });

    it('empty board shows NO MISSIONS AVAILABLE at item start row', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, []);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_START)).toContain('NO MISSIONS AVAILABLE');
    });

    it('renders delivery mission [D] icon in bright-yellow at item start', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Icon starts at col 3: '[', 'D', ']', ' '
      expect(buf[ITEM_START][3].char).toBe('[');
      expect(buf[ITEM_START][3].fg).toBe('bright-yellow');
      expect(buf[ITEM_START][4].char).toBe('D');
      expect(buf[ITEM_START][4].fg).toBe('bright-yellow');
    });

    it('renders supply mission [S] icon for second mission', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Mission 1 (supply) is at ITEM_START + 2 (each mission takes 2 rows: title + giver)
      expect(buf[ITEM_START + 2][4].char).toBe('S');
      expect(buf[ITEM_START + 2][4].fg).toBe('bright-yellow');
    });

    it('renders mission title', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_START)).toContain('Deliver: Test Package');
    });

    it('renders reward in bright-green', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_START)).toContain('500 CR');
      const rewardStart = buf[ITEM_START].findIndex((_, i) =>
        buf[ITEM_START].slice(i, i + 3).map(c => c.char).join('') === '500'
      );
      expect(buf[ITEM_START][rewardStart].fg).toBe('bright-green');
    });

    it('renders giver name as sub-line in bright-black', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Giver sub-line for mission 0 is at ITEM_START + 1
      expect(rowText(buf, ITEM_START + 1)).toContain('John Doe');
      expect(buf[ITEM_START + 1].find(c => c.char !== ' ')?.fg).toBe('bright-black');
    });

    it('cursor starts on first mission', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[ITEM_START][2].char).toBe('>');
      expect(buf[ITEM_START][2].fg).toBe('bright-green');
    });
  });

  describe('keyboard navigation', () => {
    it('DOWN moves cursor from mission 0 to mission 1 (next title row)', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions());
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Mission 1 is at ITEM_START + 2 (each item takes 2 rows)
      expect(buf[ITEM_START + 2][2].char).toBe('>');
    });

    it('UP from first mission wraps to last', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions(3));
      input.triggerAction('UP');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Mission 2 (last) is at ITEM_START + 4
      expect(buf[ITEM_START + 4][2].char).toBe('>');
    });

    it('DOWN wraps from last mission back to first', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions(3));
      // Move to last then DOWN
      input.triggerAction('DOWN');
      input.triggerAction('DOWN');
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Wraps back to mission 0
      expect(buf[ITEM_START][2].char).toBe('>');
    });

    it('SELECT calls onMissionSelected with the correct spec', () => {
      const onMissionSelected = vi.fn();
      const missions = makeMissions();
      const input = new MockInputHandler();
      makeScene(input, missions, onMissionSelected);
      input.triggerAction('SELECT');
      expect(onMissionSelected).toHaveBeenCalledWith(missions[0]);
    });

    it('BACK calls onHub and silences further input', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, makeMissions(), vi.fn(), onHub);
      input.triggerAction('BACK');
      expect(onHub).toHaveBeenCalledTimes(1);
      input.triggerAction('BACK');
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('NAV_2 calls onHub', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, makeMissions(), vi.fn(), onHub);
      input.triggerAction('NAV_2');
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('NAV_1 calls onUndock', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, makeMissions(), vi.fn(), vi.fn(), onUndock);
      input.triggerAction('NAV_1');
      expect(onUndock).toHaveBeenCalledTimes(1);
    });

    it('empty board: SELECT does nothing (disabled item)', () => {
      const onMissionSelected = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, [], onMissionSelected);
      input.triggerAction('SELECT');
      expect(onMissionSelected).not.toHaveBeenCalled();
    });
  });

  describe('touch navigation', () => {
    it('tap on mission title row calls onMissionSelected with correct spec', () => {
      const onMissionSelected = vi.fn();
      const missions = makeMissions();
      const input = new MockInputHandler();
      makeScene(input, missions, onMissionSelected);
      input.triggerTap(5, ITEM_START);
      expect(onMissionSelected).toHaveBeenCalledWith(missions[0]);
    });

    it('tap on giver sub-line row also calls onMissionSelected', () => {
      const onMissionSelected = vi.fn();
      const missions = makeMissions();
      const input = new MockInputHandler();
      makeScene(input, missions, onMissionSelected);
      // Sub-line of mission 0 is at ITEM_START + 1
      input.triggerTap(5, ITEM_START + 1);
      expect(onMissionSelected).toHaveBeenCalledWith(missions[0]);
    });

    it('tap on footer UNDOCK fires onUndock and silences input', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions(), vi.fn(), vi.fn(), onUndock);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(NAV_UNDOCK_COL, FOOTER_ROW);
      expect(onUndock).toHaveBeenCalledTimes(1);
      input.triggerTap(NAV_UNDOCK_COL, FOOTER_ROW);
      expect(onUndock).toHaveBeenCalledTimes(1);
    });

    it('tap on footer HUB fires onHub and silences input', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions(), vi.fn(), onHub);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(NAV_HUB_COL, FOOTER_ROW);
      expect(onHub).toHaveBeenCalledTimes(1);
      input.triggerTap(NAV_HUB_COL, FOOTER_ROW);
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('tap on non-mission row does nothing', () => {
      const onMissionSelected = vi.fn();
      const onHub = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, makeMissions(), onMissionSelected, onHub);
      input.triggerTap(5, 0);
      input.triggerTap(5, 4);
      input.triggerTap(5, 20); // past missions area
      expect(onHub).not.toHaveBeenCalled();
      expect(onMissionSelected).not.toHaveBeenCalled();
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, makeMissions());
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });
});
