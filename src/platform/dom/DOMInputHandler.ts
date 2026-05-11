import type { InputHandler, GameAction } from '../../shared/types';

export class DOMInputHandler implements InputHandler {
  onAction(_handler: (action: GameAction) => void): void {}
  onTap(_handler: (col: number, row: number) => void): void {}
}
