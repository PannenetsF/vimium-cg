#!/usr/bin/env bash
# TypeScript type-check for staged changes.
#
# Uses `tsc --noEmit` against each project referenced by tsconfig.json,
# rather than the repo's custom scripts/tsc.js (which emits and patches
# the TypeScript compiler). This is a pure check with no build side effects.
#
# Skips gracefully (exit 0) when dependencies are missing so the hook never
# blocks a commit just because `npm install` hasn't been run.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

TSC="node_modules/.bin/tsc"
if [ ! -x "$TSC" ]; then
  echo "  ⚠ skip tsc: node_modules/.bin/tsc not found (run: npm install)" >&2
  exit 0
fi

# Sub-projects referenced by tsconfig.json.
PROJECTS="background content front pages"

status=0
for proj in $PROJECTS; do
  if [ -f "$proj/tsconfig.json" ]; then
    if ! "$TSC" --noEmit -p "$proj/tsconfig.json"; then
      echo "  ✗ type errors in $proj/" >&2
      status=1
    fi
  fi
done

exit "$status"
