import { describe, it, expect, vi } from 'vitest';
import { TraderScene } from './trader-scene';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';
import type { TraderStockEntry } from '../world/types';
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

const keyboardContext: GameContext = {
  environment: 'browser', primaryInput: 'keyboard', debug: false,
};

// CONTENT_TOP = 3; tab row = CONTENT_TOP+3 = 6; item row start = CONTENT_TOP+5 = 8
const ITEM_ROW_START = 8;
const TAB_ROW = 6;

const BUY_TAB_COL = 5;
const SELL_TAB_COL = 12;

const FOOTER_ROW = 29;
const NAV_UNDOCK_COL = 3;
const NAV_HUB_COL = 17;

// Test stock using real commodity IDs from WORLD data
const makeStock = (): TraderStockEntry[] => [
  { commodityId: 'iron-ore', qty: 5 },
  { commodityId: 'rare-earth', qty: 2 },
  { commodityId: 'rations', qty: 8 },
];

function makeScene(
  input: MockInputHandler,
  opts: {
    stock?: TraderStockEntry[];
    onBuy?: (id: string, qty: number) => void;
    onSell?: (id: string, qty: number) => void;
    onHub?: () => void;
    onUndock?: () => void;
  } = {},
): TraderScene {
  return new TraderScene(
    input,
    keyboardContext,
    makePlayer(),
    'elysium-station',
    opts.stock ?? makeStock(),
    opts.onBuy ?? vi.fn(),
    opts.onSell ?? vi.fn(),
    opts.onHub ?? vi.fn(),
    opts.onUndock ?? vi.fn(),
    vi.fn(),
  );
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('TraderScene', () => {
  describe('render — layout', () => {
    it('does not render a border', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).not.toBe('+');
    });

    it('chrome header row 0 contains system name SOL', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 0)).toContain('SOL');
    });

    it('chrome footer row h-1 contains [1] UNDOCK and [2] HUB', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, FOOTER_ROW)).toContain('[1]');
      expect(rowText(buf, FOOTER_ROW)).toContain('UNDOCK');
      expect(rowText(buf, FOOTER_ROW)).toContain('[2]');
      expect(rowText(buf, FOOTER_ROW)).toContain('HUB');
    });

    it('renders trader name at row 3 in bright-white', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 3)).toContain('MERCHANT KESS');
      expect(buf[3].find((c, i) => c.char !== ' ' && i >= 2)?.fg).toBe('bright-white');
    });

    it("renders ' underline at row 4 in bright-black", () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 4)).toContain("'");
      expect(buf[4].find(c => c.char === "'")?.fg).toBe('bright-black');
    });

    it('renders | BUY | SELL | tab bar at tab row', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = rowText(buf, TAB_ROW);
      expect(text).toContain('BUY');
      expect(text).toContain('SELL');
      expect(buf[TAB_ROW][BUY_TAB_COL].bg).toBe('green');
      expect(buf[TAB_ROW][BUY_TAB_COL].fg).toBe('black');
      expect(buf[TAB_ROW][SELL_TAB_COL].bg).toBe('black');
    });

    it('BUY tab renders stock items with name, qty and price', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, { stock: [{ commodityId: 'iron-ore', qty: 5 }] });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // iron-ore basePrice=80 per unit
      expect(rowText(buf, ITEM_ROW_START)).toContain('Iron Ore (x5)');
      expect(rowText(buf, ITEM_ROW_START)).toContain('80 CR');
    });

    it('BUY tab shows NO STOCK AVAILABLE when stock is empty', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, { stock: [] });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).toContain('NO STOCK AVAILABLE');
    });

    it('cursor starts on first item in bright-green', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).toContain('>');
      expect(rowFg(buf, ITEM_ROW_START, 2)).toBe('bright-green');
    });

    it('hold-capacity footer renders', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Scan all rows for HOLD: text
      const found = buf.some(row => row.map(c => c.char).join('').includes('HOLD:'));
      expect(found).toBe(true);
    });
  });

  describe('SELL tab', () => {
    it('SELL tab renders hold items with name, qty and price', () => {
      const input = new MockInputHandler();
      const player = makePlayer();
      player.addCargo('rations', 3); // rations basePrice=60 per unit
      const scene = new TraderScene(
        input, keyboardContext, player, 'elysium-station',
        makeStock(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
      input.triggerAction('RIGHT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).toContain('Ration Packs (x3)');
      expect(rowText(buf, ITEM_ROW_START)).toContain('60 CR');
    });

    it('SELL tab shows CARGO HOLD EMPTY when hold is empty', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      input.triggerAction('RIGHT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).toContain('CARGO HOLD EMPTY');
    });
  });

  describe('keyboard navigation', () => {
    it('DOWN moves cursor to next item', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      const buf = makeBuffer(40, 30);
      input.triggerAction('DOWN');
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START + 1)).toContain('>');
      expect(rowFg(buf, ITEM_ROW_START + 1, 2)).toBe('bright-green');
    });

    it('UP from first item wraps to last item', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      const buf = makeBuffer(40, 30);
      input.triggerAction('UP');
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START + 2)).toContain('>');
    });

    it('RIGHT switches to SELL tab and resets cursor', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      input.triggerAction('DOWN');
      input.triggerAction('RIGHT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[TAB_ROW][SELL_TAB_COL].bg).toBe('green');
      expect(buf[TAB_ROW][BUY_TAB_COL].bg).toBe('black');
    });

    it('LEFT switches back to BUY tab', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      input.triggerAction('RIGHT');
      input.triggerAction('LEFT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[TAB_ROW][BUY_TAB_COL].bg).toBe('green');
      expect(rowText(buf, ITEM_ROW_START)).toContain('Iron Ore');
    });

    it('SELECT opens modal; second SELECT confirms and calls onBuy with correct id and qty', () => {
      // iron-ore: basePrice=80, stock qty=5, player credits=5000 → initial=min(5,62)=5
      const onBuy = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, { onBuy });
      input.triggerAction('SELECT'); // opens modal — onBuy NOT called yet
      expect(onBuy).not.toHaveBeenCalled();
      input.triggerAction('SELECT'); // confirm modal (field focused)
      expect(onBuy).toHaveBeenCalledWith('iron-ore', 5);
    });

    it('SELECT on SELL tab opens modal; confirm calls onSell with correct id and qty', () => {
      const onSell = vi.fn();
      const input = new MockInputHandler();
      const player = makePlayer();
      player.addCargo('rations', 3);
      new TraderScene(
        input, keyboardContext, player, 'elysium-station',
        makeStock(), vi.fn(), onSell, vi.fn(), vi.fn(), vi.fn(),
      );
      input.triggerAction('RIGHT');
      input.triggerAction('SELECT'); // opens modal — initial qty=3 (full hold)
      expect(onSell).not.toHaveBeenCalled();
      input.triggerAction('SELECT'); // confirm
      expect(onSell).toHaveBeenCalledWith('rations', 3);
    });

    it('BUY tab shows NO STOCK AVAILABLE after all items are bought via modal', () => {
      const stock: TraderStockEntry[] = [{ commodityId: 'iron-ore', qty: 5 }];
      const input = new MockInputHandler();
      const scene = makeScene(input, {
        stock,
        onBuy: (_id, _qty) => { stock.splice(0, 1); },
      });
      input.triggerAction('SELECT'); // opens modal
      input.triggerAction('SELECT'); // confirms → onBuy called → syncItems
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).toContain('NO STOCK AVAILABLE');
    });

    it('SELECT does not set activated (scene stays open for further trades)', () => {
      const onBuy = vi.fn();
      const onHub = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, { onBuy, onHub });
      input.triggerAction('SELECT'); // opens modal
      input.triggerAction('SELECT'); // confirms → onBuy called
      expect(onBuy).toHaveBeenCalledTimes(1);
      // After confirming, modal is closed and scene is still active → BACK navigates
      input.triggerAction('BACK');
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('BACK calls onHub and silences further input', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, { onHub });
      input.triggerAction('BACK');
      expect(onHub).toHaveBeenCalledTimes(1);
      input.triggerAction('BACK');
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('NAV_2 calls onHub', () => {
      const onHub = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, { onHub });
      input.triggerAction('NAV_2');
      expect(onHub).toHaveBeenCalledTimes(1);
    });

    it('NAV_1 calls onUndock', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, { onUndock });
      input.triggerAction('NAV_1');
      expect(onUndock).toHaveBeenCalledTimes(1);
    });
  });

  describe('touch navigation', () => {
    it('tap on BUY tab area switches back from SELL to BUY', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      input.triggerAction('RIGHT');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(BUY_TAB_COL, TAB_ROW);
      const buf2 = makeBuffer(40, 30);
      scene.render(buf2);
      expect(buf2[TAB_ROW][BUY_TAB_COL].bg).toBe('green');
    });

    it('tap on SELL tab area switches to SELL', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(SELL_TAB_COL, TAB_ROW);
      const buf2 = makeBuffer(40, 30);
      scene.render(buf2);
      expect(buf2[TAB_ROW][SELL_TAB_COL].bg).toBe('green');
    });

    it('tap on item row opens modal; confirm calls onBuy', () => {
      const onBuy = vi.fn();
      const input = new MockInputHandler();
      const scene = makeScene(input, { onBuy });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(5, ITEM_ROW_START); // opens modal
      expect(onBuy).not.toHaveBeenCalled();
      input.triggerAction('SELECT'); // confirm (field focused)
      expect(onBuy).toHaveBeenCalledWith('iron-ore', 5);
    });

    it('tap on footer UNDOCK button fires onUndock and silences input', () => {
      const onUndock = vi.fn();
      const input = new MockInputHandler();
      const scene = makeScene(input, { onUndock });
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
      const scene = makeScene(input, { onHub });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(NAV_HUB_COL, FOOTER_ROW);
      expect(onHub).toHaveBeenCalledTimes(1);
      input.triggerTap(NAV_HUB_COL, FOOTER_ROW);
      expect(onHub).toHaveBeenCalledTimes(1);
    });
  });

  describe('unaffordable items', () => {
    it('item player cannot afford is rendered in bright-black', () => {
      // iron-ore basePrice=80; player has 50 credits → cannot afford any stock
      const input = new MockInputHandler();
      const player = makePlayer({ credits: 50 });
      const scene = new TraderScene(
        input, keyboardContext, player, 'elysium-station',
        [{ commodityId: 'iron-ore', qty: 5 }], vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowFg(buf, ITEM_ROW_START, 2)).toBe('bright-black');
    });

    it('cursor skips unaffordable items and lands on first affordable one', () => {
      // iron-ore=80 (unaffordable), rations=60 (affordable) with 70 credits
      const input = new MockInputHandler();
      const player = makePlayer({ credits: 70 });
      const scene = new TraderScene(
        input, keyboardContext, player, 'elysium-station',
        [{ commodityId: 'iron-ore', qty: 5 }, { commodityId: 'rations', qty: 8 }],
        vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Cursor should be on rations (row 1), not iron-ore (row 0)
      expect(rowText(buf, ITEM_ROW_START)).not.toContain('>');
      expect(rowText(buf, ITEM_ROW_START + 1)).toContain('>');
      expect(rowFg(buf, ITEM_ROW_START + 1, 2)).toBe('bright-green');
    });

    it('SELECT on an unaffordable item does not call onBuy', () => {
      const onBuy = vi.fn();
      const input = new MockInputHandler();
      const player = makePlayer({ credits: 50 });
      const scene = new TraderScene(
        input, keyboardContext, player, 'elysium-station',
        [{ commodityId: 'iron-ore', qty: 5 }], onBuy, vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerAction('SELECT');
      expect(onBuy).not.toHaveBeenCalled();
      // Scene should not have rendered a modal
      const buf2 = makeBuffer(40, 30);
      scene.render(buf2);
      expect(rowText(buf2, ITEM_ROW_START)).toContain('Iron Ore');
    });

    it('tap on an unaffordable item does not call onBuy', () => {
      const onBuy = vi.fn();
      const input = new MockInputHandler();
      const player = makePlayer({ credits: 50 });
      const scene = new TraderScene(
        input, keyboardContext, player, 'elysium-station',
        [{ commodityId: 'iron-ore', qty: 5 }], onBuy, vi.fn(), vi.fn(), vi.fn(), vi.fn(),
      );
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      input.triggerTap(5, ITEM_ROW_START);
      input.triggerAction('SELECT'); // would confirm modal if one were open
      expect(onBuy).not.toHaveBeenCalled();
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input);
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });
});
