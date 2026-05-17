#!/bin/bash
# Installed by init.sh as .git/hooks/pre-push.
# Blocks any push when the Reviewer has not yet approved this session.
if [ ! -f .reviewer-approved ]; then
  echo ""
  echo "ERROR: Reviewer approval required before pushing."
  echo "  1. Spawn the Reviewer sub-agent (step 9 in docs/agent/roles/ENGINEER.md)."
  echo "  2. After approval: echo approved > .reviewer-approved"
  echo "  3. Then retry the push."
  exit 1
fi
