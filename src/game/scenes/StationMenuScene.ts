import type { InputHandler, GameContext } from '../../shared/types';
import { wrapText } from '../../shared/buffer-utils';
import { getDestination } from '../world/world-data';
import { BaseMenuScene, type MenuItemDef } from './BaseMenuScene';

export class StationMenuScene extends BaseMenuScene {
  private readonly onShip: () => void;

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

    const descLines = wrapText(dest.description, 36).slice(0, 3);
    const dangerLine = `DANGER: ${dest.dangerLevel.toUpperCase()}`;
    const infoLines = [...descLines, dangerLine];

    super(
      'HUB',
      items,
      [{ id: 'undock', label: 'UNDOCK' }],
      inputHandler,
      context,
      infoLines,
    );

    this.onShip = onShip;
  }

  protected override handleNavAction(action: string): void {
    if ((action === 'BACK' || action === 'NAV_1') && !this.activated) {
      this.activated = true;
      this.onShip();
    }
  }

  protected override handleNavTap(navId: string): void {
    if (navId === 'undock' && !this.activated) {
      this.activated = true;
      this.onShip();
    }
  }
}
