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

// Button text widths: TRAVEL part = 14 chars, DOCK part = 12 chars, gap = 2 → total 28
const TRAVEL_PART_WIDTH = 14; // '> [ T ] TRAVEL' or '  [ T ] TRAVEL'
const GAP_WIDTH = 2;

const DESTINATION_TYPE_TO_STATION: Record<DestinationType, SpaceStationDef> = {
  civilian:       STATION_TYPES.HUB,
  military:       STATION_TYPES.RELAY,
  research:       STATION_TYPES.RING,
  'black-market': STATION_TYPES.BEACON,
};

export class ShipScene implements Scene {
  private readonly state: PlayerState;
  private readonly context: GameContext;
  private readonly inSpace: boolean;
  private cursorIdx = 0;
  private activated = false;
  private h = 30;
  private w = 40;
  private readonly starfield: Starfield;
  private station: SpaceStation | null = null;
  private readonly locationLabel: string;
  private readonly stationType: SpaceStationDef | null;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    systemId: string,
    destinationId: string | null,
    onTravel: () => void,
    onDock: () => void,
  ) {
    this.state = { ...INITIAL_STATE };
    this.context = context;
    this.starfield = new Starfield();
    this.inSpace = destinationId === null;

    const sys = getSystem(systemId)!;
    if (destinationId !== null) {
      const dest = getDestination(destinationId)!;
      this.locationLabel = `${dest.name.toUpperCase()}  ·  ${sys.name.toUpperCase()}`;
      this.stationType = DESTINATION_TYPE_TO_STATION[dest.type] ?? STATION_TYPES.RELAY;
    } else {
      this.locationLabel = `IN SPACE  ·  ${sys.name.toUpperCase()}`;
      this.stationType = null;
    }

    const navCount = () => this.inSpace ? 1 : 2;

    inputHandler.onAction((action) => {
      if (this.activated) return;
      if (action === 'UP') {
        this.cursorIdx = (this.cursorIdx - 1 + navCount()) % navCount();
      } else if (action === 'DOWN') {
        this.cursorIdx = (this.cursorIdx + 1) % navCount();
      } else if (action === 'SELECT') {
        if (this.cursorIdx === 0) {
          this.activated = true;
          onTravel();
        } else if (!this.inSpace) {
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
            this.activated = true;
            onTravel();
          } else if (!this.inSpace) {
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

    if (this.stationType && !this.station) {
      this.station = new SpaceStation(
        this.stationType,
        intRowStart, intRowEnd, intColStart, intColEnd,
      );
    }

    this.starfield.render(buffer, intRowStart, intRowEnd, intColStart, intColEnd);
    if (this.station) this.station.render(buffer);

    // Render TRAVEL and DOCK as separate parts so DOCK can be greyed when in space
    const travelText = (this.cursorIdx === 0 ? '> ' : '  ') + '[ T ] TRAVEL';
    const dockText = (this.cursorIdx === 1 && !this.inSpace ? '> ' : '  ')
      + (this.inSpace ? '[ - ] DOCK' : '[ D ] DOCK');
    const totalWidth = TRAVEL_PART_WIDTH + GAP_WIDTH + dockText.length;
    const startCol = Math.max(0, Math.floor((w - totalWidth) / 2));
    writeText(buffer, buttonsRow, startCol, travelText, 'bright-yellow', 'black');
    writeText(buffer, buttonsRow, startCol + TRAVEL_PART_WIDTH + GAP_WIDTH, dockText,
      this.inSpace ? 'bright-black' : 'bright-yellow', 'black');

    const hint = this.context.primaryInput === 'touch'
      ? 'TAP to select'
      : '↑↓ navigate   ENTER select';
    writeCentered(buffer, footerRow, hint, 'bright-black', 'black');
  }
}
