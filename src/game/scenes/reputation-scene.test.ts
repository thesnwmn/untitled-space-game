import { describe, it, expect } from 'vitest';
import { ReputationScene } from './reputation-scene';
import { getGameBalance, getWorld } from '../world/world-data';
import { isReputationEligible } from '../reputation-utils';
import { makePlayer } from '../../tests/makePlayer';
import type { InputHandler, GameAction, CharBuffer, Color, GameContext } from '../../shared/types';

class MockInputHandler implements InputHandler {
  onAction(_handler: (action: GameAction) => void): void {}
  onTap(_handler: (col: number, row: number) => void): void {}
}

class TestableReputationScene extends ReputationScene {
  get testItems() { return this.items; }
}

function makeBuffer(w: number, h: number): CharBuffer {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ char: ' ', fg: 'black' as Color, bg: 'black' as Color }))
  );
}

const ctx: GameContext = { environment: 'browser', primaryInput: 'keyboard', debug: false };

function makeScene(player: ReturnType<typeof makePlayer>): TestableReputationScene {
  return new TestableReputationScene(
    new MockInputHandler(),
    ctx,
    player,
    () => {},
    () => {},
  );
}

describe('ReputationScene', () => {
  const balance = getGameBalance();
  const world = getWorld();
  const eligible = world.factions.filter(f => isReputationEligible(f));
  const testFaction = eligible.find(f => f.size === 'large')!;

  const BAR_WIDTH = 20;
  const FILLED = '█';
  const EMPTY = '░';

  describe('bar range', () => {
    it('bar is empty at pointsMin (HATED floor)', () => {
      const player = makePlayer();
      player.modifyFactionReputation(testFaction.id, balance.reputation.pointsMin, balance);
      const item = makeScene(player).testItems.find(i => i.label === testFaction.name)!;
      const barText = item.detailsColored![0].left.map(s => s.text).join('');
      expect(barText).toBe(EMPTY.repeat(BAR_WIDTH));
    });

    it('bar is full at levelReveredMin (REVERED start)', () => {
      const player = makePlayer();
      player.modifyFactionReputation(testFaction.id, balance.reputation.levelReveredMin, balance);
      const item = makeScene(player).testItems.find(i => i.label === testFaction.name)!;
      const barText = item.detailsColored![0].left.map(s => s.text).join('');
      expect(barText).toBe(FILLED.repeat(BAR_WIDTH));
    });

    it('bar is full above levelReveredMin', () => {
      const player = makePlayer();
      player.modifyFactionReputation(testFaction.id, balance.reputation.levelReveredMin + 100, balance);
      const item = makeScene(player).testItems.find(i => i.label === testFaction.name)!;
      const barText = item.detailsColored![0].left.map(s => s.text).join('');
      expect(barText).toBe(FILLED.repeat(BAR_WIDTH));
    });

    it('bar is partially filled at midpoint between pointsMin and levelReveredMin', () => {
      const mid = Math.round((balance.reputation.pointsMin + balance.reputation.levelReveredMin) / 2);
      const player = makePlayer();
      player.modifyFactionReputation(testFaction.id, mid, balance);
      const item = makeScene(player).testItems.find(i => i.label === testFaction.name)!;
      const filled = item.detailsColored![0].left[0].text.length;
      expect(filled).toBeGreaterThan(0);
      expect(filled).toBeLessThan(BAR_WIDTH);
    });
  });

  describe('raw reputation number', () => {
    it('detailsColored right field contains the raw reputation number in bright-white', () => {
      const player = makePlayer();
      const repValue = 250;
      player.modifyFactionReputation(testFaction.id, repValue, balance);
      const item = makeScene(player).testItems.find(i => i.label === testFaction.name)!;
      expect(item.detailsColored![0].right?.text).toBe(String(repValue));
      expect(item.detailsColored![0].right?.fg).toBe('white');
    });

    it('detailsColored right field contains the raw number for negative reputation', () => {
      const player = makePlayer();
      const repValue = -150;
      player.modifyFactionReputation(testFaction.id, repValue, balance);
      const item = makeScene(player).testItems.find(i => i.label === testFaction.name)!;
      expect(item.detailsColored![0].right?.text).toBe(String(repValue));
    });

    it('rep number renders right-aligned with a 3-char right margin', () => {
      const W = 40;
      const H = 30;
      const player = makePlayer();
      const repValue = 123;
      player.modifyFactionReputation(testFaction.id, repValue, balance);
      const scene = makeScene(player);
      const buffer = makeBuffer(W, H);
      scene.render(buffer);
      const repStr = String(repValue);
      const expectedCol = (W - 4) - 4 - repStr.length;
      let found = false;
      for (let row = 0; row < H; row++) {
        const slice = buffer[row].slice(expectedCol, expectedCol + repStr.length).map(c => c.char).join('');
        if (slice === repStr) { found = true; break; }
      }
      expect(found).toBe(true);
    });
  });
});
