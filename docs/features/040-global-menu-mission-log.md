# Feature 040 · Global Menu · Mission Log

> **Prerequisite**: feature 039 (Global Menu Shell) must be built first.
>
> **Note**: this spec replaces the original feature 039 (tabbed GlobalMenuScene). The mission log is now a dedicated scene added as an entry to the global menu shell; the tabbed layout and placeholder SHIP / PLAYER / OPTIONS tabs are removed.

## Goal

Add a `MISSIONS` entry to the global menu that opens a Mission Log screen, where the player can review their active missions and cancel them via a confirmation dialog.

---

## Acceptance criteria

- A `MISSIONS` entry appears in `GlobalMenuScene`; selecting it opens `MissionLogScene`
- `MissionLogScene` lists all `player.activeMissions`; each entry shows type icon, title, delivery destination, and reward on one line, with a status sub-line coloured by `MissionStatus`:
  - `pending-pickup` / `needs-supplies` → `yellow`
  - `in-transit` → `bright-black`
  - `ready-to-deliver` → `bright-green`
- When the list is empty, a single disabled row reads `NO ACTIVE MISSIONS`
- Selecting a mission opens a `ModalConfirmDialog` showing the mission title as the modal title and the mission description as body text
- The modal has two buttons: `OKAY` (closes modal, no action) and `CANCEL MISSION` (calls `player.cancelMission(id)`, closes modal, mission disappears from list)
- `MissionLogScene` footer: `[1] BACK` returns to `GlobalMenuScene`; `[2] GAME` returns directly to the underlying game scene
- `ModalConfirmDialog` is a new reusable UI component usable from any `BaseMenuScene` via the existing `openModal` / `closeModal` mechanism
- `npx tsc --noEmit` passes; `npm test` passes with tests covering: empty mission list, populated list with status colours, and the modal cancel flow

---

## Out of scope

- COLLECT / DELIVER station actions (feature 040)
- Mission status auto-refresh while the log is open (status reflects the moment the scene is entered)
- SHIP, PLAYER, and OPTIONS menu entries (future features)

---

## Technical notes

### `MissionLogScene` (`src/game/scenes/mission-log-scene.ts`)

Extends `BaseMenuScene`. Constructor:

```typescript
constructor(
  inputHandler: InputHandler,
  context: GameContext,
  player: PlayerState,
  onBack: () => void,    // returns to GlobalMenuScene
  onGame: () => void,    // returns to the underlying game scene
)
```

Footer nav: `[1] BACK` → `onBack()`; `[2] GAME` → `onGame()`.

Populates items from `player.activeMissions` each time the scene is entered. Each item's `details` line carries the status sub-line with appropriate colour. Selecting an item opens a `ModalConfirmDialog` via `openModal`.

### `ModalConfirmDialog` (`src/game/ui/modal-confirm-dialog.ts`)

A new component compatible with the existing `openModal` / `closeModal` mechanism in `BaseMenuScene` (both `ModalInputDialog` and `ModalConfirmDialog` should satisfy a shared `Modal` interface).

```typescript
interface ModalConfirmDialogOptions {
  title: string;
  body: string;           // word-wrapped to modal width
  confirmLabel: string;   // e.g. "OKAY"
  cancelLabel?: string;   // omit for single-button modals
  onConfirm: () => void;
  onCancel?: () => void;
}
```

Renders a centred box with title, body text, and one or two footer buttons. LEFT/RIGHT or TAB switches focus between buttons; SELECT activates the focused button.

### `Game` changes

`goToGlobalMenu()` is updated to include a `MISSIONS` entry alongside any existing entries:

```typescript
{ label: 'MISSIONS', action: () => this.goToMissionLog() }
```

New method `goToMissionLog()`: sets `currentScene` to a new `MissionLogScene` with `onBack: () => this.goToGlobalMenu()` and `onGame: () => this.returnFromMenu()`.
