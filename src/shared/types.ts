export const GRID_WIDTH = 40;
export const MIN_GRID_HEIGHT = 30;
export const MAX_GRID_HEIGHT = 50;

export type Color =
  | 'black' | 'red' | 'green' | 'yellow'
  | 'blue' | 'magenta' | 'cyan' | 'white'
  | 'bright-black' | 'bright-red' | 'bright-green' | 'bright-yellow'
  | 'bright-blue' | 'bright-magenta' | 'bright-cyan' | 'bright-white'
  | 'transparent';

export interface Cell {
  char: string;
  fg: Color;
  bg: Color;
}

export type CharBuffer = Cell[][];

export interface Renderer {
  drawBuffer(buffer: CharBuffer): void;
  getWidth(): number;
  getHeight(): number;
  clear(): void;
  onResize(handler: (width: number, height: number) => void): void;
}

export interface InputHandler {
  onAction(handler: (action: GameAction) => void): void;
  onTap?(handler: (col: number, row: number) => void): void;
}

export interface Scene {
  update(dt: number): void;
  render(buffer: CharBuffer): void;
}

export type GameAction =
  | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  | 'SELECT' | 'BACK' | 'PAUSE'
  | 'PAGE_UP' | 'PAGE_DOWN';

export type RuntimeEnvironment = 'browser' | 'terminal';
export type PrimaryInput = 'keyboard' | 'touch';

export interface GameContext {
  environment: RuntimeEnvironment;
  primaryInput: PrimaryInput;
  debug: boolean;
}
