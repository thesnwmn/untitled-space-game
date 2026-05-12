import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText, writeCentered } from '../../shared/buffer-utils';

interface PlayerState {
  fuel: number;
  cargo: number;
  cargoCapacity: number;
  credits: number;
}

const INITIAL_STATE: PlayerState = {
  fuel: 100,
  cargo: 0,
  cargoCapacity: 50,
  credits: 5000,
};

const STATUS_ROW = 0;
const STARFIELD_START = 1;
const STARFIELD_END = 24;
const JUMP_ROW = 25;
const DOCK_ROW = 26;
const FOOTER_ROW = 27;

function lcgRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

type StarEntry = { row: number; col: number; char: '.' | '*' };

const STARS: StarEntry[] = (() => {
  const rand = lcgRand(0xabcd1234);
  const entries: StarEntry[] = [];
  for (let i = 0; i < 60; i++) {
    const row = STARFIELD_START + Math.floor(rand() * (STARFIELD_END - STARFIELD_START + 1));
    const col = 1 + Math.floor(rand() * 38);
    const char: '.' | '*' = rand() < 0.3 ? '*' : '.';
    entries.push({ row, col, char });
  }
  return entries;
})();

const BUTTONS = ['[ J ] JUMP', '[ D ] DOCK'];

export class ShipScene implements Scene {
  private readonly state: PlayerState;
  private readonly context: GameContext;
  private cursorIdx = 0;
  private activated = false;

  constructor(inputHandler: InputHandler, context: GameContext, onBack: () => void) {
    this.state = { ...INITIAL_STATE };
    this.context = context;

    inputHandler.onAction((action) => {
      if (this.activated) return;
      if (action === 'UP') {
        this.cursorIdx = (this.cursorIdx - 1 + BUTTONS.length) % BUTTONS.length;
      } else if (action === 'DOWN') {
        this.cursorIdx = (this.cursorIdx + 1) % BUTTONS.length;
      } else if (action === 'SELECT') {
        if (this.cursorIdx === 0) {
          console.log('[Ship] Jumping…');
        } else {
          console.log('[Ship] Docking…');
        }
      } else if (action === 'BACK') {
        this.activated = true;
        onBack();
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((_col, row) => {
        if (this.activated) return;
        if (row === JUMP_ROW) {
          this.cursorIdx = 0;
          console.log('[Ship] Jumping…');
        } else if (row === DOCK_ROW) {
          this.cursorIdx = 1;
          console.log('[Ship] Docking…');
        }
      });
    }
  }

  update(_dt: number): void {}

  render(buffer: CharBuffer): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;

    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };
      }
    }

    const statusText = `FUEL:${this.state.fuel}% | CARGO:${this.state.cargo}/${this.state.cargoCapacity}T | CR:${this.state.credits}`;
    writeText(buffer, STATUS_ROW, 1, statusText, 'bright-cyan', 'black');

    for (const star of STARS) {
      if (star.row < h && star.col < w) {
        buffer[star.row][star.col] = { char: star.char, fg: 'bright-black', bg: 'black' };
      }
    }

    const buttonRows = [JUMP_ROW, DOCK_ROW];
    for (let i = 0; i < BUTTONS.length; i++) {
      const row = buttonRows[i];
      if (row >= h) continue;
      const isCursor = i === this.cursorIdx;
      const prefix = isCursor ? '> ' : '  ';
      const fg: Color = 'bright-yellow';
      writeCentered(buffer, row, prefix + BUTTONS[i], fg, 'black');
    }

    const hint = this.context.primaryInput === 'touch'
      ? 'TAP to select   2-finger exit'
      : '↑↓ navigate   ENTER select   ESC return';
    if (FOOTER_ROW < h) {
      writeCentered(buffer, FOOTER_ROW, hint, 'bright-black', 'black');
    }
  }
}
