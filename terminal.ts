import { TerminalRenderer } from './src/platform/terminal/TerminalRenderer';
import { TerminalInputHandler } from './src/platform/terminal/TerminalInputHandler';
import type { GameContext } from './src/shared/types';

const context: GameContext = {
  environment: 'terminal',
  primaryInput: 'keyboard',
};

const renderer = new TerminalRenderer();
const input = new TerminalInputHandler();

console.log(`Space game initialised — ${context.environment}/${context.primaryInput}`);
console.log(`Grid: ${renderer.getWidth()}×${renderer.getHeight()}`);

input.onAction(action => console.log(`GameAction: ${action}`));
input.connect();
