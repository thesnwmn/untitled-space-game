import { TerminalRenderer } from './src/platform/terminal/terminal-renderer';
import { TerminalInputHandler } from './src/platform/terminal/terminal-input-handler';
import type { GameContext } from './src/shared/types';
import { initWorld } from './src/game/world/world-data';
import { loadWorldData } from './src/game/world/world-loader-terminal';
import { PlayerState } from './src/game/player-state';
import { miniGameDescriptors, miniGameRegistry } from './src/game/mini-games/registry';

initWorld(loadWorldData());

const args = process.argv.slice(2);
const gameId = args.find(arg => !arg.startsWith('--'));
const variantMatch = args.find(arg => arg.startsWith('--variant='));
const variantId = variantMatch?.split('=')[1];

if (!gameId || args.includes('--help')) {
  listGames();
  process.exit(0);
}

runGame(gameId, variantId);

function listGames(): void {
  if (miniGameDescriptors.length === 0) {
    console.log('No mini games registered.');
    return;
  }

  console.log('Available mini games:\n');
  for (const desc of miniGameDescriptors) {
    console.log(`${desc.id}`);
    console.log(`  ${desc.description}`);
  }
}

function runGame(gameId: string, variantId?: string): void {
  const entry = miniGameRegistry.find(e => e.meta.id === gameId);

  if (!entry) {
    console.error(`Error: mini game not found: ${gameId}`);
    process.exit(1);
  }

  let params: Record<string, string> = {};

  if (variantId) {
    const variant = entry.meta.variants?.find(v => v.id === variantId);
    if (variant) {
      params = variant.params;
    }
  }

  const context: GameContext = { environment: 'terminal', primaryInput: 'keyboard', debug: false };
  const renderer = new TerminalRenderer();
  const input = new TerminalInputHandler();
  const player = PlayerState.createMock();

  let completed = false;

  const scene = entry.factory(input, context, player, params, result => {
    completed = true;
    renderer.clear();
    input.disconnect?.();

    if (result.outcome === 'completed') {
      console.log(`Outcome: completed`);
      if (result.result && Object.keys(result.result).length > 0) {
        console.log(`Result: ${JSON.stringify(result.result)}`);
      }
    } else {
      console.log(`Outcome: ${result.outcome}`);
    }
  });

  input.connect();

  let lastTime = Date.now();

  const interval = setInterval(() => {
    const now = Date.now();
    scene.update(now - lastTime);
    lastTime = now;

    const w = renderer.getWidth();
    const h = renderer.getHeight();
    const buffer = Array.from({ length: h }, () =>
      Array.from({ length: w }, () => ({
        char: ' ',
        fg: 'black' as const,
        bg: 'black' as const,
      }))
    );

    scene.render(buffer);
    renderer.drawBuffer(buffer);

    if (completed) {
      clearInterval(interval);
      process.exit(0);
    }
  }, 33);

  process.stdin.on('close', () => {
    clearInterval(interval);
    process.exit(0);
  });
}
