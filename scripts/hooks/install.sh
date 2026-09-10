#!/usr/bin/env bash
# Install this repo's pre-commit hooks.
#
# Works even when a global `core.hooksPath` is set (e.g. ByteDance's bytesec
# commit hook). pre-commit normally refuses to install in that case; we
# temporarily blank core.hooksPath *for this one command only* (via env, no
# config is written) so it installs into .git/hooks/pre-commit. A parent
# hooksPath hook that chain-calls .git/hooks/<stage> will then run these hooks.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if ! command -v pre-commit >/dev/null 2>&1; then
  cat >&2 <<'EOF'
pre-commit is not installed. Install it first, e.g.:

  pipx install pre-commit          # recommended
  # or
  pip install --user pre-commit    # then ensure ~/.local/bin is on PATH

See https://pre-commit.com/#install
EOF
  exit 1
fi

# Install into .git/hooks/ regardless of a global core.hooksPath.
GIT_CONFIG_COUNT=1 \
GIT_CONFIG_KEY_0=core.hooksPath \
GIT_CONFIG_VALUE_0= \
  pre-commit install

echo
echo "Installed. The effective core.hooksPath is unchanged:"
echo "  $(git config core.hooksPath || echo '(default: .git/hooks)')"
echo
echo "Run against all files once with:  pre-commit run --all-files"
