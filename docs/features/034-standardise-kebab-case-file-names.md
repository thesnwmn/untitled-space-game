# 034 · Standardise Kebab-Case File Names

**Goal:** Rename all PascalCase source files in `src/` to kebab-case so that files sort consistently and every test file is alphabetically adjacent to its implementation.

**Acceptance criteria:**

- Every `.ts` and `.css` file under `src/` uses kebab-case naming (words separated by hyphens, all lowercase).
- Every test file sits immediately next to its implementation file when sorted (e.g. `base-menu-scene.test.ts` follows `base-menu-scene.ts`).
- `npx tsc --noEmit` passes with zero errors after the rename.
- `npm test` passes with zero failures after the rename.
- `npm run build` succeeds after the rename.
- `npm run terminal` runs without errors after the rename.
- All import paths in `src/` and `terminal.ts` reference the new kebab-case file names.
- Git history is preserved for each renamed file (use `git mv`, not delete-and-create).
- `DECISION_REGISTER.md` is updated to reflect `player-state.ts` (not `PlayerState.ts`) for the planned feature 033 file.

**Out of scope:**

- Renaming TypeScript class, interface, or type identifiers — only file names change.
- Renaming directories.
- Changing import aliases or re-export shapes.
- Any behaviour, UI, or gameplay change.

**Technical notes:**

Use `git mv <old> <new>` for each file to preserve history. Update all import paths immediately after; TypeScript will catch any missed references via `npx tsc --noEmit`.

**Complete rename map — 25 files:**

| Old path | New path |
|---|---|
| `src/game/scenes/BaseMenuScene.ts` | `src/game/scenes/base-menu-scene.ts` |
| `src/game/scenes/BaseMenuScene.test.ts` | `src/game/scenes/base-menu-scene.test.ts` |
| `src/game/scenes/InSystemTravelAnimationScene.ts` | `src/game/scenes/in-system-travel-animation-scene.ts` |
| `src/game/scenes/JumpAnimationScene.ts` | `src/game/scenes/jump-animation-scene.ts` |
| `src/game/scenes/MainMenuScene.ts` | `src/game/scenes/main-menu-scene.ts` |
| `src/game/scenes/MissionBoardScene.ts` | `src/game/scenes/mission-board-scene.ts` |
| `src/game/scenes/ShipScene.ts` | `src/game/scenes/ship-scene.ts` |
| `src/game/scenes/SpaceStation.ts` | `src/game/scenes/space-station.ts` |
| `src/game/scenes/SpaceStation.test.ts` | `src/game/scenes/space-station.test.ts` |
| `src/game/scenes/Starfield.ts` | `src/game/scenes/starfield.ts` |
| `src/game/scenes/Starfield.test.ts` | `src/game/scenes/starfield.test.ts` |
| `src/game/scenes/StationMenuScene.ts` | `src/game/scenes/station-menu-scene.ts` |
| `src/game/scenes/StoryScene.ts` | `src/game/scenes/story-scene.ts` |
| `src/game/scenes/TraderScene.ts` | `src/game/scenes/trader-scene.ts` |
| `src/game/scenes/TravelMenuScene.ts` | `src/game/scenes/travel-menu-scene.ts` |
| `src/game/ui/ScreenChrome.ts` | `src/game/ui/screen-chrome.ts` |
| `src/game/ui/ScreenChrome.test.ts` | `src/game/ui/screen-chrome.test.ts` |
| `src/platform/dom/DOMInputHandler.ts` | `src/platform/dom/dom-input-handler.ts` |
| `src/platform/dom/DOMInputHandler.test.ts` | `src/platform/dom/dom-input-handler.test.ts` |
| `src/platform/dom/DOMRenderer.ts` | `src/platform/dom/dom-renderer.ts` |
| `src/platform/dom/DOMRenderer.test.ts` | `src/platform/dom/dom-renderer.test.ts` |
| `src/platform/terminal/TerminalInputHandler.ts` | `src/platform/terminal/terminal-input-handler.ts` |
| `src/platform/terminal/TerminalInputHandler.test.ts` | `src/platform/terminal/terminal-input-handler.test.ts` |
| `src/platform/terminal/TerminalRenderer.ts` | `src/platform/terminal/terminal-renderer.ts` |
| `src/platform/terminal/TerminalRenderer.test.ts` | `src/platform/terminal/terminal-renderer.test.ts` |

**Files requiring import path updates:**

- `src/main.ts` — 11 import paths
- `terminal.ts` (root) — 11 import paths
- `src/game/scenes/*.ts` — scene files that import `BaseMenuScene`, `SpaceStation`, `Starfield`, or `ScreenChrome`
- `src/game/ui/screen-chrome.ts` — if it imports from scenes
- `src/platform/dom/dom-input-handler.ts` and `dom-renderer.ts` — if they import from shared or scenes
- `src/platform/terminal/terminal-input-handler.ts` and `terminal-renderer.ts` — if they import from shared or scenes
- All `*.test.ts` files that import their corresponding implementation by path

After all renames and import updates, run `npx tsc --noEmit` to confirm zero missed references.

**Enforce going forward:**

Add a one-line convention note to `CLAUDE.md` under a new "Conventions" section:
> File names use kebab-case (`my-module.ts`). Class and interface names inside files remain PascalCase per TypeScript convention.

Also update the `DECISION_REGISTER.md` player-state row to reference `src/game/player-state.ts` so feature 033's Engineer uses the correct file name.

**Dependencies:** None — pure refactor, no gameplay features required first.
