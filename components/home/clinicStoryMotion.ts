export const DESKTOP_STORY_SCROLL_VH = 1030;
export const MOBILE_STORY_SCROLL_VH = 780;

export const DESKTOP_PHASES = Object.freeze({
  galleryEnd: 370,
  detailEnd: 460,
  detailDwellEnd: 500,
  handoffEnd: 530,
  openingEnd: 670,
  teaseEnd: 710,
  mapEnd: 750,
  interactiveEnd: 900,
  storyEnd: DESKTOP_STORY_SCROLL_VH,
});

export const MOBILE_PHASES = Object.freeze({
  galleryEnd: 90,
  snapEnd: 130,
  detailDwellEnd: 170,
  handoffEnd: 200,
  openingEnd: 400,
  teaseEnd: 455,
  mapEnd: 510,
  interactiveEnd: 680,
  storyEnd: 780,
});

export type ClinicStoryProfile = "desktop" | "mobile";

export type ClinicStoryPhase =
  | "gallery"
  | "detail"
  | "handoff"
  | "opening"
  | "tease"
  | "map"
  | "interactive"
  | "exit";

export type ClinicStoryMotionState = Readonly<{
  phase: ClinicStoryPhase;
  grow: number;
  pan: number;
  detail: number;
  handoff: number;
  sequenceProgress: number;
  cueOpacity: number;
  teaseProgress: number;
  mapReveal: number;
  exit: number;
  targetFrame: number;
  zonesVisible: boolean;
  interactive: boolean;
}>;

/** @deprecated Use ClinicStoryMotionState. */
export type JawSequenceMotionState = ClinicStoryMotionState;

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

function phaseFor(
  progressVh: number,
  profile: ClinicStoryProfile,
): ClinicStoryPhase {
  const phases = profile === "mobile" ? MOBILE_PHASES : DESKTOP_PHASES;
  if (progressVh < phases.galleryEnd) return "gallery";
  if (progressVh < phases.detailDwellEnd) return "detail";
  if (progressVh < phases.handoffEnd) return "handoff";
  if (progressVh < phases.openingEnd) return "opening";
  if (progressVh < phases.teaseEnd) return "tease";
  if (progressVh < phases.mapEnd) return "map";
  if (progressVh < phases.interactiveEnd) return "interactive";
  return "exit";
}

function mapSequenceMotion(input: ClinicStoryMotionInput): ClinicStoryMotionState {
  const isMobile = input.profile === "mobile";
  const storyEnd = isMobile ? MOBILE_PHASES.storyEnd : DESKTOP_STORY_SCROLL_VH;
  const progressVh = normalizeProgress(input.progressVh, storyEnd);
  const frameCount = normalizeFrameCount(input.frameCount);

  const galleryEnd = isMobile ? MOBILE_PHASES.galleryEnd : DESKTOP_PHASES.galleryEnd;
  const detailEnd = isMobile ? MOBILE_PHASES.snapEnd : DESKTOP_PHASES.detailEnd;
  const detailDwellEnd = isMobile
    ? MOBILE_PHASES.detailDwellEnd
    : DESKTOP_PHASES.detailDwellEnd;
  const handoffEnd = isMobile ? MOBILE_PHASES.handoffEnd : DESKTOP_PHASES.handoffEnd;
  const openingEnd = isMobile ? MOBILE_PHASES.openingEnd : DESKTOP_PHASES.openingEnd;
  const teaseEnd = isMobile ? MOBILE_PHASES.teaseEnd : DESKTOP_PHASES.teaseEnd;
  const mapEnd = isMobile ? MOBILE_PHASES.mapEnd : DESKTOP_PHASES.mapEnd;
  const interactiveEnd = isMobile
    ? MOBILE_PHASES.interactiveEnd
    : DESKTOP_PHASES.interactiveEnd;

  const grow = isMobile ? 1 : range(progressVh, 0, 84);
  const pan = isMobile ? 0 : range(progressVh, 84, DESKTOP_PHASES.galleryEnd);
  const detail = range(progressVh, galleryEnd, detailEnd);
  const handoff = range(progressVh, detailDwellEnd, handoffEnd);
  const sequenceProgress = range(progressVh, handoffEnd, openingEnd);
  const cueOpacity =
    range(progressVh, handoffEnd + 5, handoffEnd + 22) *
    (1 - range(progressVh, openingEnd - 20, openingEnd));
  const teaseProgress = range(progressVh, openingEnd, teaseEnd);
  const mapReveal = range(progressVh, teaseEnd, mapEnd);
  const exit = range(progressVh, interactiveEnd, storyEnd);
  const zonesVisible = progressVh >= teaseEnd;

  return {
    phase: phaseFor(progressVh, input.profile),
    grow,
    pan,
    detail,
    handoff,
    sequenceProgress,
    cueOpacity,
    teaseProgress,
    mapReveal,
    exit,
    targetFrame: 1 + Math.round(sequenceProgress * (frameCount - 1)),
    zonesVisible,
    interactive:
      progressVh >= mapEnd &&
      progressVh < interactiveEnd &&
      input.exactEndDrawn &&
      input.revealComplete,
  };
}

export function mapClinicStoryMotion(
  input: ClinicStoryMotionInput,
): ClinicStoryMotionState {
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
