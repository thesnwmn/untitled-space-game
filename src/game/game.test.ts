import { describe, it, expect, vi } from 'vitest';
import { Game } from './game';
import type { Renderer, InputHandler, GameContext, CharBuffer } from '../shared/types';
import type { TraderStockEntry } from './world/types';

function makeMockRenderer(width = 40, height = 30): Renderer & { drawBuffer: ReturnType<typeof vi.fn> } {
  return {
    drawBuffer: vi.fn(),
    getWidth: () => width,
    getHeight: () => height,
    clear: vi.fn(),
    onResize: vi.fn(),
  };
}

function makeMockInput(): InputHandler {
  return {
    onAction: vi.fn(),
    onTap: vi.fn(),
  };
}

const context: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

describe('Game', () => {
  it('tick calls drawBuffer once per call', () => {
    const renderer = makeMockRenderer();
    const game = new Game(renderer, makeMockInput(), context);
    game.tick(16);
    expect(renderer.drawBuffer).toHaveBeenCalledOnce();
  });

  it('tick passes a buffer matching renderer dimensions', () => {
    const renderer = makeMockRenderer(40, 30);
    const game = new Game(renderer, makeMockInput(), context);
    game.tick(16);
    const buffer = renderer.drawBuffer.mock.calls[0][0] as CharBuffer;
    expect(buffer).toHaveLength(30);
    expect(buffer[0]).toHaveLength(40);
  });

  it('tick clamps dt to 100 ms', () => {
    const r1 = makeMockRenderer();
    const r2 = makeMockRenderer();
    const game1 = new Game(r1, makeMockInput(), context);
    const game2 = new Game(r2, makeMockInput(), context);
    game1.tick(9999);
    game2.tick(100);
    const buf1 = r1.drawBuffer.mock.calls[0][0] as CharBuffer;
    const buf2 = r2.drawBuffer.mock.calls[0][0] as CharBuffer;
    expect(buf1).toEqual(buf2);
  });

  it('multiple ticks render without error', () => {
    const renderer = makeMockRenderer();
    const game = new Game(renderer, makeMockInput(), context);
    for (let i = 0; i < 10; i++) game.tick(16);
    expect(renderer.drawBuffer).toHaveBeenCalledTimes(10);
  });
});

describe('Game — onBuy guards', () => {
  function makeGame() {
    return new Game(makeMockRenderer(), makeMockInput(), context);
  }

  it('successful buy deducts credits, adds cargo, and removes item from stock', () => {
    const game = makeGame();
    const player = (game as any).player;
    const stock: TraderStockEntry[] = [{ commodityId: 'rations', qty: 3 }]; // rations: 60 CR, 1 kg
    (game as any).onBuy('rations', stock);
    expect(player.credits).toBe(5000 - 3 * 60); // 4820
    expect(player.cargoHold).toHaveLength(1);
    expect(player.cargoHold[0]).toEqual({ commodityId: 'rations', qty: 3 });
    expect(stock).toHaveLength(0);
  });

  it('buy does nothing when player cannot afford the item', () => {
    const game = makeGame();
    const player = (game as any).player;
    player.spendCredits(5000); // drain all credits
    const stock: TraderStockEntry[] = [{ commodityId: 'rations', qty: 1 }];
    (game as any).onBuy('rations', stock);
    expect(player.cargoHold).toHaveLength(0);
    expect(stock).toHaveLength(1);
  });

  it('buy does nothing when item would exceed hold capacity', () => {
    const game = makeGame();
    const player = (game as any).player;
    // Fill hold to 1990 kg with iron-ore (10 kg each, 199 units)
    player.addCargo('iron-ore', 199);
    // ship-components weighs 15 kg — would push total to 2005 kg, over 2000 kg cap
    const stock: TraderStockEntry[] = [{ commodityId: 'ship-components', qty: 1 }];
    (game as any).onBuy('ship-components', stock);
    expect(player.cargoHold.find((e: TraderStockEntry) => e.commodityId === 'ship-components')).toBeUndefined();
    expect(stock).toHaveLength(1);
  });
});

describe('Game — onSell', () => {
  function makeGame() {
    return new Game(makeMockRenderer(), makeMockInput(), context);
  }

  it('sell adds credits, removes cargo, and merges into stock', () => {
    const game = makeGame();
    const player = (game as any).player;
    player.addCargo('rations', 4);
    player.spendCredits(5000); // zero credits to make verification clear
    const stock: TraderStockEntry[] = [];
    (game as any).onSell('rations', stock);
    expect(player.credits).toBe(4 * 60); // 240
    expect(player.cargoHold).toHaveLength(0);
    expect(stock).toEqual([{ commodityId: 'rations', qty: 4 }]);
  });

  it('sell merges into existing stock entry', () => {
    const game = makeGame();
    const player = (game as any).player;
    player.addCargo('rations', 2);
    const stock: TraderStockEntry[] = [{ commodityId: 'rations', qty: 3 }];
    (game as any).onSell('rations', stock);
    expect(stock[0].qty).toBe(5);
  });

  it('sell does nothing when commodity is not in hold', () => {
    const game = makeGame();
    const player = (game as any).player;
    const initialCredits = player.credits;
    const stock: TraderStockEntry[] = [];
    (game as any).onSell('rations', stock);
    expect(player.credits).toBe(initialCredits);
    expect(stock).toHaveLength(0);
  });
});
