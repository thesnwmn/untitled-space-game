import type { InputHandler, GameContext } from '../../shared/types';
import type { PlayerState } from '../player-state';
import { getMissionStatus } from '../player-state';
import { wrapText } from '../../shared/buffer-utils';
import { getDestination, getGameBalance } from '../world/world-data';
import { BaseMenuScene, type MenuItemDef } from './base-menu-scene';
import { ModalInputDialog } from '../ui/modal-input-dialog';
import { ModalConfirmDialog } from '../ui/modal-confirm-dialog';

export class StationMenuScene extends BaseMenuScene {
  private readonly onShip: () => void;
  private readonly onRefuel: (cost: number, litres: number) => void;
  private readonly onHub: () => void;
  private readonly fuelItemIdx: number | null;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    destinationId: string,
    onRefuel: (cost: number, litres: number) => void,
    onTrader: () => void,
    onMissionBoard: () => void,
    onHub: () => void,
    onShip: () => void,
    onMenu: () => void,
  ) {
    const dest = getDestination(destinationId)!;

    // Mission items
    const pickupMissions = player.getMissionsForPickup(destinationId);
    const deliveryMissions = player.getMissionsForDelivery(destinationId);

    const collectItems: MenuItemDef[] = pickupMissions.map(m => ({
      label: `COLLECT: ${m.type === 'delivery' ? m.itemName : ''}`,
      accentFg: 'bright-yellow' as const,
      action: () => {},
    }));

    const deliverItems: MenuItemDef[] = deliveryMissions.map(m => ({
      label: `DELIVER: ${m.title} → ${m.reward} CR`,
      accentFg: 'bright-yellow' as const,
      action: () => {},
    }));

    const missionMenuItems = [...collectItems, ...deliverItems];

    // Amenity items
    const amenityItems: MenuItemDef[] = [];
    if (dest.amenities.trader) amenityItems.push({ label: 'TRADER', action: onTrader });
    if (dest.amenities.missionBoard) amenityItems.push({ label: 'MISSION BOARD', action: onMissionBoard });

    const fuelPricePerL = getGameBalance().fuel.pricePerLitre;
    const fuelNeeded  = player.fuelCapacityL - player.fuelL;
    const affordableL = Math.floor(player.credits / fuelPricePerL);
    const purchaseL   = Math.min(fuelNeeded, affordableL);
    let fuelIdx: number | null = null;
    if (dest.amenities.fuel && purchaseL > 0) {
      const cost = purchaseL * fuelPricePerL;
      fuelIdx = missionMenuItems.length + (missionMenuItems.length > 0 ? 1 : 0) + amenityItems.length;
      amenityItems.push({
        label: `BUY FUEL  +${purchaseL}L  ${cost}CR`,
        action: () => {},
      });
    }

    // Combine: mission items, optional separator, amenity items
    const items: MenuItemDef[] = [];
    if (missionMenuItems.length > 0) {
      items.push(...missionMenuItems);
      items.push({ label: '────────────────────', disabled: true, action: () => {} });
    }
    items.push(...amenityItems);

    const descLines = wrapText(dest.description, 36).slice(0, 3);
    const dangerLine = `DANGER: ${dest.dangerLevel.toUpperCase()}`;
    const infoLines = [...descLines, dangerLine];
    const undockLabel = (dest.locationType === 'surface' || dest.locationType === 'asteroid') ? 'TAKE OFF' : 'UNDOCK';

    super(
      'HUB',
      items,
      [{ id: 'undock', label: undockLabel }],
      inputHandler,
      context,
      player,
      infoLines,
      null,
      onMenu,
    );

    this.onShip = onShip;
    this.onRefuel = onRefuel;
    this.onHub = onHub;
    this.fuelItemIdx = fuelIdx;

    // Attach real actions to collect items (after super so `this` is valid)
    for (let i = 0; i < pickupMissions.length; i++) {
      const m = pickupMissions[i];
      collectItems[i].action = () => {
        this.player.collectMissionItem(m.id);
        this.onHub();
      };
    }

    // Attach real actions to deliver items
    for (let i = 0; i < deliveryMissions.length; i++) {
      const m = deliveryMissions[i];
      deliverItems[i].action = () => {
        const status = getMissionStatus(m, this.player);
        if (status !== 'ready-to-deliver') {
          this.openModal(new ModalConfirmDialog({
            title: 'CANNOT DELIVER',
            body: m.type === 'delivery'
              ? 'Mission item is missing from your cargo.'
              : 'Required supplies are missing from your cargo.',
            confirmLabel: 'OKAY',
            onConfirm: () => {
              this.closeModal();
              this.activated = false;
            },
          }));
          return;
        }
        if (m.type === 'supply') {
          for (const req of m.requirements) {
            this.player.removeCargo(req.commodityId, req.qty);
          }
        }
        this.player.completeMission(m.id);
        this.player.addCredits(m.reward);
        this.openModal(new ModalConfirmDialog({
          title: 'MISSION COMPLETE',
          body: `Mission complete!\n\nYou received ${m.reward} CR.`,
          confirmLabel: 'OKAY',
          onConfirm: () => {
            this.closeModal();
            this.onHub();
          },
        }));
      };
    }
  }

  protected override activateCurrent(): void {
    const items = this.items;
    if (items.length === 0 || this.cursorIdx === -1) return;
    const item = items[this.cursorIdx];
    if (item.disabled) return;

    if (this.fuelItemIdx !== null && this.cursorIdx === this.fuelItemIdx) {
      this.activated = true;
      const fuelPricePerL = getGameBalance().fuel.pricePerLitre;
      const fuelNeeded = this.player.fuelCapacityL - this.player.fuelL;
      const affordableL = Math.floor(this.player.credits / fuelPricePerL);
      const max = Math.min(fuelNeeded, affordableL);
      this.openModal(new ModalInputDialog({
        title: 'BUY FUEL',
        field: { label: 'Litres', initialValue: max, min: 0, max },
        derivedRows: [{ label: 'Cost', compute: l => `${l * fuelPricePerL} CR` }],
        confirmLabel: 'BUY',
        onConfirm: (litres) => {
          this.closeModal();
          if (litres > 0) this.onRefuel(litres * fuelPricePerL, litres);
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
