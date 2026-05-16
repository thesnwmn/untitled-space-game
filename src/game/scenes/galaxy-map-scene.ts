import type { InputHandler, GameContext, CharBuffer, Color, Scene } from '../../shared/types';
import { writeText } from '../../shared/buffer-utils';
import { ScreenChrome, CONTENT_TOP } from '../ui/screen-chrome';
import type { NavOption } from '../ui/screen-chrome';
import type { PlayerState } from '../player-state';
import type { StarSystem } from '../world/types';
import { getPublicSystems, getRoutesFrom, getRoute, getDrive } from '../world/world-data';
import { FUEL_PER_LY } from '../constants';
import { findRoute } from '../utils/route-finder';

export interface GalaxyMapConfig {
  canJump: boolean;
}

// ── Layout constants (for MAP tab) ───────────────────────────────────────────
const TAB_ROW        = CONTENT_TOP;       // 3
const CHART_TOP_ROW  = CONTENT_TOP + 2;   // 5
const CHART_MID_ROW  = CONTENT_TOP + 6;   // 9
const CHART_BOT_ROW  = CONTENT_TOP + 10;  // 13
const SEP1_ROW       = CONTENT_TOP + 11;  // 14
const LIST_TOP_ROW   = CONTENT_TOP + 12;  // 15
const SEP2_ROW       = CONTENT_TOP + 20;  // 23
const INFO_ROW       = CONTENT_TOP + 21;  // 24
const LIST_HEIGHT    = SEP2_ROW - LIST_TOP_ROW; // 8

// Chart column layout (content cols 2–37, w=40)
//   [LEFT SY  ]─[CENTER SY  ]─[RIGHT SY  ]
//    2      11 12 13       24 25 26      35
const LEFT_BOX_COL    = 2;
const LEFT_BOX_LEN    = 10;
const LEFT_DASH_COL   = 12;
const CENTER_BOX_COL  = 13;
const CENTER_BOX_LEN  = 12;
const RIGHT_DASH_COL  = 25;
const RIGHT_BOX_COL   = 26;
const RIGHT_BOX_LEN   = 10;
const VERT_COL        = 18; // vertical connector column (inside center box range)

function padEnd(s: string, len: number): string {
  if (s.length >= len) return s.slice(0, len);
  return s + ' '.repeat(len - s.length);
}

function nameBox(name: string, boxLen: number): string {
  return '[' + padEnd(name.toUpperCase(), boxLen - 2) + ']';
}

function fuelCost(distance: number, fuelEfficiency: number): number {
  return Math.ceil(FUEL_PER_LY * distance * fuelEfficiency);
}

export class GalaxyMapScene implements Scene {
  private readonly chrome: ScreenChrome;
  private readonly player: PlayerState;
  private readonly canJump: boolean;
  private readonly onJump: (systemId: string) => void;
  private readonly onBack: () => void;

  private activeTab: 'map' | 'route' = 'map';
  private mapBrowsingSystemId: string;
  private routeDestIdx = 0;
  private searchText = '';
  private activated = false;

  private readonly publicSystems: StarSystem[];
  private readonly otherSystems: StarSystem[]; // all public except player's current

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    config: GalaxyMapConfig,
    onJump: (systemId: string) => void,
    onBack: () => void,
  ) {
    this.chrome = new ScreenChrome(context, player);
    this.player = player;
    this.canJump = config.canJump;
    this.onJump = onJump;
    this.onBack = onBack;

    this.publicSystems = getPublicSystems()
      .sort((a, b) => a.distanceFromSol - b.distanceFromSol);
    this.otherSystems = this.publicSystems.filter(s => s.id !== player.systemId);

    this.mapBrowsingSystemId = player.systemId;

    if (inputHandler.onCharInput) {
      inputHandler.onCharInput((char) => {
        if (this.activated) return;
        if (this.activeTab !== 'map') return;
        const code = char.charCodeAt(0);
        if (char === '\b' || char === '\x7f') {
          this.searchText = this.searchText.slice(0, -1);
        } else if (code >= 32 && code < 127) {
          this.searchText += char.toUpperCase();
          // Snap cursor to first match if current browse target no longer in results
          const filtered = this.getFilteredSystems();
          if (!filtered.find(s => s.id === this.mapBrowsingSystemId)) {
            this.mapBrowsingSystemId = filtered[0]?.id ?? this.mapBrowsingSystemId;
          }
        }
      });
    }

    inputHandler.onAction((action) => {
      if (this.activated) return;

      if (action === 'BACK') {
        if (this.searchText.length > 0) {
          this.searchText = '';
          return;
        }
        this.activated = true;
        this.onBack();
        return;
      }

      if (action === 'LEFT') {
        this.activeTab = 'map';
        this.searchText = '';
        return;
      }
      if (action === 'RIGHT') {
        this.activeTab = 'route';
        this.searchText = '';
        return;
      }

      if (this.activeTab === 'map') {
        this.handleMapAction(action);
      } else {
        this.handleRouteAction(action);
      }
    });

    if (inputHandler.onTap) {
      inputHandler.onTap((col, row) => {
        if (this.activated) return;
        const navId = this.chrome.hitTestNav(col, row);
        if (navId === 'back') {
          this.searchText = '';
          this.activated = true;
          this.onBack();
          return;
        }
        if (row === TAB_ROW) {
          if (col >= 3 && col <= 7) { this.activeTab = 'map'; this.searchText = ''; }
          else if (col >= 9 && col <= 16) { this.activeTab = 'route'; this.searchText = ''; }
          return;
        }
        if (this.activeTab === 'map' && row >= LIST_TOP_ROW && row < SEP2_ROW) {
          const filtered = this.getFilteredSystems();
          const curIdx = filtered.findIndex(s => s.id === this.mapBrowsingSystemId);
          const idx = Math.max(0, curIdx >= 0 ? curIdx : 0);
          const scrollOffset = Math.max(0, Math.min(idx, filtered.length - LIST_HEIGHT));
          const tapIdx = scrollOffset + (row - LIST_TOP_ROW);
          if (tapIdx >= 0 && tapIdx < filtered.length) {
            this.mapBrowsingSystemId = filtered[tapIdx].id;
          }
        }
        if (this.activeTab === 'route' && row >= CONTENT_TOP + 4 && row <= CONTENT_TOP + 10) {
          const tapIdx = row - (CONTENT_TOP + 4);
          if (tapIdx >= 0 && tapIdx < this.otherSystems.length) {
            this.routeDestIdx = tapIdx;
          }
        }
      });
    }
  }

  private handleMapAction(action: string): void {
    const filtered = this.getFilteredSystems();
    const curIdx = filtered.findIndex(s => s.id === this.mapBrowsingSystemId);
    const idx = curIdx >= 0 ? curIdx : 0;

    if (action === 'UP') {
      const next = filtered[Math.max(0, idx - 1)];
      if (next) this.mapBrowsingSystemId = next.id;
    } else if (action === 'DOWN') {
      const next = filtered[Math.min(filtered.length - 1, idx + 1)];
      if (next) this.mapBrowsingSystemId = next.id;
    } else if (action === 'SELECT' || action === 'NAV_1') {
      const sys = filtered[idx];
      if (sys && this.canJump && this.isDirectNeighbor(sys.id) && sys.id !== this.player.systemId && this.hasFuel(sys.id)) {
        this.activated = true;
        this.onJump(sys.id);
      }
    }
  }

  private handleRouteAction(action: string): void {
    if (action === 'UP') {
      this.routeDestIdx = Math.max(0, this.routeDestIdx - 1);
    } else if (action === 'DOWN') {
      this.routeDestIdx = Math.min(this.otherSystems.length - 1, this.routeDestIdx + 1);
    } else if ((action === 'SELECT' || action === 'NAV_1') && this.canJump) {
      const route = this.computeRoute();
      if (route && route.length >= 2 && this.hasFuel(route[1])) {
        this.activated = true;
        this.onJump(route[1]);
      }
    }
  }

  private getFilteredSystems(): StarSystem[] {
    if (this.searchText.length === 0) return this.publicSystems;
    return this.publicSystems.filter(s =>
      s.name.toUpperCase().includes(this.searchText)
    );
  }

  private isDirectNeighbor(systemId: string): boolean {
    return getRoutesFrom(this.player.systemId).some(r => {
      const other = r.from === this.player.systemId ? r.to : r.from;
      return other === systemId;
    });
  }

  private hasFuel(systemId: string): boolean {
    const route = getRoute(this.player.systemId, systemId);
    if (!route) return false;
    const drive = getDrive(this.player.driveId);
    if (!drive) return false;
    return fuelCost(route.distance, drive.fuelEfficiency) <= this.player.fuelL;
  }

  private computeRoute(): string[] | null {
    const dest = this.otherSystems[this.routeDestIdx];
    if (!dest) return null;
    return findRoute(this.player.systemId, dest.id);
  }

  update(_dt: number): void {}

  render(buffer: CharBuffer): void {
    const h = buffer.length;
    const w = h > 0 ? buffer[0].length : 0;

    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++)
        buffer[r][c] = { char: ' ', fg: 'black', bg: 'black' };

    const navOptions: NavOption[] = [{ id: 'back', label: 'BACK' }];
    this.chrome.render(buffer, { showHeader: true, showFooter: true, navOptions });

    this.renderTabBar(buffer, w);

    if (this.activeTab === 'map') {
      this.renderMapTab(buffer, w);
    } else {
      this.renderRouteTab(buffer, w);
    }
  }

  private renderTabBar(buffer: CharBuffer, w: number): void {
    const row = TAB_ROW;
    let col = 2;
    buffer[row][col++] = { char: '|', fg: 'bright-black', bg: 'black' };
    for (const [label, id] of [['MAP', 'map'], ['ROUTE', 'route']] as Array<[string, 'map' | 'route']>) {
      const isActive = this.activeTab === id;
      const content = ` ${label} `;
      const fg: Color = isActive ? 'black' : 'white';
      const bg: Color = isActive ? 'green' : 'black';
      for (const ch of content) {
        if (col < w) buffer[row][col] = { char: ch, fg, bg };
        col++;
      }
      if (col < w) buffer[row][col] = { char: '|', fg: 'bright-black', bg: 'black' };
      col++;
    }
  }

  // ── MAP tab ─────────────────────────────────────────────────────────────────

  private renderMapTab(buffer: CharBuffer, w: number): void {
    const filtered = this.getFilteredSystems();
    const curIdx = filtered.findIndex(s => s.id === this.mapBrowsingSystemId);
    const idx = curIdx >= 0 ? curIdx : 0;
    const browsed = filtered[idx] ?? this.publicSystems[0];

    if (browsed) {
      this.renderChart(buffer, browsed);
      writeText(buffer, SEP1_ROW, 0, '-'.repeat(w), 'bright-black', 'black');
      this.renderSystemList(buffer, w, filtered, idx);
      writeText(buffer, SEP2_ROW, 0, '-'.repeat(w), 'bright-black', 'black');
      this.renderSystemInfo(buffer, w, browsed);
    }

    if (this.searchText.length > 0) {
      writeText(buffer, INFO_ROW + 3, 2, `/${this.searchText}_`, 'bright-yellow', 'black');
    }
  }

  private renderChart(buffer: CharBuffer, center: StarSystem): void {
    const routes = getRoutesFrom(center.id);
    const neighbors = routes
      .map(r => {
        const otherId = r.from === center.id ? r.to : r.from;
        return this.publicSystems.find(s => s.id === otherId);
      })
      .filter((s): s is StarSystem => s !== undefined)
      .slice(0, 4);

    // Assign positions: left, right, top, bottom (in distance order)
    const positions: Array<'left' | 'right' | 'top' | 'bottom'> = ['left', 'right', 'top', 'bottom'];

    const centerFg: Color = center.id === this.player.systemId ? 'bright-yellow' : 'bright-cyan';
    writeText(buffer, CHART_MID_ROW, CENTER_BOX_COL, nameBox(center.name, CENTER_BOX_LEN), centerFg, 'black');
    if (center.id === this.player.systemId) {
      const indicatorCol = CENTER_BOX_COL + CENTER_BOX_LEN;
      if (indicatorCol < 40) buffer[CHART_MID_ROW][indicatorCol] = { char: '*', fg: 'bright-yellow', bg: 'black' };
    }

    for (let i = 0; i < neighbors.length; i++) {
      const sys = neighbors[i];
      const pos = positions[i];
      const nFg: Color = sys.id === this.player.systemId ? 'bright-yellow' : 'white';

      if (pos === 'left') {
        writeText(buffer, CHART_MID_ROW, LEFT_BOX_COL, nameBox(sys.name, LEFT_BOX_LEN), nFg, 'black');
        buffer[CHART_MID_ROW][LEFT_DASH_COL] = { char: '-', fg: 'bright-black', bg: 'black' };
      } else if (pos === 'right') {
        writeText(buffer, CHART_MID_ROW, RIGHT_BOX_COL, nameBox(sys.name, RIGHT_BOX_LEN), nFg, 'black');
        buffer[CHART_MID_ROW][RIGHT_DASH_COL] = { char: '-', fg: 'bright-black', bg: 'black' };
      } else if (pos === 'top') {
        writeText(buffer, CHART_TOP_ROW, CENTER_BOX_COL, nameBox(sys.name, CENTER_BOX_LEN), nFg, 'black');
        for (let r = CHART_TOP_ROW + 1; r < CHART_MID_ROW; r++) {
          buffer[r][VERT_COL] = { char: '|', fg: 'bright-black', bg: 'black' };
        }
      } else {
        writeText(buffer, CHART_BOT_ROW, CENTER_BOX_COL, nameBox(sys.name, CENTER_BOX_LEN), nFg, 'black');
        for (let r = CHART_MID_ROW + 1; r < CHART_BOT_ROW; r++) {
          buffer[r][VERT_COL] = { char: '|', fg: 'bright-black', bg: 'black' };
        }
      }
    }
  }

  private renderSystemList(buffer: CharBuffer, w: number, filtered: StarSystem[], cursorIdx: number): void {
    const scrollOffset = Math.max(0, Math.min(cursorIdx, filtered.length - LIST_HEIGHT));
    for (let i = 0; i < LIST_HEIGHT; i++) {
      const sysIdx = scrollOffset + i;
      if (sysIdx >= filtered.length) break;
      const sys = filtered[sysIdx];
      const row = LIST_TOP_ROW + i;
      const isCursor = sysIdx === cursorIdx;
      const isPlayer = sys.id === this.player.systemId;
      const nameFg: Color = isPlayer ? 'bright-yellow' : (isCursor ? 'bright-cyan' : 'white');
      const infoStr = isPlayer ? '* HERE' : `${sys.distanceFromSol}LY`;
      const infoFg: Color = isPlayer ? 'bright-yellow' : 'bright-black';
      const prefix = isCursor ? '> ' : '  ';
      const maxName = w - 4 - infoStr.length;
      writeText(buffer, row, 2, prefix + sys.name.toUpperCase().slice(0, maxName - 2), nameFg, 'black');
      writeText(buffer, row, w - 2 - infoStr.length, infoStr, infoFg, 'black');
    }
  }

  private renderSystemInfo(buffer: CharBuffer, w: number, sys: StarSystem): void {
    const line1 = `Zone: ${sys.zone}  Sec: ${sys.security}  Pop: ${sys.population}`;
    writeText(buffer, INFO_ROW, 2, line1.slice(0, w - 4), 'bright-black', 'black');

    const isPlayer = sys.id === this.player.systemId;
    const isDirect = !isPlayer && this.isDirectNeighbor(sys.id);

    let line2 = '';
    let line2Fg: Color = 'bright-black';

    if (isPlayer) {
      line2 = '* Current location';
      line2Fg = 'bright-yellow';
    } else if (isDirect) {
      const route = getRoute(this.player.systemId, sys.id);
      if (route) {
        const drive = getDrive(this.player.driveId);
        const fuel = drive ? fuelCost(route.distance, drive.fuelEfficiency) : 0;
        const ok = fuel <= this.player.fuelL;
        const hint = this.canJump ? (ok ? '[SELECT] jump' : 'Insufficient fuel') : '';
        line2 = `${route.distance}LY  ${route.stability}  ${fuel}L  ${hint}`.trim();
        line2Fg = ok ? 'white' : 'bright-red';
      }
    } else {
      const hops = findRoute(this.player.systemId, sys.id);
      if (hops && hops.length > 1) {
        line2 = `${hops.length - 1} hop${hops.length - 1 > 1 ? 's' : ''} away — use ROUTE tab to plan`;
      } else if (!hops) {
        line2 = 'No route found';
        line2Fg = 'bright-red';
      }
    }
    if (line2) writeText(buffer, INFO_ROW + 1, 2, line2.slice(0, w - 4), line2Fg, 'black');
  }

  // ── ROUTE tab ────────────────────────────────────────────────────────────────

  private renderRouteTab(buffer: CharBuffer, w: number): void {
    const fromRow = CONTENT_TOP + 1;
    const toRow   = CONTENT_TOP + 3;
    const listTop = CONTENT_TOP + 4;
    const listH   = 7;
    const sep1    = listTop + listH;      // row 14
    const resTop  = sep1 + 1;            // row 15
    const sep2    = resTop + 6;          // row 21
    const fuelRow = sep2 + 1;            // row 22

    // FROM
    const fromSys = this.publicSystems.find(s => s.id === this.player.systemId);
    writeText(buffer, fromRow, 2, 'FROM:', 'bright-black', 'black');
    writeText(buffer, fromRow, 8, fromSys?.name.toUpperCase() ?? this.player.systemId.toUpperCase(), 'bright-yellow', 'black');

    // TO heading
    writeText(buffer, toRow, 2, 'TO:', 'bright-black', 'black');

    // Destination list
    const scrollOffset = Math.max(0, Math.min(this.routeDestIdx, this.otherSystems.length - listH));
    for (let i = 0; i < listH; i++) {
      const sysIdx = scrollOffset + i;
      if (sysIdx >= this.otherSystems.length) break;
      const sys = this.otherSystems[sysIdx];
      const row = listTop + i;
      const isCursor = sysIdx === this.routeDestIdx;
      const fg: Color = isCursor ? 'bright-cyan' : 'white';
      const prefix = isCursor ? '> ' : '  ';
      writeText(buffer, row, 2, prefix + sys.name.toUpperCase(), fg, 'black');
    }

    // Separators
    writeText(buffer, sep1, 0, '-'.repeat(w), 'bright-black', 'black');
    writeText(buffer, sep2, 0, '-'.repeat(w), 'bright-black', 'black');

    // Route result
    const route = this.computeRoute();
    const dest = this.otherSystems[this.routeDestIdx];

    if (!dest) return;

    if (!route) {
      writeText(buffer, resTop, 2, 'No route found', 'bright-red', 'black');
      return;
    }

    const hops = route.length - 1;
    writeText(buffer, resTop, 2, `Route: ${hops} hop${hops !== 1 ? 's' : ''}`, 'bright-white', 'black');

    const drive = getDrive(this.player.driveId);
    let totalFuel = 0;
    for (let i = 0; i < hops; i++) {
      const r = getRoute(route[i], route[i + 1]);
      if (!r) continue;
      const fuel = drive ? fuelCost(r.distance, drive.fuelEfficiency) : 0;
      totalFuel += fuel;
      const hopRow = resTop + 1 + i;
      if (hopRow < sep2) {
        const fromSysName = (this.publicSystems.find(s => s.id === route[i])?.name ?? route[i]).toUpperCase().slice(0, 9);
        const toSysName   = (this.publicSystems.find(s => s.id === route[i + 1])?.name ?? route[i + 1]).toUpperCase().slice(0, 9);
        const hopStr = `${fromSysName} -> ${toSysName}  ${r.distance}LY  ${r.stability}`;
        writeText(buffer, hopRow, 4, hopStr.slice(0, w - 6), 'white', 'black');
      }
    }

    const firstHopFuel = (() => {
      if (!drive || route.length < 2) return 0;
      const r = getRoute(route[0], route[1]);
      return r ? fuelCost(r.distance, drive.fuelEfficiency) : 0;
    })();
    const feasible = firstHopFuel <= this.player.fuelL;

    if (fuelRow < buffer.length - 1) {
      const jumpHint = this.canJump ? (feasible ? '  [SELECT] jump first hop' : '  Insufficient fuel') : '';
      const fuelStr = `First hop: ${firstHopFuel}L / ${this.player.fuelL}L avail${jumpHint}`;
      writeText(buffer, fuelRow, 2, fuelStr.slice(0, w - 4), feasible ? 'bright-black' : 'bright-red', 'black');
    }
  }
}
