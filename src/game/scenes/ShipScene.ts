import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
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

function pad(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  const total = width - text.length;
  const left = Math.floor(total / 2);
  return ' '.repeat(left) + text + ' '.repeat(total - left);
}

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

    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++)
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };

    this.chrome.render(buffer, { showHeader: true, showFooter: false, navOptions: [] });

    const half = Math.floor(w / 2);  // 20 for w=40
    const inner = half - 2;          // 18 interior chars per panel

    const viewTop = CONTENT_TOP + 2; // row 5 — interior start (after top border)
    const viewBot = h - 4;           // row 26
    const viewLeft = 1;
    const viewRight = w - 2;         // col 38

    if (this.stationType && !this.station) {
      this.station = new SpaceStation(this.stationType, viewTop, viewBot, viewLeft, viewRight);
    }

    const dim = (char: string): { char: string; fg: Color; bg: Color } =>
      ({ char, fg: 'bright-black', bg: 'black' });

    // ── Stat panels (CONTENT_TOP = row 3) ─────────────────────────────────────
    // \    FUEL: 100%    /\    CARGO: 0/50T   /
    const leftStat = pad(`FUEL: ${this.state.fuel}%`, inner);
    const rightStat = pad(`CARGO: ${this.state.cargo}/${this.state.cargoCapacity}T`, inner);

    buffer[CONTENT_TOP][0] = dim('\\');
    for (let c = 0; c < inner; c++)
      buffer[CONTENT_TOP][1 + c] = dim(leftStat[c]);
    buffer[CONTENT_TOP][half - 1] = dim('/');
    buffer[CONTENT_TOP][half] = dim('\\');
    for (let c = 0; c < inner; c++)
      buffer[CONTENT_TOP][half + 1 + c] = dim(rightStat[c]);
    buffer[CONTENT_TOP][w - 1] = dim('/');

    // ── Viewport top border (CONTENT_TOP+1 = row 4) ───────────────────────────
    // /¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\
    const topRow = CONTENT_TOP + 1;
    buffer[topRow][0] = dim('/');
    for (let c = 0; c < inner; c++)
      buffer[topRow][1 + c] = dim('¯');
    // cols half-1 and half remain blank (the gap between the arches)
    for (let c = 0; c < inner; c++)
      buffer[topRow][half + 1 + c] = dim('¯');
    buffer[topRow][w - 1] = dim('\\');

    // ── Interior | borders ─────────────────────────────────────────────────────
    for (let r = viewTop; r <= viewBot; r++) {
      buffer[r][0] = dim('|');
      buffer[r][w - 1] = dim('|');
    }

    this.starfield.render(buffer, viewTop, viewBot, viewLeft, viewRight);
    if (this.station) this.station.render(buffer);

    // ── Viewport bottom sill (h-3 = row 27) ───────────────────────────────────
    // \__________________  __________________/
    const sillRow = h - 3;
    buffer[sillRow][0] = dim('\\');
    for (let c = 0; c < inner; c++)
      buffer[sillRow][1 + c] = dim('_');
    // gap cols half-1 and half remain blank
    for (let c = 0; c < inner; c++)
      buffer[sillRow][half + 1 + c] = dim('_');
    buffer[sillRow][w - 1] = dim('/');

    // ── Action buttons (h-2 = row 28) ─────────────────────────────────────────
    // /   [T] TRAVEL     \/    [D] DOCK      \
    const buttonsRow = h - 2;
    const travelLabel = '[T] TRAVEL';
    const dockLabel = this.inSpace ? '[ - ] DOCK' : '[D] DOCK';

    let travelContent = pad(travelLabel, inner);
    let dockContent = pad(dockLabel, inner);

    if (this.cursorIdx === 0) {
      travelContent = '>' + travelContent.slice(1);
    } else if (!this.inSpace) {
      dockContent = '>' + dockContent.slice(1);
    }

    buffer[buttonsRow][0] = dim('/');
    for (let c = 0; c < inner; c++) {
      const ch = travelContent[c];
      buffer[buttonsRow][1 + c] = {
        char: ch,
        fg: ch === '>' ? 'bright-green' : 'bright-yellow',
        bg: 'black',
      };
    }
    buffer[buttonsRow][half - 1] = dim('\\');
    buffer[buttonsRow][half] = dim('/');
    for (let c = 0; c < inner; c++) {
      const ch = dockContent[c];
      buffer[buttonsRow][half + 1 + c] = {
        char: ch,
        fg: ch === '>' ? 'bright-green' : (this.inSpace ? 'bright-black' : 'bright-yellow'),
        bg: 'black',
      };
    }
    buffer[buttonsRow][w - 1] = dim('\\');
  }
}
