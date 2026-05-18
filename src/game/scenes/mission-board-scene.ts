import type { InputHandler, GameContext, Color } from '../../shared/types';
import type { PlayerState } from '../player-state';
import type { MissionSpec } from '../world/types';
import { getDestination, getWorld } from '../world/world-data';
import { BaseMenuScene, type MenuItemDef } from './base-menu-scene';

const TYPE_ICONS: Record<MissionSpec['type'], string> = {
  delivery: '[D] ',
  supply:   '[S] ',
};

export class MissionBoardScene extends BaseMenuScene {
  private readonly onHub: () => void;
  private readonly onUndock: () => void;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    destinationId: string,
    missions: MissionSpec[],
    onMissionSelected: (spec: MissionSpec) => void,
    onHub: () => void,
    onUndock: () => void,
    onMenu: () => void,
  ) {
    getDestination(destinationId)!;
    let items: MenuItemDef[];

    if (missions.length === 0) {
      items = [{ label: 'NO MISSIONS AVAILABLE', disabled: true, action: () => {} }];
    } else {
      const sortedMissions = MissionBoardScene.sortMissions(missions);
      items = sortedMissions.map(m => MissionBoardScene.buildMenuItem(m, player, onMissionSelected));
    }

    super(
      'MISSION BOARD',
      items,
      [{ id: 'undock', label: 'UNDOCK' }, { id: 'hub', label: 'HUB' }],
      inputHandler,
      context,
      player,
      [],
      null,
      onMenu,
    );

    this.onHub = onHub;
    this.onUndock = onUndock;
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

  private static sortMissions(missions: MissionSpec[]): MissionSpec[] {
    return [...missions].sort((a, b) => {
      const destA = getDestination(a.deliveryDestinationId)?.name ?? a.deliveryDestinationId;
      const destB = getDestination(b.deliveryDestinationId)?.name ?? b.deliveryDestinationId;
      const destCmp = destA.localeCompare(destB);
      if (destCmp !== 0) return destCmp;
      const typeOrder = { delivery: 0, supply: 1 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }

  private static destColor(destinationId: string, player: PlayerState): Color {
    if (destinationId === player.destinationId) return 'bright-green';
    const dest = getDestination(destinationId);
    if (dest && dest.system === player.systemId) return 'bright-yellow';
    return 'white';
  }

  private static buildMenuItem(m: MissionSpec, player: PlayerState, onMissionSelected: (spec: MissionSpec) => void): MenuItemDef {
    const dest = getDestination(m.deliveryDestinationId);
    const destName = dest?.name ?? m.deliveryDestinationId;

    const details: string[] = [];
    details.push(`Dest: ${destName}`);

    if (m.giverFactionId) {
      const faction = getWorld().factions.find(f => f.id === m.giverFactionId);
      if (faction) details.push(`For: ${faction.name}`);
    }

    details.push('');  // blank line for spacing after details

    const detailsColored = m.type === 'supply' ? MissionBoardScene.buildSupplyDetails(m, player) : [];

    return {
      label: m.title,
      icon: TYPE_ICONS[m.type],
      iconFg: 'bright-yellow' as const,
      info: `${m.reward} CR`,
      infoFg: 'bright-green' as const,
      details,
      detailsFg: MissionBoardScene.destColor(m.deliveryDestinationId, player),
      detailsColored,
      action: () => onMissionSelected(m),
    };
  }

  private static buildSupplyDetails(m: MissionSpec, player: PlayerState): Array<{ left: Array<{ text: string; fg: Color }>; }> {
    if (m.type !== 'supply') return [];

    return m.requirements.map(req => {
      const commodity = getWorld().commodities.find(c => c.id === req.commodityId);
      const commodityName = commodity?.name ?? req.commodityId;
      const cargoEntry = player.cargoHold.find(c => c.commodityId === req.commodityId);
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
}
