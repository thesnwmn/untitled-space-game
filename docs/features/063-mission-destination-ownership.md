# Feature 063 · Mission Destination Ownership & Generation

## Goal

Missions belong to specific destinations, are generated when the player docks (not when the board is opened), persist on `PlayerState` for save/restore, and each destination controls its own mission volume via per-destination `minMissions` and `missionChance` fields — driving players toward busier mission hubs.

---

## Acceptance criteria

- `Destination` gains `minMissions: number` and `missionChance: number`; `DestinationAmenities.missionBoard` is removed. World parser updated accordingly.
- All destination world files replace `mission_board:` with `min_missions:` and `mission_chance:` fields. Destinations that previously had `mission_board: false` get `min_missions: 0` and `mission_chance: 0.0`. Previously `true` destinations get values reflecting their role (see Technical notes).
- `PlayerState` stores a per-destination mission cache: `getDestinationMissions(id): MissionSpec[]`; `refreshDestinationMissions(id, specs): void`. The cache stores `generatedAt` timestamps alongside specs so TTL can be enforced.
- Mission generation is triggered in `Game` when the player docks, not when the board scene is opened. The `Game.missionBoardCache` field and its associated lazy-generation method are removed.
- `GameBalance.missions` replaces `boardCountMin`/`boardCountMax` with `boardMaxCount` (hard cap on total missions per destination, e.g. 10). The `missionTtlMs` param is retained.
- The generation algorithm uses `destination.minMissions` for a guaranteed baseline, then loops rolling `destination.missionChance` until either the roll fails or `boardMaxCount` is reached. Each generated mission follows the existing `deliveryChance` split.
- The station menu shows the MISSION BOARD entry only when `player.getDestinationMissions(currentDestId).length > 0`.
- `MissionBoardScene` receives the already-generated mission list directly (no lazy callback); the `getMissions: () => MissionSpec[]` constructor parameter becomes `missions: MissionSpec[]`.
- `npx tsc --noEmit` passes with zero errors; `npm test` passes with updated tests covering generation algorithm (min count respected, chance loop, boardMaxCount cap) and the conditional station menu entry.

---

## Out of scope

- Missions visible or accessible at destinations the player has not yet docked at.
- Player-facing UI showing mission counts before docking.
- Any change to mission content, rewards, or types.

---

## Technical notes

### `PlayerState` mission cache

Add a private `Map<string, { specs: MissionSpec[]; generatedAt: number }>` to `PlayerState`. Expose two methods:

- `getDestinationMissions(destinationId: string): MissionSpec[]` — returns cached specs if within TTL, otherwise empty array (generation is the caller's responsibility).
- `refreshDestinationMissions(destinationId: string, specs: MissionSpec[]): void` — stores specs with `generatedAt: Date.now()`.

TTL check: if `Date.now() - generatedAt > balance.missions.missionTtlMs`, treat as expired. The `Game` layer checks TTL on each dock and regenerates when stale.

### Generation algorithm

```
generate minMissions entries (each rolls delivery/supply via deliveryChance)
loop while total < boardMaxCount:
  roll rand() < missionChance
  if pass: generate one entry
  if fail: stop
```

The seed for a given destination+window is `hash(destinationId) ^ floor(Date.now() / missionTtlMs)` so results change across TTL windows but are stable within one. An LCG seed using XOR of a simple string hash and the window index is sufficient.

### Removing `amenities.missionBoard`

`DestinationAmenities.missionBoard` is removed from the type. The station menu scene currently checks `dest.amenities.missionBoard` to decide whether to render the MISSION BOARD button — replace this with a check against `player.getDestinationMissions(destinationId).length > 0`.

### World data defaults

> suggestion

Destinations that are natural mission hubs (busy civilian stations, major trade posts) should get `min_missions: 2` and `mission_chance: 0.75`. Standard destinations with a board: `min_missions: 0` and `mission_chance: 0.65`. Minor or specialised destinations: `min_missions: 0` and `mission_chance: 0.25`. Previously excluded destinations (e.g. raw industrial facilities, restricted military sites): `min_missions: 0` and `mission_chance: 0.0`. The Engineer should apply reasonable values per destination; exact world-data tuning is considered content work outside this feature's acceptance criteria.

---

## Play-test instructions

### Browser (`npm run dev`)

1. Start a new game and dock at the starting station.
2. If the station has missions, the MISSION BOARD button appears in the hub. If it has none (rare with a high `missionChance`), the button is absent — restart to verify both paths.
3. Open the mission board, note the missions. Undock and re-dock within the TTL window — same missions appear.
4. Travel to a destination with `mission_chance: 0.0` — no MISSION BOARD button.
5. Verify that a destination configured with `min_missions: 2` always shows at least two missions.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

None
