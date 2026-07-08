#!/usr/bin/env node
// me-vs-claude CLI — collect GitHub + Claude Code stats into a JSON file.
//
// Usage:
//   npx me-vs-claude collect [options]
//
// Options:
//   --out <path>        output JSON            (default ./dev-stats.json)
//   --ledger <path>     append-only ledger     (default ./me-vs-claude-ledger.json)
//   --manual <path>     manual-stats JSON      (optional; plan price / subscribed-since)
//   --claude-dir <path> override ~/.claude     (optional)
//   -h, --help

import os from "node:os";
import path from "node:path";
import { collect } from "../src/collector/index.mjs";

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") args.help = true;
    else if (a.startsWith("--")) args[a.slice(2)] = argv[++i];
    else args._.push(a);
  }
  return args;
}

const HELP = `me-vs-claude — GitHub + Claude Code stats collector

Usage:
  me-vs-claude collect [options]

Options:
  --out <path>         Output JSON file          (default ./dev-stats.json)
  --ledger <path>      Append-only limit ledger  (default ./me-vs-claude-ledger.json)
  --manual <path>      Manual-stats JSON         (plan name/price, subscribedSince)
  --claude-dir <path>  Override ~/.claude location
  -h, --help           Show this help

Requires the GitHub CLI (\`gh auth login\`) for commit data.
`;

function fmtInt(n) {
  return (n || 0).toLocaleString("en-US");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0] || "collect";
  if (args.help || cmd === "help") {
    process.stdout.write(HELP);
    return;
  }
  if (cmd !== "collect") {
    process.stderr.write(`Unknown command: ${cmd}\n\n${HELP}`);
    process.exit(1);
  }

  const out = path.resolve(args.out || "dev-stats.json");
  const ledger = path.resolve(args.ledger || "me-vs-claude-ledger.json");
  const manual = args.manual ? path.resolve(args.manual) : undefined;
  const claudeDir = args["claude-dir"] ? path.resolve(args["claude-dir"].replace(/^~/, os.homedir())) : undefined;

  const data = collect({ out, ledger, manual, claudeDir });

  const g = data.github;
  const c = data.claude;
  const s = data.scoreboard;
  process.stdout.write(
    `me-vs-claude: wrote ${out}\n` +
      (g ? `  GitHub   ${fmtInt(g.totalContributions)} contributions · ${g.currentStreak}-day streak · shipped today: ${g.shippedToday ? "yes" : "not yet"}\n` : `  GitHub   (no data)\n`) +
      (c ? `  Claude   ${fmtInt(c.totalTokens)} tokens · ~$${fmtInt(Math.round(c.estimatedApiCostUsd))} API-equivalent · ${fmtInt(c.sessions)} sessions\n` : `  Claude   (no data)\n`) +
      `  Scores   5h limit ${s.fiveHourLimitHits}× · weekly ${s.weeklyLimitHits}× · ROI ${s.roiMultiple.toFixed(1)}×\n`
  );
}

main().catch((err) => {
  process.stderr.write(`me-vs-claude failed: ${err.stack || err}\n`);
  process.exit(1);
});
