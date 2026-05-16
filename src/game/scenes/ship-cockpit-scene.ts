import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import { Starfield } from './starfield';
import { ScreenChrome } from '../ui/screen-chrome';
import type { PlayerState } from '../player-state';

// Gauge strip column layout (cols 0–39, w=40)
// Left buttons: 0–5  |  F gauge: 6–16  |  Mid buttons: 17–20  |  S gauge: 21–31  |  Right buttons: 32–39
const FUEL_LABEL_COL   = 6;
const CARGO_LABEL_COL  = 6;
const SHIELD_LABEL_COL = 21;
const HULL_LABEL_COL   = 21;
const GAUGE_FILL_COUNT = 10;

// Bottom panel column layout
const LEFT_PANEL_W   = 13;  // cols 0–12
const RADAR_START    = 13;  // cols 13–26
const RADAR_END      = 27;
const RIGHT_PANEL_START = 27;  // cols 27–39
const RIGHT_PANEL_W  = 13;

// Ticker split
const TICKER_SPLIT = 27;

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

function lcgRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

interface Button {
  col: number;
  row: number;   // gauge buttons: absolute row; panel buttons: relative to panel top
  char: string;
  phase: number;
  period: number;
  active: boolean;
}

interface RadarContact {
  x: number;
  y: number;
  vx: number;
  vy: number;
  charPhase: number;
  charPeriod: number;
}

// Button char + position definitions — deliberately asymmetric

const GAUGE_BTN_DEFS: [number, number, string][] = [
  // left cluster (cols 0–5, rows 3–4)
  [0, 3, '●'], [2, 3, '○'], [4, 3, '▪'],
  [1, 4, '◉'], [3, 4, '●'],
  // mid cluster (cols 17–20)
  [17, 3, '○'], [19, 3, '▪'], [18, 4, '◉'],
  // right cluster (cols 32–39)
  [32, 3, '●'], [34, 3, '○'], [36, 3, '▪'], [38, 3, '◉'],
  [33, 4, '●'], [35, 4, '○'], [39, 4, '▪'],
];

const LEFT_BTN_DEFS: [number, number, string][] = [
  [1, 0, '●'], [4, 0, '○'], [7, 1, '▪'],
  [9, 0, '◉'], [11, 1, '●'], [2, 2, '○'], [6, 2, '▪'],
];

const RIGHT_BTN_DEFS: [number, number, string][] = [
  [28, 0, '●'], [31, 0, '○'], [33, 1, '▪'],
  [36, 0, '◉'], [38, 1, '●'], [29, 2, '○'], [37, 2, '▪'],
];

function makeButton(rand: () => number, col: number, row: number, char: string): Button {
  return { col, row, char, phase: rand() * 8000, period: 2000 + rand() * 6000, active: rand() > 0.5 };
}

export class ShipCockpitScene implements Scene {
  private readonly player: PlayerState;
  private readonly inSpace: boolean;
  private cursorIdx = 0;
  private activated = false;
  private h = 30;

  private readonly starfield: Starfield;
  private readonly chrome: ScreenChrome;

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
  ) {
    this.player = player;
    this.chrome = new ScreenChrome(context, player);
    this.starfield = new Starfield(42);
    this.inSpace = player.destinationId === null;

    const rand = lcgRand(99);
    this.gaugeBtns = GAUGE_BTN_DEFS.map(([c, r, ch]) => makeButton(rand, c, r, ch));
    this.leftBtns  = LEFT_BTN_DEFS.map(([c, r, ch]) => makeButton(rand, c, r, ch));
    this.rightBtns = RIGHT_BTN_DEFS.map(([c, r, ch]) => makeButton(rand, c, r, ch));

    const rRand = lcgRand(77);
    const contactCount = 3 + Math.floor(rRand() * 4);
    this.radarContacts = Array.from({ length: contactCount }, () => ({
      x: rRand() * (RADAR_END - RADAR_START - 1),
      y: rRand() * 4,
      vx: (rRand() - 0.5) * 2.0,
      vy: (rRand() - 0.5) * 1.5,
      charPhase: rRand() * 3000,
      charPeriod: 1200 + rRand() * 800,
    }));

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
        const h = this.h;
        if ((row === 3 || row === 4) &&
            col >= CARGO_LABEL_COL && col < CARGO_LABEL_COL + 1 + GAUGE_FILL_COUNT) {
          this.activated = true;
          onCargo();
        } else if (row === h - 3 && col < LEFT_PANEL_W) {
          this.activated = true;
          onTravel();
        } else if (row === h - 3 && col >= RIGHT_PANEL_START && !this.inSpace) {
          this.activated = true;
          onDock();
        }
      });
    }
  }

  update(dt: number): void {
    this.starfield.update(dt);

    this.blinkPhase = (this.blinkPhase + dt) % 1000;

    for (const btn of [...this.gaugeBtns, ...this.leftBtns, ...this.rightBtns]) {
      btn.phase += dt;
      if (btn.phase >= btn.period) {
        btn.phase -= btn.period;
        btn.active = !btn.active;
      }
    }

    const radarH = 5;
    const radarW = RADAR_END - RADAR_START;
    for (const c of this.radarContacts) {
      c.x += c.vx * dt / 1000;
      c.y += c.vy * dt / 1000;
      if (c.x < 0) c.x += radarW;
      if (c.x >= radarW) c.x -= radarW;
      if (c.y < 0) c.y += radarH;
      if (c.y >= radarH) c.y -= radarH;
      c.charPhase = (c.charPhase + dt) % c.charPeriod;
    }

    if (this.tickerPause > 0) {
      this.tickerPause = Math.max(0, this.tickerPause - dt);
    } else {
      this.tickerAccum += dt;
      const SCROLL_MS = 80;
      while (this.tickerAccum >= SCROLL_MS) {
        this.tickerAccum -= SCROLL_MS;
        this.tickerScroll++;
        const msg = TICKER_MESSAGES[this.msgIdx];
        if (this.tickerScroll >= msg.length + TICKER_SPLIT - 1) {
          this.tickerScroll = 0;
          this.msgIdx = (this.msgIdx + 1) % TICKER_MESSAGES.length;
          this.tickerPause = 500;
          this.tickerAccum = 0;
          break;
        }
      }
    }
  }

  render(buffer: CharBuffer): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;
    this.h = h;

    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++)
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };

    this.chrome.render(buffer, { showHeader: true, showFooter: true, navOptions: [] });

    // Row 2 is the chrome gap — already cleared to black above

    const viewportTop = 5;
    const viewportBot = h - 8;
    const bottomTop   = h - 7;
    const bottomBot   = h - 3;
    const tickerRow   = h - 2;

    this.renderGaugeStrip(buffer);
    this.starfield.render(buffer, viewportTop, viewportBot, 0, 39);
    this.renderHUD(buffer, viewportTop);
    this.renderCrosshair(buffer, viewportTop, viewportBot);
    this.renderBottomPanels(buffer, bottomTop, bottomBot);
    this.renderTicker(buffer, tickerRow);
  }

  private renderGaugeStrip(buffer: CharBuffer): void {
    const fuelFrac  = this.player.fuelL / this.player.fuelCapacityL;
    const cargoFrac = this.player.cargoWeightKg / this.player.cargoCapacity;
    const blinkOn   = this.blinkPhase < 500;

    this.renderGauge(buffer, 3, FUEL_LABEL_COL,   'F', fuelFrac,  'yellow', blinkOn);
    this.renderGauge(buffer, 4, CARGO_LABEL_COL,  'C', cargoFrac, 'blue',   blinkOn);
    this.renderGauge(buffer, 3, SHIELD_LABEL_COL, 'S', 1.0,       'cyan',   blinkOn);
    this.renderGauge(buffer, 4, HULL_LABEL_COL,   'H', 1.0,       'green',  blinkOn);

    for (const btn of this.gaugeBtns) {
      const fg: Color = btn.active ? 'white' : 'bright-black';
      buffer[btn.row][btn.col] = { char: btn.char, fg, bg: 'black' };
    }
  }

  private renderGauge(
    buffer: CharBuffer,
    row: number, labelCol: number,
    label: string, frac: number, color: Color, blinkOn: boolean,
  ): void {
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

  private renderHUD(buffer: CharBuffer, viewportTop: number): void {
    writeText(buffer, viewportTop,      1, 'VEL:----', 'bright-black', 'black');
    writeText(buffer, viewportTop,     16, 'ATT:---°', 'bright-black', 'black');
    writeText(buffer, viewportTop,     30, 'ROT:--°',  'bright-black', 'black');
  }

  private renderCrosshair(buffer: CharBuffer, viewportTop: number, viewportBot: number): void {
    const centerRow = Math.floor((viewportTop + viewportBot) / 2);
    const centerCol = 20;
    buffer[centerRow][centerCol] = { char: '╋', fg: 'bright-green', bg: 'black' };
    const corners: [number, number, string][] = [
      [centerRow - 3, centerCol - 5, '┌'],
      [centerRow - 3, centerCol + 5, '┐'],
      [centerRow + 3, centerCol - 5, '└'],
      [centerRow + 3, centerCol + 5, '┘'],
    ];
    for (const [r, c, ch] of corners) {
      if (r >= viewportTop && r <= viewportBot && c >= 0 && c < 40)
        buffer[r][c] = { char: ch, fg: 'bright-green', bg: 'black' };
    }
  }

  private renderBottomPanels(buffer: CharBuffer, bottomTop: number, bottomBot: number): void {
    // Radar: solid bright-black background
    for (let r = bottomTop; r <= bottomBot; r++)
      for (let c = RADAR_START; c < RADAR_END; c++)
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'bright-black' };

    this.renderRadar(buffer, bottomTop, bottomBot - bottomTop + 1);

    // Panel buttons (row is relative to bottomTop; skip the action row)
    for (const btn of this.leftBtns) {
      const absRow = bottomTop + btn.row;
      if (absRow < bottomBot) {
        const fg: Color = btn.active ? 'white' : 'bright-black';
        buffer[absRow][btn.col] = { char: btn.char, fg, bg: 'black' };
      }
    }
    for (const btn of this.rightBtns) {
      const absRow = bottomTop + btn.row;
      if (absRow < bottomBot) {
        const fg: Color = btn.active ? 'white' : 'bright-black';
        buffer[absRow][btn.col] = { char: btn.char, fg, bg: 'black' };
      }
    }

    // TRAVEL word button (bottom row of left panel)
    const travelBg: Color = this.cursorIdx === 0 ? 'bright-yellow' : 'yellow';
    writeText(buffer, bottomBot, 0, this.centerPad('TRAVEL', LEFT_PANEL_W), 'black', travelBg);

    // DOCK word button (bottom row of right panel)
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
  }

  private renderRadar(buffer: CharBuffer, bottomTop: number, radarRows: number): void {
    const radarW = RADAR_END - RADAR_START;
    const edgeThreshold = 2;
    let showTop = false, showBottom = false, showLeft = false, showRight = false;

    for (const contact of this.radarContacts) {
      const cx = Math.floor(contact.x);
      const cy = Math.floor(contact.y);
      const bufCol = RADAR_START + Math.min(radarW - 1, Math.max(0, cx));
      const bufRow = bottomTop + Math.min(radarRows - 1, Math.max(0, cy));
      const char = contact.charPhase < contact.charPeriod / 2 ? '○' : '◈';
      buffer[bufRow][bufCol] = { char, fg: 'white', bg: 'bright-black' };
      if (cy <= edgeThreshold) showTop = true;
      if (cy >= radarRows - 1 - edgeThreshold) showBottom = true;
      if (cx <= edgeThreshold) showLeft = true;
      if (cx >= radarW - 1 - edgeThreshold) showRight = true;
    }

    const midCol = RADAR_START + Math.floor(radarW / 2);
    const midRow = bottomTop + Math.floor(radarRows / 2);
    const topRow = bottomTop;
    const botRow = bottomTop + radarRows - 1;
    if (showTop)    buffer[topRow][midCol]      = { char: '▴', fg: 'white', bg: 'bright-black' };
    if (showBottom) buffer[botRow][midCol]      = { char: '▾', fg: 'white', bg: 'bright-black' };
    if (showLeft)   buffer[midRow][RADAR_START] = { char: '◂', fg: 'white', bg: 'bright-black' };
    if (showRight)  buffer[midRow][RADAR_END-1] = { char: '▸', fg: 'white', bg: 'bright-black' };
  }

  private renderTicker(buffer: CharBuffer, row: number): void {
    const msg = TICKER_MESSAGES[this.msgIdx];
    for (let c = 0; c < TICKER_SPLIT; c++) {
      const charIdx = this.tickerScroll - TICKER_SPLIT + 1 + c;
      const ch = (charIdx >= 0 && charIdx < msg.length) ? msg[charIdx] : ' ';
      buffer[row][c] = { char: ch, fg: 'white', bg: 'black' };
    }
    const rightText = ' ◁ CLEAR     ';
    for (let c = 0; c < RIGHT_PANEL_W; c++) {
      buffer[row][TICKER_SPLIT + c] = { char: rightText[c] ?? ' ', fg: 'white', bg: 'bright-black' };
    }
  }

  private centerPad(text: string, width: number): string {
    if (text.length >= width) return text.slice(0, width);
    const total = width - text.length;
    const left = Math.floor(total / 2);
    return ' '.repeat(left) + text + ' '.repeat(total - left);
  }
}
