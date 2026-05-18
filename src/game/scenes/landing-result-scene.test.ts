import { describe, it, expect, vi } from 'vitest';
import { LandingResultScene } from './landing-result-scene';
import type { CharBuffer, Color, GameAction, GameContext, InputHandler } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

class MockInput implements InputHandler {
  private handlers: Array<(action: GameAction) => void> = [];
  onAction(h: (action: GameAction) => void): void { this.handlers.push(h); }
  dispatch(action: GameAction): void { this.handlers.forEach(h => h(action)); }
}

const ctx: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

function makeScene(
  outcomeLabel: string,
  score: number | null,
  damageFraction: number,
  onComplete = vi.fn(),
  input?: MockInput,
): LandingResultScene {
  return new LandingResultScene(
    input ?? new MockInput(),
    makePlayer(),
    ctx,
    outcomeLabel,
    score,
    damageFraction,
    onComplete,
  );
}

function bufferText(buffer: CharBuffer): string {
  return buffer.map(row => row.map(c => c.char).join('')).join('\n');
}

describe('LandingResultScene', () => {
  it('renders the outcome label', () => {
    const scene = makeScene('PERFECT DOCK', 95, 0);
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(bufferText(buf)).toContain('PERFECT DOCK');
  });

  it('renders the score when provided', () => {
    const scene = makeScene('DOCKED', 75, 0.02);
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(bufferText(buf)).toContain('SCORE: 75 / 100');
  });

  it('omits the score when null', () => {
    const scene = makeScene('ABORTED', null, 0.05);
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(bufferText(buf)).not.toContain('SCORE:');
  });

  it('renders hull damage as percentage', () => {
    const scene = makeScene('CRASH', 10, 0.08);
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(bufferText(buf)).toContain('HULL DAMAGE: 8%');
  });

  it('renders 0% hull damage when none applied', () => {
    const scene = makeScene('PERFECT DOCK', 100, 0);
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(bufferText(buf)).toContain('HULL DAMAGE: 0%');
  });

  describe('auto-advance', () => {
    it('does not complete before 3000ms', () => {
      const cb = vi.fn();
      const scene = makeScene('DOCKED', 80, 0, cb);
      scene.update(2999);
      expect(cb).not.toHaveBeenCalled();
    });

    it('calls onComplete after 3000ms', () => {
      const cb = vi.fn();
      const scene = makeScene('DOCKED', 80, 0, cb);
      scene.update(3000);
      expect(cb).toHaveBeenCalledOnce();
    });
  });

  describe('keypress advance', () => {
    it('calls onComplete on next tick after a keypress', () => {
      const cb = vi.fn();
      const input = new MockInput();
      const scene = makeScene('DOCKED', 80, 0, cb, input);
      input.dispatch('SELECT');
      scene.update(1);
      expect(cb).toHaveBeenCalledOnce();
    });

    it('does not call onComplete without a tick after keypress', () => {
      const cb = vi.fn();
      const input = new MockInput();
      makeScene('DOCKED', 80, 0, cb, input);
      input.dispatch('SELECT');
      expect(cb).not.toHaveBeenCalled();
    });
  });
});
