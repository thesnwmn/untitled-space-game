import type { Color } from '../../shared/types';
import type { LocationType } from '../world/types';

export interface StationGlyph {
  rows: string[];
  fg: Color;
}

export interface SpaceStationDef {
  name: string;
  glyph: StationGlyph;
}

export const STATION_TYPES: Record<string, SpaceStationDef> = {
  BEACON: {
    name: 'BEACON',
    glyph: { rows: ['[*]', ' | '], fg: 'bright-yellow' },
  },
  RELAY: {
    name: 'RELAY',
    glyph: { rows: ['>---<', ' |*|', '  |'], fg: 'bright-yellow' },
  },
  RING: {
    name: 'RING',
    glyph: { rows: ['/-\\', '|O|', '\\-/'], fg: 'cyan' },
  },
  HUB: {
    name: 'HUB',
    glyph: { rows: ['  *  ', '--+--', ' [H] ', '  |  ', '  *  '], fg: 'white' },
  },
};

export const STATION_GLYPHS: StationGlyph[] = [
  { rows: ['>---<', ' |*| ', '  |  '], fg: 'bright-white' },
  { rows: ['/-\\', '|O|', '\\-/'], fg: 'cyan' },
  { rows: ['  *  ', '--+--', ' [H] ', '  |  ', '  *  '], fg: 'bright-white' },
];

export const ASTEROID_GLYPHS: StationGlyph[] = [
  { rows: [' /\\/\\', '< ** >', ' \\__/'], fg: 'yellow' },
  { rows: ['  ___', ' /   \\', '|  .  |', ' \\___/'], fg: 'yellow' },
  { rows: [' _/\\_', '/  . \\', '\\____/'], fg: 'yellow' },
];

export const PLANET_GLYPHS: StationGlyph[] = [
  { rows: ['  .--.', ' / .. \\', '| .... |', ' \\ .. /', "  `--'"], fg: 'blue' },
  { rows: ['  .--.', ' / ~~ \\', '| ~~~~ |', ' \\ ~~ /', "  `--'"], fg: 'bright-yellow' },
  { rows: ['  .--.', ' /====\\', '|======|', ' \\====/', "  `--'"], fg: 'bright-cyan' },
];

export function selectDestinationGlyph(locationType: LocationType | undefined, seed: number): StationGlyph | null {
  if (locationType === 'orbital' || locationType === 'deep-space') {
    return STATION_GLYPHS[seed % STATION_GLYPHS.length];
  }
  if (locationType === 'asteroid') {
    return ASTEROID_GLYPHS[seed % ASTEROID_GLYPHS.length];
  }
  if (locationType === 'surface') {
    return PLANET_GLYPHS[seed % PLANET_GLYPHS.length];
  }
  return null;
}
