import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText, writeCentered } from '../../shared/buffer-utils';
import { getDestination, getSystem } from '../world/world-data';
import type { DestinationType } from '../world/types';
import { Starfield } from './Starfield';
import { SpaceStation } from './SpaceStation';
import { STATION_TYPES, type SpaceStationDef } from './station-types';

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

const DESTINATION_TYPE_TO_STATION: Record<DestinationType, SpaceStationDef> = {
  civilian:       STATION_TYPES.HUB,
  military:       STATION_TYPES.RELAY,
  research:       STATION_TYPES.RING,
  'black-market': STATION_TYPES.BEACON,
};

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
  private readonly locationLabel: string;
  private readonly stationType: SpaceStationDef;

  constructor(inputHandler: InputHandler, context: GameContext, destinationId: string, onDock: () => void) {
    this.state = { ...INITIAL_STATE };
    this.context = context;
    this.starfield = new Starfield();

    const dest = getDestination(destinationId)!;
    const sys = getSystem(dest.system)!;
    this.locationLabel = `${dest.name.toUpperCase()}  ·  ${sys.name.toUpperCase()}`;
    this.stationType = DESTINATION_TYPE_TO_STATION[dest.type] ?? STATION_TYPES.RELAY;

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

    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };
      }
    }

    const windowSill = h - 4;
    const windowBot = h - 3;
    const intRowStart = WINDOW_TOP + 1;
    const intRowEnd = windowSill - 1;
    const intColStart = 2;
    const intColEnd = w - 3;
    const buttonsRow = h - 2;
    const footerRow = h - 1;

    const statusText = `FUEL:${this.state.fuel}% | CARGO:${this.state.cargo}/${this.state.cargoCapacity}T | CR:${this.state.credits}`;
    writeText(buffer, STATUS_ROW, 1, statusText, 'bright-cyan', 'black');

    writeText(buffer, LOCATION_ROW, 1, this.locationLabel, 'bright-cyan', 'black');

    buffer[WINDOW_TOP][1] = { char: '\\', fg: 'bright-black', bg: 'black' };
    buffer[WINDOW_TOP][w - 2] = { char: '/', fg: 'bright-black', bg: 'black' };
    for (let c = 2; c < w - 2; c++) {
      buffer[WINDOW_TOP][c] = { char: '_', fg: 'bright-black', bg: 'black' };
    }

    for (let r = intRowStart; r <= intRowEnd; r++) {
      buffer[r][1] = { char: '|', fg: 'bright-black', bg: 'black' };
      buffer[r][w - 2] = { char: '|', fg: 'bright-black', bg: 'black' };
    }

    if (windowSill >= 0 && windowSill < h) {
      buffer[windowSill][1] = { char: '|', fg: 'bright-black', bg: 'black' };
      buffer[windowSill][w - 2] = { char: '|', fg: 'bright-black', bg: 'black' };
      for (let c = 2; c < w - 2; c++) {
        buffer[windowSill][c] = { char: '_', fg: 'bright-black', bg: 'black' };
      }
    }

    if (windowBot >= 0 && windowBot < h) {
      buffer[windowBot][1] = { char: '/', fg: 'bright-black', bg: 'black' };
      buffer[windowBot][w - 2] = { char: '\\', fg: 'bright-black', bg: 'black' };
      for (let c = 2; c < w - 2; c++) {
        buffer[windowBot][c] = { char: ' ', fg: 'black', bg: 'black' };
      }
    }

    if (!this.station) {
      this.station = new SpaceStation(
        this.stationType,
        intRowStart, intRowEnd, intColStart, intColEnd,
      );
    }

    this.starfield.render(buffer, intRowStart, intRowEnd, intColStart, intColEnd);
    this.station.render(buffer);

    writeCentered(buffer, buttonsRow, buildButtonLine(this.cursorIdx), 'bright-yellow', 'black');

    const hint = this.context.primaryInput === 'touch'
      ? 'TAP to select'
      : '↑↓ navigate   ENTER select';
    writeCentered(buffer, footerRow, hint, 'bright-black', 'black');
  }
}
