import { TerminalRenderer } from './src/platform/terminal/TerminalRenderer';
import { TerminalInputHandler } from './src/platform/terminal/TerminalInputHandler';
import { MainMenuScene } from './src/game/scenes/MainMenuScene';
import { StoryScene } from './src/game/scenes/StoryScene';
import { StationMenuScene } from './src/game/scenes/StationMenuScene';
import { TraderScene } from './src/game/scenes/TraderScene';
import { MissionBoardScene } from './src/game/scenes/MissionBoardScene';
import { ShipScene } from './src/game/scenes/ShipScene';
import type { GameContext, CharBuffer, Color, Scene } from './src/shared/types';

const context: GameContext = {
  environment: 'terminal',
  primaryInput: 'keyboard',
  debug: false,
};

const renderer = new TerminalRenderer();
const input = new TerminalInputHandler();

let currentScene: Scene;

const goToMainMenu = () => {
  currentScene = new MainMenuScene(input, context, goToStory);
};

const goToTrader = () => {
  currentScene = new TraderScene(input, context, goToStation, goToShip);
};

const goToMissionBoard = () => {
  currentScene = new MissionBoardScene(input, context, goToStation, goToShip);
};

const goToShip = () => {
  currentScene = new ShipScene(input, context, goToStation);
};

const goToStation = () => {
  currentScene = new StationMenuScene(input, context, goToTrader, goToMissionBoard, goToShip);
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
