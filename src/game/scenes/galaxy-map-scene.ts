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

// ── Layout constants ──────────────────────────────────────────────────────────
//
// Row CONTENT_TOP   (3): title
// Row CONTENT_TOP+1 (4): underline
// Row CONTENT_TOP+2 (5): blank
// Row CONTENT_TOP+3 (6): tab bar
// Row CONTENT_TOP+4 (7): blank
// Rows 8–16: chart (9 rows, mid at 12)
// Row 17: separator
// Rows 18–22: neighbor list (max 4 items + 1 spare)
// Row 23: separator
// Rows 24–25: info
// Row 28: search indicator (when active)

const TITLE         = 'GALAXY MAP';
const TAB_ROW       = CONTENT_TOP + 3;   // 6
const CHART_TOP_ROW = CONTENT_TOP + 5;   // 8
const CHART_MID_ROW = CONTENT_TOP + 9;   // 12
const CHART_BOT_ROW = CONTENT_TOP + 13;  // 16
const SEP1_ROW      = CONTENT_TOP + 14;  // 17
const LIST_TOP_ROW  = CONTENT_TOP + 15;  // 18
const SEP2_ROW      = CONTENT_TOP + 20;  // 23
const INFO_ROW      = CONTENT_TOP + 21;  // 24

// Chart column layout (content cols 2–37, w=40)
//   [LEFT SY  ]─[CENTER SY  ]─[RIGHT SY  ]
//    2      11 12 13       24 25 26      35
const LEFT_BOX_COL   = 2;
const LEFT_BOX_LEN   = 10;
const LEFT_DASH_COL  = 12;
const CENTER_BOX_COL = 13;
const CENTER_BOX_LEN = 12;
const RIGHT_DASH_COL = 25;
const RIGHT_BOX_COL  = 26;
const RIGHT_BOX_LEN  = 10;
const VERT_COL       = 18;

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
  // mapBrowsingSystemId = center of the chart (the system being inspected)
  private mapBrowsingSystemId: string;
  // mapCursorIdx = which neighbor in the list is highlighted
  private mapCursorIdx = 0;
  private routeDestIdx = 0;
  private searchText = '';
  private activated = false;

  private readonly publicSystems: StarSystem[];
  private readonly otherSystems: StarSystem[];

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
        if (this.activated || this.activeTab !== 'map') return;
        const code = char.charCodeAt(0);
        if (char === '\b' || char === '\x7f') {
          this.searchText = this.searchText.slice(0, -1);
        } else if (code >= 32 && code < 127) {
          this.searchText += char.toUpperCase();
          this.mapCursorIdx = 0;
        }
      });
    }

    inputHandler.onAction((action) => {
      if (this.activated) return;

      if (action === 'BACK') {
        if (this.searchText.length > 0) { this.searchText = ''; return; }
        this.activated = true;
        this.onBack();
        return;
      }

      if (action === 'LEFT')  { this.activeTab = 'map';   this.searchText = ''; return; }
      if (action === 'RIGHT') { this.activeTab = 'route'; this.searchText = ''; return; }

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
        if (navId === 'back') { this.searchText = ''; this.activated = true; this.onBack(); return; }
        if (row === TAB_ROW) {
          if (col >= 3 && col <= 7)  { this.activeTab = 'map';   this.searchText = ''; }
          else if (col >= 9 && col <= 16) { this.activeTab = 'route'; this.searchText = ''; }
          return;
        }
        if (this.activeTab === 'map' && row >= LIST_TOP_ROW && row < SEP2_ROW) {
          const neighbors = this.getMapNeighbors();
          const tapIdx = row - LIST_TOP_ROW;
          if (tapIdx >= 0 && tapIdx < neighbors.length) {
            this.mapCursorIdx = tapIdx;
          }
        }
        // Route tab destination list: rows CONTENT_TOP+8 to CONTENT_TOP+14 (11–17)
        if (this.activeTab === 'route' && row >= CONTENT_TOP + 8 && row <= CONTENT_TOP + 14) {
          const tapIdx = row - (CONTENT_TOP + 8);
          if (tapIdx >= 0 && tapIdx < this.otherSystems.length) {
            this.routeDestIdx = tapIdx;
          }
        }
      });
    }
  }

  // Returns direct neighbors of the browsed center system, sorted by route distance, filtered by search
  private getMapNeighbors(): StarSystem[] {
    const routes = getRoutesFrom(this.mapBrowsingSystemId);
    const neighbors = routes
      .map(r => {
        const otherId = r.from === this.mapBrowsingSystemId ? r.to : r.from;
        const sys = this.publicSystems.find(s => s.id === otherId);
        const dist = r.distance;
        return sys ? { sys, dist } : null;
      })
      .filter((n): n is { sys: StarSystem; dist: number } => n !== null)
      .sort((a, b) => a.dist - b.dist)
      .map(n => n.sys);

    if (this.searchText.length === 0) return neighbors;
    return neighbors.filter(s => s.name.toUpperCase().includes(this.searchText));
  }

  private handleMapAction(action: string): void {
    const neighbors = this.getMapNeighbors();
    const cursor = Math.min(this.mapCursorIdx, Math.max(0, neighbors.length - 1));

    if (action === 'UP') {
      this.mapCursorIdx = Math.max(0, cursor - 1);
    } else if (action === 'DOWN') {
      this.mapCursorIdx = Math.min(neighbors.length - 1, cursor + 1);
    } else if (action === 'SELECT') {
      const sys = neighbors[cursor];
      if (!sys) return;
      // Jump if browsing player's own system and this neighbor is reachable
      if (this.mapBrowsingSystemId === this.player.systemId && this.canJump) {
        const route = getRoute(this.player.systemId, sys.id);
        if (route) {
          const drive = getDrive(this.player.driveId);
          const fuel = drive ? fuelCost(route.distance, drive.fuelEfficiency) : 0;
          if (fuel <= this.player.fuelL) {
            this.activated = true;
            this.onJump(sys.id);
            return;
          }
        }
      }
      // Otherwise re-centre on the selected neighbour
      this.mapBrowsingSystemId = sys.id;
      this.mapCursorIdx = 0;
      this.searchText = '';
    }
  }

  private handleRouteAction(action: string): void {
    if (action === 'UP') {
      this.routeDestIdx = Math.max(0, this.routeDestIdx - 1);
    } else if (action === 'DOWN') {
      this.routeDestIdx = Math.min(this.otherSystems.length - 1, this.routeDestIdx + 1);
    } else if ((action === 'SELECT') && this.canJump) {
      const route = this.computeRoute();
      if (route && route.length >= 2) {
        const r = getRoute(route[0], route[1]);
        if (r) {
          const drive = getDrive(this.player.driveId);
          const fuel = drive ? fuelCost(r.distance, drive.fuelEfficiency) : 0;
          if (fuel <= this.player.fuelL) {
            this.activated = true;
            this.onJump(route[1]);
          }
        }
      }
    }
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

    // Title + underline (matches BaseMenuScene convention)
    writeText(buffer, CONTENT_TOP,     2, TITLE,                        'bright-white', 'black');
    writeText(buffer, CONTENT_TOP + 1, 2, "'".repeat(TITLE.length),     'bright-black', 'black');

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
      const fg: Color = isActive ? 'black' : 'white';
      const bg: Color = isActive ? 'green' : 'black';
      for (const ch of ` ${label} `) {
        if (col < w) buffer[row][col] = { char: ch, fg, bg };
        col++;
      }
      if (col < w) buffer[row][col] = { char: '|', fg: 'bright-black', bg: 'black' };
      col++;
    }
  }

  // ── MAP tab ──────────────────────────────────────────────────────────────────

  private renderMapTab(buffer: CharBuffer, w: number): void {
    const center = this.publicSystems.find(s => s.id === this.mapBrowsingSystemId)
      ?? this.publicSystems[0];
    if (!center) return;

    this.renderChart(buffer, center);
    writeText(buffer, SEP1_ROW, 0, '-'.repeat(w), 'bright-black', 'black');

    const neighbors = this.getMapNeighbors();
    const cursor = Math.min(this.mapCursorIdx, Math.max(0, neighbors.length - 1));
    this.renderNeighborList(buffer, w, center, neighbors, cursor);

    writeText(buffer, SEP2_ROW, 0, '-'.repeat(w), 'bright-black', 'black');
    this.renderInfo(buffer, w, center, neighbors[cursor] ?? null);

    if (this.searchText.length > 0) {
      writeText(buffer, INFO_ROW + 4, 2, `/${this.searchText}_`, 'bright-yellow', 'black');
    }
  }

  private renderChart(buffer: CharBuffer, center: StarSystem): void {
    const neighbors = this.getMapNeighbors();

    const centerFg: Color = center.id === this.player.systemId ? 'bright-yellow' : 'bright-cyan';
    writeText(buffer, CHART_MID_ROW, CENTER_BOX_COL, nameBox(center.name, CENTER_BOX_LEN), centerFg, 'black');
    if (center.id === this.player.systemId) {
      const col = CENTER_BOX_COL + CENTER_BOX_LEN;
      if (col < 40) buffer[CHART_MID_ROW][col] = { char: '*', fg: 'bright-yellow', bg: 'black' };
    }

    const positions = ['left', 'right', 'top', 'bottom'] as const;
    for (let i = 0; i < Math.min(neighbors.length, 4); i++) {
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
        for (let r = CHART_TOP_ROW + 1; r < CHART_MID_ROW; r++)
          buffer[r][VERT_COL] = { char: '|', fg: 'bright-black', bg: 'black' };
      } else {
        writeText(buffer, CHART_BOT_ROW, CENTER_BOX_COL, nameBox(sys.name, CENTER_BOX_LEN), nFg, 'black');
        for (let r = CHART_MID_ROW + 1; r < CHART_BOT_ROW; r++)
          buffer[r][VERT_COL] = { char: '|', fg: 'bright-black', bg: 'black' };
      }
    }
  }

  private renderNeighborList(
    buffer: CharBuffer, w: number, center: StarSystem,
    neighbors: StarSystem[], cursorIdx: number,
  ): void {
    for (let i = 0; i < neighbors.length && i < SEP2_ROW - LIST_TOP_ROW; i++) {
      const sys = neighbors[i];
      const row = LIST_TOP_ROW + i;
      const isCursor = i === cursorIdx;
      const isPlayer = sys.id === this.player.systemId;
      const nameFg: Color = isPlayer ? 'bright-yellow' : (isCursor ? 'bright-cyan' : 'white');
      const prefix = isCursor ? '> ' : '  ';

      const route = getRoute(center.id, sys.id);
      const infoStr = route
        ? `${route.distance}LY  ${route.stability}`
        : '';
      const maxName = w - 4 - infoStr.length;
      writeText(buffer, row, 2, prefix + sys.name.toUpperCase().slice(0, maxName - 2), nameFg, 'black');
      if (infoStr) writeText(buffer, row, w - 2 - infoStr.length, infoStr, 'bright-black', 'black');
    }
  }

  private renderInfo(
    buffer: CharBuffer, w: number, center: StarSystem, selected: StarSystem | null,
  ): void {
    const centerIsPlayer = center.id === this.player.systemId;
    const centerLabel = centerIsPlayer ? '* Current location' : center.name.toUpperCase();
    writeText(buffer, INFO_ROW, 2, `Zone: ${center.zone}  Sec: ${center.security}  ${centerLabel}`.slice(0, w - 4), 'bright-black', 'black');

    if (!selected) return;
    const route = getRoute(center.id, selected.id);
    if (!route) return;

    if (centerIsPlayer && this.canJump) {
      const drive = getDrive(this.player.driveId);
      const fuel = drive ? fuelCost(route.distance, drive.fuelEfficiency) : 0;
      const ok = fuel <= this.player.fuelL;
      const hint = ok ? '[SELECT] jump' : 'Insufficient fuel';
      const line2 = `${selected.name.toUpperCase()}  ${fuel}L  ${hint}`;
      writeText(buffer, INFO_ROW + 1, 2, line2.slice(0, w - 4), ok ? 'white' : 'bright-red', 'black');
    } else if (!centerIsPlayer) {
      const hops = findRoute(this.player.systemId, selected.id);
      const hint = hops ? `${hops.length - 1} hop${hops.length - 1 !== 1 ? 's' : ''} from your location` : 'Not reachable';
      writeText(buffer, INFO_ROW + 1, 2, `${selected.name.toUpperCase()}  ${hint}`.slice(0, w - 4), 'bright-black', 'black');
    }
  }

  // ── ROUTE tab ────────────────────────────────────────────────────────────────

  private renderRouteTab(buffer: CharBuffer, w: number): void {
    // Content starts at CONTENT_TOP+5 (row 8) — after title/underline/blank/tabbar/blank
    const fromRow = CONTENT_TOP + 5;   // 8
    const toRow   = CONTENT_TOP + 7;   // 10
    const listTop = CONTENT_TOP + 8;   // 11
    const listH   = 7;
    const sep1    = listTop + listH;   // 18
    const resTop  = sep1 + 1;          // 19
    const sep2    = resTop + 6;        // 25
    const fuelRow = sep2 + 1;          // 26

    const fromSys = this.publicSystems.find(s => s.id === this.player.systemId);
    writeText(buffer, fromRow, 2, 'FROM:', 'bright-black', 'black');
    writeText(buffer, fromRow, 8, fromSys?.name.toUpperCase() ?? this.player.systemId.toUpperCase(), 'bright-yellow', 'black');

    writeText(buffer, toRow, 2, 'TO:', 'bright-black', 'black');

    const scrollOffset = Math.max(0, Math.min(this.routeDestIdx, this.otherSystems.length - listH));
    for (let i = 0; i < listH; i++) {
      const sysIdx = scrollOffset + i;
      if (sysIdx >= this.otherSystems.length) break;
      const sys = this.otherSystems[sysIdx];
      const isCursor = sysIdx === this.routeDestIdx;
      const fg: Color = isCursor ? 'bright-cyan' : 'white';
      const prefix = isCursor ? '> ' : '  ';
      writeText(buffer, listTop + i, 2, prefix + sys.name.toUpperCase(), fg, 'black');
    }

    writeText(buffer, sep1, 0, '-'.repeat(w), 'bright-black', 'black');
    writeText(buffer, sep2, 0, '-'.repeat(w), 'bright-black', 'black');

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
    for (let i = 0; i < hops; i++) {
      const r = getRoute(route[i], route[i + 1]);
      if (!r) continue;
      const hopRow = resTop + 1 + i;
      if (hopRow >= sep2) break;
      const fromName = (this.publicSystems.find(s => s.id === route[i])?.name ?? route[i]).toUpperCase().slice(0, 9);
      const toName   = (this.publicSystems.find(s => s.id === route[i + 1])?.name ?? route[i + 1]).toUpperCase().slice(0, 9);
      writeText(buffer, hopRow, 4, `${fromName} -> ${toName}  ${r.distance}LY  ${r.stability}`.slice(0, w - 6), 'white', 'black');
    }

    if (fuelRow < buffer.length - 1 && drive) {
      const firstRoute = getRoute(route[0], route[1]);
      const firstFuel = firstRoute ? fuelCost(firstRoute.distance, drive.fuelEfficiency) : 0;
      const ok = firstFuel <= this.player.fuelL;
      const hint = this.canJump ? (ok ? '  [SELECT] jump first hop' : '  Insufficient fuel') : '';
      writeText(buffer, fuelRow, 2, `First hop: ${firstFuel}L / ${this.player.fuelL}L avail${hint}`.slice(0, w - 4), ok ? 'bright-black' : 'bright-red', 'black');
    }
  }
}
