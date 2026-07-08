import * as React from "react";
import type { DevStatsData } from "../types";
import { CSS } from "./styles";
import { CommitWall } from "./CommitWall";
import { MeVsClaude } from "./MeVsClaude";
import { StatsStrip } from "./StatsStrip";
import { longDate } from "./format";

export interface DevStatsProps {
  data: DevStatsData;
  /** Extra class on the root (the host maps its theme tokens onto --mvc-* here). */
  className?: string;
  style?: React.CSSProperties;
  /** Link shown in the footer for the "how this works" tell. */
  repoUrl?: string;
  /** Hide the auto-generated footer note. */
  hideFooter?: boolean;
}

/**
 * <DevStats/> — renders a GitHub commit wall, a "Me vs Claude" ROI scoreboard, and a Claude
 * Code usage strip from a DevStatsData object produced by the me-vs-claude collector.
 *
 * Self-contained styling: theme it by setting the --mvc-* CSS variables on `className`.
 */
export function DevStats({ data, className, style, repoUrl, hideFooter }: DevStatsProps) {
  const { github, claude, scoreboard } = data;
  return (
    <div className={className ? `mvc ${className}` : "mvc"} style={style}>
      <style>{CSS}</style>

      {github ? <CommitWall github={github} /> : null}
      <MeVsClaude claude={claude} scoreboard={scoreboard} />
      {claude ? <StatsStrip claude={claude} /> : null}

      {!hideFooter ? (
        <p className="mvc-foot">
          Auto-updated {longDate(data.generatedAt)} from my own GitHub + Claude Code logs — the numbers are real, the
          smugness is optional.{" "}
          {repoUrl ? (
            <a href={repoUrl} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>
              how it works ↗
            </a>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

export default DevStats;
