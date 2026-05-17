# 051 · Reputation — Mission Integration — DONE

## What it added

Missions at faction-owned destinations now carry a `giverFactionId`. On completion, a reputation delta (bucketed into SMALL/MEDIUM/LARGE tiers based on reward) is applied to the giving faction, half that delta to its allies, and negative half to its rivals. `MissionDetailScene` previews the reputation impact with signed tier labels, and `MissionBoardScene` displays the faction name on mission entries.

## Key files

- `src/game/reputation-utils.ts` — `getMissionTierLabel`, `computeReputationDeltas` helper
- `src/game/mission-generator.ts` — populates `giverFactionId` for reputation-eligible faction-owned destinations
- `src/game/scenes/mission-board-scene.ts` — displays `[Faction Name]` on mission entries
- `src/game/scenes/mission-detail-scene.ts` — shows REPUTATION IMPACT section with affected factions and deltas
- `src/game/scenes/station-menu-scene.ts` — applies reputation deltas on mission completion via `computeReputationDeltas`
- `src/game/world/types.ts` — `MissionBase.giverFactionId?: string` field added

## Architectural decisions embedded

Rep delta is computed deterministically from mission reward using the same tier buckets (`missionTierMediumReward`, `missionTierLargeReward`) used for UI preview — ensures mission detail screen accurately reflects the actual impact on completion. Deltas are clamped via existing `PlayerState.modifyFactionReputation` logic.
