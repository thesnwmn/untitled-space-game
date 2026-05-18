import { MainMenuScene } from './scenes/main-menu-scene';
import { GlobalMenuScene, type GlobalMenuEntry } from './scenes/global-menu-scene';
import { MissionLogScene } from './scenes/mission-log-scene';
import { ReputationScene } from './scenes/reputation-scene';
import { StoryScene } from './scenes/story-scene';
import { StationMenuScene } from './scenes/station-menu-scene';
import { TraderScene } from './scenes/trader-scene';
import { MissionBoardScene } from './scenes/mission-board-scene';
import { MissionDetailScene } from './scenes/mission-detail-scene';
import { ShipCockpitScene } from './scenes/ship-cockpit-scene';
import { CargoScene } from './scenes/cargo-scene';
import { TravelMenuScene } from './scenes/travel-menu-scene';
import { EmergencyRescueScene } from './scenes/emergency-rescue-scene';
import { GalaxyMapScene } from './scenes/galaxy-map-scene';
import { JumpAnimationScene } from './scenes/jump-animation-scene';
import { InSystemTravelAnimationScene } from './scenes/in-system-travel-animation-scene';
import { SurfaceLandingAnimationScene } from './scenes/surface-landing-animation-scene';
import { AsteroidLandingAnimationScene } from './scenes/asteroid-landing-animation-scene';
import { SurfaceTakeOffAnimationScene } from './scenes/surface-take-off-animation-scene';
import { AsteroidTakeOffAnimationScene } from './scenes/asteroid-take-off-animation-scene';
import { OrbitalDockingAnimationScene } from './scenes/orbital-docking-animation-scene';
import { OrbitalUndockingAnimationScene } from './scenes/orbital-undocking-animation-scene';
import type { CharBuffer, Color, GameContext, Renderer, InputHandler, Scene } from '../shared/types';
import type { TraderStockEntry, MissionSpec } from './world/types';
import { getGameSettings, getGameBalance, getSystem, getDestination, getShip, getDrive, getRoute, getCommodities, getCommodity, getWorld } from './world/world-data';
import { PlayerState } from './player-state';
import { generateMissions } from './mission-generator';

const MAX_DT = 100;

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
  private sceneBeforeMenu: Scene | null = null;
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
    const balance = getGameBalance();
    if (cached && now - cached.generatedAt < balance.trading.stockTtlMs) {
      return cached.entries;
    }
    const commodities = getCommodities();
    const { stockCountMin, stockCountMax, stockQtyMin, stockQtyMax } = balance.trading;
    const count = stockCountMin + Math.floor(Math.random() * (stockCountMax - stockCountMin + 1));
    const shuffled = [...commodities];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const entries: TraderStockEntry[] = shuffled.slice(0, count).map(c => ({
      commodityId: c.id,
      qty: stockQtyMin + Math.floor(Math.random() * (stockQtyMax - stockQtyMin + 1)),
    }));
    this.traderStockCache.set(destinationId, { entries, generatedAt: now });
    return entries;
  }

  private refreshDestinationMissions(destinationId: string): void {
    const destination = getDestination(destinationId)!;
    const worldData = getWorld();
    const specs = generateMissions(destination, worldData, 0);
    this.player.refreshDestinationMissions(destinationId, specs);
  }

  private onBuy(commodityId: string, qty: number, unitPrice: number, traderStock: TraderStockEntry[]): void {
    if (qty <= 0) return;
    const stockIdx = traderStock.findIndex(e => e.commodityId === commodityId);
    if (stockIdx < 0) return;

    const entry = traderStock[stockIdx];
    if (qty > entry.qty) return;

    const commodity = getCommodity(commodityId);
    if (!commodity) return;

    const totalCost = qty * unitPrice;
    if (this.player.credits < totalCost) return;

    const newWeight = this.player.cargoWeightKg + qty * commodity.weightKg;
    if (newWeight > this.player.cargoCapacity) return;

    this.player.spendCredits(totalCost);
    this.player.addCargo(commodityId, qty);
    entry.qty -= qty;
    if (entry.qty <= 0) traderStock.splice(stockIdx, 1);
  }

  private onSell(commodityId: string, qty: number, unitPrice: number, traderStock: TraderStockEntry[]): void {
    if (qty <= 0) return;
    const heldEntry = this.player.cargoHold.find(e => e.commodityId === commodityId);
    if (!heldEntry || heldEntry.qty < qty) return;

    const commodity = getCommodity(commodityId);
    if (!commodity) return;

    const totalValue = qty * unitPrice;
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
    const destinationId = this.player.destinationId!;
    this.refreshDestinationMissions(destinationId);
    this.currentScene = new StationMenuScene(
      this.input, this.context, this.player, destinationId,
      (cost: number, litres: number) => {
        this.player.spendCredits(cost);
        this.player.addFuel(litres);
        this.goToStation();
      },
      () => this.goToTrader(), () => this.goToMissionBoard(),
      () => this.goToStation(),
      () => this.goToTakeOffOrUndock(),
      () => this.goToGlobalMenu(),
    );
  }

  private goToLandOrDock(): void {
    const locationType = getDestination(this.player.destinationId!)?.locationType;
    if (locationType === 'surface') {
      this.currentScene = new SurfaceLandingAnimationScene(this.player, this.context, () => this.goToStation());
    } else if (locationType === 'asteroid') {
      this.currentScene = new AsteroidLandingAnimationScene(this.player, this.context, () => this.goToStation());
    } else {
      this.currentScene = new OrbitalDockingAnimationScene(this.player, this.context, () => this.goToStation());
    }
  }

  private goToTakeOffOrUndock(): void {
    const locationType = getDestination(this.player.destinationId!)?.locationType;
    if (locationType === 'surface') {
      this.currentScene = new SurfaceTakeOffAnimationScene(this.player, this.context, () => this.goToShip());
    } else if (locationType === 'asteroid') {
      this.currentScene = new AsteroidTakeOffAnimationScene(this.player, this.context, () => this.goToShip());
    } else {
      this.currentScene = new OrbitalUndockingAnimationScene(this.player, this.context, () => this.goToShip());
    }
  }

  private goToTrader(): void {
    const destinationId = this.player.destinationId!;
    const stock = this.getOrCreateTraderStock(destinationId);
    this.currentScene = new TraderScene(
      this.input, this.context, this.player, destinationId, stock,
      (commodityId, qty, unitPrice) => this.onBuy(commodityId, qty, unitPrice, stock),
      (commodityId, qty, unitPrice) => this.onSell(commodityId, qty, unitPrice, stock),
      () => this.goToStation(), () => this.goToTakeOffOrUndock(),
      () => this.goToGlobalMenu(),
    );
  }

  private goToMissionBoard(): void {
    const destinationId = this.player.destinationId!;
    const missions = this.player.getDestinationMissions(destinationId);
    this.currentScene = new MissionBoardScene(
      this.input, this.context, this.player, destinationId,
      missions,
      (spec) => this.goToMissionDetail(spec, destinationId),
      () => this.goToStation(),
      () => this.goToTakeOffOrUndock(),
      () => this.goToGlobalMenu(),
    );
  }

  private goToMissionDetail(spec: MissionSpec, boardDestinationId: string): void {
    this.currentScene = new MissionDetailScene(
      this.input, this.context, this.player, spec,
      (giveItemNow) => this.onMissionAccepted(spec, giveItemNow, boardDestinationId),
      () => this.goToMissionBoard(),
      () => this.goToStation(),
      () => this.goToTakeOffOrUndock(),
    );
  }

  private onMissionAccepted(spec: MissionSpec, giveItemNow: boolean, boardDestinationId: string): void {
    const missions = this.player.getDestinationMissions(boardDestinationId);
    const idx = missions.findIndex(s => s.id === spec.id);
    if (idx >= 0) {
      missions.splice(idx, 1);
      this.player.refreshDestinationMissions(boardDestinationId, missions);
    }
    this.player.acceptMission(spec, giveItemNow);
    this.goToMissionBoard();
  }

  private goToShip(): void {
    this.currentScene = new ShipCockpitScene(
      this.input, this.context, this.player,
      () => this.goToTravelMenu(), () => this.goToLandOrDock(), () => this.goToCargo(),
      () => this.goToGlobalMenu(),
    );
  }

  private goToCargo(): void {
    this.currentScene = new CargoScene(
      this.input, this.context, this.player, () => this.goToShip(),
      () => this.goToGlobalMenu(),
    );
  }

  private buildMenuEntries(): GlobalMenuEntry[] {
    return [
      { label: 'MISSIONS', action: () => this.goToMissionLog() },
      { label: 'REPUTATION', action: () => this.goToReputation() },
    ];
  }

  private goToMissionLog(): void {
    this.currentScene = new MissionLogScene(
      this.input, this.context, this.player,
      () => this.goToGlobalMenuFromSubScene(),
      () => this.returnFromMenu(),
    );
  }

  private goToReputation(): void {
    this.currentScene = new ReputationScene(
      this.input, this.context, this.player,
      () => this.goToGlobalMenuFromSubScene(),
      () => this.returnFromMenu(),
    );
  }

  private goToGlobalMenuFromSubScene(): void {
    this.currentScene = new GlobalMenuScene(
      this.input, this.context, this.player,
      this.buildMenuEntries(),
      () => this.returnFromMenu(),
    );
  }

  private goToGlobalMenu(): void {
    this.sceneBeforeMenu = this.currentScene;
    if ('suspend' in this.currentScene) (this.currentScene as { suspend(): void }).suspend();
    this.currentScene = new GlobalMenuScene(
      this.input, this.context, this.player,
      this.buildMenuEntries(),
      () => this.returnFromMenu(),
    );
  }

  private returnFromMenu(): void {
    const prior = this.sceneBeforeMenu;
    this.sceneBeforeMenu = null;
    if (prior !== null) {
      if ('resume' in prior) (prior as { resume(): void }).resume();
      this.currentScene = prior;
    } else {
      this.goToShip();
    }
  }

  private goToTravelMenu(): void {
    this.currentScene = new TravelMenuScene(
      this.input, this.context, this.player,
      (id: string) => this.onDestinationSelected(id),
      (id: string) => this.onJumpSelected(id),
      () => this.goToFlyIntoSpace(),
      () => this.goToShip(),
      () => this.goToGalaxyMap(),
      () => this.goToGlobalMenu(),
      () => this.goToEmergencyRescue(),
    );
  }

  private goToArrival(): void {
    this.currentScene = new TravelMenuScene(
      this.input, this.context, this.player,
      (id: string) => this.onDestinationSelected(id),
      (id: string) => this.onJumpSelected(id),
      () => this.goToFlyIntoSpace(),
      () => this.goToShip(),
      () => this.goToGalaxyMap(),
      () => this.goToGlobalMenu(),
      () => this.goToEmergencyRescue(),
    );
  }

  private goToGalaxyMap(): void {
    this.currentScene = new GalaxyMapScene(
      this.input, this.context, this.player,
      () => this.goToTravelMenu(),
      () => this.goToGlobalMenu(),
    );
  }

  private goToFlyIntoSpace(): void {
    const hopCost = this.player.getInSystemHopCost();
    this.player.consumeFuel(hopCost);
    this.player.undock();
    this.currentScene = new InSystemTravelAnimationScene(this.player, this.context, () => this.goToShip(), 'OPEN SPACE');
  }

  private onDestinationSelected(destinationId: string): void {
    const hopCost = this.player.getInSystemHopCost();
    this.player.consumeFuel(hopCost);
    this.player.dock(destinationId);
    this.currentScene = new InSystemTravelAnimationScene(this.player, this.context, () => this.goToShip());
  }

  private onJumpSelected(targetSystemId: string): void {
    const route = getRoute(this.player.systemId, targetSystemId)!;
    const drive = getDrive(this.player.driveId)!;
    const used = Math.ceil(getGameBalance().fuel.consumptionPerLy * route.distance * drive.fuelEfficiency);
    this.player.consumeFuel(used);
    this.player.jumpTo(targetSystemId);
    this.currentScene = new JumpAnimationScene(this.player, this.context, () => this.goToArrival());
  }

  private goToEmergencyRescue(): void {
    this.currentScene = new EmergencyRescueScene(
      this.input, this.context, this.player,
      (destinationId: string) => this.onEmergencyTow(destinationId),
      () => this.onEmergencyFuelDrop(),
      () => this.goToTravelMenu(),
    );
  }

  private onEmergencyTow(destinationId: string): void {
    const balance = getGameBalance();
    this.player.spendCredits(balance.emergencyRescue.towFee);
    this.player.dock(destinationId);
    this.currentScene = new InSystemTravelAnimationScene(this.player, this.context, () => this.goToShip());
  }

  private onEmergencyFuelDrop(): void {
    const balance = getGameBalance();
    this.player.spendCredits(balance.emergencyRescue.fuelDropFee);
    this.player.addFuel(balance.emergencyRescue.fuelDropLitres);
    this.goToTravelMenu();
  }
}
