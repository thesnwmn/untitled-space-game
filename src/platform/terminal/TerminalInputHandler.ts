import type { InputHandler, GameAction } from '../../shared/types';

export class TerminalInputHandler implements InputHandler {
  onAction(_handler: (action: GameAction) => void): void {}
}
