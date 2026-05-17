import { describe, it, expect } from 'vitest';
import { getReputationLevel, getReputationLabel, getMissionRewardString } from './reputation-utils';
import { getGameBalance } from './world/world-data';

describe('getReputationLevel', () => {
  const balance = getGameBalance();
  const { levelUnfriendlyMin, levelNeutralMin, levelFriendlyMin, levelLikedMin, levelReveredMin } = balance.reputation;

  it('returns HATED (-2) below levelUnfriendlyMin', () => {
    expect(getReputationLevel(levelUnfriendlyMin - 1, balance)).toBe(-2);
    expect(getReputationLevel(-600, balance)).toBe(-2);
  });

  it('returns UNFRIENDLY (-1) at levelUnfriendlyMin', () => {
    expect(getReputationLevel(levelUnfriendlyMin, balance)).toBe(-1);
  });

  it('returns UNFRIENDLY (-1) between levelUnfriendlyMin and levelNeutralMin', () => {
    expect(getReputationLevel(levelNeutralMin - 1, balance)).toBe(-1);
  });

  it('returns NEUTRAL (0) at levelNeutralMin', () => {
    expect(getReputationLevel(levelNeutralMin, balance)).toBe(0);
  });

  it('returns NEUTRAL (0) between levelNeutralMin and levelFriendlyMin', () => {
    expect(getReputationLevel(0, balance)).toBe(0);
    expect(getReputationLevel(levelFriendlyMin - 1, balance)).toBe(0);
  });

  it('returns FRIENDLY (1) at levelFriendlyMin', () => {
    expect(getReputationLevel(levelFriendlyMin, balance)).toBe(1);
  });

  it('returns LIKED (2) at levelLikedMin', () => {
    expect(getReputationLevel(levelLikedMin, balance)).toBe(2);
  });

  it('returns REVERED (3) at levelReveredMin', () => {
    expect(getReputationLevel(levelReveredMin, balance)).toBe(3);
    expect(getReputationLevel(1000, balance)).toBe(3);
  });
});

describe('getReputationLabel', () => {
  it('maps all six levels to their labels', () => {
    expect(getReputationLabel(-2)).toBe('HATED');
    expect(getReputationLabel(-1)).toBe('UNFRIENDLY');
    expect(getReputationLabel(0)).toBe('NEUTRAL');
    expect(getReputationLabel(1)).toBe('FRIENDLY');
    expect(getReputationLabel(2)).toBe('LIKED');
    expect(getReputationLabel(3)).toBe('REVERED');
  });
});

describe('getMissionRewardString', () => {
  it('formats positive deltas with + prefix', () => {
    expect(getMissionRewardString(100)).toBe('+100');
    expect(getMissionRewardString(50)).toBe('+50');
    expect(getMissionRewardString(1)).toBe('+1');
  });

  it('formats negative deltas without extra sign', () => {
    expect(getMissionRewardString(-100)).toBe('-100');
    expect(getMissionRewardString(-50)).toBe('-50');
    expect(getMissionRewardString(-1)).toBe('-1');
  });

  it('formats zero as +0', () => {
    expect(getMissionRewardString(0)).toBe('+0');
  });
});
