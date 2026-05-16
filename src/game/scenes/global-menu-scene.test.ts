import { describe, it, expect, vi } from 'vitest';
import { GlobalMenuScene, type GlobalMenuEntry } from './global-menu-scene';
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

function rowText(buffer: CharBuffer, row: number): string {
  return buffer[row].map(c => c.char).join('').trimEnd();
}

function bufferText(buffer: CharBuffer): string {
  return buffer.map(row => row.map(c => c.char).join('')).join('\n');
}

const context: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

function makeScene(
  input: MockInputHandler,
  entries: GlobalMenuEntry[] = [],
  onClose = vi.fn(),
): GlobalMenuScene {
  return new GlobalMenuScene(input, context, makePlayer(), entries, onClose);
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('GlobalMenuScene', () => {
  describe('empty menu state', () => {
    it('renders NO OPTIONS AVAILABLE when entries list is empty', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, []);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(bufferText(buf)).toContain('NO OPTIONS AVAILABLE');
    });

    it('NO OPTIONS AVAILABLE is not selectable (cursor stays at -1)', () => {
      const onClose = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, [], onClose);
      input.triggerAction('SELECT');
      expect(onClose).not.toHaveBeenCalled();
    });

    it('footer shows [1] GAME', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, []);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 29)).toContain('[1]');
      expect(rowText(buf, 29)).toContain('GAME');
    });
  });

  describe('entry list rendering', () => {
    it('renders each entry label in the menu', () => {
      const input = new MockInputHandler();
      const entries: GlobalMenuEntry[] = [
        { label: 'MISSIONS', action: vi.fn() },
        { label: 'GALAXY MAP', action: vi.fn() },
      ];
      const scene = makeScene(input, entries);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const text = bufferText(buf);
      expect(text).toContain('MISSIONS');
      expect(text).toContain('GALAXY MAP');
    });

    it('first entry has cursor on initial render', () => {
      const input = new MockInputHandler();
      const entries: GlobalMenuEntry[] = [
        { label: 'MISSIONS', action: vi.fn() },
        { label: 'GALAXY MAP', action: vi.fn() },
      ];
      const scene = makeScene(input, entries);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // CONTENT_TOP + 3 = row 6 for items (no infoLines, no tabs)
      expect(rowText(buf, 6)).toContain('>');
      expect(rowText(buf, 6)).toContain('MISSIONS');
    });

    it('SELECT on an entry fires its action', () => {
      const action = vi.fn();
      const input = new MockInputHandler();
      const entries: GlobalMenuEntry[] = [{ label: 'MISSIONS', action }];
      makeScene(input, entries);
      input.triggerAction('SELECT');
      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('close / restore flow', () => {
    it('[1] GAME footer tap calls onClose', () => {
      const onClose = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, [], onClose);
      const buf = makeBuffer(40, 30);
      const scene = new GlobalMenuScene(input, context, makePlayer(), [], onClose);
      scene.render(buf);
      // Footer [1] GAME button starts at col 2 in footer row 29
      input.triggerTap(3, 29);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('BACK action calls onClose', () => {
      const onClose = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, [], onClose);
      input.triggerAction('BACK');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('MENU action calls onClose (pressing M again closes menu)', () => {
      const onClose = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, [], onClose);
      input.triggerAction('MENU');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('NAV_1 action calls onClose', () => {
      const onClose = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, [], onClose);
      input.triggerAction('NAV_1');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('onClose fires only once even if action is triggered twice', () => {
      const onClose = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, [], onClose);
      input.triggerAction('BACK');
      input.triggerAction('BACK');
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('header', () => {
    it('header row 0 shows system name', () => {
      const input = new MockInputHandler();
      const scene = makeScene(input, []);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 0)).toContain('SOL');
    });

    it('header tap on [M] MENU area (row 0) calls onClose', () => {
      const onClose = vi.fn();
      const input = new MockInputHandler();
      makeScene(input, [], onClose);
      const buf = makeBuffer(40, 30);
      const scene = new GlobalMenuScene(input, context, makePlayer(), [], onClose);
      scene.render(buf);
      // [M] MENU starts at col w-10 = 30 for w=40
      input.triggerTap(30, 0);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
