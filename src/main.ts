import { DOMRenderer } from './platform/dom/DOMRenderer';
import { DOMInputHandler } from './platform/dom/DOMInputHandler';
import type { GameContext } from './shared/types';

const primaryInput = navigator.maxTouchPoints > 0 ? 'touch' : 'keyboard';

const context: GameContext = {
  environment: 'browser',
  primaryInput,
};

const _renderer = new DOMRenderer();
const _input = new DOMInputHandler();

console.log(`Space game initialised — ${context.environment}/${context.primaryInput}`);
