import type { InputHandler, GameContext } from '../../shared/types';
import type { PlayerState } from '../PlayerState';
import { getDestination } from '../world/world-data';
import { BaseMenuScene, type MenuItemDef } from './base-menu-scene';

interface Mission {
  id: string;
  type: 'rescue' | 'delivery' | 'combat' | 'salvage';
  title: string;
  reward: number;
}

const MISSIONS: Mission[] = [
  { id: 'M001', type: 'rescue',   title: 'Find the Lost Crew',       reward: 500 },
  { id: 'M002', type: 'delivery', title: 'Deliver Fuel Core',         reward: 300 },
  { id: 'M003', type: 'combat',   title: 'Clear Pirate Outpost',      reward: 750 },
  { id: 'M004', type: 'salvage',  title: 'Salvage Station Debris',    reward: 400 },
  { id: 'M005', type: 'rescue',   title: 'Rescue Stranded Vessel',    reward: 600 },
  { id: 'M006', type: 'delivery', title: 'Transport Supplies',        reward: 250 },
  { id: 'M007', type: 'combat',   title: 'Eliminate Smugglers',       reward: 800 },
];

const TYPE_ICONS: Record<Mission['type'], string> = {
  rescue:   '[R] ',
  delivery: '[D] ',
  combat:   '[C] ',
  salvage:  '[S] ',
};

export class MissionBoardScene extends BaseMenuScene {
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
    getDestination(destinationId)!;

    const items: MenuItemDef[] = MISSIONS.map(m => ({
      label: m.title,
      icon: TYPE_ICONS[m.type],
      iconFg: 'bright-yellow',
      info: `${m.reward} CR`,
      infoFg: 'bright-green',
      action: () => console.log(`[MissionBoard] Selected: ${m.title}`),
    }));

    super(
      'MISSION BOARD',
      items,
      [{ id: 'undock', label: 'UNDOCK' }, { id: 'hub', label: 'HUB' }],
      inputHandler,
      context,
      player,
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
