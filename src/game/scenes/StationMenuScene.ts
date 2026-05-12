import type { InputHandler, GameContext } from '../../shared/types';
import { STATION_NAME } from '../constants';
import { BaseMenuScene } from './BaseMenuScene';

export class StationMenuScene extends BaseMenuScene {
  constructor(inputHandler: InputHandler, context: GameContext, onUndock: () => void) {
    super(
      STATION_NAME.toUpperCase(),
      [
        { label: 'TRADER', action: () => console.log('[Station] Opening trader…') },
        { label: 'MISSION BOARD', action: () => console.log('[Station] Opening mission board…') },
        { label: 'UNDOCK', action: onUndock },
      ],
      inputHandler,
      context,
    );
  }
}
