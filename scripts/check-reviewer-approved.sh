#!/bin/bash
# Claude Code PreToolUse hook for the Bash tool.
# Blocks any git push command when .reviewer-approved is absent.
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.command // ""')

if echo "$COMMAND" | grep -qE '^git push'; then
  if [ ! -f .reviewer-approved ]; then
    echo "BLOCKED: Cannot push without Reviewer approval."
    echo "Spawn the Reviewer sub-agent first (step 9 in docs/agent/roles/ENGINEER.md)."
    echo "After the Reviewer approves, run:  echo approved > .reviewer-approved"
    exit 2
  fi
fi
