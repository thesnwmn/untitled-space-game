import type { InputHandler, GameAction } from '../../shared/types';

interface StdinLike {
  setRawMode?(flag: boolean): void;
  resume(): void;
  on(event: 'data', listener: (chunk: { toString(): string }) => void): void;
  removeListener(event: 'data', listener: (chunk: { toString(): string }) => void): void;
}

const KEY_MAP: Array<[string, GameAction]> = [
  ['\x1b[A', 'UP'],
  ['\x1b[B', 'DOWN'],
  ['\x1b[C', 'RIGHT'],
  ['\x1b[D', 'LEFT'],
  ['\x1b[5~', 'PAGE_UP'],
  ['\x1b[6~', 'PAGE_DOWN'],
  ['[', 'PAGE_UP'],
  [']', 'PAGE_DOWN'],
  ['\r', 'SELECT'],
  ['\n', 'SELECT'],
  ['\x1b', 'BACK'],
  ['p', 'PAUSE'],
  ['P', 'PAUSE'],
  ['c', 'CARGO'],
  ['C', 'CARGO'],
  ['1', 'NAV_1'],
  ['2', 'NAV_2'],
  ['3', 'NAV_3'],
  ['4', 'NAV_4'],
  ['5', 'NAV_5'],
  ['6', 'NAV_6'],
  ['7', 'NAV_7'],
  ['8', 'NAV_8'],
  ['9', 'NAV_9'],
];

const EXIT_KEYS = new Set(['\x03', 'q', 'Q']);

export class TerminalInputHandler implements InputHandler {
  private readonly stdin: StdinLike;
  private handlers: Array<(action: GameAction) => void> = [];
  private dataHandler: ((chunk: { toString(): string }) => void) | null = null;

  constructor(stdin: StdinLike = process.stdin) {
    this.stdin = stdin;
  }

  onAction(handler: (action: GameAction) => void): void {
    this.handlers.push(handler);
  }

  connect(): void {
    this.dataHandler = (chunk) => {
      const key = chunk.toString();
      if (EXIT_KEYS.has(key)) {
        process.exit(0);
        return;
      }
      for (const [seq, action] of KEY_MAP) {
        if (key === seq) {
          for (const h of this.handlers) h(action);
          return;
        }
      }
    };
    this.stdin.setRawMode?.(true);
    this.stdin.resume();
    this.stdin.on('data', this.dataHandler);
  }

  disconnect(): void {
    if (this.dataHandler) {
      this.stdin.removeListener('data', this.dataHandler);
      this.dataHandler = null;
    }
    this.stdin.setRawMode?.(false);
  }
}
