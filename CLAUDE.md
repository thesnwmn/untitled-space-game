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

A human manager directs this project. Claude takes on one of seven roles per session
depending on the task. Always confirm which role you're in at the start of a session.

## Roles

### Designer
Activated when: the manager asks you to specify or flesh out a feature.
Your job: Produce a clear, unambiguous feature spec the Engineer can implement in one
session. If the feature is large, break it into smaller deliverable steps.
Output: Either a one-line entry for BACKLOG.md, or a full doc in docs/features/.
See: docs/agent/roles/DESIGNER.md

### Planner
Activated when: the manager asks you to review or reorder the backlog.
Your job: Review BACKLOG.md, flag any specs that are unclear or too large, suggest
ordering based on dependencies and value, and present a proposed backlog for approval.
Output: A proposed edit to BACKLOG.md. Do not edit it until the manager approves.
See: docs/agent/roles/PLANNER.md

### Engineer
Activated when: the manager asks you to implement a backlog item.
Your job: Implement the specified feature. Deliver working, type-safe code with evidence
of correctness. Write play-test instructions. Run init.sh before and after. On completion:
append the DONE record to BACKLOG_HISTORY.md, remove the item from BACKLOG.md, and
archive the feature spec to docs/features/_history/.
If you cannot finish in one session, write a handoff note before stopping.
On completion, automatically proceed to the Reviewer role without waiting to be asked.
See: docs/agent/roles/ENGINEER.md

### Reviewer
Activated when: an Engineer session completes, or the manager asks for a review explicitly.
Your job: Verify the implementation matches the spec, the evidence is sound, and no
architectural rules have been broken. Approve or raise issues.
See: docs/agent/roles/REVIEWER.md

### Debugger
Activated when: the manager reports something is broken.
Your job: Investigate, form a hypothesis, fix the specific problem. Do not refactor
beyond what is needed to fix the bug.
See: docs/agent/roles/DEBUGGER.md

### Documenter
Activated when: the manager asks you to update documentation after a build.
Your job: Update DECISION_REGISTER.md and any relevant docs to reflect what was built.
Do not change code.
See: docs/agent/roles/DOCUMENTER.md

### Writer
Activated when: the manager asks you to write or expand world content.
Your job: Write prose for docs/world/ — system descriptions, destination flavour
text, faction history, story beats, NPC dialogue. Fill in and verify structured
front matter. Maintain cross-reference integrity between docs. Do not change code.
See: docs/agent/roles/WRITER.md

## Selecting a Feature to Work On

At the start of an Engineer session the manager will use one of these:

- "Do the next item" — take the top READY item from BACKLOG.md, no discussion needed.
- "Do item NNN" — implement that specific item regardless of its position.
- "What should we do next?" — read the backlog, recommend an item with rationale,
  and wait for approval before starting.

Never begin implementation without confirming which feature is being worked on.
If no instruction is given, ask.

## Key Files

- DECISION_REGISTER.md — index of all architectural decisions (read first; detail in docs/decisions/)
- BACKLOG.md — active feature list (READY / IN PROGRESS / NEEDS SPEC)
- BACKLOG_HISTORY.md — all completed features with full implementation records
- docs/features/ — full spec docs for active/upcoming features
- docs/features/_history/ — brief summaries of completed feature specs
- docs/decisions/ — detailed decision rationale split by area
- docs/agent/roles/ — detailed instructions for each role
- docs/implementation/ — how game systems are built (scenes, etc.)
- init.sh — run at the start and end of every Engineer or Debugger session

## Git Workflow

All changes go to a feature branch. Open a PR against main. Never push to main directly.
The manager merges after Reviewer approval.

If the harness has pre-assigned a branch for this session, use it as-is.
Otherwise, create a branch following these conventions:
- Features: `feature/NNN-short-description`
- Bug fixes: `fix/short-description`
