import { describe, it, expect, vi } from 'vitest';
import { StoryScene } from './story-scene';
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

function rowFg(buffer: CharBuffer, row: number, col: number): Color {
  return buffer[row][col].fg;
}

const keyboardContext: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false, systemId: 'sol', destinationId: 'elysium-station', credits: 5000 };
const touchContext: GameContext = { environment: 'browser', primaryInput: 'touch', debug: false, systemId: 'sol', destinationId: 'elysium-station', credits: 5000 };

// ── tests ─────────────────────────────────────────────────────────────────────

describe('StoryScene', () => {
  describe('render — layout', () => {
    it('clears buffer to black spaces before drawing', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      buf[1][5] = { char: 'X', fg: 'red', bg: 'red' };
      scene.render(buf);
      expect(buf[1][5]).toEqual({ char: ' ', fg: 'black', bg: 'black' });
    });

    it('does not render a border', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).toBe(' ');
      expect(buf[0][0].fg).toBe('black');
    });

    it('renders YEAR header from world data centred in bright-yellow on row 2', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 2)).toContain('YEAR  2284');
      // "YEAR  2284" is 10 chars; centred in 40: col = 15
      expect(rowFg(buf, 2, 15)).toBe('bright-yellow');
    });

    it('renders at least one body line from world data below row 4 in white', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = rowText(buf, 4);
      expect(text.trim().length).toBeGreaterThan(0);
      expect(buf[4].find((c, i) => c.char !== ' ' && i >= 2)?.fg).toBe('white');
    });

    it('does not render "Hugo poured" anywhere in the buffer', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const allText = buf.map(row => row.map(c => c.char).join('')).join('');
      expect(allText).not.toContain('Hugo poured');
    });

    it('story text lines do not exceed 36 chars from col 2', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      for (let row = 4; row < buf.length - 4; row++) {
        const textContent = buf[row].slice(2, 38).map(c => c.char).join('').trimEnd();
        expect(textContent.length).toBeLessThanOrEqual(36);
      }
    });
  });

  describe('SELECT input', () => {
    it('SELECT triggers onContinue exactly once', () => {
      const onContinue = vi.fn();
      const input = new MockInputHandler();
      new StoryScene(input, keyboardContext, onContinue);
      input.triggerAction('SELECT');
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it('second SELECT after first does nothing', () => {
      const onContinue = vi.fn();
      const input = new MockInputHandler();
      new StoryScene(input, keyboardContext, onContinue);
      input.triggerAction('SELECT');
      input.triggerAction('SELECT');
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe('tap input', () => {
    it('tap on any row triggers onContinue exactly once', () => {
      const onContinue = vi.fn();
      const input = new MockInputHandler();
      new StoryScene(input, keyboardContext, onContinue);
      input.triggerTap(5, 10);
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it('tap on row 0 (empty row) triggers onContinue', () => {
      const onContinue = vi.fn();
      const input = new MockInputHandler();
      new StoryScene(input, keyboardContext, onContinue);
      input.triggerTap(0, 0);
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it('second tap after first does nothing', () => {
      const onContinue = vi.fn();
      const input = new MockInputHandler();
      new StoryScene(input, keyboardContext, onContinue);
      input.triggerTap(0, 5);
      input.triggerTap(0, 5);
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe('BACK input', () => {
    it('BACK has no effect', () => {
      const onContinue = vi.fn();
      const input = new MockInputHandler();
      new StoryScene(input, keyboardContext, onContinue);
      input.triggerAction('BACK');
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      expect(() => scene.update(16.7)).not.toThrow();
    });
  });
});
