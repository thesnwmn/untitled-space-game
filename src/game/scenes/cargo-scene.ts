import type { InputHandler, GameContext, CharBuffer, Scene } from '../../shared/types';
import type { PlayerState } from '../player-state';
import { getCommodity } from '../world/world-data';
import { writeText, writeCentered } from '../../shared/buffer-utils';

const TITLE = 'CARGO HOLD';

export class CargoScene implements Scene {
  private readonly player: PlayerState;
  private activated = false;

  constructor(
    inputHandler: InputHandler,
    _context: GameContext,
    player: PlayerState,
    onBack: () => void,
  ) {
    this.player = player;

    inputHandler.onAction((action) => {
      if (this.activated) return;
      if (action === 'BACK' || action === 'CARGO') {
        this.activated = true;
        onBack();
      }
    });
  }

  update(_dt: number): void {}

  render(buffer: CharBuffer): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;

    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++)
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };

    // Title centred at row 1
    writeCentered(buffer, 1, TITLE, 'bright-white', 'black');
    // Underline
    const underlineCol = Math.max(0, Math.floor((w - TITLE.length) / 2));
    writeText(buffer, 2, underlineCol, "'".repeat(TITLE.length), 'bright-black', 'black');

    const hold = this.player.cargoHold;
    const capacity = this.player.cargoCapacity;
    const weight = this.player.cargoWeightKg;

    if (hold.length === 0) {
      writeCentered(buffer, Math.floor(h / 2), 'CARGO HOLD EMPTY', 'bright-black', 'black');
    } else {
      let row = 4;

      for (const entry of hold) {
        if (row >= h - 3) break;
        const commodity = getCommodity(entry.commodityId);
        if (!commodity) continue;
        const entryWeight = entry.qty * commodity.weightKg;
        const suffix = `  x${entry.qty}  ${commodity.basePrice}CR  ${entryWeight}KG`;
        const maxNameWidth = Math.max(6, w - 4 - suffix.length);
        const rawName = commodity.name;
        const name = rawName.length > maxNameWidth ? rawName.slice(0, maxNameWidth) : rawName;
        const line = `${name}${suffix}`;
        writeText(buffer, row, 2, line, 'white', 'black');
        row++;
      }

      // Separator
      const sepRow = h - 4;
      if (sepRow > 3) {
        writeText(buffer, sepRow, 2, '-'.repeat(w - 4), 'bright-black', 'black');
      }
    }

    // Total weight / capacity line
    const totalRow = h - 3;
    const totalText = `TOTAL: ${weight}/${capacity}KG`;
    writeText(buffer, totalRow, 2, totalText, 'bright-black', 'black');

    // Hint at bottom
    writeText(buffer, h - 1, 2, '[ESC] BACK', 'bright-black', 'black');
  }
}
