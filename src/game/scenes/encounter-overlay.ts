import type { CharBuffer, GameAction, GameContext } from '../../shared/types';
import type { PlayerState } from '../player-state';

export interface EncounterOverlayConfig {
  onBegin: () => void;
  context: GameContext;
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
  protected context: GameContext;

  constructor(config: EncounterOverlayConfig) {
    this.onBegin = config.onBegin;
    this.context = config.context;
  }

  abstract update(dt: number): void;

  abstract render(buffer: CharBuffer, bounds: OverlayRenderBounds): void;

  abstract handleAction(action: GameAction): void;

  abstract handleTap(col: number, row: number): void;

  isActive(): boolean {
    return true;
  }
}

