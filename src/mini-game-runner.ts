import './platform/dom/colors.css';
import { DOMRenderer } from './platform/dom/dom-renderer';
import { DOMInputHandler } from './platform/dom/dom-input-handler';
import type { GameContext, MiniGameResult } from './shared/types';
import { initWorld } from './game/world/world-data';
import { loadWorldData } from './game/world/world-loader-browser';
import { PlayerState } from './game/player-state';
import { miniGameDescriptors, miniGameRegistry } from './game/mini-games/registry';

initWorld(loadWorldData());

const primaryInput = navigator.maxTouchPoints > 0 ? 'touch' : 'keyboard';
const context: GameContext = { environment: 'browser', primaryInput, debug: false };

const params = new URLSearchParams(window.location.search);
const gameId = params.get('game');

if (!gameId) {
  showIndex();
} else {
  runGame(gameId, params);
}

function showIndex(): void {
  const root = document.getElementById('root');
  if (!root) return;

  let html = '<div style="padding: 2em; font-family: \'Share Tech Mono\', monospace; color: #aaa; background: #000; width: 100%;">';
  html += '<h1 style="color: #0f0; margin-bottom: 1em;">Mini Games</h1>';

  if (miniGameDescriptors.length === 0) {
    html += '<p>No mini games registered yet.</p>';
  } else {
    html += '<ul style="list-style: none; padding: 0;">';
    for (const desc of miniGameDescriptors) {
      html += `<li style="margin-bottom: 1.5em; padding: 1em; border: 1px solid #444;">`;
      html += `<div style="color: #0f0; font-weight: bold; margin-bottom: 0.5em;">${escapeHtml(desc.name)}</div>`;
      html += `<div style="color: #888; margin-bottom: 0.5em;">${escapeHtml(desc.description)}</div>`;
      html += '<div>';

      if (!desc.variants || desc.variants.length === 0) {
        html += `<a href="?game=${encodeURIComponent(desc.id)}" style="color: #0f0; text-decoration: none; border: 1px solid #0f0; padding: 0.5em 1em; display: inline-block;">PLAY</a>`;
      } else {
        for (const variant of desc.variants) {
          const variantParams = new URLSearchParams({ game: desc.id });
          for (const [k, v] of Object.entries(variant.params)) {
            variantParams.set(k, v);
          }
          html += `<a href="?${variantParams.toString()}" style="color: #0f0; text-decoration: none; border: 1px solid #0f0; padding: 0.5em 1em; display: inline-block; margin-right: 0.5em; margin-bottom: 0.5em;">${escapeHtml(variant.label)}</a>`;
        }
      }

      html += '</div></li>';
    }
    html += '</ul>';
  }

  html += '</div>';
  root.innerHTML = html;
}

function runGame(id: string, params: URLSearchParams): void {
  const entry = miniGameRegistry.find(e => e.meta.id === id);

  if (!entry) {
    showError(`Mini game not found: ${escapeHtml(id)}`);
    return;
  }

  const root = document.getElementById('root');
  if (!root) return;

  // Hide the root container so only the game's <pre> is visible as a flex child
  root.style.display = 'none';

  const renderer = new DOMRenderer();
  const input = new DOMInputHandler(context);
  input.connect();

  const player = PlayerState.createMock();

  const scene = entry.factory(input, context, player, params, handleComplete);

  let lastTime = 0;
  let stopped = false;

  function handleComplete(result: MiniGameResult): void {
    stopped = true;
    input.disconnect?.();
    renderer.destroy();
    root!.style.display = '';
    showResult(id, result);
  }

  function loop(timestamp: number): void {
    if (stopped) return;
    if (lastTime === 0) lastTime = timestamp;
    scene.update(timestamp - lastTime);
    lastTime = timestamp;
    if (stopped) return;

    const buffer = makeBuffer(renderer.getWidth(), renderer.getHeight());
    scene.render(buffer);
    renderer.drawBuffer(buffer);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

function showError(message: string): void {
  const root = document.getElementById('root');
  if (!root) return;

  let html = '<div style="padding: 2em; font-family: \'Share Tech Mono\', monospace; color: #f00; background: #000; width: 100%;">';
  html += `<h1 style="margin-bottom: 1em;">Error</h1>`;
  html += `<p style="margin-bottom: 1.5em;">${message}</p>`;
  html += `<a href="?" style="color: #0f0; text-decoration: none; border: 1px solid #0f0; padding: 0.5em 1em; display: inline-block;">Back to Index</a>`;
  html += '</div>';

  root.innerHTML = html;
}

function showResult(gameId: string, result: MiniGameResult): void {
  const root = document.getElementById('root');
  if (!root) return;

  let html = '<div style="padding: 2em; font-family: \'Share Tech Mono\', monospace; color: #aaa; background: #000; width: 100%;">';
  html += '<h1 style="color: #0f0; margin-bottom: 1em;">Result</h1>';
  html += `<div style="margin-bottom: 1.5em; padding: 1em; border: 1px solid #444;">`;
  html += `<div style="color: #0f0; font-weight: bold; margin-bottom: 0.5em;">Outcome: ${escapeHtml(result.outcome)}</div>`;

  if (result.outcome === 'completed' && result.result) {
    html += `<pre style="background: #111; padding: 1em; overflow-x: auto; color: #888;">`;
    html += escapeHtml(JSON.stringify(result.result, null, 2));
    html += '</pre>';
  }

  html += '</div>';
  html += `<a href="?" style="color: #0f0; text-decoration: none; border: 1px solid #0f0; padding: 0.5em 1em; display: inline-block;">Back to Index</a>`;
  html += '</div>';

  root.innerHTML = html;
}

function makeBuffer(width: number, height: number) {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      char: ' ',
      fg: 'black' as const,
      bg: 'black' as const,
    }))
  );
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
