import { describe, it, expect, vi } from 'vitest';
import { GalaxyMapScene } from './galaxy-map-scene';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';
import { makePlayer } from '../../tests/makePlayer';

class MockInputHandler implements InputHandler {
  private actionHandlers: Array<(action: GameAction) => void> = [];
  private tapHandlers: Array<(col: number, row: number) => void> = [];
  private charInputHandlers: Array<(char: string) => void> = [];

  onAction(handler: (action: GameAction) => void): void { this.actionHandlers.push(handler); }
  onTap(handler: (col: number, row: number) => void): void { this.tapHandlers.push(handler); }
  onCharInput(handler: (char: string) => void): void { this.charInputHandlers.push(handler); }

  triggerAction(action: GameAction): void { for (const h of this.actionHandlers) h(action); }
  triggerTap(col: number, row: number): void { for (const h of this.tapHandlers) h(col, row); }
  triggerChar(char: string): void { for (const h of this.charInputHandlers) h(char); }
}

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

function allText(buffer: CharBuffer): string {
  return buffer.map(row => row.map(c => c.char).join('')).join('\n');
}

const ctx: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

// ── render ───────────────────────────────────────────────────────────────────

describe('GalaxyMapScene render', () => {
  it('does not throw for a player at sol', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    expect(() => scene.render(makeBuffer(40, 30))).not.toThrow();
  });

  it('renders MAP and ROUTE tabs', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const text = allText(buf);
    expect(text).toContain('MAP');
    expect(text).toContain('ROUTE');
  });

  it('MAP tab is highlighted by default', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // MAP tab active = bg green somewhere in tab row (CONTENT_TOP+3 = row 6)
    const tabRow = buf[6];
    const hasGreenCell = tabRow.some(c => c.char !== ' ' && c.bg === 'green');
    expect(hasGreenCell).toBe(true);
  });

  it('MAP tab shows the current system name', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('SOL');
  });

  it('MAP tab shows * Current location marker for player system in info row', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('* Current loc');
  });

  it('ROUTE tab shows FROM: and current system when RIGHT is pressed', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    input.triggerAction('RIGHT');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const text = allText(buf);
    expect(text).toContain('FROM:');
    expect(text).toContain('SOL');
  });

  it('does not throw for a 50-row buffer', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    expect(() => scene.render(makeBuffer(40, 50))).not.toThrow();
  });
});

// ── tab switching ─────────────────────────────────────────────────────────────

describe('GalaxyMapScene tab switching', () => {
  it('RIGHT switches to ROUTE tab', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    input.triggerAction('RIGHT');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // ROUTE tab bg = green somewhere in tab row (CONTENT_TOP+3 = row 6)
    const tabRow = buf[6];
    const greenCells = tabRow.filter(c => c.bg === 'green').map(c => c.char);
    expect(greenCells.join('')).toContain('R'); // part of 'ROUTE'
  });

  it('LEFT returns to MAP tab from ROUTE tab', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    input.triggerAction('RIGHT');
    input.triggerAction('LEFT');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // Should show neighbor list (MAP-only content)
    expect(allText(buf)).toContain('ALPHA CENTAURI');
  });
});

// ── navigation ────────────────────────────────────────────────────────────────

describe('GalaxyMapScene MAP tab navigation', () => {
  it('DOWN moves cursor to next system', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    input.triggerAction('DOWN');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('ALPHA CENTAURI');
  });

  it('UP from first item stays at first', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    input.triggerAction('UP');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // Cursor stays on first neighbor (alpha-centauri)
    expect(allText(buf)).toContain('> ALPHA');
  });
});

// ── SELECT re-centres ─────────────────────────────────────────────────────────

describe('GalaxyMapScene SELECT re-centres chart', () => {
  it('SELECT re-centres chart on the highlighted neighbour', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    // Cursor starts on alpha-centauri (first Sol neighbour)
    input.triggerAction('SELECT');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // After re-centring on alpha-centauri, SOL should appear as its neighbour
    const LIST_TOP = 18;
    const LIST_BOT = 23;
    const listText = buf.slice(LIST_TOP, LIST_BOT).map(row => row.map(c => c.char).join('')).join('\n');
    expect(listText).toContain('SOL');
  });

  it('tap on list item re-centres chart on that system', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    // LIST_TOP_ROW = 18; tap row 18 = first neighbour (alpha-centauri)
    input.triggerTap(5, 18);
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // After re-centring on alpha-centauri, SOL should appear as its neighbour
    const LIST_TOP = 18;
    const LIST_BOT = 23;
    const listText = buf.slice(LIST_TOP, LIST_BOT).map(row => row.map(c => c.char).join('')).join('\n');
    expect(listText).toContain('SOL');
  });
});

// ── BACK ─────────────────────────────────────────────────────────────────────

describe('GalaxyMapScene BACK action', () => {
  it('BACK calls onBack', () => {
    const onBack = vi.fn();
    const input = new MockInputHandler();
    new GalaxyMapScene(input, ctx, makePlayer(), onBack);
    input.triggerAction('BACK');
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('BACK clears search text instead of going back when text is present', () => {
    const onBack = vi.fn();
    const input = new MockInputHandler();
    new GalaxyMapScene(input, ctx, makePlayer(), onBack);
    input.triggerChar('S');
    input.triggerAction('BACK');
    expect(onBack).not.toHaveBeenCalled();
    // Second BACK with empty search goes back
    input.triggerAction('BACK');
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

// ── search ────────────────────────────────────────────────────────────────────

describe('GalaxyMapScene search', () => {
  it('typing letters filters the visible system list', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    // 'ALPHA' matches only ALPHA CENTAURI among Sol's neighbours (barnard's, wolf 359 don't match)
    for (const ch of 'ALPHA') input.triggerChar(ch);
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // Check only list rows (18-22) — chart still shows all neighbours unconditionally
    const LIST_TOP = 18;
    const LIST_BOT = 23;
    const listText = buf.slice(LIST_TOP, LIST_BOT).map(row => row.map(c => c.char).join('')).join('\n');
    expect(listText).toContain('ALPHA CENTAURI');
    expect(listText).not.toContain('BARNARD');
    expect(listText).not.toContain('WOLF');
  });

  it('search text appears in buffer', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    input.triggerChar('P');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('/P_');
  });
});

// ── ROUTE tab ─────────────────────────────────────────────────────────────────

describe('GalaxyMapScene ROUTE tab', () => {
  it('shows a route when destination is reachable', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    input.triggerAction('RIGHT'); // switch to ROUTE tab
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('Route:');
  });

  it('DOWN on ROUTE tab moves destination cursor', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), vi.fn());
    input.triggerAction('RIGHT');
    input.triggerAction('DOWN'); // move to second destination
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // Route tab should still show Route: for the new destination
    expect(allText(buf)).toContain('Route:');
  });
});

// ── global menu ───────────────────────────────────────────────────────────────

describe('GalaxyMapScene global menu', () => {
  it('MENU action calls onMenu without silencing the scene', () => {
    const onBack = vi.fn();
    const onMenu = vi.fn();
    const input = new MockInputHandler();
    new GalaxyMapScene(input, ctx, makePlayer(), onBack, onMenu);
    input.triggerAction('MENU');
    expect(onMenu).toHaveBeenCalledTimes(1);
    // scene still alive: BACK should still call onBack
    input.triggerAction('BACK');
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('header tap on [M] MENU area calls onMenu without silencing the scene', () => {
    const onBack = vi.fn();
    const onMenu = vi.fn();
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), onBack, onMenu);
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // [M] MENU starts at col w-10 = 30 for w=40
    input.triggerTap(30, 0);
    expect(onMenu).toHaveBeenCalledTimes(1);
    input.triggerAction('BACK');
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('suspend() silences the scene; resume() restores it', () => {
    const onBack = vi.fn();
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), onBack);
    scene.suspend();
    input.triggerAction('BACK');
    expect(onBack).not.toHaveBeenCalled();
    scene.resume();
    input.triggerAction('BACK');
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

// ── onGame nav option ──────────────────────────────────────────────────────────

describe('GalaxyMapScene onGame nav option', () => {
  it('[2] GAME nav option is present when onGame is provided', () => {
    const onBack = vi.fn();
    const onGame = vi.fn();
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), onBack, () => {}, onGame);
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const text = allText(buf);
    expect(text).toContain('GAME');
  });

  it('[2] GAME nav option is absent when onGame is not provided', () => {
    const onBack = vi.fn();
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), onBack);
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const text = allText(buf);
    expect(text).not.toContain('GAME');
  });

  it('NAV_2 action calls onGame when provided', () => {
    const onBack = vi.fn();
    const onGame = vi.fn();
    const input = new MockInputHandler();
    new GalaxyMapScene(input, ctx, makePlayer(), onBack, () => {}, onGame);
    input.triggerAction('NAV_2');
    expect(onGame).toHaveBeenCalledTimes(1);
  });

  it('NAV_2 action is a no-op when onGame is not provided', () => {
    const onBack = vi.fn();
    const input = new MockInputHandler();
    new GalaxyMapScene(input, ctx, makePlayer(), onBack);
    expect(() => input.triggerAction('NAV_2')).not.toThrow();
  });

  it('tap on [2] GAME nav area calls onGame', () => {
    const onBack = vi.fn();
    const onGame = vi.fn();
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), onBack, () => {}, onGame);
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // [2] GAME footer button is at row 29 (h-1), columns ~15-19
    input.triggerTap(15, 29);
    expect(onGame).toHaveBeenCalledTimes(1);
  });
});
