// me-vs-claude collector — assembles a DevStatsData JSON from local Claude Code logs and
// the GitHub contributions API. Deterministic, dependency-free, safe to run on a schedule.

import fs from "node:fs";
import path from "node:path";
import { collectClaude } from "./claude.mjs";
import { collectGithub } from "./github.mjs";
import { mergeLedger } from "./ledger.mjs";

const DEFAULT_MANUAL = {
  subscriptionPlan: "Claude Max",
  subscriptionMonthlyUsd: 100,
  subscribedSince: null, // 'YYYY-MM-DD'; falls back to Claude's first-active day
};

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/** Whole months between two ISO dates, floored, minimum 1. */
function monthsBetween(fromStr, toDate) {
  if (!fromStr) return 1;
  const from = new Date(fromStr + "T00:00:00Z");
  if (isNaN(from.getTime())) return 1;
  let months = (toDate.getUTCFullYear() - from.getUTCFullYear()) * 12 + (toDate.getUTCMonth() - from.getUTCMonth());
  if (toDate.getUTCDate() < from.getUTCDate()) months -= 1;
  return Math.max(1, months + 1); // count the current partial month
}

/**
 * @param {Object} opts
 * @param {string} opts.out         output JSON path
 * @param {string} opts.ledger      ledger JSON path
 * @param {string} [opts.manual]    manual-stats JSON path
 * @param {string} [opts.claudeDir] override ~/.claude
 * @param {Date}   [opts.now]
 * @returns {object} the assembled DevStatsData
 */
export function collect(opts) {
  const now = opts.now || new Date();
  const prev = readJson(opts.out) || {};
  const manual = { ...DEFAULT_MANUAL, ...(opts.manual ? readJson(opts.manual) || {} : {}) };

  // --- Claude (fail-soft: keep previous section on total failure) ---
  let claude = prev.claude || null;
  let limitWindows = { fiveHour: [], weekly: [], modelCredit: [] };
  try {
    const c = collectClaude({ claudeDir: opts.claudeDir });
    limitWindows = c.limitWindows;
    const { limitWindows: _drop, ...claudeStats } = c;
    claude = claudeStats;
  } catch (err) {
    console.warn(`[me-vs-claude] Claude parse failed, keeping previous data: ${err.message}`);
  }

  // --- GitHub (fail-soft) ---
  let github = collectGithub({ now });
  if (!github && prev.github) {
    console.warn("[me-vs-claude] keeping previous GitHub data");
    github = prev.github;
  }

  // --- Ledger (always merge, even when this run saw no new windows) ---
  const ledger = mergeLedger(opts.ledger, limitWindows);

  // --- Scoreboard / ROI ---
  const DAY = 86400000;
  const subscribedSince = manual.subscribedSince || (claude && claude.firstDay) || null;
  const monthsSubscribed = monthsBetween(subscribedSince, now);
  const subscriptionSpendUsd = manual.subscriptionMonthlyUsd * monthsSubscribed;

  // Claude logs get pruned, so retained data may cover less than the full subscription.
  // Project the retained daily average across the full span to estimate lost history.
  const subStart = subscribedSince ? new Date(subscribedSince + "T00:00:00Z") : now;
  const firstLog = claude && claude.firstDay ? new Date(claude.firstDay + "T00:00:00Z") : subStart;
  const fullSpanDays = Math.max(1, (now - subStart) / DAY);
  const retainedSpanDays = Math.max(1, (now - firstLog) / DAY);
  const projectionFactor = Math.max(1, fullSpanDays / retainedSpanDays);
  const estimated = projectionFactor > 1.05;

  const retainedApiCostUsd = (claude && claude.estimatedApiCostUsd) || 0;
  const lifetimeValueUsd = retainedApiCostUsd * projectionFactor;
  const roiMultiple = subscriptionSpendUsd > 0 ? lifetimeValueUsd / subscriptionSpendUsd : 0;

  // 5-hour rolling windows: how many have elapsed (the ceiling I could have maxed out)
  // vs how many I actually drained (from the ledger).
  const possibleFiveHourWindows = Math.max(1, Math.floor((now - subStart) / (5 * 3600 * 1000)));

  const data = {
    generatedAt: now.toISOString(),
    github,
    claude,
    scoreboard: {
      fiveHourLimitHits: ledger.fiveHour.length,
      weeklyLimitHits: ledger.weekly.length,
      modelCreditHits: ledger.modelCredit.length,
      possibleFiveHourWindows,
      subscriptionPlan: manual.subscriptionPlan,
      subscriptionMonthlyUsd: manual.subscriptionMonthlyUsd,
      subscribedSince,
      monthsSubscribed,
      subscriptionSpendUsd,
      retainedApiCostUsd,
      lifetimeValueUsd,
      projectionFactor,
      estimated,
      roiMultiple,
    },
  };

  fs.mkdirSync(path.dirname(path.resolve(opts.out)), { recursive: true });
  fs.writeFileSync(opts.out, JSON.stringify(data, null, 2) + "\n");
  return data;
}
