import type { InputHandler, GameContext } from '../../shared/types';
import type { PlayerState } from '../PlayerState';
import { getDestination } from '../world/world-data';
import { BaseMenuScene, type MenuItemDef, type TabDef } from './base-menu-scene';

interface TraderItem {
  name: string;
  price: number;
  qty?: number;
}

interface Trader {
  name: string;
  buyList: TraderItem[];
  sellList: TraderItem[];
}

const TRADERS: Trader[] = [
  {
    name: 'MERCHANT KESS',
    buyList: [
      { name: 'Iron Ore', price: 120 },
      { name: 'Copper Wire', price: 85 },
      { name: 'Refined Fuel', price: 250 },
      { name: 'Circuit Board', price: 340 },
      { name: 'Titanium Sheet', price: 180 },
      { name: 'Rare Alloy', price: 420 },
    ],
    sellList: [
      { name: 'Water Supplies', price: 45,  qty: 5 },
      { name: 'Oxygen Tank',    price: 60,  qty: 3 },
      { name: 'Nutrient Paste', price: 35,  qty: 8 },
      { name: 'Medical Kit',    price: 200, qty: 2 },
      { name: 'Armor Plating',  price: 280, qty: 1 },
      { name: 'Nav Module',     price: 500, qty: 1 },
    ],
  },
];

export class TraderScene extends BaseMenuScene {
  private readonly onHub: () => void;
  private readonly onUndock: () => void;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    destinationId: string,
    onHub: () => void,
    onUndock: () => void,
  ) {
    const dest = getDestination(destinationId)!;
    const traderName = dest.npcs.trader?.toUpperCase() ?? 'TRADER';
    const trader = TRADERS[0];

    const toMenuItem = (item: TraderItem, label: string): MenuItemDef => ({
      label,
      info: `${item.price} CR`,
      action: () => console.log(`[Trader] Selected ${item.name}`),
    });

    const buyItems: MenuItemDef[] = trader.buyList.map(item =>
      toMenuItem(item, item.name)
    );
    const sellItems: MenuItemDef[] = trader.sellList.map(item =>
      toMenuItem(item, item.qty !== undefined ? `${item.name} (x${item.qty})` : item.name)
    );

    const tabs: TabDef[] = [
      { label: 'BUY', items: buyItems },
      { label: 'SELL', items: sellItems },
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

    this.onHub = onHub;
    this.onUndock = onUndock;
  }

  protected override activateCurrent(): void {
    if (this.items.length === 0) return;
    const item = this.items[this.cursorIdx];
    if (item.disabled) return;
    item.action();
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
}
