# 050 · Reputation — Foundation (Data & UI) — DONE

## What it added

Added faction relationships (`rivals`, `allies`) to world data and an optional `owning_faction` field to destinations. `PlayerState` stores a per-faction reputation score (clamped to balance thresholds) for all eligible (medium/large) factions, initialised to 0 at new-game time. A `ReputationScene` accessible from the global menu shows each eligible faction's standing label, and `StationMenuScene` displays the owning faction when one is set.

## Key files

- `src/game/reputation-utils.ts` — `isReputationEligible`, `getReputationLevel`, `getReputationLabel`
- `src/game/scenes/reputation-scene.ts` — new global-menu screen
- `src/game/player-state.ts` — `_factionReputation` map, `getFactionReputation`, `modifyFactionReputation`
- `src/game/world/types.ts` — `Destination.owningFactionId`, `Faction.rivals`, `Faction.allies`
- `src/game/world/world-parser.ts` — parses `owning_faction`, `rivals`, `allies` from front-matter
- `docs/world/factions/*.md` — all 8 faction docs updated with relationship fields
- `docs/world/destinations/*.md` — 18 destination docs updated with `owning_faction` where applicable

## Architectural decisions embedded

All reputation threshold and limit values are read from `GameBalance` (passed as a parameter to utils functions) rather than hardcoded — consistent with the pattern established in feature 047.
