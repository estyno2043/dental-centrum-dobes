import { describe, expect, test } from "vitest";
import {
  DESKTOP_STORY_SCROLL_VH,
  MOBILE_PHASES,
  MOBILE_STORY_SCROLL_VH,
  mapClinicStoryMotion,
  stepCriticallyDamped,
  type JawSequenceMotionState,
} from "./clinicStoryMotion";

const mapDesktop = (
  progressVh: number,
  overrides: Partial<{
    frameCount: number;
    exactEndDrawn: boolean;
    revealComplete: boolean;
  }> = {},
): JawSequenceMotionState =>
  mapClinicStoryMotion({
    progressVh,
    profile: "desktop",
    frameCount: overrides.frameCount ?? 72,
    exactEndDrawn: overrides.exactEndDrawn ?? false,
    revealComplete: overrides.revealComplete ?? false,
  });

const mapMobile = (
  progressVh: number,
  overrides: Partial<{
    frameCount: number;
    exactEndDrawn: boolean;
    revealComplete: boolean;
  }> = {},
): JawSequenceMotionState =>
  mapClinicStoryMotion({
    progressVh,
    profile: "mobile",
    frameCount: overrides.frameCount ?? 60,
    exactEndDrawn: overrides.exactEndDrawn ?? false,
    revealComplete: overrides.revealComplete ?? false,
  });

describe("mapClinicStoryMotion sequence contract", () => {
  test("returns only the exact public sequence fields for object input", () => {
    expect(Object.keys(mapDesktop(0)).sort()).toEqual(
      [
        "blur",
        "grow",
        "interactive",
        "pan",
        "sequenceProgress",
        "targetFrame",
        "zonesVisible",
        "zoom",
      ].sort(),
    );
  });

  test.each([
    [0, 0, 0, 0, 0],
    [84, 1, 0, 0, 0],
    [380, 1, 1, 0, 0],
    [442, 1, 1, 0.62, 0],
    [480, 1, 1, 1, 0],
    [660, 1, 1, 1, 0.5],
    [840, 1, 1, 1, 1],
    [1030, 1, 1, 1, 1],
  ])(
    "maps desktop %svh to grow=%s pan=%s zoom=%s sequence=%s",
    (progressVh, grow, pan, zoom, sequenceProgress) => {
      const state = mapDesktop(progressVh);
      expect(state.grow).toBeCloseTo(grow, 4);
      expect(state.pan).toBeCloseTo(pan, 4);
      expect(state.zoom).toBeCloseTo(zoom, 4);
      expect(state.sequenceProgress).toBeCloseTo(sequenceProgress, 4);
    },
  );

  test.each([
    [83.99, { grow: 83.99 / 84, pan: 0, zoom: 0, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [84, { grow: 1, pan: 0, zoom: 0, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [84.01, { grow: 1, pan: 0.01 / 296, zoom: 0, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [379.99, { grow: 1, pan: 295.99 / 296, zoom: 0, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [380, { grow: 1, pan: 1, zoom: 0, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [380.01, { grow: 1, pan: 1, zoom: 0.01 / 100, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [441.99, { grow: 1, pan: 1, zoom: 61.99 / 100, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [442, { grow: 1, pan: 1, zoom: 0.62, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [442.01, { grow: 1, pan: 1, zoom: 62.01 / 100, blur: 0.01 / 38, sequenceProgress: 0, zonesVisible: false }],
    [479.99, { grow: 1, pan: 1, zoom: 99.99 / 100, blur: 37.99 / 38, sequenceProgress: 0, zonesVisible: false }],
    [480, { grow: 1, pan: 1, zoom: 1, blur: 1, sequenceProgress: 0, zonesVisible: false }],
    [480.01, { grow: 1, pan: 1, zoom: 1, blur: 1, sequenceProgress: 0.01 / 360, zonesVisible: false }],
    [839.99, { grow: 1, pan: 1, zoom: 1, blur: 1, sequenceProgress: 359.99 / 360, zonesVisible: false }],
    [840, { grow: 1, pan: 1, zoom: 1, blur: 1, sequenceProgress: 1, zonesVisible: true }],
    [840.01, { grow: 1, pan: 1, zoom: 1, blur: 1, sequenceProgress: 1, zonesVisible: true }],
    [1029.99, { grow: 1, pan: 1, zoom: 1, blur: 1, sequenceProgress: 1, zonesVisible: true }],
    [1030, { grow: 1, pan: 1, zoom: 1, blur: 1, sequenceProgress: 1, zonesVisible: true }],
    [1030.01, { grow: 1, pan: 1, zoom: 1, blur: 1, sequenceProgress: 1, zonesVisible: true }],
  ])("maps desktop boundary %svh", (progressVh, expected) => {
    const state = mapDesktop(progressVh);
    expect(state.grow).toBeCloseTo(expected.grow, 6);
    expect(state.pan).toBeCloseTo(expected.pan, 6);
    expect(state.zoom).toBeCloseTo(expected.zoom, 6);
    expect(state.blur).toBeCloseTo(expected.blur, 6);
    expect(state.sequenceProgress).toBeCloseTo(expected.sequenceProgress, 6);
    expect(state.zonesVisible).toBe(expected.zonesVisible);
  });

  test("exports locked mobile phase boundaries", () => {
    expect(MOBILE_PHASES).toEqual({
      galleryEnd: 90,
      snapEnd: 130,
      handoffEnd: 230,
      sequenceEnd: 600,
      zoneStart: 600,
      storyEnd: 780,
    });
    expect(Object.isFrozen(MOBILE_PHASES)).toBe(true);
  });

  test.each([
    [89.99, { grow: 1, pan: 0, zoom: 0, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [90, { grow: 1, pan: 0, zoom: 0, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [90.01, { grow: 1, pan: 0, zoom: 0, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [129.99, { grow: 1, pan: 0, zoom: 0, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [130, { grow: 1, pan: 0, zoom: 0, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [130.01, { grow: 1, pan: 0, zoom: 0.01 / 100, blur: 0, sequenceProgress: 0, zonesVisible: false }],
    [229.99, { grow: 1, pan: 0, zoom: 99.99 / 100, blur: 37.99 / 38, sequenceProgress: 0, zonesVisible: false }],
    [230, { grow: 1, pan: 0, zoom: 1, blur: 1, sequenceProgress: 0, zonesVisible: false }],
    [230.01, { grow: 1, pan: 0, zoom: 1, blur: 1, sequenceProgress: 0.01 / 370, zonesVisible: false }],
    [599.99, { grow: 1, pan: 0, zoom: 1, blur: 1, sequenceProgress: 369.99 / 370, zonesVisible: false }],
    [600, { grow: 1, pan: 0, zoom: 1, blur: 1, sequenceProgress: 1, zonesVisible: true }],
    [600.01, { grow: 1, pan: 0, zoom: 1, blur: 1, sequenceProgress: 1, zonesVisible: true }],
    [779.99, { grow: 1, pan: 0, zoom: 1, blur: 1, sequenceProgress: 1, zonesVisible: true }],
    [780, { grow: 1, pan: 0, zoom: 1, blur: 1, sequenceProgress: 1, zonesVisible: true }],
    [780.01, { grow: 1, pan: 0, zoom: 1, blur: 1, sequenceProgress: 1, zonesVisible: true }],
  ])("maps mobile boundary %svh", (progressVh, expected) => {
    const state = mapMobile(progressVh);
    expect(state.grow).toBe(expected.grow);
    expect(state.pan).toBe(expected.pan);
    expect(state.zoom).toBeCloseTo(expected.zoom, 6);
    expect(state.blur).toBeCloseTo(expected.blur, 6);
    expect(state.sequenceProgress).toBeCloseTo(expected.sequenceProgress, 6);
    expect(state.zonesVisible).toBe(expected.zonesVisible);
  });

  test("maps target frames one-based and clamps sequence progress", () => {
    expect(mapDesktop(-100).targetFrame).toBe(1);
    expect(mapDesktop(480).targetFrame).toBe(1);
    expect(mapDesktop(660).targetFrame).toBe(37);
    expect(mapDesktop(840).targetFrame).toBe(72);
    expect(mapDesktop(9999).targetFrame).toBe(72);
    expect(mapMobile(415).targetFrame).toBe(31);
    expect(mapMobile(600).targetFrame).toBe(60);
  });

  test("returns identical states for the same positions in forward and reverse traversal", () => {
    const positions = [0, 83.99, 84, 84.01, 379.99, 380, 442, 480, 660, 839.99, 840, 1030];
    const forward = new Map(positions.map((position) => [position, mapDesktop(position)]));

    for (const position of positions.toReversed()) {
      expect(mapDesktop(position)).toEqual(forward.get(position));
    }
  });

  test("closes visibility and interaction immediately on raw reverse threshold crossing", () => {
    const gates = { exactEndDrawn: true, revealComplete: true };
    expect(mapDesktop(840, gates)).toMatchObject({ zonesVisible: true, interactive: true });
    expect(mapDesktop(839.99, gates)).toMatchObject({ zonesVisible: false, interactive: false });
    expect(mapMobile(600, gates)).toMatchObject({ zonesVisible: true, interactive: true });
    expect(mapMobile(599.99, gates)).toMatchObject({ zonesVisible: false, interactive: false });
  });

  test.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [true, true, true],
  ])(
    "requires exactEndDrawn=%s and revealComplete=%s before interaction=%s",
    (exactEndDrawn, revealComplete, interactive) => {
      expect(mapDesktop(840, { exactEndDrawn, revealComplete }).interactive).toBe(interactive);
      expect(mapMobile(600, { exactEndDrawn, revealComplete }).interactive).toBe(interactive);
    },
  );

  test("normalizes invalid frame counts to one frame without emitting NaN", () => {
    for (const frameCount of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const state = mapDesktop(660, { frameCount });
      expect(state.targetFrame).toBe(1);
      expect(Number.isNaN(state.targetFrame)).toBe(false);
    }
    expect(mapDesktop(840, { frameCount: 71.9 }).targetFrame).toBe(71);
    expect(mapDesktop(840, { frameCount: 1 }).targetFrame).toBe(1);
  });

  test("normalizes non-finite progress without emitting non-finite motion", () => {
    expect(mapDesktop(Number.NaN)).toEqual(mapDesktop(0));
    expect(mapDesktop(Number.NEGATIVE_INFINITY)).toEqual(mapDesktop(0));
    expect(mapDesktop(Number.POSITIVE_INFINITY)).toEqual(mapDesktop(DESKTOP_STORY_SCROLL_VH));
    expect(mapMobile(Number.POSITIVE_INFINITY)).toEqual(mapMobile(MOBILE_STORY_SCROLL_VH));

    for (const value of Object.values(mapDesktop(Number.NaN))) {
      if (typeof value === "number") expect(Number.isFinite(value)).toBe(true);
    }
  });
});

describe("stepCriticallyDamped", () => {
  test("settles a coarse wheel jump without overshoot in about 180ms", () => {
    let state = { value: 0, velocity: 0 };
    for (let frame = 0; frame < 33; frame += 1) {
      state = stepCriticallyDamped(state, 1, 1 / 60, 0.18);
      expect(state.value).toBeGreaterThanOrEqual(0);
      expect(state.value).toBeLessThanOrEqual(1);
    }
    expect(state.value).toBeGreaterThan(0.98);
  });

  test("reverses immediately toward a newer scroll target", () => {
    const next = stepCriticallyDamped(
      { value: 0.8, velocity: 1.4 },
      0.2,
      1 / 60,
      0.18,
    );
    const after = stepCriticallyDamped(next, 0.2, 1 / 60, 0.18);
    expect(after.value).toBeLessThan(next.value);
  });
});
