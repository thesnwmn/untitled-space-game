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
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
    expect(() => scene.render(makeBuffer(40, 30))).not.toThrow();
  });

  it('renders MAP and ROUTE tabs', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const text = allText(buf);
    expect(text).toContain('MAP');
    expect(text).toContain('ROUTE');
  });

  it('MAP tab is highlighted by default', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // MAP tab active = bg green somewhere in row 3
    const tabRow = buf[3];
    const hasGreenCell = tabRow.some(c => c.char !== ' ' && c.bg === 'green');
    expect(hasGreenCell).toBe(true);
  });

  it('MAP tab shows the current system name', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('SOL');
  });

  it('MAP tab shows system list with * HERE marker for current system', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    expect(allText(buf)).toContain('* HERE');
  });

  it('ROUTE tab shows FROM: and current system when RIGHT is pressed', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
    input.triggerAction('RIGHT');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    const text = allText(buf);
    expect(text).toContain('FROM:');
    expect(text).toContain('SOL');
  });

  it('does not throw for a 50-row buffer', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
    expect(() => scene.render(makeBuffer(40, 50))).not.toThrow();
  });
});

// ── tab switching ─────────────────────────────────────────────────────────────

describe('GalaxyMapScene tab switching', () => {
  it('RIGHT switches to ROUTE tab', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
    input.triggerAction('RIGHT');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // ROUTE tab bg = green somewhere in tab row
    const tabRow = buf[3];
    const greenCells = tabRow.filter(c => c.bg === 'green').map(c => c.char);
    expect(greenCells.join('')).toContain('R'); // part of 'ROUTE'
  });

  it('LEFT returns to MAP tab from ROUTE tab', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
    input.triggerAction('RIGHT');
    input.triggerAction('LEFT');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // Should show * HERE (MAP-only content)
    expect(allText(buf)).toContain('* HERE');
  });
});

// ── navigation ────────────────────────────────────────────────────────────────

describe('GalaxyMapScene MAP tab navigation', () => {
  it('DOWN moves cursor to next system', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
    // Initially at SOL (index 0); DOWN → alpha-centauri
    input.triggerAction('DOWN');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // Cursor should be on alpha-centauri (bright-cyan, not the player yellow)
    expect(allText(buf)).toContain('ALPHA CENTAURI');
  });

  it('UP from first item stays at first', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
    input.triggerAction('UP');
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // Still shows * HERE (player still at sol = first item)
    expect(allText(buf)).toContain('* HERE');
  });
});

// ── BACK ─────────────────────────────────────────────────────────────────────

describe('GalaxyMapScene BACK action', () => {
  it('BACK calls onBack', () => {
    const onBack = vi.fn();
    const input = new MockInputHandler();
    new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), onBack);
    input.triggerAction('BACK');
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('BACK clears search text instead of going back when text is present', () => {
    const onBack = vi.fn();
    const input = new MockInputHandler();
    new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), onBack);
    input.triggerChar('S');
    input.triggerAction('BACK');
    expect(onBack).not.toHaveBeenCalled();
    // Second BACK with empty search goes back
    input.triggerAction('BACK');
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

// ── jump ──────────────────────────────────────────────────────────────────────

describe('GalaxyMapScene jump behaviour', () => {
  it('SELECT on player system does not call onJump', () => {
    const onJump = vi.fn();
    const input = new MockInputHandler();
    new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, onJump, vi.fn());
    // At start, cursor is on SOL (player's system) — SELECT should not jump
    input.triggerAction('SELECT');
    expect(onJump).not.toHaveBeenCalled();
  });

  it('SELECT on a direct neighbour with enough fuel calls onJump', () => {
    const onJump = vi.fn();
    const input = new MockInputHandler();
    new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, onJump, vi.fn());
    // Move to alpha-centauri (direct neighbour of sol, costs 18 L, player has 100 L)
    input.triggerAction('DOWN'); // alpha-centauri
    input.triggerAction('SELECT');
    expect(onJump).toHaveBeenCalledTimes(1);
    expect(onJump).toHaveBeenCalledWith('alpha-centauri');
  });

  it('SELECT on a direct neighbour with insufficient fuel does NOT call onJump', () => {
    const onJump = vi.fn();
    const input = new MockInputHandler();
    const player = makePlayer();
    player.consumeFuel(95); // 5 L remaining — not enough for any jump
    new GalaxyMapScene(input, ctx, player, { canJump: true }, onJump, vi.fn());
    input.triggerAction('DOWN'); // alpha-centauri
    input.triggerAction('SELECT');
    expect(onJump).not.toHaveBeenCalled();
  });

  it('SELECT does not call onJump when canJump is false', () => {
    const onJump = vi.fn();
    const input = new MockInputHandler();
    new GalaxyMapScene(input, ctx, makePlayer(), { canJump: false }, onJump, vi.fn());
    input.triggerAction('DOWN');
    input.triggerAction('SELECT');
    expect(onJump).not.toHaveBeenCalled();
  });
});

// ── search ────────────────────────────────────────────────────────────────────

describe('GalaxyMapScene search', () => {
  it('typing letters filters the visible system list', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
    // 'PROC' uniquely matches Procyon, nothing else
    for (const ch of 'PROC') input.triggerChar(ch);
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // Check only list rows (15-22) — chart still shows Sol's neighbors unconditionally
    const LIST_TOP = 15;
    const LIST_BOT = 23;
    const listText = buf.slice(LIST_TOP, LIST_BOT).map(row => row.map(c => c.char).join('')).join('\n');
    expect(listText).toContain('PROCYON');
    expect(listText).not.toContain('SIRIUS');
    expect(listText).not.toContain('SOL');
  });

  it('search text appears in buffer', () => {
    const input = new MockInputHandler();
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
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
    const scene = new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, vi.fn(), vi.fn());
    input.triggerAction('RIGHT'); // switch to ROUTE tab
    const buf = makeBuffer(40, 30);
    scene.render(buf);
    // Should show "Route:" with hop count
    expect(allText(buf)).toContain('Route:');
  });

  it('ROUTE tab SELECT calls onJump with first-hop system when fuel ok', () => {
    const onJump = vi.fn();
    const input = new MockInputHandler();
    new GalaxyMapScene(input, ctx, makePlayer(), { canJump: true }, onJump, vi.fn());
    input.triggerAction('RIGHT'); // ROUTE tab
    // Default destination is first other system (alpha-centauri, direct neighbour)
    input.triggerAction('SELECT');
    expect(onJump).toHaveBeenCalledTimes(1);
  });

  it('ROUTE tab SELECT does not call onJump when canJump is false', () => {
    const onJump = vi.fn();
    const input = new MockInputHandler();
    new GalaxyMapScene(input, ctx, makePlayer(), { canJump: false }, onJump, vi.fn());
    input.triggerAction('RIGHT');
    input.triggerAction('SELECT');
    expect(onJump).not.toHaveBeenCalled();
  });
});
