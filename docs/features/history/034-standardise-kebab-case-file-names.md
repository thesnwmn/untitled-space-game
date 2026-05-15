# 034 · Standardise Kebab-Case File Names — DONE

## What it added
Renamed 25 PascalCase source files in `src/` to kebab-case using `git mv`, preserving full git history. All import paths in `src/main.ts`, `terminal.ts`, and every affected scene and test file were updated to match. A Conventions section was added to `CLAUDE.md` and the DECISION_REGISTER player-state row was updated to `src/game/player-state.ts` for feature 033.

## Key files
- All files under `src/game/scenes/`, `src/game/ui/`, `src/platform/dom/`, `src/platform/terminal/` renamed to kebab-case
- `src/main.ts` — 11 import paths updated
- `terminal.ts` — 11 import paths updated
- `CLAUDE.md` — Conventions section added
- `DECISION_REGISTER.md` — player-state path corrected
