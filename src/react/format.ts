// Small, dependency-free formatting helpers.

/** 1_468_793_771 → "1.47B", 245_089_912 → "245M", 12_400 → "12.4K". */
export function compact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return trim(n / 1e12) + "T";
  if (abs >= 1e9) return trim(n / 1e9) + "B";
  if (abs >= 1e6) return trim(n / 1e6) + "M";
  if (abs >= 1e3) return trim(n / 1e3) + "K";
  return String(Math.round(n));
}

function trim(n: number): string {
  // 1–2 significant decimals, no trailing zeros.
  const s = n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2);
  return s.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

/** 2557.5 → "$2,558"; 12.78 → "$13" (whole dollars). */
export function usd(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/** 2557.5 → "$2.56K" for tight spots. */
export function usdCompact(n: number): string {
  if (Math.abs(n) >= 1000) return "$" + compact(n);
  return "$" + Math.round(n);
}

export function intl(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** "2026-06-19" → "Jun 19". */
export function shortDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00Z");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** ISO timestamp → "Jul 8, 2026". */
export function longDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function roiVerb(roi: number): string {
  if (roi >= 10) return "robbing the bank";
  if (roi >= 4) return "well ahead";
  if (roi >= 1.5) return "up on the deal";
  if (roi >= 1) return "breaking even";
  return "still warming up";
}
