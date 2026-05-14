import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import { getDestination } from '../world/world-data';
import type { DestinationType } from '../world/types';
import { Starfield } from './Starfield';
import { SpaceStation } from './SpaceStation';
import { STATION_TYPES, type SpaceStationDef } from './station-types';
import { ScreenChrome, CONTENT_TOP } from '../ui/ScreenChrome';

interface PlayerState {
  fuel: number;
  cargo: number;
  cargoCapacity: number;
}

const INITIAL_STATE: PlayerState = {
  fuel: 100,
  cargo: 0,
  cargoCapacity: 50,
};

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
  private readonly stationType: SpaceStationDef | null;
  private readonly chrome: ScreenChrome;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    onTravel: () => void,
    onDock: () => void,
  ) {
    this.state = { ...INITIAL_STATE };
    this.context = context;
    this.chrome = new ScreenChrome(context);
    this.starfield = new Starfield();
    this.inSpace = context.destinationId === null;

    if (context.destinationId !== null) {
      const dest = getDestination(context.destinationId)!;
      this.stationType = DESTINATION_TYPE_TO_STATION[dest.type] ?? STATION_TYPES.RELAY;
    } else {
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

    this.chrome.render(buffer, { showHeader: true, showFooter: false, navOptions: [] });

    // Fuel/cargo info at CONTENT_TOP
    const infoText = `FUEL: ${this.state.fuel}%   CARGO: ${this.state.cargo}/${this.state.cargoCapacity}T`;
    writeText(buffer, CONTENT_TOP, 2, infoText, 'bright-black', 'black');

    // Viewport: rows CONTENT_TOP+1 to h-4
    const viewTop = CONTENT_TOP + 1;
    const viewBot = h - 4; // inclusive
    const viewLeft = 2;
    const viewRight = w - 3;

    if (this.stationType && !this.station) {
      this.station = new SpaceStation(
        this.stationType,
        viewTop, viewBot, viewLeft, viewRight,
      );
    }

    this.starfield.render(buffer, viewTop, viewBot, viewLeft, viewRight);
    if (this.station) this.station.render(buffer);

    // Separator at h-3: "--- … --- | --- … ---"
    const sepRow = h - 3;
    if (sepRow >= 0 && sepRow < h) {
      const midCol = Math.floor(w / 2);
      for (let c = 0; c < w; c++) {
        let ch: string;
        if (c === midCol - 1) ch = ' ';
        else if (c === midCol) ch = '|';
        else if (c === midCol + 1) ch = ' ';
        else ch = '-';
        buffer[sepRow][c] = { char: ch, fg: 'bright-black', bg: 'black' };
      }
    }

    // Action buttons at h-2
    const buttonsRow = h - 2;
    const travelText = (this.cursorIdx === 0 ? '> ' : '  ') + '[ T ] TRAVEL';
    const dockText = (this.cursorIdx === 1 && !this.inSpace ? '> ' : '  ')
      + (this.inSpace ? '[ - ] DOCK' : '[ D ] DOCK');
    const totalWidth = TRAVEL_PART_WIDTH + GAP_WIDTH + dockText.length;
    const startCol = Math.max(0, Math.floor((w - totalWidth) / 2));
    writeText(buffer, buttonsRow, startCol, travelText, 'bright-yellow', 'black');
    writeText(buffer, buttonsRow, startCol + TRAVEL_PART_WIDTH + GAP_WIDTH, dockText,
      this.inSpace ? 'bright-black' : 'bright-yellow', 'black');
  }
}
