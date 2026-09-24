import type { JSX } from "react";

/*
 * The children's page's own illustrations, drawn for it on 2026-09-24 when the
 * user asked for the page to feel more like it was made for children: a
 * cartoon tooth, a toothbrush, and a small sticker for each step of the visit.
 *
 * Inline SVG rather than images: a few hundred bytes each, sharp at any size,
 * and coloured from the page's own palette. Every one is decorative and
 * `aria-hidden`; the page says everything in words, and a screen reader
 * announcing "smiling tooth" would add nothing a parent needs.
 */

const INK = "#2b2f3a";
const OUTLINE = "#9cc0e6";
const PINK = "#f39bb0";
const TEAL = "#5cc6bd";
const YELLOW = "#f7c948";
const BLUE = "#8ec5f0";

/** A four-pointed sparkle centred on (x, y). */
function Sparkle({
  x,
  y,
  r,
  fill,
  className,
}: {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly fill: string;
  readonly className?: string;
}): JSX.Element {
  const k = r * 0.28;
  return (
    <path
      className={className}
      d={`M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r}Z`}
      fill={fill}
    />
  );
}

/**
 * The page's mascot: a smiling tooth waving with one hand and holding a
 * toothbrush in the other. `sparkleClassName` lets the page twinkle the
 * sparkles without the drawing knowing about motion.
 */
export function ToothBuddy({
  className,
  sparkleClassName,
}: {
  readonly className?: string;
  readonly sparkleClassName?: string;
}): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 260 270"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* the floor shadow */}
      <ellipse cx="124" cy="252" fill="rgb(63 109 153 / 12%)" rx="62" ry="9" />

      {/* the waving arm, behind the body */}
      <path
        d="M66 132 C48 128 38 112 34 96"
        stroke={OUTLINE}
        strokeLinecap="round"
        strokeWidth="7"
      />
      <circle cx="33" cy="90" fill="#fff" r="10" stroke={OUTLINE} strokeWidth="5" />

      {/* the toothbrush, held up on the right */}
      <g transform="rotate(24 214 120)">
        <rect fill={TEAL} height="118" rx="8" width="16" x="206" y="70" />
        <rect fill="#fff" height="30" opacity="0.35" rx="3" width="5" x="210" y="120" />
        <rect fill={TEAL} height="30" rx="7" width="22" x="203" y="44" />
        {[0, 1, 2, 3].map((i) => (
          <rect
            fill={i % 2 ? BLUE : "#fff"}
            height="7"
            key={i}
            rx="3"
            stroke={OUTLINE}
            strokeWidth="1.5"
            width="18"
            x="187"
            y={46 + i * 7}
          />
        ))}
        {/* a curl of paste on the bristles */}
        <path
          d="M188 44 C182 36 186 26 194 30 C194 20 206 20 206 30 C210 24 218 30 212 38 C214 44 204 48 196 46 C192 48 188 47 188 44Z"
          fill="#e8f5fd"
          stroke={BLUE}
          strokeWidth="2"
        />
      </g>

      {/* the tooth */}
      <path
        d="M62 66 C60 32 98 22 124 42 C150 22 190 32 188 66 C190 100 180 126 176 156 C172 192 168 224 150 230 C134 236 132 206 124 186 C116 206 114 236 98 230 C80 224 76 192 72 156 C68 126 60 100 62 66Z"
        fill="#fff"
        stroke={OUTLINE}
        strokeLinejoin="round"
        strokeWidth="6"
      />
      {/* shine */}
      <path
        d="M80 58 C82 46 94 40 104 44"
        stroke="#dbe8f5"
        strokeLinecap="round"
        strokeWidth="7"
      />

      {/* the holding arm, over the handle */}
      <path
        d="M180 138 C192 136 200 128 204 120"
        stroke={OUTLINE}
        strokeLinecap="round"
        strokeWidth="7"
      />
      <circle cx="206" cy="116" fill="#fff" r="10" stroke={OUTLINE} strokeWidth="5" />

      {/* face */}
      <circle cx="104" cy="100" fill={INK} r="9" />
      <circle cx="146" cy="100" fill={INK} r="9" />
      <circle cx="101" cy="96.5" fill="#fff" r="3" />
      <circle cx="143" cy="96.5" fill="#fff" r="3" />
      <ellipse cx="88" cy="122" fill={PINK} opacity="0.7" rx="11" ry="6.5" />
      <ellipse cx="162" cy="122" fill={PINK} opacity="0.7" rx="11" ry="6.5" />
      <path d="M108 118 Q125 140 142 118Z" fill="#e46a82" stroke={INK} strokeLinejoin="round" strokeWidth="4" />
      <path d="M117 128 Q125 124 133 128 Q125 134 117 128Z" fill="#f7a8b8" />

      <Sparkle className={sparkleClassName} fill={YELLOW} r={13} x={30} y={34} />
      <Sparkle className={sparkleClassName} fill={PINK} r={9} x={232} y={214} />
      <Sparkle className={sparkleClassName} fill={BLUE} r={8} x={24} y={196} />
      <Sparkle className={sparkleClassName} fill={YELLOW} r={6} x={196} y={18} />
    </svg>
  );
}

/** A toothbrush lying down with a curl of paste, for the booking panel. */
export function BrushAndPaste({
  className,
}: {
  readonly className?: string;
}): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 280 140"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="140" cy="126" fill="rgb(168 74 96 / 10%)" rx="118" ry="7" />
      {/* handle */}
      <rect fill={PINK} height="24" rx="12" width="176" x="12" y="88" />
      <rect fill="#fff" height="6" opacity="0.45" rx="3" width="90" x="30" y="93" />
      <rect fill="#e7859d" height="24" rx="6" width="14" x="60" y="88" />
      {/* head */}
      <rect fill={PINK} height="28" rx="12" width="92" x="172" y="86" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect
          fill={i % 2 ? "#dbe8f5" : "#fff"}
          height="30"
          key={i}
          rx="3.5"
          stroke={OUTLINE}
          strokeWidth="1.5"
          width="9"
          x={182 + i * 11}
          y="58"
        />
      ))}
      {/* paste */}
      <path
        d="M180 60 C174 44 190 34 200 44 C202 28 224 26 228 40 C236 30 256 36 252 50 C264 50 266 62 256 64 Q218 70 180 60Z"
        fill="#e8f5fd"
        stroke={BLUE}
        strokeWidth="2.5"
      />
      <path d="M196 52 Q214 44 232 50" stroke={PINK} strokeLinecap="round" strokeWidth="4" />
      {/* bubbles */}
      <circle cx="150" cy="44" fill="#fff" r="9" stroke={BLUE} strokeWidth="2" />
      <circle cx="132" cy="22" fill="#fff" r="6" stroke={BLUE} strokeWidth="2" />
      <circle cx="160" cy="16" fill="#fff" r="4" stroke={BLUE} strokeWidth="2" />
      <Sparkle fill={YELLOW} r={10} x={96} y={40} />
    </svg>
  );
}

/* ------------------------------------------------------------- stickers --- */

type IconProps = { readonly className?: string };

function Icon({
  className,
  children,
}: IconProps & { readonly children: JSX.Element | JSX.Element[] }): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

const heart = (x: number, y: number, s: number) =>
  `M${x} ${y + s * 0.9} C${x - s * 1.4} ${y - s * 0.1} ${x - s * 0.9} ${y - s * 1.1} ${x} ${y - s * 0.45} C${x + s * 0.9} ${y - s * 1.1} ${x + s * 1.4} ${y - s * 0.1} ${x} ${y + s * 0.9}Z`;

/** Two hearts, the parent's and the child's. */
export function IconTogether(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d={heart(26, 34, 16)} fill={PINK} />
      <path d={heart(44, 26, 11)} fill={BLUE} stroke="#fff" strokeWidth="2.5" />
    </Icon>
  );
}

/** The dental chair, drawn soft. */
export function IconChair(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <rect fill={BLUE} height="22" rx="8" transform="rotate(-18 16 22)" width="12" x="10" y="12" />
      <path d="M18 36 H46 C52 36 54 42 50 44 H22 C18 44 16 40 18 36Z" fill={BLUE} />
      <rect fill={OUTLINE} height="12" rx="3" width="6" x="31" y="44" />
      <rect fill={OUTLINE} height="5" rx="2.5" width="26" x="21" y="54" />
      <Sparkle fill={YELLOW} r={6} x={48} y={16} />
    </Icon>
  );
}

/** A little tooth, for counting teeth. */
export function IconCount(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path
        d="M16 20 C16 10 26 8 32 14 C38 8 48 10 48 20 C48 30 46 36 45 44 C44 52 42 56 38 56 C34 56 34 48 32 44 C30 48 30 56 26 56 C22 56 20 52 19 44 C18 36 16 30 16 20Z"
        fill="#fff"
        stroke={OUTLINE}
        strokeWidth="3"
      />
      <circle cx="27" cy="26" fill={INK} r="2.6" />
      <circle cx="37" cy="26" fill={INK} r="2.6" />
      <path d="M27 33 Q32 38 37 33" stroke={INK} strokeLinecap="round" strokeWidth="2.4" />
      <ellipse cx="23" cy="31" fill={PINK} opacity="0.7" rx="3" ry="2" />
      <ellipse cx="41" cy="31" fill={PINK} opacity="0.7" rx="3" ry="2" />
    </Icon>
  );
}

/** A smiling cloud: nobody hurries. */
export function IconCalm(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="44" cy="20" fill={YELLOW} r="9" />
      <path
        d="M14 46 C6 46 6 34 14 33 C14 24 26 20 31 27 C35 20 48 22 48 32 C56 32 58 46 48 46Z"
        fill="#fff"
        stroke={OUTLINE}
        strokeWidth="3"
      />
      <circle cx="26" cy="37" fill={INK} r="2" />
      <circle cx="36" cy="37" fill={INK} r="2" />
      <path d="M27 41 Q31 44 35 41" stroke={INK} strokeLinecap="round" strokeWidth="2" />
    </Icon>
  );
}

/** A calendar page with a star: the next visit, agreed together. */
export function IconNext(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <rect fill="#fff" height="40" rx="8" stroke={OUTLINE} strokeWidth="3" width="44" x="10" y="16" />
      <rect fill={PINK} height="10" rx="4" width="44" x="10" y="16" />
      <rect fill={OUTLINE} height="10" rx="2" width="4" x="20" y="10" />
      <rect fill={OUTLINE} height="10" rx="2" width="4" x="40" y="10" />
      <Sparkle fill={YELLOW} r={10} x={32} y={41} />
    </Icon>
  );
}

/** A question in a speech bubble, for the parents' questions. */
export function IconQuestion(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path
        d="M12 12 H52 C56 12 58 14 58 18 V40 C58 44 56 46 52 46 H28 L18 54 V46 H12 C8 46 6 44 6 40 V18 C6 14 8 12 12 12Z"
        fill="currentColor"
      />
      <path
        d="M26 24 C26 18 38 18 38 24 C38 29 32 29 32 34"
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="3.5"
      />
      <circle cx="32" cy="40" fill="#fff" r="2.2" />
    </Icon>
  );
}

/** Small stickers for the corners of the photographs. */
export function StickerStar(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path
        d="M32 6 L39 23 L57 24 L43 36 L48 54 L32 44 L16 54 L21 36 L7 24 L25 23Z"
        fill={YELLOW}
        stroke="#fff"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </Icon>
  );
}

export function StickerHeart(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <path d={heart(32, 32, 22)} fill={PINK} stroke="#fff" strokeWidth="4" />
    </Icon>
  );
}

export function StickerSparkle(props: IconProps): JSX.Element {
  return (
    <Icon {...props}>
      <circle cx="32" cy="32" fill="#fff" r="26" />
      <Sparkle fill={BLUE} r={20} x={32} y={32} />
    </Icon>
  );
}
