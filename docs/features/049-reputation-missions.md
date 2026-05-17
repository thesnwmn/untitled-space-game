# Feature 049 · Reputation — Mission Integration

## Goal

Missions from eligible factions display their faction affiliation and reputation impacts; completing them shifts the player's standing with the giving faction, its allies, and its rivals.

---

## Acceptance criteria

- `MissionGenerator` populates `giverFactionId` for missions generated at destinations whose `owningFactionId` resolves to a reputation-eligible faction; destinations with no `owningFactionId` produce missions without faction affiliation
- On mission completion, a rep delta is computed from the mission's credit reward bucketed into three tiers (SMALL / MEDIUM / LARGE), with tier boundaries and delta amounts as named constants
- The giving faction receives `+delta`
- Each ally of the giving faction receives `+floor(delta / 2)`
- Each direct rival of the giving faction receives `-floor(delta / 2)`; the rival's own allies are unaffected
- Rep propagation is implemented in a testable helper `computeReputationDeltas(givingFaction: Faction, delta: number, allFactions: Faction[]): Map<string, number>` in `reputation-utils.ts`; the caller in `game.ts` iterates the returned map and calls `playerState.modifyFactionReputation` for each entry
- `MissionDetailScene` shows a `REPUTATION IMPACT` section when `giverFactionId` is present, listing each affected faction with a `+SMALL` / `+MEDIUM` / `+LARGE` / `-SMALL` / `-MEDIUM` / `-LARGE` label — raw numbers are never shown
- `MissionBoardScene` includes the faction name on mission list entries when `giverFactionId` is present
- When `giverFactionId` is absent, no rep changes occur and no reputation section appears; existing behaviour is fully preserved
- `npm test` passes; `npx tsc --noEmit` passes

---

## Out of scope

- Reputation gating access to missions
- Reputation modifying mission credit rewards
- Rep gain from refusing or abandoning a mission
- Rep gain from accepting a mission

---

## Technical notes

### Rep propagation rule summary

| Recipient | Delta |
|---|---|
| Giving faction | `+delta` |
| Each ally of giving faction | `+floor(delta / 2)` |
| Each direct rival of giving faction | `-floor(delta / 2)` |

### Display labels in `MissionDetailScene`

Each row in the REPUTATION IMPACT section shows one faction and one signed label. The label magnitude for allies and rivals reflects their actual delta (floor(delta/2)), which will typically be one tier below the giving faction's label. The Engineer decides the exact tier-to-label bucketing for secondary recipients.

> suggestion:
> ```
> REPUTATION IMPACT
>   TERRAN UNION          +MEDIUM
>   ERIDANI COL. COUNCIL  +SMALL
>   GREY MARKET CARTEL    -SMALL
>   FREE CAPTAINS         -SMALL
> ```

### `computeReputationDeltas`

Returns a `Map<string, number>` of factionId → net delta. `PlayerState.modifyFactionReputation` already clamps at band limits, so no clamping is needed in the helper.

---

## Play-test instructions

### Browser (`npm run dev`)

1. Visit a mission board at a faction-owned station — confirm the faction name appears on mission entries.
2. Open a mission detail — confirm the REPUTATION IMPACT section lists the giving faction, allies, and rivals with appropriate signed labels.
3. Complete the mission — open the Reputation screen and confirm standing shifted correctly for the giving faction, its allies, and its rivals.
4. Visit a mission board at a destination with no owning faction — confirm no reputation section appears in mission details and no faction name appears on board entries.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

Feature 048 (Reputation — Foundation)
