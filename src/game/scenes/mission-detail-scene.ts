import type { InputHandler, GameContext, CharBuffer, Color } from '../../shared/types';
import type { PlayerState } from '../player-state';
import { canAcceptMission } from '../player-state';
import type { MissionSpec } from '../world/types';
import { getDestination, getWorld, getCommodity, getGameBalance } from '../world/world-data';
import { writeText, wrapText } from '../../shared/buffer-utils';
import { BaseMenuScene, type MenuItemDef } from './base-menu-scene';
import { computeReputationDeltas, getMissionTierLabel } from '../reputation-utils';

const TYPE_ICONS: Record<MissionSpec['type'], string> = {
  delivery: '[D]',
  supply:   '[S]',
};

// Number of blank infoLines used to push ACCEPT/BACK items below the detail content.
const DETAIL_SPACER_LINES = 16;

export class MissionDetailScene extends BaseMenuScene {
  private readonly spec: MissionSpec;
  private readonly onBack: () => void;
  private readonly onHub: () => void;
  private readonly onUndock: () => void;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    spec: MissionSpec,
    onAccept: (giveItemNow: boolean) => void,
    onBack: () => void,
    onHub: () => void,
    onUndock: () => void,
  ) {
    const canAccept = canAcceptMission(player, spec);
    const giveItemNow = spec.type === 'delivery' && spec.pickupDestinationId === spec.issuingDestinationId;

    const acceptItem: MenuItemDef = canAccept.ok
      ? { label: 'ACCEPT MISSION', action: () => onAccept(giveItemNow) }
      : { label: 'ACCEPT MISSION', disabled: true, details: canAccept.reason ? [canAccept.reason] : [], action: () => {} };

    const backItem: MenuItemDef = { label: 'BACK', action: () => onBack() };

    const spacer = Array.from({ length: DETAIL_SPACER_LINES }, () => '');

    super(
      'MISSION BOARD',
      [acceptItem, backItem],
      [{ id: 'undock', label: 'UNDOCK' }, { id: 'hub', label: 'HUB' }],
      inputHandler,
      context,
      player,
      spacer,
    );

    this.spec = spec;
    this.onBack = onBack;
    this.onHub = onHub;
    this.onUndock = onUndock;
  }

  private destColor(destinationId: string): Color {
    if (destinationId === this.player.destinationId) return 'bright-green';
    const dest = getDestination(destinationId);
    if (dest && dest.system === this.player.systemId) return 'bright-yellow';
    return 'white';
  }

  private writeDestRow(buffer: CharBuffer, row: number, label: string, name: string, destId: string, maxWidth: number): void {
    writeText(buffer, row, 2, label, 'white', 'black');
    writeText(buffer, row, 2 + label.length, name.slice(0, maxWidth - label.length), this.destColor(destId), 'black');
  }

  protected override handleNavAction(action: string): void {
    if (this.activated) return;
    if (action === 'NAV_1') {
      this.activated = true;
      this.onUndock();
    } else if (action === 'NAV_2') {
      this.activated = true;
      this.onHub();
    } else if (action === 'BACK') {
      this.activated = true;
      this.onBack();
    }
  }

  protected override handleNavTap(navId: string): void {
    if (this.activated) return;
    if (navId === 'undock') {
      this.activated = true;
      this.onUndock();
    } else if (navId === 'hub') {
      this.activated = true;
      this.onHub();
    }
  }

  protected override renderContent(buffer: CharBuffer, top: number, bottom: number): void {
    super.renderContent(buffer, top, bottom);
    this.renderDetail(buffer, top - DETAIL_SPACER_LINES);
  }

  private renderDetail(buffer: CharBuffer, startRow: number): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 40;
    const maxWidth = w - 4;
    // Stop writing before the items area begins
    const contentLimit = this.lastContentTop - 1;
    let row = startRow;

    const write = (r: number, text: string, fg: Color) => {
      if (r <= contentLimit) writeText(buffer, r, 2, text.slice(0, maxWidth), fg, 'black');
    };

    // Type icon + title
    write(row, `${TYPE_ICONS[this.spec.type]} ${this.spec.title}`, 'bright-yellow');
    row++;

    // Giver name + optional faction
    const world = getWorld();
    const faction = this.spec.giverFactionId
      ? world.factions.find(f => f.id === this.spec.giverFactionId)
      : null;
    const giverSuffix = faction ? ` [${faction.name}]` : '';
    write(row, `    ${this.spec.giverName}${giverSuffix}`, 'bright-black');
    row++;
    row++; // blank

    if (this.spec.type === 'delivery') {
      const pickup = getDestination(this.spec.pickupDestinationId);
      const deliver = getDestination(this.spec.deliveryDestinationId);
      if (row <= contentLimit) {
        this.writeDestRow(buffer, row, 'Pickup:  ', pickup?.name ?? this.spec.pickupDestinationId,
          this.spec.pickupDestinationId, maxWidth);
      }
      row++;
      if (row <= contentLimit) {
        this.writeDestRow(buffer, row, 'Deliver: ', deliver?.name ?? this.spec.deliveryDestinationId,
          this.spec.deliveryDestinationId, maxWidth);
      }
      row++;

      if (row <= contentLimit) {
        const free = this.player.cargoCapacity - this.player.cargoWeightKg;
        const needed = this.spec.itemWeightKg;
        const sufficient = free >= needed;
        const weightLine = `Weight:  ${needed} kg  (Free: ${free} kg)`;
        writeText(buffer, row, 2, weightLine, 'white', 'black');
        const markFg: Color = sufficient ? 'bright-green' : 'red';
        const markCol = 2 + weightLine.length + 1;
        if (markCol < w) writeText(buffer, row, markCol, sufficient ? '✓' : '✗', markFg, 'black');
      }
      row++;
    } else {
      const deliver = getDestination(this.spec.deliveryDestinationId);
      if (row <= contentLimit) {
        this.writeDestRow(buffer, row, 'Deliver to: ', deliver?.name ?? this.spec.deliveryDestinationId,
          this.spec.deliveryDestinationId, maxWidth);
      }
      row++;
      for (const req of this.spec.requirements) {
        if (row > contentLimit) break;
        const commodity = getCommodity(req.commodityId);
        write(row, `  ${req.qty}x ${commodity?.name ?? req.commodityId}`, 'white');
        row++;
      }
    }

    row++; // blank

    // Description (word-wrapped)
    const descLines = wrapText(this.spec.description, maxWidth);
    for (const line of descLines) {
      if (row > contentLimit) break;
      write(row, line, 'white');
      row++;
    }

    row++; // blank
    if (row > contentLimit) return;

    write(row, `REWARD: ${this.spec.reward} CR`, 'bright-green');
    row++;

    if (this.spec.giverFactionId) {
      row++; // blank
      if (row > contentLimit) return;

      const world = getWorld();
      const givingFaction = world.factions.find(f => f.id === this.spec.giverFactionId);
      if (givingFaction) {
        const balance = getGameBalance();
        const missionReward = this.spec.reward;
        let repDelta: number;
        if (missionReward >= balance.reputation.missionTierLargeReward) {
          repDelta = balance.reputation.missionDeltaLarge;
        } else if (missionReward >= balance.reputation.missionTierMediumReward) {
          repDelta = balance.reputation.missionDeltaMedium;
        } else {
          repDelta = balance.reputation.missionDeltaSmall;
        }

        const deltas = computeReputationDeltas(givingFaction, repDelta, world.factions);
        const impactFactions: Array<{ id: string; name: string; delta: number }> = [];
        for (const [factionId, delta] of deltas) {
          const f = world.factions.find(fac => fac.id === factionId);
          if (f) impactFactions.push({ id: factionId, name: f.name, delta });
        }
        impactFactions.sort((a, b) => {
          if (a.delta !== b.delta) return b.delta - a.delta;
          return a.name.localeCompare(b.name);
        });

        if (row <= contentLimit) {
          write(row, 'REPUTATION IMPACT', 'bright-cyan');
          row++;
        }
        for (const impact of impactFactions) {
          if (row > contentLimit) break;
          const label = getMissionTierLabel(impact.delta, true);
          const labelColor: Color = impact.delta > 0 ? 'bright-green' : 'red';
          const maxNameWidth = maxWidth - label.length - 2;
          const name = impact.name.slice(0, maxNameWidth);
          const padding = ' '.repeat(Math.max(0, maxWidth - name.length - label.length));
          write(row, `  ${name}${padding}${label}`, labelColor);
          row++;
        }

        if (row <= contentLimit) {
          row++; // blank line before accept/back items
        }
      }
    }
  }
}
