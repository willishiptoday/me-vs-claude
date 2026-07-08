# me-vs-claude

> Turn your GitHub commit history and Claude Code usage into a playful **"am I getting my money's worth?"** section for your website.

You pay Claude a flat monthly fee. The only way to win is to drain every drop of compute before it taps you out. `me-vs-claude` reads your **local Claude Code logs** and your **GitHub contributions**, then renders a scoreboard: a contribution wall, a "Me vs Claude" ROI bar (dollar value of tokens you burned vs. what you paid), and every time you hit the 5-hour limit — proof you squeezed the plan dry.

It's two pieces you can use together or separately:

1. **A zero-dependency collector CLI** (`npx me-vs-claude collect`) that writes a small `dev-stats.json`. Framework-agnostic — use the JSON however you like.
2. **A themeable React component** (`<DevStats />`) that renders that JSON. Zero runtime deps, self-contained CSS, inherits your design tokens.

Everything runs **on your machine** and the site stays **fully static** — nothing is fetched in the browser. Claude subscription usage has no public API, so the data can only come from your own logs.

---

## Why this exists (and what's actually recoverable)

Claude Code's [OpenTelemetry monitoring](https://code.claude.com/docs/en/monitoring-usage) exports token/cost metrics to a collector — great for dashboards, but it needs infrastructure, only captures data going forward, and has **no limit-hit event**. Instead, `me-vs-claude` parses the session logs Claude Code already writes to `~/.claude/projects/**/*.jsonl`:

| Metric | How | Reliable? |
| --- | --- | --- |
| Tokens, cost, models, sessions, active days | per-message `usage` blocks | ✅ retroactive & exact |
| 5-hour ("session") limit hits | `"You've hit your session limit · resets …"` notices, deduped by window | ✅ |
| Weekly limit hits | `"weekly limit"` notices (usually **zero** — that's the flex) | ✅ |
| Model-credit exhaustions (e.g. Fable 5) | `"reached your … limit"` notices | ✅ |
| Contribution wall, streaks | GitHub GraphQL via `gh` | ✅ |

**Log pruning:** Claude prunes old sessions, so a naive scan undercounts lifetime limit-hits. The collector keeps an **append-only ledger** (`--ledger`), so counts only ever grow and survive pruning.

**Privacy:** the collector reads only token counts, model ids, timestamps, and the text of "limit reached" notices (to get reset times). It never reads or emits your prompts, Claude's responses, tool inputs, file contents, or repository names — only aggregate numbers.

---

## Quick start

### 1. Generate the data

Requires the [GitHub CLI](https://cli.github.com/) authed (`gh auth login`, scopes `repo`, `read:org`) for commit data.

```bash
npx me-vs-claude collect \
  --out ./public/dev-stats.json \
  --ledger ./me-vs-claude-ledger.json \
  --manual ./me-vs-claude.config.json
```

| Flag | Default | Purpose |
| --- | --- | --- |
| `--out <path>` | `./dev-stats.json` | Where to write the stats JSON (commit this). |
| `--ledger <path>` | `./me-vs-claude-ledger.json` | Append-only limit-hit ledger (commit this). |
| `--manual <path>` | — | Your plan price / name / start date (see below). |
| `--claude-dir <path>` | `~/.claude` | Override the Claude Code data directory. |

`--manual` points at a tiny JSON file with the only things that can't be auto-derived:

```jsonc
{
  "subscriptionPlan": "Claude Max 5×",
  "subscriptionMonthlyUsd": 100,
  "subscribedSince": "2026-05-01"   // null → falls back to your first logged day
}
```

Output summary:

```
me-vs-claude: wrote ./public/dev-stats.json
  GitHub   957 contributions · 7-day streak · shipped today: yes
  Claude   2,268,083,957 tokens · ~$2,586 API-equivalent · 177 sessions
  Scores   5h limit 9× · weekly 0× · ROI 12.9×
```

### 2. Render it (React)

```tsx
import { DevStats, type DevStatsData } from "me-vs-claude/react";
import data from "./public/dev-stats.json";

export function Stats() {
  return <DevStats data={data as DevStatsData} repoUrl="https://github.com/you/you" />;
}
```

> **Next.js:** the package ships TypeScript source. Either add `transpilePackages: ["me-vs-claude"]` to `next.config.mjs`, or copy `src/react/` into your app (shadcn-style) and import locally. The component has **no runtime dependencies** beyond React.

Not using React? You still get everything — the JSON schema is [documented below](#data-schema). Render it with whatever you like.

---

## Theming

The component is monochrome by default and driven entirely by CSS variables. Map your design tokens onto them (inline `style`, a wrapper class, or `:root`):

```tsx
<DevStats
  data={data}
  style={{
    "--mvc-ink": "var(--foreground)",
    "--mvc-muted": "var(--muted-foreground)",
    "--mvc-border": "var(--border)",
    "--mvc-surface": "var(--muted)",
    "--mvc-accent": "var(--foreground)", // heatmap + model-split intensity
    "--mvc-win": "var(--foreground)",    // "me" side of the versus bar
    "--mvc-lose": "var(--muted)",        // Claude's side
    "--mvc-mono": "var(--font-mono)",
    "--mvc-radius": "0.625rem",
  } as React.CSSProperties}
/>
```

| Variable | Default | Controls |
| --- | --- | --- |
| `--mvc-ink` | `currentColor` | Primary text |
| `--mvc-muted` | 55% ink | Secondary text, labels |
| `--mvc-border` | 16% ink | Borders, cell outlines |
| `--mvc-surface` | 4% ink | Empty heatmap cells |
| `--mvc-accent` | `currentColor` | Heatmap + model-split intensity |
| `--mvc-win` / `--mvc-lose` | ink / 22% ink | Versus-bar fill / remainder |
| `--mvc-mono` | system mono | Numerals |
| `--mvc-radius` | `12px` | Corner rounding |

Light/dark mode "just works" if your tokens do. Everything respects `prefers-reduced-motion`.

### Props

| Prop | Type | |
| --- | --- | --- |
| `data` | `DevStatsData` | **required** — collector output |
| `className` | `string` | extra class on the root |
| `style` | `CSSProperties` | theme variables live here |
| `repoUrl` | `string` | link in the footer "how it works" tell |
| `hideFooter` | `boolean` | drop the auto-generated footer |

Subcomponents are exported too if you want to compose your own layout: `CommitWall`, `MeVsClaude`, `StatsStrip`.

---

## Keeping it fresh (daily)

Because the data lives on your machine, run the collector on a local schedule and redeploy. A macOS `launchd` agent (runs even when your editor is closed, zero token cost):

`~/Library/LaunchAgents/com.you.devstats.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.you.devstats</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string><string>-lc</string>
    <string>cd /path/to/site && ./scripts/update-dev-stats.sh >> /tmp/devstats.log 2>&1</string>
  </array>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>23</integer><key>Minute</key><integer>30</integer></dict>
</dict></plist>
```

```bash
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.you.devstats.plist
launchctl kickstart -k gui/$(id -u)/com.you.devstats   # test it now
```

Where `update-dev-stats.sh` runs the collector, then commits + deploys only if the data changed. A reference script is in [`examples/update-dev-stats.sh`](./examples/update-dev-stats.sh).

Prefer `cron`, a `SessionEnd` hook, or a CI job? Any trigger works — it just needs to run locally where `~/.claude` lives.

---

## Data schema

`dev-stats.json` (nulls when a source is unavailable):

```ts
interface DevStatsData {
  generatedAt: string;
  github: {
    login: string;
    totalContributions: number;
    currentStreak: number;
    longestStreak: number;
    shippedToday: boolean;
    calendar: { date: string; count: number }[]; // ~53 weeks, chronological
  } | null;
  claude: {
    totalTokens: number;
    inputTokens: number; outputTokens: number;
    cacheReadTokens: number; cacheWriteTokens: number;
    estimatedApiCostUsd: number;                  // pay-as-you-go value of all tokens
    sessions: number; activeDays: number;
    firstDay: string | null; lastDay: string | null;
    busiestDay: { date: string; tokens: number } | null;
    byModel: { model: string; label: string; tokens: number; costUsd: number }[];
  } | null;
  scoreboard: {
    fiveHourLimitHits: number; weeklyLimitHits: number; modelCreditHits: number;
    subscriptionPlan: string; subscriptionMonthlyUsd: number;
    subscribedSince: string | null; monthsSubscribed: number;
    subscriptionSpendUsd: number; roiMultiple: number;
  };
}
```

**Cost estimation** uses current [Claude API list pricing](https://platform.claude.com/docs/en/about-claude/pricing) per model (input / cache-write 5m & 1h / cache-read / output), so the "value extracted" figure is a faithful pay-as-you-go equivalent — not a made-up number.

---

## FAQ

**Are these real numbers?** Yes. Everything except your plan price is parsed from your own logs and GitHub.

**Does it send my data anywhere?** No. It runs locally and writes a JSON file. Only aggregate counts ever reach your committed site.

**My weekly-limit count is 0.** That's the joke. Most people never hit it — the section makes that a flex.

**Cost looks huge / small.** It's the API-equivalent value of every token, dominated by Opus and cache reads. It is *not* your subscription bill.

**Programmatic use:** `import { collect } from "me-vs-claude/collector"` and call it directly, or `import { rateFor, priceUsage } from "me-vs-claude"`-adjacent modules.

---

## License

MIT © William Lo ([@willishiptoday](https://github.com/willishiptoday))
