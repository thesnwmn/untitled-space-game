import { describe, it, expect } from 'vitest';
import { TerminalInputHandler } from './TerminalInputHandler';

describe('TerminalInputHandler', () => {
  it('onAction is callable', () => {
    const h = new TerminalInputHandler();
    expect(() => h.onAction(() => {})).not.toThrow();
  });
});
