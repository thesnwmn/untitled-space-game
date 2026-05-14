import { describe, it, expect, vi } from 'vitest';
import { JumpAnimationScene } from './JumpAnimationScene';
import type { CharBuffer, Color } from '../../shared/types';

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

describe('JumpAnimationScene', () => {
  describe('arrival timing', () => {
    it('calls onArrival exactly once after accumulating 5000ms', () => {
      const onArrival = vi.fn();
      const scene = new JumpAnimationScene('Alpha Centauri', onArrival);
      scene.update(2500);
      expect(onArrival).not.toHaveBeenCalled();
      scene.update(2500);
      expect(onArrival).toHaveBeenCalledTimes(1);
    });

    it('does not call onArrival again after further updates beyond 5000ms', () => {
      const onArrival = vi.fn();
      const scene = new JumpAnimationScene('Alpha Centauri', onArrival);
      scene.update(5000);
      expect(onArrival).toHaveBeenCalledTimes(1);
      scene.update(1000);
      scene.update(1000);
      expect(onArrival).toHaveBeenCalledTimes(1);
    });

    it('calls onArrival when a single update exceeds 5000ms', () => {
      const onArrival = vi.fn();
      const scene = new JumpAnimationScene('Sol', onArrival);
      scene.update(6000);
      expect(onArrival).toHaveBeenCalledTimes(1);
    });
  });

  describe('render', () => {
    it('does not throw for a valid target system name', () => {
      const scene = new JumpAnimationScene('Alpha Centauri', vi.fn());
      const buf = makeBuffer(40, 30);
      expect(() => scene.render(buf)).not.toThrow();
    });

    it('renders JUMP DRIVE ENGAGED text', () => {
      const scene = new JumpAnimationScene('Alpha Centauri', vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(allText).toContain('JUMP DRIVE ENGAGED');
    });

    it('renders the target system name in uppercase', () => {
      const scene = new JumpAnimationScene('alpha centauri', vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(allText).toContain('ALPHA CENTAURI');
    });

    it('renders countdown text', () => {
      const scene = new JumpAnimationScene('Sol', vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(allText).toMatch(/ARRIVING IN \dS/);
    });
  });
});
