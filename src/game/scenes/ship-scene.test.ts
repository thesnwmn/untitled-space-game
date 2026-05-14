import { describe, it, expect, vi } from 'vitest';
import { ShipScene } from './ShipScene';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';

// ── helpers ──────────────────────────────────────────────────────────────────

class MockInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  private tapHandlers: Array<(col: number, row: number) => void> = [];

  onAction(handler: (action: GameAction) => void): void {
    this.actionHandlers.push(handler);
  }

  onTap(handler: (col: number, row: number) => void): void {
    this.tapHandlers.push(handler);
  }

  triggerAction(action: GameAction): void {
    for (const h of this.actionHandlers) h(action);
  }

  triggerTap(col: number, row: number): void {
    for (const h of this.tapHandlers) h(col, row);
  }
}

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

function rowText(buffer: CharBuffer, row: number): string {
  return buffer[row].map(c => c.char).join('').trimEnd();
}

// Contexts — systemId/destinationId now live in context, not constructor args
const keyboardContext: GameContext = {
  environment: 'browser', primaryInput: 'keyboard', debug: false,
  systemId: 'sol', destinationId: 'elysium-station', credits: 5000,
};
const touchContext: GameContext = {
  environment: 'browser', primaryInput: 'touch', debug: false,
  systemId: 'sol', destinationId: 'elysium-station', credits: 5000,
};
const inSpaceContext: GameContext = {
  environment: 'browser', primaryInput: 'keyboard', debug: false,
  systemId: 'alpha-centauri', destinationId: null, credits: 5000,
};
const militaryContext: GameContext = {
  environment: 'browser', primaryInput: 'keyboard', debug: false,
  systemId: 'sol', destinationId: 'tycho-orbital', credits: 5000,
};

// Layout constants for 40×30 reference grid
// Row 0–1: ScreenChrome header; row 2: gap
const FUEL_ROW = 3;      // CONTENT_TOP
const VIEW_TOP = 4;      // CONTENT_TOP + 1
const VIEW_BOT = 26;     // h - 4
const SEP_ROW = 27;      // h - 3
const BUTTONS_ROW = 28;  // h - 2

// ── tests ─────────────────────────────────────────────────────────────────────

describe('ShipScene', () => {
  describe('render — layout', () => {
    it('does not render a border at row 0', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).not.toBe('+');
      expect(buf[0][0].char).not.toBe('-');
    });

    it('chrome header row 0 contains SOL', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 0)).toContain('SOL');
    });

    it('chrome header row 1 contains ELYSIUM STATION', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 1)).toContain('ELYSIUM STATION');
    });

    it('renders fuel/cargo info at FUEL_ROW in bright-black', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = rowText(buf, FUEL_ROW);
      expect(text).toContain('FUEL: 100%');
      expect(text).toContain('CARGO: 0/50T');
      expect(buf[FUEL_ROW].find(c => c.char !== ' ')?.fg).toBe('bright-black');
    });

    it('interior region (rows VIEW_TOP to VIEW_BOT) contains non-space cells', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      let nonSpace = false;
      outer: for (let r = VIEW_TOP; r <= VIEW_BOT; r++) {
        for (let c = 0; c < 40; c++) {
          if (buf[r][c].char !== ' ') { nonSpace = true; break outer; }
        }
      }
      expect(nonSpace).toBe(true);
    });

    it('civilian destination produces HUB station glyph ([H]) in interior', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      let hubFound = false;
      outer: for (let r = VIEW_TOP; r <= VIEW_BOT; r++) {
        for (let c = 0; c <= 37; c++) {
          if (buf[r][c].char === '[' && buf[r][c + 1]?.char === 'H' && buf[r][c + 2]?.char === ']') {
            hubFound = true;
            break outer;
          }
        }
      }
      expect(hubFound).toBe(true);
    });

    it('military destination produces RELAY station glyph (bright-yellow) in interior', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, militaryContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      let relayFound = false;
      outer: for (let r = VIEW_TOP; r <= VIEW_BOT; r++) {
        for (let c = 0; c <= 37; c++) {
          if (buf[r][c].fg === 'bright-yellow' && buf[r][c].char !== ' ') {
            relayFound = true;
            break outer;
          }
        }
      }
      expect(relayFound).toBe(true);
    });

    it('both TRAVEL and DOCK labels appear on BUTTONS_ROW', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const line = rowText(buf, BUTTONS_ROW);
      expect(line).toContain('[ T ] TRAVEL');
      expect(line).toContain('[ D ] DOCK');
    });

    it('cursor starts on TRAVEL (> prefix left of DOCK)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const line = rowText(buf, BUTTONS_ROW);
      expect(line).toContain('>');
      expect(line.indexOf('>')).toBeLessThan(line.indexOf('DOCK'));
    });

    it('footer row (h-1) is empty — no hint text', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 29)).toBe('');
    });
  });

  describe('animation forwarding', () => {
    it('update advances starfield (interior cells differ after large dt)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf1 = makeBuffer(40, 30);
      scene.render(buf1);
      scene.update(5000);
      const buf2 = makeBuffer(40, 30);
      scene.render(buf2);
      let changed = false;
      outer: for (let r = VIEW_TOP; r <= VIEW_BOT; r++) {
        for (let c = 0; c < 40; c++) {
          if (buf1[r][c].char !== buf2[r][c].char) { changed = true; break outer; }
        }
      }
      expect(changed).toBe(true);
    });

    it('update advances station (no throw, renders after update)', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(() => scene.update(2250)).not.toThrow();
      expect(() => scene.render(buf)).not.toThrow();
    });
  });

  describe('keyboard navigation', () => {
    it('DOWN moves cursor so > appears near DOCK on BUTTONS_ROW', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const line = rowText(buf, BUTTONS_ROW);
      expect(line.indexOf('>')).toBeGreaterThan(line.indexOf('TRAVEL'));
    });

    it('UP from TRAVEL wraps cursor to DOCK', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      input.triggerAction('UP');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const line = rowText(buf, BUTTONS_ROW);
      expect(line.indexOf('>')).toBeGreaterThan(line.indexOf('TRAVEL'));
    });

    it('DOWN from DOCK wraps back to TRAVEL', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      input.triggerAction('DOWN');
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const line = rowText(buf, BUTTONS_ROW);
      expect(line.indexOf('>')).toBeLessThan(line.indexOf('DOCK'));
    });

    it('SELECT on TRAVEL calls onTravel', () => {
      const onTravel = vi.fn();
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, onTravel, vi.fn());
      input.triggerAction('SELECT');
      expect(onTravel).toHaveBeenCalledTimes(1);
    });

    it('SELECT on DOCK calls onDock and silences further input', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, vi.fn(), onDock);
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      expect(onDock).toHaveBeenCalledTimes(1);
      input.triggerAction('SELECT');
      expect(onDock).toHaveBeenCalledTimes(1);
    });

    it('BACK action does nothing', () => {
      const onTravel = vi.fn();
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, onTravel, onDock);
      input.triggerAction('BACK');
      expect(onTravel).not.toHaveBeenCalled();
      expect(onDock).not.toHaveBeenCalled();
    });
  });

  describe('touch navigation', () => {
    it('tap left half of BUTTONS_ROW calls onTravel', () => {
      const onTravel = vi.fn();
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, onTravel, vi.fn());
      input.triggerTap(10, BUTTONS_ROW);
      expect(onTravel).toHaveBeenCalledTimes(1);
    });

    it('tap right half of BUTTONS_ROW calls onDock', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipScene(input, keyboardContext, vi.fn(), onDock);
      input.triggerTap(30, BUTTONS_ROW);
      expect(onDock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, keyboardContext, vi.fn(), vi.fn());
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });

  describe('in space (destinationId = null)', () => {
    it('chrome header row 1 shows IN SPACE', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, inSpaceContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 1)).toContain('IN SPACE');
    });

    it('chrome header row 0 shows the system name when in space', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, inSpaceContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 0)).toContain('ALPHA CENTAURI');
    });

    it('DOCK button appears greyed ([ - ] DOCK) when in space', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, inSpaceContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, BUTTONS_ROW)).toContain('[ - ] DOCK');
    });

    it('SELECT does not call onDock when in space', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipScene(input, inSpaceContext, vi.fn(), onDock);
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      expect(onDock).not.toHaveBeenCalled();
    });

    it('does not render a HUB station glyph when in space', () => {
      const input = new MockInputHandler();
      const scene = new ShipScene(input, inSpaceContext, vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      let hubFound = false;
      for (let r = VIEW_TOP; r <= VIEW_BOT; r++) {
        for (let c = 0; c <= 37; c++) {
          if (buf[r][c].char === '[' && buf[r][c + 1]?.char === 'H' && buf[r][c + 2]?.char === ']') {
            hubFound = true;
          }
        }
      }
      expect(hubFound).toBe(false);
    });
  });
});
