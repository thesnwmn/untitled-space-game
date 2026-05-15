import { describe, it, expect, vi } from 'vitest';
import { OrbitalDockingAnimationScene } from './orbital-docking-animation-scene';
import type { CharBuffer, Color, GameContext } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

const context: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

describe('OrbitalDockingAnimationScene', () => {
  it('calls onComplete after 1500ms', () => {
    const onComplete = vi.fn();
    const scene = new OrbitalDockingAnimationScene(makePlayer({ destinationId: 'elysium-station' }), context, onComplete);
    scene.update(1500);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not call onComplete before 1500ms', () => {
    const onComplete = vi.fn();
    const scene = new OrbitalDockingAnimationScene(makePlayer({ destinationId: 'elysium-station' }), context, onComplete);
    scene.update(1000);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('does not call onComplete more than once', () => {
    const onComplete = vi.fn();
    const scene = new OrbitalDockingAnimationScene(makePlayer({ destinationId: 'elysium-station' }), context, onComplete);
    scene.update(2000);
    scene.update(2000);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders DOCKING SEQUENCE title', () => {
    const scene = new OrbitalDockingAnimationScene(makePlayer({ destinationId: 'elysium-station' }), context, vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
    expect(allText).toContain('DOCKING SEQUENCE');
  });

  it('renders DOCKING IN countdown text', () => {
    const scene = new OrbitalDockingAnimationScene(makePlayer({ destinationId: 'elysium-station' }), context, vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
    expect(allText).toMatch(/DOCKING IN \dS/);
  });

  it('chrome header shows destination name from player', () => {
    const scene = new OrbitalDockingAnimationScene(makePlayer({ systemId: 'sol', destinationId: 'elysium-station' }), context, vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const row1 = buf[1].map(c => c.char).join('');
    expect(row1).toContain('ELYSIUM STATION');
  });

  it('chrome footer is empty nav (all colons)', () => {
    const scene = new OrbitalDockingAnimationScene(makePlayer({ destinationId: 'elysium-station' }), context, vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    for (let c = 0; c < 40; c++) {
      expect(buf[29][c].char).toBe(':');
    }
  });
});
