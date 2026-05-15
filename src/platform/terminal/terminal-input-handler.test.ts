import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TerminalInputHandler } from './terminal-input-handler';
import type { GameAction } from '../../shared/types';

class MockStdin {
  setRawMode = vi.fn();
  resume = vi.fn();
  private listeners: Array<(chunk: { toString(): string }) => void> = [];

  on(_event: string, listener: (chunk: { toString(): string }) => void): void {
    this.listeners.push(listener);
  }

  removeListener(_event: string, listener: (chunk: { toString(): string }) => void): void {
    const idx = this.listeners.indexOf(listener);
    if (idx !== -1) this.listeners.splice(idx, 1);
  }

  emit(data: string): void {
    const chunk = { toString: () => data };
    for (const l of this.listeners) l(chunk);
  }

  listenerCount(): number {
    return this.listeners.length;
  }
}

describe('TerminalInputHandler', () => {
  let stdin: MockStdin;
  let handler: TerminalInputHandler;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let exitSpy: any;

  beforeEach(() => {
    stdin = new MockStdin();
    handler = new TerminalInputHandler(stdin);
    exitSpy = vi.spyOn(process as { exit(code?: number): void }, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it('onAction is callable', () => {
    expect(() => handler.onAction(() => {})).not.toThrow();
  });

  it('connect sets raw mode and attaches listener', () => {
    handler.connect();
    expect(stdin.setRawMode).toHaveBeenCalledWith(true);
    expect(stdin.resume).toHaveBeenCalled();
    expect(stdin.listenerCount()).toBe(1);
  });

  it('disconnect removes listener and restores cooked mode', () => {
    handler.connect();
    handler.disconnect();
    expect(stdin.setRawMode).toHaveBeenLastCalledWith(false);
    expect(stdin.listenerCount()).toBe(0);
  });

  const keyTests: Array<[string, string, GameAction]> = [
    ['arrow up', '\x1b[A', 'UP'],
    ['arrow down', '\x1b[B', 'DOWN'],
    ['arrow right', '\x1b[C', 'RIGHT'],
    ['arrow left', '\x1b[D', 'LEFT'],
    ['page up', '\x1b[5~', 'PAGE_UP'],
    ['page down', '\x1b[6~', 'PAGE_DOWN'],
    ['enter (CR)', '\r', 'SELECT'],
    ['enter (LF)', '\n', 'SELECT'],
    ['escape', '\x1b', 'BACK'],
    ['p lowercase', 'p', 'PAUSE'],
    ['P uppercase', 'P', 'PAUSE'],
  ];

  for (const [name, seq, action] of keyTests) {
    it(`maps ${name} to ${action}`, () => {
      const received: GameAction[] = [];
      handler.onAction(a => received.push(a));
      handler.connect();
      stdin.emit(seq);
      expect(received).toEqual([action]);
    });
  }

  it('calls multiple handlers independently', () => {
    const received1: GameAction[] = [];
    const received2: GameAction[] = [];
    handler.onAction(a => received1.push(a));
    handler.onAction(a => received2.push(a));
    handler.connect();
    stdin.emit('\x1b[A');
    expect(received1).toEqual(['UP']);
    expect(received2).toEqual(['UP']);
  });

  it('fires no events after disconnect', () => {
    const received: GameAction[] = [];
    handler.onAction(a => received.push(a));
    handler.connect();
    handler.disconnect();
    stdin.emit('\x1b[A');
    expect(received).toEqual([]);
  });

  it('ignores unmapped keys', () => {
    const received: GameAction[] = [];
    handler.onAction(a => received.push(a));
    handler.connect();
    stdin.emit('a');
    stdin.emit(' ');
    expect(received).toEqual([]);
  });

  it('tab fires TAB action', () => {
    const received: GameAction[] = [];
    handler.onAction(a => received.push(a));
    handler.connect();
    stdin.emit('\t');
    expect(received).toEqual(['TAB']);
  });

  it('digit fires both its NAV action and onCharInput', () => {
    const actions: GameAction[] = [];
    const chars: string[] = [];
    handler.onAction(a => actions.push(a));
    handler.onCharInput(c => chars.push(c));
    handler.connect();
    stdin.emit('3');
    expect(actions).toEqual(['NAV_3']);
    expect(chars).toEqual(['3']);
  });

  it('DEL (0x7f) fires onCharInput with backspace and no action', () => {
    const actions: GameAction[] = [];
    const chars: string[] = [];
    handler.onAction(a => actions.push(a));
    handler.onCharInput(c => chars.push(c));
    handler.connect();
    stdin.emit('\x7f');
    expect(actions).toEqual([]);
    expect(chars).toEqual(['\b']);
  });

  it('q triggers process.exit(0)', () => {
    handler.connect();
    stdin.emit('q');
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('Q triggers process.exit(0)', () => {
    handler.connect();
    stdin.emit('Q');
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('Ctrl+C triggers process.exit(0)', () => {
    handler.connect();
    stdin.emit('\x03');
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});
