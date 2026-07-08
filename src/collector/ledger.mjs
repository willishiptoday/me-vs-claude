// Append-only ledger of limit-hit windows.
//
// Claude Code's local session logs get pruned over time, so a naive scan undercounts
// lifetime limit-hits. The ledger unions every distinct window we've ever seen into a
// committed JSON file, so counts only ever grow and survive log pruning.

import fs from "node:fs";

/**
 * @typedef {Object} Ledger
 * @property {Array<{date:string,reset:string}>} fiveHour
 * @property {Array<{date:string,reset:string}>} weekly
 * @property {Array<{date:string,model:string}>} modelCredit
 */

/** @param {string} file @returns {Ledger} */
export function loadLedger(file) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const j = JSON.parse(raw);
    return {
      fiveHour: Array.isArray(j.fiveHour) ? j.fiveHour : [],
      weekly: Array.isArray(j.weekly) ? j.weekly : [],
      modelCredit: Array.isArray(j.modelCredit) ? j.modelCredit : [],
    };
  } catch {
    return { fiveHour: [], weekly: [], modelCredit: [] };
  }
}

function unionBy(existing, incoming, keyFn) {
  const map = new Map();
  for (const item of existing) map.set(keyFn(item), item);
  for (const item of incoming) map.set(keyFn(item), item);
  // Keep chronological order for stable diffs.
  return [...map.values()].sort((a, b) => (keyFn(a) < keyFn(b) ? -1 : 1));
}

/**
 * Merge freshly-observed windows into the ledger and persist it.
 * @param {string} file
 * @param {{fiveHour:Array,weekly:Array,modelCredit:Array}} windows
 * @returns {Ledger}
 */
export function mergeLedger(file, windows) {
  const prev = loadLedger(file);
  const merged = {
    fiveHour: unionBy(prev.fiveHour, windows.fiveHour || [], (x) => `${x.date}|${x.reset}`),
    weekly: unionBy(prev.weekly, windows.weekly || [], (x) => `${x.date}|${x.reset}`),
    modelCredit: unionBy(prev.modelCredit, windows.modelCredit || [], (x) => `${x.date}|${x.model}`),
  };
  try {
    fs.writeFileSync(file, JSON.stringify(merged, null, 2) + "\n");
  } catch (err) {
    console.warn(`[me-vs-claude] could not write ledger ${file}: ${err.message}`);
  }
  return merged;
}
