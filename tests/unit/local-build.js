"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "../..");
const output = fs.mkdtempSync(path.join(os.tmpdir(), "vimium-cg-local-build-"));
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const dictionaries = fs.readdirSync(path.join(root, "i18n")).flatMap(language =>
  ["action", "options"].map(page => `i18n/${language}/${page}.json`));

function build() {
  const result = spawnSync(process.execPath, [require.resolve("gulp/bin/gulp.js"), "local"], {
    cwd: root,
    env: { ...process.env, LOCAL_DIST: output, BUILD_NDEBUG: "0", BUILD_BTypes: "1", BUILD_MV3: "1" },
    encoding: "utf8",
    timeout: 120000,
  });
  assert.ifError(result.error);
  assert.strictEqual(result.status, 0, result.stdout + result.stderr);
}

function checkAssets() {
  for (const file of dictionaries) {
    const target = path.join(output, file);
    assert.ok(fs.existsSync(target), `Missing debug language file: ${file}`);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(target, "utf8")),
      JSON.parse(fs.readFileSync(path.join(root, file), "utf8")));
  }
  const builtManifest = JSON.parse(fs.readFileSync(path.join(output, "manifest.json"), "utf8"));
  assert.deepStrictEqual(builtManifest.content_scripts[0].js, manifest.content_scripts[0].js);
  for (const file of [builtManifest.action.default_popup, builtManifest.options_ui.page,
    builtManifest.background.service_worker, "pages/options.css", "pages/async_bg.js", "pages/options_action.js",
    ...builtManifest.content_scripts.flatMap(script => script.js), ...Object.values(builtManifest.icons)]) {
    assert.ok(fs.existsSync(path.join(output, file)), `Missing extension asset: ${file}`);
  }
  const pageScript = fs.readFileSync(path.join(output, "pages/async_bg.js"), "utf8");
  assert.ok(pageScript.includes(".json"), "The local page loader must use JSON dictionaries");
}

try {
  build();
  checkAssets();
  console.log("PASS: fresh LOCAL_DIST build includes the manifest and page assets");
  for (const file of dictionaries) {
    const target = path.join(output, file);
    fs.writeFileSync(target.replace(/\.json$/, ".js"), "export default" + fs.readFileSync(target, "utf8"));
    fs.unlinkSync(target);
  }
  const staleManifest = JSON.parse(JSON.stringify(manifest));
  staleManifest.content_scripts[0].js = ["content/vimium-c.js"];
  fs.writeFileSync(path.join(output, "manifest.json"), JSON.stringify(staleManifest));
  build();
  checkAssets();
  console.log("PASS: incremental LOCAL_DIST build repairs release-only dictionaries and manifest");
} finally {
  fs.rmSync(output, { recursive: true, force: true });
}
