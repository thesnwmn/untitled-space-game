import type { InputHandler, GameContext, Color } from '../../shared/types';
import type { PlayerState } from '../player-state';
import type { Faction } from '../world/types';
import { getGameBalance, getWorld } from '../world/world-data';
import { isReputationEligible, getReputationLevel, getReputationLabel } from '../reputation-utils';
import { BaseMenuScene, type MenuItemDef } from './base-menu-scene';

const BAR_WIDTH = 20;
const HALF_BAR = BAR_WIDTH / 2;
const FILLED = '█';
const EMPTY = '░';

function buildRepBar(rep: number, pointsMin: number, pointsMax: number): number {
  if (rep <= pointsMin) return 0;
  if (rep >= pointsMax) return BAR_WIDTH;
  if (rep <= 0) return Math.round((rep - pointsMin) / -pointsMin * HALF_BAR);
  return HALF_BAR + Math.round(rep / pointsMax * HALF_BAR);
}

const LEVEL_COLORS: Record<number, Color> = {
  [-2]: 'red',
  [-1]: 'bright-red',
  [0]: 'white',
  [1]: 'bright-green',
  [2]: 'bright-green',
  [3]: 'bright-cyan',
};

export class ReputationScene extends BaseMenuScene {
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
      'REPUTATION',
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
    const balance = getGameBalance();
    const world = getWorld();
    const eligibleFactions = world.factions.filter(f => isReputationEligible(f));

    eligibleFactions.sort((a, b) => {
      if (a.size !== b.size) {
        if (a.size === 'large') return -1;
        if (b.size === 'large') return 1;
      }
      return a.name.localeCompare(b.name);
    });

    return eligibleFactions.map(faction => {
      const rep = this.player.getFactionReputation(faction.id);
      const level = getReputationLevel(rep, balance);
      const label = getReputationLabel(level);
      const levelColor = (LEVEL_COLORS[level] ?? 'white') as Color;
      const fill = buildRepBar(rep, balance.reputation.pointsMin, balance.reputation.pointsMax);
      const empty = BAR_WIDTH - fill;

      return {
        label: faction.name,
        info: label,
        infoFg: levelColor,
        detailsColored: [[
          { text: FILLED.repeat(fill), fg: levelColor },
          { text: EMPTY.repeat(empty), fg: 'bright-black' as Color },
          { text: `  ${rep}`, fg: levelColor },
        ]],
        action: () => {},
      };
    });
  }

  protected override activateCurrent(): void {
    // Display-only, no action
  }

  protected override handleNavAction(action: string): void {
    if (action === 'BACK' && !this.activated) {
      this.activated = true;
      this.onBack();
    } else if (action === 'NAV_1' && !this.activated) {
      this.activated = true;
      this.onGame();
    } else {
      super.handleNavAction(action);
    }
  }

  protected override handleNavTap(navId: string): void {
    if (navId === 'menu' && !this.activated) {
      this.activated = true;
      this.onBack();
    } else if (navId === 'game' && !this.activated) {
      this.activated = true;
      this.onGame();
    }
  }
}
