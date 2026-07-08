import * as React from "react";
import type { ClaudeStats } from "../types";
import { compact, intl, usd, shortDate } from "./format";

// Monochrome shade ramp for the model-split bar (opacity of the accent).
const SHADES = [100, 68, 46, 30, 20, 13];

export function StatsStrip({ claude }: { claude: ClaudeStats }) {
  const models = claude.byModel.slice(0, 6);
  const modelTotal = models.reduce((a, m) => a + m.tokens, 0) || 1;

  const figs: Array<{ n: string; l: string }> = [
    { n: compact(claude.totalTokens), l: "tokens processed" },
    { n: compact(claude.outputTokens), l: "written by Claude" },
    { n: intl(claude.sessions), l: "sessions" },
    { n: intl(claude.activeDays), l: "days in the trenches" },
  ];
  if (claude.busiestDay) {
    figs.push({ n: compact(claude.busiestDay.tokens), l: `busiest day (${shortDate(claude.busiestDay.date)})` });
  }

  return (
    <div className="mvc-block">
      <p className="mvc-kicker">The receipts · Claude Code</p>

      <div className="mvc-figs">
        {figs.map((f) => (
          <div className="mvc-fig" key={f.l}>
            <span className="mvc-fig-n">{f.n}</span>
            <span className="mvc-fig-l">{f.l}</span>
          </div>
        ))}
      </div>

      {models.length > 0 ? (
        <div className="mvc-split">
          <div className="mvc-split-bar">
            {models.map((m, i) => (
              <span
                key={m.model}
                className="mvc-split-seg"
                style={{
                  width: `${(m.tokens / modelTotal) * 100}%`,
                  background: `color-mix(in oklch, var(--mvc-accent) ${SHADES[i] ?? 10}%, transparent)`,
                }}
                title={`${m.label}: ${compact(m.tokens)} tokens · ~${usd(m.costUsd)}`}
              />
            ))}
          </div>
          <div className="mvc-split-legend">
            {models.map((m, i) => (
              <span className="mvc-split-key" key={m.model}>
                <span
                  className="mvc-split-swatch"
                  style={{ background: `color-mix(in oklch, var(--mvc-accent) ${SHADES[i] ?? 10}%, transparent)` }}
                />
                <b>{m.label}</b> {compact(m.tokens)} · ~{usd(m.costUsd)}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
