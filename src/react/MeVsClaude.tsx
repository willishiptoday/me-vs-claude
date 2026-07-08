import * as React from "react";
import type { Scoreboard } from "../types";
import { intl, shortDate } from "./format";

export function MeVsClaude({ scoreboard: s }: { scoreboard: Scoreboard }) {
  const possible = Math.max(s.possibleFiveHourWindows, s.fiveHourLimitHits, 1);
  const survived = Math.max(0, possible - s.fiveHourLimitHits);
  const mePct = Math.max(1.5, Math.min(60, (s.fiveHourLimitHits / possible) * 100));
  const since = s.subscribedSince ? shortDate(s.subscribedSince) : "day one";

  return (
    <div className="mvc-block">
      <p className="mvc-kicker">Me vs Claude · the 5-hour war</p>
      <p className="mvc-lead">
        Claude resets my limit every 5 hours. Since {since} that&apos;s{" "}
        <span className="mvc-big">{intl(possible)}</span> windows I could&apos;ve drained to zero. I actually maxed out{" "}
        <span className="mvc-big">{s.fiveHourLimitHits}</span> of them.
      </p>

      <div className="mvc-war">
        <div className="mvc-war-heads">
          <div className="mvc-war-side">
            <span className="mvc-war-n mvc-me">{intl(s.fiveHourLimitHits)}</span>
            <span className="mvc-war-label">K.O.s I landed</span>
          </div>
          <span className="mvc-vs">vs</span>
          <div className="mvc-war-side mvc-side-r">
            <span className="mvc-war-n mvc-claude">{intl(survived)}</span>
            <span className="mvc-war-label">windows Claude survived</span>
          </div>
        </div>

        <div
          className="mvc-hp"
          role="img"
          aria-label={`${s.fiveHourLimitHits} of ${possible} five-hour windows fully drained`}
        >
          <div className="mvc-hp-fill" style={{ ["--mvc-me-pct" as string]: `${mePct}%` }} />
        </div>

        <p className="mvc-war-caption">
          Every K.O. is a 5-hour window I ran dry — proof the flat fee is working for <b>me</b>, not Claude. It&apos;s
          still standing for the other <b>{intl(survived)}</b>. Working on it.
        </p>
      </div>

      <div className="mvc-trophies">
        <div className="mvc-trophy">
          <span className="mvc-trophy-n mvc-trophy-zero">{s.weeklyLimitHits}</span>
          <span className="mvc-trophy-t">
            <b>weekly limits hit.</b>{" "}
            {s.weeklyLimitHits === 0
              ? "Never once. Claude has never benched me for the week — there's headroom in there I haven't found."
              : "A few. Worth every one."}
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
