#!/usr/bin/env bash
# Ensure pandoc is available (used by scripts/build-wiki.js to render the
# offline wiki help pages). Idempotent: does nothing if pandoc is already
# installed. Tries the platform's package manager; falls back to printing
# manual instructions.
set -u

if command -v pandoc >/dev/null 2>&1; then
  echo "pandoc already installed: $(pandoc --version | head -1)"
  exit 0
fi

echo "pandoc not found; attempting to install..."

os="$(uname -s 2>/dev/null || echo unknown)"

try() { echo "+ $*"; "$@"; }

installed() { command -v pandoc >/dev/null 2>&1; }

case "$os" in
  Darwin)
    if command -v brew >/dev/null 2>&1; then
      try brew install pandoc
    else
      echo "Homebrew not found. Install it from https://brew.sh then run: brew install pandoc"
    fi
    ;;
  Linux)
    if command -v apt-get >/dev/null 2>&1; then
      try sudo apt-get update && try sudo apt-get install -y pandoc
    elif command -v dnf >/dev/null 2>&1; then
      try sudo dnf install -y pandoc
    elif command -v pacman >/dev/null 2>&1; then
      try sudo pacman -S --noconfirm pandoc
    elif command -v zypper >/dev/null 2>&1; then
      try sudo zypper install -y pandoc
    elif command -v apk >/dev/null 2>&1; then
      try sudo apk add pandoc
    else
      echo "No known package manager found. See https://pandoc.org/installing.html"
    fi
    ;;
  MINGW*|MSYS*|CYGWIN*)
    if command -v winget >/dev/null 2>&1; then
      try winget install --id JohnMacFarlane.Pandoc -e --source winget
    elif command -v choco >/dev/null 2>&1; then
      try choco install -y pandoc
    elif command -v scoop >/dev/null 2>&1; then
      try scoop install pandoc
    else
      echo "No known package manager found. See https://pandoc.org/installing.html"
    fi
    ;;
  *)
    echo "Unrecognized OS '$os'. See https://pandoc.org/installing.html"
    ;;
esac

if installed; then
  echo "pandoc installed: $(pandoc --version | head -1)"
  exit 0
fi

cat >&2 <<'EOF'

Could not install pandoc automatically.
pandoc is OPTIONAL — the extension still builds without it; only the
offline wiki help pages (pages/wiki/*.html) will be skipped.

To enable them, install pandoc manually: https://pandoc.org/installing.html
Then re-run: npx gulp local
EOF
exit 1
