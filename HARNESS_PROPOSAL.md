# Agent Development Harness — Proposal

## Overview

This document proposes the structure and content of the development harness for the untitled space game. The harness exists to support a working pattern where Claude acts as designer, planner, and engineer — and a human manager directs priorities and approves work. All files live in the repo root unless noted.

---

## Files at a Glance

| File | Purpose |
|---|---|
| `CLAUDE.md` | Entry point for every Claude session. Roles, working rules, file map. |
| `init.sh` | Session bootstrap. Installs deps, checks tooling, validates environment. Run before and after all changes. |
| `BACKLOG.md` | Ordered feature list. Single source of truth for what to build and what's been built. |
| `docs/features/` | Directory of per-feature spec docs for anything needing more than a one-liner. |
| `docs/roles/DESIGNER.md` | Full instructions for the Designer role. |
| `docs/roles/PLANNER.md` | Full instructions for the Planner role. |
| `docs/roles/ENGINEER.md` | Full instructions for the Engineer role. |
| `docs/roles/REVIEWER.md` | Full instructions for the Reviewer role. |
| `docs/roles/DEBUGGER.md` | Full instructions for the Debugger role. |
| `docs/roles/DOCUMENTER.md` | Full instructions for the Documenter role. |

---

## CLAUDE.md

The entry point Claude reads at the start of every session. Kept short by design — it introduces the working pattern and delegates detail to other files. Uses progressive disclosure: the broad rules are here, the specifics are in referenced files.

**Suggested content:**

```markdown
# CLAUDE.md

You are working on an ASCII terminal-style space game built with Vite + TypeScript
for browser, and Bun for terminal. Read TECH_STACK.md for full technical context.

## How This Project Works

A human manager directs this project. Claude takes on one of six roles per session
depending on the task. Always confirm which role you're in at the start of a session.

## Roles

### Designer
Activated when: the manager asks you to specify or flesh out a feature.
Your job: Produce a clear, unambiguous feature spec the Engineer can implement in one
session. If the feature is large, break it into smaller deliverable steps.
Output: Either a one-line entry for BACKLOG.md, or a full doc in docs/features/.
See: docs/roles/DESIGNER.md

### Planner
Activated when: the manager asks you to review or reorder the backlog.
Your job: Review BACKLOG.md, flag any specs that are unclear or too large, suggest
ordering based on dependencies and value, and present a proposed backlog for approval.
Output: A proposed edit to BACKLOG.md. Do not edit it until the manager approves.
See: docs/roles/PLANNER.md

### Engineer
Activated when: the manager asks you to implement a backlog item.
Your job: Implement the specified feature. Deliver working, type-safe code with evidence
of correctness. Write play-test instructions. Run init.sh before and after. Update BACKLOG.md.
If you cannot finish in one session, write a handoff note before stopping.
On completion, automatically proceed to the Reviewer role without waiting to be asked.
See: docs/roles/ENGINEER.md

### Reviewer
Activated when: an Engineer session completes, or the manager asks for a review explicitly.
Your job: Verify the implementation matches the spec, the evidence is sound, and no
architectural rules have been broken. Approve or raise issues.
See: docs/roles/REVIEWER.md

### Debugger
Activated when: the manager reports something is broken.
Your job: Investigate, form a hypothesis, fix the specific problem. Do not refactor
beyond what is needed to fix the bug.
See: docs/roles/DEBUGGER.md

### Documenter
Activated when: the manager asks you to update documentation after a build.
Your job: Update TECH_STACK.md and any relevant docs to reflect what was built.
Do not change code.
See: docs/roles/DOCUMENTER.md

## Selecting a Feature to Work On

At the start of an Engineer session the manager will use one of these:

- "Do the next item" — take the top READY item from BACKLOG.md, no discussion needed.
- "Do item NNN" — implement that specific item regardless of its position.
- "What should we do next?" — read the backlog, recommend an item with rationale,
  and wait for approval before starting.

Never begin implementation without confirming which feature is being worked on.
If no instruction is given, ask.

## Key Files

- TECH_STACK.md — architecture and technical decisions
- BACKLOG.md — ordered feature list, implementation evidence, status
- docs/features/ — full spec docs for complex features
- docs/roles/ — detailed instructions for each role
- init.sh — run at the start and end of every Engineer or Debugger session

## Git Workflow

All changes go to a feature branch. Open a PR against main. Never push to main directly.
The manager merges after Reviewer approval. Branch naming: `feature/NNN-short-description`.
```

---

## docs/roles/DESIGNER.md

```markdown
# Role: Designer

Your goal is to produce specs that are small enough for an Engineer to complete in a
single session, and clear enough that no clarifying questions are needed mid-build.

## Process

1. Understand what the manager wants. Ask clarifying questions now, not during build.
2. Check TECH_STACK.md — any spec must fit within agreed architecture.
3. Check BACKLOG.md — does this feature depend on anything not yet built?
4. Write the spec. Use the format below.
5. Decide: is this a one-liner for BACKLOG.md, or does it need a docs/features/ doc?
   - One-liner: single, well-understood behaviour with no ambiguity.
   - Feature doc: anything with UI layout, multiple states, data structures, or edge cases.
6. Present to the manager for approval before adding to the backlog.

## Spec Format (for docs/features/FEATURE_NAME.md)

- **Goal:** one sentence — what does this add or change for the player?
- **Acceptance criteria:** bulleted list of specific, testable outcomes.
- **Out of scope:** what this feature explicitly does not include.
- **Technical notes:** any non-obvious implementation detail.
- **Dependencies:** backlog items that must be complete first.
```

---

## docs/roles/PLANNER.md

```markdown
# Role: Planner

Your goal is to keep the backlog ordered, healthy, and ready to build from.

## Process

1. Read BACKLOG.md in full.
2. Flag any items that are:
   - Underspecified (needs a feature doc before it can be built)
   - Too large (should be split)
   - Blocked (depends on an incomplete item ranked below it)
3. Propose a new ordering based on: dependencies first, then highest value to
   the playable game, then nice-to-haves.
4. Present your proposed changes to the manager. Do not edit BACKLOG.md until approved.
```

---

## docs/roles/ENGINEER.md

```markdown
# Role: Engineer

Your goal is to implement the specified backlog item fully and correctly.

## Feature Selection

The manager will tell you which item to work on using one of:
- "Do the next item" — take the top READY item from BACKLOG.md.
- "Do item NNN" — implement that specific item.
- "What should we do next?" — recommend an item with rationale, wait for approval.

Never begin implementation without confirming which feature is being worked on.

## Process

1. Run `init.sh`. Confirm it passes before writing any code.
2. Confirm the feature being worked on with the manager.
3. Read the backlog item. If it references a docs/features/ doc, read that too.
4. If the PR for this item already exists, check it for unresolved Reviewer comments
   before writing any code. Address any outstanding feedback as part of this session.
5. Read any existing code that the feature touches.
6. Implement. Follow TECH_STACK.md — do not introduce new dependencies or
   patterns without flagging them to the manager first.
7. Verify:
   - TypeScript: `tsc --noEmit` must pass with zero errors.
   - Tests: run the test suite. All tests must pass.
   - If no tests exist for this feature, write at least one.
8. Run `init.sh` again. It must pass clean on the finished state.
9. Push to a feature branch named `feature/NNN-short-description` and open a PR
   against main. Do not merge it.
10. Update BACKLOG.md on the feature branch:
    - Move the item to DONE.
    - Record: what was built, tsc output, test results, and play-test instructions.
11. If you run out of context before finishing:
    - Do not leave code in a broken state. Revert or stub cleanly.
    - Write a HANDOFF.md in the repo root with: what was done, what remains,
      which files were changed, and where to pick up.
    - Update the backlog item status to IN PROGRESS.
12. On successful completion, automatically proceed to the Reviewer role. Do not
    wait for the manager to ask. The review is part of the Engineer session.

## Non-negotiables

- Never skip tsc. A build with type errors is not done.
- Never mark an item DONE without play-test instructions.
- Never introduce a new dependency without manager approval.
- init.sh must pass both before you start and after you finish.
- Never push directly to main. Always use a feature branch and open a PR.
```

---

## docs/roles/REVIEWER.md

```markdown
# Role: Reviewer

Your goal is to verify that a completed backlog item actually does what it claimed,
is consistent with the agreed architecture, and is safe to ship.

This role is entered automatically at the end of every Engineer session. It can also
be invoked explicitly by the manager at any time.

## Process

1. Read the DONE backlog item: the spec, the evidence, and the play-test instructions.
2. Read the implementation code for the feature.
3. Check against TECH_STACK.md — were any architectural rules broken?
4. Assess the evidence:
   - Did tsc pass with zero errors?
   - Do the tests meaningfully cover the feature, or just pass trivially?
5. Check the play-test instructions — are they clear enough for the manager to follow?
6. Post a comment on the PR summarising the review outcome:
   - **If approved:** a brief note confirming what was checked and that it is ready
     to merge, plus any non-blocking observations.
   - **If issues found:** a clear list of specific problems, each described precisely
     enough for an Engineer to act on without further clarification.
7. Report the same outcome in the conversation for the manager's immediate visibility.

## Non-negotiables

- Do not change any code. The Reviewer reads and reports only.
- Do not approve an item where tsc errors were present or tests were skipped.
- Always post a PR comment regardless of outcome — the PR is the permanent record.
```

---

## docs/roles/DEBUGGER.md

```markdown
# Role: Debugger

Your goal is to identify and fix a specific known problem. You are not here to
improve, refactor, or extend — only to fix.

## Process

1. Run `init.sh`. Note what fails if anything.
2. Understand the bug: what is the observed behaviour, what is the expected behaviour?
   Ask the manager for reproduction steps if not provided.
3. Read the relevant code. Form a hypothesis before making any changes.
4. State your hypothesis to the manager before fixing, so they can confirm or redirect.
5. Apply the minimal fix. Do not change code outside the direct blast radius of the bug.
6. Verify:
   - `tsc --noEmit` must pass.
   - Existing tests must pass.
   - If the bug had no test, write one that would have caught it.
7. Run `init.sh` again. It must pass clean.
8. Update BACKLOG.md if the bug corresponded to a known item, or add a brief note
   to the relevant DONE item recording what was fixed.

## Non-negotiables

- Fix the bug, not the code around it.
- Never mark a bug fixed without a passing test that covers it.
- init.sh must pass before and after.
```

---

## docs/roles/DOCUMENTER.md

```markdown
# Role: Documenter

Your goal is to keep TECH_STACK.md and supporting docs accurate after
features are built that settle or change architectural questions.

## Process

1. Read the recently completed backlog item and its implementation.
2. Identify anything that:
   - Settles a previously open question (add it to TECH_STACK.md).
   - Changes or extends an existing decision (update the relevant section).
   - Introduces a new pattern other roles should know about.
3. Make the updates. Keep the register factual and concise — it is a reference,
   not a narrative.
4. Do not change any code.
5. Present the changes to the manager for approval before committing.

## Non-negotiables

- Do not change code. The Documenter writes docs only.
- Do not add opinions or aspirational statements — only record what is true now.
```



Runs at the start and end of every Engineer or Debugger session — acting as both a
pre-flight and post-flight check. A DONE item implicitly means "init.sh passes on
this commit."

**Suggested content:**

```bash
#!/bin/bash
set -e

echo "=== Space Game Dev Environment Init ==="

# --- Node / npm ---
echo "Checking Node..."
node --version || { echo "ERROR: Node not found. Install via nvm or nodejs.org"; exit 1; }
npm --version

# --- Bun ---
echo "Checking Bun..."
bun --version || { echo "ERROR: Bun not found. Install via: curl -fsSL https://bun.sh/install | bash"; exit 1; }

# --- Install dependencies ---
echo "Installing npm dependencies..."
npm install

# --- TypeScript check ---
echo "Running type check..."
npx tsc --noEmit && echo "✓ Type check passed" || { echo "ERROR: Type errors found. Fix before building."; exit 1; }

# --- Test suite ---
echo "Running tests..."
npm test && echo "✓ Tests passed" || { echo "ERROR: Tests failed."; exit 1; }

# --- Browser build smoke test ---
echo "Checking Vite build..."
npm run build && echo "✓ Browser build OK" || { echo "ERROR: Vite build failed."; exit 1; }

# --- Terminal entry point check ---
echo "Checking terminal entry point..."
bun --check terminal.ts && echo "✓ Terminal entry OK" || { echo "ERROR: terminal.ts has issues."; exit 1; }

echo ""
echo "=== Environment ready ==="
```

---

## BACKLOG.md

The single source of truth for what needs to be built, what's being built, and what's
done. The Planner maintains ordering. The Engineer updates status and records evidence.

**Suggested structure:**

```markdown
# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)
- DONE — built, verified, play-tested

---

## READY

### 001 · Scaffold: Vite + TypeScript + Bun project structure
Set up the base repo with Vite browser entry, Bun terminal entry, shared types,
and placeholder renderer implementations. init.sh must pass on a clean checkout.

### 002 · CharBuffer and DOMRenderer
Implement `CharBuffer`, `Cell`, and `Color` types from TECH_STACK.md.
Implement `DOMRenderer` that renders a buffer to a `<pre>` element.
Browser should display a test pattern of coloured ASCII characters.

---

## NEEDS SPEC

### · Main menu screen
### · Keyboard input handler (browser)
### · Keyboard input handler (terminal)

---

## IN PROGRESS

_(none)_

---

## DONE

_(none yet)_
```

---

## docs/features/ directory

Home for any feature that outgrows a one-line backlog entry. Each file is named
`NNN-feature-name.md` matching its backlog ID. No fixed template is enforced beyond
what the Designer role doc specifies — the Designer judges how much detail is needed.

Example: `docs/features/005-main-menu.md` might contain the full ASCII layout of the
menu, the navigation states, which colours are used, and what SELECT does on each item.

---

## Git Workflow

All code changes follow this flow:

```
feature branch → PR → Reviewer approves in conversation → manager merges on GitHub
```

**Branch protection on main** is configured in GitHub (Settings → Branches) with:
- Pull request required before merging — no direct pushes to main, including from the manager
- Required approvals set to 0 — approval happens in the Claude conversation, not via GitHub's formal review mechanism
- Bypassing disallowed — enforced even for the repo owner

**Branching convention** used by the Engineer:
- Branch name: `feature/NNN-short-description` matching the backlog item ID
- One branch per backlog item
- Branch is deleted after the PR is merged

**The merge step belongs to the manager.** Once the Reviewer approves in the conversation, the manager merges the PR via the GitHub mobile app. This one-tap step is the manager's final sign-off before the change goes live. Agents never merge to main themselves.

**GitHub Pages** deploys automatically on merge to main, so a broken merge means a broken live game. The branch protection + Reviewer approval step is the safeguard.

---

## Summary: What to Create

| Path | Created by | Notes |
|---|---|---|
| `CLAUDE.md` | Human (paste from above) | Repo root |
| `init.sh` | Human (paste from above) | Make executable: `chmod +x init.sh` |
| `BACKLOG.md` | Human (paste from above) | Repo root |
| `docs/roles/DESIGNER.md` | Human (paste from above) | Create `docs/roles/` dir |
| `docs/roles/PLANNER.md` | Human (paste from above) | |
| `docs/roles/ENGINEER.md` | Human (paste from above) | |
| `docs/roles/REVIEWER.md` | Human (paste from above) | |
| `docs/roles/DEBUGGER.md` | Human (paste from above) | |
| `docs/roles/DOCUMENTER.md` | Human (paste from above) | |
| `docs/features/` | Claude (as Designer) | Empty dir to start, add `.gitkeep` |
