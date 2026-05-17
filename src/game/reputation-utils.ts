import type { Faction, GameBalance } from './world/types';

export function isReputationEligible(faction: Faction): boolean {
  return faction.size === 'medium' || faction.size === 'large';
}

export function getReputationLevel(points: number, balance: GameBalance): number {
  if (points >= balance.reputation.levelReveredMin) return 3;
  if (points >= balance.reputation.levelLikedMin) return 2;
  if (points >= balance.reputation.levelFriendlyMin) return 1;
  if (points < balance.reputation.levelNeutralMin) return -2;
  if (points < balance.reputation.levelUnfriendlyMin) return -1;
  return 0;
}

export function getReputationLabel(level: number): string {
  switch (level) {
    case -2: return 'HATED';
    case -1: return 'UNFRIENDLY';
    case 0: return 'NEUTRAL';
    case 1: return 'FRIENDLY';
    case 2: return 'LIKED';
    case 3: return 'REVERED';
    default: return 'NEUTRAL';
  }
}
