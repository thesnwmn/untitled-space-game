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
  private touchCancelListener: ((event: TouchEvent) => void) | null = null;
  private debugEl: HTMLDivElement | null = null;
  private debugLog: string[] = [];

  private ensureDebug(): HTMLDivElement {
    if (this.debugEl) return this.debugEl;
    const el = document.createElement('div');
    el.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'right:0',
      'background:rgba(0,0,0,0.85)', 'color:#0f0',
      'font-family:monospace', 'font-size:11px',
      'padding:4px 6px', 'z-index:99999',
      'pointer-events:none', 'white-space:pre', 'line-height:1.25',
    ].join(';');
    document.body.appendChild(el);
    this.debugEl = el;
    return el;
  }

  private logDebug(line: string): void {
    this.debugLog.unshift(line);
    if (this.debugLog.length > 8) this.debugLog.length = 8;
    this.ensureDebug().textContent = this.debugLog.join('\n');
  }

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
      for (const handler of this.actionHandlers.slice()) handler(action);
    };
    document.addEventListener('keydown', this.keyListener);

    this.touchStartListener = (event: TouchEvent) => {
      event.preventDefault();
      for (const touch of Array.from(event.changedTouches)) {
        this.touchStartMap.set(touch.identifier, { startX: touch.clientX, startY: touch.clientY });
        this.logDebug(`START id=${touch.identifier} (${Math.round(touch.clientX)},${Math.round(touch.clientY)}) n=${event.touches.length}`);
      }
    };

    this.touchEndListener = (event: TouchEvent) => {
      event.preventDefault();
      const changed = Array.from(event.changedTouches);
      this.logDebug(`END raw: changed=${changed.length} total=${event.touches.length}`);

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
          this.logDebug(`END 2-finger -> BACK`);
          for (const handler of this.actionHandlers.slice()) handler('BACK');
        } else {
          this.logDebug(`END 2-finger (not tap)`);
        }
      } else if (changed.length >= 1) {
        const touch = changed[0];
        const start = this.touchStartMap.get(touch.identifier);
        if (!start) {
          this.logDebug(`END id=${touch.identifier} (${Math.round(touch.clientX)},${Math.round(touch.clientY)}) NO START`);
        } else {
          const dx = touch.clientX - start.startX;
          const dy = touch.clientY - start.startY;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (absDx < 20 && absDy < 20) {
            const rect = this.getRectInfo();
            const coords = this.getGridCoords(start.startX, start.startY);
            if (coords) {
              this.logDebug(`TAP start=(${Math.round(start.startX)},${Math.round(start.startY)}) rect=${rect} -> (col=${coords.col},row=${coords.row}) handlers=${this.tapHandlers.length}`);
              for (const handler of this.tapHandlers.slice()) handler(coords.col, coords.row);
            } else {
              this.logDebug(`TAP start=(${Math.round(start.startX)},${Math.round(start.startY)}) rect=${rect} -> OUT OF BOUNDS`);
            }
          } else {
            let action: GameAction;
            if (absDx >= absDy) {
              action = dx > 0 ? 'RIGHT' : 'LEFT';
            } else {
              action = dy > 0 ? 'DOWN' : 'UP';
            }
            this.logDebug(`SWIPE dx=${Math.round(dx)} dy=${Math.round(dy)} -> ${action}`);
            for (const handler of this.actionHandlers.slice()) handler(action);
          }
        }
      }

      for (const touch of changed) {
        this.touchStartMap.delete(touch.identifier);
      }
    };

    this.touchCancelListener = (event: TouchEvent) => {
      const ids = Array.from(event.changedTouches).map(t => t.identifier).join(',');
      this.logDebug(`CANCEL ids=${ids}`);
      for (const touch of Array.from(event.changedTouches)) {
        this.touchStartMap.delete(touch.identifier);
      }
    };

    document.body.addEventListener('touchstart', this.touchStartListener, { passive: false });
    document.body.addEventListener('touchend', this.touchEndListener, { passive: false });
    document.body.addEventListener('touchcancel', this.touchCancelListener, { passive: false });
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
    if (this.touchCancelListener) {
      document.body.removeEventListener('touchcancel', this.touchCancelListener);
      this.touchCancelListener = null;
    }
    this.touchStartMap.clear();
  }

  private getRectInfo(): string {
    const pre = document.querySelector('.game-screen') as HTMLElement | null;
    if (!pre) return 'NO PRE';
    const r = pre.getBoundingClientRect();
    return `L${Math.round(r.left)},T${Math.round(r.top)},R${Math.round(r.right)},B${Math.round(r.bottom)}`;
  }

  private getGridCoords(clientX: number, clientY: number): { col: number; row: number } | null {
    const pre = document.querySelector('.game-screen') as HTMLElement | null;
    if (!pre) return null;
    const rect = pre.getBoundingClientRect();
    const cols = parseInt(pre.dataset['gridCols'] ?? '1');
    const rows = parseInt(pre.dataset['gridRows'] ?? '1');
    if (!cols || !rows || !rect.width || !rect.height) return null;
    const col = Math.floor((clientX - rect.left) / (rect.width / cols));
    const row = Math.floor((clientY - rect.top) / (rect.height / rows));
    if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
    return { col, row };
  }
}
