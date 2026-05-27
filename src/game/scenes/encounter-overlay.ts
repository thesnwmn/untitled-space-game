import type { CharBuffer, GameAction } from '../../shared/types';
import type { PlayerState } from '../player-state';

export interface EncounterOverlayConfig {
  onBegin: () => void;
}

export interface OverlayRenderBounds {
  viewportTop: number;
  viewportBot: number;
  bottomTop: number;
  bottomBot: number;
  width: number;
}

export abstract class EncounterOverlay {
  protected onBegin: () => void;

  constructor(config: EncounterOverlayConfig) {
    this.onBegin = config.onBegin;
  }

  abstract update(dt: number): void;

  abstract render(buffer: CharBuffer, bounds: OverlayRenderBounds): void;

  abstract handleAction(action: GameAction): void;

  abstract handleTap(col: number, row: number): void;

  isActive(): boolean {
    return true;
  }
}

