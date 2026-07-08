import * as React from "react";
import type { ClaudeStats, Scoreboard } from "../types";
import { usd, intl, roiVerb, shortDate } from "./format";

export function MeVsClaude({ claude, scoreboard: s }: { claude: ClaudeStats | null; scoreboard: Scoreboard }) {
  const value = claude?.estimatedApiCostUsd ?? 0;
  const spend = s.subscriptionSpendUsd;
  const total = value + spend || 1;
  const mePct = Math.max(6, Math.min(97, (value / total) * 100));
  const roi = s.roiMultiple;

  return (
    <div className="mvc-block">
      <p className="mvc-kicker">Me vs Claude · am I getting my money&apos;s worth?</p>
      <p className="mvc-lead">
        I&apos;m on <b>{s.subscriptionPlan}</b> — {usd(s.subscriptionMonthlyUsd)}/mo. Over {s.monthsSubscribed}{" "}
        month{s.monthsSubscribed === 1 ? "" : "s"} that&apos;s <span className="mvc-big">{usd(spend)}</span> paid. At
        pay-as-you-go API rates I&apos;ve run <span className="mvc-big">{usd(value)}</span> of tokens through my terminal.
      </p>

      <div className="mvc-versus" aria-hidden>
        <div className="mvc-versus-heads">
          <span>
            <b>You</b> · {usd(value)} extracted
          </span>
          <span className="mvc-side-claude">
            {usd(spend)} billed · <b>Claude</b>
          </span>
        </div>
        <div className="mvc-bar" style={{ ["--mvc-me-pct" as string]: `${mePct}%` }}>
          <div className="mvc-bar-me" />
          <span className="mvc-bar-tick" />
        </div>
      </div>

      <p className="mvc-roi">
        That&apos;s <span className="mvc-big">{roi.toFixed(1)}×</span> my money back — officially {roiVerb(roi)}. Not
        losing money to Claude. Arguably robbing it.
      </p>

      <div className="mvc-trophies">
        <div className="mvc-trophy">
          <span className="mvc-trophy-n">{s.fiveHourLimitHits}×</span>
          <span className="mvc-trophy-t">
            <b>maxed out the 5-hour limit.</b> Every one is a receipt: I squeezed the plan dry and made Claude tap out.
          </span>
        </div>
        <div className="mvc-trophy">
          <span className="mvc-trophy-n mvc-trophy-zero">{s.weeklyLimitHits}</span>
          <span className="mvc-trophy-t">
            <b>weekly limits hit.</b>{" "}
            {s.weeklyLimitHits === 0
              ? `Never. Not once${s.subscribedSince ? ` since ${shortDate(s.subscribedSince)}` : ""}. There's still headroom in there somewhere.`
              : "Okay, a few. Worth it."}
          </span>
        </div>
        {s.modelCreditHits > 0 ? (
          <div className="mvc-trophy">
            <span className="mvc-trophy-n">{s.modelCreditHits}×</span>
            <span className="mvc-trophy-t">
              <b>torched a premium-model credit pool.</b> The expensive stuff always goes first.
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
