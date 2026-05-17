# 053 · BaseChoiceScene — DONE

## What it added

New `BaseChoiceScene` abstract base class for screens presenting rich content with a fixed set of choices anchored at the bottom. Replaced the spacer-line hack in `MissionDetailScene` with a clean, reusable pattern. Choices are cursor-navigable with UP/DOWN (wrap-around, skip disabled), SELECT activation, and tap-to-activate; BACK always calls the back callback regardless of cursor position.

## Key files

- `src/game/scenes/base-choice-scene.ts` — abstract base class and `ChoiceItem` interface
- `src/game/scenes/base-choice-scene.test.ts` — 22 unit tests covering all navigation and rendering
- `src/game/scenes/mission-detail-scene.ts` — migrated to extend `BaseChoiceScene` (no caller changes)
- `src/game/scenes/mission-detail-scene.test.ts` — updated for new layout; all tests passing

## Architectural decisions embedded

- Layout computed dynamically: `contentBottom = (screenBottom - choicesHeight - 1) - 1` ensures separator and choices always fit above footer, regardless of choice count or detail lines per choice.
- `BACK` is handled at `preHandleAction` level, ensuring it always triggers regardless of cursor state or menu state — consistent with game-wide BACK semantics.
- `ChoiceItem` details are always visible (not hover-only), making choice area height deterministic and rendering straightforward.
