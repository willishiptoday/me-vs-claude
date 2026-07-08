// Self-contained stylesheet for <DevStats/>. Injected once via a <style> tag so the
// component works in any React setup with no CSS bundler config.
//
// Theme by overriding these CSS variables on the container (or any ancestor). Defaults are
// a neutral light/dark-agnostic look; a host design system maps its own tokens onto them.
// `--mvc-accent` is the one people usually swap for color (see the ThemePicker).

export const CSS = `
.mvc {
  --mvc-ink: currentColor;
  --mvc-muted: color-mix(in oklch, currentColor 55%, transparent);
  --mvc-faint: color-mix(in oklch, currentColor 12%, transparent);
  --mvc-border: color-mix(in oklch, currentColor 16%, transparent);
  --mvc-surface: color-mix(in oklch, currentColor 4%, transparent);
  --mvc-accent: currentColor;
  --mvc-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  --mvc-radius: 12px;

  color: var(--mvc-ink);
  font-variant-numeric: tabular-nums;
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
}
.mvc *, .mvc *::before, .mvc *::after { box-sizing: border-box; }

.mvc-block { display: flex; flex-direction: column; gap: 0.85rem; }
.mvc-kicker {
  font-family: var(--mvc-mono);
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--mvc-muted); margin: 0;
}
.mvc-lead { font-size: 0.95rem; line-height: 1.55; margin: 0; color: var(--mvc-ink); }
.mvc-lead .mvc-big { font-family: var(--mvc-mono); font-weight: 600; font-size: 1.12em; color: var(--mvc-accent); }
.mvc-sub { color: var(--mvc-muted); }

.mvc-pill {
  display: inline-flex; align-items: center; gap: 0.4em;
  border: 1px solid var(--mvc-border); border-radius: 999px;
  padding: 0.22rem 0.62rem; font-size: 0.72rem; font-family: var(--mvc-mono);
  color: var(--mvc-muted); white-space: nowrap;
}
.mvc-pill.mvc-live { color: var(--mvc-accent); border-color: var(--mvc-accent); }
.mvc-pill-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--mvc-accent);
  box-shadow: 0 0 0 0 var(--mvc-accent); animation: mvc-ping 2s ease-out infinite; }
@keyframes mvc-ping { 0% { box-shadow: 0 0 0 0 color-mix(in oklch, var(--mvc-accent) 60%, transparent); } 70%,100% { box-shadow: 0 0 0 6px transparent; } }

/* ============ Theme picker ============ */
.mvc-themepicker { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.mvc-themepicker-label { font-family: var(--mvc-mono); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mvc-muted); margin-right: 0.15rem; }
.mvc-swatch {
  width: 22px; height: 22px; border-radius: 999px; padding: 0; cursor: pointer;
  border: 2px solid var(--mvc-border); background: var(--sw); transition: transform 140ms ease, box-shadow 140ms ease;
}
.mvc-swatch:hover { transform: scale(1.12); }
.mvc-swatch[aria-pressed="true"] { border-color: var(--mvc-ink); box-shadow: 0 0 0 2px var(--mvc-bg, transparent), 0 0 0 3px var(--sw); }
.mvc-swatch.mvc-swatch-mono { background: linear-gradient(135deg, var(--mvc-ink) 50%, color-mix(in oklch, var(--mvc-ink) 25%, transparent) 50%); }

/* ============ Commit wall ============ */
.mvc-heat-scroll { overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; }
.mvc-heat { display: grid; grid-auto-flow: column; grid-template-rows: repeat(7, 11px); grid-auto-columns: 11px; gap: 3px; width: max-content; }
.mvc-cell { width: 11px; height: 11px; border-radius: 2px; background: var(--mvc-surface); outline: 1px solid color-mix(in oklch, var(--mvc-border) 40%, transparent); outline-offset: -1px; }
.mvc-cell[data-l="1"] { background: color-mix(in oklch, var(--mvc-accent) 30%, transparent); }
.mvc-cell[data-l="2"] { background: color-mix(in oklch, var(--mvc-accent) 52%, transparent); }
.mvc-cell[data-l="3"] { background: color-mix(in oklch, var(--mvc-accent) 76%, transparent); }
.mvc-cell[data-l="4"] { background: var(--mvc-accent); }
.mvc-heat-foot { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; font-family: var(--mvc-mono); font-size: 0.68rem; color: var(--mvc-muted); }
.mvc-legend { display: inline-flex; align-items: center; gap: 4px; }
.mvc-legend .mvc-cell { outline: none; }

/* ============ Me vs Claude — the 5-hour war ============ */
.mvc-war { display: flex; flex-direction: column; gap: 0.9rem; }
.mvc-war-heads { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; }
.mvc-war-side { display: flex; flex-direction: column; gap: 0.1rem; }
.mvc-war-side.mvc-side-r { align-items: flex-end; text-align: right; }
.mvc-war-n { font-family: var(--mvc-mono); font-weight: 700; font-size: clamp(2rem, 8vw, 3rem); line-height: 0.95; letter-spacing: -0.03em; }
.mvc-war-n.mvc-me { color: var(--mvc-accent); }
.mvc-war-n.mvc-claude { color: var(--mvc-muted); }
.mvc-war-label { font-family: var(--mvc-mono); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mvc-muted); }
.mvc-vs { font-family: var(--mvc-mono); font-size: 0.8rem; color: var(--mvc-muted); align-self: center; padding-bottom: 0.4rem; }

.mvc-hp { position: relative; height: 14px; border-radius: 999px; overflow: hidden; border: 1px solid var(--mvc-border); background: var(--mvc-surface); }
.mvc-hp-fill { position: absolute; inset: 0 auto 0 0; width: var(--mvc-me-pct, 2%); min-width: 3px; background: var(--mvc-accent);
  border-radius: 999px 0 0 999px; transition: width 1100ms cubic-bezier(0.16,1,0.3,1); }
.mvc-hp-fill::after { content: ""; position: absolute; right: -1px; top: -3px; bottom: -3px; width: 2px; background: var(--mvc-accent);
  box-shadow: 0 0 8px 1px var(--mvc-accent); }
.mvc-war-caption { font-size: 0.85rem; line-height: 1.5; margin: 0; color: var(--mvc-muted); }
.mvc-war-caption b { color: var(--mvc-ink); font-weight: 600; }

.mvc-trophies { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.mvc-trophy { display: flex; align-items: baseline; gap: 0.5rem; border: 1px solid var(--mvc-border); border-radius: var(--mvc-radius); padding: 0.6rem 0.8rem; flex: 1 1 9rem; }
.mvc-trophy-n { font-family: var(--mvc-mono); font-weight: 700; font-size: 1.5rem; line-height: 1; letter-spacing: -0.02em; color: var(--mvc-accent); }
.mvc-trophy-n.mvc-trophy-zero { color: var(--mvc-ink); }
.mvc-trophy-t { font-size: 0.72rem; line-height: 1.35; color: var(--mvc-muted); }
.mvc-trophy-t b { color: var(--mvc-ink); font-weight: 600; }

/* ============ The Receipt (always paper, pops in dark mode) ============ */
.mvc-receipt-wrap { display: flex; justify-content: center; }
.mvc-receipt {
  --paper: #f4efe4; --pink: #1c1917; --pfaint: rgba(28,25,23,0.5); --pline: rgba(28,25,23,0.28);
  position: relative; width: 100%; max-width: 22rem;
  background: var(--paper); color: var(--pink);
  font-family: var(--mvc-mono); font-size: 12px; line-height: 1.7;
  padding: 1.6rem 1.4rem 1.9rem; transform: rotate(-0.6deg);
  box-shadow: 0 20px 45px -20px rgba(0,0,0,0.55), 0 2px 6px -2px rgba(0,0,0,0.3);
  -webkit-mask:
    linear-gradient(#000 0 0) center/100% calc(100% - 16px) no-repeat,
    conic-gradient(from -45deg at top, #0000 25%, #000 0) top/17px 8px repeat-x,
    conic-gradient(from 135deg at bottom, #0000 25%, #000 0) bottom/17px 8px repeat-x;
          mask:
    linear-gradient(#000 0 0) center/100% calc(100% - 16px) no-repeat,
    conic-gradient(from -45deg at top, #0000 25%, #000 0) top/17px 8px repeat-x,
    conic-gradient(from 135deg at bottom, #0000 25%, #000 0) bottom/17px 8px repeat-x;
}
.mvc-r-center { text-align: center; }
.mvc-r-title { font-weight: 700; font-size: 15px; letter-spacing: 0.16em; }
.mvc-r-meta { color: var(--pfaint); font-size: 10.5px; letter-spacing: 0.04em; }
.mvc-r-rule { border: none; border-top: 1px dashed var(--pline); margin: 0.7rem 0; }
.mvc-r-row { display: flex; justify-content: space-between; gap: 0.75rem; }
.mvc-r-row .mvc-r-q { color: var(--pfaint); }
.mvc-r-row.mvc-r-total { font-weight: 700; font-size: 14px; }
.mvc-r-accent { color: var(--mvc-accent); font-weight: 700; }
.mvc-r-tag { display: inline-block; border: 1.5px solid var(--mvc-accent); color: var(--mvc-accent); border-radius: 4px; padding: 0 4px; transform: rotate(-3deg); font-weight: 700; letter-spacing: 0.06em; }
.mvc-barcode { display: flex; gap: 2px; justify-content: center; height: 42px; margin: 0.4rem 0 0.3rem; align-items: stretch; }
.mvc-barcode span { background: var(--pink); }
.mvc-r-thanks { text-align: center; letter-spacing: 0.14em; font-size: 10.5px; color: var(--pfaint); }

/* ============ Footer ============ */
.mvc-foot { font-family: var(--mvc-mono); font-size: 0.66rem; color: var(--mvc-muted); margin: 0; padding-top: 0.25rem; }
.mvc-foot a { color: var(--mvc-accent); }

@media (max-width: 480px) {
  .mvc-trophy-n { font-size: 1.3rem; }
  .mvc-receipt { transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .mvc-hp-fill { transition: none; }
  .mvc-pill-dot { animation: none; }
}
`;
