import type { InputHandler, GameContext, CharBuffer, Color } from '../../shared/types';
import type { PlayerState } from '../player-state';
import type { TraderStockEntry } from '../world/types';
import { getCommodity, getDestination, getFaction, getGameBalance, getSystem, computeEffectiveFactor } from '../world/world-data';
import { isReputationEligible, getReputationLevel, getReputationLabel, getTradeModifier } from '../reputation-utils';
import { writeText } from '../../shared/buffer-utils';
import { CONTENT_TOP, contentBottom } from '../ui/screen-chrome';
import { BaseMenuScene, type MenuItemDef, type TabDef } from './base-menu-scene';
import { ModalInputDialog } from '../ui/modal-input-dialog';

export class TraderScene extends BaseMenuScene {
  private readonly traderStock: TraderStockEntry[];
  private readonly onBuy: (commodityId: string, qty: number, unitPrice: number) => void;
  private readonly onSell: (commodityId: string, qty: number, unitPrice: number) => void;
  private readonly onHub: () => void;
  private readonly onUndock: () => void;
  private readonly eligibleFactionId: string | null;
  private repGainedThisVisit: number = 0;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    destinationId: string,
    traderStock: TraderStockEntry[],
    onBuy: (commodityId: string, qty: number, unitPrice: number) => void,
    onSell: (commodityId: string, qty: number, unitPrice: number) => void,
    onHub: () => void,
    onUndock: () => void,
    onMenu: () => void,
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
      onMenu,
    );

    this.traderStock = traderStock;
    this.onBuy = onBuy;
    this.onSell = onSell;
    this.onHub = onHub;
    this.onUndock = onUndock;

    const factionId = dest.owningFactionId;
    if (factionId) {
      const faction = getFaction(factionId);
      this.eligibleFactionId = faction && isReputationEligible(faction) ? factionId : null;
    } else {
      this.eligibleFactionId = null;
    }

    // Populate tabs and set cursor before any actions can fire
    this.syncItems();
    this.clampCursor();
  }

  private buyPrice(basePrice: number, effectiveFactor: number): number {
    return Math.round(basePrice * effectiveFactor);
  }

  private sellPrice(basePrice: number, effectiveFactor: number): number {
    return Math.round(basePrice * effectiveFactor);
  }

  private buildBuyItems(): MenuItemDef[] {
    if (this.traderStock.length === 0) {
      return [{ label: 'NO STOCK AVAILABLE', disabled: true, action: () => {} }];
    }
    return this.traderStock.flatMap(entry => {
      const commodity = getCommodity(entry.commodityId);
      if (!commodity) return [];
      const effectiveFactor = entry.effectiveFactor ?? 1.0;
      const unitPrice = this.buyPrice(commodity.basePrice, effectiveFactor);
      const canAfford = this.player.credits >= unitPrice;
      return [{
        label: `${commodity.name} (x${entry.qty})`,
        info: `${unitPrice} CR`,
        disabled: !canAfford,
        action: () => {
          const maxAffordable = Math.floor(this.player.credits / unitPrice);
          const initial = Math.min(entry.qty, maxAffordable);
          this.openModal(new ModalInputDialog({
            title: commodity.name.toUpperCase(),
            field: { label: 'Quantity', initialValue: initial, min: 0, max: initial },
            derivedRows: [{ label: 'Total', compute: qty => `${qty * unitPrice} CR` }],
            confirmLabel: 'BUY',
            onConfirm: (qty) => {
              if (qty > 0) {
                this.onBuy(entry.commodityId, qty, unitPrice);
                this.accrueReputation(qty * unitPrice);
              }
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
      const dest = getDestination(this.player.destinationId ?? '')!;
      const system = getSystem(dest.system)!;
      const effectiveFactor = computeEffectiveFactor(entry.commodityId, system);
      const unitPrice = this.sellPrice(commodity.basePrice, effectiveFactor);
      return [{
        label: `${commodity.name} (x${entry.qty})`,
        info: `${unitPrice} CR`,
        action: () => {
          this.openModal(new ModalInputDialog({
            title: commodity.name.toUpperCase(),
            field: { label: 'Quantity', initialValue: entry.qty, min: 0, max: entry.qty },
            derivedRows: [{ label: 'Total', compute: qty => `${qty * unitPrice} CR` }],
            confirmLabel: 'SELL',
            onConfirm: (qty) => {
              if (qty > 0) this.onSell(entry.commodityId, qty, unitPrice);
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

  private accrueReputation(creditsSpent: number): void {
    if (!this.eligibleFactionId) return;
    const balance = getGameBalance();
    const remaining = balance.reputation.maxRepPerVisit - this.repGainedThisVisit;
    if (remaining <= 0) return;
    const gain = Math.min(remaining, creditsSpent * balance.reputation.repPerCredit);
    if (gain <= 0) return;
    this.repGainedThisVisit += gain;
    this.player.modifyFactionReputation(this.eligibleFactionId, gain, balance);
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

    if (this.eligibleFactionId) {
      const balance = getGameBalance();
      const points = this.player.getFactionReputation(this.eligibleFactionId);
      const level = getReputationLevel(points, balance);
      const label = getReputationLabel(level);
      // Row CONTENT_TOP+2 is blank (between underline and tab bar) — safe to use
      const standingText = `STANDING: ${label}`;
      writeText(buffer, CONTENT_TOP + 2, 2, standingText, 'bright-black', 'black');
    }

    const h = buffer.length;
    const footerRow = contentBottom(h, true) - 2;
    writeText(buffer, footerRow, 2, `HOLD: ${this.player.cargoWeightKg}/${this.player.cargoCapacity}KG`, 'bright-black', 'black');
  }
}
