import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText, writeCentered } from '../../shared/buffer-utils';
import { getSystem, getDestination, getRoutesFrom } from '../world/world-data';

type TabKey = 'DESTINATIONS' | 'JUMPS';

interface DestItem {
  id: string;
  label: string;
  disabled: boolean;
}

interface JumpItem {
  id: string;
  label: string;
}

const TITLE_ROW = 3;
const INFO_ROW = 5;
const TAB_ROW = 7;
const ITEM_ROW_START = 9;
const ITEM_COL = 2;

const DEST_TAB_TEXT = '[DESTINATIONS]';
const JUMP_TAB_TEXT = '[JUMPS]';
// Offset from the centered tab group start
const JUMP_TAB_OFFSET = DEST_TAB_TEXT.length + 2;

export class TravelMenuScene implements Scene {
  private readonly context: GameContext;
  private readonly systemName: string;
  private readonly destinations: DestItem[];
  private readonly jumps: JumpItem[];
  private readonly destTabCol: number;
  private readonly jumpTabCol: number;
  private activeTab: TabKey = 'DESTINATIONS';
  private cursorIdx = 0;
  private activated = false;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    systemId: string,
    currentDestinationId: string | null,
    onDestinationSelected: (destinationId: string) => void,
    onJumpSelected: (targetSystemId: string) => void,
    onBack: (() => void) | null,
  ) {
    this.context = context;
    const system = getSystem(systemId)!;
    this.systemName = system.name.toUpperCase();

    this.destinations = system.destinations.map((destId) => ({
      id: destId,
      label: getDestination(destId)!.name.toUpperCase(),
      disabled: destId === currentDestinationId,
    }));

    this.jumps = getRoutesFrom(systemId).map((route) => {
      const targetId = route.from === systemId ? route.to : route.from;
      const targetSystem = getSystem(targetId)!;
      const stability = route.stability.toUpperCase();
      return {
        id: targetId,
        label: `${targetSystem.name.toUpperCase()}  ${route.distance}LY  [${stability}]`.slice(0, 36),
      };
    });

    // Tab column positions — computed once assuming w=40; render re-derives these
    // but we also need them for tap hit-testing before the first render.
    this.destTabCol = Math.floor((40 - JUMP_TAB_OFFSET - JUMP_TAB_TEXT.length) / 2);
    this.jumpTabCol = this.destTabCol + JUMP_TAB_OFFSET;

    inputHandler.onAction((action) => {
      if (this.activated) return;
      const itemCount = this.activeTab === 'DESTINATIONS' ? this.destinations.length : this.jumps.length;
      if (action === 'UP') {
        this.cursorIdx = (this.cursorIdx - 1 + itemCount) % itemCount;
      } else if (action === 'DOWN') {
        this.cursorIdx = (this.cursorIdx + 1) % itemCount;
      } else if (action === 'LEFT') {
        this.activeTab = 'DESTINATIONS';
        this.cursorIdx = 0;
      } else if (action === 'RIGHT') {
        this.activeTab = 'JUMPS';
        this.cursorIdx = 0;
      } else if (action === 'SELECT') {
        this.handleSelect(onDestinationSelected, onJumpSelected);
      } else if (action === 'BACK' && onBack) {
        this.activated = true;
        onBack();
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((col, row) => {
        if (this.activated) return;

        if (row === TAB_ROW) {
          if (col >= this.destTabCol && col < this.destTabCol + DEST_TAB_TEXT.length) {
            this.activeTab = 'DESTINATIONS';
            this.cursorIdx = 0;
            return;
          }
          if (col >= this.jumpTabCol && col < this.jumpTabCol + JUMP_TAB_TEXT.length) {
            this.activeTab = 'JUMPS';
            this.cursorIdx = 0;
            return;
          }
        }

        const itemCount = this.activeTab === 'DESTINATIONS' ? this.destinations.length : this.jumps.length;
        for (let i = 0; i < itemCount; i++) {
          if (row === ITEM_ROW_START + i) {
            this.cursorIdx = i;
            this.handleSelect(onDestinationSelected, onJumpSelected);
            return;
          }
        }
      });
    }
  }

  private handleSelect(
    onDestinationSelected: (id: string) => void,
    onJumpSelected: (id: string) => void,
  ): void {
    if (this.activeTab === 'DESTINATIONS') {
      const item = this.destinations[this.cursorIdx];
      if (item && !item.disabled) {
        this.activated = true;
        onDestinationSelected(item.id);
      }
    } else {
      const item = this.jumps[this.cursorIdx];
      if (item) {
        this.activated = true;
        onJumpSelected(item.id);
      }
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

    writeCentered(buffer, TITLE_ROW, 'TRAVEL', 'cyan', 'black');
    writeCentered(buffer, TITLE_ROW + 1, '======', 'cyan', 'black');
    writeText(buffer, INFO_ROW, ITEM_COL, this.systemName, 'bright-black', 'black');

    const tabGroupWidth = DEST_TAB_TEXT.length + 2 + JUMP_TAB_TEXT.length;
    const destTabCol = Math.floor((w - tabGroupWidth) / 2);
    const jumpTabCol = destTabCol + DEST_TAB_TEXT.length + 2;

    const destFg: Color = this.activeTab === 'DESTINATIONS' ? 'bright-green' : 'white';
    const jumpFg: Color = this.activeTab === 'JUMPS' ? 'bright-green' : 'white';
    writeText(buffer, TAB_ROW, destTabCol, DEST_TAB_TEXT, destFg, 'black');
    writeText(buffer, TAB_ROW, jumpTabCol, JUMP_TAB_TEXT, jumpFg, 'black');

    if (this.activeTab === 'DESTINATIONS') {
      for (let i = 0; i < this.destinations.length; i++) {
        const row = ITEM_ROW_START + i;
        if (row >= h) continue;
        const item = this.destinations[i];
        const isCursor = i === this.cursorIdx;
        const prefix = isCursor ? '> ' : '  ';
        const fg: Color = item.disabled ? 'bright-black' : isCursor ? 'bright-green' : 'white';
        writeText(buffer, row, ITEM_COL, prefix + item.label, fg, 'black');
      }
    } else {
      for (let i = 0; i < this.jumps.length; i++) {
        const row = ITEM_ROW_START + i;
        if (row >= h) continue;
        const item = this.jumps[i];
        const isCursor = i === this.cursorIdx;
        const prefix = isCursor ? '> ' : '  ';
        const fg: Color = isCursor ? 'bright-green' : 'white';
        writeText(buffer, row, ITEM_COL, prefix + item.label, fg, 'black');
      }
    }

    const footerRow = h - 3;
    const hint = this.context.primaryInput === 'touch'
      ? 'tap tab or item to select'
      : '↑↓ items   ←→ tabs   ENTER select';
    writeCentered(buffer, footerRow, hint, 'bright-black', 'black');
  }
}
