import type { InputHandler, GameContext, CharBuffer, Color } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import { Starfield, hashStringToSeed } from './starfield';
import { SpaceStation } from './space-station';
import { selectDestinationGlyph } from './station-types';
import type { StationGlyph } from './station-types';
import { getDestination } from '../world/world-data';
import type { PlayerState } from '../player-state';
import { BaseScene } from './base-scene';

// Gauge strip column layout
const FUEL_LABEL_COL    = 6;
const CARGO_LABEL_COL   = 6;
const SHIELD_LABEL_COL  = 23;
const HULL_LABEL_COL    = 23;
const GAUGE_FILL_COUNT  = 10;

const GAUGE_LEFT_START  = 0;
const GAUGE_LEFT_END    = 4;
const GAUGE_MID_START   = 18;
const GAUGE_MID_END     = 21;
const GAUGE_RIGHT_START = 35;
const GAUGE_RIGHT_END   = 39;

const LEFT_PANEL_W      = 12;
const LEFT_BTN_END      = 11;
const RADAR_START       = 13;
const RADAR_END         = 27;
const RIGHT_PANEL_START = 28;
const RIGHT_PANEL_W     = 12;

const TICKER_W   = 40;
const SCROLL_MS  = 200;

const TICKER_MESSAGES = [
  '> SYSTEM STATUS: ALL CLEAR',
  '> DRIVE EFFICIENCY: 97%',
  '> BEACON SIGNAL DETECTED ON 14.7 MHz',
  '> TRADE ROUTE UPDATE: ELYSIUM CORRIDOR STABLE',
  '> WARNING: DEBRIS FIELD DELTA-9 ACTIVE',
  '> COMMS RELAY SIGNAL NOMINAL',
  '> FUEL RESERVES OPTIMAL',
  '> SECTOR SCAN COMPLETE — NO HOSTILES',
  '> GRAVITATIONAL ANOMALY LOGGED AT BEARING 227',
  '> TRANSPONDER HANDSHAKE: ACCEPTED',
];

const BUTTON_CHAR = '#';
const BUTTON_COLORS: Color[] = ['green', 'cyan', 'white', 'yellow'];
const RADAR_CHARS = ['*', '.', '+', 'x'] as const;

function lcgRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

interface Button {
  col: number;
  row: number;
  char: string;
  color: Color;
  phase: number;
  period: number;
  active: boolean;
}

interface RadarContact {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
}

function makeButton(rand: () => number, col: number, row: number): Button {
  return {
    col, row,
    char: BUTTON_CHAR,
    color: BUTTON_COLORS[Math.floor(rand() * BUTTON_COLORS.length)],
    phase: rand() * 20000,
    period: 10000 + rand() * 10000,
    active: rand() > 0.2,
  };
}

function buildZone(rand: () => number, colStart: number, colEnd: number, rows: number[]): Button[] {
  const btns: Button[] = [];
  for (const row of rows)
    for (let col = colStart; col <= colEnd; col++)
      btns.push(makeButton(rand, col, row));
  return btns;
}

export class ShipCockpitScene extends BaseScene {
  private readonly inSpace: boolean;
  private readonly onTravel: () => void;
  private readonly onDock: () => void;
  private readonly onCargo: () => void;
  private cursorIdx = 0;
  private h = 30;

  private readonly starfield: Starfield;
  private readonly destGlyph: StationGlyph | null;
  private readonly destRowFrac: number;
  private readonly destColFrac: number;
  private destObject: SpaceStation | null = null;
  private blinkPhase = 0;

  private readonly gaugeBtns: Button[];
  private readonly leftBtns: Button[];
  private readonly rightBtns: Button[];
  private readonly radarContacts: RadarContact[];

  private msgIdx = 0;
  private tickerScroll = 0;
  private tickerAccum = 0;
  private tickerPause = 0;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    onTravel: () => void,
    onDock: () => void,
    onCargo: () => void,
    onMenu: () => void,
  ) {
    super(inputHandler, context, player, { navOptions: [], onMenu });

    this.onTravel = onTravel;
    this.onDock = onDock;
    this.onCargo = onCargo;
    const seed = hashStringToSeed(player.destinationId ?? '');
    this.starfield = new Starfield(seed);
    this.inSpace = player.destinationId === null;
    const locationType = player.destinationId != null
      ? getDestination(player.destinationId)?.locationType
      : undefined;
    this.destGlyph = selectDestinationGlyph(locationType, seed);
    const r1 = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const r2 = (Math.imul(r1,   1664525) + 1013904223) >>> 0;
    this.destRowFrac = 0.15 + (r1 / 0x100000000) * 0.70;
    this.destColFrac = 0.15 + (r2 / 0x100000000) * 0.70;

    const rand = lcgRand(99);
    this.gaugeBtns = [
      ...buildZone(rand, GAUGE_LEFT_START,  GAUGE_LEFT_END,  [3, 4]),
      ...buildZone(rand, GAUGE_MID_START,   GAUGE_MID_END,   [3, 4]),
      ...buildZone(rand, GAUGE_RIGHT_START, GAUGE_RIGHT_END, [3, 4]),
    ];
    this.leftBtns  = buildZone(rand, 0,                 LEFT_BTN_END,     [0, 1, 2, 3]);
    this.rightBtns = buildZone(rand, RIGHT_PANEL_START, 39,               [0, 1, 2, 3]);

    const rRand = lcgRand(77);
    const contactCount = 3 + Math.floor(rRand() * 4);
    this.radarContacts = Array.from({ length: contactCount }, () => ({
      x: rRand() * (RADAR_END - RADAR_START - 1),
      y: rRand() * 4,
      vx: (rRand() - 0.5) * 2.0,
      vy: (rRand() - 0.5) * 1.5,
      char: RADAR_CHARS[Math.floor(rRand() * RADAR_CHARS.length)],
    }));
  }

  private navCount(): number { return this.inSpace ? 1 : 2; }

  protected override handleAction(action: string): void {
    if (action === 'CARGO') {
      this.activated = true;
      this.onCargo();
    } else if (action === 'UP') {
      this.cursorIdx = (this.cursorIdx - 1 + this.navCount()) % this.navCount();
    } else if (action === 'DOWN') {
      this.cursorIdx = (this.cursorIdx + 1) % this.navCount();
    } else if (action === 'SELECT') {
      if (this.cursorIdx === 0) {
        this.activated = true;
        this.onTravel();
      } else if (!this.inSpace) {
        this.activated = true;
        this.onDock();
      }
    }
  }

  protected override handleTap(col: number, row: number): void {
    const h = this.h;
    if ((row === 3 || row === 4) &&
        col >= CARGO_LABEL_COL && col < CARGO_LABEL_COL + 1 + GAUGE_FILL_COUNT) {
      this.activated = true;
      this.onCargo();
    } else if (row === h - 3 && col < LEFT_PANEL_W) {
      this.activated = true;
      this.onTravel();
    } else if (row === h - 3 && col >= RIGHT_PANEL_START && !this.inSpace) {
      this.activated = true;
      this.onDock();
    }
  }

  override update(dt: number): void {
    this.starfield.update(dt);
    this.destObject?.update(dt);
    this.blinkPhase = (this.blinkPhase + dt) % 1000;

    for (const btn of [...this.gaugeBtns, ...this.leftBtns, ...this.rightBtns]) {
      btn.phase += dt;
      if (btn.phase >= btn.period) {
        btn.phase -= btn.period;
        btn.active = !btn.active;
      }
    }

    const radarW = RADAR_END - RADAR_START;
    const radarH = 5;
    for (const c of this.radarContacts) {
      c.x += c.vx * dt / 1000;
      c.y += c.vy * dt / 1000;
      if (c.x < 0)         { c.x  = -c.x;               c.vx = -c.vx; }
      if (c.x > radarW - 1){ c.x  = 2*(radarW-1) - c.x;  c.vx = -c.vx; }
      if (c.y < 0)         { c.y  = -c.y;               c.vy = -c.vy; }
      if (c.y > radarH - 1){ c.y  = 2*(radarH-1) - c.y;  c.vy = -c.vy; }
    }

    if (this.tickerPause > 0) {
      this.tickerPause = Math.max(0, this.tickerPause - dt);
    } else {
      this.tickerAccum += dt;
      while (this.tickerAccum >= SCROLL_MS) {
        this.tickerAccum -= SCROLL_MS;
        this.tickerScroll++;
        const msg = TICKER_MESSAGES[this.msgIdx];
        if (this.tickerScroll >= msg.length + TICKER_W - 1) {
          this.tickerScroll = 0;
          this.msgIdx = (this.msgIdx + 1) % TICKER_MESSAGES.length;
          this.tickerPause = 500;
          this.tickerAccum = 0;
          break;
        }
      }
    }
  }

  protected override renderContent(buffer: CharBuffer, top: number, _bottom: number): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;
    this.h = h;

    const viewportTop = top + 2;
    const viewportBot = h - 8;
    const bottomTop   = h - 7;
    const bottomBot   = h - 3;
    const tickerRow   = h - 2;

    this.renderGaugeStrip(buffer, top);

    this.starfield.render(buffer, viewportTop, viewportBot, 0, 39);

    if (!this.destObject && this.destGlyph) {
      this.destObject = new SpaceStation(
        this.destGlyph, viewportTop + 1, viewportBot - 1, 0, 39,
        this.destRowFrac, this.destColFrac,
      );
    }
    this.destObject?.render(buffer);

    for (let c = 0; c < w; c++) {
      buffer[viewportTop][c] = { char: '-', fg: 'white', bg: 'black' };
      buffer[viewportBot][c] = { char: '-', fg: 'white', bg: 'black' };
    }

    this.renderHUD(buffer, viewportTop + 1);
    this.renderCrosshair(buffer, viewportTop + 1, viewportBot - 1);

    this.renderBottomPanels(buffer, bottomTop, bottomBot);
    this.renderTicker(buffer, tickerRow);
  }

  private renderGaugeStrip(buffer: CharBuffer, top: number): void {
    for (const btn of this.gaugeBtns) {
      const absRow = top + btn.row - 3;
      const fg: Color = btn.active ? btn.color : 'bright-black';
      if (absRow >= 0 && absRow < buffer.length) buffer[absRow][btn.col] = { char: btn.char, fg, bg: 'black' };
    }

    const fuelFrac  = this.player.fuelL / this.player.fuelCapacityL;
    const cargoFrac = this.player.cargoWeightKg / this.player.cargoCapacity;
    const blinkOn   = this.blinkPhase < 500;

    this.renderGauge(buffer, top,     FUEL_LABEL_COL,   'F', fuelFrac,  'yellow', blinkOn);
    this.renderGauge(buffer, top + 1, CARGO_LABEL_COL,  'C', cargoFrac, 'blue',   blinkOn);
    this.renderGauge(buffer, top,     SHIELD_LABEL_COL, 'S', 1.0,       'cyan',   blinkOn);
    this.renderGauge(buffer, top + 1, HULL_LABEL_COL,   'H', 1.0,       'green',  blinkOn);
  }

  private renderGauge(
    buffer: CharBuffer,
    row: number, labelCol: number,
    label: string, frac: number, color: Color, blinkOn: boolean,
  ): void {
    if (row < 0 || row >= buffer.length) return;
    buffer[row][labelCol] = { char: label, fg: color, bg: 'black' };
    const filled = Math.round(Math.min(1, Math.max(0, frac)) * GAUGE_FILL_COUNT);
    const low = frac <= 0.2;
    for (let i = 0; i < GAUGE_FILL_COUNT; i++) {
      const col = labelCol + 1 + i;
      if (i < filled) {
        const bg: Color = (low && !blinkOn) ? 'bright-black' : color;
        buffer[row][col] = { char: ' ', fg: 'black', bg };
      } else {
        buffer[row][col] = { char: ' ', fg: 'black', bg: 'bright-black' };
      }
    }
  }

  private renderHUD(buffer: CharBuffer, row: number): void {
    writeText(buffer, row,  1, 'VEL:----', 'bright-black', 'black');
    writeText(buffer, row, 16, 'ATT:---°', 'bright-black', 'black');
    writeText(buffer, row, 30, 'ROT:--°',  'bright-black', 'black');
  }

  private renderCrosshair(buffer: CharBuffer, innerTop: number, innerBot: number): void {
    const centerRow = Math.floor((innerTop + innerBot) / 2);
    const centerCol = 20;
    buffer[centerRow][centerCol] = { char: '+', fg: 'bright-green', bg: 'black' };
    const cornerPositions = [
      [centerRow - 3, centerCol - 5],
      [centerRow - 3, centerCol + 5],
      [centerRow + 3, centerCol - 5],
      [centerRow + 3, centerCol + 5],
    ] as const;
    for (const [r, c] of cornerPositions) {
      const w = buffer[0]?.length ?? 40;
      if (r >= innerTop && r <= innerBot && c >= 0 && c < w)
        buffer[r][c] = { char: '+', fg: 'bright-green', bg: 'black' };
    }
  }

  private renderBottomPanels(buffer: CharBuffer, bottomTop: number, bottomBot: number): void {
    for (let r = bottomTop; r <= bottomBot; r++)
      for (let c = RADAR_START; c < RADAR_END; c++)
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'bright-black' };

    this.renderRadar(buffer, bottomTop, bottomBot - bottomTop + 1);

    for (const btn of this.leftBtns) {
      const absRow = bottomTop + btn.row;
      if (absRow < bottomBot) {
        const fg: Color = btn.active ? btn.color : 'bright-black';
        buffer[absRow][btn.col] = { char: btn.char, fg, bg: 'black' };
      }
    }
    for (const btn of this.rightBtns) {
      const absRow = bottomTop + btn.row;
      if (absRow < bottomBot) {
        const fg: Color = btn.active ? btn.color : 'bright-black';
        buffer[absRow][btn.col] = { char: btn.char, fg, bg: 'black' };
      }
    }

    const travelBg: Color = this.cursorIdx === 0 ? 'bright-yellow' : 'yellow';
    writeText(buffer, bottomBot, 0, this.centerPad('TRAVEL', LEFT_PANEL_W), 'black', travelBg);

    let dockBg: Color;
    let dockFg: Color;
    if (this.inSpace) {
      dockBg = 'bright-black';
      dockFg = 'bright-black';
    } else {
      dockBg = this.cursorIdx === 1 ? 'bright-cyan' : 'cyan';
      dockFg = 'black';
    }
    writeText(buffer, bottomBot, RIGHT_PANEL_START, this.centerPad('DOCK', RIGHT_PANEL_W), dockFg, dockBg);

    const speakerW = RADAR_END - RADAR_START;
    const speakerText = '<)) ' + '-'.repeat(speakerW - 4);
    writeText(buffer, bottomBot, RADAR_START, speakerText, 'white', 'bright-black');
  }

  private renderRadar(buffer: CharBuffer, bottomTop: number, radarRows: number): void {
    for (const contact of this.radarContacts) {
      const cx = Math.min(RADAR_END - RADAR_START - 1, Math.max(0, Math.floor(contact.x)));
      const cy = Math.min(radarRows - 1,               Math.max(0, Math.floor(contact.y)));
      buffer[bottomTop + cy][RADAR_START + cx] = { char: contact.char, fg: 'white', bg: 'bright-black' };
    }
  }

  private renderTicker(buffer: CharBuffer, row: number): void {
    const msg = TICKER_MESSAGES[this.msgIdx];
    for (let c = 0; c < TICKER_W; c++) {
      const charIdx = this.tickerScroll - TICKER_W + 1 + c;
      const ch = (charIdx >= 0 && charIdx < msg.length) ? msg[charIdx] : ' ';
      buffer[row][c] = { char: ch, fg: 'white', bg: 'black' };
    }
  }

  private centerPad(text: string, width: number): string {
    if (text.length >= width) return text.slice(0, width);
    const total = width - text.length;
    const left = Math.floor(total / 2);
    return ' '.repeat(left) + text + ' '.repeat(total - left);
  }
}
