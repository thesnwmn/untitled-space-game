import { describe, it, expect, vi } from 'vitest';
import { TravelMenuScene } from './TravelMenuScene';
import { getSystem, getRoutesFrom } from '../world/world-data';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';

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

function allText(buffer: CharBuffer): string {
  return buffer.map(row => row.map(c => c.char).join('')).join('\n');
}

const context: GameContext = {
  environment: 'browser', primaryInput: 'keyboard', debug: false,
  systemId: 'sol', destinationId: 'elysium-station', credits: 5000,
};

// TAB_ROW = CONTENT_TOP + 3 = 6
// Tab layout: "| DESTINATIONS | JUMPS |" left-aligned at col 2
// | at 2, DESTINATIONS area: cols 3–16, | at 17, JUMPS area: cols 18–24, | at 25
const TAB_ROW = 6;
const DEST_TAB_COL = 10; // middle of DESTINATIONS area (cols 3-16)
const JUMP_TAB_COL = 21; // middle of JUMPS area (cols 18-24)

// ITEM_ROW_START = CONTENT_TOP + 5 = 8
const ITEM_ROW_START = 8;

// ── render ───────────────────────────────────────────────────────────────────

describe('TravelMenuScene render', () => {
  it('does not throw for sol with a current destination', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn(), vi.fn());
    expect(() => scene.render(makeBuffer(40, 30))).not.toThrow();
  });

  it('does not throw in arrival mode (no current destination)', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'alpha-centauri', null, vi.fn(), vi.fn(), vi.fn(), vi.fn());
    expect(() => scene.render(makeBuffer(40, 30))).not.toThrow();
  });

  it('renders TRAVEL as the title', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('TRAVEL');
  });

  it('renders the system name', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('SOL');
  });

  it('renders DESTINATIONS tab and JUMPS tab', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const text = allText(buf);
    expect(text).toContain('DESTINATIONS');
    expect(text).toContain('JUMPS');
  });

  it('DESTINATIONS is highlighted (bg green) on initial render', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(buf[TAB_ROW][DEST_TAB_COL].bg).toBe('green');
    expect(buf[TAB_ROW][JUMP_TAB_COL].bg).toBe('black');
  });

  it('shows destinations from the current system in DESTINATIONS tab', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('ELYSIUM STATION');
  });

  it('renders the current destination in bright-black (greyed out)', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // Search only item rows (ITEM_ROW_START+) to avoid the chrome header which also shows the name
    let found = false;
    for (let r = ITEM_ROW_START; r < buf.length; r++) {
      const text = buf[r].map(c => c.char).join('');
      const idx = text.indexOf('ELYSIUM STATION');
      if (idx >= 0) {
        expect(buf[r][idx].fg).toBe('bright-black');
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('does not grey out any destination in arrival mode', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'alpha-centauri', null, vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const system = getSystem('alpha-centauri')!;
    for (let i = 0; i < system.destinations.length; i++) {
      const row = buf[ITEM_ROW_START + i];
      const labelChars = row.slice(2).filter(c => c.char !== ' ');
      for (const cell of labelChars) {
        expect(cell.fg).not.toBe('bright-black');
      }
    }
  });
});

// ── DESTINATIONS tab keyboard ─────────────────────────────────────────────────

describe('TravelMenuScene DESTINATIONS tab', () => {
  it('SELECT on a non-current destination calls onDestinationSelected', () => {
    const onDest = vi.fn();
    const input = new MockInputHandler();
    new TravelMenuScene(input, context, 'sol', 'elysium-station', onDest, vi.fn(), vi.fn(), vi.fn());
    input.triggerAction('DOWN');
    input.triggerAction('SELECT');
    expect(onDest).toHaveBeenCalledTimes(1);
    const system = getSystem('sol')!;
    expect(onDest).toHaveBeenCalledWith(system.destinations[1]);
  });

  it('SELECT on the greyed-out current destination does NOT call onDestinationSelected', () => {
    const onDest = vi.fn();
    const input = new MockInputHandler();
    new TravelMenuScene(input, context, 'sol', 'elysium-station', onDest, vi.fn(), vi.fn(), vi.fn());
    input.triggerAction('SELECT');
    expect(onDest).not.toHaveBeenCalled();
  });

  it('SELECT calls onDestinationSelected in arrival mode (no greyed items)', () => {
    const onDest = vi.fn();
    const input = new MockInputHandler();
    new TravelMenuScene(input, context, 'alpha-centauri', null, onDest, vi.fn(), vi.fn(), vi.fn());
    input.triggerAction('SELECT');
    const system = getSystem('alpha-centauri')!;
    expect(onDest).toHaveBeenCalledWith(system.destinations[0]);
  });
});

// ── JUMPS tab keyboard ────────────────────────────────────────────────────────

describe('TravelMenuScene JUMPS tab', () => {
  it('RIGHT switches to JUMPS tab (bg green on JUMPS area)', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn(), vi.fn());
    input.triggerAction('RIGHT');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(buf[TAB_ROW][JUMP_TAB_COL].bg).toBe('green');
    expect(buf[TAB_ROW][DEST_TAB_COL].bg).toBe('black');
  });

  it('RIGHT then render shows jump routes', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn(), vi.fn());
    input.triggerAction('RIGHT');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const routes = getRoutesFrom('sol');
    const targetId = routes[0].from === 'sol' ? routes[0].to : routes[0].from;
    const targetName = getSystem(targetId)!.name.toUpperCase();
    expect(allText(buf)).toContain(targetName);
  });

  it('SELECT on JUMPS tab calls onJumpSelected with a valid system id', () => {
    const onJump = vi.fn();
    const input = new MockInputHandler();
    new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), onJump, vi.fn(), vi.fn());
    input.triggerAction('RIGHT');
    input.triggerAction('SELECT');
    expect(onJump).toHaveBeenCalledTimes(1);
    const calledId = onJump.mock.calls[0][0] as string;
    expect(getSystem(calledId)).toBeDefined();
  });

  it('LEFT from JUMPS switches back to DESTINATIONS (bg green on DESTINATIONS area)', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn(), vi.fn());
    input.triggerAction('RIGHT');
    input.triggerAction('LEFT');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(buf[TAB_ROW][DEST_TAB_COL].bg).toBe('green');
    expect(buf[TAB_ROW][JUMP_TAB_COL].bg).toBe('black');
  });
});

// ── SHIP / BACK ───────────────────────────────────────────────────────────────

describe('TravelMenuScene SHIP navigation', () => {
  it('BACK calls onShip', () => {
    const onShip = vi.fn();
    const input = new MockInputHandler();
    new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn(), onShip);
    input.triggerAction('BACK');
    expect(onShip).toHaveBeenCalledTimes(1);
  });

  it('BACK calls onShip in arrival mode too', () => {
    const onShip = vi.fn();
    const input = new MockInputHandler();
    new TravelMenuScene(input, context, 'sol', null, vi.fn(), vi.fn(), vi.fn(), onShip);
    input.triggerAction('BACK');
    expect(onShip).toHaveBeenCalledTimes(1);
  });
});

// ── FLY INTO SPACE ────────────────────────────────────────────────────────────

describe('TravelMenuScene FLY INTO SPACE', () => {
  it('renders FLY INTO SPACE in the destinations list', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('FLY INTO SPACE');
  });

  it('FLY INTO SPACE is selectable when at a destination', () => {
    const onFlyIntoSpace = vi.fn();
    const input = new MockInputHandler();
    const system = getSystem('sol')!;
    new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), onFlyIntoSpace, vi.fn());
    for (let i = 0; i < system.destinations.length; i++) input.triggerAction('DOWN');
    input.triggerAction('SELECT');
    expect(onFlyIntoSpace).toHaveBeenCalledTimes(1);
  });

  it('FLY INTO SPACE is greyed out in arrival mode (already in space)', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', null, vi.fn(), vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    for (const row of buf) {
      const text = row.map(c => c.char).join('');
      const idx = text.indexOf('FLY INTO SPACE');
      if (idx >= 0) {
        expect(row[idx].fg).toBe('bright-black');
        return;
      }
    }
    throw new Error('FLY INTO SPACE not found in buffer');
  });

  it('SELECT on FLY INTO SPACE does nothing when greyed (already in space)', () => {
    const onFlyIntoSpace = vi.fn();
    const system = getSystem('sol')!;
    const input = new MockInputHandler();
    new TravelMenuScene(input, context, 'sol', null, vi.fn(), vi.fn(), onFlyIntoSpace, vi.fn());
    for (let i = 0; i < system.destinations.length; i++) input.triggerAction('DOWN');
    input.triggerAction('SELECT');
    expect(onFlyIntoSpace).not.toHaveBeenCalled();
  });
});
