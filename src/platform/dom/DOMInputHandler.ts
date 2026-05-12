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

interface TouchPoint { startX: number; startY: number; }

export class DOMInputHandler implements InputHandler {
  private actionHandlers: ((action: GameAction) => void)[] = [];
  private tapHandlers: ((col: number, row: number) => void)[] = [];
  private touchStartMap = new Map<number, TouchPoint>();
  private keyListener: ((event: KeyboardEvent) => void) | null = null;
  private touchStartListener: ((event: TouchEvent) => void) | null = null;
  private touchEndListener: ((event: TouchEvent) => void) | null = null;

  onAction(handler: (action: GameAction) => void): void {
    this.actionHandlers.push(handler);
  }

  onTap(handler: (col: number, row: number) => void): void {
    this.tapHandlers.push(handler);
  }

  connect(): void {
    this.keyListener = (event: KeyboardEvent) => {
      const action = KEY_MAP[event.key];
      if (!action) return;
      if (PREVENT_DEFAULT_KEYS.has(event.key)) event.preventDefault();
      for (const handler of this.actionHandlers) handler(action);
    };
    document.addEventListener('keydown', this.keyListener);

    this.touchStartListener = (event: TouchEvent) => {
      event.preventDefault();
      for (const touch of Array.from(event.changedTouches)) {
        this.touchStartMap.set(touch.identifier, { startX: touch.clientX, startY: touch.clientY });
      }
    };

    this.touchEndListener = (event: TouchEvent) => {
      event.preventDefault();
      const changed = Array.from(event.changedTouches);

      if (changed.length === 2) {
        let allSmall = true;
        for (const touch of changed) {
          const start = this.touchStartMap.get(touch.identifier);
          if (!start || Math.abs(touch.clientX - start.startX) >= 20 || Math.abs(touch.clientY - start.startY) >= 20) {
            allSmall = false;
            break;
          }
        }
        if (allSmall) {
          for (const handler of this.actionHandlers) handler('BACK');
        }
      } else if (changed.length >= 1) {
        const touch = changed[0];
        const start = this.touchStartMap.get(touch.identifier);
        if (start) {
          const dx = touch.clientX - start.startX;
          const dy = touch.clientY - start.startY;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (absDx < 20 && absDy < 20) {
            const { col, row } = this.getGridCoords(touch.clientX, touch.clientY);
            for (const handler of this.tapHandlers) handler(col, row);
          } else {
            let action: GameAction;
            if (absDx >= absDy) {
              action = dx > 0 ? 'RIGHT' : 'LEFT';
            } else {
              action = dy > 0 ? 'DOWN' : 'UP';
            }
            for (const handler of this.actionHandlers) handler(action);
          }
        }
      }

      for (const touch of changed) {
        this.touchStartMap.delete(touch.identifier);
      }
    };

    document.body.addEventListener('touchstart', this.touchStartListener, { passive: false });
    document.body.addEventListener('touchend', this.touchEndListener, { passive: false });
  }

  disconnect(): void {
    if (this.keyListener) {
      document.removeEventListener('keydown', this.keyListener);
      this.keyListener = null;
    }
    if (this.touchStartListener) {
      document.body.removeEventListener('touchstart', this.touchStartListener);
      this.touchStartListener = null;
    }
    if (this.touchEndListener) {
      document.body.removeEventListener('touchend', this.touchEndListener);
      this.touchEndListener = null;
    }
    this.touchStartMap.clear();
  }

  private getGridCoords(clientX: number, clientY: number): { col: number; row: number } {
    const pre = document.querySelector('.game-screen') as HTMLElement | null;
    if (!pre) return { col: 0, row: 0 };
    const rect = pre.getBoundingClientRect();
    const cols = parseInt(pre.dataset['gridCols'] ?? '1');
    const rows = parseInt(pre.dataset['gridRows'] ?? '1');
    if (!cols || !rows || !rect.width || !rect.height) return { col: 0, row: 0 };
    return {
      col: Math.floor((clientX - rect.left) / (rect.width / cols)),
      row: Math.floor((clientY - rect.top) / (rect.height / rows)),
    };
  }
}
