# Feature 039 · Global Menu & Mission Log

## Goal

Wire the dormant `[M] MENU` chrome button to open a new tabbed `GlobalMenuScene`, with a `MISSIONS` tab showing active missions and allowing cancellation via a modal dialog.

---

## Acceptance criteria

- A new `'MENU'` value is added to the `GameAction` union and mapped to the `M` key in both browser and terminal input handlers
- `ScreenChrome` gains a `hitTestHeader(col, row): string | null` method that returns `'menu'` when the tap lands on the `[M]` text area in header row 0, and `null` otherwise
- `GlobalMenuScene` is a new scene with four tabs: `MISSIONS`, `SHIP`, `PLAYER`, `OPTIONS`; LEFT/RIGHT switches tabs
- `SHIP`, `PLAYER`, and `OPTIONS` tabs each display a single centred placeholder row (e.g. "COMING SOON") and are not interactive
- The `MISSIONS` tab lists all `player.activeMissions`; each entry shows type icon, title, delivery destination, and reward on one line, with a status sub-line coloured by `MissionStatus` (`pending-pickup` / `needs-supplies` → `yellow`; `in-transit` → `bright-black`; `ready-to-deliver` → `bright-green`)
- When the `MISSIONS` tab is empty, a single disabled row reads "NO ACTIVE MISSIONS"
- Selecting a mission on the `MISSIONS` tab opens a `ModalConfirmDialog` showing the mission title as the modal title and the mission description as body text
- The modal has two buttons: `OKAY` (closes modal, no action) and `CANCEL MISSION` (calls `player.cancelMission(id)`, closes modal, mission disappears from list)
- Pressing BACK or the `[1] CLOSE` nav option from `GlobalMenuScene` returns to the scene that was active before the menu was opened
- The `MENU` game action and header tap are handled in: `ShipScene`, `StationMenuScene`, `TraderScene`, `MissionBoardScene`, `CargoScene`; pressing M in any of these scenes opens `GlobalMenuScene`
- `Game` stores the previous scene and restores it when `GlobalMenuScene` calls its `onClose` callback
- `ModalConfirmDialog` is a new reusable UI component (not a scene) usable from any `BaseMenuScene` via the existing `openModal` / `closeModal` mechanism
- `npx tsc --noEmit` passes; `npm test` passes with tests covering tab navigation, empty/populated mission list, and modal cancel flow

---

## Out of scope

- COLLECT / DELIVER station actions (feature 040)
- Content for SHIP, PLAYER, OPTIONS tabs
- Mission status auto-refresh while the menu is open (status reflects the moment the scene is entered)

---

## Technical notes

### `GameAction` extension (`src/shared/types.ts`)

Add `'MENU'` to the `GameAction` union. Map it to `M` in both `src/browser/input-handler.ts` and `src/terminal/input-handler.ts`.

### `ScreenChrome.hitTestHeader`

The `[M]` text is rendered at a fixed column range in row 0 (derived from the existing `renderHeaderRow0` logic). `hitTestHeader` computes those columns from `buffer` width and returns `'menu'` if `row === 0` and `col` falls in that range. Scenes call this in their tap handlers alongside `hitTestNav`.

### `ModalConfirmDialog` (`src/game/ui/modal-confirm-dialog.ts`)

An interface-compatible alternative to `ModalInputDialog` (both implement a common `Modal` interface used by `BaseMenuScene.openModal`). Properties:

```typescript
interface ModalConfirmDialogOptions {
  title: string;
  body: string;           // word-wrapped to modal width
  confirmLabel: string;   // e.g. "OKAY"
  cancelLabel?: string;   // omit for single-button (info-only) modal
  onConfirm: () => void;
  onCancel?: () => void;
}
```

Renders a centred box with title, body text, and one or two footer buttons. Navigation between buttons uses LEFT/RIGHT or TAB; SELECT activates the focused button.

### `GlobalMenuScene` (`src/game/scenes/global-menu-scene.ts`)

Constructor:
```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  player: PlayerState,
  onClose: () => void,
)
```

Uses `BaseMenuScene`'s tab support (LEFT/RIGHT switching). The `MISSIONS` tab populates items from `player.activeMissions` each time the tab is activated. Cancellation opens a `ModalConfirmDialog` via `openModal`.

### `Game` changes

Add `private sceneBeforeMenu: Scene | null = null`. In the `onMenu` handler (called by all supported scenes), store `this.currentScene` in `sceneBeforeMenu`, then set `currentScene` to a new `GlobalMenuScene` with `onClose: () => this.returnFromMenu()`. `returnFromMenu` restores `sceneBeforeMenu` (guard against null with a fallback to `goToShip`).

Each supported scene's constructor gains an `onMenu: () => void` callback parameter. `Game` passes `() => this.goToGlobalMenu()` (a new private method).

> suggestion: tab header rendering
> ```
> [MISSIONS] SHIP  PLAYER  OPTIONS
> ─────────────────────────────────────
> ```
> Active tab label in `bright-white`; inactive in `bright-black`.
