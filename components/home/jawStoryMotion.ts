export const JAW_DURATION = 8;
export const JAW_SEGMENT_DURATION = 2;
export const JAW_SEGMENT_COUNT = 4;
export const JAW_STORY_START = 0.14;
export const JAW_STORY_END = 0.84;

export type JawCalloutKind = "bite" | "tooth" | "gum";

export type JawPoint = Readonly<{
  x: number;
  y: number;
}>;

export type JawSegmentSelection = Readonly<{
  index: number;
  nextIndex: number;
  globalTime: number;
  localTime: number;
}>;

export type JawStoryMotionState = Readonly<{
  blur: number;
  jawOpacity: number;
  globalTime: number;
  finalOpacity: number;
  callouts: Readonly<Record<JawCalloutKind, number>>;
}>;

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const clamp01 = (value: number): number => clamp(value, 0, 1);

const phase = (value: number, start: number, end: number): number =>
  clamp01((value - start) / (end - start));

const round = (value: number, precision = 4): number =>
  Number(value.toFixed(precision));

const calloutWindow = (
  time: number,
  start: number,
  entered: number,
  leaving: number,
  end: number,
): number =>
  round(Math.min(phase(time, start, entered), 1 - phase(time, leaving, end)));

export function selectJawSegment(globalTime: number): JawSegmentSelection {
  const time = clamp(globalTime, 0, JAW_DURATION);
  const index =
    time === JAW_DURATION
      ? JAW_SEGMENT_COUNT - 1
      : Math.floor(time / JAW_SEGMENT_DURATION);
  const localTime =
    time === JAW_DURATION
      ? JAW_SEGMENT_DURATION
      : time - index * JAW_SEGMENT_DURATION;

  return {
    index,
    nextIndex: Math.min(index + 1, JAW_SEGMENT_COUNT - 1),
    globalTime: round(time),
    localTime: round(localTime),
  };
}

export function mapJawStoryMotion(progress: number): JawStoryMotionState {
  const value = clamp01(progress);
  const timelineProgress = phase(value, JAW_STORY_START, JAW_STORY_END);
  const globalTime = round(timelineProgress * JAW_DURATION);

  return {
    blur: 1,
    jawOpacity: round(phase(value, 0.055, JAW_STORY_START)),
    globalTime,
    finalOpacity: round(phase(globalTime, 6.7, 7.4)),
    callouts: {
      bite: calloutWindow(globalTime, 0.65, 1, 2.1, 2.4),
      tooth: calloutWindow(globalTime, 2.6, 3, 4.25, 4.6),
      gum: calloutWindow(globalTime, 4.75, 5.15, 6.3, 6.65),
    },
  };
}

const targetKeyframes: Readonly<
  Record<JawCalloutKind, readonly JawPoint[]>
> = {
  bite: [
    { x: 0.73, y: 0.49 },
    { x: 0.72, y: 0.49 },
    { x: 0.64, y: 0.49 },
    { x: 0.59, y: 0.51 },
    { x: 0.7, y: 0.49 },
  ],
  tooth: [
    { x: 0.76, y: 0.39 },
    { x: 0.76, y: 0.39 },
    { x: 0.7, y: 0.34 },
    { x: 0.63, y: 0.31 },
    { x: 0.75, y: 0.38 },
  ],
  gum: [
    { x: 0.72, y: 0.29 },
    { x: 0.72, y: 0.28 },
    { x: 0.67, y: 0.23 },
    { x: 0.6, y: 0.18 },
    { x: 0.72, y: 0.27 },
  ],
};

export function mapJawTarget(
  kind: JawCalloutKind,
  globalTime: number,
): JawPoint {
  const time = clamp(globalTime, 0, JAW_DURATION);
  const index = Math.min(
    Math.floor(time / JAW_SEGMENT_DURATION),
    JAW_SEGMENT_COUNT - 1,
  );
  const nextIndex = Math.min(index + 1, JAW_SEGMENT_COUNT);
  const mix = (time - index * JAW_SEGMENT_DURATION) / JAW_SEGMENT_DURATION;
  const points = targetKeyframes[kind];
  const from = points[index];
  const to = points[nextIndex] ?? from;

  return {
    x: round(from.x + (to.x - from.x) * mix),
    y: round(from.y + (to.y - from.y) * mix),
  };
}

/**
 * Frame-rate-independent low-pass smoothing. Document scroll remains the
 * source of truth; this only bridges coarse wheel jumps between browser paints.
 */
export function stepSmoothedProgress(
  current: number,
  target: number,
  deltaSeconds: number,
): number {
  const safeCurrent = clamp01(current);
  const safeTarget = clamp01(target);

  if (Math.abs(safeTarget - safeCurrent) < 0.0001) return safeTarget;

  const delta = clamp(deltaSeconds, 0, 0.05);
  const amount = 1 - Math.exp(-14 * delta);
  return round(safeCurrent + (safeTarget - safeCurrent) * amount, 6);
}
