# 027 · World-Driven Story, Station, and System Display

## Goal

Make every scene a generic renderer: no world content is hardcoded in scene
source files. All text, names, menus, visuals, and NPC references that vary
by destination come from `getDestination(id)` and related world data helpers.
The orchestrator chooses which destination to show; scenes just render what
the data says.

---

## Player-visible changes

| Screen | Before | After |
|---|---|---|
| Story intro | Hardcoded third-person Hugo text | `opening-arrival` beat from `getStoryBeatsByTrigger('game-start')` |
| Station hub title | `ELYSIUM STATION` constant | `destination.name` |
| Station hub menu | Always TRADER + MISSION BOARD | Only items whose `destination.amenities` flag is `true` |
| Station hub body | Empty space | `destination.description` + `DANGER: <level>` |
| Ship exterior location | `Location: ELYSIUM STATION` | `<DESTINATION>  ·  <SYSTEM>` |
| Ship exterior glyph | Always `RELAY` | Mapped from `destination.type` |
| Trader title | Hardcoded `MERCHANT KESS` | `destination.npcs.trader` |
| Trader / Mission Board NavBar | `ELYSIUM STATION` constant | `destination.name` |

---

## Acceptance criteria

- `StoryScene` renders text from the `opening-arrival` world beat. Hardcoded
  Hugo lines are gone from the source.
- Year header `"YEAR  2284"` appears centred in `bright-yellow` at row 2,
  extracted from the beat text.
- `StationMenuScene` hub menu shows only the amenities available at the
  destination — if `amenities.trader` is false, TRADER does not appear.
- `StationMenuScene` shows a wrapped description snippet and danger level
  sourced from world data.
- `ShipScene` row 1 shows `<DESTINATION>  ·  <SYSTEM>` from world data.
- `ShipScene` station glyph is chosen by `destination.type` via the mapping
  table below.
- `TraderScene` scene title shows the NPC name from `destination.npcs.trader`.
- `TraderScene` and `MissionBoardScene` NavBar titles come from
  `destination.name`.
- `STATION_NAME` is no longer imported by any scene file and is deleted from
  `src/game/constants.ts`.
- `wrapText(text: string, maxWidth: number): string[]` exported from
  `src/shared/buffer-utils.ts`.
- All updated scene tests pass. `tsc --noEmit` zero errors. `npm test` passes.

---

## New shared utility

### `wrapText` in `src/shared/buffer-utils.ts`

```typescript
export function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length === 0) {
      current = word;
    } else if (current.length + 1 + word.length <= maxWidth) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}
```

---

## Scene changes

### StoryScene (`src/game/scenes/StoryScene.ts`)

Remove `STORY_LINES`, `YEAR_HEADER`, and the `STATION_NAME` import.

In the constructor:

1. Call `getStoryBeatsByTrigger('game-start')` and take index `[0]`.
2. Split `beat.text` on `\n\n` to get raw paragraphs.
3. If the first paragraph (trimmed) matches `/^YEAR\s+\d{4}$/`, store it as
   `yearHeader: string` and exclude it from body rendering. Otherwise
   `yearHeader = ''`.
4. For each remaining paragraph: normalise internal newlines to spaces
   (`paragraph.replace(/\n/g, ' ')`), then call `wrapText(paragraph, 36)`.
   Collect all lines, inserting one blank string `''` between paragraph groups.
5. Store the result as `bodyLines: string[]`.

In `render()`:

- Write `yearHeader` centred in `bright-yellow` at row 2. Skip if empty.
- Starting at `row = 4`, iterate `bodyLines`. Blank strings advance the row
  counter. Non-blank strings call `writeText(buffer, row, 2, line, 'white',
  'black')`. Stop before `h - 4` to preserve hint space.

Hint line stays at `h - 3`, unchanged.

---

### StationMenuScene (`src/game/scenes/StationMenuScene.ts`)

New constructor signature:

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  destinationId: string,
  onTrader: () => void,
  onMissionBoard: () => void,
  onShip: () => void,
)
```

Menu items are built from `destination.amenities` at construction time:

```typescript
const dest = getDestination(destinationId)!;
const items: MenuItemDef[] = [];
if (dest.amenities.trader)       items.push({ label: 'TRADER',        action: onTrader });
if (dest.amenities.missionBoard) items.push({ label: 'MISSION BOARD', action: onMissionBoard });
```

Future amenities (`shipRepair`, `fuel`, `shipDealer`) are silently ignored
until their scenes exist — they will slot in here as new `if` branches with
no other changes.

The NavBar title uses `dest.name.toUpperCase()`.

In `render()` (after `super.render()`):

```typescript
this.descLines = wrapText(dest.description, 36).slice(0, 3);
// write descLines starting at row 5, col 2, fg 'bright-black'
// write `DANGER: ${dest.dangerLevel.toUpperCase()}` at row 5 + descLines.length + 1, col 2, fg 'bright-black'
```

Remove the `STATION_NAME` import.

---

### ShipScene (`src/game/scenes/ShipScene.ts`)

New constructor signature:

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  destinationId: string,
  onDock: () => void,
)
```

At construction time:

```typescript
const dest = getDestination(destinationId)!;
const sys  = getSystem(dest.system)!;
this.locationLabel = `${dest.name.toUpperCase()}  ·  ${sys.name.toUpperCase()}`;
this.stationType   = DESTINATION_TYPE_TO_STATION[dest.type] ?? STATION_TYPES.RELAY;
```

Station type mapping:

```typescript
const DESTINATION_TYPE_TO_STATION: Record<DestinationType, SpaceStationDef> = {
  civilian:     STATION_TYPES.HUB,
  military:     STATION_TYPES.RELAY,
  research:     STATION_TYPES.RING,
  'black-market': STATION_TYPES.BEACON,
};
```

In `render()`:

```typescript
// row 1 — replace hardcoded location string
writeText(buffer, LOCATION_ROW, 1, this.locationLabel, 'bright-cyan', 'black');

// station glyph — replace STATION_TYPES.RELAY with this.stationType
if (!this.station) {
  this.station = new SpaceStation(
    this.stationType,
    intRowStart, intRowEnd, intColStart, intColEnd,
  );
}
```

Remove the `STATION_NAME` import.

---

### TraderScene (`src/game/scenes/TraderScene.ts`)

New constructor signature (add `destinationId: string` before `onHub`):

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  destinationId: string,
  onHub: () => void,
  onUndock: () => void,
)
```

At construction time:

```typescript
const dest = getDestination(destinationId)!;
this.traderName = dest.npcs.trader?.toUpperCase() ?? 'TRADER';
// NavBar title: dest.name.toUpperCase()
```

Replace the hardcoded `this.trader = TRADERS[0]` — the trader name is now
`this.traderName`; the buy/sell lists remain the hardcoded `TRADERS[0]` data
for now (commodity wiring is a future feature). The scene title (`writeCentered`
at row 3) and its underline use `this.traderName` instead of `this.trader.name`.

Remove the `STATION_NAME` import.

---

### MissionBoardScene (`src/game/scenes/MissionBoardScene.ts`)

New constructor signature (add `destinationId: string`):

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  destinationId: string,
  onHub: () => void,
  onUndock: () => void,
)
```

Use `getDestination(destinationId)!.name.toUpperCase()` as the NavBar title.

Mission list stays hardcoded — no world data for missions exists yet.

Remove the `STATION_NAME` import.

---

### `src/game/constants.ts`

Delete the `STATION_NAME` export once all scene files are updated.

---

## Orchestrator changes (`src/main.ts` and `src/terminal.ts`)

Add:

```typescript
const STARTING_DESTINATION = 'elysium-station';
```

Pass `STARTING_DESTINATION` as `destinationId` to every scene construction:

- `new ShipScene(inputHandler, context, STARTING_DESTINATION, onDock)`
- `new StationMenuScene(inputHandler, context, STARTING_DESTINATION, onTrader, onMissionBoard, onShip)`
- `new TraderScene(inputHandler, context, STARTING_DESTINATION, onHub, onUndock)`
- `new MissionBoardScene(inputHandler, context, STARTING_DESTINATION, onHub, onUndock)`

`StoryScene` needs no parameter — it calls `getStoryBeatsByTrigger('game-start')`
directly.

Both orchestrator files must be updated and kept in sync.

---

## Tests required

### `src/shared/buffer-utils.test.ts` (additions to existing file)

- `wrapText('', 36)` returns `[]`.
- `wrapText('hello', 36)` returns `['hello']`.
- Single word longer than `maxWidth` returns that word alone (no truncation).
- Multi-word string wraps at word boundary within `maxWidth`.
- Words that exactly fill `maxWidth` stay on one line.

### `src/game/scenes/story-scene.test.ts` (updated)

- Year header from world data renders at row 2 in `bright-yellow` centred.
- At least one body line from world data appears below row 4 in `white`.
- The string `"Hugo poured"` does not appear anywhere in the buffer.
- `onContinue` and tap behaviour tests unchanged.

### `src/game/scenes/station-menu-scene.test.ts` (updated)

- Constructor accepts `destinationId`.
- NavBar title is `"ELYSIUM STATION"` from `getDestination`, not the deleted constant.
- When `amenities.trader === true`, a TRADER item appears in the menu.
- When `amenities.missionBoard === true`, a MISSION BOARD item appears.
- Description lines appear at row 5 in `bright-black`.
- `DANGER:` line appears below description in `bright-black`.
- A destination with `amenities.trader === false` does **not** show a TRADER item.

### `src/game/scenes/ship-scene.test.ts` (updated)

- Constructor accepts `destinationId`.
- Row 1 contains destination name and system name from world data.
- A `civilian` destination produces a `HUB` station glyph; a `military`
  destination produces a `RELAY` glyph.

### `src/game/scenes/trader-scene.test.ts` (updated)

- Constructor accepts `destinationId`.
- Scene title row shows NPC name from `destination.npcs.trader`.
- NavBar title shows destination name.

### `src/game/scenes/mission-board-scene.test.ts` (updated)

- Constructor accepts `destinationId`.
- NavBar title shows destination name from world data.

---

## Out of scope

- Commodity buy/sell lists sourced from world data (future trading feature).
- `station-arrive` story beats (need game-state tracking).
- `first-jump` beat (belongs to jump animation in Feature 026).
- System economy, faction, or tag data displayed in-scene.
- Loading world docs from markdown at runtime (Feature 020).
- Dynamic destination selection (Feature 026 — Jump System).

---

## Interaction with Feature 026

Feature 026 (Jump System) planned `destinationName: string` parameters on
`StationMenuScene`, `TraderScene`, and `MissionBoardScene`. This feature
supersedes that: scenes receive `destinationId: string` instead. When Feature
026 ships, the Engineer replaces `STARTING_DESTINATION` in the orchestrators
with `currentDestinationId` — no scene constructor signatures change.

---

## Dependencies

- **019 · World Data TypeScript Types** — `getDestination`, `getSystem`,
  `getStoryBeatsByTrigger` must exist before implementation begins.
