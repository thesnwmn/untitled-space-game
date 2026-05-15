# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You are working on an ASCII terminal-style space game built with Vite + TypeScript
for browser, and Bun for terminal. Read DECISION_REGISTER.md for a quick-reference
index of all architectural decisions; pull detail files from docs/decisions/ only when
you need the full rationale for a specific area.

## Commands

```bash
bash init.sh                                       # full env check — run at start/end of Engineer/Debugger sessions
npm run dev                                        # Vite dev server (browser)
npm test                                           # run all tests (Vitest)
npx vitest run src/path/to/file.test.ts            # run a single test file
npx tsc --noEmit                                   # type check (must pass with zero errors)
npm run build                                      # production browser build (output to dist/game/)
npm run build:docs                                 # render world docs to dist/docs/ (after feature 022)
npm run build:map                                  # render galaxy map to dist/map/ (after feature 023)
npm run build:all                                  # full build: game + docs + map + landing page
npm run terminal                                   # run game in terminal via Bun
```

## How This Project Works

A human manager directs this project. Claude takes on one of seven roles per session.

## Roles

| Role | Activated when | See |
|---|---|---|
| **Designer** | Manager asks you to specify or flesh out a feature | docs/agent/roles/DESIGNER.md |
| **Planner** | Manager asks you to review or reorder the backlog | docs/agent/roles/PLANNER.md |
| **Engineer** | Manager asks you to implement a backlog item | docs/agent/roles/ENGINEER.md |
| **Reviewer** | An Engineer session completes, or manager asks for a review | docs/agent/roles/REVIEWER.md |
| **Debugger** | Manager reports something is broken | docs/agent/roles/DEBUGGER.md |
| **Documenter** | Manager asks you to update docs after a build | docs/agent/roles/DOCUMENTER.md |
| **Writer** | Manager asks you to write or expand world content | docs/agent/roles/WRITER.md |

Always confirm which role you're in at the start of a session. Read the role file before acting.

## Key Files

- DECISION_REGISTER.md — index of all architectural decisions (read first; detail in docs/decisions/)
- BACKLOG.md — active feature list (READY / IN PROGRESS / NEEDS SPEC)
- BACKLOG_HISTORY.md — all completed features with full implementation records
- docs/features/ — full spec docs for active/upcoming features
- docs/features/history/ — brief summaries of completed feature specs
- docs/decisions/ — detailed decision rationale split by area
- docs/agent/roles/ — detailed instructions for each role
- docs/implementation/ — how game systems are built (scenes, etc.)
- init.sh — run at the start and end of every Engineer or Debugger session

## Conventions

File names use kebab-case (`my-module.ts`). Class and interface names inside files remain PascalCase per TypeScript convention.

## Git Workflow

All changes go to a feature branch. Open a PR against main. Never push to main directly.
The manager merges after Reviewer approval.

If the harness has pre-assigned a branch for this session, use it as-is.
Otherwise, create a branch following these conventions:
- Features: `feature/NNN-short-description`
- Bug fixes: `fix/short-description`
