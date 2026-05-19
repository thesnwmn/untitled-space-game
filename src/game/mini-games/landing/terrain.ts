import type { Cell } from '../../../shared/types';
import type { TerrainColumn, TerrainStyle } from './types';

function hashStringToSeed(s: string): number {
  if (s.length === 0) return 2166136261;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h === 0 ? 1 : h;
}

function lcgRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function generateTerrain(
  seed: string,
  width: number,
  height: number,
  padWidth: number,
  _style: TerrainStyle,
): TerrainColumn[] {
  const rand = lcgRand(hashStringToSeed(seed));

  const minTerrainH = 3;
  const maxTerrainH = Math.min(5, Math.floor(height / 2));
  const terrainH = minTerrainH + Math.floor(rand() * (maxTerrainH - minTerrainH + 1));
  const baseRow = height - terrainH;

  const surfaceRows: number[] = [];
  for (let i = 0; i < width; i++) {
    const offset = Math.floor(rand() * 3) - 1;
    surfaceRows.push(Math.max(baseRow - 1, Math.min(baseRow + 1, baseRow + offset)));
  }

  const maxPadStart = Math.max(0, width - padWidth);
  const padStart = Math.floor(rand() * (maxPadStart + 1));

  for (let i = padStart; i < padStart + padWidth && i < width; i++) {
    surfaceRows[i] = baseRow;
  }

  return surfaceRows.map((surfaceRow, col) => ({
    surfaceRow,
    isPad: col >= padStart && col < padStart + padWidth,
  }));
}

export function detectCollision(
  shipX: number,
  shipBottomY: number,
  terrain: TerrainColumn[],
): boolean {
  const leftCol = Math.floor(shipX);
  const rightCol = leftCol + 2;
  for (let col = leftCol; col <= rightCol; col++) {
    if (col < 0 || col >= terrain.length) continue;
    if (shipBottomY >= terrain[col].surfaceRow) return true;
  }
  return false;
}

export function renderTerrain(
  buffer: Cell[][],
  terrain: TerrainColumn[],
  viewportTop: number,
  viewportLeft: number,
  viewportHeight: number,
  style: TerrainStyle,
): void {
  for (let col = 0; col < terrain.length; col++) {
    const tc = terrain[col];
    const bufCol = viewportLeft + col;
    if (bufCol < 0) continue;

    let topChar: string;
    if (tc.isPad) {
      const prevIsPad = col > 0 && terrain[col - 1].isPad;
      const nextIsPad = col < terrain.length - 1 && terrain[col + 1].isPad;
      if (!prevIsPad) topChar = '[';
      else if (!nextIsPad) topChar = ']';
      else topChar = '=';
    } else if (style === 'asteroid') {
      const pattern = col % 3;
      topChar = pattern === 0 ? '/' : pattern === 1 ? '\\' : '^';
    } else {
      topChar = '^';
    }

    const fillChar = style === 'asteroid' ? '▪' : '#';
    const fg = tc.isPad ? 'bright-yellow' : ('white' as const);

    const bufTopRow = viewportTop + tc.surfaceRow;
    for (let row = bufTopRow; row < viewportTop + viewportHeight; row++) {
      if (row < 0 || row >= buffer.length) continue;
      if (bufCol >= buffer[row].length) continue;
      const isTop = row === bufTopRow;
      buffer[row][bufCol] = { char: isTop ? topChar : fillChar, fg, bg: 'black' };
    }
  }
}
