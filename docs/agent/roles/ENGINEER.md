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
6. Implement. Follow DECISION_REGISTER.md — do not introduce new dependencies or
   patterns without flagging them to the manager first.
7. Verify:
   - TypeScript: `tsc --noEmit` must pass with zero errors.
   - Tests: run the test suite. All tests must pass.
   - If no tests exist for this feature, write at least one.
8. Run `init.sh` again. It must pass clean on the finished state.
9. Push to a branch and open a PR against main. Do not merge it.
   - If the harness pre-assigned a branch for this session, use it.
   - Otherwise create one named `feature/NNN-short-description`.
10. Update the backlogs on the feature branch:
    - Add the completed item to **BACKLOG_HISTORY.md** (append to the DONE section).
      Record: what was built, tsc output, test results, and play-test instructions.
    - In **BACKLOG.md**, replace the item entry with a one-liner pointer:
      `See BACKLOG_HISTORY.md — NNN · Title`
      (or remove it entirely if the DONE section already has a pointer to that file).
11. Archive the feature spec:
    - If a `docs/features/NNN-*.md` spec exists for this item, replace it with a
      short summary in `docs/features/history/NNN-*.md` (same filename, new directory).
    - Summary format (~15–25 lines):
      ```
      # NNN · Title — DONE
      ## What it added
      [2–3 sentences]
      ## Key files
      [primary files created or significantly changed]
      ## Architectural decisions embedded
      [any non-obvious patterns this feature established — omit section if none]
      ```
    - Delete the original from `docs/features/` after writing the summary.
12. If you run out of context before finishing:
    - Do not leave code in a broken state. Revert or stub cleanly.
    - Write a HANDOFF.md in the repo root using the template below.
    - Update the backlog item status to IN PROGRESS.

## HANDOFF.md Template

```markdown
# Handoff — [Feature NNN: short name]

## Current State
- Session ended: [timestamp or approximate]
- Backlog item: [NNN · title]
- Status: IN PROGRESS

## Completed This Session
- [bullet list of what was actually finished and verified]

## Remaining
- [bullet list of what is left to implement]

## Blockers / Risks
- [any known problem or uncertainty the next session should be aware of]

## Decisions Made
- [any non-obvious choice made during this session, and why]

## Evidence So Far
- tsc: [passed / not yet run / errors found — paste errors if any]
- Tests: [passed / not yet run / failures — paste failures if any]

## Files Modified
- [list of files changed or created]

## Where to Pick Up
[One paragraph of plain-language context — what the next session needs to know
to continue without re-reading everything. Include the exact next step to take.]
```
13. On successful completion, automatically proceed to the Reviewer role. Do not
    wait for the manager to ask. The review is part of the Engineer session.

## Non-negotiables

- Never skip tsc. A build with type errors is not done.
- Never mark an item DONE without play-test instructions.
- Never introduce a new dependency without manager approval.
- init.sh must pass both before you start and after you finish.
- Never push directly to main. Always use a feature branch and open a PR.
- Platform-specific classes (DOMRenderer, TerminalRenderer, etc.) must not contain
  runtime environment guards (`typeof X === 'undefined'`, `process.platform` checks,
  etc.) to paper over a mismatch between the class's platform and the test environment.
  If a platform class requires an API that the test environment doesn't provide,
  configure the test environment to provide it (e.g. set `environment: 'jsdom'` in
  vite.config.ts for DOM classes). The guard belongs in the test config, not the code.
