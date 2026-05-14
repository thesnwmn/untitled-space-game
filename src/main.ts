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
import { getGameSettings } from './game/world/world-data';

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

const STARTING_DESTINATION = getGameSettings().startingLocation.destination;

let currentScene: Scene;

const goToMainMenu = () => {
  currentScene = new MainMenuScene(input, context, goToStory);
};

const goToTrader = () => {
  currentScene = new TraderScene(input, context, STARTING_DESTINATION, goToStation, goToShip);
};

const goToMissionBoard = () => {
  currentScene = new MissionBoardScene(input, context, STARTING_DESTINATION, goToStation, goToShip);
};

const goToShip = () => {
  currentScene = new ShipScene(input, context, STARTING_DESTINATION, goToStation);
};

const goToStation = () => {
  currentScene = new StationMenuScene(input, context, STARTING_DESTINATION, goToTrader, goToMissionBoard, goToShip);
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

const MAX_DT = 100; // cap large gaps caused by tab resume / background throttling

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
