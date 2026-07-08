// Self-contained stylesheet for <DevStats/>. Injected once via a <style> tag so the
// component works in any React setup with no CSS bundler config.
//
// Theme by overriding these CSS variables on the container (or any ancestor). Defaults are
// a neutral light/dark-agnostic look; a host design system maps its own tokens onto them.

export const CSS = `
.mvc {
  /* --- theming surface (override these) --- */
  --mvc-ink: currentColor;
  --mvc-muted: color-mix(in oklch, currentColor 55%, transparent);
  --mvc-faint: color-mix(in oklch, currentColor 12%, transparent);
  --mvc-border: color-mix(in oklch, currentColor 16%, transparent);
  --mvc-surface: color-mix(in oklch, currentColor 4%, transparent);
  --mvc-accent: currentColor;
  --mvc-win: currentColor;                 /* "me" side of the versus bar */
  --mvc-lose: color-mix(in oklch, currentColor 22%, transparent); /* Claude's side */
  --mvc-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  --mvc-radius: 12px;

  color: var(--mvc-ink);
  font-variant-numeric: tabular-nums;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.mvc *, .mvc *::before, .mvc *::after { box-sizing: border-box; }

.mvc-block { display: flex; flex-direction: column; gap: 0.85rem; }

.mvc-kicker {
  font-family: var(--mvc-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--mvc-muted);
  margin: 0;
}

.mvc-lead {
  font-size: 0.95rem;
  line-height: 1.55;
  margin: 0;
  color: var(--mvc-ink);
}
.mvc-lead .mvc-big {
  font-family: var(--mvc-mono);
  font-weight: 600;
  font-size: 1.15em;
}
.mvc-sub { color: var(--mvc-muted); }

/* --- pills / trophies --- */
.mvc-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  border: 1px solid var(--mvc-border);
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.72rem;
  font-family: var(--mvc-mono);
  color: var(--mvc-muted);
  white-space: nowrap;
}
.mvc-pill.mvc-live { color: var(--mvc-ink); border-color: var(--mvc-ink); }
.mvc-pill-dot {
  width: 6px; height: 6px; border-radius: 999px;
  background: var(--mvc-win);
}

/* ============ Commit wall ============ */
.mvc-heat-scroll { overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; }
.mvc-heat {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, 11px);
  grid-auto-columns: 11px;
  gap: 3px;
  width: max-content;
}
.mvc-cell {
  width: 11px; height: 11px;
  border-radius: 2px;
  background: var(--mvc-surface);
  outline: 1px solid color-mix(in oklch, var(--mvc-border) 40%, transparent);
  outline-offset: -1px;
}
.mvc-cell[data-l="1"] { background: color-mix(in oklch, var(--mvc-accent) 28%, transparent); }
.mvc-cell[data-l="2"] { background: color-mix(in oklch, var(--mvc-accent) 50%, transparent); }
.mvc-cell[data-l="3"] { background: color-mix(in oklch, var(--mvc-accent) 74%, transparent); }
.mvc-cell[data-l="4"] { background: var(--mvc-accent); }

.mvc-heat-foot {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; flex-wrap: wrap;
  font-family: var(--mvc-mono); font-size: 0.68rem; color: var(--mvc-muted);
}
.mvc-legend { display: inline-flex; align-items: center; gap: 4px; }
.mvc-legend .mvc-cell { outline: none; }

/* ============ Me vs Claude bar ============ */
.mvc-versus { display: flex; flex-direction: column; gap: 0.55rem; }
.mvc-versus-heads {
  display: flex; justify-content: space-between; align-items: baseline;
  font-family: var(--mvc-mono); font-size: 0.78rem;
}
.mvc-versus-heads b { font-size: 0.95rem; }
.mvc-versus-heads .mvc-side-claude { color: var(--mvc-muted); text-align: right; }

.mvc-bar {
  position: relative;
  height: 20px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--mvc-border);
  display: flex;
  background: var(--mvc-lose);
}
.mvc-bar-me {
  background: var(--mvc-win);
  min-width: 6px;
  width: var(--mvc-me-pct, 50%);
  transition: width 900ms cubic-bezier(0.16, 1, 0.3, 1);
}
.mvc-bar-tick {
  position: absolute; top: 50%; left: 50%;
  width: 1px; height: 200%;
  transform: translate(-50%, -50%);
  background: color-mix(in oklch, var(--mvc-border) 80%, transparent);
}

.mvc-trophies { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.mvc-trophy {
  display: flex; align-items: baseline; gap: 0.5rem;
  border: 1px solid var(--mvc-border);
  border-radius: var(--mvc-radius);
  padding: 0.6rem 0.8rem;
  flex: 1 1 8rem;
}
.mvc-trophy-n {
  font-family: var(--mvc-mono); font-weight: 700; font-size: 1.5rem; line-height: 1;
  letter-spacing: -0.02em;
}
.mvc-trophy-zero { color: var(--mvc-ink); }
.mvc-trophy-t { font-size: 0.72rem; line-height: 1.35; color: var(--mvc-muted); }
.mvc-trophy-t b { color: var(--mvc-ink); font-weight: 600; }

.mvc-roi { font-size: 0.92rem; line-height: 1.5; margin: 0; }
.mvc-roi .mvc-big { font-family: var(--mvc-mono); font-weight: 600; }

/* ============ Stats strip ============ */
.mvc-figs { display: flex; flex-wrap: wrap; gap: 1.2rem 2rem; }
.mvc-fig { display: flex; flex-direction: column; gap: 0.1rem; }
.mvc-fig-n {
  font-family: var(--mvc-mono); font-size: 1.35rem; font-weight: 600;
  letter-spacing: -0.02em; line-height: 1;
}
.mvc-fig-l { font-size: 0.72rem; color: var(--mvc-muted); }

.mvc-split { display: flex; flex-direction: column; gap: 0.45rem; }
.mvc-split-bar {
  display: flex; height: 10px; border-radius: 999px; overflow: hidden;
  border: 1px solid var(--mvc-border);
}
.mvc-split-seg { height: 100%; min-width: 2px; }
.mvc-split-legend {
  display: flex; flex-wrap: wrap; gap: 0.4rem 1rem;
  font-family: var(--mvc-mono); font-size: 0.7rem; color: var(--mvc-muted);
}
.mvc-split-key { display: inline-flex; align-items: center; gap: 0.4rem; }
.mvc-split-swatch { width: 9px; height: 9px; border-radius: 2px; }
.mvc-split-key b { color: var(--mvc-ink); font-weight: 600; }

.mvc-foot {
  font-family: var(--mvc-mono); font-size: 0.66rem; color: var(--mvc-muted);
  margin: 0; padding-top: 0.25rem;
}

@media (max-width: 480px) {
  .mvc-fig-n { font-size: 1.15rem; }
  .mvc-trophy-n { font-size: 1.3rem; }
}

@media (prefers-reduced-motion: reduce) {
  .mvc-bar-me { transition: none; }
}
`;
