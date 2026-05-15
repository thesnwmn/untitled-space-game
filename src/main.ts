import './platform/dom/colors.css';
import { DOMRenderer } from './platform/dom/dom-renderer';
import { DOMInputHandler } from './platform/dom/dom-input-handler';
import { MainMenuScene } from './game/scenes/main-menu-scene';
import { StoryScene } from './game/scenes/story-scene';
import { StationMenuScene } from './game/scenes/station-menu-scene';
import { TraderScene } from './game/scenes/trader-scene';
import { MissionBoardScene } from './game/scenes/mission-board-scene';
import { ShipScene } from './game/scenes/ship-scene';
import { TravelMenuScene } from './game/scenes/travel-menu-scene';
import { JumpAnimationScene } from './game/scenes/jump-animation-scene';
import { InSystemTravelAnimationScene } from './game/scenes/in-system-travel-animation-scene';
import type { CharBuffer, Color, GameContext, Scene } from './shared/types';
import { getGameSettings, getSystem, getDestination, getShip, getDrive, getRoute } from './game/world/world-data';
import { PlayerState } from './game/PlayerState';
import { FUEL_PER_LY } from './game/constants';

const primaryInput = navigator.maxTouchPoints > 0 ? 'touch' : 'keyboard';
const debug = new URLSearchParams(window.location.search).has('debug');

const settings = getGameSettings();
const startingLocation = settings.startingLocation;
const ship = getShip(settings.startingShip)!;

const context: GameContext = {
  environment: 'browser',
  primaryInput,
  debug,
};

const player = new PlayerState({
  shipId: settings.startingShip,
  driveId: ship.defaultJumpDrive,
  credits: settings.player.startingCredits,
  systemId: startingLocation.system,
  destinationId: startingLocation.destination,
});

const renderer = new DOMRenderer();
const input = new DOMInputHandler(context);
input.connect();

let currentScene: Scene;

const goToMainMenu = () => {
  currentScene = new MainMenuScene(input, context, player, goToStory);
};

const goToTrader = () => {
  currentScene = new TraderScene(input, context, player, player.destinationId!, goToStation, goToShip);
};

const goToMissionBoard = () => {
  currentScene = new MissionBoardScene(input, context, player, player.destinationId!, goToStation, goToShip);
};

const goToShip = () => {
  currentScene = new ShipScene(input, context, player, goToTravelMenu, goToStation);
};

const goToStation = () => {
  currentScene = new StationMenuScene(
    input, context, player, player.destinationId!,
    (litres: number, refuelCost: number) => {
      player.spendCredits(refuelCost);
      player.addFuel(litres);
      goToStation();
    },
    goToTrader, goToMissionBoard, goToShip,
  );
};

const onDestinationSelected = (destinationId: string) => {
  player.dock(destinationId);
  currentScene = new InSystemTravelAnimationScene(getDestination(destinationId)!.name, goToShip);
};

const goToFlyIntoSpace = () => {
  player.undock();
  currentScene = new InSystemTravelAnimationScene('OPEN SPACE', goToShip, 'LAUNCHING...');
};

const onJumpSelected = (targetSystemId: string) => {
  const route = getRoute(player.systemId, targetSystemId)!;
  const drive = getDrive(player.driveId)!;
  const used  = Math.ceil(FUEL_PER_LY * route.distance * drive.fuelEfficiency);
  player.consumeFuel(used);
  player.jumpTo(targetSystemId);
  const targetName = getSystem(targetSystemId)!.name;
  currentScene = new JumpAnimationScene(targetName, goToArrival);
};

const goToTravelMenu = () => {
  currentScene = new TravelMenuScene(
    input, context, player,
    onDestinationSelected, onJumpSelected, goToFlyIntoSpace, goToShip,
  );
};

const goToArrival = () => {
  currentScene = new TravelMenuScene(
    input, context, player,
    onDestinationSelected, onJumpSelected, goToFlyIntoSpace, goToShip,
  );
};

const goToStory = () => {
  currentScene = new StoryScene(input, context, player, goToStation);
};

currentScene = new MainMenuScene(input, context, player, goToStory);

let lastTime = 0;

function makeBuffer(): CharBuffer {
  const w = renderer.getWidth();
  const h = renderer.getHeight();
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

const MAX_DT = 100;

function loop(timestamp: number): void {
  const dt = Math.min(timestamp - lastTime, MAX_DT);
  lastTime = timestamp;

  const buffer = makeBuffer();
  currentScene.update(dt);
  currentScene.render(buffer);
  renderer.drawBuffer(buffer);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
