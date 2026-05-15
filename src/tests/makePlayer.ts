import { PlayerState } from '../game/PlayerState';

export function makePlayer(overrides?: {
  shipId?: string;
  driveId?: string;
  credits?: number;
  systemId?: string;
  destinationId?: string | null;
}): PlayerState {
  return new PlayerState({
    shipId: overrides?.shipId ?? 'freighter',
    driveId: overrides?.driveId ?? 'civilian-mk1',
    credits: overrides?.credits ?? 5000,
    systemId: overrides?.systemId ?? 'sol',
    destinationId: overrides?.destinationId !== undefined ? overrides.destinationId : 'elysium-station',
  });
}
