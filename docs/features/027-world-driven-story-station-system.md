# 027 · World-Driven Story, Station, and System Display

## Goal

Replace all hardcoded world content — story intro text, station name, and
location label — with live lookups from the world data module, so that every
piece of text the player sees is authored in `docs/world/` rather than scattered
across scene source files.

---

## Player-visible changes

| Screen | Before | After |
|---|---|---|
| Story intro | Hardcoded Hugo text | `opening-arrival` beat from `getStoryBeatsByTrigger('game-start')` |
| Station hub | "ELYSIUM STATION" constant | `getDestination(id).name` + description + danger level |
| Ship exterior | "Location: ELYSIUM STATION" | "ELYSIUM STATION  ·  SOL" — destination + system name |
| Trader / Mission Board NavBar | "ELYSIUM STATION" constant | `getDestination(id).name` |

---

## Acceptance criteria

- `StoryScene` renders the text body of the `opening-arrival` story beat. The
  hardcoded Hugo lines are gone.
- The year header `"YEAR  2284"` still appears centred in `bright-yellow` at
  row 2, sourced from the first paragraph of the beat text.
- `StationMenuScene` shows the destination's description (2–3 wrapped lines)
  below the `===` rule and a `DANGER: <LEVEL>` indicator below that.
- `ShipScene` row 1 shows `<DESTINATION NAME>  ·  <SYSTEM NAME>` in
  `bright-cyan`, sourced from world data.
- `TraderScene` and `MissionBoardScene` NavBar titles come from
  `getDestination(id).name` — no `STATION_NAME` import.
- `STATION_NAME` is no longer imported by any scene file.
- `wrapText(text: string, maxWidth: number): string[]` is exported from
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
3. If the first paragraph matches `/^YEAR\s+\d{4}$/` (trimmed), store it as
   `yearHeader: string` and skip it in body rendering. Otherwise
   `yearHeader = ''`.
4. For each remaining paragraph: normalise internal newlines to spaces
   (`paragraph.replace(/\n/g, ' ')`), then call `wrapText(paragraph, 36)` to
   get an array of lines. Collect all lines, inserting one blank string `''`
   between paragraph groups.
5. Store the result as `bodyLines: string[]`.

In `render()`:

- Write `yearHeader` centred in `bright-yellow` at row 2 (same position as
  today). If `yearHeader` is empty, skip.
- Starting at `row = 4`, iterate `bodyLines`. For `''` entries advance the row
  counter. For non-empty entries call `writeText(buffer, row, 2, line, 'white',
  'black')` and advance. Stop if `row` would reach `h - 4` (leave space for the
  hint).

The hint line stays at `h - 3`, unchanged.

### StationMenuScene (`src/game/scenes/StationMenuScene.ts`)

Change the constructor signature:

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  destinationId: string,      // ← replaces implicit STATION_NAME
  onTrader: () => void,
  onMissionBoard: () => void,
  onShip: () => void,
)
```

Inside the constructor:

```typescript
const dest = getDestination(destinationId)!;
// NavBar title uses dest.name.toUpperCase() instead of STATION_NAME.toUpperCase()
// Store for render:
this.descLines = wrapText(dest.description, 36).slice(0, 3);
this.dangerLevel = dest.dangerLevel;
```

In `render()` (after `super.render()`):

- Write `this.descLines` starting at row 5, col 2, fg `bright-black`.
- Write `DANGER: ${this.dangerLevel.toUpperCase()}` at row `5 + this.descLines.length + 1`,
  col 2, fg `bright-black`.

Remove the `STATION_NAME` import.

### ShipScene (`src/game/scenes/ShipScene.ts`)

Change the constructor signature:

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  destinationId: string,      // ← new required param
  onDock: () => void,
)
```

Inside the constructor:

```typescript
const dest = getDestination(destinationId)!;
const sys  = getSystem(dest.system)!;
this.locationLabel = `${dest.name.toUpperCase()}  ·  ${sys.name.toUpperCase()}`;
```

In `render()`, replace the hardcoded location line:

```typescript
// was: `Location: ${STATION_NAME.toUpperCase()}`
writeText(buffer, LOCATION_ROW, 1, this.locationLabel, 'bright-cyan', 'black');
```

Remove the `STATION_NAME` import.

### TraderScene (`src/game/scenes/TraderScene.ts`)

Replace the `STATION_NAME` import with a `destinationId: string` constructor
parameter. Use `getDestination(destinationId)!.name.toUpperCase()` as the
NavBar title string.

### MissionBoardScene (`src/game/scenes/MissionBoardScene.ts`)

Same change as TraderScene.

### `src/game/constants.ts`

After verifying no scene imports `STATION_NAME`, remove the export entirely.
Any remaining orchestrator use (if any) must be replaced with the world data
lookup before removal.

---

## Orchestrator changes (`src/main.ts` and `src/terminal.ts`)

Add a constant:

```typescript
const STARTING_DESTINATION = 'elysium-station';
```

Pass it wherever these scenes are constructed:

- `new ShipScene(inputHandler, context, STARTING_DESTINATION, onDock)`
- `new StationMenuScene(inputHandler, context, STARTING_DESTINATION, onTrader, onMissionBoard, onShip)`
- `new TraderScene(inputHandler, context, STARTING_DESTINATION, onHub, onUndock)`
- `new MissionBoardScene(inputHandler, context, STARTING_DESTINATION, onHub, onUndock)`

`StoryScene` needs no parameter — it reads `getStoryBeatsByTrigger('game-start')[0]`
directly, requiring no caller input.

Both orchestrator files must be updated in sync.

---

## Tests required

### `src/shared/buffer-utils.test.ts` (new tests, same file)

- `wrapText('', 36)` returns `[]`.
- `wrapText('hello', 36)` returns `['hello']`.
- Single long word returns that word on its own line (no truncation).
- Multiple words wrapping correctly at the boundary.
- A word sequence that exactly fills `maxWidth` fits on one line.

### `src/game/scenes/story-scene.test.ts` (updated)

- Renders year header from world data at row 2 (bright-yellow, centred).
- Renders at least one body line from world data below row 4.
- Does **not** render the hardcoded Hugo string `"Hugo poured"` anywhere.
- `onContinue` / tap behaviour tests unchanged.

### `src/game/scenes/station-menu-scene.test.ts` (updated)

- Constructor accepts `destinationId` string.
- NavBar title row shows `"ELYSIUM STATION"` (from `getDestination` not from constant).
- Description lines appear at row 5 in `bright-black`.
- `DANGER:` line appears below description in `bright-black`.

### `src/game/scenes/ship-scene.test.ts` (updated)

- Constructor accepts `destinationId` string.
- Row 1 contains both the destination name and the system name.

### `src/game/scenes/trader-scene.test.ts` and `mission-board-scene.test.ts` (updated)

- Constructor accepts `destinationId` string.
- NavBar title matches destination name from world data, not the old constant.

---

## Out of scope

- `station-arrive` story beats (need game state tracking — future feature).
- Any system or faction data displayed beyond the name (economy, factions, tags).
- `first-jump` beat rendering (belongs to the jump animation flow in Feature 026).
- Loading markdown at runtime (Feature 020).
- Dynamic destination selection (Feature 026 — Jump System).

---

## Interaction with Feature 026

Feature 026 (Jump System) planned to add `destinationName: string` parameters
to `StationMenuScene`, `TraderScene`, and `MissionBoardScene`. This feature
supersedes that plan: the scenes receive `destinationId: string` instead, which
is richer. When Feature 026 is implemented, the Engineer must update the
orchestrators to pass `currentDestinationId` (the dynamic variable) in place of
the hardcoded `STARTING_DESTINATION` constant — no scene constructor signatures
need to change.

---

## Dependencies

- **019 · World Data TypeScript Types** — `getDestination`, `getSystem`,
  `getStoryBeatsByTrigger` must be available before this feature can be built.
