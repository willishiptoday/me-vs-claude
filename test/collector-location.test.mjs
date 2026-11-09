import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const collector = new URL("../src/collector/claude.mjs", import.meta.url).href;

function writeSession(directory, tokens) {
  const project = path.join(directory, "projects", "sample-project");
  fs.mkdirSync(project, { recursive: true });
  fs.writeFileSync(
    path.join(project, "session.jsonl"),
    JSON.stringify({
      sessionId: "sample-session",
      timestamp: "2026-11-09T12:00:00Z",
      message: {
        id: "sample-message",
        model: "test-model",
        usage: { input_tokens: tokens, output_tokens: 0 },
      },
    }) + "\n",
  );
}

function collectAtHome(home, options = {}) {
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `import { collectClaude } from ${JSON.stringify(collector)}; console.log(JSON.stringify(collectClaude(${JSON.stringify(options)})));`,
    ],
    { env: { ...process.env, HOME: home }, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("reads preserved history instead of a retired installation", (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "history-location-"));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  writeSession(path.join(home, ".agents", "chatgpt-history"), 7);
  writeSession(path.join(home, ".claude"), 19);
  assert.equal(collectAtHome(home).totalTokens, 7);
});

test("retains explicit directory overrides", (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "history-override-"));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  writeSession(path.join(home, ".agents", "chatgpt-history"), 7);
  const override = path.join(home, "another-archive");
  writeSession(override, 23);
  assert.equal(collectAtHome(home, { claudeDir: override }).totalTokens, 23);
});

test("supports existing installations before their history is migrated", (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "history-legacy-"));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  writeSession(path.join(home, ".claude"), 11);
  assert.equal(collectAtHome(home).totalTokens, 11);
});
