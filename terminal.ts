import { TerminalRenderer } from './src/platform/terminal/terminal-renderer';
import { TerminalInputHandler } from './src/platform/terminal/terminal-input-handler';
import type { GameContext } from './src/shared/types';
import { Game } from './src/game/game';

const context: GameContext = { environment: 'terminal', primaryInput: 'keyboard', debug: false };

const renderer = new TerminalRenderer();
const input = new TerminalInputHandler();
const game = new Game(renderer, input, context);

process.stdin.on('close', () => process.exit(0));
input.connect();

let lastTime = Date.now();
setInterval(() => {
  const now = Date.now();
  game.tick(now - lastTime);
  lastTime = now;
}, 33);
