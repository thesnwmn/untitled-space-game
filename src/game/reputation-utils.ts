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

export function getTradeModifier(level: number, balance: GameBalance): number {
  switch (level) {
    case -2: return balance.reputation.tradeModifierHated;
    case -1: return balance.reputation.tradeModifierUnfriendly;
    case 1:  return balance.reputation.tradeModifierFriendly;
    case 2:  return balance.reputation.tradeModifierLiked;
    case 3:  return balance.reputation.tradeModifierRevered;
    default: return balance.reputation.tradeModifierNeutral;
  }
}

export function getMissionTierLabel(delta: number, isSigned: boolean): string {
  const abs = Math.abs(delta);
  const sign = isSigned && delta < 0 ? '-' : '+';
  if (abs <= 50) return `${sign}SMALL`;
  if (abs <= 150) return `${sign}MEDIUM`;
  return `${sign}LARGE`;
}

export function computeReputationDeltas(
  givingFaction: Faction,
  delta: number,
  allFactions: Faction[],
): Map<string, number> {
  const deltas = new Map<string, number>();
  deltas.set(givingFaction.id, delta);
  const allyDelta = Math.floor(delta / 2);
  for (const allyId of givingFaction.allies) {
    deltas.set(allyId, allyDelta);
  }
  const rivalDelta = -Math.floor(delta / 2);
  for (const rivalId of givingFaction.rivals) {
    deltas.set(rivalId, rivalDelta);
  }
  return deltas;
}
