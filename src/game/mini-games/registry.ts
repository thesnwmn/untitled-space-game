import type { InputHandler, GameContext, MiniGameDescriptorMeta, MiniGameResult } from '../../shared/types';
import type { PlayerState } from '../player-state';
import type { BaseMiniGameScene } from '../scenes/base-mini-game-scene';
import { DockingMiniGameScene } from '../scenes/docking-mini-game-scene';

// Pure data — safe to import from Bun build scripts and terminal harness
export const miniGameDescriptors: MiniGameDescriptorMeta[] = [
  {
    id: 'docking',
    name: 'Docking Mini-Game',
    description: 'Align the ship crosshair with the airlock target before countdown expires',
    variants: [
      { id: 'orbital', label: 'Orbital Station', params: { locationType: 'orbital' } },
      { id: 'deep-space', label: 'Deep Space', params: { locationType: 'deep-space' } },
    ],
  },
];

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

export const miniGameRegistry: MiniGameEntry[] = [
  {
    meta: miniGameDescriptors[0],
    factory: (input, context, player, _params, onComplete) =>
      new DockingMiniGameScene(input, context, player, onComplete),
  },
];
