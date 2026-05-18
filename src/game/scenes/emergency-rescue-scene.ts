import type { InputHandler, CharBuffer, GameContext, Color, GameAction } from '../../shared/types';
import { writeText, drawSeparator } from '../../shared/buffer-utils';
import { CONTENT_TOP, contentBottom } from '../ui/screen-chrome';
import type { NavOption } from '../ui/screen-chrome';
import type { PlayerState } from '../player-state';
import { getSystem, getDestination, getGameBalance } from '../world/world-data';
import { BaseScene } from './base-scene';

interface RescueOption {
  label: string;
  fee: number;
  action: () => void;
}

export class EmergencyRescueScene extends BaseScene {
  private readonly options: RescueOption[];
  private readonly fuelDestId: string | undefined;
  private readonly onBack: () => void;
  private cursorIdx = 0;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    onTow: (destinationId: string) => void,
    onDrop: () => void,
    onBack: () => void,
  ) {
    super(inputHandler, context, player, { navOptions: [], title: 'EMERGENCY RESCUE' });

    this.onBack = onBack;
    const system = getSystem(player.systemId)!;
    const balance = getGameBalance();

    this.options = [];
    this.fuelDestId = system.destinations.find(
      destId => getDestination(destId)?.amenities.fuel === true,
    );

    if (this.fuelDestId) {
      const fuelDest = getDestination(this.fuelDestId)!;
      this.options.push({
        label: `TOW TO ${fuelDest.name.toUpperCase()}`,
        fee: balance.emergencyRescue.towFee,
        action: () => onTow(this.fuelDestId!),
      });
    }

    this.options.push({
      label: 'EMERGENCY FUEL DROP',
      fee: balance.emergencyRescue.fuelDropFee,
      action: onDrop,
    });

    this.options.push({
      label: 'BACK',
      fee: 0,
      action: onBack,
    });
  }

  protected override preHandleAction(action: GameAction): boolean {
    if (action === 'BACK') {
      this.activated = true;
      this.onBack();
      return true;
    }
    return false;
  }

  protected override handleAction(action: GameAction): void {
    if (action === 'UP') {
      this.cursorIdx = (this.cursorIdx - 1 + this.options.length) % this.options.length;
    } else if (action === 'DOWN') {
      this.cursorIdx = (this.cursorIdx + 1) % this.options.length;
    } else if (action === 'SELECT') {
      if (this.cursorIdx >= 0 && this.cursorIdx < this.options.length) {
        this.activated = true;
        this.options[this.cursorIdx].action();
      }
    }
  }

  protected override handleTap(_col: number, _row: number): void {
    // Simplistic: just treat any tap as select current
    if (this.cursorIdx >= 0 && this.cursorIdx < this.options.length) {
      this.activated = true;
      this.options[this.cursorIdx].action();
    }
  }

  public override render(buffer: CharBuffer): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;

    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };
      }
    }

    const config = this.buildChromeConfig();
    this.chrome.render(buffer, config);

    const base = CONTENT_TOP;
    const bottom = contentBottom(h, true);

    // Title and underline
    const title = 'EMERGENCY RESCUE';
    writeText(buffer, base, 2, title, 'bright-white', 'black');
    writeText(buffer, base + 1, 2, "'".repeat(title.length), 'bright-black', 'black');

    // Show current location
    const system = getSystem(this.player.systemId)!;
    let status: string;
    if (this.player.destinationId === null) {
      status = `STRANDED IN SPACE NEAR ${system.name.toUpperCase()}`;
    } else {
      const dest = getDestination(this.player.destinationId)!;
      status = `STRANDED AT ${dest.name.toUpperCase()}`;
    }

    writeText(buffer, base + 3, 2, status, 'bright-yellow', 'black');

    // Separator
    const separatorRow = base + 5;
    drawSeparator(buffer, separatorRow, w);

    // Render options
    let optionRow = separatorRow + 1;
    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      const isCursor = i === this.cursorIdx;
      const cursorChar = isCursor ? '>' : ' ';
      const cursorColor: Color = isCursor ? 'bright-green' : 'white';

      if (optionRow < h) {
        writeText(buffer, optionRow, 2, cursorChar, cursorColor, 'black');

        if (option.fee === 0) {
          // BACK option - no fee shown
          writeText(buffer, optionRow, 3, option.label, cursorColor, 'black');
        } else {
          // Rescue option - show fee and projected balance
          writeText(buffer, optionRow, 3, option.label, cursorColor, 'black');

          const projectedBalance = this.player.credits - option.fee;
          const balanceStr = `${option.fee} CR  (BALANCE: ${projectedBalance >= 0 ? '' : '-'}${Math.abs(projectedBalance)} CR)`;
          const balanceColor: Color = projectedBalance < 0 ? 'bright-red' : cursorColor;

          if (optionRow + 1 < h) {
            writeText(buffer, optionRow + 1, 4, balanceStr, balanceColor, 'black');
          }
          optionRow++;
        }
      }
      optionRow++;
    }
  }
}
