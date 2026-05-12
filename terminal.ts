import { TerminalRenderer } from './src/platform/terminal/TerminalRenderer';
import { TerminalInputHandler } from './src/platform/terminal/TerminalInputHandler';
import { MainMenuScene } from './src/game/scenes/MainMenuScene';
import { StoryScene } from './src/game/scenes/StoryScene';
import type { GameContext, CharBuffer, Color, Scene } from './src/shared/types';

const context: GameContext = {
  environment: 'terminal',
  primaryInput: 'keyboard',
};

const renderer = new TerminalRenderer();
const input = new TerminalInputHandler();

let currentScene: Scene;

const goToStory = () => {
  currentScene = new StoryScene(input, context, () => {
    console.log('[Story] Arriving at Elysium Station…');
  });
};

currentScene = new MainMenuScene(input, context, goToStory);

// Exit cleanly when stdin closes (e.g. piped from /dev/null during init checks)
process.stdin.on('close', () => process.exit(0));

input.connect();

let lastTime = Date.now();
setInterval(() => {
  const now = Date.now();
  const dt = now - lastTime;
  lastTime = now;

  const w = renderer.getWidth();
  const h = renderer.getHeight();
  const buffer: CharBuffer = Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );

  currentScene.update(dt);
  currentScene.render(buffer);
  renderer.drawBuffer(buffer);
}, 33);
