# Role: Engineer

**Recommended model: haiku** — features are fully specified before this role runs. Upgrade to sonnet if the feature touches many interdependent files or requires significant architectural judgement.

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
   before writing any code (use GitHub MCP tools to read PR comments). Address any
   outstanding feedback as part of this session.
5. Read any existing code that the feature touches.
6. Implement. Follow DECISION_REGISTER.md — do not introduce new dependencies or
   patterns without flagging them to the manager first.
7. Verify:
   - TypeScript: `tsc --noEmit` must pass with zero errors.
   - Tests: run the test suite. All tests must pass.
   - If no tests exist for this feature, write at least one.
8. Run `init.sh` again. It must pass clean on the finished state.
9. **Run the Reviewer role inline** (same session, no sub-agent). Do not push first.
   Read `docs/agent/roles/REVIEWER.md` and follow its full process:
   - Run `git diff main...HEAD` and `git log main..HEAD` to see exactly what changed.
   - Read the implementation files that were added or modified.
   - Check against DECISION_REGISTER.md and the Reviewer non-negotiables.
   - Post the review outcome in the conversation (approved, or a list of specific issues).
10. If the review finds issues, fix them (returning to step 7) before continuing.
11. **The Reviewer has approved. Do NOT push yet. Complete steps 11 and 12 first.**
    Create the approval marker (required by the pre-push hook):
    ```
    echo approved > .reviewer-approved
    ```
    Update the backlogs on the local feature branch:
    - Add the completed item to **BACKLOG_HISTORY.md** (append to the DONE section).
      Record: what was built, tsc output, test results, and play-test instructions.
    - Remove the item from **BACKLOG.md** entirely.
12. Archive the feature spec:
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
13. Confirm the following before pushing — if any are not done, do them now:
    - [ ] Item removed from BACKLOG.md
    - [ ] Item added to BACKLOG_HISTORY.md with evidence and play-test instructions
    - [ ] Spec archived to docs/features/history/ and original deleted
    - [ ] `.reviewer-approved` marker created (step 11)
    Then push the branch and open a PR against main. Do not merge it.
    - If the harness pre-assigned a branch for this session, use it.
    - Otherwise create one named `feature/NNN-short-description`.
    After the push succeeds, delete the approval marker: `rm .reviewer-approved`

## Context Management

Monitor your context usage throughout the session. **If the conversation is growing
very long or a compaction warning appears, stop implementation and hand off cleanly**
— do not wait until context is exhausted.

When handing off early:
- Do not leave code in a broken state. Revert or stub cleanly.
- Write a HANDOFF.md in the repo root using the template below.
- Update the backlog item status to IN PROGRESS.
- Push whatever is complete to the branch.
- **Do not push a completed feature without first running the Reviewer role.** If
  implementation is fully done but context is nearly exhausted, complete the review
  before pushing — the review is cheaper than the push. Only skip the review if the
  feature itself is incomplete (i.e. the handoff is mid-implementation).

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

## Non-negotiables

- Never skip tsc. A build with type errors is not done.
- Never mark an item DONE without play-test instructions.
- Never introduce a new dependency without manager approval.
- init.sh must pass both before you start and after you finish.
- Never push directly to main. Always use a feature branch and open a PR.
- **Never push or open a PR without completing the inline Reviewer role (step 9) and receiving approval.**
- **Never push without first completing steps 11 and 12.** Backlog cleanup and spec archival happen on the local branch before the push — not after, not as a follow-up. The push is the last act.
- Platform-specific classes (DOMRenderer, TerminalRenderer, etc.) must not contain
  runtime environment guards (`typeof X === 'undefined'`, `process.platform` checks,
  etc.) to paper over a mismatch between the class's platform and the test environment.
  If a platform class requires an API that the test environment doesn't provide,
  configure the test environment to provide it (e.g. set `environment: 'jsdom'` in
  vite.config.ts for DOM classes). The guard belongs in the test config, not the code.
