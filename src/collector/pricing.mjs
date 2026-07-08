// Per-model Claude API list pricing, USD per million tokens (MTok).
// Source: https://platform.claude.com/docs/en/about-claude/pricing (verified 2026-07-08).
//
// We price historical Claude Code usage at *pay-as-you-go API rates* to estimate the
// dollar value a flat-rate subscription extracted. Cache-write rates follow the documented
// multipliers (5-minute = 1.25x input, 1-hour = 2x input); cache reads = 0.1x input.

/**
 * @typedef {Object} Rate
 * @property {number} input       USD / MTok, uncached input
 * @property {number} cacheWrite5m USD / MTok, 5-minute cache write
 * @property {number} cacheWrite1h USD / MTok, 1-hour cache write
 * @property {number} cacheRead   USD / MTok, cache hit / refresh
 * @property {number} output      USD / MTok, output
 */

const OPUS = { input: 5, cacheWrite5m: 6.25, cacheWrite1h: 10, cacheRead: 0.5, output: 25 };
const OPUS_LEGACY = { input: 15, cacheWrite5m: 18.75, cacheWrite1h: 30, cacheRead: 1.5, output: 75 };
const FABLE = { input: 10, cacheWrite5m: 12.5, cacheWrite1h: 20, cacheRead: 1, output: 50 };
// Sonnet 5 introductory pricing is in effect through 2026-08-31; standard ($3/$15) after.
const SONNET_5_INTRO = { input: 2, cacheWrite5m: 2.5, cacheWrite1h: 4, cacheRead: 0.2, output: 10 };
const SONNET = { input: 3, cacheWrite5m: 3.75, cacheWrite1h: 6, cacheRead: 0.3, output: 15 };
const HAIKU_45 = { input: 1, cacheWrite5m: 1.25, cacheWrite1h: 2, cacheRead: 0.1, output: 5 };
const HAIKU_35 = { input: 0.8, cacheWrite5m: 1, cacheWrite1h: 1.6, cacheRead: 0.08, output: 4 };

// Longest-prefix match wins, so order most-specific first.
/** @type {Array<[string, Rate]>} */
const TABLE = [
  ["claude-opus-4-1", OPUS_LEGACY],
  ["claude-opus-4-0", OPUS_LEGACY],
  ["claude-opus-4-", OPUS], // 4.5 / 4.6 / 4.7 / 4.8
  ["claude-opus", OPUS],
  ["claude-fable-5", FABLE],
  ["claude-mythos", FABLE],
  ["claude-sonnet-5", SONNET_5_INTRO],
  ["claude-sonnet-4", SONNET], // 4.0 / 4.5 / 4.6
  ["claude-sonnet", SONNET],
  ["claude-haiku-4-5", HAIKU_45],
  ["claude-haiku-4", HAIKU_45],
  ["claude-3-5-haiku", HAIKU_35],
  ["claude-3-haiku", HAIKU_35],
  ["claude-haiku", HAIKU_45],
];

/** @param {string} model @returns {Rate} */
export function rateFor(model) {
  const id = (model || "").toLowerCase();
  let best = null;
  for (const [prefix, rate] of TABLE) {
    if (id.startsWith(prefix) && (!best || prefix.length > best[0].length)) best = [prefix, rate];
  }
  // Unknown / future model: fall back to Opus-tier so we never wildly under-count value.
  return best ? best[1] : OPUS;
}

/**
 * Estimate the pay-as-you-go USD cost of one assistant message's usage block.
 * @param {string} model
 * @param {any} usage  the `message.usage` object from a Claude Code session log
 * @returns {number} USD
 */
export function priceUsage(model, usage) {
  if (!usage) return 0;
  const r = rateFor(model);
  const input = usage.input_tokens || 0;
  const cacheRead = usage.cache_read_input_tokens || 0;
  const output = usage.output_tokens || 0;

  // Split cache writes into 5m / 1h when the log provides the breakdown; else assume 5m.
  const cc = usage.cache_creation || {};
  let w5 = cc.ephemeral_5m_input_tokens;
  let w1 = cc.ephemeral_1h_input_tokens;
  if (w5 == null && w1 == null) {
    w5 = usage.cache_creation_input_tokens || 0;
    w1 = 0;
  } else {
    w5 = w5 || 0;
    w1 = w1 || 0;
  }

  const usd =
    (input * r.input +
      cacheRead * r.cacheRead +
      w5 * r.cacheWrite5m +
      w1 * r.cacheWrite1h +
      output * r.output) /
    1_000_000;
  return usd;
}

// Friendly display labels, longest-prefix match. Used by the stats strip.
/** @type {Array<[string, string]>} */
const LABELS = [
  ["claude-opus-4-8", "Opus 4.8"],
  ["claude-opus-4-7", "Opus 4.7"],
  ["claude-opus-4-6", "Opus 4.6"],
  ["claude-opus-4-5", "Opus 4.5"],
  ["claude-opus-4-1", "Opus 4.1"],
  ["claude-opus", "Opus"],
  ["claude-fable-5", "Fable 5"],
  ["claude-mythos", "Mythos 5"],
  ["claude-sonnet-5", "Sonnet 5"],
  ["claude-sonnet-4-6", "Sonnet 4.6"],
  ["claude-sonnet-4-5", "Sonnet 4.5"],
  ["claude-sonnet", "Sonnet"],
  ["claude-haiku-4-5", "Haiku 4.5"],
  ["claude-3-5-haiku", "Haiku 3.5"],
  ["claude-haiku", "Haiku"],
];

/** @param {string} model @returns {string} */
export function labelFor(model) {
  const id = (model || "").toLowerCase();
  let best = null;
  for (const [prefix, label] of LABELS) {
    if (id.startsWith(prefix) && (!best || prefix.length > best[0].length)) best = [prefix, label];
  }
  if (best) return best[1];
  // Unknown: title-case the trailing segment.
  return model || "Unknown";
}
