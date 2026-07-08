"use client";
import * as React from "react";
import type { DevStatsData } from "../types";
import { DevStats } from "./DevStats";
import { ThemePicker, ACCENTS, type Accent } from "./ThemePicker";

export interface DevStatsThemedProps {
  data: DevStatsData;
  /** Base theme variables (host tokens → --mvc-*). Accent is layered on top. */
  style?: React.CSSProperties;
  className?: string;
  repoUrl?: string;
  hideFooter?: boolean;
  accents?: Accent[];
  /** localStorage key for the remembered accent. */
  storageKey?: string;
}

/**
 * Client wrapper adding an interactive accent-color picker over <DevStats/>. The chosen
 * accent (persisted to localStorage) drives --mvc-accent — the heatmap, the war bar, and the
 * receipt stamp all follow it, so dark mode never has to stay pure monochrome.
 */
export function DevStatsThemed({
  data,
  style,
  className,
  repoUrl,
  hideFooter,
  accents = ACCENTS,
  storageKey = "mvc:accent",
}: DevStatsThemedProps) {
  // Default to the first accent on server + first client render (stable hydration), then
  // adopt the remembered choice after mount.
  const [accent, setAccent] = React.useState(accents[0].value);

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved !== null && accents.some((a) => a.value === saved)) setAccent(saved);
    } catch {
      /* ignore */
    }
  }, [accents, storageKey]);

  const choose = (value: string) => {
    setAccent(value);
    try {
      window.localStorage.setItem(storageKey, value);
    } catch {
      /* ignore */
    }
  };

  const merged: React.CSSProperties = {
    ...style,
    // Empty accent = monochrome: fall back to the ink color.
    ["--mvc-accent" as string]: accent === "" ? "var(--mvc-ink)" : accent,
  };

  return (
    <DevStats
      data={data}
      style={merged}
      className={className}
      repoUrl={repoUrl}
      hideFooter={hideFooter}
      header={<ThemePicker accents={accents} value={accent} onChange={choose} />}
    />
  );
}

export default DevStatsThemed;
