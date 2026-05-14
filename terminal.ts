import { TerminalRenderer } from './src/platform/terminal/TerminalRenderer';
import { TerminalInputHandler } from './src/platform/terminal/TerminalInputHandler';
import { MainMenuScene } from './src/game/scenes/MainMenuScene';
import { StoryScene } from './src/game/scenes/StoryScene';
import { StationMenuScene } from './src/game/scenes/StationMenuScene';
import { TraderScene } from './src/game/scenes/TraderScene';
import { MissionBoardScene } from './src/game/scenes/MissionBoardScene';
import { ShipScene } from './src/game/scenes/ShipScene';
import { JumpMenuScene } from './src/game/scenes/JumpMenuScene';
import { JumpAnimationScene } from './src/game/scenes/JumpAnimationScene';
import { SystemArrivalScene } from './src/game/scenes/SystemArrivalScene';
import type { GameContext, CharBuffer, Color, Scene } from './src/shared/types';
import { getGameSettings, getSystem } from './src/game/world/world-data';

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
  currentScene = new ShipScene(input, context, currentDestinationId, goToJumpMenu, goToStation);
};

const goToStation = () => {
  currentScene = new StationMenuScene(input, context, currentDestinationId, goToTrader, goToMissionBoard, goToShip);
};

const goToJumpMenu = () => {
  currentScene = new JumpMenuScene(input, context, currentSystemId, onJumpSelected, goToShip);
};

const onJumpSelected = (targetSystemId: string) => {
  currentSystemId = targetSystemId;
  const targetName = getSystem(targetSystemId)!.name;
  currentScene = new JumpAnimationScene(targetName, goToSystemArrival);
};

const goToSystemArrival = () => {
  currentScene = new SystemArrivalScene(input, context, currentSystemId, onDockSelected);
};

const onDockSelected = (destinationId: string) => {
  currentDestinationId = destinationId;
  goToStation();
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
