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
import { LandingResultScene } from './scenes/landing-result-scene';
import { NavigationEncounterOverlay } from './scenes/navigation-encounter-overlay';
import { miniGameRegistry } from './mini-games/registry';
import type { CharBuffer, Color, GameContext, Renderer, InputHandler, Scene, MiniGameResult } from '../shared/types';
import type { TraderStockEntry, MissionSpec, Commodity, GameBalance, StarSystem } from './world/types';
import { getGameSettings, getGameBalance, getSystem, getDestination, getShip, getDrive, getRoute, getCommodities, getCommodity, getWorld, getFaction, computeEffectiveFactor } from './world/world-data';
import { isReputationEligible, getReputationLevel } from './reputation-utils';
import { PlayerState } from './player-state';
import { generateMissions } from './mission-generator';

const MAX_DT = 100;

const LOCATION_TYPE_TO_REGISTRY_KEY: Record<string, string> = {
  'orbital': 'docking',
  'deep-space': 'docking',
  'surface': 'surface-landing',
  'asteroid': 'asteroid-landing',
};

export function computeMiniGameDamage(
  result: MiniGameResult,
  difficultyMultiplier: number,
  balance: { maxHullDamageFraction: number; abandonDamageFraction: number; noDamageThreshold: number },
): { damageFraction: number; score: number | null } {
  if (result.outcome === 'skipped') {
    return { damageFraction: balance.abandonDamageFraction * difficultyMultiplier, score: null };
  }
  const score = result.result.score as number;
  if (score >= balance.noDamageThreshold) {
    return { damageFraction: 0, score };
  }
  return {
    damageFraction: balance.maxHullDamageFraction * (1 - score / balance.noDamageThreshold) * difficultyMultiplier,
    score,
  };
}

export function getMiniGameOutcomeLabel(registryKey: string, score: number | null): string {
  const isDocking = registryKey === 'docking';
  if (score === null) return 'ABORTED';
  if (score < 40) return isDocking ? 'COLLISION' : 'CRASH';
  if (score < 70) return isDocking ? 'ROUGH DOCK' : 'HARD LANDING';
  if (score < 90) return isDocking ? 'DOCKED' : 'LANDED';
  return isDocking ? 'PERFECT DOCK' : 'PERFECT LANDING';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function generateTraderStock(
  commodities: Commodity[],
  repLevel: number,
  balance: GameBalance,
  system?: StarSystem,
): TraderStockEntry[] {
  const {
    stockCountMin, stockCountMax, stockQtyMin, stockQtyMax,
    stockRepCountBonusPerLevel, stockRepCountBonusMin, stockRepCountBonusMax,
    stockRepQtyBonusPerLevel, stockRepQtyBonusMin, stockRepQtyBonusMax,
  } = balance.trading;

  const countBonus = clamp(repLevel * stockRepCountBonusPerLevel, stockRepCountBonusMin, stockRepCountBonusMax);
  const qtyBonus = clamp(repLevel * stockRepQtyBonusPerLevel, stockRepQtyBonusMin, stockRepQtyBonusMax);

  const total = commodities.length;
  const adjCountMin = clamp(stockCountMin + countBonus, 1, total);
  const adjCountMax = clamp(stockCountMax + countBonus, 1, total);

  const count = adjCountMin + Math.floor(Math.random() * (adjCountMax - adjCountMin + 1));

  // Weight commodities by effective factor (inverse probability: lower factor = more likely)
  const weighted: Commodity[] = [];
  if (system) {
    for (const c of commodities) {
      const effectiveFactor = computeEffectiveFactor(c.id, system);
      const invFactor = 1.0 / effectiveFactor;
      // weight inversely: 0.75 factor → 1.33 weight; 1.25 factor → 0.8 weight
      const weight = Math.ceil(invFactor * 10); // scale to reasonable integers
      for (let i = 0; i < weight; i++) {
        weighted.push(c);
      }
    }
  } else {
    // fallback: uniform distribution
    weighted.push(...commodities);
  }

  // Fisher-Yates shuffle
  const shuffled = [...weighted];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const adjQtyMin = stockQtyMin + qtyBonus;
  const adjQtyMax = stockQtyMax + qtyBonus;

  const logScores = commodities.map(c => Math.log(c.basePrice * c.weightKg));
  const scoreMin = Math.min(...logScores);
  const scoreMax = Math.max(...logScores);
  const scoreRange = scoreMax - scoreMin;

  // Track selected commodities to avoid duplicates in output
  const selected: Map<string, TraderStockEntry> = new Map();
  for (const c of shuffled.slice(0, count)) {
    if (selected.has(c.id)) continue; // already selected
    const rawQty = adjQtyMin + Math.floor(Math.random() * (adjQtyMax - adjQtyMin + 1));
    let qtyFactor = 1.0;
    if (scoreRange > 0) {
      const t = (Math.log(c.basePrice * c.weightKg) - scoreMin) / scoreRange;
      qtyFactor = 1.5 - t; // cheapest/lightest (t=0) → 1.5×; most expensive/heavy (t=1) → 0.5×
    }
    const effectiveFactor = system ? computeEffectiveFactor(c.id, system) : 1.0;
    selected.set(c.id, {
      commodityId: c.id,
      qty: Math.max(1, Math.floor(rawQty * qtyFactor)),
      effectiveFactor,
    });
  }

  return Array.from(selected.values());
}

interface StockCache {
  entries: TraderStockEntry[];
  generatedAt: number;
  repLevel: number;
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

  private getOrCreateTraderStock(destinationId: string, repLevel: number): TraderStockEntry[] {
    const now = Date.now();
    const cached = this.traderStockCache.get(destinationId);
    const balance = getGameBalance();
    if (cached && cached.repLevel === repLevel && now - cached.generatedAt < balance.trading.stockTtlMs) {
      return cached.entries;
    }
    const destination = getDestination(destinationId);
    const system = destination ? getSystem(destination.system) : undefined;
    const entries = generateTraderStock(getCommodities(), repLevel, balance, system);
    this.traderStockCache.set(destinationId, { entries, generatedAt: now, repLevel });
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
    const destination = getDestination(this.player.destinationId!);
    const locationType = destination?.locationType;
    const registryKey = locationType ? LOCATION_TYPE_TO_REGISTRY_KEY[locationType] : undefined;
    const registryEntry = registryKey ? miniGameRegistry.find(e => e.meta.id === registryKey) : undefined;

    if (registryKey && registryEntry) {
      const difficultyMultiplier = destination?.difficultyMultiplier ?? 1.0;
      const balance = getGameBalance();
      this.currentScene = registryEntry.factory(
        this.input, this.context, this.player, {},
        (result) => {
          const { damageFraction, score } = computeMiniGameDamage(result, difficultyMultiplier, balance.miniGames);
          if (damageFraction > 0) {
            this.player.applyHullDamage(damageFraction);
          }
          const outcomeLabel = getMiniGameOutcomeLabel(registryKey, score);
          this.currentScene = new LandingResultScene(
            this.input, this.player, this.context,
            outcomeLabel, score, damageFraction,
            () => this.goToStation(),
          );
        },
      );
    } else if (locationType === 'surface') {
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
    const dest = getDestination(destinationId)!;
    let repLevel = 0;
    if (dest.owningFactionId) {
      const faction = getFaction(dest.owningFactionId);
      if (faction && isReputationEligible(faction)) {
        const balance = getGameBalance();
        const points = this.player.getFactionReputation(dest.owningFactionId);
        repLevel = getReputationLevel(points, balance);
      }
    }
    const stock = this.getOrCreateTraderStock(destinationId, repLevel);
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
      { label: 'GALAXY MAP', action: () => this.goToGalaxyMapFromMenu() },
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

  private goToGalaxyMapFromMenu(): void {
    this.currentScene = new GalaxyMapScene(
      this.input, this.context, this.player,
      () => this.goToGlobalMenu(),
      () => this.goToGlobalMenu(),
      () => this.returnFromMenu(),
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
    this.currentScene = new JumpAnimationScene(this.player, this.context, () => this.maybeNavigationEncounter(() => this.goToArrival()));
  }

  private maybeNavigationEncounter(onComplete: () => void): void {
    const balance = getGameBalance();
    const encounterChance = balance.navigationEncounter.encounterChanceOnJump;

    if (Math.random() > encounterChance) {
      onComplete();
      return;
    }

    const encounterTypes = ['asteroid_belt', 'space_debris', 'space_storm'] as const;
    const encounterType = encounterTypes[Math.floor(Math.random() * encounterTypes.length)];

    const system = getSystem(this.player.systemId)!;
    const difficulty = this.getDifficultyFromDangerLevel(system.dangerLevel);

    const shipScene = new ShipCockpitScene(
      this.input, this.context, this.player,
      () => this.goToTravelMenu(),
      () => this.goToShip(),
      () => this.goToCargo(),
      () => this.goToGlobalMenu(),
    );

    const overlay = new NavigationEncounterOverlay({
      encounterType,
      context: this.context,
      onBegin: () => this.playNavigationMiniGame(encounterType, difficulty, onComplete),
    });

    shipScene.setOverlay(overlay);
    this.currentScene = shipScene;
  }

  private getDifficultyFromDangerLevel(dangerLevel: string): 'easy' | 'normal' | 'hard' {
    switch (dangerLevel) {
      case 'none':
      case 'low':
        return 'easy';
      case 'medium':
        return 'normal';
      case 'high':
      case 'extreme':
        return 'hard';
      default:
        return 'normal';
    }
  }

  private playNavigationMiniGame(
    encounterType: 'asteroid_belt' | 'space_debris' | 'space_storm',
    difficulty: 'easy' | 'normal' | 'hard',
    onComplete: () => void,
  ): void {
    const params = { type: encounterType, difficulty };
    const miniGameEntry = miniGameRegistry.find((entry) => entry.meta.id === 'navigation');
    if (!miniGameEntry) {
      onComplete();
      return;
    }

    this.currentScene = miniGameEntry.factory(this.input, this.context, this.player, params, (result) => {
      this.handleNavigationMiniGameResult(result, difficulty, onComplete);
    });
  }

  private handleNavigationMiniGameResult(
    result: MiniGameResult,
    difficulty: 'easy' | 'normal' | 'hard',
    onComplete: () => void,
  ): void {
    const balance = getGameBalance();
    const difficultyMultiplier = difficulty === 'hard' ? 1.25 : 1.0;

    let outcomeLabel: string;
    let damageFraction: number;
    let score: number | null;

    if (result.outcome === 'skipped') {
      outcomeLabel = 'ABORTED';
      damageFraction = balance.miniGames.abandonDamageFraction * difficultyMultiplier;
      score = null;
    } else {
      const finalScore = (result.result.score as number) || 0;
      score = finalScore;

      if (finalScore >= balance.miniGames.noDamageThreshold) {
        outcomeLabel = 'CLEAR';
        damageFraction = 0;
      } else {
        outcomeLabel = 'COLLISION';
        damageFraction =
          balance.miniGames.maxHullDamageFraction *
          (1 - finalScore / balance.miniGames.noDamageThreshold) *
          difficultyMultiplier;
      }
    }

    if (damageFraction > 0) {
      this.player.applyHullDamage(damageFraction);
    }

    this.currentScene = new LandingResultScene(
      this.input,
      this.player,
      this.context,
      outcomeLabel,
      score,
      damageFraction,
      () => onComplete(),
    );
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
