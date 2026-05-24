import type { CharBuffer, GameAction } from '../../shared/types';
import type { PlayerState } from '../player-state';

export interface EncounterOverlayConfig {
  onBegin: () => void;
}

export abstract class EncounterOverlay {
  protected onBegin: () => void;

  constructor(config: EncounterOverlayConfig) {
    this.onBegin = config.onBegin;
  }

  abstract update(dt: number): void;

  abstract render(buffer: CharBuffer, top: number, bottom: number, left: number, right: number): void;

  abstract handleAction(action: GameAction): void;

  abstract handleTap(col: number, row: number): void;

  isActive(): boolean {
    return true;
  }
}
