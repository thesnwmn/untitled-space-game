import { describe, it, expect, vi } from 'vitest';
import { MissionDetailScene } from './mission-detail-scene';
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

const DETAIL_START = 5; // CONTENT_TOP (3) + 2 (title + underline)
const FOOTER_ROW = 29;
// Nav footer: "[1] UNDOCK::[2] HUB::..."
const UNDOCK_COL = 3;
const HUB_COL = 17;

// Delivery mission — pickup === issuing destination (same station)
const deliverySpec: MissionSpec = {
  id: 'test-d1',
  type: 'delivery',
  title: 'Encrypted Core',
  description: 'A secure package needs delivery.',
  reward: 500,
  issuingDestinationId: 'elysium-station',
  giverName: 'Kira Tanaka',
  itemName: 'Encrypted Core',
  itemWeightKg: 80,
  pickupDestinationId: 'elysium-station',
  deliveryDestinationId: 'ceti-landfall',
  deposit: 100,
};

// Delivery mission with faction and in-system delivery destination
const deliverySpecInSystem: MissionSpec = {
  ...deliverySpec,
  id: 'test-d3',
  giverFactionId: 'terran-union',
  deliveryDestinationId: 'mars-anchor', // same system (sol) but different destination
};

// Supply mission
const supplySpec: MissionSpec = {
  id: 'test-s1',
  type: 'supply',
  title: 'Mars Anchor',
  description: 'Mars Anchor needs supplies urgently.',
  reward: 300,
  issuingDestinationId: 'elysium-station',
  giverName: 'Sol Admin',
  requirements: [
    { commodityId: 'rations', qty: 3 },
    { commodityId: 'electronics', qty: 1 },
  ],
  deliveryDestinationId: 'mars-anchor',
};

// Heavy delivery — player cannot accept (cargo full)
const heavyDeliverySpec: MissionSpec = {
  ...deliverySpec,
  id: 'test-d-heavy',
  itemWeightKg: 9999,
};

function makeScene(
  input: MockInputHandler,
  spec: MissionSpec,
  onAccept = vi.fn(),
  onBack = vi.fn(),
  onHub = vi.fn(),
  onUndock = vi.fn(),
) {
  const player = makePlayer();
  return new MissionDetailScene(input, keyboardContext, player, spec, onAccept, onBack, onHub, onUndock);
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('MissionDetailScene', () => {
  describe('render — layout and chrome', () => {
    it('renders MISSION BOARD title at row 3', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 3)).toContain('MISSION BOARD');
    });

    it('footer shows UNDOCK and HUB nav buttons', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, FOOTER_ROW)).toContain('UNDOCK');
      expect(rowText(buf, FOOTER_ROW)).toContain('HUB');
      expect(rowText(buf, FOOTER_ROW)).not.toContain('ACCEPT');
      expect(rowText(buf, FOOTER_ROW)).not.toContain('BACK');
    });

    it('ACCEPT MISSION and BACK items appear below detail content', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = Array.from({ length: 30 }, (_, r) => rowText(buf, r)).join('\n');
      expect(allText).toContain('ACCEPT MISSION');
      expect(allText).toContain('BACK');
      // Find the rows and verify ACCEPT comes before BACK
      const acceptRow = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buf, r).includes('ACCEPT MISSION'))!;
      const backRow = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buf, r).includes('BACK'))!;
      expect(acceptRow).toBeLessThan(backRow);
    });

    it('ACCEPT MISSION item is disabled with reason when player cannot accept', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, heavyDeliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = Array.from({ length: 30 }, (_, r) => rowText(buf, r)).join('\n');
      expect(allText).toContain('ACCEPT MISSION');
      expect(allText).toContain('Insufficient cargo space');
      expect(allText).toContain('BACK');
    });

    it('cursor starts on ACCEPT when player can accept', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const acceptRow = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buf, r).includes('ACCEPT MISSION'))!;
      expect(buf[acceptRow][2].char).toBe('>');
    });

    it('cursor starts on BACK when ACCEPT is disabled', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, heavyDeliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const backRow = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buf, r).includes('BACK'))!;
      expect(buf[backRow][2].char).toBe('>');
    });
  });

  describe('render — delivery mission detail', () => {
    it('renders [D] icon and title in bright-yellow', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, DETAIL_START)).toContain('[D]');
      expect(rowText(buf, DETAIL_START)).toContain('Encrypted Core');
      expect(buf[DETAIL_START].find(c => c.char === '[')?.fg).toBe('bright-yellow');
    });

    it('renders giver name in bright-black', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const giverRow = DETAIL_START + 1;
      expect(rowText(buf, giverRow)).toContain('Kira Tanaka');
      expect(buf[giverRow].find(c => c.char !== ' ')?.fg).toBe('bright-black');
    });

    it('renders giver faction in brackets when present', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpecInSystem);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, DETAIL_START + 1)).toContain('[Terran Union]');
    });

    it('renders pickup and deliver labels', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = Array.from({ length: 30 }, (_, r) => rowText(buf, r)).join('\n');
      expect(allText).toContain('Pickup:');
      expect(allText).toContain('Deliver:');
    });

    it('pickup destination is bright-green when it is the current destination', () => {
      const input = new MockInputHandler();
      // player is at elysium-station; pickup is elysium-station
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Find the Pickup: row
      const pickupRow = Array.from({ length: 30 }, (_, r) => r)
        .find(r => rowText(buf, r).includes('Pickup:'))!;
      expect(pickupRow).toBeDefined();
      // Name starts after "Pickup:  " (9 chars from col 2 = col 11)
      const nameStart = 2 + 'Pickup:  '.length;
      expect(buf[pickupRow][nameStart].fg).toBe('bright-green');
    });

    it('delivery destination is bright-yellow when it is in the same system', () => {
      const input = new MockInputHandler();
      // player is in sol; mars-anchor is in sol but not current destination
      const scene = makeScene(input, deliverySpecInSystem);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Title row also contains "Deliver:", so match the label row specifically
      const deliverRow = Array.from({ length: 30 }, (_, r) => r)
        .find(r => rowText(buf, r).trimStart().startsWith('Deliver:') && !rowText(buf, r).includes('[D]'))!;
      expect(deliverRow).toBeDefined();
      const nameStart = 2 + 'Deliver: '.length;
      expect(buf[deliverRow][nameStart].fg).toBe('bright-yellow');
    });

    it('delivery destination is white when in a different system', () => {
      const input = new MockInputHandler();
      // ceti-landfall is in tau-ceti, player is in sol
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const deliverRow = Array.from({ length: 30 }, (_, r) => r)
        .find(r => rowText(buf, r).trimStart().startsWith('Deliver:') && !rowText(buf, r).includes('[D]'))!;
      expect(deliverRow).toBeDefined();
      const nameStart = 2 + 'Deliver: '.length;
      expect(buf[deliverRow][nameStart].fg).toBe('white');
    });

    it('renders weight check in bright-green when cargo is sufficient', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const weightRow = Array.from({ length: 30 }, (_, r) => r)
        .find(r => rowText(buf, r).includes('Weight:'))!;
      expect(weightRow).toBeDefined();
      const checkCell = buf[weightRow].find(c => c.char === '✓');
      expect(checkCell?.fg).toBe('bright-green');
    });

    it('renders weight check in red when cargo is insufficient', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, heavyDeliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const weightRow = Array.from({ length: 30 }, (_, r) => r)
        .find(r => rowText(buf, r).includes('Weight:'))!;
      expect(weightRow).toBeDefined();
      const xCell = buf[weightRow].find(c => c.char === '✗');
      expect(xCell?.fg).toBe('red');
    });

    it('renders description text', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = Array.from({ length: 30 }, (_, r) => rowText(buf, r)).join(' ');
      expect(allText).toContain('secure package');
    });

    it('renders REWARD line in bright-green', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const rewardRow = Array.from({ length: 30 }, (_, r) => r)
        .find(r => rowText(buf, r).includes('REWARD:'))!;
      expect(rewardRow).toBeDefined();
      expect(rowText(buf, rewardRow)).toContain('500 CR');
      const firstNonSpace = buf[rewardRow].find(c => c.char !== ' ');
      expect(firstNonSpace?.fg).toBe('bright-green');
    });
  });

  describe('render — reputation impact section', () => {
    it('shows REPUTATION IMPACT header and entries for a faction mission', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpecInSystem);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = Array.from({ length: 30 }, (_, r) => rowText(buf, r)).join('\n');
      expect(allText).toContain('REPUTATION IMPACT');
    });

    it('does not show REPUTATION IMPACT when mission has no giverFactionId', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = Array.from({ length: 30 }, (_, r) => rowText(buf, r)).join('\n');
      expect(allText).not.toContain('REPUTATION IMPACT');
    });

    it('always has a separator row between content and accept/back items', () => {
      // deliverySpecInSystem has terran-union (1 ally + 2 rivals = 4 entries total).
      // The repLimit guard in renderDetail ensures the reputation section doesn't overflow.
      // The separator is always rendered between content and choices.
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpecInSystem);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const acceptRow = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buf, r).includes('ACCEPT MISSION'))!;
      const separatorRow = acceptRow - 1;
      expect(rowText(buf, separatorRow)).toMatch(/^-+/);
    });
  });

  describe('render — supply mission detail', () => {
    it('renders [S] icon in bright-yellow', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, supplySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, DETAIL_START)).toContain('[S]');
      expect(buf[DETAIL_START].find(c => c.char === '[')?.fg).toBe('bright-yellow');
    });

    it('delivery destination is bright-yellow when in same system', () => {
      const input = new MockInputHandler();
      // mars-anchor is in sol, same as player
      const scene = makeScene(input, supplySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const deliverRow = Array.from({ length: 30 }, (_, r) => r)
        .find(r => rowText(buf, r).includes('Deliver to:'))!;
      expect(deliverRow).toBeDefined();
      const nameStart = 2 + 'Deliver to: '.length;
      expect(buf[deliverRow][nameStart].fg).toBe('bright-yellow');
    });

    it('renders requirements', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, supplySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = Array.from({ length: 30 }, (_, r) => rowText(buf, r)).join('\n');
      expect(allText).toContain('3x');
      expect(allText).toContain('Ration Packs');
    });
  });

  describe('menu item interaction', () => {
    it('SELECT on ACCEPT calls onAccept with giveItemNow=true for delivery at issuing dest', () => {
      const onAccept = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, deliverySpec, onAccept);
      // cursor starts on ACCEPT
      input.triggerAction('SELECT');
      expect(onAccept).toHaveBeenCalledWith(true);
    });

    it('SELECT on ACCEPT calls onAccept with giveItemNow=false for supply', () => {
      const onAccept = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, supplySpec, onAccept);
      input.triggerAction('SELECT');
      expect(onAccept).toHaveBeenCalledWith(false);
    });

    it('SELECT on BACK calls onBack', () => {
      const onBack = vi.fn();
      const input = new MockInputHandler();
      // Move cursor to BACK (index 1)
      makeScene(input, deliverySpec, vi.fn(), onBack);
      input.triggerAction('DOWN'); // moves cursor to BACK
      input.triggerAction('SELECT');
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('when ACCEPT is disabled, cursor starts on BACK, SELECT calls onBack', () => {
      const onAccept = vi.fn();
      const onBack = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, heavyDeliverySpec, onAccept, onBack);
      // cursor is on BACK since ACCEPT is disabled
      input.triggerAction('SELECT');
      expect(onAccept).not.toHaveBeenCalled();
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('input is silenced after selection', () => {
      const onAccept = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, deliverySpec, onAccept);
      input.triggerAction('SELECT');
      input.triggerAction('SELECT');
      expect(onAccept).toHaveBeenCalledTimes(1);
    });

    it('tap on ACCEPT item row calls onAccept', () => {
      const onAccept = vi.fn();
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec, onAccept);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const acceptRow = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buf, r).includes('ACCEPT MISSION'))!;
      input.triggerTap(5, acceptRow);
      expect(onAccept).toHaveBeenCalledWith(true);
    });

    it('tap on BACK item row calls onBack', () => {
      const onBack = vi.fn();
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec, vi.fn(), onBack);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const backRow = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buf, r).includes('BACK'))!;
      input.triggerTap(5, backRow);
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('keyboard nav actions', () => {
    it('BACK key calls onBack', () => {
      const onBack = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, deliverySpec, vi.fn(), onBack);
      input.triggerAction('BACK');
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('NAV_1 calls onUndock', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, deliverySpec, vi.fn(), vi.fn(), vi.fn(), onUndock);
      input.triggerAction('NAV_1');
      expect(onUndock).toHaveBeenCalledTimes(1);
    });

    it('NAV_2 calls onHub', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, deliverySpec, vi.fn(), vi.fn(), onHub);
      input.triggerAction('NAV_2');
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('NAV_1/NAV_2 are silenced after first call', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, deliverySpec, vi.fn(), vi.fn(), vi.fn(), onUndock);
      input.triggerAction('NAV_1');
      input.triggerAction('NAV_1');
      expect(onUndock).toHaveBeenCalledTimes(1);
    });
  });

  describe('touch nav actions', () => {
    it('tap on UNDOCK nav fires onUndock', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec, vi.fn(), vi.fn(), vi.fn(), onUndock);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(UNDOCK_COL, FOOTER_ROW);
      expect(onUndock).toHaveBeenCalledTimes(1);
    });

    it('tap on HUB nav fires onHub', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec, vi.fn(), vi.fn(), onHub);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(HUB_COL, FOOTER_ROW);
      expect(onHub).toHaveBeenCalledTimes(1);
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });
});
