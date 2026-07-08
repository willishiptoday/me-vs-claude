import * as React from "react";

export interface Accent {
  name: string;
  /** CSS color for --mvc-accent. Empty string = monochrome (falls back to the ink color). */
  value: string;
}

/** Default palette. "Claude" (terracotta) leads because, well, look where you are. */
export const ACCENTS: Accent[] = [
  { name: "Claude", value: "#d97757" },
  { name: "Ember", value: "#e0913a" },
  { name: "Matcha", value: "#4a9d5b" },
  { name: "Cobalt", value: "#4b74e0" },
  { name: "Grape", value: "#8b5cf6" },
  { name: "Rose", value: "#e0558a" },
  { name: "Mono", value: "" },
];

export function ThemePicker({
  accents = ACCENTS,
  value,
  onChange,
}: {
  accents?: Accent[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mvc-themepicker" role="group" aria-label="Accent color">
      <span className="mvc-themepicker-label">Pick a color</span>
      {accents.map((a) => {
        const mono = a.value === "";
        return (
          <button
            key={a.name}
            type="button"
            className={mono ? "mvc-swatch mvc-swatch-mono" : "mvc-swatch"}
            style={mono ? undefined : ({ ["--sw" as string]: a.value } as React.CSSProperties)}
            aria-label={a.name}
            aria-pressed={value === a.value}
            title={a.name}
            onClick={() => onChange(a.value)}
          />
        );
      })}
    </div>
  );
}
