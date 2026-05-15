import type { InputHandler, GameContext } from '../../shared/types';
import type { PlayerState } from '../PlayerState';
import { getSystem, getDestination, getRoutesFrom, getDrive } from '../world/world-data';
import { FUEL_PER_LY } from '../constants';
import { BaseMenuScene, type MenuItemDef, type TabDef } from './base-menu-scene';

export class TravelMenuScene extends BaseMenuScene {
  private readonly onShip: () => void;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    onDestinationSelected: (destinationId: string) => void,
    onJumpSelected: (targetSystemId: string) => void,
    onFlyIntoSpace: () => void,
    onShip: () => void,
  ) {
    const system = getSystem(player.systemId)!;
    const drive = getDrive(player.driveId)!;

    const destItems: MenuItemDef[] = [
      ...system.destinations.map(destId => ({
        label: getDestination(destId)!.name.toUpperCase(),
        disabled: destId === player.destinationId,
        action: () => onDestinationSelected(destId),
      })),
      {
        label: 'FLY INTO SPACE',
        disabled: player.destinationId === null,
        action: onFlyIntoSpace,
      },
    ];

    const jumpItems: MenuItemDef[] = getRoutesFrom(player.systemId).map(route => {
      const targetId = route.from === player.systemId ? route.to : route.from;
      const targetSystem = getSystem(targetId)!;
      const stability = route.stability.toUpperCase();
      const fuelNeeded = Math.ceil(FUEL_PER_LY * route.distance * drive.fuelEfficiency);
      return {
        label: `${targetSystem.name.toUpperCase()}  ${route.distance}LY  [${stability}]`.slice(0, 36),
        disabled: fuelNeeded > player.fuelL,
        action: () => onJumpSelected(targetId),
      };
    });

    const tabs: TabDef[] = [
      { label: 'DESTINATIONS', items: destItems },
      { label: 'JUMPS', items: jumpItems },
    ];

    super('TRAVEL', [], [{ id: 'ship', label: 'SHIP' }], inputHandler, context, player, [], tabs);

    this.onShip = onShip;
  }

  protected override handleNavAction(action: string): void {
    if ((action === 'BACK' || action === 'NAV_1') && !this.activated) {
      this.activated = true;
      this.onShip();
    }
  }

  protected override handleNavTap(navId: string): void {
    if (navId === 'ship' && !this.activated) {
      this.activated = true;
      this.onShip();
    }
  }
}
