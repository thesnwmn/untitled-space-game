import type { InputHandler, GameContext, Color } from '../../shared/types';
import type { PlayerState } from '../player-state';
import type { ActiveMission } from '../world/types';
import type { MissionSpec } from '../world/types';
import { getMissionStatus } from '../player-state';
import { getDestination, getGameBalance, getWorld } from '../world/world-data';
import { BaseMenuScene, type MenuItemDef } from './base-menu-scene';
import { ModalConfirmDialog } from '../ui/modal-confirm-dialog';
import { computeReputationDeltas, getMissionRewardString } from '../reputation-utils';

const TYPE_ICONS: Record<MissionSpec['type'], string> = {
  delivery: '[D] ',
  supply:   '[S] ',
};

const STATUS_LABELS: Record<string, string> = {
  'pending-pickup':  'PENDING PICKUP',
  'needs-supplies':  'NEEDS SUPPLIES',
  'in-transit':      'IN TRANSIT',
  'ready-to-deliver': 'READY TO DELIVER',
};

const STATUS_COLORS: Record<string, Color> = {
  'pending-pickup':  'yellow',
  'needs-supplies':  'yellow',
  'in-transit':      'bright-black',
  'ready-to-deliver': 'bright-green',
};

export class MissionLogScene extends BaseMenuScene {
  private readonly onBack: () => void;
  private readonly onGame: () => void;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    onBack: () => void,
    onGame: () => void,
  ) {
    super(
      'MISSIONS',
      [],
      [{ id: 'game', label: 'GAME' }, { id: 'menu', label: 'MENU' }],
      inputHandler,
      context,
      player,
      [],
      null,
      onGame,
    );

    this.onBack = onBack;
    this.onGame = onGame;
  }

  protected override get items(): MenuItemDef[] {
    const missions = this.player.activeMissions;
    if (missions.length === 0) {
      return [{ label: 'NO ACTIVE MISSIONS', disabled: true, action: () => {} }];
    }
    const sortedMissions = this.sortMissions(missions);
    return sortedMissions.map(m => this.buildMenuItem(m));
  }

  protected override activateCurrent(): void {
    const items = this.items;
    if (items.length === 0 || this.cursorIdx < 0 || this.cursorIdx >= items.length) return;
    const item = items[this.cursorIdx];
    if (item.disabled) return;
    item.action();
  }

  private getStatusPriority(status: string): number {
    if (status === 'ready-to-deliver') return 0;
    if (status === 'needs-supplies' || status === 'pending-pickup') return 1;
    if (status === 'in-transit') return 2;
    return 3;
  }

  private sortMissions(missions: typeof this.player.activeMissions): typeof this.player.activeMissions {
    return [...missions].sort((a, b) => {
      const destA = getDestination(a.deliveryDestinationId)?.name ?? a.deliveryDestinationId;
      const destB = getDestination(b.deliveryDestinationId)?.name ?? b.deliveryDestinationId;
      const destCmp = destA.localeCompare(destB);
      if (destCmp !== 0) return destCmp;

      const statusA = getMissionStatus(a, this.player);
      const statusB = getMissionStatus(b, this.player);
      const statusCmp = this.getStatusPriority(statusA) - this.getStatusPriority(statusB);
      if (statusCmp !== 0) return statusCmp;

      const typeOrder = { delivery: 0, supply: 1 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }

  private buildMenuItem(m: import('../world/types').ActiveMission): MenuItemDef {
    const status = getMissionStatus(m, this.player);
    const dest = getDestination(m.deliveryDestinationId);
    const destName = dest?.name ?? m.deliveryDestinationId;
    const statusLabel = STATUS_LABELS[status] ?? status;
    const statusColor = STATUS_COLORS[status] ?? 'white';

    const details = [`${statusLabel} → ${destName}`];
    const detailsColored = m.type === 'supply' ? this.buildSupplyDetails(m) : [];

    return {
      label: m.title,
      icon: TYPE_ICONS[m.type],
      iconFg: 'bright-yellow' as Color,
      info: `${m.reward} CR`,
      infoFg: 'bright-green' as Color,
      details,
      detailsFg: statusColor,
      detailsColored,
      action: () => this.openMissionModal(m),
    };
  }

  private buildSupplyDetails(m: import('../world/types').ActiveMission): Array<{ left: Array<{ text: string; fg: Color }>; }> {
    if (m.type !== 'supply') return [];

    return m.requirements.map(req => {
      const commodity = getWorld().commodities.find(c => c.id === req.commodityId);
      const commodityName = commodity?.name ?? req.commodityId;
      const cargoEntry = this.player.cargoHold.find(c => c.commodityId === req.commodityId);
      const qty = cargoEntry?.qty ?? 0;
      const isSufficient = qty >= req.qty;

      return {
        left: [
          { text: `${req.qty}x ${commodityName} `, fg: 'white' },
          { text: `(have: ${qty})`, fg: isSufficient ? 'bright-green' : 'bright-black' },
        ],
      };
    });
  }

  private openMissionModal(mission: import('../world/types').ActiveMission): void {
    let body = mission.description;

    if (mission.giverFactionId) {
      const world = getWorld();
      const givingFaction = world.factions.find(f => f.id === mission.giverFactionId);
      if (givingFaction) {
        const balance = getGameBalance();
        const missionReward = mission.reward;
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

        body += '\n\nREPUTATION IMPACT:\n';
        for (const impact of impactFactions) {
          const label = getMissionRewardString(impact.delta);
          body += `  ${impact.name.padEnd(20)} ${label}\n`;
        }
      }
    }

    this.openModal(new ModalConfirmDialog({
      title: mission.title,
      body,
      confirmLabel: 'OKAY',
      cancelLabel: 'CANCEL MISSION',
      onConfirm: () => this.closeModal(),
      onCancel: () => {
        this.player.cancelMission(mission.id);
        this.closeModal();
        const remaining = this.player.activeMissions.length;
        if (remaining === 0) {
          this.cursorIdx = -1;
        } else if (this.cursorIdx >= remaining) {
          this.cursorIdx = remaining - 1;
        }
      },
    }));
  }

  protected override handleNavAction(action: string): void {
    if (action === 'NAV_1' && !this.activated) {
      this.activated = true;
      this.onGame();
    } else if ((action === 'BACK' || action === 'NAV_2') && !this.activated) {
      this.activated = true;
      this.onBack();
    }
  }

  protected override handleNavTap(navId: string): void {
    if (navId === 'game' && !this.activated) {
      this.activated = true;
      this.onGame();
    } else if (navId === 'menu' && !this.activated) {
      this.activated = true;
      this.onBack();
    }
  }
}
