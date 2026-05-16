import type { CharBuffer, GameAction } from '../../shared/types';

export interface Modal {
  handleAction(action: GameAction): void;
  handleCharInput(char: string): void;
  handleTap(col: number, row: number): void;
  render(buffer: CharBuffer): void;
}
