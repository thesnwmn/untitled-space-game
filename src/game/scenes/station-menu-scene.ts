import type { InputHandler, GameContext } from '../../shared/types';
import type { PlayerState } from '../PlayerState';
import { wrapText } from '../../shared/buffer-utils';
import { getDestination } from '../world/world-data';
import { FUEL_PRICE_PER_L } from '../constants';
import { BaseMenuScene, type MenuItemDef } from './base-menu-scene';
import { ModalInputDialog } from '../ui/modal-input-dialog';

export class StationMenuScene extends BaseMenuScene {
  private readonly onShip: () => void;
  private readonly onRefuel: (cost: number, litres: number) => void;
  private readonly fuelItemIdx: number | null;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    destinationId: string,
    onRefuel: (cost: number, litres: number) => void,
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
    let fuelIdx: number | null = null;
    if (dest.amenities.fuel && purchaseL > 0) {
      const cost = purchaseL * FUEL_PRICE_PER_L;
      fuelIdx = items.length;
      items.push({
        label: `BUY FUEL  +${purchaseL}L  ${cost}CR`,
        action: () => {}, // overridden by activateCurrent
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
    this.onRefuel = onRefuel;
    this.fuelItemIdx = fuelIdx;
  }

  protected override activateCurrent(): void {
    const items = this.items;
    if (items.length === 0 || this.cursorIdx === -1) return;
    const item = items[this.cursorIdx];
    if (item.disabled) return;

    if (this.fuelItemIdx !== null && this.cursorIdx === this.fuelItemIdx) {
      this.activated = true;
      const fuelNeeded = this.player.fuelCapacityL - this.player.fuelL;
      const affordableL = Math.floor(this.player.credits / FUEL_PRICE_PER_L);
      const max = Math.min(fuelNeeded, affordableL);
      this.openModal(new ModalInputDialog({
        title: 'BUY FUEL',
        field: { label: 'Litres', initialValue: max, min: 0, max },
        derivedRows: [{ label: 'Cost', compute: l => `${l * FUEL_PRICE_PER_L} CR` }],
        confirmLabel: 'BUY',
        onConfirm: (litres) => {
          this.closeModal();
          if (litres > 0) this.onRefuel(litres * FUEL_PRICE_PER_L, litres);
        },
        onCancel: () => {
          this.closeModal();
          this.activated = false;
        },
      }));
      return;
    }

    this.activated = true;
    item.action();
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
