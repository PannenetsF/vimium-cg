#!/usr/bin/env bash
# ESLint check for staged .ts files (paths passed as arguments by pre-commit).
#
# Skips gracefully (exit 0) when eslint isn't installed — it's an
# optionalDependency in package.json, so `npm install` may not have pulled it.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# Nothing to lint.
[ "$#" -eq 0 ] && exit 0

ESLINT="node_modules/.bin/eslint"
if [ ! -x "$ESLINT" ]; then
  echo "  ⚠ skip eslint: node_modules/.bin/eslint not found" >&2
  echo "    (install with: npm install eslint @typescript-eslint/parser @typescript-eslint/plugin)" >&2
  exit 0
fi

exec "$ESLINT" --ext .ts "$@"
