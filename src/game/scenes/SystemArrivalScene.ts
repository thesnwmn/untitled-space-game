import type { InputHandler, GameContext, CharBuffer } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import { getSystem, getDestination } from '../world/world-data';
import { BaseMenuScene, type MenuItemDef } from './BaseMenuScene';

export class SystemArrivalScene extends BaseMenuScene {
  private readonly securityLevel: string;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    systemId: string,
    onDock: (destinationId: string) => void,
  ) {
    const system = getSystem(systemId)!;

    const items: MenuItemDef[] = system.destinations.map((destId) => {
      const dest = getDestination(destId)!;
      return { label: dest.name.toUpperCase(), action: () => onDock(destId) };
    });

    super(system.name.toUpperCase(), items, inputHandler, context);

    this.securityLevel = system.security.toUpperCase();
  }

  override render(buffer: CharBuffer): void {
    super.render(buffer);
    writeText(buffer, 5, 2, `SECURITY: ${this.securityLevel}`, 'bright-black', 'black');
    writeText(buffer, 6, 2, 'SELECT DOCKING DESTINATION:', 'bright-black', 'black');
  }
}
