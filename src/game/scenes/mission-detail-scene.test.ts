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

const DETAIL_START = 6; // CONTENT_TOP (3) + 3 = 6
const FOOTER_ROW = 29;
const ACCEPT_COL = 3; // "[1] ACCEPT" starts at col 3

// Delivery mission where pickup === issuing destination
const deliverySpec: MissionSpec = {
  id: 'test-d1',
  type: 'delivery',
  title: 'Deliver: Encrypted Core',
  description: 'A secure package needs delivery.',
  reward: 500,
  issuingDestinationId: 'elysium-station',
  giverName: 'Kira Tanaka',
  itemName: 'Encrypted Core',
  itemWeightKg: 80,
  pickupDestinationId: 'elysium-station',
  deliveryDestinationId: 'ceti-landfall',
};

// Delivery mission with faction
const deliverySpecWithFaction: MissionSpec = {
  ...deliverySpec,
  id: 'test-d2',
  giverFactionId: 'terran-union',
};

// Supply mission
const supplySpec: MissionSpec = {
  id: 'test-s1',
  type: 'supply',
  title: 'Supply Run: Mars Anchor',
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
  itemWeightKg: 9999, // exceeds any ship cargo
};

function makeScene(
  input: MockInputHandler,
  spec: MissionSpec,
  onAccept = vi.fn(),
  onBack = vi.fn(),
  cargoKg = 0,
) {
  const player = makePlayer();
  // Add cargo to simulate partial hold usage if needed
  if (cargoKg > 0) {
    // rations = 1 kg each
    player.addCargo('rations', cargoKg);
  }
  return new MissionDetailScene(input, keyboardContext, player, spec, onAccept, onBack);
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('MissionDetailScene', () => {
  describe('render — delivery mission', () => {
    it('renders title with [D] icon in bright-yellow', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, DETAIL_START)).toContain('[D]');
      expect(rowText(buf, DETAIL_START)).toContain('Deliver: Encrypted Core');
      const cell = buf[DETAIL_START].find(c => c.char === '[');
      expect(cell?.fg).toBe('bright-yellow');
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
      const scene = makeScene(input, deliverySpecWithFaction);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Faction "Terran Union" appears in brackets
      expect(rowText(buf, DETAIL_START + 1)).toContain('[Terran Union]');
    });

    it('renders pickup and deliver destinations', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = Array.from({ length: 30 }, (_, r) => rowText(buf, r)).join('\n');
      expect(allText).toContain('Pickup:');
      expect(allText).toContain('Deliver:');
    });

    it('renders weight check in bright-green when cargo is sufficient', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec); // player has 2000 kg cap, 0 used
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Find the row with Weight:
      const weightRow = Array.from({ length: 30 }, (_, r) => r)
        .find(r => rowText(buf, r).includes('Weight:'))!;
      expect(weightRow).toBeDefined();
      // The check mark (✓) should appear on that row in bright-green
      const checkCell = buf[weightRow].find(c => c.char === '✓');
      expect(checkCell).toBeDefined();
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
      expect(xCell).toBeDefined();
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

    it('shows reason in red when player cannot accept', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, heavyDeliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = Array.from({ length: 30 }, (_, r) => rowText(buf, r)).join('\n');
      expect(allText).toContain('[!]');
      expect(allText).toContain('Insufficient cargo space');
    });

    it('does not show reason when player can accept', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = Array.from({ length: 30 }, (_, r) => rowText(buf, r)).join('\n');
      expect(allText).not.toContain('[!]');
    });
  });

  describe('render — supply mission', () => {
    it('renders [S] icon in bright-yellow', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, supplySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, DETAIL_START)).toContain('[S]');
      const cell = buf[DETAIL_START].find(c => c.char === '[');
      expect(cell?.fg).toBe('bright-yellow');
    });

    it('renders delivery location', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, supplySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = Array.from({ length: 30 }, (_, r) => rowText(buf, r)).join('\n');
      expect(allText).toContain('Deliver to:');
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

  describe('render — nav footer', () => {
    it('shows ACCEPT and BACK when player can accept', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, FOOTER_ROW)).toContain('ACCEPT');
      expect(rowText(buf, FOOTER_ROW)).toContain('BACK');
    });

    it('shows only BACK when player cannot accept', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, heavyDeliverySpec);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, FOOTER_ROW)).not.toContain('ACCEPT');
      expect(rowText(buf, FOOTER_ROW)).toContain('BACK');
    });
  });

  describe('keyboard navigation', () => {
    it('NAV_1 calls onAccept with giveItemNow=true for delivery with pickup at issuer', () => {
      const onAccept = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, deliverySpec, onAccept);
      input.triggerAction('NAV_1');
      expect(onAccept).toHaveBeenCalledWith(true);
    });

    it('NAV_1 calls onBack when player cannot accept', () => {
      const onAccept = vi.fn();
      const onBack = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, heavyDeliverySpec, onAccept, onBack);
      input.triggerAction('NAV_1');
      expect(onAccept).not.toHaveBeenCalled();
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('NAV_2 calls onBack', () => {
      const onBack = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, deliverySpec, vi.fn(), onBack);
      input.triggerAction('NAV_2');
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('BACK calls onBack', () => {
      const onBack = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, deliverySpec, vi.fn(), onBack);
      input.triggerAction('BACK');
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('input is silenced after accepting', () => {
      const onAccept = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, deliverySpec, onAccept);
      input.triggerAction('NAV_1');
      input.triggerAction('NAV_1');
      expect(onAccept).toHaveBeenCalledTimes(1);
    });

    it('supply mission: NAV_1 calls onAccept with giveItemNow=false', () => {
      const onAccept = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, supplySpec, onAccept);
      input.triggerAction('NAV_1');
      expect(onAccept).toHaveBeenCalledWith(false);
    });
  });

  describe('touch navigation', () => {
    it('tap ACCEPT button calls onAccept when player can accept', () => {
      const onAccept = vi.fn();
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec, onAccept);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(ACCEPT_COL, FOOTER_ROW);
      expect(onAccept).toHaveBeenCalledWith(true);
    });

    it('tap BACK button calls onBack', () => {
      const onBack = vi.fn();
      const input = new MockInputHandler();
      const scene = makeScene(input, deliverySpec, vi.fn(), onBack);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // BACK is at position [2] when ACCEPT is present
      // Find the BACK button col from the footer
      const backCol = rowText(buf, FOOTER_ROW).indexOf('BACK') - 1; // col of [2] bracket
      input.triggerTap(backCol, FOOTER_ROW);
      expect(onBack).toHaveBeenCalledTimes(1);
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
