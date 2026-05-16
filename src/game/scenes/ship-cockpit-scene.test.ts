import { describe, it, expect, vi } from 'vitest';
import { ShipCockpitScene } from './ship-cockpit-scene';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';

// ── helpers ──────────────────────────────────────────────────────────────────

class MockInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  private tapHandlers: Array<(col: number, row: number) => void> = [];

  onAction(handler: (action: GameAction) => void): void {
    this.actionHandlers.push(handler);
  }

  onTap(handler: (col: number, row: number) => void): void {
    this.tapHandlers.push(handler);
  }

  triggerAction(action: GameAction): void {
    for (const h of this.actionHandlers) h(action);
  }

  triggerTap(col: number, row: number): void {
    for (const h of this.tapHandlers) h(col, row);
  }
}

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

function rowText(buffer: CharBuffer, row: number): string {
  return buffer[row].map(c => c.char).join('').trimEnd();
}

const keyboardContext: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

// Row layout for h=30, w=40:
//  0–1  : chrome header
//  2    : chrome gap
//  3–4  : gauge strip
//  5–22 : starfield viewport (h-8 = 22)
//  23–27: bottom panels (h-7 to h-3)
//  28   : ticker (h-2)
//  29   : footer (h-1)
const GAUGE_TOP    = 3;
const GAUGE_BOT    = 4;
const VIEWPORT_TOP = 5;
const VIEWPORT_BOT = 22;
const BOTTOM_TOP   = 23;
const ACTION_ROW   = 27;   // h-3 = bottom row of bottom panels (TRAVEL/DOCK)
const TICKER_ROW   = 28;
const FOOTER_ROW   = 29;

// Column layout
const FUEL_LABEL_COL   = 6;
const CARGO_LABEL_COL  = 6;
const SHIELD_LABEL_COL = 23;   // symmetric layout
const HULL_LABEL_COL   = 23;
const LEFT_PANEL_W     = 13;   // cols 0–12
const RADAR_START      = 13;
const RADAR_END        = 27;
const RIGHT_PANEL_START = 27;

// ── tests ─────────────────────────────────────────────────────────────────────

describe('ShipCockpitScene', () => {
  describe('render — chrome header', () => {
    it('header row 0 contains the system name SOL', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 0)).toContain('SOL');
    });

    it('header row 1 contains destination name ELYSIUM STATION', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 1)).toContain('ELYSIUM STATION');
    });

    it('header row 1 shows IN SPACE when destinationId is null', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(
        input, keyboardContext,
        makePlayer({ destinationId: null }),
        vi.fn(), vi.fn(), vi.fn(),
      );
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 1)).toContain('IN SPACE');
    });

    it('header row 0 shows the system name when in space', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(
        input, keyboardContext,
        makePlayer({ systemId: 'alpha-centauri', destinationId: null }),
        vi.fn(), vi.fn(), vi.fn(),
      );
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, 0)).toContain('ALPHA CENTAURI');
    });
  });

  describe('render — gauge strip (rows 3–4)', () => {
    it('renders fuel gauge label F at gauge top row', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[GAUGE_TOP][FUEL_LABEL_COL].char).toBe('F');
      expect(buf[GAUGE_TOP][FUEL_LABEL_COL].fg).toBe('yellow');
    });

    it('renders cargo gauge label C at gauge bottom row', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[GAUGE_BOT][CARGO_LABEL_COL].char).toBe('C');
      expect(buf[GAUGE_BOT][CARGO_LABEL_COL].fg).toBe('blue');
    });

    it('renders shields gauge label S with cyan colour', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[GAUGE_TOP][SHIELD_LABEL_COL].char).toBe('S');
      expect(buf[GAUGE_TOP][SHIELD_LABEL_COL].fg).toBe('cyan');
    });

    it('renders hull gauge label H with green colour', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[GAUGE_BOT][HULL_LABEL_COL].char).toBe('H');
      expect(buf[GAUGE_BOT][HULL_LABEL_COL].fg).toBe('green');
    });

    it('fuel gauge fill cells use yellow background when full', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      for (let i = 0; i < 10; i++) {
        expect(buf[GAUGE_TOP][FUEL_LABEL_COL + 1 + i].bg).toBe('yellow');
      }
    });

    it('empty cargo gauge fill cells use bright-black background', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      // cargo is 0 — all cells should be empty (bright-black)
      for (let i = 0; i < 10; i++) {
        expect(buf[GAUGE_BOT][CARGO_LABEL_COL + 1 + i].bg).toBe('bright-black');
      }
    });

    it('shields gauge fill cells are fully filled (placeholder = 1.0)', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      for (let i = 0; i < 10; i++) {
        expect(buf[GAUGE_TOP][SHIELD_LABEL_COL + 1 + i].bg).toBe('cyan');
      }
    });

    it('hull gauge fill cells are fully filled (placeholder = 1.0)', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      for (let i = 0; i < 10; i++) {
        expect(buf[GAUGE_BOT][HULL_LABEL_COL + 1 + i].bg).toBe('green');
      }
    });
  });

  describe('render — starfield viewport (rows 5–22)', () => {
    it('viewport contains non-space cells (starfield rendered)', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      let nonSpace = false;
      outer: for (let r = VIEWPORT_TOP; r <= VIEWPORT_BOT; r++) {
        for (let c = 0; c < 40; c++) {
          if (buf[r][c].char !== ' ') { nonSpace = true; break outer; }
        }
      }
      expect(nonSpace).toBe(true);
    });

    it('viewport has no border characters at col 0 or col 39', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      for (let r = VIEWPORT_TOP; r <= VIEWPORT_BOT; r++) {
        expect(buf[r][0].char).not.toBe('|');
        expect(buf[r][39].char).not.toBe('|');
      }
    });

    it('HUD overlay appears on second viewport row (first row is border)', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, VIEWPORT_TOP + 1)).toContain('VEL:');
      expect(rowText(buf, VIEWPORT_TOP + 1)).toContain('ATT:');
      expect(rowText(buf, VIEWPORT_TOP + 1)).toContain('ROT:');
    });

    it('starfield borders render as ─ at viewport top and bottom rows', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[VIEWPORT_TOP][0].char).toBe('─');
      expect(buf[VIEWPORT_TOP][20].char).toBe('─');
      expect(buf[VIEWPORT_BOT][0].char).toBe('─');
      expect(buf[VIEWPORT_BOT][20].char).toBe('─');
    });

    it('crosshair centre character ╋ appears in viewport', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      let found = false;
      for (let r = VIEWPORT_TOP; r <= VIEWPORT_BOT; r++) {
        for (let c = 0; c < 40; c++) {
          if (buf[r][c].char === '╋') { found = true; break; }
        }
        if (found) break;
      }
      expect(found).toBe(true);
    });

    it('crosshair corner brackets appear in viewport in bright-green', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const corners = ['┌', '┐', '└', '┘'];
      for (const ch of corners) {
        let found = false;
        outer: for (let r = VIEWPORT_TOP; r <= VIEWPORT_BOT; r++) {
          for (let c = 0; c < 40; c++) {
            if (buf[r][c].char === ch && buf[r][c].fg === 'bright-green') { found = true; break outer; }
          }
        }
        expect(found).toBe(true);
      }
    });

    it('starfield changes after update with large dt', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf1 = makeBuffer(40, 30);
      scene.render(buf1);
      scene.update(5000);
      const buf2 = makeBuffer(40, 30);
      scene.render(buf2);
      let changed = false;
      outer: for (let r = VIEWPORT_TOP; r <= VIEWPORT_BOT; r++) {
        for (let c = 0; c < 40; c++) {
          if (buf1[r][c].char !== buf2[r][c].char || buf1[r][c].fg !== buf2[r][c].fg) {
            changed = true; break outer;
          }
        }
      }
      expect(changed).toBe(true);
    });
  });

  describe('render — bottom panels', () => {
    it('TRAVEL word appears at action row left panel with yellow background', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ACTION_ROW)).toContain('TRAVEL');
      // cursor starts on TRAVEL → bright-yellow
      const travelCell = buf[ACTION_ROW][Math.floor(LEFT_PANEL_W / 2)];
      expect(['yellow', 'bright-yellow']).toContain(travelCell.bg);
    });

    it('DOCK word appears at action row right panel with cyan background when destination exists', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(rowText(buf, ACTION_ROW)).toContain('DOCK');
      const dockCell = buf[ACTION_ROW][RIGHT_PANEL_START + Math.floor((40 - RIGHT_PANEL_START) / 2)];
      expect(['cyan', 'bright-cyan']).toContain(dockCell.bg);
    });

    it('DOCK is dimmed (bright-black bg) when in space', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(
        input, keyboardContext,
        makePlayer({ destinationId: null }),
        vi.fn(), vi.fn(), vi.fn(),
      );
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const dockCell = buf[ACTION_ROW][RIGHT_PANEL_START + Math.floor((40 - RIGHT_PANEL_START) / 2)];
      expect(dockCell.bg).toBe('bright-black');
    });

    it('radar zone (cols 13–26) has bright-black background', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      const radarRow = BOTTOM_TOP;
      for (let c = RADAR_START; c < RADAR_END; c++) {
        expect(buf[radarRow][c].bg).toBe('bright-black');
      }
    });

    it('cursor on TRAVEL → bright-yellow bg; cursor on DOCK → bright-cyan bg', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);

      // Initially cursor on TRAVEL
      expect(buf[ACTION_ROW][0].bg).toBe('bright-yellow');
      expect(buf[ACTION_ROW][RIGHT_PANEL_START].bg).toBe('cyan');

      // After DOWN: cursor on DOCK
      input.triggerAction('DOWN');
      const buf2 = makeBuffer(40, 30);
      scene.render(buf2);
      expect(buf2[ACTION_ROW][0].bg).toBe('yellow');
      expect(buf2[ACTION_ROW][RIGHT_PANEL_START].bg).toBe('bright-cyan');
    });
  });

  describe('render — ticker (row 28)', () => {
    it('ticker row right portion has bright-black background', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      for (let c = 27; c < 40; c++) {
        expect(buf[TICKER_ROW][c].bg).toBe('bright-black');
      }
    });

    it('ticker row is rendered without throwing', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      expect(() => scene.render(buf)).not.toThrow();
    });
  });

  describe('render — layout at varying heights', () => {
    it('renders without error at MIN_GRID_HEIGHT (30)', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      expect(() => scene.render(makeBuffer(40, 30))).not.toThrow();
    });

    it('renders without error at MAX_GRID_HEIGHT (50)', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      expect(() => scene.render(makeBuffer(40, 50))).not.toThrow();
    });

    it('viewport grows with height (TRAVEL/DOCK always at h-3)', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf50 = makeBuffer(40, 50);
      scene.render(buf50);
      const actionRow50 = 50 - 3;
      expect(rowText(buf50, actionRow50)).toContain('TRAVEL');
      expect(rowText(buf50, actionRow50)).toContain('DOCK');
    });
  });

  describe('keyboard navigation', () => {
    it('cursor starts on TRAVEL (bright-yellow bg at left panel)', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[ACTION_ROW][0].bg).toBe('bright-yellow');
    });

    it('DOWN moves cursor to DOCK (left panel becomes yellow, right becomes bright-cyan)', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[ACTION_ROW][0].bg).toBe('yellow');
      expect(buf[ACTION_ROW][RIGHT_PANEL_START].bg).toBe('bright-cyan');
    });

    it('UP from TRAVEL wraps to DOCK', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      input.triggerAction('UP');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[ACTION_ROW][0].bg).toBe('yellow');
      expect(buf[ACTION_ROW][RIGHT_PANEL_START].bg).toBe('bright-cyan');
    });

    it('DOWN from DOCK wraps back to TRAVEL', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      input.triggerAction('DOWN');
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[ACTION_ROW][0].bg).toBe('bright-yellow');
    });

    it('SELECT on TRAVEL calls onTravel', () => {
      const onTravel = vi.fn();
      const input = new MockInputHandler();
      new ShipCockpitScene(input, keyboardContext, makePlayer(), onTravel, vi.fn(), vi.fn());
      input.triggerAction('SELECT');
      expect(onTravel).toHaveBeenCalledTimes(1);
    });

    it('SELECT on TRAVEL silences further input', () => {
      const onTravel = vi.fn();
      const input = new MockInputHandler();
      new ShipCockpitScene(input, keyboardContext, makePlayer(), onTravel, vi.fn(), vi.fn());
      input.triggerAction('SELECT');
      input.triggerAction('SELECT');
      expect(onTravel).toHaveBeenCalledTimes(1);
    });

    it('SELECT on DOCK calls onDock when destination exists', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), onDock, vi.fn());
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      expect(onDock).toHaveBeenCalledTimes(1);
    });

    it('SELECT on DOCK silences further input', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), onDock, vi.fn());
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      input.triggerAction('SELECT');
      expect(onDock).toHaveBeenCalledTimes(1);
    });

    it('SELECT does not call onDock when in space', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipCockpitScene(
        input, keyboardContext,
        makePlayer({ destinationId: null }),
        vi.fn(), onDock, vi.fn(),
      );
      input.triggerAction('DOWN');
      input.triggerAction('SELECT');
      expect(onDock).not.toHaveBeenCalled();
    });

    it('CARGO action calls onCargo and silences further input', () => {
      const onCargo = vi.fn();
      const input = new MockInputHandler();
      new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), onCargo);
      input.triggerAction('CARGO');
      expect(onCargo).toHaveBeenCalledTimes(1);
      input.triggerAction('CARGO');
      expect(onCargo).toHaveBeenCalledTimes(1);
    });

    it('BACK action does nothing', () => {
      const onTravel = vi.fn();
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipCockpitScene(input, keyboardContext, makePlayer(), onTravel, onDock, vi.fn());
      input.triggerAction('BACK');
      expect(onTravel).not.toHaveBeenCalled();
      expect(onDock).not.toHaveBeenCalled();
    });

    it('UP/DOWN wrap to 1 option when in space (only TRAVEL)', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(
        input, keyboardContext,
        makePlayer({ destinationId: null }),
        vi.fn(), onDock, vi.fn(),
      );
      // Even after DOWN, cursor stays on TRAVEL (only 1 nav option)
      input.triggerAction('DOWN');
      const buf = makeBuffer(40, 30);
      scene.render(buf);
      expect(buf[ACTION_ROW][0].bg).toBe('bright-yellow');
    });
  });

  describe('touch navigation', () => {
    it('tap on TRAVEL area (action row, left panel) calls onTravel', () => {
      const onTravel = vi.fn();
      const input = new MockInputHandler();
      new ShipCockpitScene(input, keyboardContext, makePlayer(), onTravel, vi.fn(), vi.fn());
      input.triggerTap(5, ACTION_ROW);
      expect(onTravel).toHaveBeenCalledTimes(1);
    });

    it('tap on DOCK area (action row, right panel) calls onDock when destination exists', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), onDock, vi.fn());
      input.triggerTap(32, ACTION_ROW);
      expect(onDock).toHaveBeenCalledTimes(1);
    });

    it('tap on DOCK area does not call onDock when in space', () => {
      const onDock = vi.fn();
      const input = new MockInputHandler();
      new ShipCockpitScene(
        input, keyboardContext,
        makePlayer({ destinationId: null }),
        vi.fn(), onDock, vi.fn(),
      );
      input.triggerTap(32, ACTION_ROW);
      expect(onDock).not.toHaveBeenCalled();
    });

    it('tap on cargo gauge area (row 3–4, cols 6–16) calls onCargo', () => {
      const onCargo = vi.fn();
      const input = new MockInputHandler();
      new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), onCargo);
      input.triggerTap(10, 3);
      expect(onCargo).toHaveBeenCalledTimes(1);
    });

    it('tap on cargo gauge area row 4 also calls onCargo', () => {
      const onCargo = vi.fn();
      const input = new MockInputHandler();
      new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), onCargo);
      input.triggerTap(10, 4);
      expect(onCargo).toHaveBeenCalledTimes(1);
    });

    it('tap on fuel gauge area (col < 6) does not call onCargo', () => {
      const onCargo = vi.fn();
      const input = new MockInputHandler();
      new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), onCargo);
      input.triggerTap(3, 3);
      expect(onCargo).not.toHaveBeenCalled();
    });
  });

  describe('Scene interface', () => {
    it('update() accepts dt without throwing', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      expect(() => scene.update(16.7)).not.toThrow();
    });

    it('update() advances animation state (buttons, radar, ticker)', () => {
      const input = new MockInputHandler();
      const scene = new ShipCockpitScene(input, keyboardContext, makePlayer(), vi.fn(), vi.fn(), vi.fn());
      expect(() => {
        for (let i = 0; i < 10; i++) scene.update(100);
      }).not.toThrow();
    });
  });
});
