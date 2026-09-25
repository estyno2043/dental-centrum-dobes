import type { JSX, ReactNode } from "react";

/*
 * The prosthetics page's drawings, made for it on 2026-09-25: ivory teeth on
 * a bronze line with gold details, in the clinic's own colours. Decorative
 * and `aria-hidden`; the page says in words everything they show.
 */

const IVORY = "#fbf8f1";
const OUTLINE = "#c2ab8c";
const BRONZE = "#74563a";
const GOLD = "#c9a86a";
const GUM = "#f1c9c9";

/**
 * A gap between two teeth, and the bridge that fills it, hovering above and
 * about to settle: two crowns joined by the tooth in the middle.
 */
export function BridgeScene({
  className,
  floatClassName,
}: {
  readonly className?: string;
  readonly floatClassName?: string;
}): JSX.Element {
  /* A prepared tooth: a stump on a root, standing in the gum. */
  const stump = (x: number) => (
    <g transform={`translate(${x} 0)`}>
      <path d="M8 190 L14 250 C16 262 34 262 36 250 L42 190Z" fill={IVORY} stroke={OUTLINE} strokeWidth="3" />
      <path d="M4 150 C4 140 10 134 18 134 H32 C40 134 46 140 46 150 L44 192 H6Z" fill="#f4efe4" stroke={OUTLINE} strokeWidth="3" />
    </g>
  );
  /* A crown, 60 wide. */
  const crown = (x: number) =>
    `M${x + 4} 44 C${x + 4} 30 ${x + 14} 24 ${x + 30} 24 C${x + 46} 24 ${x + 56} 30 ${x + 56} 44 L${x + 54} 100 C${x + 54} 110 ${x + 46} 116 ${x + 30} 116 C${x + 14} 116 ${x + 6} 110 ${x + 6} 100Z`;
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 320 290"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* the gum line */}
      <path d="M12 200 C62 184 258 184 308 200 V262 C308 276 298 286 284 286 H36 C22 286 12 276 12 262Z" fill={GUM} />
      <path d="M12 200 C62 184 258 184 308 200" stroke="#e3a9ab" strokeLinecap="round" strokeWidth="3" />
      {stump(56)}
      {stump(218)}

      {/* the bridge, above the gap */}
      <g className={floatClassName}>
        <rect fill={GOLD} height="20" rx="10" width="190" x="65" y="64" />
        <path d={crown(46)} fill={IVORY} stroke={OUTLINE} strokeWidth="3" />
        <path d={crown(130)} fill={IVORY} stroke={BRONZE} strokeWidth="3" />
        <path d={crown(214)} fill={IVORY} stroke={OUTLINE} strokeWidth="3" />
        {/* shine */}
        <path d="M62 44 C64 36 70 32 78 32" stroke="#fff" strokeLinecap="round" strokeWidth="5" />
        <path d="M146 44 C148 36 154 32 162 32" stroke="#fff" strokeLinecap="round" strokeWidth="5" />
        <path d="M230 44 C232 36 238 32 246 32" stroke="#fff" strokeLinecap="round" strokeWidth="5" />
      </g>

      {/* where it goes */}
      <path d="M76 124 V142 M160 124 V176 M244 124 V142" stroke={BRONZE} strokeDasharray="4 6" strokeLinecap="round" strokeOpacity="0.55" strokeWidth="2.5" />
      <path d="M154 170 L160 178 L166 170" stroke={BRONZE} strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.55" strokeWidth="2.5" />
    </svg>
  );
}

type IconProps = { readonly className?: string };

function Icon({ className, children }: IconProps & { readonly children: ReactNode }): JSX.Element {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

const smallTooth = (x: number, stroke: string) => (
  <path
    d={`M${x} 16 C${x} 11 ${x + 3} 9 ${x + 6} 9 C${x + 9} 9 ${x + 12} 11 ${x + 12} 16 L${x + 11} 28 C${x + 11} 31 ${x + 9} 32 ${x + 6} 32 C${x + 3} 32 ${x + 1} 31 ${x + 1} 28Z`}
    fill={IVORY}
    stroke={stroke}
    strokeWidth="2"
  />
);

/** Three crowns joined: a bridge. */
export function IconBridge(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <rect fill={GOLD} height="6" rx="3" width="34" x="7" y="17" />
      {smallTooth(4, OUTLINE)}
      {smallTooth(18, BRONZE)}
      {smallTooth(32, OUTLINE)}
      <path d="M4 38 H44" stroke={GUM} strokeLinecap="round" strokeWidth="4" />
    </Icon>
  );
}

/** A row of teeth on a gum-coloured base: a denture. */
export function IconDenture(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4 26 C10 38 38 38 44 26 L44 32 C38 44 10 44 4 32Z" fill={GUM} stroke="#e3a9ab" strokeWidth="1.5" />
      {[6, 14, 22, 30, 38].map((x) => (
        <rect fill={IVORY} height="14" key={x} rx="3" stroke={OUTLINE} strokeWidth="1.5" width="7" x={x - 2} y={14 + Math.abs(24 - x) * 0.25} />
      ))}
    </Icon>
  );
}

/** A denture on two implant posts. */
export function IconImplantDenture(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d="M4 16 C10 26 38 26 44 16 L44 22 C38 32 10 32 4 22Z" fill={GUM} stroke="#e3a9ab" strokeWidth="1.5" />
      {[8, 16, 24, 32].map((x) => (
        <rect fill={IVORY} height="10" key={x} rx="3" stroke={OUTLINE} strokeWidth="1.5" width="7" x={x} y="6" />
      ))}
      {[14, 30].map((x) => (
        <g key={x}>
          <rect fill="#d6c4a5" height="16" rx="2" width="6" x={x} y="28" />
          <path d={`M${x} 32 H${x + 6} M${x} 36 H${x + 6} M${x} 40 H${x + 6}`} stroke={BRONZE} strokeWidth="1.2" />
        </g>
      ))}
    </Icon>
  );
}
