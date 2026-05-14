import type { InputHandler, GameContext, CharBuffer } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import { getSystem, getRoutesFrom } from '../world/world-data';
import { BaseMenuScene, type MenuItemDef } from './BaseMenuScene';

export class JumpMenuScene extends BaseMenuScene {
  private readonly systemName: string;
  private backActivated = false;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    systemId: string,
    onJumpSelected: (targetSystemId: string) => void,
    onBack: () => void,
  ) {
    const system = getSystem(systemId)!;
    const routes = getRoutesFrom(systemId);

    const items: MenuItemDef[] = routes.map((route) => {
      const targetId = route.from === systemId ? route.to : route.from;
      const targetSystem = getSystem(targetId)!;
      const stability = route.stability.toUpperCase();
      const label = `${targetSystem.name.toUpperCase()}  ${route.distance}LY  [${stability}]`.slice(0, 36);
      return { label, action: () => onJumpSelected(targetId) };
    });

    super('JUMP', items, inputHandler, context);

    this.systemName = system.name.toUpperCase();

    inputHandler.onAction((action) => {
      if (this.backActivated) return;
      if (action === 'BACK') {
        this.backActivated = true;
        onBack();
      }
    });
  }

  override render(buffer: CharBuffer): void {
    super.render(buffer);
    writeText(buffer, 5, 2, `CURRENT SYSTEM: ${this.systemName}`, 'bright-black', 'black');
    writeText(buffer, 6, 2, 'SELECT DESTINATION:', 'bright-black', 'black');
  }
}
