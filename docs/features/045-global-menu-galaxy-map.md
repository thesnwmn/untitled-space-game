# Feature 045 · Global Menu · Galaxy Map

> **Prerequisite**: feature 039 (Global Menu Shell) must be built first.

## Goal

Add a `GALAXY MAP` entry to the global menu so the player can access the star chart from anywhere in the game, not just from the travel screen.

---

## Acceptance criteria

- A `GALAXY MAP` entry appears in `GlobalMenuScene` below the `MISSIONS` entry; selecting it opens `GalaxyMapScene`
- The `GALAXY MAP` entry is always present regardless of the player's current location or game state
- When opened from the global menu, the footer shows `[1] BACK` (returns to `GlobalMenuScene`) and `[2] GAME` (returns directly to the underlying game scene)
- When opened from the travel menu (existing path), footer remains `[1] BACK` only — no change to existing behaviour
- All existing `GalaxyMapScene` behaviours (MAP/ROUTE tabs, search, navigation, chart re-centering) are preserved unchanged
- `npx tsc --noEmit` passes; `npm test` passes with tests covering: `[2] GAME` nav option present when `onGame` is provided, absent when not provided, `NAV_2` action calls `onGame`, and `NAV_2` is a no-op when `onGame` is absent

---

## Out of scope

- Adding `MENU` action / `[M]` header tap handling to `GalaxyMapScene` — MENU wiring is a top-level game screen concern; the galaxy map is a utility sub-scene reachable via two paths
- Any changes to the travel menu access path

---

## Technical notes

### `GalaxyMapScene` change (`src/game/scenes/galaxy-map-scene.ts`)

Add an optional final constructor parameter `onGame?: () => void`. Existing callers pass nothing and require no change at their call sites.

If `onGame` is provided, `navOptions` in `render()` includes a second entry `{ id: 'game', label: 'GAME' }`. The tap handler checks `hitTestNav` for `'game'`, and the action handler responds to `'NAV_2'`. Both call `onGame()`, guarded by the existing `activated` flag.

### `Game` changes (`src/game/game.ts`)

`goToGlobalMenu()` adds a `GALAXY MAP` entry after `MISSIONS` in the assembled entry list:

```typescript
{ label: 'GALAXY MAP', action: () => this.goToGalaxyMapFromMenu() }
```

New method `goToGalaxyMapFromMenu()`: creates a `GalaxyMapScene` with `onBack: () => this.goToGlobalMenu()` and `onGame: () => this.returnFromMenu()`.

Existing `goToGalaxyMap()` (the TravelMenuScene path) is unchanged.

---

## Dependencies

- Feature 039 · Global Menu Shell
