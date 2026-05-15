import { TerminalRenderer } from './src/platform/terminal/TerminalRenderer';
import { TerminalInputHandler } from './src/platform/terminal/TerminalInputHandler';
import { MainMenuScene } from './src/game/scenes/MainMenuScene';
import { StoryScene } from './src/game/scenes/StoryScene';
import { StationMenuScene } from './src/game/scenes/StationMenuScene';
import { TraderScene } from './src/game/scenes/TraderScene';
import { MissionBoardScene } from './src/game/scenes/MissionBoardScene';
import { ShipScene } from './src/game/scenes/ShipScene';
import { TravelMenuScene } from './src/game/scenes/TravelMenuScene';
import { JumpAnimationScene } from './src/game/scenes/JumpAnimationScene';
import { InSystemTravelAnimationScene } from './src/game/scenes/InSystemTravelAnimationScene';
import type { GameContext, CharBuffer, Color, Scene } from './src/shared/types';
import { getGameSettings, getSystem, getDestination, getShip, getDrive, getRoute } from './src/game/world/world-data';
import { FUEL_PER_LY } from './src/game/constants';

const settings = getGameSettings();
const startingLocation = settings.startingLocation;
const ship = getShip(settings.startingShip)!;
const drive = getDrive(ship.defaultJumpDrive)!;

const context: GameContext = {
  environment: 'terminal',
  primaryInput: 'keyboard',
  debug: false,
  systemId: startingLocation.system,
  destinationId: startingLocation.destination,
  credits: settings.player.startingCredits,
};

const renderer = new TerminalRenderer();
const input = new TerminalInputHandler();

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
  currentScene = new StationMenuScene(
    input, context, currentDestinationId!,
    playerState.fuelL, playerState.fuelCapacityL, playerState.credits,
    (refuelCost: number) => {
      playerState.credits -= refuelCost;
      playerState.fuelL    = playerState.fuelCapacityL;
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

// Exit cleanly when stdin closes (e.g. piped from /dev/null during init checks)
process.stdin.on('close', () => process.exit(0));

input.connect();

let lastTime = Date.now();
setInterval(() => {
  const now = Date.now();
  const dt = Math.min(now - lastTime, 100);
  lastTime = now;

  const w = renderer.getWidth();
  const h = renderer.getHeight();
  const buffer: CharBuffer = Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );

  currentScene.update(dt);
  currentScene.render(buffer);
  renderer.drawBuffer(buffer);
}, 33);
