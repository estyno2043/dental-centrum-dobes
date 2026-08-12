export const DESKTOP_STORY_SCROLL_VH = 1020;
export const MOBILE_STORY_SCROLL_VH = 750;

export type ClinicStoryProfile = "desktop" | "mobile";

export type ClinicStoryMotionState = Readonly<{
  grow: number;
  pan: number;
  snap: number;
  zoom: number;
  blur: number;
  jawOpacity: number;
  jawOpen: number;
  jawSeparation: number;
  labelsOpacity: number;
  interactive: boolean;
}>;

export type DampedMotionState = Readonly<{
  value: number;
  velocity: number;
}>;

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const phase = (value: number, start: number, end: number): number =>
  clamp((value - start) / (end - start), 0, 1);

const round = (value: number, precision = 4): number =>
  Number(value.toFixed(precision));

function mapDesktop(scrollVh: number): ClinicStoryMotionState {
  const value = clamp(scrollVh, 0, DESKTOP_STORY_SCROLL_VH);
  return {
    grow: round(phase(value, 0, 84)),
    pan: round(phase(value, 84, 380)),
    snap: 1,
    zoom: round(phase(value, 380, 480)),
    blur: round(phase(value, 442, 480)),
    jawOpacity: round(phase(value, 447, 480)),
    jawOpen: round(phase(value, 480, 660)),
    jawSeparation: round(phase(value, 660, 840)),
    labelsOpacity: round(phase(value, 720, 840)),
    interactive: value >= 840,
  };
}

function mapMobile(scrollVh: number): ClinicStoryMotionState {
  const value = clamp(scrollVh, 0, MOBILE_STORY_SCROLL_VH);
  return {
    grow: 1,
    pan: 0,
    snap: round(phase(value, 90, 130)),
    zoom: round(phase(value, 130, 230)),
    blur: round(phase(value, 192, 230)),
    jawOpacity: round(phase(value, 197, 230)),
    jawOpen: round(phase(value, 230, 410)),
    jawSeparation: round(phase(value, 410, 590)),
    labelsOpacity: round(phase(value, 470, 590)),
    interactive: value >= 590,
  };
}

export function mapClinicStoryMotion(
  scrollVh: number,
  profile: ClinicStoryProfile,
): ClinicStoryMotionState {
  return profile === "mobile" ? mapMobile(scrollVh) : mapDesktop(scrollVh);
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
