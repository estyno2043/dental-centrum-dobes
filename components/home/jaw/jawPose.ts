export type JawMotionState = Readonly<{
  jawOpen: number;
  jawSeparation: number;
}>;

export type JawBounds = Readonly<{
  width: number;
  height: number;
  depth: number;
}>;

export type JawPose = Readonly<{
  rootScale: number;
  rootYaw: number;
  rootPitch: number;
  upperY: number;
  lowerY: number;
  premolarOffset: number;
  molarOffset: number;
  gumDepth: number;
}>;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const lerp = (start: number, end: number, progress: number): number =>
  start + (end - start) * progress;

const smoothstep = (progress: number): number =>
  progress * progress * (3 - 2 * progress);

export function computeJawPose(
  state: JawMotionState,
  bounds: JawBounds,
): JawPose {
  const open = smoothstep(clamp01(state.jawOpen));
  const separation = smoothstep(clamp01(state.jawSeparation));
  const archOffset = bounds.height * 0.12 * open;

  return {
    rootScale: lerp(0.55, 1, open),
    rootYaw: lerp(-0.16, 0, open),
    rootPitch: lerp(0, -Math.PI / 10, open),
    upperY: archOffset,
    lowerY: archOffset === 0 ? 0 : -archOffset,
    // Lateral values are magnitudes; the renderer applies opposite signs.
    premolarOffset: bounds.width * 0.08 * separation,
    molarOffset: bounds.width * 0.18 * separation,
    gumDepth: bounds.depth * 0.03 * separation,
  };
}
