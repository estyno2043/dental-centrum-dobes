import type { JSX, ReactNode } from "react";

/*
 * The fillings page's drawings, made for it on 2026-09-25. Inline SVG in the
 * page's own palette, every one decorative and `aria-hidden`: the page says
 * in words everything they show.
 */

const OUTLINE = "#9fb8b0";
const ENAMEL = "#fbfaf6";
const MINT = "#bfe3d6";
const MINT_DEEP = "#2f6f62";
const AMALGAM = "#6f7782";

/** A molar from the side, half with an old dark filling and half with a white one. */
export function ToothSplit({
  className,
  sparkleClassName,
}: {
  readonly className?: string;
  readonly sparkleClassName?: string;
}): JSX.Element {
  const tooth =
    "M50 72 C50 40 76 30 96 44 C111 32 131 32 146 44 C161 32 190 32 206 48 C216 62 215 92 209 122 C205 142 201 152 197 162 L187 230 C185 244 171 246 167 232 L151 172 C141 168 121 168 111 172 L95 232 C91 246 77 244 75 230 L65 162 C59 152 55 142 53 122 C49 102 50 88 50 72Z";
  const filling = "M92 56 C110 74 150 74 168 56 L163 86 C147 98 113 98 97 86Z";
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 260 280"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="fill-left">
          <rect height="280" width="130" x="0" y="0" />
        </clipPath>
        <clipPath id="fill-right">
          <rect height="280" width="130" x="130" y="0" />
        </clipPath>
        <linearGradient id="fill-metal" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#9aa2ac" />
          <stop offset="1" stopColor={AMALGAM} />
        </linearGradient>
      </defs>

      <ellipse cx="130" cy="262" fill="rgb(47 111 98 / 10%)" rx="70" ry="8" />
      <path d={tooth} fill={ENAMEL} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="5" />
      {/* shine */}
      <path d="M70 70 C72 56 82 48 94 50" stroke="#e3efeb" strokeLinecap="round" strokeWidth="7" />

      {/* the old filling, left */}
      <g clipPath="url(#fill-left)">
        <path d={filling} fill="url(#fill-metal)" stroke="#59616b" strokeWidth="2" />
        <path d="M100 66 C108 72 116 74 124 75" stroke="#c4cad1" strokeLinecap="round" strokeWidth="3" />
      </g>

      {/* the white one, right: all but invisible, which is the point */}
      <g clipPath="url(#fill-right)">
        <path d={filling} fill={ENAMEL} stroke={MINT} strokeDasharray="4 5" strokeWidth="2" />
      </g>

      {/* the dividing line */}
      <path d="M130 20 V250" stroke={MINT_DEEP} strokeDasharray="3 6" strokeLinecap="round" strokeOpacity="0.45" strokeWidth="2" />

      <path
        className={sparkleClassName}
        d="M206 20 Q208 30 218 32 Q208 34 206 44 Q204 34 194 32 Q204 30 206 20Z"
        fill={MINT_DEEP}
      />
      <path
        className={sparkleClassName}
        d="M226 92 Q227 98 233 99 Q227 100 226 106 Q225 100 219 99 Q225 98 226 92Z"
        fill="#7cc4ae"
      />
    </svg>
  );
}

/**
 * A molar seen from above between its two neighbours, with the three
 * surfaces a filling is priced by: the chewing surface in the middle and the
 * two sides that touch the neighbours. `count` lights one, two or three.
 */
export function SurfaceMap({
  className,
  count,
}: {
  readonly className?: string;
  readonly count: 1 | 2 | 3;
}): JSX.Element {
  const outline =
    "M112 50 C140 34 220 34 248 50 C268 62 272 90 270 114 C268 140 264 162 248 176 C220 192 140 192 112 176 C96 162 92 140 90 114 C88 90 92 62 112 50Z";
  const lit = (on: boolean) => (on ? MINT : "transparent");
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 360 226"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="surface-tooth">
          <path d={outline} />
        </clipPath>
      </defs>

      {/* the neighbours, cut off by the frame */}
      <path
        d="M-40 56 C-10 40 44 40 70 56 C86 68 88 94 86 116 C84 142 80 160 66 172 C40 188 -10 188 -40 172Z"
        fill="#f1f5f3"
        stroke={OUTLINE}
        strokeWidth="3"
      />
      <path
        d="M400 56 C370 40 316 40 290 56 C274 68 272 94 274 116 C276 142 280 160 294 172 C320 188 370 188 400 172Z"
        fill="#f1f5f3"
        stroke={OUTLINE}
        strokeWidth="3"
      />

      <path d={outline} fill={ENAMEL} />
      <g clipPath="url(#surface-tooth)">
        {/* the side towards the left neighbour */}
        <rect
          data-surface="mesial"
          fill={lit(count >= 2)}
          height="160"
          width="42"
          x="88"
          y="32"
        />
        {/* the chewing surface */}
        <path
          d="M140 78 C160 66 200 66 220 78 C232 92 232 132 220 146 C200 158 160 158 140 146 C128 132 128 92 140 78Z"
          data-surface="occlusal"
          fill={lit(count >= 1)}
        />
        {/* the side towards the right neighbour */}
        <rect
          data-surface="distal"
          fill={lit(count >= 3)}
          height="160"
          width="42"
          x="230"
          y="32"
        />
      </g>
      {/* grooves on the chewing surface */}
      <path
        d="M150 112 C166 100 176 124 190 110 C200 100 206 118 214 112 M180 84 C178 96 184 104 180 112 M182 116 C178 128 186 136 182 146"
        stroke="#a9bdb7"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path d={outline} stroke={OUTLINE} strokeLinejoin="round" strokeWidth="4" />

      {/* labels */}
      <g fill={MINT_DEEP} fontFamily="inherit" fontSize="12" fontWeight="600" textAnchor="middle">
        <text x="180" y="212">žuvacia</text>
        <text x="100" y="212">bočná</text>
        <text x="260" y="212">bočná</text>
      </g>
      <path d="M110 196 V184 M250 196 V184 M180 196 V160" stroke={MINT_DEEP} strokeOpacity="0.4" strokeWidth="1.5" />
    </svg>
  );
}

/* ---------------------------------------------------------------- icons --- */

type IconProps = { readonly className?: string };

function Icon({
  className,
  children,
}: IconProps & { readonly children: ReactNode }): JSX.Element {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

/** Size and depth: a cavity with depth marks. */
export function IconDepth(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M8 14 H40 V30 C40 38 34 42 24 42 C14 42 8 38 8 30Z" fill={ENAMEL} stroke={OUTLINE} strokeWidth="2.5" />
      <path d="M18 14 C18 24 20 28 24 28 C28 28 30 24 30 14" fill={MINT} stroke={MINT_DEEP} strokeWidth="2" />
      <path d="M36 6 V26 M33 23 L36 26 L39 23" stroke={MINT_DEEP} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </Icon>
  );
}

/** Where the tooth is: a row of teeth with one marked at the back. */
export function IconPosition(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      {[6, 16, 26].map((x) => (
        <rect fill={ENAMEL} height="18" key={x} rx="5" stroke={OUTLINE} strokeWidth="2" width="9" x={x} y="18" />
      ))}
      <rect fill={MINT} height="22" rx="6" stroke={MINT_DEEP} strokeWidth="2" width="10" x="36" y="16" />
      <circle cx="41" cy="10" fill={MINT_DEEP} r="3" />
    </Icon>
  );
}

/** Layers: stacked strips under a curing light. */
export function IconLayers(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M24 4 L28 12 H20Z" fill="#f7c948" />
      <path d="M24 12 L16 20 M24 12 L32 20" stroke="#f7c948" strokeLinecap="round" strokeWidth="2" />
      {[24, 31, 38].map((y, i) => (
        <rect
          fill={i === 0 ? MINT : ENAMEL}
          height="6"
          key={y}
          rx="3"
          stroke={i === 0 ? MINT_DEEP : OUTLINE}
          strokeWidth="2"
          width="28"
          x="10"
          y={y}
        />
      ))}
    </Icon>
  );
}
