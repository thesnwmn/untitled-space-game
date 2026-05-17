import type { InputHandler, GameContext, CharBuffer } from '../../shared/types';
import type { PlayerState } from '../player-state';
import { getCommodity } from '../world/world-data';
import { writeText } from '../../shared/buffer-utils';
import { BaseScene } from './base-scene';

export class CargoScene extends BaseScene {
  private readonly onBack: () => void;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    onBack: () => void,
    onMenu: () => void,
  ) {
    super(inputHandler, context, player, {
      title: 'CARGO HOLD',
      tabs: ['COMMODITIES', 'MISSION GOODS'],
      navOptions: [{ id: 'back', label: 'BACK' }],
      onMenu,
    });
    this.onBack = onBack;
  }

  protected override handleNavTap(navId: string): void {
    if (navId === 'back') {
      this.activated = true;
      this.onBack();
    }
  }

  protected override handleAction(action: string): void {
    if (action === 'BACK' || action === 'CARGO') {
      this.activated = true;
      this.onBack();
    }
  }

  protected override renderContent(buffer: CharBuffer, top: number, bottom: number): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;

    const hold = this.player.cargoHold;
    const missionItems = this.player.missionItems;
    const capacity = this.player.cargoCapacity;
    const weight = this.player.cargoWeightKg;

    const totalRow = bottom - 1;

    if (this.activeTabIdx === 0) {
      this.renderCommoditiesTab(buffer, top, totalRow, w, hold);
    } else {
      this.renderMissionGoodsTab(buffer, top, totalRow, w, missionItems);
    }

    // Total weight/capacity always visible at bottom - 1
    const totalText = `TOTAL: ${weight}/${capacity}KG`;
    writeText(buffer, totalRow, 2, totalText, 'bright-black', 'black');
  }

  private renderCommoditiesTab(
    buffer: CharBuffer,
    top: number,
    totalRow: number,
    w: number,
    hold: PlayerState['cargoHold'],
  ): void {
    if (hold.length === 0) {
      writeText(buffer, top, 2, 'NO COMMODITIES', 'bright-black', 'black');
      return;
    }

    let row = top;
    for (const entry of hold) {
      if (row >= totalRow - 1) break;
      const commodity = getCommodity(entry.commodityId);
      if (!commodity) continue;
      const entryWeight = entry.qty * commodity.weightKg;
      const suffix = `  x${entry.qty}  ${commodity.basePrice}CR  ${entryWeight}KG`;
      const maxNameWidth = Math.max(6, w - 4 - suffix.length);
      const rawName = commodity.name;
      const name = rawName.length > maxNameWidth ? rawName.slice(0, maxNameWidth) : rawName;
      writeText(buffer, row, 2, `${name}${suffix}`, 'white', 'black');
      row++;
    }
  }

  private renderMissionGoodsTab(
    buffer: CharBuffer,
    top: number,
    totalRow: number,
    w: number,
    missionItems: PlayerState['missionItems'],
  ): void {
    if (missionItems.length === 0) {
      writeText(buffer, top, 2, 'NO MISSION GOODS', 'bright-black', 'black');
      return;
    }

    let row = top;
    for (const item of missionItems) {
      if (row >= totalRow - 1) break;
      const suffix = `  ${item.weightKg}KG`;
      const maxNameWidth = Math.max(6, w - 4 - suffix.length);
      const name = item.itemName.length > maxNameWidth
        ? item.itemName.slice(0, maxNameWidth)
        : item.itemName;
      writeText(buffer, row, 2, `${name}${suffix}`, 'white', 'black');
      row++;
    }
  }
}
