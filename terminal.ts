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
import { getGameSettings, getSystem, getDestination } from './src/game/world/world-data';

const context: GameContext = {
  environment: 'terminal',
  primaryInput: 'keyboard',
  debug: false,
};

const renderer = new TerminalRenderer();
const input = new TerminalInputHandler();

const startingLocation = getGameSettings().startingLocation;
let currentSystemId = startingLocation.system;
let currentDestinationId = startingLocation.destination;

let currentScene: Scene;

const goToMainMenu = () => {
  currentScene = new MainMenuScene(input, context, goToStory);
};

const goToTrader = () => {
  currentScene = new TraderScene(input, context, currentDestinationId, goToStation, goToShip);
};

const goToMissionBoard = () => {
  currentScene = new MissionBoardScene(input, context, currentDestinationId, goToStation, goToShip);
};

const goToShip = () => {
  currentScene = new ShipScene(input, context, currentDestinationId, goToTravelMenu, goToStation);
};

const goToStation = () => {
  currentScene = new StationMenuScene(input, context, currentDestinationId, goToTrader, goToMissionBoard, goToShip);
};

const onDestinationSelected = (destinationId: string) => {
  const destName = getDestination(destinationId)!.name;
  currentDestinationId = destinationId;
  currentScene = new InSystemTravelAnimationScene(destName, goToStation);
};

const onJumpSelected = (targetSystemId: string) => {
  currentSystemId = targetSystemId;
  const targetName = getSystem(targetSystemId)!.name;
  currentScene = new JumpAnimationScene(targetName, goToArrival);
};

const goToTravelMenu = () => {
  currentScene = new TravelMenuScene(
    input, context, currentSystemId, currentDestinationId,
    onDestinationSelected, onJumpSelected, goToShip,
  );
};

const goToArrival = () => {
  currentScene = new TravelMenuScene(
    input, context, currentSystemId, null,
    onDestinationSelected, onJumpSelected, null,
  );
};

const goToStory = () => {
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
