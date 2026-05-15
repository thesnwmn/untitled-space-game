# Feature 035 · Landing/Take-Off Animations and Terminology

## Goal

Replace dock/undock terminology with land/take-off for surface and asteroid
destinations, add distinct text-based landing and take-off animations for each
destination type, and unify all animation scenes behind a shared
`BaseTransitionScene` that keeps the screen chrome visible with context-aware
header labels.

---

## Acceptance criteria

- `ShipScene` shows `[L] LAND` instead of `[D] DOCK` when the current
  destination has `locationType === 'surface'` or `locationType === 'asteroid'`;
  `[D] DOCK` still appears for orbital/deep-space destinations.
- `StationMenuScene` footer nav shows `TAKE OFF` instead of `UNDOCK` for
  surface/asteroid destinations; `UNDOCK` still appears for orbital/deep-space.
- Clicking LAND at a surface destination shows `SurfaceLandingAnimationScene`
  (≈ 2 500 ms), then navigates to the station hub.
- Clicking LAND at an asteroid destination shows `AsteroidLandingAnimationScene`
  (≈ 2 500 ms), then navigates to the station hub.
- Clicking TAKE OFF from a surface destination shows `SurfaceTakeOffAnimationScene`
  (≈ 1 500 ms), then navigates back to the ship cockpit view.
- Clicking TAKE OFF from an asteroid destination shows
  `AsteroidTakeOffAnimationScene` (≈ 1 500 ms), then navigates back to the ship
  cockpit view.
- `JumpAnimationScene` and `InSystemTravelAnimationScene` are refactored to
  extend `BaseTransitionScene` with no visible behaviour change to the player.
- All six animation scenes (2 refactored + 4 new) render the `ScreenChrome`
  header and an empty footer nav row (colons only, no buttons).
- Chrome header row 0 during jump shows `IN TRANSIT`; row 1 destination slot is
  blank (credits still visible).
- Chrome header row 1 during in-system travel shows `IN TRANSIT` in the
  destination slot.
- Chrome header during all landing/take-off animations shows the current system
  name and the destination name (default chrome behaviour — no override needed).
- All existing animation scene tests continue to pass; new scenes have tests
  covering chrome label content and the animation title/frame text.
- `ScreenChrome` tests cover the new `systemLabel` and `destinationLabel`
  override fields.
- `ShipScene` tests cover LAND vs DOCK label selection by `locationType`.
- `StationMenuScene` tests cover TAKE OFF vs UNDOCK label selection by
  `locationType`.

---

## Out of scope

- Changing the in-system travel animation that already plays when the player
  arrives at any destination via the travel menu (that animation remains
  `InSystemTravelAnimationScene` regardless of destination type).
- Take-off triggering `player.undock()` — the player remains docked until FLY
  INTO SPACE is selected from the travel menu.
- Any change to jump, travel, or fly-into-space animation durations.
- Visual divergence between orbital DOCK and surface LAND in the cockpit view
  beyond the button label.

---

## Technical notes

### 1 · `ChromeConfig` label overrides (`screen-chrome.ts`)

Add two optional fields to the existing `ChromeConfig` interface:

```
systemLabel?: string | null
destinationLabel?: string | null
```

Behaviour contract:
- `undefined` (field absent) → use current default: read system/destination name
  from `player`.
- `null` → render a blank label (no text in that slot; credits row still renders
  normally in row 1).
- Any `string` → display that string verbatim in the appropriate header slot.

`ScreenChrome` already reads from `player.systemId` and `player.destinationId`
inside `renderHeaderRow0` / `renderHeaderRow1`. The override check is a simple
guard before those lookups: if the override field is not `undefined`, use it
instead.

---

### 2 · `BaseTransitionScene` (new file: `src/game/scenes/base-transition-scene.ts`)

New abstract class implementing `Scene`. Owns a `ScreenChrome`, elapsed timer,
and `arrived` guard.

Constructor signature:
```
(player: PlayerState, context: GameContext, duration: number, onComplete: () => void)
```

Public/protected surface:
- `update(dt)` — advances elapsed; fires `onComplete` exactly once when
  `elapsed >= duration`.
- `render(buffer)` — clears buffer to black; calls
  `chrome.render(buffer, getChromeConfig())`; calls `renderContent(buffer)`.
- `getChromeConfig(): ChromeConfig` — returns default config
  `{ showHeader: true, showFooter: true, navOptions: [] }` with no label
  overrides. Subclasses override this method to inject `systemLabel` /
  `destinationLabel` as needed.
- `renderContent(buffer: CharBuffer): void` — **abstract**. Subclasses render
  their animation text into the content area (rows `CONTENT_TOP` through
  `contentBottom(h, true) - 1`).

The `elapsed` value is available as a `protected` field so subclasses can drive
frame selection in `renderContent`.

---

### 3 · Refactoring `JumpAnimationScene` and `InSystemTravelAnimationScene`

Both scenes extend `BaseTransitionScene`. Their constructor signatures change:

**`JumpAnimationScene`**
Was: `(targetSystemName: string, onArrival: () => void)`
Becomes: `(player: PlayerState, context: GameContext, onArrival: () => void)`

The target system name is derived at render time from
`getSystem(player.systemId)?.name`. This is valid because `game.ts` calls
`player.jumpTo(targetSystemId)` before constructing the scene, so
`player.systemId` is already the destination system.

Override `getChromeConfig()` to return `systemLabel: 'IN TRANSIT'` and
`destinationLabel: null`.

**`InSystemTravelAnimationScene`**
Was: `(destinationName: string, onArrival: () => void, footerText?: string)`
Becomes: `(player: PlayerState, context: GameContext, onArrival: () => void, targetLabel?: string)`

The `targetLabel` optional parameter covers the "OPEN SPACE" case in
`goToFlyIntoSpace`, where `player.destinationId` is `null` after
`player.undock()`. When `targetLabel` is absent, the scene derives the
destination name from `getDestination(player.destinationId)?.name`. When
`targetLabel` is provided, it is used verbatim in the content area.

Override `getChromeConfig()` to return `destinationLabel: 'IN TRANSIT'`.

---

### 4 · New animation scenes

Four new files, each extending `BaseTransitionScene`. All use the default
`getChromeConfig()` (no chrome overrides — the chrome reads system and
destination name from `player`, which is already correct at the time these
scenes are constructed).

| File (in `src/game/scenes/`) | Trigger | Duration |
|---|---|---|
| `surface-landing-animation-scene.ts` | LAND at surface destination | 2 500 ms |
| `asteroid-landing-animation-scene.ts` | LAND at asteroid destination | 2 500 ms |
| `surface-take-off-animation-scene.ts` | TAKE OFF from surface destination | 1 500 ms |
| `asteroid-take-off-animation-scene.ts` | TAKE OFF from asteroid destination | 1 500 ms |

Constructor signature for all four:
```
(player: PlayerState, context: GameContext, onComplete: () => void)
```

> suggestion: animation frame flavour for each scene
>
> Surface landing — header: `[ LANDING SEQUENCE ]`, animated frames suggest
> descent (e.g. `▼` / `▼▼` / `▼▼▼` or ASCII equivalents), footer countdown
> `TOUCHDOWN IN Xs`.
>
> Asteroid landing — header: `[ APPROACH LOCKED ]`, frames suggest forward
> motion/clamping (`> ` / `>>` / `>>>`), footer `CLAMPING IN Xs`.
>
> Surface take-off — header: `[ LIFTOFF SEQUENCE ]`, frames suggest ascent
> (`^` / `^^` / `^^^`), footer `CLEAR IN Xs`.
>
> Asteroid take-off — header: `[ RELEASING CLAMPS ]`, frames suggest release/
> departure, footer `DEPARTING IN Xs`.

---

### 5 · `ShipScene` label changes

`ShipScene` already retrieves `dest` from `getDestination(player.destinationId)`
when not in space. Derive a flag from
`dest.locationType === 'surface' || dest.locationType === 'asteroid'`.

Change the active dock button label:
- landing destination → `[L] LAND`
- other → `[D] DOCK`

The disabled (in-space) form is always `[ - ] DOCK` because when `inSpace` is
`true` there is no destination and the flag is always false.

No constructor signature change to `ShipScene`.

---

### 6 · `StationMenuScene` nav label change

`StationMenuScene` already calls `getDestination(destinationId)`. Derive the
undock label from `dest.locationType`:
- `'surface'` or `'asteroid'` → label `'TAKE OFF'`
- all others → label `'UNDOCK'`

The nav option `id` remains `'undock'` (unchanged) so that `handleNavTap`
continues to work without modification.

---

### 7 · `game.ts` routing

Add two private routing methods that inspect
`getDestination(player.destinationId)?.locationType` and select the appropriate
scene:

**`goToLandOrDock()`** — called as the dock callback from `goToShip()`:
- `'surface'` → `SurfaceLandingAnimationScene` → `goToStation()`
- `'asteroid'` → `AsteroidLandingAnimationScene` → `goToStation()`
- all others → call `goToStation()` directly (no animation, existing behaviour)

**`goToTakeOffOrUndock()`** — passed as the `onShip` callback to
`StationMenuScene` via `goToStation()`:
- `'surface'` → `SurfaceTakeOffAnimationScene` → `goToShip()`
- `'asteroid'` → `AsteroidTakeOffAnimationScene` → `goToShip()`
- all others → call `goToShip()` directly (no animation, existing behaviour)

The existing `onDestinationSelected`, `goToFlyIntoSpace`, and `onJumpSelected`
methods are updated only to pass `player` and `context` to the refactored
animation scene constructors — their logic is otherwise unchanged.

---

## Dependencies

None — all required types and world data are already present.
