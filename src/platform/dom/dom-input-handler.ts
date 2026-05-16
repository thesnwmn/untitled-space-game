import type { InputHandler, GameAction, GameContext } from '../../shared/types';

const KEY_MAP: Record<string, GameAction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  PageUp: 'PAGE_UP',
  PageDown: 'PAGE_DOWN',
  '[': 'PAGE_UP',
  ']': 'PAGE_DOWN',
  Enter: 'SELECT',
  Escape: 'BACK',
  Tab: 'TAB',
  p: 'PAUSE',
  P: 'PAUSE',
  c: 'CARGO',
  C: 'CARGO',
  m: 'MENU',
  M: 'MENU',
  '1': 'NAV_1',
  '2': 'NAV_2',
  '3': 'NAV_3',
  '4': 'NAV_4',
  '5': 'NAV_5',
  '6': 'NAV_6',
  '7': 'NAV_7',
  '8': 'NAV_8',
  '9': 'NAV_9',
};

const DIGIT_KEYS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

const PREVENT_DEFAULT_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Tab',
]);

interface PointerStart { startX: number; startY: number; }

export class DOMInputHandler implements InputHandler {
  private actionHandlers: ((action: GameAction) => void)[] = [];
  private tapHandlers: ((col: number, row: number) => void)[] = [];
  private charInputHandlers: ((char: string) => void)[] = [];
  private pointerStartMap = new Map<number, PointerStart>();
  private activePointers = new Set<number>();
  private keyListener: ((event: KeyboardEvent) => void) | null = null;
  private pointerDownListener: ((event: PointerEvent) => void) | null = null;
  private pointerUpListener: ((event: PointerEvent) => void) | null = null;
  private pointerCancelListener: ((event: PointerEvent) => void) | null = null;
  private readonly debugMode: boolean;
  private debugEl: HTMLDivElement | null = null;
  private debugLog: string[] = [];

  constructor(context: GameContext) {
    this.debugMode = context.debug;
  }

  private logDebug(line: string): void {
    if (!this.debugMode) return;
    this.debugLog.unshift(line);
    if (this.debugLog.length > 8) this.debugLog.length = 8;
    if (!this.debugEl) {
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
    }
    this.debugEl.textContent = this.debugLog.join('\n');
  }

  onAction(handler: (action: GameAction) => void): void {
    this.actionHandlers.push(handler);
  }

  onTap(handler: (col: number, row: number) => void): void {
    this.tapHandlers.push(handler);
  }

  onCharInput(handler: (char: string) => void): void {
    this.charInputHandlers.push(handler);
  }

  connect(): void {
    this.keyListener = (event: KeyboardEvent) => {
      if (PREVENT_DEFAULT_KEYS.has(event.key)) event.preventDefault();

      // Digit keys: fire charInput AND fall through to KEY_MAP (for NAV_1–NAV_9)
      if (DIGIT_KEYS.has(event.key)) {
        for (const h of this.charInputHandlers.slice()) h(event.key);
      }

      // Backspace/Delete: fire charInput only
      if (event.key === 'Backspace' || event.key === 'Delete') {
        for (const h of this.charInputHandlers.slice()) h('\b');
        return;
      }

      const action = KEY_MAP[event.key];
      if (!action) return;
      for (const handler of this.actionHandlers.slice()) handler(action);
    };
    document.addEventListener('keydown', this.keyListener);

    this.pointerDownListener = (event: PointerEvent) => {
      event.preventDefault();
      this.pointerStartMap.set(event.pointerId, { startX: event.clientX, startY: event.clientY });
      this.activePointers.add(event.pointerId);
      this.logDebug(`DOWN id=${event.pointerId} (${Math.round(event.clientX)},${Math.round(event.clientY)}) type=${event.pointerType} active=${this.activePointers.size}`);
    };

    this.pointerUpListener = (event: PointerEvent) => {
      const start = this.pointerStartMap.get(event.pointerId);
      const activeCount = this.activePointers.size;
      this.activePointers.delete(event.pointerId);
      this.pointerStartMap.delete(event.pointerId);

      if (!start) {
        this.logDebug(`UP id=${event.pointerId} NO START`);
        return;
      }

      const dx = event.clientX - start.startX;
      const dy = event.clientY - start.startY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < 20 && absDy < 20) {
        if (activeCount >= 2) {
          // first finger of a 2-finger tap → BACK
          this.logDebug(`UP id=${event.pointerId} 2-finger tap -> BACK`);
          this.activePointers.clear();
          this.pointerStartMap.clear();
          for (const handler of this.actionHandlers.slice()) handler('BACK');
        } else {
          const rect = this.getRectInfo();
          const coords = this.getGridCoords(start.startX, start.startY);
          if (coords) {
            this.logDebug(`TAP (${Math.round(start.startX)},${Math.round(start.startY)}) rect=${rect} -> col=${coords.col} row=${coords.row} h=${this.tapHandlers.length}`);
            for (const handler of this.tapHandlers.slice()) handler(coords.col, coords.row);
          } else {
            this.logDebug(`TAP (${Math.round(start.startX)},${Math.round(start.startY)}) rect=${rect} -> OOB`);
          }
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
    };

    this.pointerCancelListener = (event: PointerEvent) => {
      this.logDebug(`CANCEL id=${event.pointerId}`);
      this.activePointers.delete(event.pointerId);
      this.pointerStartMap.delete(event.pointerId);
    };

    window.addEventListener('pointerdown', this.pointerDownListener);
    window.addEventListener('pointerup', this.pointerUpListener);
    window.addEventListener('pointercancel', this.pointerCancelListener);
  }

  disconnect(): void {
    if (this.keyListener) {
      document.removeEventListener('keydown', this.keyListener);
      this.keyListener = null;
    }
    if (this.pointerDownListener) {
      window.removeEventListener('pointerdown', this.pointerDownListener);
      this.pointerDownListener = null;
    }
    if (this.pointerUpListener) {
      window.removeEventListener('pointerup', this.pointerUpListener);
      this.pointerUpListener = null;
    }
    if (this.pointerCancelListener) {
      window.removeEventListener('pointercancel', this.pointerCancelListener);
      this.pointerCancelListener = null;
    }
    this.pointerStartMap.clear();
    this.activePointers.clear();
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
