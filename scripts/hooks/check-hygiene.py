#!/usr/bin/env python3
"""Lightweight pre-commit hygiene checks (no third-party deps).

Runs against the files pre-commit passes as arguments (staged files).
Exits non-zero if any check fails, which aborts the commit.

Checks:
  * JSON files parse (manifest.json, _locales, i18n, etc.)
  * No ByteDance/internal committer identity leaks into the repo
  * No accidentally-staged large binary blobs
"""
import json
import subprocess
import sys

MAX_BYTES = 3 * 1024 * 1024  # 3 MiB; the source logo.svg is ~2.7 MiB and already tracked
BLOCKED_EMAIL_SUBSTR = ("@bytedance.com",)


def fail(msg: str) -> None:
    print(f"  \033[31m✗\033[0m {msg}", file=sys.stderr)


def check_identity() -> bool:
    """Block commits authored/committed under an internal identity."""
    ok = True
    for key in ("user.email",):
        try:
            val = subprocess.check_output(
                ["git", "config", "--get", key], text=True
            ).strip()
        except subprocess.CalledProcessError:
            continue
        for bad in BLOCKED_EMAIL_SUBSTR:
            if bad in val.lower():
                fail(
                    f"git {key} is '{val}', which contains '{bad}'.\n"
                    f"    Set a public identity, e.g.:\n"
                    f"    git config user.email <you>@users.noreply.github.com"
                )
                ok = False
    return ok


def check_json(paths) -> bool:
    ok = True
    for p in paths:
        if not p.endswith(".json"):
            continue
        try:
            with open(p, encoding="utf-8") as fh:
                json.load(fh)
        except FileNotFoundError:
            continue  # deleted/renamed; nothing to validate
        except (json.JSONDecodeError, UnicodeDecodeError) as ex:
            fail(f"invalid JSON: {p}: {ex}")
            ok = False
    return ok


def check_large_files(paths) -> bool:
    import os

    ok = True
    for p in paths:
        try:
            size = os.path.getsize(p)
        except OSError:
            continue
        if size > MAX_BYTES:
            fail(
                f"large file staged: {p} ({size // 1024} KiB > "
                f"{MAX_BYTES // 1024} KiB). Commit with --no-verify only if intended."
            )
            ok = False
    return ok


def main(argv) -> int:
    paths = argv[1:]
    results = [
        check_identity(),
        check_json(paths),
        check_large_files(paths),
    ]
    return 0 if all(results) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
