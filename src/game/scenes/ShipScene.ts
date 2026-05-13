import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText, writeCentered } from '../../shared/buffer-utils';
import { STATION_NAME } from '../constants';
import { Starfield } from './Starfield';
import { SpaceStation } from './SpaceStation';
import { STATION_TYPES } from './station-types';

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
const LOCATION_ROW = 1;
const WINDOW_TOP = 2;

const BUTTONS = ['[ J ] JUMP', '[ D ] DOCK'];

function buildButtonLine(cursorIdx: number): string {
  return cursorIdx === 0
    ? '> [ J ] JUMP   [ D ] DOCK'
    : '  [ J ] JUMP  > [ D ] DOCK';
}

export class ShipScene implements Scene {
  private readonly state: PlayerState;
  private readonly context: GameContext;
  private cursorIdx = 0;
  private activated = false;
  private h = 30;
  private w = 40;
  private readonly starfield: Starfield;
  private station: SpaceStation | null = null;

  constructor(inputHandler: InputHandler, context: GameContext, onDock: () => void) {
    this.state = { ...INITIAL_STATE };
    this.context = context;
    this.starfield = new Starfield();

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
          this.activated = true;
          onDock();
        }
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((col, row) => {
        if (this.activated) return;
        if (row === this.h - 2) {
          if (col < this.w / 2) {
            this.cursorIdx = 0;
            console.log('[Ship] Jumping…');
          } else {
            this.activated = true;
            onDock();
          }
        }
      });
    }
  }

  update(dt: number): void {
    this.starfield.update(dt);
    if (this.station) this.station.update(dt);
  }

  render(buffer: CharBuffer): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;
    this.h = h;
    this.w = w;

    // Clear buffer
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };
      }
    }

    // Layout constants
    const windowSill = h - 4;     // |_____|
    const windowBot = h - 3;      // /     \
    const intRowStart = WINDOW_TOP + 1;
    const intRowEnd = windowSill - 1;
    const intColStart = 2;      // border at col 1; one col of padding on each side
    const intColEnd = w - 3;    // border at col w-2
    const buttonsRow = h - 2;
    const footerRow = h - 1;

    // Status bar (row 0)
    const statusText = `FUEL:${this.state.fuel}% | CARGO:${this.state.cargo}/${this.state.cargoCapacity}T | CR:${this.state.credits}`;
    writeText(buffer, STATUS_ROW, 1, statusText, 'bright-cyan', 'black');

    // Location (row 1)
    const locationText = `Location: ${STATION_NAME.toUpperCase()}`;
    writeText(buffer, LOCATION_ROW, 1, locationText, 'bright-cyan', 'black');

    // Window border — top row: \____/  (inset 1 col each side)
    buffer[WINDOW_TOP][1] = { char: '\\', fg: 'bright-black', bg: 'black' };
    buffer[WINDOW_TOP][w - 2] = { char: '/', fg: 'bright-black', bg: 'black' };
    for (let c = 2; c < w - 2; c++) {
      buffer[WINDOW_TOP][c] = { char: '_', fg: 'bright-black', bg: 'black' };
    }

    // Window border — side columns (interior rows)
    for (let r = intRowStart; r <= intRowEnd; r++) {
      buffer[r][1] = { char: '|', fg: 'bright-black', bg: 'black' };
      buffer[r][w - 2] = { char: '|', fg: 'bright-black', bg: 'black' };
    }

    // Window sill row: |_____|
    if (windowSill >= 0 && windowSill < h) {
      buffer[windowSill][1] = { char: '|', fg: 'bright-black', bg: 'black' };
      buffer[windowSill][w - 2] = { char: '|', fg: 'bright-black', bg: 'black' };
      for (let c = 2; c < w - 2; c++) {
        buffer[windowSill][c] = { char: '_', fg: 'bright-black', bg: 'black' };
      }
    }

    // Window corners row: /     \
    if (windowBot >= 0 && windowBot < h) {
      buffer[windowBot][1] = { char: '/', fg: 'bright-black', bg: 'black' };
      buffer[windowBot][w - 2] = { char: '\\', fg: 'bright-black', bg: 'black' };
      for (let c = 2; c < w - 2; c++) {
        buffer[windowBot][c] = { char: ' ', fg: 'black', bg: 'black' };
      }
    }

    // Lazy-init space station once buffer dimensions are known
    if (!this.station) {
      this.station = new SpaceStation(
        STATION_TYPES.RELAY,
        intRowStart, intRowEnd, intColStart, intColEnd,
      );
    }

    // Starfield then station (station draws on top)
    this.starfield.render(buffer, intRowStart, intRowEnd, intColStart, intColEnd);
    this.station.render(buffer);

    // Buttons row (both on one row, cursor prefix on selected)
    writeCentered(buffer, buttonsRow, buildButtonLine(this.cursorIdx), 'bright-yellow', 'black');

    // Footer hint
    const hint = this.context.primaryInput === 'touch'
      ? 'TAP to select'
      : '↑↓ navigate   ENTER select';
    writeCentered(buffer, footerRow, hint, 'bright-black', 'black');
  }
}
