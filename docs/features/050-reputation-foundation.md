# Feature 050 · Reputation — Foundation (Data & UI)

## Goal

Establish the reputation data model, faction relationship config, and a Reputation screen in the global menu so players can see their standing with every eligible faction.

---

## Acceptance criteria

- `Destination` interface in `types.ts` gains `owningFactionId?: string`; `world-parser.ts` reads an optional `owning_faction` front-matter field and populates it; the destination `_template.md` documents the field
- All existing destination markdown files are updated with `owning_faction` where appropriate (station and outpost types operated by a known faction); destinations with no clear single operator omit the field
- `StationMenuScene` summary info displays the owning faction name when `owningFactionId` is present on the current destination (e.g. a line reading `OPERATED BY: TERRAN UNION`); no change when absent
- `Faction` interface in `types.ts` gains `rivals: string[]` and `allies: string[]`, both defaulting to `[]` if absent from front-matter
- All 8 faction markdown files are updated with `rivals` and `allies` YAML fields per the relationships in Technical notes
- `world-parser.ts` reads `rivals` and `allies` from faction front-matter
- A `src/game/reputation-utils.ts` module exposes:
  - `isReputationEligible(faction: Faction): boolean` — true when `size` is `'medium'` or `'large'`
  - `getReputationLevel(points: number, balance: GameBalance): number` — returns an integer in the range -2..3 using thresholds from `balance.reputation`
  - `getReputationLabel(level: number): string` — returns one of `HATED` / `UNFRIENDLY` / `NEUTRAL` / `FRIENDLY` / `LIKED` / `REVERED`
- `PlayerState` stores a reputation score (integer) per eligible faction ID, all initialised to `0` at new-game time, serialised and deserialised with save state; missing eligible factions in loaded save data are back-filled with `0`
- `PlayerState` exposes `getFactionReputation(factionId: string): number` and `modifyFactionReputation(factionId: string, delta: number, balance: GameBalance): void`; `modifyFactionReputation` clamps the result within `balance.reputation.pointsMin` and `balance.reputation.pointsMax`
- A `ReputationScene` is added and accessible from the global menu as `REPUTATION`
- The scene lists all eligible factions with name and standing label; factions not yet interacted with show `NEUTRAL`
- The standing label is coloured to reflect the level (hostile levels in a warning colour, positive levels in a highlight colour, neutral in default)
- `npm test` passes; `npx tsc --noEmit` passes

---

## Out of scope

- Any gameplay effect of reputation (prices, mission access, knowledge unlocks)
- Mission integration (rep gain / loss on completion)
- Ship destruction rep loss (no combat system)
- Individual faction detail screens

---

## Technical notes

### `Destination` type change

Add `owningFactionId?: string` to the `Destination` interface. The parser maps `owning_faction` (snake_case front-matter) to this field. The field is optional; downstream code must guard for its absence.

> suggestion: `owning_faction: terran-union` in destination front-matter YAML

### Suggested faction relationships

Rivals should be symmetric: if A lists B as a rival, B's file must list A. Allies should likewise be symmetric. The parser does not enforce this; world-data authors are responsible for consistency.

| Faction | Rivals | Allies |
|---|---|---|
| Terran Union | Grey Market Cartel, Free Captains | Eridani Colonial Council |
| Centauri Trade League | Independent Miners Guild | Procyon Institute |
| Helios Directorate | Eridani Colonial Council | _(none)_ |
| Eridani Colonial Council | Helios Directorate | Terran Union, Independent Miners Guild |
| Free Captains | Terran Union | Grey Market Cartel |
| Grey Market Cartel | Terran Union | Free Captains |
| Independent Miners Guild | Centauri Trade League | Eridani Colonial Council |
| Procyon Institute | _(none)_ | Centauri Trade League |

### `PlayerState` changes

Private `_factionReputation: Map<string, number>` initialised at construction by iterating `getWorld().factions`, filtering to eligible factions, and seeding each to `0`. `toJSON()` converts it to a plain object; the load path reconstructs the map and back-fills any eligible factions missing from saved data with `0`.

`modifyFactionReputation` clamps to `balance.reputation.pointsMin` / `balance.reputation.pointsMax` silently.

### `reputation-utils.ts`

All threshold and limit values come from the `GameBalance` object passed as a parameter — no module-level constants. This keeps the module testable with arbitrary balance values and ensures a single source of truth in `balance.md`.

### `ReputationScene`

Extends `BaseMenuScene`. Display-only — no selectable actions on rows. Opened from global menu; `[1] BACK` returns to the global menu. Faction ordering: large factions first, then medium; alphabetical within each tier.

> suggestion: row format `TERRAN UNION ·················· NEUTRAL`

### `StationMenuScene` addition

When the current destination has `owningFactionId` set, add a summary line showing the faction name. This is a read-only display; no interaction is required.

> suggestion: `OPERATED BY: TERRAN UNION` as a dimmed summary line below the destination name

---

## Play-test instructions

### Browser (`npm run dev`)

1. Start a new game and open the global menu — confirm `REPUTATION` appears as an entry.
2. Open the Reputation screen — confirm all 8 factions are listed with `NEUTRAL` standing.
3. Dock at a station with a known owning faction — confirm the faction name appears in the station menu summary.
4. Dock at a destination with no owning faction — confirm no faction line appears in the station menu.

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

Feature 046 (Base Scene Architecture), Feature 047 (Game Balance Settings)
