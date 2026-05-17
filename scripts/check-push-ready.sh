#!/bin/bash
# Shared push-readiness checks. Called by both the git pre-push hook and the
# Claude Code PreToolUse hook. Prints all failures and exits 1 if any apply.

ERRORS=()

# 1. Reviewer approval marker
if [ ! -f .reviewer-approved ]; then
  ERRORS+=("Reviewer approval missing. Complete the inline Reviewer role (step 9 in ENGINEER.md), then: echo approved > .reviewer-approved")
fi

# 2. Feature removed from BACKLOG.md
if ! git diff main...HEAD -- BACKLOG.md | grep -q '^-[^-]'; then
  ERRORS+=("BACKLOG.md unchanged. The completed feature must be removed from BACKLOG.md (step 11).")
fi

# 3. Feature recorded in BACKLOG_HISTORY.md
if ! git diff main...HEAD -- BACKLOG_HISTORY.md | grep -q '^+[^+]'; then
  ERRORS+=("BACKLOG_HISTORY.md unchanged. The completed feature must be added to BACKLOG_HISTORY.md (step 11).")
fi

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "PUSH BLOCKED — complete these steps first:"
  for err in "${ERRORS[@]}"; do
    echo "  - $err"
  done
  exit 1
fi
