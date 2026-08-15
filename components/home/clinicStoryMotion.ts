export const DESKTOP_STORY_SCROLL_VH = 1030;
export const MOBILE_STORY_SCROLL_VH = 780;

export const MOBILE_PHASES = Object.freeze({
  galleryEnd: 90,
  snapEnd: 130,
  handoffEnd: 230,
  sequenceEnd: 600,
  zoneStart: 600,
  storyEnd: 780,
});

export type ClinicStoryProfile = "desktop" | "mobile";

export type JawSequenceMotionState = Readonly<{
  grow: number;
  pan: number;
  zoom: number;
  blur: number;
  sequenceProgress: number;
  targetFrame: number;
  zonesVisible: boolean;
  interactive: boolean;
}>;

export type ClinicStoryMotionInput = Readonly<{
  progressVh: number;
  profile: ClinicStoryProfile;
  frameCount: number;
  exactEndDrawn: boolean;
  revealComplete: boolean;
}>;

export type DampedMotionState = Readonly<{
  value: number;
  velocity: number;
}>;

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const clamp01 = (value: number): number => clamp(value, 0, 1);

const range = (value: number, start: number, end: number): number =>
  clamp01((value - start) / (end - start));

const round = (value: number, precision = 4): number =>
  Number(value.toFixed(precision));

/**
 * Pure invalid-input contract: NaN and -Infinity map to story start;
 * +Infinity maps to story end. Finite values clamp to the profile range.
 */
function normalizeProgress(progressVh: number, storyEnd: number): number {
  if (Number.isNaN(progressVh) || progressVh === Number.NEGATIVE_INFINITY) {
    return 0;
  }
  if (progressVh === Number.POSITIVE_INFINITY) return storyEnd;
  return clamp(progressVh, 0, storyEnd);
}

/**
 * Frame counts are positive integers. Invalid/non-positive values normalize to
 * one; positive fractions truncate. This guarantees a finite one-based frame.
 */
function normalizeFrameCount(frameCount: number): number {
  if (!Number.isFinite(frameCount) || frameCount < 1) return 1;
  return Math.max(1, Math.floor(frameCount));
}

function mapSequenceMotion(input: ClinicStoryMotionInput): JawSequenceMotionState {
  const isMobile = input.profile === "mobile";
  const storyEnd = isMobile ? MOBILE_PHASES.storyEnd : DESKTOP_STORY_SCROLL_VH;
  const progressVh = normalizeProgress(input.progressVh, storyEnd);
  const frameCount = normalizeFrameCount(input.frameCount);

  const grow = isMobile ? 1 : range(progressVh, 0, 84);
  const pan = isMobile ? 0 : range(progressVh, 84, 380);
  const zoom = isMobile
    ? range(progressVh, MOBILE_PHASES.snapEnd, MOBILE_PHASES.handoffEnd)
    : range(progressVh, 380, 480);
  const blur = isMobile
    ? range(progressVh, 192, MOBILE_PHASES.handoffEnd)
    : range(progressVh, 442, 480);
  const sequenceProgress = isMobile
    ? range(progressVh, MOBILE_PHASES.handoffEnd, MOBILE_PHASES.sequenceEnd)
    : range(progressVh, 480, 840);
  const zoneStart = isMobile ? MOBILE_PHASES.zoneStart : 840;
  const zonesVisible = progressVh >= zoneStart;

  return {
    grow,
    pan,
    zoom,
    blur,
    sequenceProgress,
    targetFrame: 1 + Math.round(sequenceProgress * (frameCount - 1)),
    zonesVisible,
    interactive:
      zonesVisible && input.exactEndDrawn && input.revealComplete,
  };
}

export function mapClinicStoryMotion(
  input: ClinicStoryMotionInput,
): JawSequenceMotionState {
  return mapSequenceMotion(input);
}

/** Critically damped progress filter; document scroll remains source of truth. */
export function stepCriticallyDamped(
  state: DampedMotionState,
  target: number,
  deltaSeconds: number,
  settleSeconds = 0.18,
): DampedMotionState {
  const safeTarget = clamp(target, 0, 1);
  const delta = clamp(deltaSeconds, 0, 0.05);
  const smoothTime = Math.max(0.0001, settleSeconds);
  const omega = 2 / smoothTime;
  const x = omega * delta;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = state.value - safeTarget;
  const temporary = (state.velocity + omega * change) * delta;
  const velocity = (state.velocity - omega * temporary) * decay;
  const value = safeTarget + (change + temporary) * decay;

  if (Math.abs(safeTarget - value) < 0.00005 && Math.abs(velocity) < 0.001) {
    return { value: safeTarget, velocity: 0 };
  }

  return {
    value: round(clamp(value, 0, 1), 6),
    velocity: round(velocity, 6),
  };
}
