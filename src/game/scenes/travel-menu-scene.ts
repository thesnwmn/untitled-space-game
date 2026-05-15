import type { InputHandler, GameContext } from '../../shared/types';
import { getSystem, getDestination, getRoutesFrom, getDrive } from '../world/world-data';
import { FUEL_PER_LY } from '../constants';
import { BaseMenuScene, type MenuItemDef, type TabDef } from './base-menu-scene';

export class TravelMenuScene extends BaseMenuScene {
  private readonly onShip: () => void;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    systemId: string,
    currentDestinationId: string | null,
    fuelL: number,
    fuelCapacityL: number, // reserved for future display (e.g. fuel % indicator)
    driveId: string,
    onDestinationSelected: (destinationId: string) => void,
    onJumpSelected: (targetSystemId: string) => void,
    onFlyIntoSpace: () => void,
    onShip: () => void,
  ) {
    const system = getSystem(systemId)!;
    const drive = getDrive(driveId)!;

    const destItems: MenuItemDef[] = [
      ...system.destinations.map(destId => ({
        label: getDestination(destId)!.name.toUpperCase(),
        disabled: destId === currentDestinationId,
        action: () => onDestinationSelected(destId),
      })),
      {
        label: 'FLY INTO SPACE',
        disabled: currentDestinationId === null,
        action: onFlyIntoSpace,
      },
    ];

    const jumpItems: MenuItemDef[] = getRoutesFrom(systemId).map(route => {
      const targetId = route.from === systemId ? route.to : route.from;
      const targetSystem = getSystem(targetId)!;
      const stability = route.stability.toUpperCase();
      const fuelNeeded = Math.ceil(FUEL_PER_LY * route.distance * drive.fuelEfficiency);
      return {
        label: `${targetSystem.name.toUpperCase()}  ${route.distance}LY  [${stability}]`.slice(0, 36),
        disabled: fuelNeeded > fuelL,
        action: () => onJumpSelected(targetId),
      };
    });

    const tabs: TabDef[] = [
      { label: 'DESTINATIONS', items: destItems },
      { label: 'JUMPS', items: jumpItems },
    ];

    super('TRAVEL', [], [{ id: 'ship', label: 'SHIP' }], inputHandler, context, [], tabs);

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
