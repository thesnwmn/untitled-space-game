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
    it('maps starting_credits and starting_location from settings/new-game.md', () => {
      const world = parseWorldFiles({ 'settings/new-game.md': SETTINGS_FILE });
      expect(world.settings.player.startingCredits).toBe(5000);
      expect(world.settings.startingLocation.system).toBe('sol');
      expect(world.settings.startingLocation.destination).toBe('elysium-station');
      expect(world.settings.startingShip).toBe('freighter');
    });
  });

  describe('game balance', () => {
    it('uses defaults when balance file is absent', () => {
      const world = parseWorldFiles({});
      expect(world.balance.fuel.pricePerLitre).toBe(10);
      expect(world.balance.fuel.consumptionPerLy).toBe(5);
      expect(world.balance.npc.specialNameChance).toBe(0.3);
      expect(world.balance.missions.boardCountMin).toBe(3);
      expect(world.balance.missions.boardCountMax).toBe(6);
    });

    it('parses settings/balance.md and overrides defaults', () => {
      const balanceFile = `---
id: balance
npc:
  special_name_chance: 0.5
missions:
  board_count_min: 2
  board_count_max: 4
  mission_ttl_ms: 300000
  delivery_chance: 0.7
  delivery_base_reward: 300
  delivery_random_reward: 100
  supply_reward_margin: 0.5
  supply_random_reward: 200
  supply_requirements_min: 1
  supply_requirements_max: 3
  supply_qty_min: 2
  supply_qty_max: 6
trading:
  stock_count_min: 3
  stock_count_max: 5
  stock_qty_min: 2
  stock_qty_max: 10
  stock_ttl_ms: 60000
fuel:
  price_per_litre: 15
  consumption_per_ly: 8
reputation:
  level_unfriendly_min: -200
  level_neutral_min: -50
  level_friendly_min: 50
  level_liked_min: 200
  level_revered_min: 500
  points_min: -500
  points_max: 800
  mission_delta_small: 10
  mission_delta_medium: 50
  mission_delta_large: 150
  mission_tier_medium_reward: 250
  mission_tier_large_reward: 500
  trade_modifier_hated: 1.30
  trade_modifier_unfriendly: 1.15
  trade_modifier_neutral: 1.00
  trade_modifier_friendly: 0.90
  trade_modifier_liked: 0.80
  trade_modifier_revered: 0.70
  rep_per_credit: 0.02
  max_rep_per_visit: 20
---
`;
      const world = parseWorldFiles({ 'settings/balance.md': balanceFile });
      expect(world.balance.npc.specialNameChance).toBe(0.5);
      expect(world.balance.fuel.pricePerLitre).toBe(15);
      expect(world.balance.fuel.consumptionPerLy).toBe(8);
      expect(world.balance.missions.boardCountMin).toBe(2);
      expect(world.balance.missions.deliveryChance).toBe(0.7);
      expect(world.balance.trading.stockTtlMs).toBe(60000);
      expect(world.balance.missions.missionTtlMs).toBe(300000);
      expect(world.balance.reputation.levelFriendlyMin).toBe(50);
      expect(world.balance.reputation.tradeModifierRevered).toBe(0.70);
      expect(world.balance.reputation.repPerCredit).toBe(0.02);
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
