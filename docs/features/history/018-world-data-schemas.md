# 018 · World Data Schemas & Seed Content — DONE

## What it added
Established canonical markdown schemas for every world entity type and populated `docs/world/` with seed content covering four star systems (Sol, Alpha Centauri, Barnard's Star, Wolf 359), ten destinations, six factions, three ships, tradeable commodities (12+), jump routes, and three story beats. No code changes — pure documentation.

## Key files
- `docs/world/systems/` — sol, alpha-centauri, barnards-star, wolf-359
- `docs/world/destinations/` — elysium-station and nine others; `_template.md`
- `docs/world/factions/` — six faction docs
- `docs/world/ships/` — freighter, scout, hauler
- `docs/world/commodities.md` — front-matter array of 12+ commodities
- `docs/world/navigation/jump-routes.md` — bidirectional jump routes between the four systems
- `docs/world/story/` — opening-arrival, first-jump, enter-wolf-359 beats; `_template.md`

## Architectural decisions embedded
- `elysium-station` destination ties the hardcoded `STATION_NAME` constant to a real world entity; `npcs.trader = "Merchant Kess"` matches the hardcoded trader in TraderScene.
- Jump routes are bidirectional but listed once each.
- `goods_bias` tags on destinations mirror `economy` tags on systems for future price modifiers.
- `player_knowledge: public | private` reserved for fog-of-war mechanics.
