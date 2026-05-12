import type { InputHandler, GameContext } from '../../shared/types';
import { STATION_NAME } from '../constants';
import { BaseMenuScene } from './BaseMenuScene';

export class StationMenuScene extends BaseMenuScene {
  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    onTrader: () => void,
    onMissionBoard: () => void,
    onShip: () => void,
  ) {
    super(
      STATION_NAME.toUpperCase(),
      [
        { label: 'TRADER', action: onTrader },
        { label: 'MISSION BOARD', action: onMissionBoard },
        { label: 'UNDOCK', action: onShip },
      ],
      inputHandler,
      context,
    );
  }
}
