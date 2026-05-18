import type { InputHandler, GameContext } from '../../shared/types';
import type { PlayerState } from '../player-state';
import { getSystem, getDestination, getRoutesFrom, getDrive, getGameBalance } from '../world/world-data';
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
    onGalaxyMap: () => void,
    onMenu: () => void = () => {},
    onEmergency?: () => void,
  ) {
    const system = getSystem(player.systemId)!;
    const drive = getDrive(player.driveId)!;
    const hopCost = player.getInSystemHopCost();
    const insufficientFuel = player.fuelL < hopCost;

    const destItems: MenuItemDef[] = [
      ...system.destinations.map(destId => ({
        label: `${getDestination(destId)!.name.toUpperCase()}  [${hopCost}L]`,
        disabled: destId === player.destinationId || insufficientFuel,
        action: () => onDestinationSelected(destId),
      })),
      {
        label: `FLY INTO SPACE  [${hopCost}L]`,
        disabled: player.destinationId === null || insufficientFuel,
        action: onFlyIntoSpace,
      },
    ];

    if (insufficientFuel && onEmergency) {
      destItems.push({
        label: '[EMERGENCY]',
        disabled: false,
        action: onEmergency,
      });
    }

    const routeItems: MenuItemDef[] = getRoutesFrom(player.systemId).map(route => {
      const targetId = route.from === player.systemId ? route.to : route.from;
      const targetSystem = getSystem(targetId)!;
      const fuelNeeded = Math.ceil(getGameBalance().fuel.consumptionPerLy * route.distance * drive.fuelEfficiency);
      return {
        label: `${targetSystem.name.toUpperCase()}  ${route.distance}LY  [${fuelNeeded}L]`,
        disabled: fuelNeeded > player.fuelL,
        action: () => onJumpSelected(targetId),
      };
    });

    const jumpItems: MenuItemDef[] = [
      ...routeItems,
      { label: 'GALAXY MAP...', action: onGalaxyMap },
    ];

    const tabs: TabDef[] = [
      { label: 'DESTINATIONS', items: destItems },
      { label: 'JUMPS', items: jumpItems },
    ];

    super('TRAVEL', [], [{ id: 'ship', label: 'SHIP' }], inputHandler, context, player, [], tabs, onMenu);

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
