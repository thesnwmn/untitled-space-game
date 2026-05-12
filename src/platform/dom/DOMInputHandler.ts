import type { InputHandler, GameAction } from '../../shared/types';

const KEY_MAP: Record<string, GameAction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  PageUp: 'PAGE_UP',
  PageDown: 'PAGE_DOWN',
  Enter: 'SELECT',
  Escape: 'BACK',
  p: 'PAUSE',
  P: 'PAUSE',
};

const PREVENT_DEFAULT_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown',
]);

export class DOMInputHandler implements InputHandler {
  private actionHandlers: ((action: GameAction) => void)[] = [];
  private listener: ((event: KeyboardEvent) => void) | null = null;

  onAction(handler: (action: GameAction) => void): void {
    this.actionHandlers.push(handler);
  }

  onTap(_handler: (col: number, row: number) => void): void {}

  connect(): void {
    this.listener = (event: KeyboardEvent) => {
      const action = KEY_MAP[event.key];
      if (!action) return;
      if (PREVENT_DEFAULT_KEYS.has(event.key)) event.preventDefault();
      for (const handler of this.actionHandlers) handler(action);
    };
    document.addEventListener('keydown', this.listener);
  }

  disconnect(): void {
    if (this.listener) {
      document.removeEventListener('keydown', this.listener);
      this.listener = null;
    }
  }
}
