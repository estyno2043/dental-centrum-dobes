/*
 * Retimed 2026-09-26 after the audit found about a screen of blurred,
 * wordless photograph between the statement and the clinic story: the
 * sentence left at 72% and the veil only closed at 90%, with nothing on
 * screen in between. The sentence now arrives sooner and stays until 82%,
 * and the veil closes by 97%, so the handover is a short fade rather than
 * a screen of nothing.
 */
const EXPERIENCE_OPEN_END = 0.3;
const COPY_IN_START = 0.31;
const COPY_IN_END = 0.42;
const COPY_OUT_START = 0.82;
const COPY_OUT_END = 0.9;
const EXIT_END = 0.97;
const clamp01 = (value: number): number =>
  Math.min(1, Math.max(0, value));

const phase = (value: number, start: number, end: number): number =>
  clamp01((value - start) / (end - start));

const round = (value: number, precision = 4): number =>
  Number(value.toFixed(precision));

const percent = (value: number): string => `${round(value, 3)}%`;

export type ExperienceMotionState = Readonly<{
  clipPath: string;
  edgeInset: string;
  edgeOpacity: number;
  cornerRadius: number;
  mediaScale: number;
  copyOpacity: number;
  copyY: number;
  storyScale: number;
  veilOpacity: number;
}>;

/**
 * Maps statement-section scroll progress to visual values.
 *
 * Keeping the timeline here makes the design measurable and testable. Motion
 * consumes this function through `useTransform`, so these values are the real
 * production timeline rather than a second test-only representation.
 */
export function mapExperienceMotion(progress: number): ExperienceMotionState {
  const value = clamp01(progress);
  const open = phase(value, 0, EXPERIENCE_OPEN_END);
  const copyIn = phase(value, COPY_IN_START, COPY_IN_END);
  const copyOut = 1 - phase(value, COPY_OUT_START, COPY_OUT_END);
  const exit = phase(value, COPY_OUT_START, EXIT_END);
  const inset = round(50 * (1 - open), 3);
  const insetValue = percent(inset);
  const cornerRadius = round(32 * (1 - open), 3);

  return {
    clipPath: `inset(${insetValue} ${insetValue} ${insetValue} ${insetValue} round ${cornerRadius}px)`,
    edgeInset: insetValue,
    edgeOpacity: round(Math.sin(Math.PI * open)),
    cornerRadius,
    mediaScale: round(1.18 - open * 0.16 - exit * 0.04),
    copyOpacity: round(Math.min(copyIn, copyOut)),
    copyY: round(40 * (1 - copyIn) - 20 * (1 - copyOut)),
    storyScale: round(1 - exit * 0.02),
    veilOpacity: round(exit),
  };
}
