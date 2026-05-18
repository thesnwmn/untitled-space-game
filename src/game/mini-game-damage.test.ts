import { describe, it, expect } from 'vitest';
import { computeMiniGameDamage, getMiniGameOutcomeLabel } from './game';

const balance = {
  maxHullDamageFraction: 0.10,
  abandonDamageFraction: 0.05,
  noDamageThreshold: 90,
};

describe('computeMiniGameDamage', () => {
  describe('skipped outcome', () => {
    it('returns abandonDamageFraction with multiplier 1', () => {
      const { damageFraction, score } = computeMiniGameDamage({ outcome: 'skipped' }, 1.0, balance);
      expect(damageFraction).toBeCloseTo(0.05);
      expect(score).toBeNull();
    });

    it('scales by difficultyMultiplier', () => {
      const { damageFraction } = computeMiniGameDamage({ outcome: 'skipped' }, 2.0, balance);
      expect(damageFraction).toBeCloseTo(0.10);
    });
  });

  describe('completed outcome', () => {
    it('returns zero damage when score >= noDamageThreshold', () => {
      const { damageFraction, score } = computeMiniGameDamage(
        { outcome: 'completed', result: { score: 90 } }, 1.0, balance,
      );
      expect(damageFraction).toBe(0);
      expect(score).toBe(90);
    });

    it('returns zero damage when score > noDamageThreshold', () => {
      const { damageFraction } = computeMiniGameDamage(
        { outcome: 'completed', result: { score: 100 } }, 1.0, balance,
      );
      expect(damageFraction).toBe(0);
    });

    it('returns maxHullDamageFraction when score is 0', () => {
      const { damageFraction, score } = computeMiniGameDamage(
        { outcome: 'completed', result: { score: 0 } }, 1.0, balance,
      );
      expect(damageFraction).toBeCloseTo(0.10);
      expect(score).toBe(0);
    });

    it('returns proportional damage for a midpoint score', () => {
      // score 45, noDamageThreshold 90 → fraction = 0.10 * (1 - 45/90) = 0.10 * 0.5 = 0.05
      const { damageFraction } = computeMiniGameDamage(
        { outcome: 'completed', result: { score: 45 } }, 1.0, balance,
      );
      expect(damageFraction).toBeCloseTo(0.05);
    });

    it('scales damage by difficultyMultiplier', () => {
      // score 0, multiplier 2 → 0.10 * 1 * 2 = 0.20
      const { damageFraction } = computeMiniGameDamage(
        { outcome: 'completed', result: { score: 0 } }, 2.0, balance,
      );
      expect(damageFraction).toBeCloseTo(0.20);
    });

    it('difficultyMultiplier does not affect zero-damage scores', () => {
      const { damageFraction } = computeMiniGameDamage(
        { outcome: 'completed', result: { score: 95 } }, 3.0, balance,
      );
      expect(damageFraction).toBe(0);
    });
  });
});

describe('getMiniGameOutcomeLabel', () => {
  it('returns ABORTED for null score', () => {
    expect(getMiniGameOutcomeLabel('docking', null)).toBe('ABORTED');
    expect(getMiniGameOutcomeLabel('surface-landing', null)).toBe('ABORTED');
  });

  describe('docking labels', () => {
    it('COLLISION for score < 40', () => {
      expect(getMiniGameOutcomeLabel('docking', 0)).toBe('COLLISION');
      expect(getMiniGameOutcomeLabel('docking', 39)).toBe('COLLISION');
    });
    it('ROUGH DOCK for score 40–69', () => {
      expect(getMiniGameOutcomeLabel('docking', 40)).toBe('ROUGH DOCK');
      expect(getMiniGameOutcomeLabel('docking', 69)).toBe('ROUGH DOCK');
    });
    it('DOCKED for score 70–89', () => {
      expect(getMiniGameOutcomeLabel('docking', 70)).toBe('DOCKED');
      expect(getMiniGameOutcomeLabel('docking', 89)).toBe('DOCKED');
    });
    it('PERFECT DOCK for score 90–100', () => {
      expect(getMiniGameOutcomeLabel('docking', 90)).toBe('PERFECT DOCK');
      expect(getMiniGameOutcomeLabel('docking', 100)).toBe('PERFECT DOCK');
    });
  });

  describe('landing labels', () => {
    it('CRASH for score < 40', () => {
      expect(getMiniGameOutcomeLabel('surface-landing', 0)).toBe('CRASH');
      expect(getMiniGameOutcomeLabel('asteroid-landing', 39)).toBe('CRASH');
    });
    it('HARD LANDING for score 40–69', () => {
      expect(getMiniGameOutcomeLabel('surface-landing', 40)).toBe('HARD LANDING');
      expect(getMiniGameOutcomeLabel('asteroid-landing', 69)).toBe('HARD LANDING');
    });
    it('LANDED for score 70–89', () => {
      expect(getMiniGameOutcomeLabel('surface-landing', 70)).toBe('LANDED');
      expect(getMiniGameOutcomeLabel('asteroid-landing', 89)).toBe('LANDED');
    });
    it('PERFECT LANDING for score 90–100', () => {
      expect(getMiniGameOutcomeLabel('surface-landing', 90)).toBe('PERFECT LANDING');
      expect(getMiniGameOutcomeLabel('asteroid-landing', 100)).toBe('PERFECT LANDING');
    });
  });
});
