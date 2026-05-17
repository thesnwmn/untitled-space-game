import type { InputHandler, GameContext } from '../../shared/types';
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
    getMissions: () => MissionSpec[],
    onMissionSelected: (spec: MissionSpec) => void,
    onHub: () => void,
    onUndock: () => void,
    onMenu: () => void,
  ) {
    getDestination(destinationId)!;

    const missions = getMissions();
    let items: MenuItemDef[];

    if (missions.length === 0) {
      items = [{ label: 'NO MISSIONS AVAILABLE', disabled: true, action: () => {} }];
    } else {
      items = missions.map(m => {
        let label = m.title;
        if (m.giverFactionId) {
          const faction = getWorld().factions.find(f => f.id === m.giverFactionId);
          if (faction) {
            label = `${m.title} [${faction.name}]`;
          }
        }
        return {
          label,
          icon: TYPE_ICONS[m.type],
          iconFg: 'bright-yellow' as const,
          info: `${m.reward} CR`,
          infoFg: 'bright-green' as const,
          action: () => onMissionSelected(m),
        };
      });
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
}
