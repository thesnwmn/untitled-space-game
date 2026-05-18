import { describe, it, expect, vi } from 'vitest';
import { Game, generateTraderStock } from './game';
import type { Renderer, InputHandler, GameContext, CharBuffer } from '../shared/types';
import type { MissionSpec, TraderStockEntry } from './world/types';
import { getCommodities, getGameBalance } from './world/world-data';
import { SurfaceLandingAnimationScene } from './scenes/surface-landing-animation-scene';
import { AsteroidLandingAnimationScene } from './scenes/asteroid-landing-animation-scene';
import { SurfaceTakeOffAnimationScene } from './scenes/surface-take-off-animation-scene';
import { AsteroidTakeOffAnimationScene } from './scenes/asteroid-take-off-animation-scene';
import { OrbitalDockingAnimationScene } from './scenes/orbital-docking-animation-scene';
import { OrbitalUndockingAnimationScene } from './scenes/orbital-undocking-animation-scene';

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
    (game as any).onBuy('rations', 3, 60, stock);
    expect(player.credits).toBe(5000 - 3 * 60); // 4820
    expect(player.cargoHold).toHaveLength(1);
    expect(player.cargoHold[0]).toEqual({ commodityId: 'rations', qty: 3 });
    expect(stock).toHaveLength(0);
  });

  it('partial buy reduces stock qty rather than removing entry', () => {
    const game = makeGame();
    const player = (game as any).player;
    const stock: TraderStockEntry[] = [{ commodityId: 'rations', qty: 5 }];
    (game as any).onBuy('rations', 2, 60, stock);
    expect(player.cargoHold[0]).toEqual({ commodityId: 'rations', qty: 2 });
    expect(stock[0].qty).toBe(3);
  });

  it('buy does nothing when player cannot afford the item', () => {
    const game = makeGame();
    const player = (game as any).player;
    player.spendCredits(5000); // drain all credits
    const stock: TraderStockEntry[] = [{ commodityId: 'rations', qty: 1 }];
    (game as any).onBuy('rations', 1, 60, stock);
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
    (game as any).onBuy('ship-components', 1, 650, stock);
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
    (game as any).onSell('rations', 4, 60, stock);
    expect(player.credits).toBe(4 * 60); // 240
    expect(player.cargoHold).toHaveLength(0);
    expect(stock).toEqual([{ commodityId: 'rations', qty: 4 }]);
  });

  it('partial sell reduces cargo qty rather than removing entry', () => {
    const game = makeGame();
    const player = (game as any).player;
    player.addCargo('rations', 5);
    player.spendCredits(5000);
    const stock: TraderStockEntry[] = [];
    (game as any).onSell('rations', 2, 60, stock);
    expect(player.cargoHold[0].qty).toBe(3);
    expect(stock[0].qty).toBe(2);
  });

  it('sell merges into existing stock entry', () => {
    const game = makeGame();
    const player = (game as any).player;
    player.addCargo('rations', 2);
    const stock: TraderStockEntry[] = [{ commodityId: 'rations', qty: 3 }];
    (game as any).onSell('rations', 2, 60, stock);
    expect(stock[0].qty).toBe(5);
  });

  it('sell does nothing when commodity is not in hold', () => {
    const game = makeGame();
    const player = (game as any).player;
    const initialCredits = player.credits;
    const stock: TraderStockEntry[] = [];
    (game as any).onSell('rations', 1, 60, stock);
    expect(player.credits).toBe(initialCredits);
    expect(stock).toHaveLength(0);
  });
});

describe('Game — goToLandOrDock routing', () => {
  function makeGame() {
    return new Game(makeMockRenderer(), makeMockInput(), context);
  }

  it('surface destination plays SurfaceLandingAnimationScene', () => {
    const game = makeGame();
    const player = (game as any).player;
    player.dock('ceti-landfall'); // surface destination in tau-ceti
    (game as any).goToLandOrDock();
    expect((game as any).currentScene).toBeInstanceOf(SurfaceLandingAnimationScene);
  });

  it('asteroid destination plays AsteroidLandingAnimationScene', () => {
    const game = makeGame();
    const player = (game as any).player;
    player.dock('eridani-anchorage'); // asteroid destination in epsilon-eridani
    (game as any).goToLandOrDock();
    expect((game as any).currentScene).toBeInstanceOf(AsteroidLandingAnimationScene);
  });

  it('orbital destination plays OrbitalDockingAnimationScene', () => {
    const game = makeGame();
    const player = (game as any).player;
    player.dock('elysium-station'); // orbital destination
    (game as any).goToLandOrDock();
    expect((game as any).currentScene).toBeInstanceOf(OrbitalDockingAnimationScene);
  });
});

describe('Game — goToTakeOffOrUndock routing', () => {
  function makeGame() {
    return new Game(makeMockRenderer(), makeMockInput(), context);
  }

  it('surface destination plays SurfaceTakeOffAnimationScene', () => {
    const game = makeGame();
    const player = (game as any).player;
    player.dock('ceti-landfall');
    (game as any).goToTakeOffOrUndock();
    expect((game as any).currentScene).toBeInstanceOf(SurfaceTakeOffAnimationScene);
  });

  it('asteroid destination plays AsteroidTakeOffAnimationScene', () => {
    const game = makeGame();
    const player = (game as any).player;
    player.dock('eridani-anchorage');
    (game as any).goToTakeOffOrUndock();
    expect((game as any).currentScene).toBeInstanceOf(AsteroidTakeOffAnimationScene);
  });

  it('orbital destination plays OrbitalUndockingAnimationScene', () => {
    const game = makeGame();
    const player = (game as any).player;
    player.dock('elysium-station');
    (game as any).goToTakeOffOrUndock();
    expect((game as any).currentScene).toBeInstanceOf(OrbitalUndockingAnimationScene);
  });
});

describe('Game — undock from station sub-scenes plays animation', () => {
  const ORBITAL = 'elysium-station';

  function makeDockedGame() {
    const game = new Game(makeMockRenderer(), makeMockInput(), context);
    (game as any).player.dock(ORBITAL);
    return game;
  }

  const stubSpec: MissionSpec = {
    id: 'test-mission',
    type: 'delivery',
    title: 'Test Mission',
    description: 'A test mission.',
    reward: 500,
    issuingDestinationId: ORBITAL,
    giverName: 'Test Giver',
    itemName: 'Test Item',
    itemWeightKg: 1,
    pickupDestinationId: ORBITAL,
    deliveryDestinationId: 'elysium-station',
    deposit: 100,
  };

  it('undock from TraderScene plays OrbitalUndockingAnimationScene', () => {
    const game = makeDockedGame();
    (game as any).goToTrader();
    const scene = (game as any).currentScene;
    (scene as any).onUndock();
    expect((game as any).currentScene).toBeInstanceOf(OrbitalUndockingAnimationScene);
  });

  it('undock from MissionBoardScene plays OrbitalUndockingAnimationScene', () => {
    const game = makeDockedGame();
    (game as any).goToMissionBoard();
    const scene = (game as any).currentScene;
    (scene as any).onUndock();
    expect((game as any).currentScene).toBeInstanceOf(OrbitalUndockingAnimationScene);
  });

  it('undock from MissionDetailScene plays OrbitalUndockingAnimationScene', () => {
    const game = makeDockedGame();
    (game as any).goToMissionDetail(stubSpec, ORBITAL);
    const scene = (game as any).currentScene;
    (scene as any).onUndock();
    expect((game as any).currentScene).toBeInstanceOf(OrbitalUndockingAnimationScene);
  });
});

describe('Game — in-system travel fuel deduction', () => {
  function makeGame() {
    return new Game(makeMockRenderer(), makeMockInput(), context);
  }

  it('onDestinationSelected deducts hop cost from fuel', () => {
    const game = makeGame();
    const player = (game as any).player;
    const initialFuel = player.fuelL;
    const hopCost = player.getInSystemHopCost();
    (game as any).onDestinationSelected('ceti-landfall');
    expect(player.fuelL).toBe(initialFuel - hopCost);
  });

  it('goToFlyIntoSpace deducts hop cost from fuel', () => {
    const game = makeGame();
    const player = (game as any).player;
    const initialFuel = player.fuelL;
    const hopCost = player.getInSystemHopCost();
    (game as any).goToFlyIntoSpace();
    expect(player.fuelL).toBe(initialFuel - hopCost);
  });

  it('fuel deduction does not go below zero', () => {
    const game = makeGame();
    const player = (game as any).player;
    player.consumeFuel(player.fuelL - 1); // Leave 1 L
    const hopCost = player.getInSystemHopCost(); // 4 L
    (game as any).onDestinationSelected('ceti-landfall');
    expect(player.fuelL).toBe(0); // 1 - 4 clamped to 0
  });
});

describe('generateTraderStock — reputation-scaled count and qty', () => {
  const commodities = getCommodities();
  const balance = getGameBalance();

  // Run N iterations and collect all counts.
  function collectCounts(repLevel: number, iterations = 60): number[] {
    return Array.from({ length: iterations }, () => generateTraderStock(commodities, repLevel, balance).length);
  }

  it('at rep -2 (HATED), count is always in [2, 4]', () => {
    const counts = collectCounts(-2);
    expect(Math.min(...counts)).toBeGreaterThanOrEqual(2);
    expect(Math.max(...counts)).toBeLessThanOrEqual(4);
  });

  it('at rep 0 (NEUTRAL), count is always in [4, 6]', () => {
    const counts = collectCounts(0);
    expect(Math.min(...counts)).toBeGreaterThanOrEqual(4);
    expect(Math.max(...counts)).toBeLessThanOrEqual(6);
  });

  it('at rep +3 (REVERED), count is always in [7, 9]', () => {
    const counts = collectCounts(3);
    expect(Math.min(...counts)).toBeGreaterThanOrEqual(7);
    expect(Math.max(...counts)).toBeLessThanOrEqual(9);
  });

  it('at rep -2, base qty range before commodity scaling is [1, 6] — all qtys in [1, 9]', () => {
    // adjQtyMin=1, adjQtyMax=6; max commodity factor=1.5 → max qty=floor(6*1.5)=9
    for (let i = 0; i < 80; i++) {
      const stock = generateTraderStock(commodities, -2, balance);
      for (const entry of stock) {
        expect(entry.qty).toBeGreaterThanOrEqual(1);
        expect(entry.qty).toBeLessThanOrEqual(9);
      }
    }
  });

  it('at rep 0, base qty range before commodity scaling is [5, 10] — all qtys in [2, 15]', () => {
    // adjQtyMin=5, adjQtyMax=10; factor range [0.5, 1.5]
    // min possible: floor(5*0.5)=2; max possible: floor(10*1.5)=15
    for (let i = 0; i < 80; i++) {
      const stock = generateTraderStock(commodities, 0, balance);
      for (const entry of stock) {
        expect(entry.qty).toBeGreaterThanOrEqual(2);
        expect(entry.qty).toBeLessThanOrEqual(15);
      }
    }
  });

  it('at rep +3, base qty range before commodity scaling is [11, 16] — all qtys in [5, 24]', () => {
    // adjQtyMin=11, adjQtyMax=16; factor range [0.5, 1.5]
    // min possible: floor(11*0.5)=5; max possible: floor(16*1.5)=24
    for (let i = 0; i < 80; i++) {
      const stock = generateTraderStock(commodities, 3, balance);
      for (const entry of stock) {
        expect(entry.qty).toBeGreaterThanOrEqual(5);
        expect(entry.qty).toBeLessThanOrEqual(24);
      }
    }
  });

  it('rations (cheap/light) consistently appear in higher qty than ship-components (expensive/heavy)', () => {
    // Run many iterations; when both appear, rations qty should exceed ship-components qty on average
    let rationSum = 0, shipCompSum = 0, pairCount = 0;
    for (let i = 0; i < 200; i++) {
      const stock = generateTraderStock(commodities, 0, balance);
      const rations = stock.find(e => e.commodityId === 'rations');
      const shipComp = stock.find(e => e.commodityId === 'ship-components');
      if (rations && shipComp) {
        rationSum += rations.qty;
        shipCompSum += shipComp.qty;
        pairCount++;
      }
    }
    if (pairCount > 0) {
      expect(rationSum / pairCount).toBeGreaterThan(shipCompSum / pairCount);
    }
  });

  it('all qty values are at least 1 (floor guard)', () => {
    for (let i = 0; i < 80; i++) {
      const stock = generateTraderStock(commodities, -2, balance);
      for (const entry of stock) {
        expect(entry.qty).toBeGreaterThanOrEqual(1);
      }
    }
  });
});
