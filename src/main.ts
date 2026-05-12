import './platform/dom/colors.css';
import { DOMRenderer } from './platform/dom/DOMRenderer';
import { DOMInputHandler } from './platform/dom/DOMInputHandler';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { StoryScene } from './game/scenes/StoryScene';
import { StationMenuScene } from './game/scenes/StationMenuScene';
import { TraderScene } from './game/scenes/TraderScene';
import { MissionBoardScene } from './game/scenes/MissionBoardScene';
import { ShipScene } from './game/scenes/ShipScene';
import type { CharBuffer, Color, GameContext, Scene } from './shared/types';

const primaryInput = navigator.maxTouchPoints > 0 ? 'touch' : 'keyboard';
const debug = new URLSearchParams(window.location.search).has('debug');

const context: GameContext = {
  environment: 'browser',
  primaryInput,
  debug,
};

const renderer = new DOMRenderer();
const input = new DOMInputHandler(context);
input.connect();

let currentScene: Scene;

const goToMainMenu = () => {
  currentScene = new MainMenuScene(input, context, goToStory);
};

const goToTrader = () => {
  currentScene = new TraderScene(input, context, goToStation);
};

const goToMissionBoard = () => {
  currentScene = new MissionBoardScene(input, context, goToStation);
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

let lastTime = 0;

function makeBuffer(): CharBuffer {
  const w = renderer.getWidth();
  const h = renderer.getHeight();
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

function loop(timestamp: number): void {
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  const buffer = makeBuffer();
  currentScene.update(dt);
  currentScene.render(buffer);
  renderer.drawBuffer(buffer);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
