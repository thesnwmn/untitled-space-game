import type { InputHandler, GameContext } from '../../shared/types';
import type { PlayerState } from '../player-state';
import { BaseMenuScene, type MenuItemDef } from './base-menu-scene';

export interface GlobalMenuEntry {
  label: string;
  action: () => void;
}

export class GlobalMenuScene extends BaseMenuScene {
  private readonly onClose: () => void;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    entries: GlobalMenuEntry[],
    onClose: () => void,
  ) {
    const items: MenuItemDef[] = entries.length === 0
      ? [{ label: 'NO OPTIONS AVAILABLE', disabled: true, action: () => {} }]
      : entries.map(e => ({ label: e.label, action: e.action }));

    super(
      'MENU',
      items,
      [{ id: 'game', label: 'GAME' }],
      inputHandler,
      context,
      player,
    );

    this.onClose = onClose;
    this.onMenuCallback = onClose;
  }

  protected override handleNavAction(action: string): void {
    if ((action === 'BACK' || action === 'NAV_1') && !this.activated) {
      this.activated = true;
      this.onClose();
    }
  }

  protected override handleNavTap(navId: string): void {
    if (navId === 'game' && !this.activated) {
      this.activated = true;
      this.onClose();
    }
  }
}
