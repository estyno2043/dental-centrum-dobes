import type { JSX } from "react";

/*
 * A shade guide, drawn: the fan of tooth-shaped tabs a dentist holds against
 * a tooth to match its colour, running from a warm natural shade to the
 * brightest white. Added 2026-09-24 when the user found the page plain; it is
 * the one object that says "aesthetic dentistry" before a word is read.
 *
 * Decorative and `aria-hidden`. The labels are the familiar shade codes, set
 * small, for the texture of the real thing; they are not a claim about which
 * shades the clinic uses.
 */
const TABS = [
  { code: "A3", fill: "#e8d3ac" },
  { code: "A2", fill: "#eedcbd" },
  { code: "A1", fill: "#f3e6cf" },
  { code: "B1", fill: "#f6eedf" },
  { code: "BL2", fill: "#faf6ee" },
  { code: "BL1", fill: "#ffffff" },
] as const;

/* One incisor-shaped tab, 40 wide, hanging from y = 0. */
const TAB =
  "M6 26 C6 18 12 14 20 14 C28 14 34 18 34 26 L34 70 C34 90 29 104 20 104 C11 104 6 90 6 70Z";

export function ShadeGuide({
  className,
  sparkleClassName,
}: {
  readonly className?: string;
  readonly sparkleClassName?: string;
}): JSX.Element {
  const step = 52;
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 340 176"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shade-bar" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#d9c4a0" />
          <stop offset="1" stopColor="#b3935f" />
        </linearGradient>
        <linearGradient id="shade-gloss" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* the holder bar */}
      <rect fill="url(#shade-bar)" height="10" rx="5" width="316" x="12" y="14" />

      {TABS.map((tab, i) => {
        const x = 16 + i * step;
        return (
          <g key={tab.code} transform={`translate(${x} 6)`}>
            {/* the stem that clips onto the bar */}
            <rect fill="#9e9a92" height="16" rx="2" width="6" x="17" y="4" />
            <path
              d={TAB}
              fill={tab.fill}
              stroke="rgb(138 115 88 / 38%)"
              strokeWidth="1.5"
            />
            {/* a streak of gloss down each tab */}
            <path
              d="M12 30 C12 24 15 21 19 20 L19 78 C15 76 12 70 12 62Z"
              fill="url(#shade-gloss)"
              opacity="0.8"
            />
            <text
              fill="rgb(38 38 42 / 55%)"
              fontFamily="inherit"
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.06em"
              textAnchor="middle"
              x="20"
              y="126"
            >
              {tab.code}
            </text>
          </g>
        );
      })}

      {/* the brightest tab catches the light */}
      <path
        className={sparkleClassName}
        d="M318 42 Q320 50 328 52 Q320 54 318 62 Q316 54 308 52 Q316 50 318 42Z"
        fill="#c9a86a"
      />
      <path
        className={sparkleClassName}
        d="M300 150 Q301 155 306 156 Q301 157 300 162 Q299 157 294 156 Q299 155 300 150Z"
        fill="#c9a86a"
      />
    </svg>
  );
}
