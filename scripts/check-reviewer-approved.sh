#!/bin/bash
# Claude Code PreToolUse hook for the Bash tool.
# Intercepts git push calls and runs all push-readiness checks.
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.command // ""')

if echo "$COMMAND" | grep -qE '^git push'; then
  bash scripts/check-push-ready.sh || exit 2
fi
