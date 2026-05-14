import './platform/dom/colors.css';
import { DOMRenderer } from './platform/dom/DOMRenderer';
import { DOMInputHandler } from './platform/dom/DOMInputHandler';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { StoryScene } from './game/scenes/StoryScene';
import { StationMenuScene } from './game/scenes/StationMenuScene';
import { TraderScene } from './game/scenes/TraderScene';
import { MissionBoardScene } from './game/scenes/MissionBoardScene';
import { ShipScene } from './game/scenes/ShipScene';
import { TravelMenuScene } from './game/scenes/TravelMenuScene';
import { JumpAnimationScene } from './game/scenes/JumpAnimationScene';
import { InSystemTravelAnimationScene } from './game/scenes/InSystemTravelAnimationScene';
import type { CharBuffer, Color, GameContext, Scene } from './shared/types';
import { getGameSettings, getSystem, getDestination } from './game/world/world-data';

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
