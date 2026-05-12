import './platform/dom/colors.css';
import { DOMRenderer } from './platform/dom/DOMRenderer';
import { DOMInputHandler } from './platform/dom/DOMInputHandler';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import type { CharBuffer, Color, GameContext } from './shared/types';

const primaryInput = navigator.maxTouchPoints > 0 ? 'touch' : 'keyboard';

const context: GameContext = {
  environment: 'browser',
  primaryInput,
};

const renderer = new DOMRenderer();
const input = new DOMInputHandler();
input.connect();

const scene = new MainMenuScene(input, context);

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
  scene.update(dt);
  scene.render(buffer);
  renderer.drawBuffer(buffer);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
