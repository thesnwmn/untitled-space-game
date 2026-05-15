import type { InputHandler, GameContext } from '../../shared/types';
import type { PlayerState } from '../PlayerState';
import { wrapText } from '../../shared/buffer-utils';
import { getDestination } from '../world/world-data';
import { FUEL_PRICE_PER_L } from '../constants';
import { BaseMenuScene, type MenuItemDef } from './base-menu-scene';

export class StationMenuScene extends BaseMenuScene {
  private readonly onShip: () => void;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    destinationId: string,
    onRefuel: (litres: number, cost: number) => void,
    onTrader: () => void,
    onMissionBoard: () => void,
    onShip: () => void,
  ) {
    const dest = getDestination(destinationId)!;
    const items: MenuItemDef[] = [];
    if (dest.amenities.trader) items.push({ label: 'TRADER', action: onTrader });
    if (dest.amenities.missionBoard) items.push({ label: 'MISSION BOARD', action: onMissionBoard });

    const fuelNeeded  = player.fuelCapacityL - player.fuelL;
    const affordableL = Math.floor(player.credits / FUEL_PRICE_PER_L);
    const purchaseL   = Math.min(fuelNeeded, affordableL);
    if (dest.amenities.fuel && purchaseL > 0) {
      const cost = purchaseL * FUEL_PRICE_PER_L;
      items.push({
        label: `BUY FUEL  +${purchaseL}L  ${cost}CR`,
        action: () => onRefuel(purchaseL, cost),
      });
    }

    const descLines = wrapText(dest.description, 36).slice(0, 3);
    const dangerLine = `DANGER: ${dest.dangerLevel.toUpperCase()}`;
    const infoLines = [...descLines, dangerLine];

    super(
      'HUB',
      items,
      [{ id: 'undock', label: 'UNDOCK' }],
      inputHandler,
      context,
      player,
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
