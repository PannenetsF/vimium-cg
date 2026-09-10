#!/usr/bin/env python3
"""Lightweight pre-commit hygiene checks (no third-party deps).

Runs against the files pre-commit passes as arguments (staged files).
Exits non-zero if any check fails, which aborts the commit.

Checks:
  * JSON/JSONC files parse (manifest.json, _locales, i18n, tsconfig, etc.)
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


def _strip_jsonc(text: str) -> str:
    """Remove // and /* */ comments and trailing commas, respecting strings.

    tsconfig.json and the build config JSONs are JSONC (TypeScript allows
    trailing commas; gulp/uglifyjs configs use // comments), so plain
    json.load would wrongly reject them.
    """
    out = []
    i, n = 0, len(text)
    in_str = False
    quote = ""
    while i < n:
        c = text[i]
        if in_str:
            out.append(c)
            if c == "\\" and i + 1 < n:
                out.append(text[i + 1])
                i += 2
                continue
            if c == quote:
                in_str = False
            i += 1
            continue
        if c in ('"', "'"):
            in_str = True
            quote = c
            out.append(c)
            i += 1
            continue
        if c == "/" and i + 1 < n and text[i + 1] == "/":
            i += 2
            while i < n and text[i] != "\n":
                i += 1
            continue
        if c == "/" and i + 1 < n and text[i + 1] == "*":
            i += 2
            while i + 1 < n and not (text[i] == "*" and text[i + 1] == "/"):
                i += 1
            i += 2
            continue
        out.append(c)
        i += 1
    stripped = "".join(out)
    # Drop trailing commas: a comma followed by only whitespace then } or ].
    import re

    stripped = re.sub(r",(\s*[}\]])", r"\1", stripped)
    return stripped


def check_json(paths) -> bool:
    ok = True
    for p in paths:
        if not p.endswith(".json"):
            continue
        try:
            with open(p, encoding="utf-8") as fh:
                raw = fh.read()
        except FileNotFoundError:
            continue  # deleted/renamed; nothing to validate
        except UnicodeDecodeError as ex:
            fail(f"invalid JSON (encoding): {p}: {ex}")
            ok = False
            continue
        try:
            json.loads(_strip_jsonc(raw))
        except json.JSONDecodeError as ex:
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
