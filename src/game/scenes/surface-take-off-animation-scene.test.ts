import { describe, it, expect, vi } from 'vitest';
import { SurfaceTakeOffAnimationScene } from './surface-take-off-animation-scene';
import type { CharBuffer, Color, GameContext } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

const context: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

describe('SurfaceTakeOffAnimationScene', () => {
  it('calls onComplete after 1500ms', () => {
    const onComplete = vi.fn();
    const scene = new SurfaceTakeOffAnimationScene(makePlayer({ destinationId: 'ceti-landfall' }), context, onComplete);
    scene.update(1500);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not call onComplete before 1500ms', () => {
    const onComplete = vi.fn();
    const scene = new SurfaceTakeOffAnimationScene(makePlayer({ destinationId: 'ceti-landfall' }), context, onComplete);
    scene.update(500);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('does not call onComplete more than once', () => {
    const onComplete = vi.fn();
    const scene = new SurfaceTakeOffAnimationScene(makePlayer({ destinationId: 'ceti-landfall' }), context, onComplete);
    scene.update(2000);
    scene.update(2000);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders LIFTOFF SEQUENCE title', () => {
    const scene = new SurfaceTakeOffAnimationScene(makePlayer({ destinationId: 'ceti-landfall' }), context, vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
    expect(allText).toContain('LIFTOFF SEQUENCE');
  });

  it('renders CLEAR countdown text', () => {
    const scene = new SurfaceTakeOffAnimationScene(makePlayer({ destinationId: 'ceti-landfall' }), context, vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
    expect(allText).toMatch(/CLEAR IN \dS/);
  });

  it('chrome header shows destination name from player', () => {
    const scene = new SurfaceTakeOffAnimationScene(makePlayer({ systemId: 'tau-ceti', destinationId: 'ceti-landfall' }), context, vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const row1 = buf[1].map(c => c.char).join('');
    expect(row1).toContain('CETI LANDFALL');
  });

  it('chrome footer is empty nav (all colons)', () => {
    const scene = new SurfaceTakeOffAnimationScene(makePlayer({ destinationId: 'ceti-landfall' }), context, vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    for (let c = 0; c < 40; c++) {
      expect(buf[29][c].char).toBe(':');
    }
  });
});
