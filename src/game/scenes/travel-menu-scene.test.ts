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

const context: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

// ── render ───────────────────────────────────────────────────────────────────

describe('TravelMenuScene render', () => {
  it('does not throw for sol with a current destination', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn());
    expect(() => scene.render(makeBuffer(40, 30))).not.toThrow();
  });

  it('does not throw in arrival mode (no current destination)', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'alpha-centauri', null, vi.fn(), vi.fn(), null);
    expect(() => scene.render(makeBuffer(40, 30))).not.toThrow();
  });

  it('renders TRAVEL as the title', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('TRAVEL');
  });

  it('renders the system name', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('SOL');
  });

  it('renders DESTINATIONS tab and JUMPS tab', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const text = allText(buf);
    expect(text).toContain('[DESTINATIONS]');
    expect(text).toContain('[JUMPS]');
  });

  it('DESTINATIONS is highlighted on initial render', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // Find the row containing [DESTINATIONS] — it should be bright-green
    const tabRow = buf[7];
    const destIdx = tabRow.findIndex((_, i) =>
      tabRow.slice(i, i + 14).map(c => c.char).join('') === '[DESTINATIONS]'
    );
    expect(destIdx).toBeGreaterThanOrEqual(0);
    expect(tabRow[destIdx].fg).toBe('bright-green');
  });

  it('shows destinations from the current system in DESTINATIONS tab', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('ELYSIUM STATION');
  });

  it('renders the current destination in bright-black (greyed out)', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // Find cell that starts the label "ELYSIUM STATION" — should be bright-black
    let found = false;
    for (const row of buf) {
      const text = row.map(c => c.char).join('');
      const idx = text.indexOf('ELYSIUM STATION');
      if (idx >= 0) {
        expect(row[idx].fg).toBe('bright-black');
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('does not grey out any destination in arrival mode', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'alpha-centauri', null, vi.fn(), vi.fn(), null);
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // All item rows at ITEM_ROW_START+ should not be bright-black
    const system = getSystem('alpha-centauri')!;
    for (let i = 0; i < system.destinations.length; i++) {
      const row = buf[9 + i];
      // the item text starts at col 2; check the label chars
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
    // Sol destinations: elysium-station(0,greyed), galileo-transfer(1), ...
    new TravelMenuScene(input, context, 'sol', 'elysium-station', onDest, vi.fn(), vi.fn());
    // Move down to second item (galileo-transfer)
    input.triggerAction('DOWN');
    input.triggerAction('SELECT');
    expect(onDest).toHaveBeenCalledTimes(1);
    const system = getSystem('sol')!;
    expect(onDest).toHaveBeenCalledWith(system.destinations[1]);
  });

  it('SELECT on the greyed-out current destination does NOT call onDestinationSelected', () => {
    const onDest = vi.fn();
    const input = new MockInputHandler();
    new TravelMenuScene(input, context, 'sol', 'elysium-station', onDest, vi.fn(), vi.fn());
    // Cursor starts at 0 (elysium-station, greyed)
    input.triggerAction('SELECT');
    expect(onDest).not.toHaveBeenCalled();
  });

  it('SELECT calls onDestinationSelected in arrival mode (no greyed items)', () => {
    const onDest = vi.fn();
    const input = new MockInputHandler();
    new TravelMenuScene(input, context, 'alpha-centauri', null, onDest, vi.fn(), null);
    input.triggerAction('SELECT');
    const system = getSystem('alpha-centauri')!;
    expect(onDest).toHaveBeenCalledWith(system.destinations[0]);
  });
});

// ── JUMPS tab keyboard ────────────────────────────────────────────────────────

describe('TravelMenuScene JUMPS tab', () => {
  it('RIGHT switches to JUMPS tab', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn());
    input.triggerAction('RIGHT');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // JUMPS tab should now be bright-green
    const tabRow = buf[7];
    const jumpsIdx = tabRow.findIndex((_, i) =>
      tabRow.slice(i, i + 7).map(c => c.char).join('') === '[JUMPS]'
    );
    expect(jumpsIdx).toBeGreaterThanOrEqual(0);
    expect(tabRow[jumpsIdx].fg).toBe('bright-green');
  });

  it('RIGHT then render shows jump routes', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn());
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
    new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), onJump, vi.fn());
    input.triggerAction('RIGHT');
    input.triggerAction('SELECT');
    expect(onJump).toHaveBeenCalledTimes(1);
    const calledId = onJump.mock.calls[0][0] as string;
    expect(getSystem(calledId)).toBeDefined();
  });

  it('LEFT from JUMPS switches back to DESTINATIONS', () => {
    const input = new MockInputHandler();
    const scene = new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), vi.fn());
    input.triggerAction('RIGHT');
    input.triggerAction('LEFT');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const tabRow = buf[7];
    const destIdx = tabRow.findIndex((_, i) =>
      tabRow.slice(i, i + 14).map(c => c.char).join('') === '[DESTINATIONS]'
    );
    expect(tabRow[destIdx].fg).toBe('bright-green');
  });
});

// ── BACK ──────────────────────────────────────────────────────────────────────

describe('TravelMenuScene BACK', () => {
  it('BACK calls onBack when provided', () => {
    const onBack = vi.fn();
    const input = new MockInputHandler();
    new TravelMenuScene(input, context, 'sol', 'elysium-station', vi.fn(), vi.fn(), onBack);
    input.triggerAction('BACK');
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('BACK does nothing in arrival mode (onBack is null)', () => {
    const onDest = vi.fn();
    const input = new MockInputHandler();
    new TravelMenuScene(input, context, 'sol', null, onDest, vi.fn(), null);
    input.triggerAction('BACK');
    expect(onDest).not.toHaveBeenCalled();
  });
});
