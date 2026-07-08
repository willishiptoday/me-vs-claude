// Fetch GitHub contribution history via the authenticated `gh` CLI (GraphQL).
// Requires `gh auth login` (scopes: repo, read:org). Includes private contributions for the
// authenticated viewer. Only aggregate counts and per-day intensities are returned — never
// repository names, commit messages, or any identifying content.

import { execFileSync } from "node:child_process";

const QUERY = `query($from: DateTime!, $to: DateTime!) {
  viewer {
    login
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

/** @param {Date} d @returns {string} YYYY-MM-DD */
function ymd(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * @param {Object} [opts]
 * @param {Date}   [opts.now]   defaults to new Date()
 * @param {number} [opts.days]  history window (default 371 = 53 weeks)
 * @returns {{login:string,totalContributions:number,currentStreak:number,longestStreak:number,shippedToday:boolean,calendar:Array<{date:string,count:number}>}|null}
 */
export function collectGithub(opts = {}) {
  const now = opts.now || new Date();
  const days = opts.days || 371;
  const to = now;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  let raw;
  try {
    raw = execFileSync(
      "gh",
      ["api", "graphql", "-f", `query=${QUERY}`, "-F", `from=${from.toISOString()}`, "-F", `to=${to.toISOString()}`],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 32 * 1024 * 1024 }
    );
  } catch (err) {
    console.warn(`[me-vs-claude] GitHub fetch failed (is \`gh\` installed and authed?): ${err.message}`);
    return null;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    console.warn("[me-vs-claude] GitHub returned unparseable JSON");
    return null;
  }

  const viewer = data && data.data && data.data.viewer;
  const cal = viewer && viewer.contributionsCollection && viewer.contributionsCollection.contributionCalendar;
  if (!cal) {
    console.warn("[me-vs-claude] GitHub response missing contribution calendar");
    return null;
  }

  /** @type {Array<{date:string,count:number}>} */
  const calendar = [];
  for (const w of cal.weeks || []) {
    for (const d of w.contributionDays || []) {
      calendar.push({ date: d.date, count: d.contributionCount || 0 });
    }
  }
  calendar.sort((a, b) => (a.date < b.date ? -1 : 1));

  const todayStr = ymd(now);
  const shippedToday = calendar.some((d) => d.date === todayStr && d.count > 0);

  // Streaks. Current streak counts back from today (today itself not breaking it if 0 yet).
  let longestStreak = 0;
  let run = 0;
  for (const d of calendar) {
    if (d.count > 0) {
      run += 1;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 0;
    }
  }
  let currentStreak = 0;
  for (let i = calendar.length - 1; i >= 0; i--) {
    const d = calendar[i];
    if (d.date === todayStr && d.count === 0) continue; // today not over yet — don't break
    if (d.count > 0) currentStreak += 1;
    else break;
  }

  return {
    login: viewer.login || "",
    totalContributions: cal.totalContributions || 0,
    currentStreak,
    longestStreak,
    shippedToday,
    calendar,
  };
}
