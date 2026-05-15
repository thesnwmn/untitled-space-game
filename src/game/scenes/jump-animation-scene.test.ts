import { describe, it, expect, vi } from 'vitest';
import { JumpAnimationScene } from './jump-animation-scene';
import type { CharBuffer, Color, GameContext } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

const context: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

describe('JumpAnimationScene', () => {
  describe('arrival timing', () => {
    it('calls onArrival exactly once after accumulating 5000ms', () => {
      const onArrival = vi.fn();
      const scene = new JumpAnimationScene(makePlayer({ systemId: 'alpha-centauri' }), context, onArrival);
      scene.update(2500);
      expect(onArrival).not.toHaveBeenCalled();
      scene.update(2500);
      expect(onArrival).toHaveBeenCalledTimes(1);
    });

    it('does not call onArrival again after further updates beyond 5000ms', () => {
      const onArrival = vi.fn();
      const scene = new JumpAnimationScene(makePlayer({ systemId: 'alpha-centauri' }), context, onArrival);
      scene.update(5000);
      expect(onArrival).toHaveBeenCalledTimes(1);
      scene.update(1000);
      scene.update(1000);
      expect(onArrival).toHaveBeenCalledTimes(1);
    });

    it('calls onArrival when a single update exceeds 5000ms', () => {
      const onArrival = vi.fn();
      const scene = new JumpAnimationScene(makePlayer({ systemId: 'sol' }), context, onArrival);
      scene.update(6000);
      expect(onArrival).toHaveBeenCalledTimes(1);
    });
  });

  describe('render', () => {
    it('does not throw for a valid target system', () => {
      const scene = new JumpAnimationScene(makePlayer({ systemId: 'alpha-centauri' }), context, vi.fn());
      const buf = makeBuffer(40, 30);
      expect(() => scene.render(buf)).not.toThrow();
    });

    it('renders JUMP DRIVE ENGAGED text', () => {
      const scene = new JumpAnimationScene(makePlayer({ systemId: 'alpha-centauri' }), context, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(allText).toContain('JUMP DRIVE ENGAGED');
    });

    it('renders the target system name derived from player.systemId', () => {
      const scene = new JumpAnimationScene(makePlayer({ systemId: 'alpha-centauri' }), context, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(allText).toContain('ALPHA CENTAURI');
    });

    it('renders countdown text', () => {
      const scene = new JumpAnimationScene(makePlayer({ systemId: 'sol' }), context, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(allText).toMatch(/ARRIVING IN \dS/);
    });

    it('chrome header row 0 shows IN TRANSIT as system label', () => {
      const scene = new JumpAnimationScene(makePlayer({ systemId: 'sol' }), context, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const row0 = buf[0].map(c => c.char).join('');
      expect(row0).toContain('IN TRANSIT');
    });

    it('chrome header row 1 destination slot is blank', () => {
      const scene = new JumpAnimationScene(makePlayer({ systemId: 'sol', destinationId: 'elysium-station' }), context, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const row1 = buf[1].map(c => c.char).join('');
      expect(row1).not.toContain('ELYSIUM STATION');
    });
  });
});
