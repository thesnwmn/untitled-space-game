import type { InputHandler, GameContext, CharBuffer } from '../../shared/types';
import { STATION_NAME } from '../constants';
import { BaseMenuScene } from './BaseMenuScene';
import { NavBar } from '../ui/NavBar';

export class StationMenuScene extends BaseMenuScene {
  private navActivated = false;
  private readonly navBar = new NavBar(
    STATION_NAME.toUpperCase(),
    [{ id: 'undock', label: 'UNDOCK' }],
  );

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    onTrader: () => void,
    onMissionBoard: () => void,
    onShip: () => void,
  ) {
    super(
      'HUB',
      [
        { label: 'TRADER', action: onTrader },
        { label: 'MISSION BOARD', action: onMissionBoard },
      ],
      inputHandler,
      context,
    );

    inputHandler.onAction((action) => {
      if (this.navActivated) return;
      if (action === 'BACK') {
        this.navActivated = true;
        onShip();
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((col, row) => {
        if (this.navActivated) return;
        if (this.navBar.hitTest(col, row) === 'undock') {
          this.navActivated = true;
          onShip();
        }
      });
    }
  }

  override render(buffer: CharBuffer): void {
    super.render(buffer);
    this.navBar.render(buffer);
  }
}
