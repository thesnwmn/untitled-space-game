import type { InputHandler, GameContext, CharBuffer } from '../../shared/types';
import { wrapText, writeText } from '../../shared/buffer-utils';
import { getDestination } from '../world/world-data';
import { BaseMenuScene, type MenuItemDef } from './BaseMenuScene';
import { NavBar } from '../ui/NavBar';

export class StationMenuScene extends BaseMenuScene {
  private navActivated = false;
  private readonly navBar: NavBar;
  private readonly descLines: string[];
  private readonly dangerLine: string;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    destinationId: string,
    onTrader: () => void,
    onMissionBoard: () => void,
    onShip: () => void,
  ) {
    const dest = getDestination(destinationId)!;
    const items: MenuItemDef[] = [];
    if (dest.amenities.trader) items.push({ label: 'TRADER', action: onTrader });
    if (dest.amenities.missionBoard) items.push({ label: 'MISSION BOARD', action: onMissionBoard });

    super('HUB', items, inputHandler, context);

    this.navBar = new NavBar(
      dest.name.toUpperCase(),
      [{ id: 'undock', label: 'UNDOCK' }],
    );
    this.descLines = wrapText(dest.description, 36).slice(0, 3);
    this.dangerLine = `DANGER: ${dest.dangerLevel.toUpperCase()}`;

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
    for (let i = 0; i < this.descLines.length; i++) {
      writeText(buffer, 5 + i, 2, this.descLines[i], 'bright-black', 'black');
    }
    writeText(buffer, 5 + this.descLines.length + 1, 2, this.dangerLine, 'bright-black', 'black');
  }
}
