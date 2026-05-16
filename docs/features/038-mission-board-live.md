# Feature 038 · Mission Board Live

## Goal

Replace the hardcoded placeholder `MissionBoardScene` with a live, generated mission list, and add a `MissionDetailScene` where the player can read mission details and accept a mission.

---

## Acceptance criteria

- `Game` holds a `missionBoardCache` (same shape as `traderStockCache`) keyed by `destinationId` with a TTL of 15 minutes
- Cache entries contain a `specs: MissionSpec[]` array and a `generatedAt` timestamp; a cache miss calls `MissionGenerator.generateMissions` with the destination, world data, and a fresh random seed
- When a mission is accepted, it is removed from the cached `specs` array immediately (board does not show it again until the cache expires)
- `MissionBoardScene` is rewritten to pull its list from the cache via a `getMissions()` callback passed at construction
- The board displays type icon (`[D]` delivery, `[S]` supply) in `bright-yellow`, mission title, and reward right-aligned in `bright-green`; giver name appears as a sub-line in `dim` or `bright-black`
- If the board has no missions (cache empty or all accepted), a single disabled row reads "NO MISSIONS AVAILABLE"
- Selecting a mission navigates to `MissionDetailScene` via an `onMissionSelected(spec)` callback
- `MissionDetailScene` displays: type, giver name and optional faction, mission title, item/supply requirements, cargo availability check, word-wrapped description, and reward
- Cargo availability: shows free capacity vs required weight in `bright-green` if sufficient, `red` if not
- The ACCEPT nav option is disabled and visually dim when `canAcceptMission` returns `{ ok: false }`; the `reason` string appears as a detail sub-line
- Accepting calls the appropriate `PlayerState.acceptMission` with `giveItemNow = true` when the pickup location equals the issuing destination and cargo space is available; otherwise `giveItemNow = false`
- After acceptance the detail scene returns to the mission board, where the mission is no longer listed
- The BACK nav option from `MissionDetailScene` returns to the board without accepting
- `npx tsc --noEmit` passes; `npm test` passes with tests covering board rendering with empty and populated caches, and detail scene acceptance/rejection paths

---

## Out of scope

- Mission cancellation (feature 039)
- COLLECT / DELIVER station actions (feature 040)
- The `[M] MENU` global menu wiring (feature 039)

---

## Technical notes

### `Game` changes

Add `missionBoardCache: Map<string, { specs: MissionSpec[]; generatedAt: number }>` analogous to `traderStockCache`. Add `getOrCreateMissionBoard(destinationId): MissionSpec[]` private method. Pass this as a callback to `MissionBoardScene`:

```typescript
getMissions: () => MissionSpec[]
onMissionAccepted: (spec: MissionSpec) => void
```

`onMissionAccepted` in `Game` removes the spec from the cache array and calls `player.acceptMission(spec, giveItemNow)`.

### `MissionBoardScene` rewrite

Constructor signature changes: drop the hardcoded `MISSIONS` array; add `getMissions: () => MissionSpec[]`, `onMissionSelected: (spec: MissionSpec) => void`. The board calls `getMissions()` once on construction to populate items.

The `onMissionSelected` callback navigates `Game` to `MissionDetailScene`.

### `MissionDetailScene` (new, `src/game/scenes/mission-detail-scene.ts`)

Extends `BaseMenuScene`. Constructor receives `spec: MissionSpec`, `player: PlayerState`, `onAccept: (giveItemNow: boolean) => void`, `onBack: () => void`.

> suggestion: layout (40 cols)
> ```
> MISSION BOARD
> ─────────────────────────────────────
> [D] DELIVER: Encrypted Data Core
>     from: Kira Tanaka [Merchant Guild]
>
> Pickup:  Sol Station, Sol
> Deliver: Proxima Base, Proxima Cen.
> Weight:  80 kg  (Free: 340 kg) ✓
>
> Retrieve a sealed data core and
> deliver it to the research team
> at Proxima Base.
>
> REWARD: 500 CR
> ─────────────────────────────────────
> [1] ACCEPT   [2] BACK
> ```

`giveItemNow` is computed in `Game` (or passed as a boolean) before calling `player.acceptMission`.
