import './platform/dom/colors.css';
import { DOMRenderer } from './platform/dom/DOMRenderer';
import { DOMInputHandler } from './platform/dom/DOMInputHandler';
import type { CharBuffer, Color, GameContext } from './shared/types';

const primaryInput = navigator.maxTouchPoints > 0 ? 'touch' : 'keyboard';

const context: GameContext = {
  environment: 'browser',
  primaryInput,
};

const renderer = new DOMRenderer();
const input = new DOMInputHandler();
input.onAction((action) => console.log('GameAction:', action));
input.connect();

const COLORS: Color[] = [
  'black', 'red', 'green', 'yellow',
  'blue', 'magenta', 'cyan', 'white',
  'bright-black', 'bright-red', 'bright-green', 'bright-yellow',
  'bright-blue', 'bright-magenta', 'bright-cyan', 'bright-white',
];

function buildBuffer(): CharBuffer {
  const w = renderer.getWidth();
  const h = renderer.getHeight();
  return Array.from({ length: h }, (_, row) => {
    const fg = COLORS[row % COLORS.length];
    return Array.from({ length: w }, () => ({ char: '#', fg, bg: 'black' as Color }));
  });
}

renderer.drawBuffer(buildBuffer());

renderer.onResize(() => {
  renderer.drawBuffer(buildBuffer());
});

console.log(`Space game initialised — ${context.environment}/${context.primaryInput}`);
