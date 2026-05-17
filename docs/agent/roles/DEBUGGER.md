# Role: Debugger

**Recommended model: sonnet** — this role requires hypothesis reasoning and a confirmation dialogue with the manager before applying any fix.

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
8. **Run the Reviewer role inline** (same session, no sub-agent). Do not push first.
   Read `docs/agent/roles/REVIEWER.md` and follow its full process:
   - Run `git diff main...HEAD` and `git log main..HEAD` to see exactly what changed.
   - Read the implementation files that were added or modified.
   - Check against DECISION_REGISTER.md and the Reviewer non-negotiables.
   - Post the review outcome in the conversation (approved, or a list of specific issues).
9. If the review finds issues, fix them (returning to step 6) before continuing.
10. Update BACKLOG.md if the bug corresponded to a known item, or add a brief note
    to the relevant entry in BACKLOG_HISTORY.md recording what was fixed.
11. Push to a branch and open a PR against main. Do not merge it.
    - If the harness pre-assigned a branch for this session, use it.
    - Otherwise create one named `fix/short-description`.

## Context Management

If you exhaust context before the fix is complete, follow the same handoff protocol
as the Engineer role: do not leave code in a broken state, write a HANDOFF.md in the
repo root using the template in ENGINEER.md, update the backlog item status, and push
whatever is complete.

## Non-negotiables

- Fix the bug, not the code around it.
- Never mark a bug fixed without a passing test that covers it.
- init.sh must pass before and after.
- Never push directly to main. Always use a fix branch and open a PR.
- **Never push without completing the inline Reviewer role (step 8) and receiving approval.**
