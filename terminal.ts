import { TerminalRenderer } from './src/platform/terminal/terminal-renderer';
import { TerminalInputHandler } from './src/platform/terminal/terminal-input-handler';
import { MainMenuScene } from './src/game/scenes/main-menu-scene';
import { StoryScene } from './src/game/scenes/story-scene';
import { StationMenuScene } from './src/game/scenes/station-menu-scene';
import { TraderScene } from './src/game/scenes/trader-scene';
import { MissionBoardScene } from './src/game/scenes/mission-board-scene';
import { ShipScene } from './src/game/scenes/ship-scene';
import { TravelMenuScene } from './src/game/scenes/travel-menu-scene';
import { JumpAnimationScene } from './src/game/scenes/jump-animation-scene';
import { InSystemTravelAnimationScene } from './src/game/scenes/in-system-travel-animation-scene';
import type { GameContext, CharBuffer, Color, Scene } from './src/shared/types';
import { getGameSettings, getSystem, getDestination, getShip, getDrive, getRoute } from './src/game/world/world-data';
import { PlayerState } from './src/game/PlayerState';
import { FUEL_PER_LY } from './src/game/constants';

const settings = getGameSettings();
const startingLocation = settings.startingLocation;
const ship = getShip(settings.startingShip)!;

const context: GameContext = {
  environment: 'terminal',
  primaryInput: 'keyboard',
  debug: false,
};

const player = new PlayerState({
  shipId: settings.startingShip,
  driveId: ship.defaultJumpDrive,
  credits: settings.player.startingCredits,
  systemId: startingLocation.system,
  destinationId: startingLocation.destination,
});

const renderer = new TerminalRenderer();
const input = new TerminalInputHandler();

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
