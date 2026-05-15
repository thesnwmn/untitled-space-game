import type { InputHandler, GameContext, CharBuffer } from '../../shared/types';
import type { PlayerState } from '../PlayerState';
import type { TraderStockEntry } from '../world/types';
import { getCommodity } from '../world/world-data';
import { getDestination } from '../world/world-data';
import { writeText } from '../../shared/buffer-utils';
import { contentBottom } from '../ui/screen-chrome';
import { BaseMenuScene, type MenuItemDef, type TabDef } from './base-menu-scene';

export class TraderScene extends BaseMenuScene {
  private readonly traderStock: TraderStockEntry[];
  private readonly _onBuy: (commodityId: string) => void;
  private readonly _onSell: (commodityId: string) => void;
  private readonly onHub: () => void;
  private readonly onUndock: () => void;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    destinationId: string,
    traderStock: TraderStockEntry[],
    onBuy: (commodityId: string) => void,
    onSell: (commodityId: string) => void,
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
    this._onBuy = onBuy;
    this._onSell = onSell;
    this.onHub = onHub;
    this.onUndock = onUndock;

    // Populate tabs and reset cursor with live data before any actions fire
    this.syncTabItems();
  }

  private buildBuyItems(): MenuItemDef[] {
    if (this.traderStock.length === 0) {
      return [{ label: 'NO STOCK AVAILABLE', disabled: true, action: () => {} }];
    }
    return this.traderStock.flatMap(entry => {
      const commodity = getCommodity(entry.commodityId);
      if (!commodity) return [];
      const totalPrice = entry.qty * commodity.basePrice;
      return [{
        label: `${commodity.name} (x${entry.qty})`,
        info: `${totalPrice} CR`,
        action: () => this._onBuy(entry.commodityId),
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
      const totalPrice = entry.qty * commodity.basePrice;
      return [{
        label: `${commodity.name} (x${entry.qty})`,
        info: `${totalPrice} CR`,
        action: () => this._onSell(entry.commodityId),
      }];
    });
  }

  private syncTabItems(): void {
    if (!this.tabs) return;
    this.tabs[0].items = this.buildBuyItems();
    this.tabs[1].items = this.buildSellItems();
    // Clamp cursor if it's out of bounds or on a disabled item
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
    item.action();
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
    this.syncTabItems();
    super.render(buffer);

    const h = buffer.length;
    const weight = this.player.cargoWeightKg;
    const capacity = this.player.cargoCapacity;
    const footerText = `HOLD: ${weight}/${capacity}KG`;
    const footerRow = contentBottom(h, true) - 2;
    writeText(buffer, footerRow, 2, footerText, 'bright-black', 'black');
  }
}
