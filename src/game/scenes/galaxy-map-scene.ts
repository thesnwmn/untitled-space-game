import type { InputHandler, GameContext, CharBuffer, Color } from '../../shared/types';
import { writeText, drawSeparator } from '../../shared/buffer-utils';
import { BaseScene } from './base-scene';
import { CONTENT_TOP } from '../ui/screen-chrome';
import type { PlayerState } from '../player-state';
import type { StarSystem } from '../world/types';
import { getPublicSystems, getRoutesFrom, getRoute } from '../world/world-data';
import { findRoute } from '../utils/route-finder';

// Neighbor list and chart offsets relative to contentTop (top = CONTENT_TOP+5 = 8)
const CHART_TOP_OFFSET = 0;   // top + 0
const CHART_MID_OFFSET = 4;   // top + 4
const CHART_BOT_OFFSET = 8;   // top + 8
const SEP1_OFFSET      = 9;   // top + 9
const LIST_TOP_OFFSET  = 10;  // top + 10
const SEP2_OFFSET      = 15;  // top + 15
const INFO_OFFSET      = 16;  // top + 16

// Chart column layout (content cols 2–37, w=40)
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

export class GalaxyMapScene extends BaseScene {
  private readonly onBack: () => void;
  private readonly onGame?: () => void;
  private mapBrowsingSystemId: string;
  private mapCursorIdx = 0;
  private routeDestIdx = 0;
  private searchText = '';

  private readonly publicSystems: StarSystem[];
  private readonly otherSystems: StarSystem[];

  constructor(
    inputHandler: InputHandler,
    context: GameContext,
    player: PlayerState,
    onBack: () => void,
    onMenu: () => void = () => {},
    onGame?: () => void,
  ) {
    const navOptions = onGame
      ? [{ id: 'game', label: 'GAME' }, { id: 'menu', label: 'MENU' }]
      : [{ id: 'back', label: 'BACK' }];

    super(inputHandler, context, player, {
      title: 'GALAXY MAP',
      tabs: ['MAP', 'ROUTE'],
      navOptions,
      onMenu,
    });

    this.onBack = onBack;
    this.onGame = onGame;
    this.publicSystems = getPublicSystems().sort((a, b) => a.distanceFromSol - b.distanceFromSol);
    this.otherSystems = this.publicSystems.filter(s => s.id !== player.systemId);
    this.mapBrowsingSystemId = player.systemId;
  }

  protected override onTabChange(_newIdx: number): void {
    this.searchText = '';
  }

  protected override handleCharInput(char: string): void {
    if (this.activeTabIdx !== 0) return;
    const code = char.charCodeAt(0);
    if (char === '\b' || char === '\x7f') {
      this.searchText = this.searchText.slice(0, -1);
    } else if (code >= 32 && code < 127) {
      this.searchText += char.toUpperCase();
      this.mapCursorIdx = 0;
    }
  }

  protected override handleAction(action: string): void {
    if (action === 'BACK') {
      if (this.searchText.length > 0) { this.searchText = ''; return; }
      this.activated = true;
      this.onBack();
      return;
    }
    if (action === 'NAV_1') {
      if (this.onGame) {
        this.activated = true;
        this.onGame();
      }
      return;
    }
    if (action === 'NAV_2') {
      if (this.onGame) {
        this.searchText = '';
        this.activated = true;
        this.onBack();
      }
      return;
    }
    if (this.activeTabIdx === 0) {
      this.handleMapAction(action);
    } else {
      this.handleRouteAction(action);
    }
  }

  protected override handleNavTap(navId: string): void {
    if (navId === 'back') {
      this.searchText = '';
      this.activated = true;
      this.onBack();
    } else if (navId === 'game' && this.onGame) {
      this.activated = true;
      this.onGame();
    } else if (navId === 'menu') {
      this.searchText = '';
      this.activated = true;
      this.onBack();
    }
  }

  protected override handleTap(col: number, row: number): void {
    // Map tab: list item navigation
    // Route tab: destination selection
    // Tab-specific rows computed from top stored during renderContent
    const top = this.lastTop;
    const listTopRow = top + LIST_TOP_OFFSET;
    const sep2Row    = top + SEP2_OFFSET;

    if (this.activeTabIdx === 0 && row >= listTopRow && row < sep2Row) {
      const neighbors = this.getMapNeighbors();
      const tapIdx = row - listTopRow;
      if (tapIdx >= 0 && tapIdx < neighbors.length) {
        this.mapBrowsingSystemId = neighbors[tapIdx].id;
        this.mapCursorIdx = 0;
        this.searchText = '';
      }
    } else if (this.activeTabIdx === 1) {
      const routeListTop = top + 3;
      const routeListBot = top + 9;
      if (row >= routeListTop && row <= routeListBot) {
        const tapIdx = row - routeListTop;
        if (tapIdx >= 0 && tapIdx < this.otherSystems.length) {
          this.routeDestIdx = tapIdx;
        }
      }
    }
  }

  // GALAXY MAP has title + 2 tabs, no summary → top = CONTENT_TOP + 5
  private lastTop = CONTENT_TOP + 5;

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
    }
  }

  private computeRoute(): string[] | null {
    const dest = this.otherSystems[this.routeDestIdx];
    if (!dest) return null;
    return findRoute(this.player.systemId, dest.id);
  }

  protected override renderContent(buffer: CharBuffer, top: number, bottom: number): void {
    this.lastTop = top;
    const w = buffer.length > 0 ? buffer[0].length : 0;

    if (this.activeTabIdx === 0) {
      this.renderMapTab(buffer, top, bottom, w);
    } else {
      this.renderRouteTab(buffer, top, bottom, w);
    }
  }

  private renderMapTab(buffer: CharBuffer, top: number, _bottom: number, w: number): void {
    const center = this.publicSystems.find(s => s.id === this.mapBrowsingSystemId)
      ?? this.publicSystems[0];
    if (!center) return;

    const chartMidRow = top + CHART_MID_OFFSET;
    const sep1Row     = top + SEP1_OFFSET;
    const listTopRow  = top + LIST_TOP_OFFSET;
    const sep2Row     = top + SEP2_OFFSET;
    const infoRow     = top + INFO_OFFSET;

    this.renderChart(buffer, center, top);
    drawSeparator(buffer, sep1Row, w);

    const neighbors = this.getMapNeighbors();
    const cursor = Math.min(this.mapCursorIdx, Math.max(0, neighbors.length - 1));
    this.renderNeighborList(buffer, w, center, neighbors, cursor, listTopRow, sep2Row);

    drawSeparator(buffer, sep2Row, w);
    this.renderInfo(buffer, w, center, neighbors[cursor] ?? null, infoRow);

    if (this.searchText.length > 0) {
      writeText(buffer, infoRow + 4, 2, `/${this.searchText}_`, 'bright-yellow', 'black');
    }
  }

  private renderChart(buffer: CharBuffer, center: StarSystem, top: number): void {
    const neighbors = this.getMapNeighbors();

    const chartTopRow = top + CHART_TOP_OFFSET;
    const chartMidRow = top + CHART_MID_OFFSET;
    const chartBotRow = top + CHART_BOT_OFFSET;

    const centerFg: Color = center.id === this.player.systemId ? 'bright-yellow' : 'bright-cyan';
    writeText(buffer, chartMidRow, CENTER_BOX_COL, nameBox(center.name, CENTER_BOX_LEN), centerFg, 'black');
    if (center.id === this.player.systemId) {
      const col = CENTER_BOX_COL + CENTER_BOX_LEN;
      const w = buffer[0]?.length ?? 40;
      if (col < w) buffer[chartMidRow][col] = { char: '*', fg: 'bright-yellow', bg: 'black' };
    }

    const positions = ['left', 'right', 'top', 'bottom'] as const;
    for (let i = 0; i < Math.min(neighbors.length, 4); i++) {
      const sys = neighbors[i];
      const pos = positions[i];
      const nFg: Color = sys.id === this.player.systemId ? 'bright-yellow' : 'white';

      if (pos === 'left') {
        writeText(buffer, chartMidRow, LEFT_BOX_COL, nameBox(sys.name, LEFT_BOX_LEN), nFg, 'black');
        buffer[chartMidRow][LEFT_DASH_COL] = { char: '-', fg: 'bright-black', bg: 'black' };
      } else if (pos === 'right') {
        writeText(buffer, chartMidRow, RIGHT_BOX_COL, nameBox(sys.name, RIGHT_BOX_LEN), nFg, 'black');
        buffer[chartMidRow][RIGHT_DASH_COL] = { char: '-', fg: 'bright-black', bg: 'black' };
      } else if (pos === 'top') {
        writeText(buffer, chartTopRow, CENTER_BOX_COL, nameBox(sys.name, CENTER_BOX_LEN), nFg, 'black');
        for (let r = chartTopRow + 1; r < chartMidRow; r++)
          buffer[r][VERT_COL] = { char: '|', fg: 'bright-black', bg: 'black' };
      } else {
        writeText(buffer, chartBotRow, CENTER_BOX_COL, nameBox(sys.name, CENTER_BOX_LEN), nFg, 'black');
        for (let r = chartMidRow + 1; r < chartBotRow; r++)
          buffer[r][VERT_COL] = { char: '|', fg: 'bright-black', bg: 'black' };
      }
    }
  }

  private renderNeighborList(
    buffer: CharBuffer, w: number, center: StarSystem,
    neighbors: StarSystem[], cursorIdx: number,
    listTopRow: number, sep2Row: number,
  ): void {
    for (let i = 0; i < neighbors.length && i < sep2Row - listTopRow; i++) {
      const sys = neighbors[i];
      const row = listTopRow + i;
      const isCursor = i === cursorIdx;
      const isPlayer = sys.id === this.player.systemId;
      const nameFg: Color = isPlayer ? 'bright-yellow' : (isCursor ? 'bright-cyan' : 'white');
      const prefix = isCursor ? '> ' : '  ';

      const route = getRoute(center.id, sys.id);
      const infoStr = route ? `${route.distance}LY  ${route.stability}` : '';
      const maxName = w - 4 - infoStr.length;
      writeText(buffer, row, 2, prefix + sys.name.toUpperCase().slice(0, maxName - 2), nameFg, 'black');
      if (infoStr) writeText(buffer, row, w - 2 - infoStr.length, infoStr, 'bright-black', 'black');
    }
  }

  private renderInfo(
    buffer: CharBuffer, w: number, center: StarSystem, selected: StarSystem | null,
    infoRow: number,
  ): void {
    const centerIsPlayer = center.id === this.player.systemId;
    const centerLabel = centerIsPlayer ? '* Current location' : center.name.toUpperCase();
    writeText(buffer, infoRow, 2, `Zone: ${center.zone}  Sec: ${center.security}  ${centerLabel}`.slice(0, w - 4), 'bright-black', 'black');

    if (!selected) return;
    const route = getRoute(center.id, selected.id);
    if (!route) return;

    const hops = findRoute(this.player.systemId, selected.id);
    const hopsStr = hops
      ? (hops.length === 1 ? '(your location)' : `${hops.length - 1} hop${hops.length - 1 !== 1 ? 's' : ''} from you`)
      : '(unreachable)';
    writeText(buffer, infoRow + 1, 2, `${selected.name.toUpperCase()}  ${route.distance}LY  ${hopsStr}`.slice(0, w - 4), 'bright-black', 'black');
  }

  private renderRouteTab(buffer: CharBuffer, top: number, _bottom: number, w: number): void {
    const fromRow  = top;
    const toRow    = top + 2;
    const listTop  = top + 3;
    const listH    = 7;
    const sep1     = listTop + listH;
    const resTop   = sep1 + 1;
    const sep2     = resTop + 6;

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

    drawSeparator(buffer, sep1, w);
    drawSeparator(buffer, sep2, w);

    const route = this.computeRoute();
    const dest = this.otherSystems[this.routeDestIdx];
    if (!dest) return;

    if (!route) {
      writeText(buffer, resTop, 2, 'No route found', 'bright-red', 'black');
      return;
    }

    const hops = route.length - 1;
    writeText(buffer, resTop, 2, `Route: ${hops} hop${hops !== 1 ? 's' : ''}`, 'bright-white', 'black');

    for (let i = 0; i < hops; i++) {
      const r = getRoute(route[i], route[i + 1]);
      if (!r) continue;
      const hopRow = resTop + 1 + i;
      if (hopRow >= sep2) break;
      const fromName = (this.publicSystems.find(s => s.id === route[i])?.name ?? route[i]).toUpperCase().slice(0, 9);
      const toName   = (this.publicSystems.find(s => s.id === route[i + 1])?.name ?? route[i + 1]).toUpperCase().slice(0, 9);
      writeText(buffer, hopRow, 4, `${fromName} -> ${toName}  ${r.distance}LY  ${r.stability}`.slice(0, w - 6), 'white', 'black');
    }
  }
}
