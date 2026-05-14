import { describe, it, expect, vi } from 'vitest';
import { InSystemTravelAnimationScene } from './InSystemTravelAnimationScene';
import type { CharBuffer, Color } from '../../shared/types';

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

describe('InSystemTravelAnimationScene', () => {
  describe('arrival timing', () => {
    it('calls onArrival exactly once after accumulating 2000ms', () => {
      const onArrival = vi.fn();
      const scene = new InSystemTravelAnimationScene('Galileo Transfer', onArrival);
      scene.update(1000);
      expect(onArrival).not.toHaveBeenCalled();
      scene.update(1000);
      expect(onArrival).toHaveBeenCalledTimes(1);
    });

    it('does not call onArrival again after further updates beyond 2000ms', () => {
      const onArrival = vi.fn();
      const scene = new InSystemTravelAnimationScene('Galileo Transfer', onArrival);
      scene.update(2000);
      expect(onArrival).toHaveBeenCalledTimes(1);
      scene.update(1000);
      scene.update(1000);
      expect(onArrival).toHaveBeenCalledTimes(1);
    });

    it('calls onArrival when a single update exceeds 2000ms', () => {
      const onArrival = vi.fn();
      const scene = new InSystemTravelAnimationScene('Galileo Transfer', onArrival);
      scene.update(3000);
      expect(onArrival).toHaveBeenCalledTimes(1);
    });
  });

  describe('render', () => {
    it('does not throw for a valid destination name', () => {
      const scene = new InSystemTravelAnimationScene('Galileo Transfer', vi.fn());
      expect(() => scene.render(makeBuffer(40, 30))).not.toThrow();
    });

    it('renders THRUSTERS ENGAGED text', () => {
      const scene = new InSystemTravelAnimationScene('Galileo Transfer', vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(text).toContain('THRUSTERS ENGAGED');
    });

    it('renders the destination name in uppercase', () => {
      const scene = new InSystemTravelAnimationScene('galileo transfer', vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(text).toContain('GALILEO TRANSFER');
    });

    it('renders ARRIVING IN countdown text', () => {
      const scene = new InSystemTravelAnimationScene('Galileo Transfer', vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(text).toMatch(/ARRIVING IN \dS/);
    });
  });
});
