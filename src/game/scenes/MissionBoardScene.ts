import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText, writeCentered } from '../../shared/buffer-utils';
import { getDestination } from '../world/world-data';
import { NavBar } from '../ui/NavBar';

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
  rescue:   'R',
  delivery: 'D',
  combat:   'C',
  salvage:  'S',
};

const MISSION_ROW_START = 5;
const MISSION_COL = 1;

export class MissionBoardScene implements Scene {
  private readonly context: GameContext;
  private readonly navBar: NavBar;
  private cursorIdx = 0;
  private activated = false;

  constructor(inputHandler: InputHandler, context: GameContext, destinationId: string, onHub: () => void, onUndock: () => void) {
    const dest = getDestination(destinationId)!;
    this.context = context;
    this.navBar = new NavBar(
      dest.name.toUpperCase(),
      [{ id: 'undock', label: 'UNDOCK' }, { id: 'hub', label: 'HUB' }],
    );

    inputHandler.onAction((action) => {
      if (this.activated) return;
      if (action === 'UP') {
        this.cursorIdx = (this.cursorIdx - 1 + MISSIONS.length) % MISSIONS.length;
      } else if (action === 'DOWN') {
        this.cursorIdx = (this.cursorIdx + 1) % MISSIONS.length;
      } else if (action === 'SELECT') {
        const mission = MISSIONS[this.cursorIdx];
        console.log(`[MissionBoard] Selected: ${mission.title}`);
      } else if (action === 'BACK') {
        this.activated = true;
        onHub();
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((col, row) => {
        if (this.activated) return;
        const navHit = this.navBar.hitTest(col, row);
        if (navHit === 'hub')    { this.activated = true; onHub();    return; }
        if (navHit === 'undock') { this.activated = true; onUndock(); return; }
        for (let i = 0; i < MISSIONS.length; i++) {
          if (row === MISSION_ROW_START + i) {
            this.cursorIdx = i;
            console.log(`[MissionBoard] Selected: ${MISSIONS[i].title}`);
            return;
          }
        }
      });
    }
  }

  update(_dt: number): void {}

  render(buffer: CharBuffer): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;

    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };
      }
    }

    this.navBar.render(buffer);

    writeCentered(buffer, 3, 'MISSION BOARD', 'cyan', 'black');
    writeCentered(buffer, 4, '=============', 'cyan', 'black');

    const contentWidth = w - 2;
    for (let i = 0; i < MISSIONS.length; i++) {
      const row = MISSION_ROW_START + i;
      if (row >= h) continue;
      const mission = MISSIONS[i];
      const isCursor = i === this.cursorIdx;
      const cursor = isCursor ? '>' : ' ';
      const icon = TYPE_ICONS[mission.type];
      const rewardStr = `${mission.reward} CR`;
      const prefixWidth = 1 + 4; // cursor(1) + '[X] '(4)
      const dotLen = Math.max(1, contentWidth - prefixWidth - mission.title.length - 2 - rewardStr.length);

      const titleFg: Color = isCursor ? 'bright-green' : 'white';
      writeText(buffer, row, MISSION_COL, cursor, isCursor ? 'bright-green' : 'white', 'black');
      writeText(buffer, row, MISSION_COL + 1, `[${icon}] `, 'bright-yellow', 'black');
      writeText(buffer, row, MISSION_COL + 5, `${mission.title} ${'.'.repeat(dotLen)} `, titleFg, 'black');
      writeText(buffer, row, MISSION_COL + 5 + mission.title.length + 1 + dotLen + 1, rewardStr, 'bright-green', 'black');
    }

    const footerRow = h - 3;
    const hint = this.context.primaryInput === 'touch'
      ? 'TAP to select   2-finger exit'
      : '↑↓ navigate   ESC return';
    writeCentered(buffer, footerRow, hint, 'bright-black', 'black');
  }
}
