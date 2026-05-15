import { describe, it, expect, vi } from 'vitest';
import { InSystemTravelAnimationScene } from './in-system-travel-animation-scene';
import type { CharBuffer, Color, GameContext } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

const context: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

describe('InSystemTravelAnimationScene', () => {
  describe('arrival timing', () => {
    it('calls onArrival exactly once after accumulating 2000ms', () => {
      const onArrival = vi.fn();
      const scene = new InSystemTravelAnimationScene(makePlayer({ destinationId: 'galileo-transfer' }), context, onArrival);
      scene.update(1000);
      expect(onArrival).not.toHaveBeenCalled();
      scene.update(1000);
      expect(onArrival).toHaveBeenCalledTimes(1);
    });

    it('does not call onArrival again after further updates beyond 2000ms', () => {
      const onArrival = vi.fn();
      const scene = new InSystemTravelAnimationScene(makePlayer({ destinationId: 'galileo-transfer' }), context, onArrival);
      scene.update(2000);
      expect(onArrival).toHaveBeenCalledTimes(1);
      scene.update(1000);
      scene.update(1000);
      expect(onArrival).toHaveBeenCalledTimes(1);
    });

    it('calls onArrival when a single update exceeds 2000ms', () => {
      const onArrival = vi.fn();
      const scene = new InSystemTravelAnimationScene(makePlayer({ destinationId: 'galileo-transfer' }), context, onArrival);
      scene.update(3000);
      expect(onArrival).toHaveBeenCalledTimes(1);
    });
  });

  describe('render', () => {
    it('does not throw for a valid destination', () => {
      const scene = new InSystemTravelAnimationScene(makePlayer({ destinationId: 'galileo-transfer' }), context, vi.fn());
      expect(() => scene.render(makeBuffer(40, 30))).not.toThrow();
    });

    it('renders THRUSTERS ENGAGED text', () => {
      const scene = new InSystemTravelAnimationScene(makePlayer({ destinationId: 'galileo-transfer' }), context, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(text).toContain('THRUSTERS ENGAGED');
    });

    it('renders the destination name derived from player.destinationId', () => {
      const scene = new InSystemTravelAnimationScene(makePlayer({ destinationId: 'galileo-transfer' }), context, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(text).toContain('GALILEO TRANSFER');
    });

    it('uses targetLabel verbatim when provided', () => {
      const scene = new InSystemTravelAnimationScene(makePlayer({ destinationId: null }), context, vi.fn(), 'OPEN SPACE');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(text).toContain('OPEN SPACE');
    });

    it('renders ARRIVING IN countdown text', () => {
      const scene = new InSystemTravelAnimationScene(makePlayer({ destinationId: 'galileo-transfer' }), context, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = buf.map(row => row.map(c => c.char).join('')).join('\n');
      expect(text).toMatch(/ARRIVING IN \dS/);
    });

    it('chrome header row 1 shows IN TRANSIT in destination slot', () => {
      const scene = new InSystemTravelAnimationScene(makePlayer({ destinationId: 'galileo-transfer' }), context, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const row1 = buf[1].map(c => c.char).join('');
      expect(row1).toContain('IN TRANSIT');
    });
  });
});
