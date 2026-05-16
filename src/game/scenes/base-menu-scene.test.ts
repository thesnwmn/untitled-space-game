import { describe, it, expect, vi } from 'vitest';
import { BaseMenuScene, type MenuItemDef } from './base-menu-scene';
import { ModalInputDialog } from '../ui/modal-input-dialog';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';

// ── helpers ──────────────────────────────────────────────────────────────────

class MockInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  private tapHandlers: Array<(col: number, row: number) => void> = [];
  private charInputHandlers: Array<(char: string) => void> = [];

  onAction(handler: (action: GameAction) => void): void {
    this.actionHandlers.push(handler);
  }

  onTap(handler: (col: number, row: number) => void): void {
    this.tapHandlers.push(handler);
  }

  onCharInput(handler: (char: string) => void): void {
    this.charInputHandlers.push(handler);
  }

  triggerAction(action: GameAction): void {
    for (const h of this.actionHandlers) h(action);
  }

  triggerTap(col: number, row: number): void {
    for (const h of this.tapHandlers) h(col, row);
  }

  triggerCharInput(char: string): void {
    for (const h of this.charInputHandlers) h(char);
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

// Concrete subclass — no nav overrides needed for most tests
class TestMenuScene extends BaseMenuScene {
  constructor(items: MenuItemDef[], input: MockInputHandler, infoLines: string[] = []) {
    super('TEST MENU', items, [], input, ctx, makePlayer(), infoLines);
  }

  // Expose for modal routing tests
  openTestModal(modal: ModalInputDialog): void { this.openModal(modal); }
  closeTestModal(): void { this.closeModal(); }
  isActivated(): boolean { return this.activated; }
  setMenuCallback(cb: () => void): void { this.onMenuCallback = cb; }
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

  describe('modal routing', () => {
    function makeModalWithSpies() {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      const modal = new ModalInputDialog({
        title: 'TEST',
        field: { label: 'Val', initialValue: 5, min: 0, max: 10 },
        derivedRows: [],
        confirmLabel: 'OK',
        onConfirm,
        onCancel,
      });
      return { modal, onConfirm, onCancel };
    }

    it('while modal open, onAction routes to modal not parent cursor', () => {
      const itemAction = vi.fn();
      const input = new MockInputHandler();
      const scene = new TestMenuScene(
        [{ label: 'ALPHA', action: itemAction }, { label: 'BETA', action: vi.fn() }],
        input,
      );
      const { modal } = makeModalWithSpies();
      scene.openTestModal(modal);

      // UP would normally move cursor; with modal open it should route to modal (UP = increment)
      // Buffer: after UP on modal field, value goes 5→6
      input.triggerAction('UP');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Cursor on parent should still be at item 0 (ALPHA has '>')
      expect(rowText(buf, ITEM_ROW_START)).toContain('> ALPHA');
    });

    it('while modal open, onAction does not reach parent SELECT', () => {
      const itemAction = vi.fn();
      const input = new MockInputHandler();
      const scene = new TestMenuScene([{ label: 'ALPHA', action: itemAction }], input);
      const { modal } = makeModalWithSpies();
      scene.openTestModal(modal);

      input.triggerAction('SELECT'); // goes to modal.onConfirm, not parent itemAction
      expect(itemAction).not.toHaveBeenCalled();
    });

    it('while modal open, onTap routes to modal not parent items', () => {
      const itemAction = vi.fn();
      const input = new MockInputHandler();
      const scene = new TestMenuScene([{ label: 'ALPHA', action: itemAction }], input);
      const { modal } = makeModalWithSpies();
      scene.openTestModal(modal);

      // Tap on item row — should NOT fire itemAction
      input.triggerTap(10, ITEM_ROW_START);
      expect(itemAction).not.toHaveBeenCalled();
    });

    it('while modal open, onCharInput routes to modal field', () => {
      const input = new MockInputHandler();
      const scene = new TestMenuScene([{ label: 'ALPHA', action: vi.fn() }], input);
      const { modal, onConfirm } = makeModalWithSpies();
      scene.openTestModal(modal);

      // Type '3' then SELECT to confirm; onConfirm should get 3 (replaced initial 5)
      input.triggerCharInput('3');
      input.triggerAction('SELECT');
      expect(onConfirm).toHaveBeenCalledWith(3);
    });

    it('after closeModal, actions route to parent', () => {
      const itemAction = vi.fn();
      const input = new MockInputHandler();
      const scene = new TestMenuScene([{ label: 'ALPHA', action: itemAction }], input);
      const { modal } = makeModalWithSpies();
      scene.openTestModal(modal);
      scene.closeTestModal();

      input.triggerAction('SELECT'); // now routes to parent
      expect(itemAction).toHaveBeenCalledOnce();
    });

    it('MENU action invokes onMenuCallback without silencing the scene', () => {
      const onMenu = vi.fn();
      const selectAction = vi.fn();
      const input = new MockInputHandler();
      const scene = new TestMenuScene([{ label: 'ALPHA', action: selectAction }], input);
      scene.setMenuCallback(onMenu);
      input.triggerAction('MENU');
      expect(onMenu).toHaveBeenCalledTimes(1);
      expect(scene.isActivated()).toBe(false);
      // Scene still responds to input after menu is invoked
      input.triggerAction('SELECT');
      expect(selectAction).toHaveBeenCalledTimes(1);
    });

    it('header tap on [M] MENU area invokes onMenuCallback without silencing the scene', () => {
      const onMenu = vi.fn();
      const selectAction = vi.fn();
      const input = new MockInputHandler();
      const scene = new TestMenuScene([{ label: 'ALPHA', action: selectAction }], input);
      scene.setMenuCallback(onMenu);
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // [M] MENU occupies cols 30–37 in a w=40 buffer; row 0 is the header
      input.triggerTap(30, 0);
      expect(onMenu).toHaveBeenCalledTimes(1);
      expect(scene.isActivated()).toBe(false);
      input.triggerAction('SELECT');
      expect(selectAction).toHaveBeenCalledTimes(1);
    });

    it('modal renders on top of scene buffer', () => {
      const input = new MockInputHandler();
      const scene = new TestMenuScene([{ label: 'ALPHA', action: vi.fn() }], input);
      const { modal } = makeModalWithSpies();
      scene.openTestModal(modal);

      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // Modal border should be present: '+' at dialog top-left
      // dialogH=8, dialogCol=5, dialogRow=floor((30-8)/2)=11
      const dRow = Math.floor((30 - 8) / 2);
      expect(buf[dRow][5].char).toBe('+');
    });
  });
});
