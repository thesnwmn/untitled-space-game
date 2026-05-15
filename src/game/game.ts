import { MainMenuScene } from './scenes/main-menu-scene';
import { StoryScene } from './scenes/story-scene';
import { StationMenuScene } from './scenes/station-menu-scene';
import { TraderScene } from './scenes/trader-scene';
import { MissionBoardScene } from './scenes/mission-board-scene';
import { ShipScene } from './scenes/ship-scene';
import { CargoScene } from './scenes/cargo-scene';
import { TravelMenuScene } from './scenes/travel-menu-scene';
import { JumpAnimationScene } from './scenes/jump-animation-scene';
import { InSystemTravelAnimationScene } from './scenes/in-system-travel-animation-scene';
import type { CharBuffer, Color, GameContext, Renderer, InputHandler, Scene } from '../shared/types';
import type { TraderStockEntry } from './world/types';
import { getGameSettings, getSystem, getDestination, getShip, getDrive, getRoute, getCommodities, getCommodity } from './world/world-data';
import { PlayerState } from './player-state';
import { FUEL_PER_LY } from './constants';

const MAX_DT = 100;
const STOCK_TTL_MS = 2 * 60 * 1000; // 2 minutes

interface StockCache {
  entries: TraderStockEntry[];
  generatedAt: number;
}

export class Game {
  private readonly renderer: Renderer;
  private readonly input: InputHandler;
  private readonly context: GameContext;
  private readonly player: PlayerState;
  private currentScene: Scene;
  private readonly traderStockCache = new Map<string, StockCache>();

  constructor(renderer: Renderer, input: InputHandler, context: GameContext) {
    this.renderer = renderer;
    this.input = input;
    this.context = context;

    const settings = getGameSettings();
    const ship = getShip(settings.startingShip)!;
    this.player = new PlayerState({
      shipId: settings.startingShip,
      driveId: ship.defaultJumpDrive,
      credits: settings.player.startingCredits,
      systemId: settings.startingLocation.system,
      destinationId: settings.startingLocation.destination,
    });

    this.currentScene = new MainMenuScene(this.input, this.context, this.player, () => this.goToStory());
  }

  tick(dt: number): void {
    const clampedDt = Math.min(dt, MAX_DT);
    const buffer = this.makeBuffer();
    this.currentScene.update(clampedDt);
    this.currentScene.render(buffer);
    this.renderer.drawBuffer(buffer);
  }

  private makeBuffer(): CharBuffer {
    const w = this.renderer.getWidth();
    const h = this.renderer.getHeight();
    return Array.from({ length: h }, () =>
      Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
    );
  }

  private getOrCreateTraderStock(destinationId: string): TraderStockEntry[] {
    const now = Date.now();
    const cached = this.traderStockCache.get(destinationId);
    if (cached && now - cached.generatedAt < STOCK_TTL_MS) {
      return cached.entries;
    }
    const commodities = getCommodities();
    const count = 4 + Math.floor(Math.random() * 3); // 4–6
    const shuffled = [...commodities];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const entries: TraderStockEntry[] = shuffled.slice(0, count).map(c => ({
      commodityId: c.id,
      qty: 1 + Math.floor(Math.random() * 8), // 1–8
    }));
    this.traderStockCache.set(destinationId, { entries, generatedAt: now });
    return entries;
  }

  private onBuy(commodityId: string, qty: number, traderStock: TraderStockEntry[]): void {
    if (qty <= 0) return;
    const stockIdx = traderStock.findIndex(e => e.commodityId === commodityId);
    if (stockIdx < 0) return;

    const entry = traderStock[stockIdx];
    if (qty > entry.qty) return;

    const commodity = getCommodity(commodityId);
    if (!commodity) return;

    const totalCost = qty * commodity.basePrice;
    if (this.player.credits < totalCost) return;

    const newWeight = this.player.cargoWeightKg + qty * commodity.weightKg;
    if (newWeight > this.player.cargoCapacity) return;

    this.player.spendCredits(totalCost);
    this.player.addCargo(commodityId, qty);
    entry.qty -= qty;
    if (entry.qty <= 0) traderStock.splice(stockIdx, 1);
  }

  private onSell(commodityId: string, qty: number, traderStock: TraderStockEntry[]): void {
    if (qty <= 0) return;
    const heldEntry = this.player.cargoHold.find(e => e.commodityId === commodityId);
    if (!heldEntry || heldEntry.qty < qty) return;

    const commodity = getCommodity(commodityId);
    if (!commodity) return;

    const totalValue = qty * commodity.basePrice;
    this.player.addCredits(totalValue);
    this.player.removeCargo(commodityId, qty);

    // Merge back into trader stock
    const existing = traderStock.find(e => e.commodityId === commodityId);
    if (existing) {
      existing.qty += qty;
    } else {
      traderStock.push({ commodityId, qty });
    }
  }

  private goToMainMenu(): void {
    this.currentScene = new MainMenuScene(this.input, this.context, this.player, () => this.goToStory());
  }

  private goToStory(): void {
    this.currentScene = new StoryScene(this.input, this.context, this.player, () => this.goToStation());
  }

  private goToStation(): void {
    this.currentScene = new StationMenuScene(
      this.input, this.context, this.player, this.player.destinationId!,
      (cost: number, litres: number) => {
        this.player.spendCredits(cost);
        this.player.addFuel(litres);
        this.goToStation();
      },
      () => this.goToTrader(), () => this.goToMissionBoard(), () => this.goToShip(),
    );
  }

  private goToTrader(): void {
    const destinationId = this.player.destinationId!;
    const stock = this.getOrCreateTraderStock(destinationId);
    this.currentScene = new TraderScene(
      this.input, this.context, this.player, destinationId, stock,
      (commodityId, qty) => this.onBuy(commodityId, qty, stock),
      (commodityId, qty) => this.onSell(commodityId, qty, stock),
      () => this.goToStation(), () => this.goToShip(),
    );
  }

  private goToMissionBoard(): void {
    this.currentScene = new MissionBoardScene(
      this.input, this.context, this.player, this.player.destinationId!,
      () => this.goToStation(), () => this.goToShip(),
    );
  }

  private goToShip(): void {
    this.currentScene = new ShipScene(
      this.input, this.context, this.player,
      () => this.goToTravelMenu(), () => this.goToStation(), () => this.goToCargo(),
    );
  }

  private goToCargo(): void {
    this.currentScene = new CargoScene(
      this.input, this.context, this.player, () => this.goToShip(),
    );
  }

  private goToTravelMenu(): void {
    this.currentScene = new TravelMenuScene(
      this.input, this.context, this.player,
      (id: string) => this.onDestinationSelected(id),
      (id: string) => this.onJumpSelected(id),
      () => this.goToFlyIntoSpace(),
      () => this.goToShip(),
    );
  }

  private goToArrival(): void {
    this.currentScene = new TravelMenuScene(
      this.input, this.context, this.player,
      (id: string) => this.onDestinationSelected(id),
      (id: string) => this.onJumpSelected(id),
      () => this.goToFlyIntoSpace(),
      () => this.goToShip(),
    );
  }

  private goToFlyIntoSpace(): void {
    this.player.undock();
    this.currentScene = new InSystemTravelAnimationScene('OPEN SPACE', () => this.goToShip(), 'LAUNCHING...');
  }

  private onDestinationSelected(destinationId: string): void {
    this.player.dock(destinationId);
    this.currentScene = new InSystemTravelAnimationScene(getDestination(destinationId)!.name, () => this.goToShip());
  }

  private onJumpSelected(targetSystemId: string): void {
    const route = getRoute(this.player.systemId, targetSystemId)!;
    const drive = getDrive(this.player.driveId)!;
    const used = Math.ceil(FUEL_PER_LY * route.distance * drive.fuelEfficiency);
    this.player.consumeFuel(used);
    this.player.jumpTo(targetSystemId);
    const targetName = getSystem(targetSystemId)!.name;
    this.currentScene = new JumpAnimationScene(targetName, () => this.goToArrival());
  }
}
