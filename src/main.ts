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
import { FUEL_PER_LY } from './game/constants';

const primaryInput = navigator.maxTouchPoints > 0 ? 'touch' : 'keyboard';
const debug = new URLSearchParams(window.location.search).has('debug');

const settings = getGameSettings();
const startingLocation = settings.startingLocation;
const ship = getShip(settings.startingShip)!;
const drive = getDrive(ship.defaultJumpDrive)!;

const context: GameContext = {
  environment: 'browser',
  primaryInput,
  debug,
  systemId: startingLocation.system,
  destinationId: startingLocation.destination,
  credits: settings.player.startingCredits,
};

const renderer = new DOMRenderer();
const input = new DOMInputHandler(context);
input.connect();

let currentSystemId = startingLocation.system;
let currentDestinationId: string | null = startingLocation.destination;

const playerState = {
  fuelL:         ship.fuelCapacityL,
  fuelCapacityL: ship.fuelCapacityL,
  driveId:       ship.defaultJumpDrive,
  cargo:         0,
  cargoCapacity: ship.cargoCapacityKg,
  credits:       settings.player.startingCredits,
};

let currentScene: Scene;

const goToMainMenu = () => {
  context.systemId = currentSystemId;
  context.destinationId = currentDestinationId;
  currentScene = new MainMenuScene(input, context, goToStory);
};

const goToTrader = () => {
  context.systemId = currentSystemId;
  context.destinationId = currentDestinationId;
  currentScene = new TraderScene(input, context, currentDestinationId!, goToStation, goToShip);
};

const goToMissionBoard = () => {
  context.systemId = currentSystemId;
  context.destinationId = currentDestinationId;
  currentScene = new MissionBoardScene(input, context, currentDestinationId!, goToStation, goToShip);
};

const goToShip = () => {
  context.systemId = currentSystemId;
  context.destinationId = currentDestinationId;
  currentScene = new ShipScene(
    input, context,
    currentSystemId, currentDestinationId,
    playerState,
    goToTravelMenu, goToStation,
  );
};

const goToStation = () => {
  context.systemId = currentSystemId;
  context.destinationId = currentDestinationId;
  context.credits = playerState.credits;
  currentScene = new StationMenuScene(
    input, context, currentDestinationId!,
    playerState.fuelL, playerState.fuelCapacityL, playerState.credits,
    (litres: number, refuelCost: number) => {
      playerState.credits -= refuelCost;
      playerState.fuelL    = Math.min(playerState.fuelCapacityL, playerState.fuelL + litres);
      goToStation();
    },
    goToTrader, goToMissionBoard, goToShip,
  );
};

const onDestinationSelected = (destinationId: string) => {
  currentDestinationId = destinationId;
  currentScene = new InSystemTravelAnimationScene(getDestination(destinationId)!.name, goToShip);
};

const goToFlyIntoSpace = () => {
  currentDestinationId = null;
  currentScene = new InSystemTravelAnimationScene('OPEN SPACE', goToShip, 'LAUNCHING...');
};

const onJumpSelected = (targetSystemId: string) => {
  const route = getRoute(currentSystemId, targetSystemId)!;
  const used  = Math.ceil(FUEL_PER_LY * route.distance * drive.fuelEfficiency);
  playerState.fuelL = Math.max(0, playerState.fuelL - used);

  currentSystemId = targetSystemId;
  const targetName = getSystem(targetSystemId)!.name;
  currentScene = new JumpAnimationScene(targetName, goToArrival);
};

const goToTravelMenu = () => {
  context.systemId = currentSystemId;
  context.destinationId = currentDestinationId;
  currentScene = new TravelMenuScene(
    input, context,
    currentSystemId, currentDestinationId,
    playerState.fuelL, playerState.fuelCapacityL, playerState.driveId,
    onDestinationSelected, onJumpSelected, goToFlyIntoSpace, goToShip,
  );
};

const goToArrival = () => {
  currentDestinationId = null;
  context.systemId = currentSystemId;
  context.destinationId = null;
  currentScene = new TravelMenuScene(
    input, context,
    currentSystemId, null,
    playerState.fuelL, playerState.fuelCapacityL, playerState.driveId,
    onDestinationSelected, onJumpSelected, goToFlyIntoSpace, goToShip,
  );
};

const goToStory = () => {
  context.systemId = currentSystemId;
  context.destinationId = currentDestinationId;
  currentScene = new StoryScene(input, context, goToStation);
};

currentScene = new MainMenuScene(input, context, goToStory);

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
