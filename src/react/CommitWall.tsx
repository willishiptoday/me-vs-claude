import * as React from "react";
import type { GithubStats } from "../types";
import { intl, shortDate } from "./format";

/** Robust upper bound for the intensity ramp so one mega-day doesn't flatten the rest. */
function percentileCap(counts: number[]): number {
  const nz = counts.filter((c) => c > 0).sort((a, b) => a - b);
  if (nz.length === 0) return 4;
  const p = nz[Math.floor(nz.length * 0.9)] ?? nz[nz.length - 1];
  return Math.max(4, p);
}

function level(count: number, cap: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count >= cap * 0.75) return 4;
  if (count >= cap * 0.5) return 3;
  if (count >= cap * 0.25) return 2;
  return 1;
}

export function CommitWall({ github }: { github: GithubStats }) {
  const { calendar } = github;
  const cap = percentileCap(calendar.map((d) => d.count));

  // Pad the leading week so weekday rows line up (GitHub weeks start Sunday).
  const lead = calendar.length ? new Date(calendar[0].date + "T00:00:00Z").getUTCDay() : 0;
  const cells: Array<{ key: string; date?: string; count?: number; l: number } | null> = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (const d of calendar) cells.push({ key: d.date, date: d.date, count: d.count, l: level(d.count, cap) });

  return (
    <div className="mvc-block">
      <p className="mvc-kicker">The commit wall · @{github.login}</p>
      <p className="mvc-lead">
        The handle is <span className="mvc-big">@{github.login}</span>, so I have to mean it.{" "}
        <span className="mvc-big">{intl(github.totalContributions)}</span> contributions this year
        {github.currentStreak > 0 ? (
          <>
            , <span className="mvc-big">{github.currentStreak}</span> days in a row
            {github.longestStreak > github.currentStreak ? (
              <span className="mvc-sub"> (best run: {github.longestStreak})</span>
            ) : null}
            .
          </>
        ) : (
          <span className="mvc-sub"> — streak&apos;s cold right now, don&apos;t look.</span>
        )}
      </p>

      <div className="mvc-heat-scroll">
        <div className="mvc-heat" role="img" aria-label={`${github.totalContributions} contributions in the last year`}>
          {cells.map((c, i) =>
            c ? (
              <span
                key={c.key}
                className="mvc-cell"
                data-l={c.l || undefined}
                title={`${c.count} contribution${c.count === 1 ? "" : "s"} · ${shortDate(c.date!)}`}
              />
            ) : (
              <span key={`pad-${i}`} className="mvc-cell" style={{ visibility: "hidden" }} aria-hidden />
            )
          )}
        </div>
      </div>

      <div className="mvc-heat-foot">
        <span>
          {github.shippedToday ? (
            <span className="mvc-pill mvc-live">
              <span className="mvc-pill-dot" /> shipped today
            </span>
          ) : (
            <span className="mvc-pill">nothing shipped yet today…</span>
          )}
        </span>
        <span className="mvc-legend">
          less
          <span className="mvc-cell" />
          <span className="mvc-cell" data-l="1" />
          <span className="mvc-cell" data-l="2" />
          <span className="mvc-cell" data-l="3" />
          <span className="mvc-cell" data-l="4" />
          more
        </span>
      </div>
    </div>
  );
}
