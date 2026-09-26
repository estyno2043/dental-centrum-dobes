import type { JSX, ReactNode } from "react";

/*
 * The surgery page's drawings, made for it on 2026-09-26 in the clinic's warm
 * colours: ivory teeth, a walnut line, and a soft clay for what is being
 * treated. Decorative and `aria-hidden`; the page says it all in words.
 */

const IVORY = "#fbf8f1";
const OUTLINE = "#c2ab8c";
const WALNUT = "#5a4332";
const CLAY = "#b9785c";
const CLAY_SOFT = "#f5e8e0";
const GUM = "#f0cdc6";

/*
 * A molar standing in the gum: crown from y 40 to 110, roots to 200.
 * `tilt` rotates it about the gum line for the wisdom tooth.
 */
function Molar({
  x,
  y = 0,
  tilt = 0,
  stroke = OUTLINE,
  fill = IVORY,
  dashed = false,
}: {
  readonly x: number;
  readonly y?: number;
  readonly tilt?: number;
  readonly stroke?: string;
  readonly fill?: string;
  readonly dashed?: boolean;
}): JSX.Element {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt} 34 120)`}>
      <path
        d="M4 62 C4 42 14 36 24 42 C30 36 38 36 44 42 C54 36 64 42 64 62 C64 84 62 100 58 112 L52 196 C50 206 42 206 40 196 L36 140 C35 132 33 132 32 140 L28 196 C26 206 18 206 16 196 L10 112 C6 100 4 84 4 62Z"
        fill={fill}
        stroke={stroke}
        strokeDasharray={dashed ? "6 6" : undefined}
        strokeLinejoin="round"
        strokeWidth="3"
      />
      {!dashed ? (
        <path d="M14 58 C16 50 22 46 28 47" stroke="#fff" strokeLinecap="round" strokeWidth="4" />
      ) : null}
    </g>
  );
}

/**
 * Two molars and a wisdom tooth behind them, lying crooked under the gum,
 * with a dashed line showing the way it comes out. Calm, not graphic: no
 * blood, no instruments.
 */
export function WisdomScene({
  className,
  pathClassName,
}: {
  readonly className?: string;
  readonly pathClassName?: string;
}): JSX.Element {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 320 300" xmlns="http://www.w3.org/2000/svg">
      {/* bone and gum */}
      <path d="M8 120 C70 108 250 108 312 120 V268 C312 282 302 292 288 292 H32 C18 292 8 282 8 268Z" fill={CLAY_SOFT} />
      <path d="M8 120 C70 108 250 108 312 120 V150 C250 140 70 140 8 150Z" fill={GUM} />

      <Molar x={24} y={0} />
      <Molar x={100} y={0} />

      {/* the wisdom tooth, crooked and still under the gum */}
      <Molar fill="#fffaf2" stroke={CLAY} tilt={-38} x={206} y={86} />

      {/* where it goes: up and out */}
      <g className={pathClassName}>
        <Molar dashed stroke={CLAY} tilt={0} x={214} y={-30} />
      </g>
      <path
        d="M252 150 C258 118 258 96 254 70"
        stroke={CLAY}
        strokeDasharray="4 7"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path d="M247 78 L254 68 L261 78" stroke={CLAY} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />

      {/* a small sparkle: done */}
      <path d="M40 22 Q42 30 50 32 Q42 34 40 42 Q38 34 30 32 Q38 30 40 22Z" fill="#c9a86a" />
    </svg>
  );
}

/* ---------------------------------------------------------------- icons --- */

type IconProps = { readonly className?: string };

function Icon({ className, children }: IconProps & { readonly children: ReactNode }): JSX.Element {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

const tooth =
  "M12 16 C12 11 16 9 19 11 C21 9 27 9 29 11 C32 9 36 11 36 16 C36 22 35 26 34 29 L32 40 C31 43 28 43 28 40 L26 32 C25 30 23 30 22 32 L20 40 C20 43 17 43 16 40 L14 29 C13 26 12 22 12 16Z";

/** A tilted tooth: wisdom teeth. */
export function IconWisdom(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4 30 H44" stroke={GUM} strokeLinecap="round" strokeWidth="4" />
      <g transform="rotate(28 24 26)">
        <path d={tooth} fill={IVORY} stroke={CLAY} strokeWidth="2" />
      </g>
    </Icon>
  );
}

/** A tooth lifted out of the gum line. */
export function IconExtraction(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4 40 H44" stroke={GUM} strokeLinecap="round" strokeWidth="4" />
      <g transform="translate(0 -6)">
        <path d={tooth} fill={IVORY} stroke={OUTLINE} strokeWidth="2" />
      </g>
      <path d="M40 30 V14 M36 18 L40 13 L44 18" stroke={WALNUT} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </Icon>
  );
}

/** A root with its tip marked. */
export function IconResection(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d={tooth} fill={IVORY} stroke={OUTLINE} strokeWidth="2" />
      <circle cx="18" cy="41" fill={CLAY_SOFT} r="5" stroke={CLAY} strokeWidth="2" />
    </Icon>
  );
}

/** An implant post under a crown. */
export function IconImplant(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M14 8 C14 5 17 4 24 4 C31 4 34 5 34 8 L33 17 C33 19 31 20 24 20 C17 20 15 19 15 17Z" fill={IVORY} stroke={OUTLINE} strokeWidth="2" />
      <rect fill="#d6c4a5" height="4" rx="1" width="10" x="19" y="20" />
      <path d="M19 24 H29 L27 44 H21Z" fill="#d6c4a5" stroke={WALNUT} strokeWidth="1.5" />
      <path d="M19.5 29 H28.5 M20 34 H28 M20.5 39 H27.5" stroke={WALNUT} strokeWidth="1.5" />
    </Icon>
  );
}

/** Lip and gum, for procedures on the mucosa. */
export function IconMucosa(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M6 20 C14 12 34 12 42 20 C34 26 14 26 6 20Z" fill={GUM} stroke={CLAY} strokeWidth="2" />
      <path d="M6 20 C14 34 34 34 42 20" fill={CLAY_SOFT} stroke={CLAY} strokeWidth="2" />
      <path d="M24 16 V26" stroke={WALNUT} strokeLinecap="round" strokeWidth="2" />
    </Icon>
  );
}
