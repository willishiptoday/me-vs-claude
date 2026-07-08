import * as React from "react";
import type { DevStatsData } from "../types";
import { CSS } from "./styles";
import { CommitWall } from "./CommitWall";
import { MeVsClaude } from "./MeVsClaude";
import { Receipt } from "./Receipt";
import { longDate } from "./format";

export interface DevStatsProps {
  data: DevStatsData;
  /** Extra class on the root (the host maps its theme tokens onto --mvc-* here). */
  className?: string;
  style?: React.CSSProperties;
  /** Rendered at the top, inside the themed container (e.g. a ThemePicker). */
  header?: React.ReactNode;
  /** Link shown in the footer for the "how it works" tell. */
  repoUrl?: string;
  /** Hide the auto-generated footer note. */
  hideFooter?: boolean;
}

/**
 * <DevStats/> — a GitHub commit wall, a "Me vs Claude" 5-hour-war scoreboard, and a paper
 * receipt of Claude Code usage, rendered from a DevStatsData object.
 *
 * Self-contained styling: theme it by setting the --mvc-* CSS variables on `style`/`className`.
 */
export function DevStats({ data, className, style, header, repoUrl, hideFooter }: DevStatsProps) {
  const { github, claude, scoreboard } = data;
  return (
    <div className={className ? `mvc ${className}` : "mvc"} style={style}>
      <style>{CSS}</style>

      {header}
      {github ? <CommitWall github={github} /> : null}
      <MeVsClaude scoreboard={scoreboard} />
      {claude ? <Receipt claude={claude} scoreboard={scoreboard} /> : null}

      {!hideFooter ? (
        <p className="mvc-foot">
          Auto-updated {longDate(data.generatedAt)} from my own GitHub + Claude Code logs — the numbers are real, the
          smugness is optional.{" "}
          {repoUrl ? (
            <a href={repoUrl} target="_blank" rel="noreferrer">
              how it works ↗
            </a>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

export default DevStats;
