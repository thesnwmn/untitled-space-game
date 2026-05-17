import { describe, it, expect, vi } from 'vitest';
import { CargoScene } from './cargo-scene';
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

function bufferText(buffer: CharBuffer): string {
  return buffer.map(row => row.map(c => c.char).join('')).join('\n');
}

const context: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

// ── tests ─────────────────────────────────────────────────────────────────────

describe('CargoScene', () => {
  describe('render — empty hold', () => {
    it('shows NO COMMODITIES when commodities tab is empty', () => {
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, makePlayer(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('NO COMMODITIES');
    });

    it('shows the title CARGO HOLD', () => {
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, makePlayer(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('CARGO HOLD');
    });

    it('shows total weight 0 and capacity for a fresh player', () => {
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, makePlayer(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Freighter capacity = 2000kg
      expect(bufferText(buf)).toContain('0/2000KG');
    });
  });

  describe('render — with cargo', () => {
    it('shows each item name, quantity, and weight', () => {
      const player = makePlayer();
      player.addCargo('iron-ore', 3); // iron-ore: 40 kg/unit
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, player, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = bufferText(buf);
      expect(text).toContain('Iron Ore');
      expect(text).toContain('x3');
      expect(text).toContain('120KG'); // 3 × 40 = 120
    });

    it('shows multiple items', () => {
      const player = makePlayer();
      player.addCargo('iron-ore', 2);
      player.addCargo('electronics', 1);
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, player, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = bufferText(buf);
      expect(text).toContain('Iron Ore');
      expect(text).toContain('Consumer Electronics');
    });

    it('shows correct total weight', () => {
      const player = makePlayer();
      player.addCargo('iron-ore', 2);    // 2 × 40 = 80 kg
      player.addCargo('electronics', 5); // 5 × 8  = 40 kg  → total = 120 kg
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, player, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('120/2000KG');
    });

    it('shows correct capacity', () => {
      const player = makePlayer({ shipId: 'freighter' });
      player.addCargo('rations', 1);
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, player, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('/2000KG');
    });
  });

  describe('navigation', () => {
    it('BACK action fires onBack', () => {
      const onBack = vi.fn();
      const input = new MockInputHandler();
      new CargoScene(input, context, makePlayer(), onBack, vi.fn());
      input.triggerAction('BACK');
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('BACK silences further input after firing', () => {
      const onBack = vi.fn();
      const input = new MockInputHandler();
      new CargoScene(input, context, makePlayer(), onBack, vi.fn());
      input.triggerAction('BACK');
      input.triggerAction('BACK');
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('CARGO action fires onBack', () => {
      const onBack = vi.fn();
      const input = new MockInputHandler();
      new CargoScene(input, context, makePlayer(), onBack, vi.fn());
      input.triggerAction('CARGO');
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, makePlayer(), vi.fn(), vi.fn());
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });

  describe('mission items display', () => {
    function makeMissionSpec(overrides: Partial<{ id: string; itemName: string; itemWeightKg: number }> = {}) {
      return {
        id: overrides.id ?? 'test-mission-1',
        type: 'delivery' as const,
        title: 'Test Delivery',
        description: 'Deliver this',
        reward: 500,
        issuingDestinationId: 'elysium-station',
        giverName: 'NPC',
        itemName: overrides.itemName ?? 'Mystery Package',
        itemWeightKg: overrides.itemWeightKg ?? 50,
        pickupDestinationId: 'elysium-station',
        deliveryDestinationId: 'tycho-orbital',
      };
    }

    it('shows NO COMMODITIES on commodities tab when hold is empty', () => {
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, makePlayer(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('NO COMMODITIES');
    });

    it('commodities tab shows NO COMMODITIES even when only mission items are present', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      player.acceptMission(makeMissionSpec(), true);
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, player, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Tab 0 (COMMODITIES) has no regular cargo
      expect(bufferText(buf)).toContain('NO COMMODITIES');
    });

    it('mission goods tab shows NO MISSION GOODS when no missions', () => {
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, makePlayer(), vi.fn(), vi.fn());
      // Switch to MISSION GOODS tab
      input.triggerAction('RIGHT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('NO MISSION GOODS');
    });

    it('renders mission item name in white on mission goods tab', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      player.acceptMission(makeMissionSpec({ itemName: 'Sealed Crate' }), true);
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, player, vi.fn(), vi.fn());
      // Switch to MISSION GOODS tab
      input.triggerAction('RIGHT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = bufferText(buf);
      expect(text).not.toContain('[MISSION]');
      expect(text).toContain('Sealed Crate');
      // Find the item row and check fg is white (no special colour)
      const itemRow = buf.findIndex(row => row.map(c => c.char).join('').includes('Sealed Crate'));
      expect(itemRow).toBeGreaterThan(-1);
      const firstNonSpace = buf[itemRow].find((c, i) => c.char !== ' ' && i >= 2);
      expect(firstNonSpace?.fg).toBe('white');
    });

    it('renders mission item weight on mission goods tab', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      player.acceptMission(makeMissionSpec({ itemWeightKg: 75 }), true);
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, player, vi.fn(), vi.fn());
      // Switch to MISSION GOODS tab
      input.triggerAction('RIGHT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('75KG');
    });

    it('total weight includes mission item weight', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      player.acceptMission(makeMissionSpec({ itemWeightKg: 150 }), true);
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, player, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('150/2000KG');
    });

    it('commodities tab shows regular cargo', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      player.addCargo('iron-ore', 2);
      player.acceptMission(makeMissionSpec({ itemName: 'Data Chip' }), true);
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, player, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Tab 0 shows commodities
      expect(bufferText(buf)).toContain('Iron Ore');
    });

    it('mission goods tab shows mission items', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      player.addCargo('iron-ore', 2);
      player.acceptMission(makeMissionSpec({ itemName: 'Data Chip' }), true);
      const input = new MockInputHandler();
      const scene = new CargoScene(input, context, player, vi.fn(), vi.fn());
      // Switch to MISSION GOODS tab
      input.triggerAction('RIGHT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('Data Chip');
    });
  });
});
