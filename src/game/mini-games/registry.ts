import type { InputHandler, GameContext, MiniGameDescriptorMeta, MiniGameResult } from '../../shared/types';
import type { PlayerState } from '../player-state';
import type { BaseMiniGameScene } from '../scenes/base-mini-game-scene';

// Pure data — safe to import from Bun build scripts and terminal harness
export const miniGameDescriptors: MiniGameDescriptorMeta[] = [];

// Includes factory functions — import only from browser/terminal runners
export interface MiniGameEntry {
  meta: MiniGameDescriptorMeta;
  factory: (
    input: InputHandler,
    context: GameContext,
    player: PlayerState,
    params: URLSearchParams | Record<string, string>,
    onComplete?: (result: MiniGameResult) => void,
  ) => BaseMiniGameScene;
}

export const miniGameRegistry: MiniGameEntry[] = [];
