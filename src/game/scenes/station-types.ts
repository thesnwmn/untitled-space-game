import type { Color } from '../../shared/types';

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
