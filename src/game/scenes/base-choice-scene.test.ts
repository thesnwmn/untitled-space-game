import { describe, it, expect, vi } from 'vitest';
import { BaseChoiceScene, type ChoiceItem } from './base-choice-scene';
import type { InputHandler, GameAction, CharBuffer, GameContext } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import { makePlayer } from '../../tests/makePlayer';

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
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as const, bg: 'black' as const }))
  );
}

function rowText(buffer: CharBuffer, row: number): string {
  return buffer[row].map(c => c.char).join('').trimEnd();
}

const keyboardContext: GameContext = {
  environment: 'browser', primaryInput: 'keyboard', debug: false,
};

class TestChoiceScene extends BaseChoiceScene {
  constructor(
    title: string,
    choices: ChoiceItem[],
    onBack: () => void,
    inputHandler: InputHandler,
    player: ReturnType<typeof makePlayer>,
  ) {
    super(
      title,
      choices,
      onBack,
      [],
      inputHandler,
      keyboardContext,
      player,
    );
  }

  protected renderContent(buffer: CharBuffer, top: number, contentBottom: number): void {
    if (top < buffer.length) {
      writeText(buffer, top, 2, 'Test Content', 'white', 'black');
    }
  }
}

describe('BaseChoiceScene', () => {
  it('renders title and choices', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();
    const action2 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', action: action1 },
      { label: 'OPTION 2', action: action2 },
    ];

    const scene = new TestChoiceScene('TEST TITLE', choices, onBack, inputHandler, player);
    const buffer = makeBuffer(40, 30);
    scene.render(buffer);

    expect(rowText(buffer, 3)).toContain('TEST TITLE');
    const allText = Array.from({ length: 30 }, (_, r) => rowText(buffer, r)).join('\n');
    expect(allText).toContain('OPTION 1');
    expect(allText).toContain('OPTION 2');
  });

  it('highlights first non-disabled choice on construction', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();
    const action2 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', action: action1 },
      { label: 'OPTION 2', action: action2 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    const buffer = makeBuffer(40, 30);
    scene.render(buffer);

    const option1Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 1'))!;
    expect(buffer[option1Row][2].char).toBe('>');
  });

  it('skips disabled choices and highlights first enabled', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();
    const action2 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', disabled: true, action: action1 },
      { label: 'OPTION 2', action: action2 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    const buffer = makeBuffer(40, 30);
    scene.render(buffer);

    const option2Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 2'))!;
    expect(buffer[option2Row][2].char).toBe('>');
  });

  it('sets cursor to -1 when all choices are disabled', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();
    const action2 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', disabled: true, action: action1 },
      { label: 'OPTION 2', disabled: true, action: action2 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    const buffer = makeBuffer(40, 30);
    scene.render(buffer);

    const option1Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 1'))!;
    const option2Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 2'))!;
    expect(buffer[option1Row][2].char).not.toBe('>');
    expect(buffer[option2Row][2].char).not.toBe('>');
  });

  it('moves cursor down with DOWN action', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();
    const action2 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', action: action1 },
      { label: 'OPTION 2', action: action2 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    let buffer = makeBuffer(40, 30);
    scene.render(buffer);

    let option1Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 1'))!;
    expect(buffer[option1Row][2].char).toBe('>');

    inputHandler.triggerAction('DOWN');
    buffer = makeBuffer(40, 30);
    scene.render(buffer);

    let option2Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 2'))!;
    expect(buffer[option2Row][2].char).toBe('>');
  });

  it('moves cursor up with UP action', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();
    const action2 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', action: action1 },
      { label: 'OPTION 2', action: action2 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    let buffer = makeBuffer(40, 30);

    inputHandler.triggerAction('DOWN');
    buffer = makeBuffer(40, 30);
    scene.render(buffer);
    let option2Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 2'))!;
    expect(buffer[option2Row][2].char).toBe('>');

    inputHandler.triggerAction('UP');
    buffer = makeBuffer(40, 30);
    scene.render(buffer);

    let option1Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 1'))!;
    expect(buffer[option1Row][2].char).toBe('>');
  });

  it('wraps cursor around at end with DOWN', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();
    const action2 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', action: action1 },
      { label: 'OPTION 2', action: action2 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);

    inputHandler.triggerAction('DOWN');
    let buffer = makeBuffer(40, 30);
    scene.render(buffer);

    inputHandler.triggerAction('DOWN');
    buffer = makeBuffer(40, 30);
    scene.render(buffer);

    let option1Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 1'))!;
    expect(buffer[option1Row][2].char).toBe('>');
  });

  it('skips disabled choices when navigating', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();
    const action2 = vi.fn();
    const action3 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', action: action1 },
      { label: 'OPTION 2', disabled: true, action: action2 },
      { label: 'OPTION 3', action: action3 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    let buffer = makeBuffer(40, 30);

    scene.render(buffer);
    let option1Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 1'))!;
    expect(buffer[option1Row][2].char).toBe('>');

    inputHandler.triggerAction('DOWN');
    buffer = makeBuffer(40, 30);
    scene.render(buffer);

    let option3Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 3'))!;
    expect(buffer[option3Row][2].char).toBe('>');
  });

  it('activates choice with SELECT action', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();
    const action2 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', action: action1 },
      { label: 'OPTION 2', action: action2 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    scene.render(makeBuffer(40, 30));

    inputHandler.triggerAction('SELECT');

    expect(action1).toHaveBeenCalled();
    expect(action2).not.toHaveBeenCalled();
  });

  it('does not activate disabled choice with SELECT', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', disabled: true, action: action1 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    scene.render(makeBuffer(40, 30));

    inputHandler.triggerAction('SELECT');

    expect(action1).not.toHaveBeenCalled();
  });

  it('calls onBack with BACK action', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', action: action1 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    scene.render(makeBuffer(40, 30));

    inputHandler.triggerAction('BACK');

    expect(onBack).toHaveBeenCalled();
  });

  it('calls onBack with BACK regardless of cursor position', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();
    const action2 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', action: action1 },
      { label: 'OPTION 2', action: action2 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    let buffer = makeBuffer(40, 30);
    scene.render(buffer);

    inputHandler.triggerAction('DOWN');
    buffer = makeBuffer(40, 30);
    scene.render(buffer);

    inputHandler.triggerAction('BACK');

    expect(onBack).toHaveBeenCalled();
  });

  it('activates choice via tap', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();
    const action2 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', action: action1 },
      { label: 'OPTION 2', action: action2 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    const buffer = makeBuffer(40, 30);
    scene.render(buffer);

    const option2Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 2'))!;
    inputHandler.triggerTap(10, option2Row);

    expect(action1).not.toHaveBeenCalled();
    expect(action2).toHaveBeenCalled();
  });

  it('does not activate disabled choice via tap', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', disabled: true, action: action1 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    const buffer = makeBuffer(40, 30);
    scene.render(buffer);

    const option1Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 1'))!;
    inputHandler.triggerTap(10, option1Row);

    expect(action1).not.toHaveBeenCalled();
  });

  it('renders choice details below label', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', details: ['Reason line 1', 'Reason line 2'], action: action1 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    const buffer = makeBuffer(40, 30);
    scene.render(buffer);

    const allText = Array.from({ length: 30 }, (_, r) => rowText(buffer, r)).join('\n');
    expect(allText).toContain('Reason line 1');
    expect(allText).toContain('Reason line 2');
  });

  it('renders separator above choices', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', action: action1 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    const buffer = makeBuffer(40, 30);
    scene.render(buffer);

    let separatorFound = false;
    for (let r = 0; r < buffer.length; r++) {
      const text = rowText(buffer, r);
      if (text.match(/^-+$/)) {
        separatorFound = true;
        break;
      }
    }
    expect(separatorFound).toBe(true);
  });

  it('highlights cursor choice in bright-green', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();
    const action2 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', action: action1 },
      { label: 'OPTION 2', action: action2 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    const buffer = makeBuffer(40, 30);
    scene.render(buffer);

    const option1Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 1'))!;
    const cursorCell = buffer[option1Row][2];
    expect(cursorCell.fg).toBe('bright-green');
  });

  it('renders disabled choice in bright-black', () => {
    const inputHandler = new MockInputHandler();
    const player = makePlayer();
    const onBack = vi.fn();
    const action1 = vi.fn();

    const choices: ChoiceItem[] = [
      { label: 'OPTION 1', disabled: true, action: action1 },
    ];

    const scene = new TestChoiceScene('TEST', choices, onBack, inputHandler, player);
    const buffer = makeBuffer(40, 30);
    scene.render(buffer);

    const option1Row = Array.from({ length: 30 }, (_, r) => r).find(r => rowText(buffer, r).includes('OPTION 1'))!;
    const labelCell = buffer[option1Row][3];
    expect(labelCell.fg).toBe('bright-black');
  });
});
