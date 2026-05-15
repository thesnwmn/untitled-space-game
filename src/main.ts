import './platform/dom/colors.css';
import { DOMRenderer } from './platform/dom/dom-renderer';
import { DOMInputHandler } from './platform/dom/dom-input-handler';
import type { GameContext } from './shared/types';
import { Game } from './game/game';
import { initWorld } from './game/world/world-data';
import { loadWorldData } from './game/world/world-loader-browser';

initWorld(loadWorldData());

const primaryInput = navigator.maxTouchPoints > 0 ? 'touch' : 'keyboard';
const debug = new URLSearchParams(window.location.search).has('debug');

const context: GameContext = { environment: 'browser', primaryInput, debug };

const renderer = new DOMRenderer();
const input = new DOMInputHandler(context);
input.connect();

const game = new Game(renderer, input, context);

let lastTime = 0;

function loop(timestamp: number): void {
  game.tick(timestamp - lastTime);
  lastTime = timestamp;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
