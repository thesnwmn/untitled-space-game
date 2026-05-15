import { describe, it, expect, vi } from 'vitest';
import { BaseMenuScene, type MenuItemDef } from './base-menu-scene';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';

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

function rowText(buf: CharBuffer, row: number): string {
  return buf[row].map(c => c.char).join('').trimEnd();
}

const ctx: GameContext = {
  environment: 'browser', primaryInput: 'keyboard', debug: false,
};

// Concrete subclass — no nav overrides needed for these tests
class TestMenuScene extends BaseMenuScene {
  constructor(items: MenuItemDef[], input: MockInputHandler, infoLines: string[] = []) {
    super('TEST MENU', items, [], input, ctx, makePlayer(), infoLines);
  }
}

// itemStartRow = CONTENT_TOP(3) + 3 = 6 (when no infoLines)
const ITEM_ROW_START = 6;

// ── tests ─────────────────────────────────────────────────────────────────────

describe('BaseMenuScene', () => {
  describe('render — title and underline', () => {
    it('renders title at CONTENT_TOP (row 3) col 2 in bright-white', () => {
      const input = new MockInputHandler();
      const scene = new TestMenuScene([{ label: 'ALPHA', action: vi.fn() }], input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 3)).toContain('TEST MENU');
      expect(buf[3].find((c, i) => c.char !== ' ' && i >= 2)?.fg).toBe('bright-white');
    });

    it("renders ' underline at row 4 in bright-black", () => {
      const input = new MockInputHandler();
      const scene = new TestMenuScene([{ label: 'ALPHA', action: vi.fn() }], input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 4)).toContain("'");
      expect(buf[4].find(c => c.char === "'")?.fg).toBe('bright-black');
    });
  });

  describe('render — item styles', () => {
    it('renders simple item at ITEM_ROW_START with cursor prefix and bright-green fg', () => {
      const input = new MockInputHandler();
      const scene = new TestMenuScene([{ label: 'ALPHA', action: vi.fn() }], input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).toContain('> ALPHA');
      expect(buf[ITEM_ROW_START][2].char).toBe('>');
      expect(buf[ITEM_ROW_START][2].fg).toBe('bright-green');
    });

    it('renders non-cursor item without > prefix and in white', () => {
      const input = new MockInputHandler();
      const scene = new TestMenuScene([
        { label: 'ALPHA', action: vi.fn() },
        { label: 'BETA', action: vi.fn() },
      ], input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START + 1)).toContain('BETA');
      expect(rowText(buf, ITEM_ROW_START + 1)).not.toContain('> BETA');
      expect(buf[ITEM_ROW_START + 1].find((c, i) => c.char !== ' ' && i >= 2)?.fg).toBe('white');
    });

    it('renders item with info using dotted separator', () => {
      const input = new MockInputHandler();
      const scene = new TestMenuScene([{ label: 'THING', info: '42 CR', action: vi.fn() }], input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = rowText(buf, ITEM_ROW_START);
      expect(text).toContain('THING');
      expect(text).toContain('42 CR');
      expect(text).toContain('.');
    });

    it('renders item with details on sub-rows in bright-black', () => {
      const input = new MockInputHandler();
      const scene = new TestMenuScene([
        { label: 'THING', details: ['sub detail'], action: vi.fn() },
      ], input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).toContain('THING');
      expect(rowText(buf, ITEM_ROW_START + 1)).toContain('sub detail');
      expect(buf[ITEM_ROW_START + 1].find(c => c.char !== ' ')?.fg).toBe('bright-black');
    });
  });

  describe('keyboard navigation', () => {
    it('DOWN moves cursor to next item', () => {
      const input = new MockInputHandler();
      const scene = new TestMenuScene([
        { label: 'ALPHA', action: vi.fn() },
        { label: 'BETA', action: vi.fn() },
      ], input);
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).not.toContain('> ALPHA');
      expect(rowText(buf, ITEM_ROW_START + 1)).toContain('> BETA');
    });

    it('UP from first item wraps to last', () => {
      const input = new MockInputHandler();
      const scene = new TestMenuScene([
        { label: 'ALPHA', action: vi.fn() },
        { label: 'BETA', action: vi.fn() },
      ], input);
      input.triggerAction('UP');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START + 1)).toContain('> BETA');
    });

    it('SELECT calls the current item action and silences further input', () => {
      const action = vi.fn();
      const input = new MockInputHandler();
      new TestMenuScene([{ label: 'ALPHA', action }], input);
      input.triggerAction('SELECT');
      expect(action).toHaveBeenCalledTimes(1);
      input.triggerAction('SELECT');
      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('touch navigation', () => {
    it('tap on item row activates that item', () => {
      const action = vi.fn();
      const input = new MockInputHandler();
      new TestMenuScene([
        { label: 'ALPHA', action: vi.fn() },
        { label: 'BETA', action },
      ], input);
      input.triggerTap(10, ITEM_ROW_START + 1);
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('tap on non-item row does nothing', () => {
      const action = vi.fn();
      const input = new MockInputHandler();
      new TestMenuScene([{ label: 'ALPHA', action }], input);
      input.triggerTap(10, 0);
      expect(action).not.toHaveBeenCalled();
    });
  });

  describe('disabled items', () => {
    it('cursor skips disabled first item on init and lands on first enabled', () => {
      const input = new MockInputHandler();
      const scene = new TestMenuScene([
        { label: 'ALPHA', disabled: true, action: vi.fn() },
        { label: 'BETA', action: vi.fn() },
      ], input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).not.toContain('> ALPHA');
      expect(rowText(buf, ITEM_ROW_START + 1)).toContain('> BETA');
    });

    it('no cursor shown when all items are disabled', () => {
      const input = new MockInputHandler();
      const scene = new TestMenuScene([
        { label: 'ALPHA', disabled: true, action: vi.fn() },
        { label: 'BETA', disabled: true, action: vi.fn() },
      ], input);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START)).not.toContain('>');
      expect(rowText(buf, ITEM_ROW_START + 1)).not.toContain('>');
    });

    it('SELECT does nothing when all items are disabled', () => {
      const action = vi.fn();
      const input = new MockInputHandler();
      new TestMenuScene([{ label: 'ALPHA', disabled: true, action }], input);
      input.triggerAction('SELECT');
      expect(action).not.toHaveBeenCalled();
    });

    it('DOWN skips disabled items', () => {
      const input = new MockInputHandler();
      const scene = new TestMenuScene([
        { label: 'ALPHA', action: vi.fn() },
        { label: 'BETA', disabled: true, action: vi.fn() },
        { label: 'GAMMA', action: vi.fn() },
      ], input);
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ITEM_ROW_START + 2)).toContain('> GAMMA');
    });

    it('tap on disabled item row does nothing', () => {
      const action = vi.fn();
      const input = new MockInputHandler();
      new TestMenuScene([
        { label: 'ALPHA', disabled: true, action },
        { label: 'BETA', action: vi.fn() },
      ], input);
      input.triggerTap(10, ITEM_ROW_START);
      expect(action).not.toHaveBeenCalled();
    });
  });

  describe('infoLines', () => {
    it('renders infoLines below underline and shifts itemStartRow', () => {
      const input = new MockInputHandler();
      const infoLines = ['Line one', 'Line two'];
      const scene = new TestMenuScene([{ label: 'ITEM', action: vi.fn() }], input, infoLines);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // infoLines render at rows CONTENT_TOP+2 and CONTENT_TOP+3 (rows 5 and 6)
      expect(rowText(buf, 5)).toContain('Line one');
      expect(rowText(buf, 6)).toContain('Line two');
      // item start row = CONTENT_TOP + 3 + infoLines.length = 3 + 3 + 2 = 8
      expect(rowText(buf, 8)).toContain('> ITEM');
    });
  });
});
