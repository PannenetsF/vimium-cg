#!/usr/bin/env node
// @ts-check
"use strict";
/**
 * Render the mirrored wiki (wiki/*.md) into local HTML pages
 * (pages/wiki/*.html) so the extension's in-app help links
 * (vimium://wiki/...) resolve to offline, packaged pages.
 *
 * Uses pandoc when available; if pandoc is missing, prints a warning and
 * skips (the rest of the build is unaffected). Output is git-ignored.
 */
const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "wiki");
const OUT_DIR = path.join(ROOT, "pages", "wiki");

/** @returns {boolean} */
function hasPandoc() {
  try {
    cp.execFileSync("pandoc", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/** Set of known page base names (without extension), for link rewriting. */
function listPages() {
  const set = new Set();
  for (const f of fs.readdirSync(SRC_DIR)) {
    if (f.endsWith(".md") && f !== "README.md") { set.add(f.slice(0, -3)); }
  }
  return set;
}

/**
 * Rewrite relative intra-wiki links (href="Page-Name" / "Page-Name#anchor")
 * to "Page-Name.html#anchor". Leaves absolute (http...) links untouched.
 * @param {string} html
 * @param {Set<string>} pages
 * @returns {string}
 */
function rewriteLinks(html, pages) {
  return html.replace(/href="([^"#:]+)(#[^"]*)?"/g, (m, target, anchor) => {
    // Skip absolute URLs, already-html, and images/assets.
    if (/^[a-z]+:/i.test(target) || target.endsWith(".html") || /\.(jpg|jpeg|png|gif|svg)$/i.test(target)) {
      return m;
    }
    // Only rewrite when it points at a known wiki page (case-insensitive).
    let name = target;
    if (!pages.has(name)) {
      const lower = name.toLowerCase();
      let match = null;
      for (const p of pages) { if (p.toLowerCase() === lower) { match = p; break; } }
      if (!match) { return m; }
      name = match;
    }
    return `href="${name}.html${anchor || ""}"`;
  });
}

const PAGE_TEMPLATE = (title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<title>${title} - Vimium CG Wiki</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 820px; margin: 24px auto; padding: 0 20px 48px; line-height: 1.6;
    color: #24292f; background: #fff; }
  @media (prefers-color-scheme: dark) { body { color: #c9d1d9; background: #0d1117; }
    a { color: #58a6ff; } code, pre { background: #161b22 !important; } }
  h1, h2, h3 { line-height: 1.25; margin-top: 1.4em; }
  h1 { border-bottom: 1px solid #d0d7de; padding-bottom: .3em; }
  a { color: #0969da; }
  code { background: #f6f8fa; padding: .15em .35em; border-radius: 4px; font-size: 90%; }
  pre { background: #f6f8fa; padding: 12px; border-radius: 6px; overflow: auto; }
  pre code { background: none; padding: 0; }
  img { max-width: 100%; }
  table { border-collapse: collapse; } td, th { border: 1px solid #d0d7de; padding: 6px 10px; }
  .wiki-attribution { margin-top: 3em; padding-top: 1em; border-top: 1px solid #d0d7de;
    font-size: 13px; color: #6e7781; }
</style>
</head>
<body>
${body}
<p class="wiki-attribution">Mirrored from the upstream
<a href="https://github.com/gdh1995/vimium-c/wiki">Vimium C wiki</a>,
authored by Dahan Gong (gdh1995), Apache-2.0.</p>
</body>
</html>
`;

/**
 * @param {(message: string, ...params: any[]) => void} [print]
 * @returns {void}
 */
function main(print = console.log) {
  if (!fs.existsSync(SRC_DIR)) {
    print("[wiki] no wiki/ directory; skip");
    return;
  }
  if (!hasPandoc()) {
    print("[wiki] pandoc not found; skipping wiki HTML generation "
        + "(install pandoc to bundle offline help pages)");
    return;
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const pages = listPages();
  let count = 0;
  for (const f of fs.readdirSync(SRC_DIR)) {
    const full = path.join(SRC_DIR, f);
    if (f.endsWith(".md")) {
      if (f === "README.md") { continue; }
      const title = f.slice(0, -3).replace(/-/g, " ");
      let body = cp.execFileSync("pandoc", [full, "-f", "gfm", "-t", "html5"], { encoding: "utf8" });
      body = rewriteLinks(body, pages);
      fs.writeFileSync(path.join(OUT_DIR, f.slice(0, -3) + ".html"), PAGE_TEMPLATE(title, body));
      count++;
    } else if (/\.(jpg|jpeg|png|gif|svg)$/i.test(f)) {
      fs.copyFileSync(full, path.join(OUT_DIR, f));
    }
  }
  print("[wiki] generated %d pages into pages/wiki/", count);
}

if (typeof require === "function" && require.main === module) {
  main();
}
module.exports = main;
