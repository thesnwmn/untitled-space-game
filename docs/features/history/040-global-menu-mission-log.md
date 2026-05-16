# 040 · Global Menu · Mission Log — DONE

## What it added

A `MISSIONS` entry in `GlobalMenuScene` that opens `MissionLogScene`, where the player can review all active missions with colour-coded status sub-lines (`yellow` for pending/needs-supplies, `bright-black` for in-transit, `bright-green` for ready-to-deliver). Selecting a mission opens a new `ModalConfirmDialog` showing the mission title and description, with `OKAY` (dismiss) and `CANCEL MISSION` (removes mission from player state) buttons.

## Key files

- `src/game/ui/modal.ts` — new `Modal` interface shared by both dialog types
- `src/game/ui/modal-confirm-dialog.ts` — new `ModalConfirmDialog` component
- `src/game/scenes/mission-log-scene.ts` — new `MissionLogScene`
- `src/game/scenes/base-menu-scene.ts` — added `detailsFg` to `MenuItemDef`; `openModal` now accepts `Modal` interface
- `src/game/game.ts` — wired MISSIONS entry and `goToMissionLog()`
- `src/game/scenes/mission-log-scene.test.ts` — 19 tests

## Architectural decisions embedded

- `MissionLogScene` overrides `get items()` (a protected getter on `BaseMenuScene`) to compute mission rows dynamically from `player.activeMissions` on every render, keeping the list always current without a separate refresh call.
- `activateCurrent()` is overridden to NOT set `this.activated`, mirroring the `TraderScene` pattern, so the scene remains interactive after the modal closes.
- `ModalConfirmDialog.handleAction('BACK')` calls `onConfirm` (the safe/dismiss path) rather than `onCancel`, since `onCancel` is the destructive "CANCEL MISSION" action.
