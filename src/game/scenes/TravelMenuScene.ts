import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import { getSystem, getDestination, getRoutesFrom } from '../world/world-data';
import { ScreenChrome, CONTENT_TOP } from '../ui/ScreenChrome';

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

const TITLE_ROW = CONTENT_TOP;
const TAB_ROW = CONTENT_TOP + 3;
const ITEM_ROW_START = CONTENT_TOP + 5;
const ITEM_COL = 2;

const DEST_TAB_TEXT = 'DESTINATIONS';
const JUMP_TAB_TEXT = 'JUMPS';

// Sentinel id for the "fly into space" pseudo-destination
const FLY_INTO_SPACE_ID = '__space__';

export class TravelMenuScene implements Scene {
  private readonly context: GameContext;
  private readonly systemName: string;
  private readonly destinations: DestItem[];
  private readonly jumps: JumpItem[];
  private readonly chrome: ScreenChrome;
  private activeTab: TabKey = 'DESTINATIONS';
  private cursorIdx = 0;
  private activated = false;

  // Tab column ranges (computed each render, used for tap)
  private destTabStart = 0;
  private destTabEnd = 0;
  private jumpTabStart = 0;
  private jumpTabEnd = 0;

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    systemId: string,
    currentDestinationId: string | null,
    onDestinationSelected: (destinationId: string) => void,
    onJumpSelected: (targetSystemId: string) => void,
    onFlyIntoSpace: () => void,
    onShip: () => void,
  ) {
    this.context = context;
    const system = getSystem(systemId)!;
    this.systemName = system.name.toUpperCase();
    this.chrome = new ScreenChrome(context);

    this.destinations = [
      ...system.destinations.map((destId) => ({
        id: destId,
        label: getDestination(destId)!.name.toUpperCase(),
        disabled: destId === currentDestinationId,
      })),
      {
        id: FLY_INTO_SPACE_ID,
        label: 'FLY INTO SPACE',
        disabled: currentDestinationId === null,
      },
    ];

    this.jumps = getRoutesFrom(systemId).map((route) => {
      const targetId = route.from === systemId ? route.to : route.from;
      const targetSystem = getSystem(targetId)!;
      const stability = route.stability.toUpperCase();
      return {
        id: targetId,
        label: `${targetSystem.name.toUpperCase()}  ${route.distance}LY  [${stability}]`.slice(0, 36),
      };
    });

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
        this.handleSelect(onDestinationSelected, onFlyIntoSpace, onJumpSelected);
      } else if (action === 'BACK') {
        this.activated = true;
        onShip();
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((col, row) => {
        if (this.activated) return;

        const navHit = this.chrome.hitTestNav(col, row);
        if (navHit !== null) return; // no nav buttons in travel scene

        if (row === TAB_ROW) {
          if (col >= this.destTabStart && col < this.destTabEnd) {
            this.activeTab = 'DESTINATIONS';
            this.cursorIdx = 0;
            return;
          }
          if (col >= this.jumpTabStart && col < this.jumpTabEnd) {
            this.activeTab = 'JUMPS';
            this.cursorIdx = 0;
            return;
          }
        }

        const itemCount = this.activeTab === 'DESTINATIONS' ? this.destinations.length : this.jumps.length;
        for (let i = 0; i < itemCount; i++) {
          if (row === ITEM_ROW_START + i) {
            this.cursorIdx = i;
            this.handleSelect(onDestinationSelected, onFlyIntoSpace, onJumpSelected);
            return;
          }
        }
      });
    }
  }

  private handleSelect(
    onDestinationSelected: (id: string) => void,
    onFlyIntoSpace: () => void,
    onJumpSelected: (id: string) => void,
  ): void {
    if (this.activeTab === 'DESTINATIONS') {
      const item = this.destinations[this.cursorIdx];
      if (item && !item.disabled) {
        this.activated = true;
        if (item.id === FLY_INTO_SPACE_ID) {
          onFlyIntoSpace();
        } else {
          onDestinationSelected(item.id);
        }
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

    this.chrome.render(buffer, {
      showHeader: true,
      showFooter: true,
      navOptions: [],
    });

    // Title + underline
    writeText(buffer, TITLE_ROW, 2, 'TRAVEL', 'white', 'black');
    writeText(buffer, TITLE_ROW + 1, 2, '``````', 'bright-black', 'black');

    // Tab bar: [ DESTINATIONS | JUMPS ] centered
    const destTabContent = ` ${DEST_TAB_TEXT} `;
    const jumpTabContent = ` ${JUMP_TAB_TEXT} `;
    const tabBarWidth = 1 + destTabContent.length + 1 + jumpTabContent.length + 1;
    const tabStartCol = Math.floor((w - tabBarWidth) / 2);

    buffer[TAB_ROW][tabStartCol] = { char: '[', fg: 'bright-black', bg: 'black' };
    let tc = tabStartCol + 1;

    this.destTabStart = tc;
    const destFg: Color = this.activeTab === 'DESTINATIONS' ? 'black' : 'white';
    const destBg: Color = this.activeTab === 'DESTINATIONS' ? 'green' : 'black';
    for (const ch of destTabContent) {
      buffer[TAB_ROW][tc] = { char: ch, fg: destFg, bg: destBg };
      tc++;
    }
    this.destTabEnd = tc;

    buffer[TAB_ROW][tc] = { char: '|', fg: 'bright-black', bg: 'black' };
    tc++;

    this.jumpTabStart = tc;
    const jumpFg: Color = this.activeTab === 'JUMPS' ? 'black' : 'white';
    const jumpBg: Color = this.activeTab === 'JUMPS' ? 'green' : 'black';
    for (const ch of jumpTabContent) {
      buffer[TAB_ROW][tc] = { char: ch, fg: jumpFg, bg: jumpBg };
      tc++;
    }
    this.jumpTabEnd = tc;

    buffer[TAB_ROW][tc] = { char: ']', fg: 'bright-black', bg: 'black' };

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
  }
}
