# 018 · World Data Schemas & Seed Content

## Goal

Establish canonical markdown schemas for every world entity type and populate
`docs/world/` with seed content covering the four starting systems, their
destinations, factions, ships, jump routes, tradeable commodities, and story
beats — giving every future game scene a concrete, navigable world to draw from.

## Acceptance criteria

- `docs/world/systems/` contains docs for: `sol`, `alpha-centauri`,
  `barnards-star`, `wolf-359`. Each has valid front matter matching the system
  schema (id, name, star_type, distance_from_sol, zone, security, population,
  economy, major_factions, destinations, tags, danger_level, player_knowledge)
  and a prose body.
- `docs/world/destinations/` contains a `_template.md` and one doc per
  destination referenced in any system doc: `elysium-station`,
  `galileo-transfer`, `tycho-orbital`, `mars-anchor`, `new-horizon-port`,
  `hestia-ring`, `redline-station`, `kepler-yard`, `drift-market`,
  `blackwake-yard`. Each destination doc has: id, name, system, location_type
  (orbital/surface/asteroid/deep-space), type (civilian/military/black-market/
  research), amenities (five boolean fields), npcs.trader (when
  amenities.trader is true), goods_bias, danger_level, tags, and a prose body.
- `docs/world/factions/` contains docs for: `terran-union`, `helios-directorate`,
  `centauri-trade-league`, `independent-miners-guild`, `free-captains`,
  `grey-market-cartel`. Each has valid front matter matching the faction schema
  and a prose body.
- `docs/world/ships/` contains docs for three ships: `freighter`, `scout`,
  `hauler`. Each has id, name, class, cost, cargo_capacity_kg, fuel_capacity_l,
  hull_points, default_jump_drive (references a drive id from jump-drives.md),
  tags, and a prose body.
- `docs/world/commodities.md` lists all tradeable goods in a `commodities` front
  matter array. Each entry has: id, name, base_price, category, legal, weight_kg,
  description. At least 12 commodities covering categories: raw-material,
  manufactured, consumable, contraband.
- `docs/world/navigation/jump-routes.md` lists all traversable routes between
  the four systems. Every route references only system ids that have a system doc.
  Routes are bidirectional (each direction listed once; the game treats them as
  traversable both ways). Each route has: from, to, distance, stability, security.
- The filename `alpha-centurai.md` is corrected to `alpha-centauri.md`.
- `barnards-star.md` uses `population: medium` (not `moderate`).
- `galaxy-map.md` is updated to include front matter listing all system ids by zone.
- `docs/world/story/` contains a `_template.md` and at least three seed beats:
  `opening-arrival` (trigger: `game-start`), `first-jump` (trigger:
  `first-jump`), `enter-wolf-359` (trigger: `system-enter:wolf-359`). Each beat
  doc has: id, title, trigger, type, skippable, player_knowledge, and a body
  containing the story text shown to the player.
- No orphan references: every system id in any destination's `system` field,
  every faction id in any system's `major_factions` list, and every destination
  id in any system's `destinations` list resolves to an actual document.
  Every route endpoint resolves to a system doc.

## Out of scope

- Parsing or loading these files at runtime (Feature 020).
- TypeScript types or static data modules (Feature 019).
- Prices computed from supply/demand; base_price is the only price field here.
- Planet or moon sub-documents; celestial bodies are described in prose only.
- Any code changes.

## Schemas

### System (`docs/world/systems/<id>.md`)

```yaml
---
id: string                  # kebab-case, matches filename
name: string
star_type: string           # spectral class e.g. "G2V"
distance_from_sol: number   # light years
zone: core | frontier | outer

security: none | low | medium | high
population: none | low | medium | high | massive
danger_level: none | low | medium | high | extreme
player_knowledge: public | private

economy:                    # list of economy tags (strings)
  - string
major_factions:             # list of faction ids
  - string
stations:                   # list of station ids
  - string
tags:                       # list of descriptive tags
  - string
---
```

Body sections: short summary paragraph, `## Major Bodies`, `## Major Stations`,
optionally `## Governance`, `## History`, `## Local Reputation`.

### Destination (`docs/world/destinations/<id>.md`)

```yaml
---
id: string                  # kebab-case, matches filename
name: string
system: string              # system id
location_type: orbital | surface | asteroid | deep-space
type: civilian | military | black-market | research

amenities:
  trader: boolean
  mission_board: boolean
  ship_repair: boolean
  fuel: boolean
  ship_dealer: boolean

npcs:                       # only include entries for present amenities
  trader: string            # NPC display name, if amenities.trader is true

goods_bias:                 # economy tags that shift commodity prices here
  - string

danger_level: none | low | medium | high | extreme
tags:
  - string
---
```

Body: one or two paragraphs describing the destination's atmosphere and character.

### Story Beat (`docs/world/story/<id>.md`)

```yaml
---
id: string
title: string               # internal label, not shown to player
trigger: string             # when this fires: "game-start", "first-jump",
                            # "system-enter:<id>", "station-arrive:<id>",
                            # "mission-complete:<id>"
type: intro | discovery | mission | system-enter | station-arrive | combat-end | custom
location: string            # optional: station or system id (context-sensitive beats)
skippable: boolean
player_knowledge: public | private
---
```

Body: the story text shown to the player. Use short paragraphs — the game
renders in a narrow terminal grid. Each paragraph becomes a screen block.

### Faction (`docs/world/factions/<id>.md`)

```yaml
---
id: string
name: string
type: government | corporation | criminal | guild | independent
home_system: string         # system id
size: small | medium | large
influence:                  # system ids where this faction operates
  - string
tags:
  - string
---
```

Body: summary paragraph, optionally `## Governance`, `## Notable Events`,
`## Reputation`.

### Ship (`docs/world/ships/<id>.md`)

```yaml
---
id: string
name: string
class: freighter | scout | hauler | fighter
cost: number                # credits
cargo_capacity_kg: number
fuel_capacity_l: number
hull_points: number
default_jump_drive: string  # drive id from jump-drives.md
tags:
  - string
---
```

Body: one paragraph describing the ship's character and typical use.

### Commodity (entries inside `docs/world/commodities.md`)

Front matter is a single `commodities` array:

```yaml
---
commodities:
  - id: string
    name: string
    base_price: number      # credits per unit
    category: raw-material | manufactured | consumable | contraband
    legal: boolean
    weight_kg: number       # per unit
    description: string
---
```

Body: brief introductory paragraph about trade in this universe.

### Jump Route (entries inside `docs/world/navigation/jump-routes.md`)

Front matter is a single `routes` array (already established, extended here):

```yaml
---
routes:
  - from: string            # system id
    to: string              # system id
    distance: number        # light years
    stability: stable | unstable | dangerous
    security: none | low | medium | high
---
```

## Technical notes

- The `elysium-station` doc ties the hardcoded `STATION_NAME` constant in
  `src/game/constants.ts` to a real world entity. Its `system` is `sol`,
  `location_type` is `orbital`, and `npcs.trader` is `Merchant Kess` (matching
  the hardcoded trader in `TraderScene`). Feature 019 can wire them without
  changing any game code.
- `goods_bias` tags on destinations mirror values from `economy` lists on systems.
  Game logic (future) computes actual prices as `base_price × system_modifier ×
  station_modifier` using these tags. No pricing logic is in scope here.
- Jump routes are treated as bidirectional by the game. Each route is listed once.

## Dependencies

None — this is pure documentation.
