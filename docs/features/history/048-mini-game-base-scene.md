# 048 · Mini-Game Base Scene — DONE

## What it added
Added `BaseMiniGameScene` as the universal abstract base for all mini games, extending `BaseScene`. It provides optional viewport centering (for canvases smaller than the full content area), result reporting via a guarded `complete()` method with a typed `MiniGameResult` callback, and read-only `PlayerState` access inherited from `BaseScene`. Added `miniGameDescriptors` (pure-data array) and `miniGameRegistry` (with factory functions) in `src/game/mini-games/registry.ts`, both initially empty.

## Key files
- `src/shared/types.ts` — added `NavOption` (relocated from `screen-chrome.ts`), `MiniGameResult`, `MiniGameViewport`, `MiniGameVariant`, `MiniGameDescriptorMeta`, `MiniGameOptions`
- `src/game/ui/screen-chrome.ts` — removed `NavOption` definition; imports from `types.ts` and re-exports for backward compatibility
- `src/game/scenes/base-mini-game-scene.ts` — abstract class; `renderContent` computes centred viewport and delegates to abstract `renderGame`; `complete()` is double-call guarded
- `src/game/mini-games/registry.ts` — `miniGameDescriptors`, `MiniGameEntry`, `miniGameRegistry`
- `src/game/scenes/base-mini-game-scene.test.ts` — 5 tests

## Architectural decisions embedded
- `NavOption` moved to `src/shared/types.ts` and re-exported from `screen-chrome.ts` to allow `MiniGameOptions` to live in `types.ts` without introducing a circular dependency (`types.ts` → `screen-chrome.ts` → `types.ts`).
- `renderContent` is implemented (not abstract) in `BaseMiniGameScene`; subclasses extend via `renderGame(buffer, viewport)` — TypeScript lacks `final` but the pattern is enforced by convention.
