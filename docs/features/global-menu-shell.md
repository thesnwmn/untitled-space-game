# Feature · Global Menu Shell

> **Number TBD** — to be assigned and sequenced by the Planner. Must be built **before** feature 039.

## Goal

Give the player access to an expandable in-game menu, available at any time from the main game screens via the `[M]` chrome button or the `M` key. The menu starts empty; subsequent features each add their own entry. This feature establishes the wiring, navigation model, and return-to-game flow that all menu content will share.

The navigation model is **page-based**: the global menu is a flat list of choices, and each choice opens a dedicated full screen with its own back button. There are no tabs.

---

## Acceptance criteria

- A new `'MENU'` value is added to the `GameAction` union and mapped to the `M` key in both browser and terminal input handlers
- `ScreenChrome` gains a `hitTestHeader(col, row): string | null` method that returns `'menu'` when the tap lands on the `[M]` text area in header row 0, and `null` otherwise
- A new `GlobalMenuScene` exists; it accepts a list of menu entries and renders them as a vertical selectable list
- When the entry list is empty, `GlobalMenuScene` displays a single centred disabled row: `NO OPTIONS AVAILABLE`
- The footer shows `[1] GAME`; pressing it closes the menu and returns to the exact scene that was active before the menu opened
- Pressing BACK or `M` again from within `GlobalMenuScene` has the same effect as `[1] GAME`
- The `MENU` game action and header tap are handled in: `ShipScene`, `StationMenuScene`, `TraderScene`, `MissionBoardScene`, `CargoScene`
- `Game` stores the prior scene and restores it when the menu closes; if no prior scene is stored the fallback is the ship view
- `npx tsc --noEmit` passes; `npm test` passes with tests covering: empty menu state, entry list rendering, and close/restore flow

---

## Out of scope

- Any content entries in the menu (added by subsequent features)
- Tabs, sections, or grouped headers within the menu

---

## Technical notes

### `GameAction` extension (`src/shared/types.ts`)

Add `'MENU'` to the `GameAction` union. Map it to `M` in both `src/browser/input-handler.ts` and `src/terminal/input-handler.ts`.

### `ScreenChrome.hitTestHeader`

The `[M]` text is rendered at a fixed column range in row 0 (derived from the existing `renderHeaderRow0` logic). `hitTestHeader` computes those columns from `buffer` width and returns `'menu'` if `row === 0` and `col` falls in that range. Scenes call this in their tap handlers alongside `hitTestNav`.

### `GlobalMenuEntry` and `GlobalMenuScene` (`src/game/scenes/global-menu-scene.ts`)

```typescript
interface GlobalMenuEntry {
  label: string;
  action: () => void;
}
```

Constructor:

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  player: PlayerState,
  entries: GlobalMenuEntry[],
  onClose: () => void,
)
```

Extends `BaseMenuScene`. Maps `entries` to `MenuItemDef[]`. When `entries` is empty, inserts a single disabled placeholder item. The footer nav option is `[1] GAME`, which calls `onClose`. BACK and a second `M` press also call `onClose`.

### `Game` changes

Add `private sceneBeforeMenu: Scene | null = null`.

New method `goToGlobalMenu()`: stores `this.currentScene` in `sceneBeforeMenu`, then sets `currentScene` to a new `GlobalMenuScene` with the current entry list and `onClose: () => this.returnFromMenu()`.

New method `returnFromMenu()`: restores `sceneBeforeMenu` (fallback: `goToShip()`), then clears `sceneBeforeMenu`.

Each supported scene's constructor gains an `onMenu: () => void` callback parameter. `Game` passes `() => this.goToGlobalMenu()`.

The entry list passed to `GlobalMenuScene` starts empty and will be extended by future features — the Engineer should structure `goToGlobalMenu()` so entries are assembled at call time from a private helper, making it easy to add new entries later.
