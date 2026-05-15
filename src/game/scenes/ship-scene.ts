import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { getDestination } from '../world/world-data';
import { writeText } from '../../shared/buffer-utils';
import type { DestinationType } from '../world/types';
import { Starfield } from './starfield';
import { SpaceStation } from './space-station';
import { STATION_TYPES, type SpaceStationDef } from './station-types';
import { ScreenChrome } from '../ui/screen-chrome';
import type { PlayerState } from '../PlayerState';

// Center text in a fixed-width field; truncates if too long.
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
  private readonly player: PlayerState;
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
    player: PlayerState,
    onTravel: () => void,
    onDock: () => void,
    onCargo: () => void,
  ) {
    this.player = player;
    this.context = context;
    this.chrome = new ScreenChrome(context, player);
    this.starfield = new Starfield();
    this.inSpace = player.destinationId === null;

    if (player.destinationId !== null) {
      const dest = getDestination(player.destinationId)!;
      this.stationType = DESTINATION_TYPE_TO_STATION[dest.type] ?? STATION_TYPES.RELAY;
    } else {
      this.stationType = null;
    }

    const navCount = () => this.inSpace ? 1 : 2;

    inputHandler.onAction((action) => {
      if (this.activated) return;
      if (action === 'CARGO') {
        this.activated = true;
        onCargo();
      } else if (action === 'UP') {
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
        if (row === 2) {
          // Stat row: right half (cargo panel) opens cargo
          if (col >= this.w / 2) {
            this.activated = true;
            onCargo();
          }
          // Left half (fuel panel) does nothing
        } else if (row === this.h - 1) {
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

    // Layout: half = w/2 panels; inner = 17 interior chars per panel
    // Angled rows have space at col 0 and col w-1; content at cols 1–(w-2).
    // Interior rows have | at col 0 and col w-1.
    const half = Math.floor(w / 2);   // 20 for w=40
    const inner = half - 3;           // 17 interior chars per panel

    // Row layout (h=30):
    //  2: stat panels    \  Fuel  /\  Cargo  /
    //  3: arch top       /¯¯¯¯¯  ¯¯¯¯¯\
    //  4–27: interior    |  starfield  |
    //  28: bottom sill   \______  ______/
    //  29: action btns   /  [T]  \/  [D]  \
    const statRow    = 2;
    const topRow     = 3;
    const viewTop    = 4;
    const viewBot    = h - 3;   // 27
    const sillRow    = h - 2;   // 28
    const buttonsRow = h - 1;   // 29

    const viewLeft  = 1;
    const viewRight = w - 2;    // 38

    if (this.stationType && !this.station) {
      this.station = new SpaceStation(this.stationType, viewTop, viewBot, viewLeft, viewRight);
    }

    const dim = (char: string): { char: string; fg: Color; bg: Color } =>
      ({ char, fg: 'bright-black', bg: 'black' });

    // ── Stat panels (row 2) ────────────────────────────────────────────────────
    //  \    FUEL:x/yL    /\   CARGO: 0/2Mg  /
    const leftStat  = pad(`FUEL:${this.player.fuelL}/${this.player.fuelCapacityL}L`, inner);
    const cargoMg   = Math.round(this.player.cargoWeightKg / 1000);
    const capMg     = Math.round(this.player.cargoCapacity / 1000);
    const rightStat = pad(`CARGO: ${cargoMg}/${capMg}Mg`, inner);

    buffer[statRow][1] = dim('\\');
    for (let c = 0; c < inner; c++)
      buffer[statRow][2 + c] = dim(leftStat[c]);
    buffer[statRow][half - 1] = dim('/');
    buffer[statRow][half]     = dim('\\');
    for (let c = 0; c < inner; c++)
      buffer[statRow][half + 1 + c] = dim(rightStat[c]);
    buffer[statRow][half + inner + 1] = dim('/');

    // ── Viewport arch top (row 3) ──────────────────────────────────────────────
    //  /¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\
    buffer[topRow][1] = dim('/');
    for (let c = 0; c < inner; c++)
      buffer[topRow][2 + c] = dim('¯');
    // cols half-1 and half are the gap (remain blank)
    for (let c = 0; c < inner; c++)
      buffer[topRow][half + 1 + c] = dim('¯');
    buffer[topRow][half + inner + 1] = dim('\\');

    // ── Interior | borders ─────────────────────────────────────────────────────
    for (let r = viewTop; r <= viewBot; r++) {
      buffer[r][0]     = dim('|');
      buffer[r][w - 1] = dim('|');
    }

    this.starfield.render(buffer, viewTop, viewBot, viewLeft, viewRight);
    if (this.station) this.station.render(buffer);

    // Cargo shortcut hint in lower-left of viewport
    writeText(buffer, viewBot, viewLeft + 1, '[C] CARGO', 'bright-black', 'black');

    // ── Viewport bottom sill (h-2) ─────────────────────────────────────────────
    //  \__________________  __________________/
    buffer[sillRow][1] = dim('\\');
    for (let c = 0; c < inner; c++)
      buffer[sillRow][2 + c] = dim('_');
    // gap remains blank
    for (let c = 0; c < inner; c++)
      buffer[sillRow][half + 1 + c] = dim('_');
    buffer[sillRow][half + inner + 1] = dim('/');

    // ── Action buttons (h-1) ──────────────────────────────────────────────────
    //  /   [T] TRAVEL    \/    [D] DOCK     \
    const travelLabel = '[T] TRAVEL';
    const dockLabel   = this.inSpace ? '[ - ] DOCK' : '[D] DOCK';

    let travelContent = pad(travelLabel, inner);
    let dockContent   = pad(dockLabel, inner);

    if (this.cursorIdx === 0) {
      travelContent = '>' + travelContent.slice(1);
    } else if (!this.inSpace) {
      dockContent = '>' + dockContent.slice(1);
    }

    buffer[buttonsRow][1] = dim('/');
    for (let c = 0; c < inner; c++) {
      const ch = travelContent[c];
      buffer[buttonsRow][2 + c] = {
        char: ch,
        fg: ch === '>' ? 'bright-green' : 'bright-yellow',
        bg: 'black',
      };
    }
    buffer[buttonsRow][half - 1] = dim('\\');
    buffer[buttonsRow][half]     = dim('/');
    for (let c = 0; c < inner; c++) {
      const ch = dockContent[c];
      buffer[buttonsRow][half + 1 + c] = {
        char: ch,
        fg: ch === '>' ? 'bright-green' : (this.inSpace ? 'bright-black' : 'bright-yellow'),
        bg: 'black',
      };
    }
    buffer[buttonsRow][half + inner + 1] = dim('\\');
  }
}
