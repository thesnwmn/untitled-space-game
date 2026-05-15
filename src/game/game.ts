import { MainMenuScene } from './scenes/main-menu-scene';
import { StoryScene } from './scenes/story-scene';
import { StationMenuScene } from './scenes/station-menu-scene';
import { TraderScene } from './scenes/trader-scene';
import { MissionBoardScene } from './scenes/mission-board-scene';
import { ShipScene } from './scenes/ship-scene';
import { TravelMenuScene } from './scenes/travel-menu-scene';
import { JumpAnimationScene } from './scenes/jump-animation-scene';
import { InSystemTravelAnimationScene } from './scenes/in-system-travel-animation-scene';
import type { CharBuffer, Color, GameContext, Renderer, InputHandler, Scene } from '../shared/types';
import { getGameSettings, getSystem, getDestination, getShip, getDrive, getRoute } from './world/world-data';
import { PlayerState } from './PlayerState';
import { FUEL_PER_LY } from './constants';

const MAX_DT = 100;

export class Game {
  private readonly renderer: Renderer;
  private readonly input: InputHandler;
  private readonly context: GameContext;
  private readonly player: PlayerState;
  private currentScene: Scene;

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

  private goToMainMenu(): void {
    this.currentScene = new MainMenuScene(this.input, this.context, this.player, () => this.goToStory());
  }

  private goToStory(): void {
    this.currentScene = new StoryScene(this.input, this.context, this.player, () => this.goToStation());
  }

  private goToStation(): void {
    this.currentScene = new StationMenuScene(
      this.input, this.context, this.player, this.player.destinationId!,
      (litres: number, refuelCost: number) => {
        this.player.spendCredits(refuelCost);
        this.player.addFuel(litres);
        this.goToStation();
      },
      () => this.goToTrader(), () => this.goToMissionBoard(), () => this.goToShip(),
    );
  }

  private goToTrader(): void {
    this.currentScene = new TraderScene(
      this.input, this.context, this.player, this.player.destinationId!,
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
      () => this.goToTravelMenu(), () => this.goToStation(),
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
