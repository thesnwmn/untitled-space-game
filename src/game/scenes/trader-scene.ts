import type { InputHandler, GameContext, CharBuffer } from '../../shared/types';
import type { PlayerState } from '../player-state';
import type { TraderStockEntry } from '../world/types';
import { getCommodity, getDestination } from '../world/world-data';
import { writeText } from '../../shared/buffer-utils';
import { contentBottom } from '../ui/screen-chrome';
import { BaseMenuScene, type MenuItemDef, type TabDef } from './base-menu-scene';
import { ModalInputDialog } from '../ui/modal-input-dialog';

export class TraderScene extends BaseMenuScene {
  private readonly traderStock: TraderStockEntry[];
  private readonly onBuy: (commodityId: string, qty: number) => void;
  private readonly onSell: (commodityId: string, qty: number) => void;
  private readonly onHub: () => void;
  private readonly onUndock: () => void;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    destinationId: string,
    traderStock: TraderStockEntry[],
    onBuy: (commodityId: string, qty: number) => void,
    onSell: (commodityId: string, qty: number) => void,
    onHub: () => void,
    onUndock: () => void,
  ) {
    const dest = getDestination(destinationId)!;
    const traderName = dest.npcs.trader?.toUpperCase() ?? 'TRADER';

    const tabs: TabDef[] = [
      { label: 'BUY', items: [] },
      { label: 'SELL', items: [] },
    ];

    super(
      traderName,
      [],
      [{ id: 'undock', label: 'UNDOCK' }, { id: 'hub', label: 'HUB' }],
      inputHandler,
      context,
      player,
      [],
      tabs,
    );

    this.traderStock = traderStock;
    this.onBuy = onBuy;
    this.onSell = onSell;
    this.onHub = onHub;
    this.onUndock = onUndock;

    // Populate tabs and set cursor before any actions can fire
    this.syncItems();
    this.clampCursor();
  }

  private buildBuyItems(): MenuItemDef[] {
    if (this.traderStock.length === 0) {
      return [{ label: 'NO STOCK AVAILABLE', disabled: true, action: () => {} }];
    }
    return this.traderStock.flatMap(entry => {
      const commodity = getCommodity(entry.commodityId);
      if (!commodity) return [];
      const canAfford = this.player.credits >= commodity.basePrice;
      return [{
        label: `${commodity.name} (x${entry.qty})`,
        info: `${commodity.basePrice} CR`,
        disabled: !canAfford,
        action: () => {
          const maxAffordable = Math.floor(this.player.credits / commodity.basePrice);
          const initial = Math.min(entry.qty, maxAffordable);
          this.openModal(new ModalInputDialog({
            title: commodity.name.toUpperCase(),
            field: { label: 'Quantity', initialValue: initial, min: 0, max: initial },
            derivedRows: [{ label: 'Total', compute: qty => `${qty * commodity.basePrice} CR` }],
            confirmLabel: 'BUY',
            onConfirm: (qty) => {
              if (qty > 0) this.onBuy(entry.commodityId, qty);
              this.syncItems();
              this.clampCursor();
              this.closeModal();
            },
            onCancel: () => this.closeModal(),
          }));
        },
      }];
    });
  }

  private buildSellItems(): MenuItemDef[] {
    const hold = this.player.cargoHold;
    if (hold.length === 0) {
      return [{ label: 'CARGO HOLD EMPTY', disabled: true, action: () => {} }];
    }
    return [...hold].flatMap(entry => {
      const commodity = getCommodity(entry.commodityId);
      if (!commodity) return [];
      return [{
        label: `${commodity.name} (x${entry.qty})`,
        info: `${commodity.basePrice} CR`,
        action: () => {
          this.openModal(new ModalInputDialog({
            title: commodity.name.toUpperCase(),
            field: { label: 'Quantity', initialValue: entry.qty, min: 0, max: entry.qty },
            derivedRows: [{ label: 'Total', compute: qty => `${qty * commodity.basePrice} CR` }],
            confirmLabel: 'SELL',
            onConfirm: (qty) => {
              if (qty > 0) this.onSell(entry.commodityId, qty);
              this.syncItems();
              this.clampCursor();
              this.closeModal();
            },
            onCancel: () => this.closeModal(),
          }));
        },
      }];
    });
  }

  // Rebuild tab item arrays from live data. Pure data sync — no cursor mutation.
  private syncItems(): void {
    if (!this.tabs) return;
    this.tabs[0].items = this.buildBuyItems();
    this.tabs[1].items = this.buildSellItems();
  }

  // Clamp cursor to first enabled item in the active tab.
  // findIndex returns -1 when all items are disabled (empty-state placeholder) — correct.
  private clampCursor(): void {
    const items = this.items;
    if (this.cursorIdx < 0 || this.cursorIdx >= items.length || items[this.cursorIdx]?.disabled) {
      this.cursorIdx = items.findIndex(item => !item.disabled);
    }
  }

  protected override activateCurrent(): void {
    const items = this.items;
    if (items.length === 0 || this.cursorIdx < 0 || this.cursorIdx >= items.length) return;
    const item = items[this.cursorIdx];
    if (item.disabled) return;
    item.action(); // opens modal; syncItems/clampCursor happen in modal onConfirm
    // Don't set activated — player can keep trading
  }

  protected override handleNavAction(action: string): void {
    if ((action === 'BACK' || action === 'NAV_2') && !this.activated) {
      this.activated = true;
      this.onHub();
    } else if (action === 'NAV_1' && !this.activated) {
      this.activated = true;
      this.onUndock();
    }
  }

  protected override handleNavTap(navId: string): void {
    if (navId === 'hub' && !this.activated) {
      this.activated = true;
      this.onHub();
    } else if (navId === 'undock' && !this.activated) {
      this.activated = true;
      this.onUndock();
    }
  }

  override render(buffer: CharBuffer): void {
    this.syncItems(); // refresh display data; no cursor mutation
    super.render(buffer);

    const h = buffer.length;
    const footerText = `HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`;
    const footerRow = contentBottom(h, true) - 2;
    writeText(buffer, footerRow, 2, footerText, 'bright-black', 'black');
  }
}
