import { describe, expect, test } from "vitest";
import {
  DESKTOP_STORY_SCROLL_VH,
  MOBILE_STORY_SCROLL_VH,
  mapClinicStoryMotion,
  stepCriticallyDamped,
} from "./clinicStoryMotion";

describe("mapClinicStoryMotion desktop", () => {
  test.each([
    [0, { grow: 0, pan: 0, zoom: 0, blur: 0, jawOpacity: 0, globalTime: 0 }],
    [84, { grow: 1, pan: 0, zoom: 0, blur: 0, jawOpacity: 0, globalTime: 0 }],
    [232, { grow: 1, pan: 0.5, zoom: 0, blur: 0, jawOpacity: 0, globalTime: 0 }],
    [380, { grow: 1, pan: 1, zoom: 0, blur: 0, jawOpacity: 0, globalTime: 0 }],
    [442, { grow: 1, pan: 1, zoom: 0.62, blur: 0, jawOpacity: 0, globalTime: 0 }],
    [480, { grow: 1, pan: 1, zoom: 1, blur: 1, jawOpacity: 1, globalTime: 0 }],
    [705, { grow: 1, pan: 1, zoom: 1, blur: 1, jawOpacity: 1, globalTime: 4 }],
    [930, { grow: 1, pan: 1, zoom: 1, blur: 1, jawOpacity: 1, globalTime: 8 }],
    [1030, { grow: 1, pan: 1, zoom: 1, blur: 1, jawOpacity: 1, globalTime: 8 }],
  ])("maps %svh to locked desktop phases", (scrollVh, expected) => {
    expect(mapClinicStoryMotion(scrollVh, "desktop")).toMatchObject(expected);
  });

  test("clamps both directions and reproduces state while scrolling backwards", () => {
    expect(mapClinicStoryMotion(-100, "desktop")).toEqual(
      mapClinicStoryMotion(0, "desktop"),
    );
    expect(mapClinicStoryMotion(9999, "desktop")).toEqual(
      mapClinicStoryMotion(DESKTOP_STORY_SCROLL_VH, "desktop"),
    );
    expect(mapClinicStoryMotion(510, "desktop")).toEqual(
      mapClinicStoryMotion(510, "desktop"),
    );
  });

  test("fades final statement from decoded time 6.7 to 7.4 seconds", () => {
    expect(mapClinicStoryMotion(480 + (450 * 6.7) / 8, "desktop").finalOpacity).toBe(0);
    expect(mapClinicStoryMotion(480 + (450 * 7.05) / 8, "desktop").finalOpacity).toBe(0.5);
    expect(mapClinicStoryMotion(480 + (450 * 7.4) / 8, "desktop").finalOpacity).toBe(1);
  });
});

describe("mapClinicStoryMotion mobile", () => {
  test.each([
    [0, { grow: 1, pan: 0, snap: 0, zoom: 0, blur: 0, jawOpacity: 0, globalTime: 0 }],
    [90, { grow: 1, pan: 0, snap: 0, zoom: 0, blur: 0, jawOpacity: 0, globalTime: 0 }],
    [110, { grow: 1, pan: 0, snap: 0.5, zoom: 0, blur: 0, jawOpacity: 0, globalTime: 0 }],
    [130, { grow: 1, pan: 0, snap: 1, zoom: 0, blur: 0, jawOpacity: 0, globalTime: 0 }],
    [192, { grow: 1, pan: 0, snap: 1, zoom: 0.62, blur: 0, jawOpacity: 0, globalTime: 0 }],
    [230, { grow: 1, pan: 0, snap: 1, zoom: 1, blur: 1, jawOpacity: 1, globalTime: 0 }],
    [455, { grow: 1, pan: 0, snap: 1, zoom: 1, blur: 1, jawOpacity: 1, globalTime: 4 }],
    [680, { grow: 1, pan: 0, snap: 1, zoom: 1, blur: 1, jawOpacity: 1, globalTime: 8 }],
    [780, { grow: 1, pan: 0, snap: 1, zoom: 1, blur: 1, jawOpacity: 1, globalTime: 8 }],
  ])("maps %svh to swipe, snap, handoff and scrub", (scrollVh, expected) => {
    expect(mapClinicStoryMotion(scrollVh, "mobile")).toMatchObject(expected);
  });

  test("clamps mobile range", () => {
    expect(mapClinicStoryMotion(-1, "mobile")).toEqual(
      mapClinicStoryMotion(0, "mobile"),
    );
    expect(mapClinicStoryMotion(900, "mobile")).toEqual(
      mapClinicStoryMotion(MOBILE_STORY_SCROLL_VH, "mobile"),
    );
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
