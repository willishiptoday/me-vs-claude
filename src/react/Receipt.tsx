import * as React from "react";
import type { ClaudeStats, Scoreboard } from "../types";
import { compact, usd, intl, shortDate, longDate } from "./format";

// Deterministic "barcode" — widths seeded from the token total so it's stable across renders.
function barcode(seed: number): number[] {
  const bars: number[] = [];
  let x = (seed % 9973) + 1;
  for (let i = 0; i < 44; i++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    bars.push(1 + (x % 4)); // 1–4px
  }
  return bars;
}

export function Receipt({ claude, scoreboard: s }: { claude: ClaudeStats; scoreboard: Scoreboard }) {
  const models = claude.byModel.slice(0, 5);
  const bars = barcode(Math.round(claude.totalTokens));

  return (
    <div className="mvc-block">
      <p className="mvc-kicker">The receipt · what Claude would&apos;ve billed me</p>
      <div className="mvc-receipt-wrap">
        <div className="mvc-receipt">
          <div className="mvc-r-center">
            <div className="mvc-r-title">CLAUDE&nbsp;CODE</div>
            <div className="mvc-r-meta">✻ pay-as-you-go receipt ✻</div>
            <div className="mvc-r-meta">wiliamlo.com · terminal #1</div>
            <div className="mvc-r-meta">{longDate(claude.lastDay ? claude.lastDay + "T00:00:00Z" : s.subscribedSince || "")}</div>
          </div>

          <hr className="mvc-r-rule" />

          {models.map((m) => (
            <div className="mvc-r-row" key={m.model}>
              <span>
                {m.label.toUpperCase()}
                <br />
                <span className="mvc-r-q">&nbsp;&nbsp;{compact(m.tokens)} tok</span>
              </span>
              <span>{usd(m.costUsd)}</span>
            </div>
          ))}

          <hr className="mvc-r-rule" />

          <div className="mvc-r-row">
            <span>SUBTOTAL <span className="mvc-r-q">(on record)</span></span>
            <span>{usd(s.retainedApiCostUsd)}</span>
          </div>
          {s.estimated ? (
            <div className="mvc-r-row">
              <span>
                LOST HISTORY <span className="mvc-r-tag">EST ×{s.projectionFactor.toFixed(2)}</span>
              </span>
              <span>{usd(s.lifetimeValueUsd - s.retainedApiCostUsd)}</span>
            </div>
          ) : null}

          <hr className="mvc-r-rule" />

          <div className="mvc-r-row mvc-r-total">
            <span>VALUE EXTRACTED</span>
            <span className="mvc-r-accent">{usd(s.lifetimeValueUsd)}</span>
          </div>
          <div className="mvc-r-row">
            <span>YOU PAID <span className="mvc-r-q">({s.subscriptionPlan})</span></span>
            <span>-{usd(s.subscriptionSpendUsd)}</span>
          </div>

          <hr className="mvc-r-rule" />

          <div className="mvc-r-row mvc-r-total">
            <span>RETURN ON CLAUDE</span>
            <span className="mvc-r-accent">{s.roiMultiple.toFixed(1)}×</span>
          </div>

          <hr className="mvc-r-rule" />

          <div className="mvc-r-row"><span>TOKENS PROCESSED</span><span>{compact(claude.totalTokens)}</span></div>
          <div className="mvc-r-row"><span>SESSIONS</span><span>{intl(claude.sessions)}</span></div>
          <div className="mvc-r-row"><span>DAYS IN THE TRENCHES</span><span>{intl(claude.activeDays)}</span></div>
          {claude.busiestDay ? (
            <div className="mvc-r-row">
              <span>BUSIEST DAY <span className="mvc-r-q">{shortDate(claude.busiestDay.date)}</span></span>
              <span>{compact(claude.busiestDay.tokens)}</span>
            </div>
          ) : null}

          <hr className="mvc-r-rule" />

          <div className="mvc-barcode" aria-hidden>
            {bars.map((w, i) => (
              <span key={i} style={{ width: w }} />
            ))}
          </div>
          <div className="mvc-r-thanks">THANK YOU FOR SHIPPING</div>
          <div className="mvc-r-thanks">* no refunds · all sales final *</div>
        </div>
      </div>
    </div>
  );
}
