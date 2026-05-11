import './platform/dom/colors.css';
import { DOMRenderer } from './platform/dom/DOMRenderer';
import { DOMInputHandler } from './platform/dom/DOMInputHandler';
import type { CharBuffer, Color, GameContext } from './shared/types';
import { GRID_WIDTH, GRID_HEIGHT } from './shared/types';

const primaryInput = navigator.maxTouchPoints > 0 ? 'touch' : 'keyboard';

const context: GameContext = {
  environment: 'browser',
  primaryInput,
};

const renderer = new DOMRenderer();
const _input = new DOMInputHandler();

const COLORS: Color[] = [
  'black', 'red', 'green', 'yellow',
  'blue', 'magenta', 'cyan', 'white',
  'bright-black', 'bright-red', 'bright-green', 'bright-yellow',
  'bright-blue', 'bright-magenta', 'bright-cyan', 'bright-white',
];

const buffer: CharBuffer = Array.from({ length: GRID_HEIGHT }, (_, row) => {
  const fg = COLORS[row % COLORS.length];
  return Array.from({ length: GRID_WIDTH }, () => ({ char: '#', fg, bg: 'black' as Color }));
});

renderer.drawBuffer(buffer);

console.log(`Space game initialised — ${context.environment}/${context.primaryInput}`);
