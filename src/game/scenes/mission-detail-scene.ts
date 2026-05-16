import type { InputHandler, GameContext, CharBuffer, Color } from '../../shared/types';
import type { PlayerState } from '../player-state';
import { canAcceptMission } from '../player-state';
import type { MissionSpec } from '../world/types';
import { getDestination, getWorld, getCommodity } from '../world/world-data';
import { writeText, wrapText } from '../../shared/buffer-utils';
import { BaseMenuScene } from './base-menu-scene';
import { CONTENT_TOP } from '../ui/screen-chrome';

const TYPE_ICONS: Record<MissionSpec['type'], string> = {
  delivery: '[D]',
  supply:   '[S]',
};

export class MissionDetailScene extends BaseMenuScene {
  private readonly spec: MissionSpec;
  private readonly onAccept: (giveItemNow: boolean) => void;
  private readonly onBack: () => void;
  private readonly canAccept: { ok: boolean; reason?: string };

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    spec: MissionSpec,
    onAccept: (giveItemNow: boolean) => void,
    onBack: () => void,
  ) {
    const canAccept = canAcceptMission(player, spec);
    const navOptions = canAccept.ok
      ? [{ id: 'accept', label: 'ACCEPT' }, { id: 'back', label: 'BACK' }]
      : [{ id: 'back', label: 'BACK' }];

    super('MISSION BOARD', [], navOptions, inputHandler, context, player);

    this.spec = spec;
    this.onAccept = onAccept;
    this.onBack = onBack;
    this.canAccept = canAccept;
  }

  private computeGiveItemNow(): boolean {
    if (this.spec.type !== 'delivery') return false;
    return this.spec.pickupDestinationId === this.spec.issuingDestinationId;
  }

  protected override handleNavAction(action: string): void {
    if (this.activated) return;
    if (action === 'NAV_1') {
      if (this.canAccept.ok) {
        this.activated = true;
        this.onAccept(this.computeGiveItemNow());
      } else {
        this.activated = true;
        this.onBack();
      }
    } else if (action === 'NAV_2' || action === 'BACK') {
      this.activated = true;
      this.onBack();
    }
  }

  protected override handleNavTap(navId: string): void {
    if (this.activated) return;
    if (navId === 'accept' && this.canAccept.ok) {
      this.activated = true;
      this.onAccept(this.computeGiveItemNow());
    } else if (navId === 'back') {
      this.activated = true;
      this.onBack();
    }
  }

  override render(buffer: CharBuffer): void {
    super.render(buffer);
    this.renderDetail(buffer);
  }

  private renderDetail(buffer: CharBuffer): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 40;
    const maxWidth = w - 4;
    const footerRow = h - 1;
    let row = CONTENT_TOP + 3; // itemStartRow with no infoLines

    // Type icon + title
    const titleLine = `${TYPE_ICONS[this.spec.type]} ${this.spec.title}`.slice(0, maxWidth);
    writeText(buffer, row, 2, titleLine, 'bright-yellow', 'black');
    row++;

    // Giver name + optional faction
    const world = getWorld();
    const faction = this.spec.giverFactionId
      ? world.factions.find(f => f.id === this.spec.giverFactionId)
      : null;
    const giverSuffix = faction ? ` [${faction.name}]` : '';
    const giverLine = `    ${this.spec.giverName}${giverSuffix}`;
    writeText(buffer, row, 2, giverLine.slice(0, maxWidth), 'bright-black', 'black');
    row++;
    row++; // blank

    if (this.spec.type === 'delivery') {
      const pickup = getDestination(this.spec.pickupDestinationId);
      const deliver = getDestination(this.spec.deliveryDestinationId);
      writeText(buffer, row, 2,
        `Pickup:  ${pickup?.name ?? this.spec.pickupDestinationId}`.slice(0, maxWidth),
        'white', 'black');
      row++;
      writeText(buffer, row, 2,
        `Deliver: ${deliver?.name ?? this.spec.deliveryDestinationId}`.slice(0, maxWidth),
        'white', 'black');
      row++;

      const free = this.player.cargoCapacity - this.player.cargoWeightKg;
      const needed = this.spec.itemWeightKg;
      const sufficient = free >= needed;
      const weightLine = `Weight:  ${needed} kg  (Free: ${free} kg)`;
      writeText(buffer, row, 2, weightLine, 'white', 'black');
      const markFg: Color = sufficient ? 'bright-green' : 'red';
      const markCol = 2 + weightLine.length + 1;
      if (markCol < w) writeText(buffer, row, markCol, sufficient ? '✓' : '✗', markFg, 'black');
      row++;
    } else {
      const deliver = getDestination(this.spec.deliveryDestinationId);
      writeText(buffer, row, 2,
        `Deliver to: ${deliver?.name ?? this.spec.deliveryDestinationId}`.slice(0, maxWidth),
        'white', 'black');
      row++;
      for (const req of this.spec.requirements) {
        if (row >= footerRow - 1) break;
        const commodity = getCommodity(req.commodityId);
        writeText(buffer, row, 2,
          `  ${req.qty}x ${commodity?.name ?? req.commodityId}`.slice(0, maxWidth),
          'white', 'black');
        row++;
      }
    }

    row++; // blank

    // Description (word-wrapped)
    const descLines = wrapText(this.spec.description, maxWidth);
    for (const line of descLines) {
      if (row >= footerRow - 2) break;
      writeText(buffer, row, 2, line, 'white', 'black');
      row++;
    }

    row++; // blank
    if (row >= footerRow - 1) return;

    // Reward
    writeText(buffer, row, 2, `REWARD: ${this.spec.reward} CR`, 'bright-green', 'black');
    row++;

    // Reason when cannot accept
    if (!this.canAccept.ok && this.canAccept.reason) {
      row++;
      if (row < footerRow) {
        writeText(buffer, row, 2, `[!] ${this.canAccept.reason}`, 'red', 'black');
      }
    }
  }
}
