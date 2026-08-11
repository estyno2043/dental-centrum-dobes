import type { ClinicStoryProfile } from "./clinicStoryMotion";

export type JawCalloutKind = "bite" | "tooth" | "gum";

export type JawPoint = Readonly<{
  x: number;
  y: number;
}>;

export type JawViewport = Readonly<{
  width: number;
  height: number;
}>;

export type JawTrackingModel = Readonly<{
  target: JawPoint;
  cardAnchor: JawPoint;
  time: number;
  profile: ClinicStoryProfile;
}>;

export const JAW_TRACKING_STEP = 0.2;
export const JAW_TRACKING_SAMPLE_COUNT = 41;

const MASTER_WIDTH = 1920;
const MASTER_HEIGHT = 1080;
const MOBILE_ASSET_WIDTH = 720;
const MOBILE_ASSET_HEIGHT = 1280;
const MOBILE_CROP_X = 620;
const MOBILE_CROP_WIDTH = 1300;
const MOBILE_FOREGROUND_HEIGHT = 598;
const MOBILE_FOREGROUND_Y = 341;

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const round = (value: number, precision = 4): number =>
  Number(value.toFixed(precision));

function coverPoint(
  point: JawPoint,
  source: JawViewport,
  viewport: JawViewport,
): JawPoint {
  const scale = Math.max(
    viewport.width / source.width,
    viewport.height / source.height,
  );
  const offsetX = (viewport.width - source.width * scale) / 2;
  const offsetY = (viewport.height - source.height * scale) / 2;

  return {
    x: round(point.x * scale + offsetX),
    y: round(point.y * scale + offsetY),
  };
}

export function mapJawSourcePointToViewport(
  sourcePoint: JawPoint,
  viewport: JawViewport,
  profile: ClinicStoryProfile,
): JawPoint {
  if (profile === "desktop") {
    return coverPoint(
      sourcePoint,
      { width: MASTER_WIDTH, height: MASTER_HEIGHT },
      viewport,
    );
  }

  const mobileAssetPoint = {
    x: ((sourcePoint.x - MOBILE_CROP_X) / MOBILE_CROP_WIDTH) * MOBILE_ASSET_WIDTH,
    y:
      MOBILE_FOREGROUND_Y +
      (sourcePoint.y / MASTER_HEIGHT) * MOBILE_FOREGROUND_HEIGHT,
  };

  return coverPoint(
    mobileAssetPoint,
    { width: MOBILE_ASSET_WIDTH, height: MOBILE_ASSET_HEIGHT },
    viewport,
  );
}

const targetKeyframes: Readonly<Record<JawCalloutKind, readonly JawPoint[]>> = {
  bite: [
    { x: 1402, y: 529 },
    { x: 1382, y: 529 },
    { x: 1229, y: 529 },
    { x: 1133, y: 551 },
    { x: 1344, y: 529 },
  ],
  tooth: [
    { x: 1459, y: 421 },
    { x: 1459, y: 421 },
    { x: 1344, y: 367 },
    { x: 1210, y: 335 },
    { x: 1440, y: 410 },
  ],
  gum: [
    { x: 1382, y: 313 },
    { x: 1382, y: 302 },
    { x: 1286, y: 248 },
    { x: 1152, y: 194 },
    { x: 1382, y: 292 },
  ],
};

const cardAnchorKeyframes: Readonly<
  Record<JawCalloutKind, readonly JawPoint[]>
> = {
  bite: [
    { x: 0.22, y: 0.57 },
    { x: 0.23, y: 0.55 },
    { x: 0.24, y: 0.52 },
    { x: 0.26, y: 0.49 },
    { x: 0.22, y: 0.55 },
  ],
  tooth: [
    { x: 0.24, y: 0.36 },
    { x: 0.24, y: 0.34 },
    { x: 0.25, y: 0.31 },
    { x: 0.27, y: 0.28 },
    { x: 0.23, y: 0.34 },
  ],
  gum: [
    { x: 0.25, y: 0.24 },
    { x: 0.25, y: 0.22 },
    { x: 0.26, y: 0.2 },
    { x: 0.28, y: 0.18 },
    { x: 0.24, y: 0.22 },
  ],
};

const mobileCardAnchorKeyframes: Readonly<
  Record<JawCalloutKind, readonly JawPoint[]>
> = {
  bite: [
    { x: 0.5, y: 0.78 },
    { x: 0.5, y: 0.77 },
    { x: 0.5, y: 0.75 },
    { x: 0.5, y: 0.73 },
    { x: 0.5, y: 0.77 },
  ],
  tooth: [
    { x: 0.5, y: 0.78 },
    { x: 0.5, y: 0.76 },
    { x: 0.5, y: 0.74 },
    { x: 0.5, y: 0.72 },
    { x: 0.5, y: 0.76 },
  ],
  gum: [
    { x: 0.5, y: 0.77 },
    { x: 0.5, y: 0.75 },
    { x: 0.5, y: 0.73 },
    { x: 0.5, y: 0.71 },
    { x: 0.5, y: 0.75 },
  ],
};

function interpolateKeyframes(
  keyframes: readonly JawPoint[],
  time: number,
): JawPoint {
  const safeTime = clamp(time, 0, 8);
  const index = Math.min(Math.floor(safeTime / 2), keyframes.length - 1);
  const nextIndex = Math.min(index + 1, keyframes.length - 1);
  const mix = index === nextIndex ? 0 : (safeTime - index * 2) / 2;
  const from = keyframes[index];
  const to = keyframes[nextIndex];

  return {
    x: round(from.x + (to.x - from.x) * mix),
    y: round(from.y + (to.y - from.y) * mix),
  };
}

const targetSamples: Readonly<Record<JawCalloutKind, readonly JawPoint[]>> = {
  bite: Array.from({ length: JAW_TRACKING_SAMPLE_COUNT }, (_, index) =>
    interpolateKeyframes(targetKeyframes.bite, index * JAW_TRACKING_STEP),
  ),
  tooth: Array.from({ length: JAW_TRACKING_SAMPLE_COUNT }, (_, index) =>
    interpolateKeyframes(targetKeyframes.tooth, index * JAW_TRACKING_STEP),
  ),
  gum: Array.from({ length: JAW_TRACKING_SAMPLE_COUNT }, (_, index) =>
    interpolateKeyframes(targetKeyframes.gum, index * JAW_TRACKING_STEP),
  ),
};

function interpolateSamples(samples: readonly JawPoint[], time: number): JawPoint {
  const samplePosition = clamp(time, 0, 8) / JAW_TRACKING_STEP;
  const index = Math.min(Math.floor(samplePosition), samples.length - 1);
  const nextIndex = Math.min(index + 1, samples.length - 1);
  const mix = samplePosition - index;
  const from = samples[index];
  const to = samples[nextIndex];

  return {
    x: round(from.x + (to.x - from.x) * mix),
    y: round(from.y + (to.y - from.y) * mix),
  };
}

export function getJawTrackingModel(
  kind: JawCalloutKind,
  globalTime: number,
  profile: ClinicStoryProfile,
): JawTrackingModel {
  const time = round(clamp(globalTime, 0, 8));

  return {
    target: interpolateSamples(targetSamples[kind], time),
    cardAnchor: interpolateKeyframes(
      profile === "mobile"
        ? mobileCardAnchorKeyframes[kind]
        : cardAnchorKeyframes[kind],
      time,
    ),
    time,
    profile,
  };
}
