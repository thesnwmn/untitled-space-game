#!/bin/bash
# Shared push-readiness checks. Called by both the git pre-push hook and the
# Claude Code PreToolUse hook. Prints all failures and exits 1 if any apply.

ERRORS=()

# 1. Reviewer approval marker
if [ ! -f .reviewer-approved ]; then
  ERRORS+=("Reviewer approval missing. Complete the inline Reviewer role (step 9 in ENGINEER.md), then: echo approved > .reviewer-approved")
fi

# 2. Feature removed from BACKLOG.md
if ! git diff origin/main...HEAD -- BACKLOG.md | grep -q '^-[^-]'; then
  ERRORS+=("BACKLOG.md unchanged. The completed feature must be removed from BACKLOG.md (step 11).")
fi

# 3. Feature recorded in BACKLOG_HISTORY.md
if ! git diff origin/main...HEAD -- BACKLOG_HISTORY.md | grep -q '^+[^+]'; then
  ERRORS+=("BACKLOG_HISTORY.md unchanged. The completed feature must be added to BACKLOG_HISTORY.md (step 11).")
fi

# 4. Feature spec archived to docs/features/history/
# Extract the feature number from the lines removed from BACKLOG.md.
FEATURE_NUM=$(git diff origin/main...HEAD -- BACKLOG.md | grep '^-### ' | grep -oE '[0-9]+' | head -1)
if [ -n "$FEATURE_NUM" ]; then
  # Check whether a spec existed on main for this feature number.
  SPEC_ON_MAIN=$(git ls-tree --name-only origin/main -- docs/features/ 2>/dev/null \
    | grep "docs/features/${FEATURE_NUM}-" | head -1)
  if [ -n "$SPEC_ON_MAIN" ]; then
    SPEC_BASENAME=$(basename "$SPEC_ON_MAIN")
    if [ -f "docs/features/${SPEC_BASENAME}" ]; then
      ERRORS+=("Feature spec docs/features/${SPEC_BASENAME} still exists — archive it to docs/features/history/ (step 12 in ENGINEER.md).")
    elif ! ls "docs/features/history/${FEATURE_NUM}-"*.md 2>/dev/null | grep -q .; then
      ERRORS+=("Feature spec was deleted but no summary found in docs/features/history/${FEATURE_NUM}-*.md. Archive the spec (step 12 in ENGINEER.md).")
    fi
  fi
fi

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "PUSH BLOCKED — complete these steps first:"
  for err in "${ERRORS[@]}"; do
    echo "  - $err"
  done
  exit 1
fi
