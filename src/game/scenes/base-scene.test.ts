import { describe, it, expect, vi } from 'vitest';
import { BaseScene } from './base-scene';
import type { BaseSceneOptions } from './base-scene';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';
import { CONTENT_TOP } from '../ui/screen-chrome';

// ── helpers ──────────────────────────────────────────────────────────────────

class MockInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  private tapHandlers: Array<(col: number, row: number) => void> = [];
  private charHandlers: Array<(char: string) => void> = [];

  onAction(h: (action: GameAction) => void): void { this.actionHandlers.push(h); }
  onTap(h: (col: number, row: number) => void): void { this.tapHandlers.push(h); }
  onCharInput(h: (char: string) => void): void { this.charHandlers.push(h); }

  triggerAction(a: GameAction): void { for (const h of this.actionHandlers) h(a); }
  triggerTap(col: number, row: number): void { for (const h of this.tapHandlers) h(col, row); }
  triggerChar(char: string): void { for (const h of this.charHandlers) h(char); }
}

// Buffer pre-filled with '?' so cleared cells are obvious
function makeDirtyBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: '?', fg: 'red' as Color, bg: 'red' as Color }))
  );
}

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

function rowText(buf: CharBuffer, row: number): string {
  return buf[row].map(c => c.char).join('').trimEnd();
}

const ctx: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

// Minimal concrete subclass — records top/bottom passed to renderContent
class TestScene extends BaseScene {
  capturedTop = -1;
  capturedBottom = -1;
  tabChanges: number[] = [];
  renderCount = 0;

  constructor(input: MockInputHandler, opts: BaseSceneOptions) {
    super(input, ctx, makePlayer(), opts);
  }

  protected renderContent(buffer: CharBuffer, top: number, bottom: number): void {
    this.capturedTop = top;
    this.capturedBottom = bottom;
    this.renderCount++;
  }

  protected override onTabChange(newIdx: number): void {
    this.tabChanges.push(newIdx);
  }

  getActiveTabIdx(): number { return this.activeTabIdx; }
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('BaseScene', () => {
  describe('buffer clearing', () => {
    it('clears all cells to space/black/black before rendering', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, { navOptions: [] });
      const buf = makeDirtyBuffer(40, 30);
      scene.render(buf);
      // Row 2 is the gap between header and content — chrome doesn't write there
      for (const cell of buf[2]) {
        expect(cell.char).toBe(' ');
        expect(cell.fg).toBe('black');
        expect(cell.bg).toBe('black');
      }
    });

    it('clears cells even if they were non-default before render', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, { navOptions: [], title: 'T' });
      const buf = makeDirtyBuffer(40, 30);
      scene.render(buf);
      // Render again with a clean call — gap row should still be blank
      expect(rowText(buf, 2)).toBe('');
    });
  });

  describe('chrome rendering', () => {
    it('renders system name in row 0', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, { navOptions: [] });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Default player is in 'sol' system
      expect(rowText(buf, 0).toUpperCase()).toContain('SOL');
    });

    it('renders destination name in row 1', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, { navOptions: [] });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Default player is at 'elysium-station'
      expect(rowText(buf, 1).toUpperCase()).toContain('ELYSIUM');
    });

    it('renders footer nav button when navOptions provided', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, { navOptions: [{ id: 'back', label: 'BACK' }] });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Footer is at row h-1 = 29
      expect(rowText(buf, 29)).toContain('BACK');
    });
  });

  describe('title and underline rendering', () => {
    it('renders title at CONTENT_TOP (row 3) in bright-white', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, { navOptions: [], title: 'MY SCENE' });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, CONTENT_TOP)).toContain('MY SCENE');
      const firstChar = buf[CONTENT_TOP].find((c, i) => c.char !== ' ' && i >= 2);
      expect(firstChar?.fg).toBe('bright-white');
    });

    it("renders apostrophe underline at CONTENT_TOP+1 in bright-black", () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, { navOptions: [], title: 'MY SCENE' });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, CONTENT_TOP + 1)).toContain("'");
      expect(buf[CONTENT_TOP + 1].find(c => c.char === "'")?.fg).toBe('bright-black');
    });

    it('underline length matches title length', () => {
      const input = new MockInputHandler();
      const title = 'ABCDE';
      const scene = new TestScene(input, { navOptions: [], title });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const underline = buf[CONTENT_TOP + 1].slice(2, 2 + title.length).map(c => c.char).join('');
      expect(underline).toBe("'".repeat(title.length));
    });
  });

  describe('summary rendering', () => {
    it('renders summary lines below the underline', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        summary: ['Line one', 'Line two'],
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Summary starts at CONTENT_TOP + 2 (base + 2 + 0)
      expect(rowText(buf, CONTENT_TOP + 2)).toContain('Line one');
      expect(rowText(buf, CONTENT_TOP + 3)).toContain('Line two');
    });

    it('renders summary lines in bright-black', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        summary: ['Info line'],
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const firstChar = buf[CONTENT_TOP + 2].find(c => c.char !== ' ');
      expect(firstChar?.fg).toBe('bright-black');
    });
  });

  describe('tab bar rendering', () => {
    it('renders tab labels at CONTENT_TOP+3 (with title, no summary)', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        tabs: ['ALPHA', 'BETA'],
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const tabRow = CONTENT_TOP + 3;  // base + 3 + N (N=0)
      expect(rowText(buf, tabRow)).toContain('ALPHA');
      expect(rowText(buf, tabRow)).toContain('BETA');
    });

    it('renders active tab (index 0) with bg green', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        tabs: ['ALPHA', 'BETA'],
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const tabRow = CONTENT_TOP + 3;
      // Tab 0 occupies cols 3–7 (' ALPHA '); active tab has bg='green'
      const activeCell = buf[tabRow].find(c => c.char === 'A' && c.bg === 'green');
      expect(activeCell).toBeDefined();
    });

    it('renders inactive tab with bg black', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        tabs: ['ALPHA', 'BETA'],
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const tabRow = CONTENT_TOP + 3;
      // 'B' of 'BETA' should have bg='black' (inactive)
      const betaB = buf[tabRow].find(c => c.char === 'B' && c.fg === 'white');
      expect(betaB?.bg).toBe('black');
    });

    it('shifts tab bar down by N when summary lines are present', () => {
      const N = 2;
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        summary: ['a', 'b'],
        tabs: ['X', 'Y'],
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const tabRow = CONTENT_TOP + 3 + N;
      expect(rowText(buf, tabRow)).toContain('X');
      expect(rowText(buf, tabRow)).toContain('Y');
    });
  });

  describe('tab switching — action', () => {
    it('RIGHT action advances to tab 1', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        tabs: ['ALPHA', 'BETA'],
      });
      input.triggerAction('RIGHT');
      expect(scene.getActiveTabIdx()).toBe(1);
    });

    it('LEFT action from tab 1 returns to tab 0', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        tabs: ['ALPHA', 'BETA'],
      });
      input.triggerAction('RIGHT');
      input.triggerAction('LEFT');
      expect(scene.getActiveTabIdx()).toBe(0);
    });

    it('LEFT at tab 0 does not wrap', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        tabs: ['ALPHA', 'BETA'],
      });
      input.triggerAction('LEFT');
      expect(scene.getActiveTabIdx()).toBe(0);
    });

    it('RIGHT at last tab does not wrap', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        tabs: ['ALPHA', 'BETA'],
      });
      input.triggerAction('RIGHT');
      input.triggerAction('RIGHT');
      expect(scene.getActiveTabIdx()).toBe(1);
    });

    it('calls onTabChange with new index when tab changes', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        tabs: ['ALPHA', 'BETA', 'GAMMA'],
      });
      input.triggerAction('RIGHT');
      input.triggerAction('RIGHT');
      input.triggerAction('LEFT');
      expect(scene.tabChanges).toEqual([1, 2, 1]);
    });

    it('does not call onTabChange when already at boundary', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        tabs: ['ALPHA', 'BETA'],
      });
      input.triggerAction('LEFT'); // already at 0, no change
      expect(scene.tabChanges).toHaveLength(0);
    });
  });

  describe('tab switching — tap', () => {
    it('tap on tab 1 label switches to tab 1', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        tabs: ['FOO', 'BAR'],
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Tab bar layout: |3| FOO |9| BAR |15|
      // Tab 1 'BAR' occupies cols 9–13; tap at col 10 on the tab row
      const tabRow = CONTENT_TOP + 3;
      input.triggerTap(10, tabRow);
      expect(scene.getActiveTabIdx()).toBe(1);
    });

    it('tap on active tab does not call onTabChange', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        tabs: ['FOO', 'BAR'],
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const tabRow = CONTENT_TOP + 3;
      input.triggerTap(4, tabRow); // col 4 is inside tab 0 'FOO'
      expect(scene.tabChanges).toHaveLength(0);
    });

    it('tap on tab row outside any label does nothing', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        tabs: ['FOO', 'BAR'],
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const tabRow = CONTENT_TOP + 3;
      input.triggerTap(39, tabRow); // far right, no tab there
      expect(scene.getActiveTabIdx()).toBe(0);
      expect(scene.tabChanges).toHaveLength(0);
    });
  });

  describe('content boundary calculation', () => {
    it('top = CONTENT_TOP when no title', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, { navOptions: [] });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(scene.capturedTop).toBe(CONTENT_TOP);
    });

    it('top = CONTENT_TOP+3 with title, no tabs, no summary', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, { navOptions: [], title: 'X' });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(scene.capturedTop).toBe(CONTENT_TOP + 3);
    });

    it('top = CONTENT_TOP+5 with title and tabs, no summary', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'X',
        tabs: ['A', 'B'],
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(scene.capturedTop).toBe(CONTENT_TOP + 5);
    });

    it('top = CONTENT_TOP+3+N with title, N summary lines, no tabs', () => {
      const N = 3;
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'X',
        summary: Array.from({ length: N }, (_, i) => `line ${i}`),
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(scene.capturedTop).toBe(CONTENT_TOP + 3 + N);
    });

    it('top = CONTENT_TOP+5+N with title, N summary lines, and tabs', () => {
      const N = 2;
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'X',
        summary: ['a', 'b'],
        tabs: ['A', 'B'],
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(scene.capturedTop).toBe(CONTENT_TOP + 5 + N);
    });

    it('bottom = h-2 with standard footer (h=30)', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, { navOptions: [] });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(scene.capturedBottom).toBe(28); // 30 - 2
    });
  });

  describe('MENU action', () => {
    it('MENU action invokes onMenu callback', () => {
      const onMenu = vi.fn();
      const input = new MockInputHandler();
      new TestScene(input, { navOptions: [], onMenu });
      input.triggerAction('MENU');
      expect(onMenu).toHaveBeenCalledTimes(1);
    });

    it('MENU action does not reach handleAction', () => {
      const onMenu = vi.fn();
      let handleActionCalled = false;
      const input = new MockInputHandler();
      class TrackingScene extends TestScene {
        protected override handleAction(_action: GameAction): void {
          handleActionCalled = true;
        }
      }
      new TrackingScene(input, { navOptions: [], onMenu });
      input.triggerAction('MENU');
      expect(handleActionCalled).toBe(false);
    });

    it('non-MENU actions reach handleAction', () => {
      const input = new MockInputHandler();
      let received: string | null = null;
      class TrackingScene extends TestScene {
        protected override handleAction(action: GameAction): void {
          received = action;
        }
      }
      new TrackingScene(input, { navOptions: [] });
      input.triggerAction('SELECT');
      expect(received).toBe('SELECT');
    });
  });

  describe('nav tap routing', () => {
    it('tap on footer nav button calls handleNavTap', () => {
      const input = new MockInputHandler();
      let tappedId: string | null = null;
      class TrackingScene extends TestScene {
        protected override handleNavTap(navId: string): void {
          tappedId = navId;
        }
      }
      const scene = new TrackingScene(input, {
        navOptions: [{ id: 'back', label: 'BACK' }],
      });
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Footer is at row 29; BACK occupies the start of the footer row
      // Tap somewhere in the footer where BACK button is
      input.triggerTap(5, 29);
      expect(tappedId).toBe('back');
    });
  });

  describe('activated guard', () => {
    it('LEFT/RIGHT do not switch tabs after scene is activated', () => {
      const input = new MockInputHandler();
      const scene = new TestScene(input, {
        navOptions: [],
        title: 'T',
        tabs: ['A', 'B'],
      });
      scene.suspend();
      input.triggerAction('RIGHT');
      expect(scene.getActiveTabIdx()).toBe(0);
    });
  });
});
