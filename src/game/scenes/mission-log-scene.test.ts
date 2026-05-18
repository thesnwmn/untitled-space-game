import { describe, it, expect, vi } from 'vitest';
import { MissionLogScene } from './mission-log-scene';
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

function bufferText(buffer: CharBuffer): string {
  return buffer.map(row => row.map(c => c.char).join('')).join('\n');
}

const context: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

// CONTENT_TOP=3, itemStartRow = 3+3 = 6 (no infoLines, no tabs)
const ITEM_START = 6;
const FOOTER_ROW = 29;

const deliverySpec: MissionSpec = {
  id: 'm-d1',
  type: 'delivery',
  title: 'Encrypted Core',
  description: 'A secure package needs delivery to a remote outpost.',
  reward: 500,
  issuingDestinationId: 'elysium-station',
  giverName: 'Kira Tanaka',
  itemName: 'Encrypted Core',
  itemWeightKg: 10,
  pickupDestinationId: 'elysium-station',
  deliveryDestinationId: 'mars-anchor',
  deposit: 100,
};

const supplySpec: MissionSpec = {
  id: 'm-s1',
  type: 'supply',
  title: 'Ration Run',
  description: 'Bring rations to the station.',
  reward: 300,
  issuingDestinationId: 'elysium-station',
  giverName: 'Jane Doe',
  requirements: [{ commodityId: 'rations', qty: 2 }],
  deliveryDestinationId: 'elysium-station',
};

function makeScene(
  input: MockInputHandler,
  onBack = vi.fn(),
  onGame = vi.fn(),
) {
  return { scene: new MissionLogScene(input, context, makePlayer(), onBack, onGame), onBack, onGame };
}

function makeSceneWithPlayer(
  input: MockInputHandler,
  playerSetup: (p: ReturnType<typeof makePlayer>) => void,
  onBack = vi.fn(),
  onGame = vi.fn(),
) {
  const player = makePlayer();
  playerSetup(player);
  return { scene: new MissionLogScene(input, context, player, onBack, onGame), player, onBack, onGame };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('MissionLogScene', () => {
  describe('empty mission list', () => {
    it('shows NO ACTIVE MISSIONS when player has no missions', () => {
      const input = new MockInputHandler();
      const { scene } = makeScene(input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('NO ACTIVE MISSIONS');
    });

    it('NO ACTIVE MISSIONS is not selectable', () => {
      const input = new MockInputHandler();
      const { onBack } = makeScene(input);
      input.triggerAction('SELECT');
      expect(onBack).not.toHaveBeenCalled();
    });

    it('footer shows [1] GAME and [2] MENU', () => {
      const input = new MockInputHandler();
      const { scene } = makeScene(input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const footer = rowText(buf, FOOTER_ROW);
      expect(footer).toContain('[1]');
      expect(footer).toContain('GAME');
      expect(footer).toContain('[2]');
      expect(footer).toContain('MENU');
    });
  });

  describe('populated mission list', () => {
    it('renders mission title and reward', () => {
      const input = new MockInputHandler();
      const { scene } = makeSceneWithPlayer(input, p => {
        p.acceptMission(deliverySpec, false);
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = bufferText(buf);
      expect(text).toContain('Encrypted Core');
      expect(text).toContain('500 CR');
    });

    it('pending-pickup status line is yellow', () => {
      const input = new MockInputHandler();
      const { scene } = makeSceneWithPlayer(input, p => {
        p.acceptMission(deliverySpec, false);  // pickupComplete=false → pending-pickup
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // First item at ITEM_START, status at ITEM_START+1, dest at ITEM_START+2, blank at ITEM_START+3
      const detailRow = ITEM_START + 1;
      const text = rowText(buf, detailRow);
      expect(text).toContain('PENDING PICKUP');
      expect(buf[detailRow][2].fg).toBe('yellow');
    });

    it('in-transit status line is bright-black', () => {
      const input = new MockInputHandler();
      const { scene } = makeSceneWithPlayer(input, p => {
        // giveItemNow=true → pickupComplete=true; player is at elysium-station, delivery to mars-anchor → in-transit
        p.acceptMission(deliverySpec, true);
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const detailRow = ITEM_START + 1;
      const text = rowText(buf, detailRow);
      expect(text).toContain('IN TRANSIT');
      expect(buf[detailRow][2].fg).toBe('bright-black');
    });

    it('needs-supplies status line is yellow', () => {
      const input = new MockInputHandler();
      const { scene } = makeSceneWithPlayer(input, p => {
        p.acceptMission(supplySpec, false);  // player has no rations → needs-supplies
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const detailRow = ITEM_START + 1;
      const text = rowText(buf, detailRow);
      expect(text).toContain('NEEDS SUPPLIES');
      expect(buf[detailRow][2].fg).toBe('yellow');
    });

    it('ready-to-deliver status line is bright-green', () => {
      const input = new MockInputHandler();
      // player is at elysium-station which is supplySpec.deliveryDestinationId
      // give player the required rations so status = ready-to-deliver
      const { scene } = makeSceneWithPlayer(input, p => {
        p.acceptMission(supplySpec, false);
        p.addCargo('rations', 2);
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const detailRow = ITEM_START + 1;
      const text = rowText(buf, detailRow);
      expect(text).toContain('READY TO DELIVER');
      expect(buf[detailRow][2].fg).toBe('bright-green');
    });

    it('shows type icon for delivery missions', () => {
      const input = new MockInputHandler();
      const { scene } = makeSceneWithPlayer(input, p => {
        p.acceptMission(deliverySpec, false);
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_START)).toContain('[D]');
    });

    it('shows type icon for supply missions', () => {
      const input = new MockInputHandler();
      const { scene } = makeSceneWithPlayer(input, p => {
        p.acceptMission(supplySpec, false);
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_START)).toContain('[S]');
    });
  });

  describe('modal cancel flow', () => {
    it('SELECT opens modal showing mission title', () => {
      const input = new MockInputHandler();
      const { scene } = makeSceneWithPlayer(input, p => {
        p.acceptMission(deliverySpec, false);
      });
      input.triggerAction('SELECT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('Encrypted Core');
      expect(bufferText(buf)).toContain('OKAY');
      expect(bufferText(buf)).toContain('CANCEL MISSION');
    });

    it('OKAY button in modal closes it without cancelling mission', () => {
      const input = new MockInputHandler();
      const { scene } = makeSceneWithPlayer(input, p => {
        p.acceptMission(deliverySpec, false);
      });
      input.triggerAction('SELECT');  // open modal
      input.triggerAction('SELECT');  // confirm (OKAY focused by default)
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Modal closed, mission still present
      expect(bufferText(buf)).toContain('Encrypted Core');
      expect(bufferText(buf)).not.toContain('[ OKAY ]');
    });

    it('CANCEL MISSION removes the mission from the list', () => {
      const input = new MockInputHandler();
      const player = makePlayer();
      player.acceptMission(deliverySpec, false);
      const scene = new MissionLogScene(input, context, player, vi.fn(), vi.fn());

      expect(player.activeMissions.length).toBe(1);

      input.triggerAction('SELECT');    // open modal (cursor on mission)
      input.triggerAction('RIGHT');     // switch focus to CANCEL MISSION
      input.triggerAction('SELECT');    // confirm cancel

      expect(player.activeMissions.length).toBe(0);

      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('NO ACTIVE MISSIONS');
    });

    it('BACK in modal dismisses without cancelling', () => {
      const input = new MockInputHandler();
      const player = makePlayer();
      player.acceptMission(deliverySpec, false);
      const scene = new MissionLogScene(input, context, player, vi.fn(), vi.fn());

      input.triggerAction('SELECT');   // open modal
      input.triggerAction('BACK');     // dismiss

      expect(player.activeMissions.length).toBe(1);

      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).not.toContain('[ OKAY ]');
      expect(bufferText(buf)).toContain('Encrypted Core');
    });
  });

  describe('navigation', () => {
    it('BACK action calls onBack (returns to global menu)', () => {
      const input = new MockInputHandler();
      const { onBack } = makeScene(input);
      input.triggerAction('BACK');
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('NAV_2 action calls onBack', () => {
      const input = new MockInputHandler();
      const { onBack } = makeScene(input);
      input.triggerAction('NAV_2');
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('NAV_1 action calls onGame', () => {
      const input = new MockInputHandler();
      const { onGame } = makeScene(input);
      input.triggerAction('NAV_1');
      expect(onGame).toHaveBeenCalledTimes(1);
    });

    it('[1] GAME footer tap calls onGame', () => {
      const input = new MockInputHandler();
      const { scene, onGame } = makeScene(input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(3, FOOTER_ROW);
      expect(onGame).toHaveBeenCalledTimes(1);
    });

    it('[2] MENU footer tap calls onBack', () => {
      const input = new MockInputHandler();
      const { scene, onBack } = makeScene(input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // [2] MENU starts after "[1] GAME::" — col 3 + "[1] GAME" len(8) + "::"(2) = col 13
      input.triggerTap(13, FOOTER_ROW);
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('MENU action calls onGame (toggle closes menu)', () => {
      const input = new MockInputHandler();
      const { onGame } = makeScene(input);
      input.triggerAction('MENU');
      expect(onGame).toHaveBeenCalledTimes(1);
    });
  });

  describe('sorting', () => {
    it('sorts missions by destination, status, then type', () => {
      const input = new MockInputHandler();
      const player = makePlayer();

      // Create two supply missions for the same destination with different statuses
      const supplyReadyAlpha: MissionSpec = {
        id: 'm-alpha-supply-ready',
        type: 'supply',
        title: 'Alpha Ready Supply',
        description: 'Test',
        reward: 300,
        issuingDestinationId: 'elysium-station',
        giverName: 'Test',
        requirements: [{ commodityId: 'rations', qty: 1 }],
        deliveryDestinationId: 'alpha-station',
      };

      const supplyNeedsAlpha: MissionSpec = {
        id: 'm-alpha-supply-needs',
        type: 'supply',
        title: 'Alpha Needs Supply',
        description: 'Test',
        reward: 250,
        issuingDestinationId: 'elysium-station',
        giverName: 'Test',
        requirements: [{ commodityId: 'fuel-cells', qty: 10 }],
        deliveryDestinationId: 'alpha-station',
      };

      // Accept in reverse order
      player.acceptMission(supplyNeedsAlpha, false);  // needs-supplies (player has no fuel)
      player.addCargo('rations', 1);  // now has rations
      player.acceptMission(supplyReadyAlpha, false);  // ready-to-deliver (player has rations)

      const scene = new MissionLogScene(input, context, player, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const fullText = bufferText(buf);

      // Expected: ready-to-deliver missions appear before needs-supplies
      // So "Alpha Ready Supply" should appear before "Alpha Needs Supply"
      const readyPos = fullText.indexOf('Alpha Ready Supply');
      const needsPos = fullText.indexOf('Alpha Needs Supply');

      expect(readyPos).toBeGreaterThan(-1);
      expect(needsPos).toBeGreaterThan(-1);
      expect(readyPos).toBeLessThan(needsPos);
    });
  });

  describe('supply mission display', () => {
    it('renders supply mission requirements with cargo quantities', () => {
      const input = new MockInputHandler();
      const player = makePlayer();
      player.addCargo('rations', 1);
      player.addCargo('fuel-cells', 5);

      const supplyMission: MissionSpec = {
        id: 'm-supply',
        type: 'supply',
        title: 'Supply Test',
        description: 'Test',
        reward: 300,
        issuingDestinationId: 'elysium-station',
        giverName: 'Test',
        requirements: [
          { commodityId: 'rations', qty: 2 },
          { commodityId: 'fuel-cells', qty: 5 },
          { commodityId: 'water', qty: 1 },
        ],
        deliveryDestinationId: 'elysium-station',
      };

      player.acceptMission(supplyMission, false);

      const scene = new MissionLogScene(input, context, player, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);

      // Title at ITEM_START
      // Status at ITEM_START + 1
      // Dest at ITEM_START + 2
      // Requirements start at ITEM_START + 3
      expect(rowText(buf, ITEM_START + 3)).toContain('2x Ration Packs');
      expect(rowText(buf, ITEM_START + 3)).toContain('(have: 1)');
      expect(rowText(buf, ITEM_START + 4)).toContain('5x Fuel Cell');
      expect(rowText(buf, ITEM_START + 4)).toContain('(have: 5)');
      expect(rowText(buf, ITEM_START + 5)).toContain('1x water');
      expect(rowText(buf, ITEM_START + 5)).toContain('(have: 0)');
    });
  });
});
