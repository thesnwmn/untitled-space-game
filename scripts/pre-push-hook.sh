#!/bin/bash
# Installed by init.sh as .git/hooks/pre-push.
bash scripts/check-push-ready.sh || exit 1
