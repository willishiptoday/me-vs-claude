import type { DevStatsData } from "../types";

export interface CollectOptions {
  /** Output JSON path. */
  out: string;
  /** Append-only limit-hit ledger path. */
  ledger: string;
  /** Optional manual-stats JSON path (plan name/price, subscribedSince). */
  manual?: string;
  /** Override ~/.claude location. */
  claudeDir?: string;
  /** Override "now" (mainly for tests). */
  now?: Date;
}

/** Collect GitHub + Claude Code stats, write `out`, and return the assembled data. */
export function collect(opts: CollectOptions): DevStatsData;

export type { DevStatsData };
