// Parse preserved local Claude Code session logs into aggregate
// usage stats and limit-hit events.
//
// PRIVACY: this reads only token-usage numbers, model ids, timestamps, and the text of
// system "limit reached" notices (to extract reset times). It never reads, stores, or emits
// your prompts, Claude's responses, tool inputs, or file contents.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { priceUsage, labelFor } from "./pricing.mjs";

/** Recursively list *.jsonl files under a directory. */
function walkJsonl(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkJsonl(full, out);
    else if (e.isFile() && e.name.endsWith(".jsonl")) out.push(full);
  }
  return out;
}

const RESET_RE = /resets\s+([0-9:apm]+\s*\([^)]+\))/i;
const MODEL_CREDIT_RE = /reached your (.+?) limit/i;

/**
 * @param {Object} [opts]
 * @param {string} [opts.claudeDir]  defaults to the preserved history, then ~/.claude
 * @returns {{
 *   totalTokens:number, inputTokens:number, outputTokens:number,
 *   cacheReadTokens:number, cacheWriteTokens:number, estimatedApiCostUsd:number,
 *   sessions:number, activeDays:number, firstDay:string|null, lastDay:string|null,
 *   busiestDay:{date:string,tokens:number}|null,
 *   byModel:Array<{model:string,label:string,tokens:number,costUsd:number}>,
 *   limitWindows:{ fiveHour:Array<{date:string,reset:string}>, weekly:Array<{date:string,reset:string}>, modelCredit:Array<{date:string,model:string}> }
 * }}
 */
export function collectClaude(opts = {}) {
  const preservedDir = path.join(os.homedir(), ".agents", "chatgpt-history");
  const claudeDir =
    opts.claudeDir ||
    (fs.existsSync(path.join(preservedDir, "projects"))
      ? preservedDir
      : path.join(os.homedir(), ".claude"));
  const projectsDir = path.join(claudeDir, "projects");
  const files = walkJsonl(projectsDir);

  let inputTokens = 0,
    outputTokens = 0,
    cacheReadTokens = 0,
    cacheWriteTokens = 0,
    costUsd = 0;
  const seen = new Set(); // dedup by message id
  const sessions = new Set();
  const perDay = new Map(); // 'YYYY-MM-DD' -> tokens
  const byModel = new Map(); // model id -> {tokens, costUsd}

  const fiveHour = new Map(); // key -> {date, reset}
  const weekly = new Map();
  const modelCredit = new Map();

  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const line of content.split("\n")) {
      if (!line) continue;
      const hasUsage = line.indexOf('"usage"') !== -1;
      const hasErr = line.indexOf('"isApiErrorMessage":true') !== -1;
      if (!hasUsage && !hasErr) continue;

      let obj;
      try {
        obj = JSON.parse(line);
      } catch {
        continue;
      }

      // --- limit-hit events -------------------------------------------------
      if (obj.isApiErrorMessage) {
        const msg = obj.message || {};
        const c = msg.content;
        const text = Array.isArray(c)
          ? c.map((b) => (b && typeof b.text === "string" ? b.text : "")).join(" ")
          : typeof c === "string"
            ? c
            : "";
        const day = (obj.timestamp || "").slice(0, 10);
        if (/session limit/i.test(text)) {
          const m = text.match(RESET_RE);
          const reset = m ? m[1].replace(/\s+/g, " ").trim() : text.slice(0, 40);
          fiveHour.set(`${day}|${reset}`, { date: day, reset });
        } else if (/weekly limit/i.test(text)) {
          const m = text.match(RESET_RE);
          const reset = m ? m[1].replace(/\s+/g, " ").trim() : text.slice(0, 40);
          weekly.set(`${day}|${reset}`, { date: day, reset });
        } else if (/reached your .+ limit/i.test(text)) {
          const m = text.match(MODEL_CREDIT_RE);
          const model = m ? m[1].trim() : "credits";
          modelCredit.set(`${day}|${model}`, { date: day, model });
        }
      }

      // --- token usage ------------------------------------------------------
      const message = obj.message;
      const usage = message && message.usage;
      if (!usage) continue;
      const id = message.id;
      if (id) {
        if (seen.has(id)) continue;
        seen.add(id);
      }

      const model = message.model || "unknown";
      const input = usage.input_tokens || 0;
      const output = usage.output_tokens || 0;
      const cacheRead = usage.cache_read_input_tokens || 0;
      const cacheWrite = usage.cache_creation_input_tokens || 0;
      const rowTokens = input + output + cacheRead + cacheWrite;
      const rowCost = priceUsage(model, usage);

      inputTokens += input;
      outputTokens += output;
      cacheReadTokens += cacheRead;
      cacheWriteTokens += cacheWrite;
      costUsd += rowCost;

      if (obj.sessionId) sessions.add(obj.sessionId);
      const day = (obj.timestamp || "").slice(0, 10);
      if (day) perDay.set(day, (perDay.get(day) || 0) + rowTokens);

      const bm = byModel.get(model) || { tokens: 0, costUsd: 0 };
      bm.tokens += rowTokens;
      bm.costUsd += rowCost;
      byModel.set(model, bm);
    }
  }

  const days = [...perDay.keys()].sort();
  let busiestDay = null;
  for (const [date, tokens] of perDay) {
    if (!busiestDay || tokens > busiestDay.tokens) busiestDay = { date, tokens };
  }

  const byModelArr = [...byModel.entries()]
    .filter(([model, v]) => v.tokens > 0 && model !== "<synthetic>")
    .map(([model, v]) => ({ model, label: labelFor(model), tokens: v.tokens, costUsd: v.costUsd }))
    .sort((a, b) => b.tokens - a.tokens);

  return {
    totalTokens: inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens,
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheWriteTokens,
    estimatedApiCostUsd: costUsd,
    sessions: sessions.size || files.length,
    activeDays: perDay.size,
    firstDay: days[0] || null,
    lastDay: days[days.length - 1] || null,
    busiestDay,
    byModel: byModelArr,
    limitWindows: {
      fiveHour: [...fiveHour.values()],
      weekly: [...weekly.values()],
      modelCredit: [...modelCredit.values()],
    },
  };
}
