import { describe, it, expect, vi } from 'vitest';
import { Game } from './game';
import type { Renderer, InputHandler, GameContext, CharBuffer } from '../shared/types';

function makeMockRenderer(width = 40, height = 30): Renderer & { drawBuffer: ReturnType<typeof vi.fn> } {
  return {
    drawBuffer: vi.fn(),
    getWidth: () => width,
    getHeight: () => height,
    clear: vi.fn(),
    onResize: vi.fn(),
  };
}

function makeMockInput(): InputHandler {
  return {
    onAction: vi.fn(),
    onTap: vi.fn(),
  };
}

const context: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

describe('Game', () => {
  it('tick calls drawBuffer once per call', () => {
    const renderer = makeMockRenderer();
    const game = new Game(renderer, makeMockInput(), context);
    game.tick(16);
    expect(renderer.drawBuffer).toHaveBeenCalledOnce();
  });

  it('tick passes a buffer matching renderer dimensions', () => {
    const renderer = makeMockRenderer(40, 30);
    const game = new Game(renderer, makeMockInput(), context);
    game.tick(16);
    const buffer = renderer.drawBuffer.mock.calls[0][0] as CharBuffer;
    expect(buffer).toHaveLength(30);
    expect(buffer[0]).toHaveLength(40);
  });

  it('tick clamps dt to 100 ms', () => {
    const r1 = makeMockRenderer();
    const r2 = makeMockRenderer();
    const game1 = new Game(r1, makeMockInput(), context);
    const game2 = new Game(r2, makeMockInput(), context);
    game1.tick(9999);
    game2.tick(100);
    const buf1 = r1.drawBuffer.mock.calls[0][0] as CharBuffer;
    const buf2 = r2.drawBuffer.mock.calls[0][0] as CharBuffer;
    expect(buf1).toEqual(buf2);
  });

  it('multiple ticks render without error', () => {
    const renderer = makeMockRenderer();
    const game = new Game(renderer, makeMockInput(), context);
    for (let i = 0; i < 10; i++) game.tick(16);
    expect(renderer.drawBuffer).toHaveBeenCalledTimes(10);
  });
});
