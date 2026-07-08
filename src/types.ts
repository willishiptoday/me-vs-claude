// Shape of the JSON emitted by the me-vs-claude collector and consumed by <DevStats/>.

export interface GithubStats {
  login: string;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  shippedToday: boolean;
  /** Chronological daily contribution counts, ~last 53 weeks. */
  calendar: { date: string; count: number }[];
}

export interface ModelUsage {
  model: string;
  label: string;
  tokens: number;
  costUsd: number;
}

export interface ClaudeStats {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  /** Pay-as-you-go API-equivalent value of all tokens, USD. */
  estimatedApiCostUsd: number;
  sessions: number;
  activeDays: number;
  firstDay: string | null;
  lastDay: string | null;
  busiestDay: { date: string; tokens: number } | null;
  byModel: ModelUsage[];
}

export interface Scoreboard {
  /** Times the 5-hour rolling limit was hit (deduped, from the ledger). */
  fiveHourLimitHits: number;
  /** Times the weekly limit was hit. The whole point is usually 0. */
  weeklyLimitHits: number;
  /** Times a per-model credit pool (e.g. Fable 5) was exhausted. */
  modelCreditHits: number;
  /** Total 5-hour rolling windows elapsed since subscribing — the max I could have maxed out. */
  possibleFiveHourWindows: number;
  subscriptionPlan: string;
  subscriptionMonthlyUsd: number;
  subscribedSince: string | null;
  monthsSubscribed: number;
  /** subscriptionMonthlyUsd × monthsSubscribed. */
  subscriptionSpendUsd: number;
  /** API-equivalent value from retained logs only. */
  retainedApiCostUsd: number;
  /** retainedApiCostUsd projected across the full subscription (accounts for pruned logs). */
  lifetimeValueUsd: number;
  /** fullSpan ÷ retainedSpan; >1 when logs were pruned. */
  projectionFactor: number;
  /** True when lifetimeValueUsd is a projection past the retained window. */
  estimated: boolean;
  /** lifetimeValueUsd ÷ subscriptionSpendUsd. */
  roiMultiple: number;
}

export interface DevStatsData {
  generatedAt: string;
  github: GithubStats | null;
  claude: ClaudeStats | null;
  scoreboard: Scoreboard;
}
