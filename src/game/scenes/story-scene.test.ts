import { describe, it, expect, vi } from 'vitest';
import { StoryScene } from './StoryScene';
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

const keyboardContext: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };
const touchContext: GameContext = { environment: 'browser', primaryInput: 'touch', debug: false };

// ── tests ─────────────────────────────────────────────────────────────────────

describe('StoryScene', () => {
  describe('render — layout', () => {
    it('clears buffer to black spaces before drawing', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      buf[20][15] = { char: 'X', fg: 'red', bg: 'red' };
      scene.render(buf);
      expect(buf[20][15]).toEqual({ char: ' ', fg: 'black', bg: 'black' });
    });

    it('renders a border on rows 0 and 29', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[0][0].char).toBe('+');
      expect(buf[0][39].char).toBe('+');
      expect(buf[29][0].char).toBe('+');
      expect(buf[29][39].char).toBe('+');
      expect(buf[0][1].char).toBe('-');
      expect(buf[15][0].char).toBe('|');
    });

    it('renders YEAR header centred in bright-yellow on row 2', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 2)).toContain('YEAR  2076');
      // "YEAR  2076" is 10 chars; centred in 40: col = 15
      expect(rowFg(buf, 2, 15)).toBe('bright-yellow');
    });

    it('renders first story paragraph on rows 4–6 starting at col 2', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 4)).toContain('Hugo poured his last credits into');
      expect(rowText(buf, 5)).toContain('a battered freighter');
      expect(rowText(buf, 6)).toContain('spaceworthy, but entirely his.');
      expect(rowFg(buf, 4, 2)).toBe('white');
    });

    it('renders second story paragraph on rows 8–12', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 8)).toContain('Stories pulled him outward:');
      expect(rowText(buf, 9)).toContain('Elysium Station, drifting in');
      expect(rowText(buf, 10)).toContain("Jupiter's long shadow");
      expect(rowText(buf, 11)).toContain('traders, chancers and fortune-');
      expect(rowText(buf, 12)).toContain('seekers converge.');
    });

    it('renders third story paragraph on rows 14–15', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 14)).toContain('Hugo eases into the docking bay,');
      expect(rowText(buf, 15)).toContain('locks the clamps, steps aboard.');
    });

    it('renders closing line on row 17', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 17)).toContain('Whatever comes next is up to him.');
    });

    it('renders keyboard footer hint on row 27 in bright-black', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 27)).toContain('PRESS ENTER TO CONTINUE');
      expect(buf[27].find((c, i) => c.char !== ' ' && i > 0 && i < 39)?.fg).toBe('bright-black');
    });

    it('renders touch footer hint on row 27 for touch context', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, touchContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 27)).toContain('TAP TO CONTINUE');
    });

    it('story text lines do not exceed column 37 (max 36 chars from col 2)', () => {
      const input = new MockInputHandler();
      const scene = new StoryScene(input, keyboardContext, vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const storyRows = [4, 5, 6, 8, 9, 10, 11, 12, 14, 15, 17];
      for (const row of storyRows) {
        // Measure only columns 2–37 (the text area, excluding borders at 0 and 39)
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

    it('tap on row 0 (border) also triggers onContinue', () => {
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
