import { describe, it, expect } from 'vitest';
import { parseWorldFiles } from './world-parser';

const SYSTEM_FILE = `---
id: sol
name: Sol
star_type: G2V
distance_from_sol: 4.3
zone: core
security: high
population: massive
danger_level: low
player_knowledge: public
economy:
  - industrial
major_factions:
  - terran-union
destinations:
  - elysium-station
tags:
  - core-world
---

# Sol System

The birthplace of humanity and the political heart of known space.

More body text that should NOT be in the description.
`;

const DESTINATION_FILE = `---
id: elysium-station
name: Elysium Station
system: sol
location_type: orbital
type: civilian
amenities:
  trader: true
  mission_board: true
  ship_repair: false
  fuel: true
  ship_dealer: false
npcs:
  trader: Merchant Kess
goods_bias:
  - trade
danger_level: low
tags:
  - starter
---

# Elysium Station

A mid-sized civilian port in Earth orbit.
`;

const STORY_FILE = `---
id: opening-arrival
title: Opening Arrival
trigger: game-start
type: intro
location: elysium-station
skippable: true
player_knowledge: public
---

YEAR  2284

The war ended six years ago.

Time to find work.
`;

const ROUTES_FILE = `---
routes:
  - from: sol
    to: alpha-centauri
    distance: 4.3
    stability: stable
    security: high
---
`;

const DRIVES_FILE = `---
drives:
  - id: civilian-mk1
    name: Civilian Mk1
    max_distance_ly: 4
    fuel_efficiency: 0.8
    cost: 10000
---
`;

const COMMODITIES_FILE = `---
commodities:
  - id: iron-ore
    name: Iron Ore
    base_price: 80
    category: raw-material
    legal: true
    weight_kg: 10
    description: Unrefined iron.
---
`;

const SETTINGS_FILE = `---
id: game-settings
player:
  name: Captain
  starting_credits: 5000
starting_location:
  system: sol
  destination: elysium-station
starting_ship: freighter
---
`;

describe('parseWorldFiles', () => {
  describe('system file', () => {
    it('maps snake_case fields to camelCase', () => {
      const world = parseWorldFiles({ 'systems/sol.md': SYSTEM_FILE });
      const system = world.systems[0];
      expect(system.id).toBe('sol');
      expect(system.starType).toBe('G2V');
      expect(system.distanceFromSol).toBe(4.3);
      expect(system.dangerLevel).toBe('low');
      expect(system.playerKnowledge).toBe('public');
      expect(system.majorFactions).toEqual(['terran-union']);
    });

    it('extracts description from first body paragraph, skipping headings', () => {
      const world = parseWorldFiles({ 'systems/sol.md': SYSTEM_FILE });
      expect(world.systems[0].description).toBe(
        'The birthplace of humanity and the political heart of known space.'
      );
    });

    it('description does not include heading text', () => {
      const world = parseWorldFiles({ 'systems/sol.md': SYSTEM_FILE });
      expect(world.systems[0].description).not.toContain('Sol System');
    });
  });

  describe('destination file', () => {
    it('maps amenity snake_case sub-keys', () => {
      const world = parseWorldFiles({ 'destinations/elysium-station.md': DESTINATION_FILE });
      const dest = world.destinations[0];
      expect(dest.locationType).toBe('orbital');
      expect(dest.amenities.missionBoard).toBe(true);
      expect(dest.amenities.shipRepair).toBe(false);
      expect(dest.amenities.shipDealer).toBe(false);
      expect(dest.amenities.trader).toBe(true);
      expect(dest.amenities.fuel).toBe(true);
    });

    it('preserves npcs and goodsBias', () => {
      const world = parseWorldFiles({ 'destinations/elysium-station.md': DESTINATION_FILE });
      const dest = world.destinations[0];
      expect(dest.npcs.trader).toBe('Merchant Kess');
      expect(dest.goodsBias).toEqual(['trade']);
    });
  });

  describe('story beat', () => {
    it('maps player_knowledge to playerKnowledge', () => {
      const world = parseWorldFiles({ 'story/opening-arrival.md': STORY_FILE });
      expect(world.storyBeats[0].playerKnowledge).toBe('public');
    });

    it('stores full trimmed body as text, preserving internal newlines', () => {
      const world = parseWorldFiles({ 'story/opening-arrival.md': STORY_FILE });
      const text = world.storyBeats[0].text;
      expect(text).toContain('YEAR  2284');
      expect(text).toContain('The war ended six years ago.');
      expect(text).toContain('Time to find work.');
      expect(text).toMatch(/YEAR  2284\n\nThe war ended/);
    });
  });

  describe('jump routes list', () => {
    it('parses routes from front matter list', () => {
      const world = parseWorldFiles({ 'navigation/jump-routes.md': ROUTES_FILE });
      expect(world.routes).toHaveLength(1);
      expect(world.routes[0].from).toBe('sol');
      expect(world.routes[0].to).toBe('alpha-centauri');
      expect(world.routes[0].distance).toBe(4.3);
    });
  });

  describe('jump drives list', () => {
    it('maps max_distance_ly and fuel_efficiency', () => {
      const world = parseWorldFiles({ 'ships/components/jump-drives.md': DRIVES_FILE });
      expect(world.drives).toHaveLength(1);
      expect(world.drives[0].maxDistanceLy).toBe(4);
      expect(world.drives[0].fuelEfficiency).toBe(0.8);
    });
  });

  describe('commodities list', () => {
    it('maps base_price to basePrice and weight_kg to weightKg', () => {
      const world = parseWorldFiles({ 'commodities.md': COMMODITIES_FILE });
      expect(world.commodities).toHaveLength(1);
      expect(world.commodities[0].basePrice).toBe(80);
      expect(world.commodities[0].weightKg).toBe(10);
    });
  });

  describe('game settings', () => {
    it('maps starting_credits and starting_location', () => {
      const world = parseWorldFiles({ 'game-settings.md': SETTINGS_FILE });
      expect(world.settings.player.startingCredits).toBe(5000);
      expect(world.settings.startingLocation.system).toBe('sol');
      expect(world.settings.startingLocation.destination).toBe('elysium-station');
      expect(world.settings.startingShip).toBe('freighter');
    });
  });

  describe('skipping', () => {
    it('skips _template.md files', () => {
      const world = parseWorldFiles({ 'systems/_template.md': SYSTEM_FILE });
      expect(world.systems).toHaveLength(0);
    });

    it('skips .gitkeep files', () => {
      const world = parseWorldFiles({ 'factions/.gitkeep': '' });
      expect(world.factions).toHaveLength(0);
    });

    it('silently skips unknown path patterns', () => {
      const world = parseWorldFiles({
        'galaxy-map.md': '---\nfoo: bar\n---\n',
        'unknown/something.md': '---\nfoo: bar\n---\n',
      });
      expect(world.systems).toHaveLength(0);
      expect(world.destinations).toHaveLength(0);
    });
  });
});
