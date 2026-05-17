import { describe, it, expect, vi } from 'vitest';
import { StationMenuScene } from './station-menu-scene';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';
import type { MissionSpec } from '../world/types';
import { makePlayer } from '../../tests/makePlayer';

// ── helpers ──────────────────────────────────────────────────────────────────

class MockInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  private tapHandlers: Array<(col: number, row: number) => void> = [];
  private charInputHandlers: Array<(char: string) => void> = [];

  onAction(handler: (action: GameAction) => void): void {
    this.actionHandlers.push(handler);
  }

  onTap(handler: (col: number, row: number) => void): void {
    this.tapHandlers.push(handler);
  }

  onCharInput(handler: (char: string) => void): void {
    this.charInputHandlers.push(handler);
  }

  triggerAction(action: GameAction): void {
    for (const h of this.actionHandlers) h(action);
  }

  triggerTap(col: number, row: number): void {
    for (const h of this.tapHandlers) h(col, row);
  }

  triggerCharInput(char: string): void {
    for (const h of this.charInputHandlers) h(char);
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

function bufferText(buffer: CharBuffer): string {
  return buffer.map(row => row.map(c => c.char).join('')).join('\n');
}

const keyboardContext: GameContext = {
  environment: 'browser', primaryInput: 'keyboard', debug: false,
};
const touchContext: GameContext = {
  environment: 'browser', primaryInput: 'touch', debug: false,
};

// elysium-station description wraps to 3 lines + dangerLine + factionLine = 5 info lines
// itemStartRow = CONTENT_TOP + 2 + 5 + 1 = 11
const MENU_ROW_START = 11;

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
  onRefuel: (cost: number, litres: number) => void = vi.fn(),
): StationMenuScene {
  const player = makePlayer({ credits });
  // Consume fuel to reach the desired fuelL (player starts at full capacity 100)
  if (fuelL < fuelCapacityL) player.consumeFuel(fuelCapacityL - fuelL);
  return new StationMenuScene(input, ctx, player, 'elysium-station', onRefuel, onTrader, onMissionBoard, vi.fn(), onShip, vi.fn());
}

// Delivery mission spec for pickup at elysium-station
function makeDeliveryPickupSpec(overrides: Partial<{ reward: number; itemName: string }> = {}): MissionSpec {
  return {
    id: 'test-delivery-pickup',
    type: 'delivery',
    title: 'Test Delivery',
    description: 'A test delivery mission',
    reward: overrides.reward ?? 500,
    issuingDestinationId: 'elysium-station',
    giverName: 'Test NPC',
    itemName: overrides.itemName ?? 'Mystery Package',
    itemWeightKg: 50,
    pickupDestinationId: 'elysium-station',
    deliveryDestinationId: 'tycho-orbital',
  };
}

// Delivery mission spec for delivery at elysium-station (item already picked up)
function makeDeliveryDeliverSpec(overrides: Partial<{ reward: number; title: string }> = {}): MissionSpec {
  return {
    id: 'test-delivery-deliver',
    type: 'delivery',
    title: overrides.title ?? 'Deliver Package',
    description: 'A test delivery mission',
    reward: overrides.reward ?? 750,
    issuingDestinationId: 'tycho-orbital',
    giverName: 'Test NPC',
    itemName: 'Sealed Crate',
    itemWeightKg: 80,
    pickupDestinationId: 'tycho-orbital',
    deliveryDestinationId: 'elysium-station',
  };
}

// Supply mission spec for delivery at elysium-station
function makeSupplyDeliverSpec(overrides: Partial<{ reward: number }> = {}): MissionSpec {
  return {
    id: 'test-supply-deliver',
    type: 'supply',
    title: 'Supply Run',
    description: 'Bring iron ore',
    reward: overrides.reward ?? 600,
    issuingDestinationId: 'elysium-station',
    giverName: 'Test NPC',
    requirements: [{ commodityId: 'iron-ore', qty: 3 }],
    deliveryDestinationId: 'elysium-station',
  };
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
      const scene = new StationMenuScene(input, keyboardContext, makePlayer({ destinationId: 'tycho-orbital' }), 'tycho-orbital', vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn());
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

    it('BUY FUEL opens modal; confirm calls onRefuel with cost and litres', () => {
      const onRefuel = vi.fn();
      const input = new MockInputHandler();
      // elysium-station: fuel=true, fuelL=80, cap=100 → needs 20L → cost 200 CR
      // credits=5000 → can afford all 20L → initial=20L
      const scene = makeScene(input, keyboardContext, vi.fn(), vi.fn(), vi.fn(), 80, 100, 5000, onRefuel);
      // BUY FUEL is item at index 2 (TRADER=0, MISSION BOARD=1, BUY FUEL=2)
      input.triggerAction('DOWN');
      input.triggerAction('DOWN');
      input.triggerAction('SELECT'); // opens modal — onRefuel NOT called yet
      expect(onRefuel).not.toHaveBeenCalled();
      input.triggerAction('SELECT'); // confirm modal (field focused, initial=20L)
      expect(onRefuel).toHaveBeenCalledTimes(1);
      expect(onRefuel).toHaveBeenCalledWith(200, 20); // cost=200, litres=20
    });

    it('BUY FUEL is capped to what the player can afford', () => {
      const input = new MockInputHandler();
      // fuelL=80, cap=100 → needs 20L but only 50 CR → can afford 5L
      const scene = makeScene(input, keyboardContext, vi.fn(), vi.fn(), vi.fn(), 80, 100, 50);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      let found = false;
      for (let r = 0; r < buf.length; r++) {
        const text = rowText(buf, r);
        if (text.includes('BUY FUEL')) {
          expect(text).toContain('+5L');
          expect(text).toContain('50CR');
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    it('affordability-capped BUY FUEL modal: confirm calls onRefuel with capped values', () => {
      const onRefuel = vi.fn();
      const input = new MockInputHandler();
      // 50 CR → can afford 5L at 10 CR/L → initial=5L, cost=50CR
      const scene = makeScene(input, keyboardContext, vi.fn(), vi.fn(), vi.fn(), 80, 100, 50, onRefuel);
      input.triggerAction('DOWN');
      input.triggerAction('DOWN');
      input.triggerAction('SELECT'); // opens modal
      input.triggerAction('SELECT'); // confirm (initial=5L)
      expect(onRefuel).toHaveBeenCalledWith(50, 5); // cost=50, litres=5
    });

    it('BUY FUEL is absent when player cannot afford any fuel', () => {
      const input = new MockInputHandler();
      // 5 CR → floor(5/10) = 0L affordable → no BUY FUEL item
      const scene = makeScene(input, keyboardContext, vi.fn(), vi.fn(), vi.fn(), 80, 100, 5);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      for (let r = 0; r < buf.length; r++) {
        expect(rowText(buf, r)).not.toContain('BUY FUEL');
      }
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

  describe('nav label — TAKE OFF vs UNDOCK by locationType', () => {
    function makeSceneForDest(input: MockInputHandler, destinationId: string): StationMenuScene {
      const player = makePlayer({ destinationId });
      return new StationMenuScene(
        input, keyboardContext, player, destinationId,
        vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
    }

    it('shows UNDOCK for orbital destination', () => {
      const input = new MockInputHandler();
      // elysium-station is orbital
      const scene = makeSceneForDest(input, 'elysium-station');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const footer = buf[29].map(c => c.char).join('');
      expect(footer).toContain('UNDOCK');
      expect(footer).not.toContain('TAKE OFF');
    });

    it('shows TAKE OFF for surface destination', () => {
      const input = new MockInputHandler();
      // ceti-landfall is surface
      const scene = makeSceneForDest(input, 'ceti-landfall');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const footer = buf[29].map(c => c.char).join('');
      expect(footer).toContain('TAKE OFF');
      expect(footer).not.toContain('UNDOCK');
    });

    it('shows TAKE OFF for asteroid destination', () => {
      const input = new MockInputHandler();
      // eridani-anchorage is asteroid
      const scene = makeSceneForDest(input, 'eridani-anchorage');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const footer = buf[29].map(c => c.char).join('');
      expect(footer).toContain('TAKE OFF');
      expect(footer).not.toContain('UNDOCK');
    });
  });

  // ── Mission action tests ──────────────────────────────────────────────────

  describe('COLLECT flow', () => {
    it('renders COLLECT item above amenities when pickup mission is present', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      player.acceptMission(makeDeliveryPickupSpec({ itemName: 'Mystery Package' }), false);
      const input = new MockInputHandler();
      const scene = new StationMenuScene(
        input, keyboardContext, player, 'elysium-station',
        vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('COLLECT: Mystery Package');
    });

    it('COLLECT item renders in bright-yellow when not selected', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      player.acceptMission(makeDeliveryPickupSpec(), false);
      const input = new MockInputHandler();
      const scene = new StationMenuScene(
        input, keyboardContext, player, 'elysium-station',
        vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
      const buf = makeBuffer(40, 30);
      // Move cursor away from COLLECT (cursor starts on first non-disabled item = COLLECT)
      input.triggerAction('DOWN'); // move to next item (separator is skipped, so TRADER)
      scene.render(buf);
      // COLLECT row is MENU_ROW_START (row 10), now not cursor → bright-yellow
      const collectRow = buf[MENU_ROW_START];
      const firstChar = collectRow.find((c, i) => c.char !== ' ' && i >= 2);
      expect(firstChar?.fg).toBe('bright-yellow');
    });

    it('separator row appears between mission items and amenity items', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      player.acceptMission(makeDeliveryPickupSpec(), false);
      const input = new MockInputHandler();
      const scene = new StationMenuScene(
        input, keyboardContext, player, 'elysium-station',
        vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // COLLECT at row 10, separator at row 11, TRADER at row 12
      expect(rowText(buf, MENU_ROW_START + 1)).toContain('─');
      expect(rowText(buf, MENU_ROW_START + 2)).toContain('TRADER');
    });

    it('selecting COLLECT calls collectMissionItem on player', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      const spec = makeDeliveryPickupSpec();
      player.acceptMission(spec, false);
      expect(player.missionItems.length).toBe(0);
      const input = new MockInputHandler();
      const onHub = vi.fn();
      new StationMenuScene(
        input, keyboardContext, player, 'elysium-station',
        vi.fn(), vi.fn(), vi.fn(), onHub, vi.fn(), vi.fn(),
      );
      // cursor starts on COLLECT item (first non-disabled)
      input.triggerAction('SELECT');
      expect(player.missionItems.length).toBe(1);
      expect(player.missionItems[0].itemName).toBe('Mystery Package');
    });

    it('selecting COLLECT calls onHub to rebuild station menu', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      player.acceptMission(makeDeliveryPickupSpec(), false);
      const input = new MockInputHandler();
      const onHub = vi.fn();
      new StationMenuScene(
        input, keyboardContext, player, 'elysium-station',
        vi.fn(), vi.fn(), vi.fn(), onHub, vi.fn(), vi.fn(),
      );
      input.triggerAction('SELECT');
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('separator is absent when no mission items are present', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, keyboardContext);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // rows 10 and 11 should be TRADER and MISSION BOARD, no separator dashes
      expect(rowText(buf, MENU_ROW_START)).not.toContain('─');
      expect(rowText(buf, MENU_ROW_START + 1)).not.toContain('─');
    });
  });

  describe('DELIVER flow', () => {
    it('renders DELIVER item above amenities when delivery mission is ready', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      const spec = makeDeliveryDeliverSpec({ title: 'Deliver Package', reward: 750 });
      player.acceptMission(spec, true); // giveItemNow → pickupComplete = true
      const input = new MockInputHandler();
      const scene = new StationMenuScene(
        input, keyboardContext, player, 'elysium-station',
        vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('DELIVER: Deliver Package → 750 CR');
    });

    it('selecting DELIVER (delivery mission) completes mission and adds credits', () => {
      const player = makePlayer({ destinationId: 'elysium-station', credits: 1000 });
      const spec = makeDeliveryDeliverSpec({ reward: 750 });
      player.acceptMission(spec, true);
      expect(player.activeMissions.length).toBe(1);
      const input = new MockInputHandler();
      new StationMenuScene(
        input, keyboardContext, player, 'elysium-station',
        vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
      // cursor starts on DELIVER item
      input.triggerAction('SELECT');
      expect(player.activeMissions.length).toBe(0);
      expect(player.credits).toBe(1750); // 1000 + 750
    });

    it('selecting DELIVER opens completion modal with reward info', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      const spec = makeDeliveryDeliverSpec({ reward: 750 });
      player.acceptMission(spec, true);
      const input = new MockInputHandler();
      const scene = new StationMenuScene(
        input, keyboardContext, player, 'elysium-station',
        vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
      input.triggerAction('SELECT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('MISSION COMPLETE');
      expect(bufferText(buf)).toContain('750 CR');
    });

    it('closing completion modal calls onHub', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      player.acceptMission(makeDeliveryDeliverSpec({ reward: 750 }), true);
      const input = new MockInputHandler();
      const onHub = vi.fn();
      new StationMenuScene(
        input, keyboardContext, player, 'elysium-station',
        vi.fn(), vi.fn(), vi.fn(), onHub, vi.fn(), vi.fn(),
      );
      input.triggerAction('SELECT'); // select DELIVER → opens modal
      expect(onHub).not.toHaveBeenCalled();
      input.triggerAction('SELECT'); // confirm modal OKAY
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('selecting DELIVER (supply mission) removes cargo and completes mission', () => {
      const player = makePlayer({ destinationId: 'elysium-station', credits: 500 });
      const spec = makeSupplyDeliverSpec({ reward: 600 });
      player.acceptMission(spec, false);
      player.addCargo('iron-ore', 3);
      const input = new MockInputHandler();
      new StationMenuScene(
        input, keyboardContext, player, 'elysium-station',
        vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
      input.triggerAction('SELECT');
      // Mission complete, cargo removed, credits added
      expect(player.activeMissions.length).toBe(0);
      expect(player.cargoHold.find(e => e.commodityId === 'iron-ore')).toBeUndefined();
      expect(player.credits).toBe(1100); // 500 + 600
    });

    it('DELIVER shows error modal if supply cargo is removed after scene construction', () => {
      // Supply missions check cargo at selection time, not just at construction. Simulate
      // cargo being removed between scene build and item selection.
      const player = makePlayer({ destinationId: 'elysium-station' });
      const supplySpec = makeSupplyDeliverSpec({ reward: 600 });
      player.acceptMission(supplySpec, false);
      player.addCargo('iron-ore', 3); // satisfies requirement — DELIVER item is built
      const input = new MockInputHandler();
      const scene = new StationMenuScene(
        input, keyboardContext, player, 'elysium-station',
        vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
      player.removeCargo('iron-ore', 3); // cargo lost before selection
      input.triggerAction('SELECT'); // re-check fails → error modal
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('CANNOT DELIVER');
    });

    it('error modal OKAY re-enables scene input without navigating', () => {
      const player = makePlayer({ destinationId: 'elysium-station' });
      const supplySpec = makeSupplyDeliverSpec({ reward: 600 });
      player.acceptMission(supplySpec, false);
      player.addCargo('iron-ore', 3);
      const onHub = vi.fn();
      const onTrader = vi.fn();
      const input = new MockInputHandler();
      new StationMenuScene(
        input, keyboardContext, player, 'elysium-station',
        vi.fn(), onTrader, vi.fn(), onHub, vi.fn(), vi.fn(),
      );
      player.removeCargo('iron-ore', 3); // make cargo check fail
      input.triggerAction('SELECT'); // opens error modal
      input.triggerAction('SELECT'); // confirm OKAY — should NOT navigate
      expect(onHub).not.toHaveBeenCalled();
      // Scene is re-enabled — navigate to TRADER (separator skipped by cursor)
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      expect(onTrader).toHaveBeenCalledTimes(1);
    });
  });
});
