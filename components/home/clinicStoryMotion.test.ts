import { describe, expect, test } from "vitest";
import {
  DESKTOP_STORY_SCROLL_VH,
  MOBILE_STORY_SCROLL_VH,
  mapClinicStoryMotion,
  stepCriticallyDamped,
} from "./clinicStoryMotion";

describe("mapClinicStoryMotion desktop", () => {
  test.each([
    [0, { grow: 0, pan: 0, zoom: 0, blur: 0, jawOpacity: 0 }],
    [84, { grow: 1, pan: 0, zoom: 0, blur: 0, jawOpacity: 0 }],
    [232, { grow: 1, pan: 0.5, zoom: 0, blur: 0, jawOpacity: 0 }],
    [380, { grow: 1, pan: 1, zoom: 0, blur: 0, jawOpacity: 0 }],
    [442, { grow: 1, pan: 1, zoom: 0.62, blur: 0, jawOpacity: 0 }],
    [480, { grow: 1, pan: 1, zoom: 1, blur: 1, jawOpacity: 1 }],
  ])("maps %svh to locked desktop phases", (scrollVh, expected) => {
    expect(mapClinicStoryMotion(scrollVh, "desktop")).toMatchObject(expected);
  });

  test.each([
    [447, { jawOpacity: 0, jawOpen: 0, jawSeparation: 0, interactive: false }],
    [480, { jawOpacity: 1, jawOpen: 0, jawSeparation: 0, interactive: false }],
    [570, { jawOpacity: 1, jawOpen: 0.5, jawSeparation: 0, interactive: false }],
    [660, { jawOpacity: 1, jawOpen: 1, jawSeparation: 0, interactive: false }],
    [750, { jawOpacity: 1, jawOpen: 1, jawSeparation: 0.5, interactive: false }],
    [840, { jawOpacity: 1, jawOpen: 1, jawSeparation: 1, interactive: true }],
    [1020, { jawOpacity: 1, jawOpen: 1, jawSeparation: 1, interactive: true }],
  ])("maps desktop %svh jaw phases", (scrollVh, expected) => {
    expect(mapClinicStoryMotion(scrollVh, "desktop")).toMatchObject(expected);
  });

  test("clamps both directions and reproduces state while scrolling backwards", () => {
    const earlierState = mapClinicStoryMotion(510, "desktop");

    expect(mapClinicStoryMotion(-100, "desktop")).toEqual(
      mapClinicStoryMotion(0, "desktop"),
    );
    expect(mapClinicStoryMotion(9999, "desktop")).toEqual(
      mapClinicStoryMotion(DESKTOP_STORY_SCROLL_VH, "desktop"),
    );
    mapClinicStoryMotion(900, "desktop");
    expect(mapClinicStoryMotion(510, "desktop")).toEqual(earlierState);
  });

  test("reveals labels during the final two thirds of separation", () => {
    expect(mapClinicStoryMotion(720, "desktop").labelsOpacity).toBe(0);
    expect(mapClinicStoryMotion(780, "desktop").labelsOpacity).toBe(0.5);
    expect(mapClinicStoryMotion(840, "desktop").labelsOpacity).toBe(1);
  });

  test.each([
    [480, { globalTime: 0, finalOpacity: 0 }],
    [705, { globalTime: 4, finalOpacity: 0 }],
    [856.875, { globalTime: 6.7, finalOpacity: 0 }],
    [876.5625, { globalTime: 7.05, finalOpacity: 0.5 }],
    [896.25, { globalTime: 7.4, finalOpacity: 1 }],
    [930, { globalTime: 8, finalOpacity: 1 }],
    [1020, { globalTime: 8, finalOpacity: 1 }],
  ])("retains the deprecated desktop video mapping at %svh", (scrollVh, expected) => {
    expect(mapClinicStoryMotion(scrollVh, "desktop")).toMatchObject(expected);
  });
});

describe("mapClinicStoryMotion mobile", () => {
  test.each([
    [0, { grow: 1, pan: 0, snap: 0, zoom: 0, blur: 0, jawOpacity: 0 }],
    [90, { grow: 1, pan: 0, snap: 0, zoom: 0, blur: 0, jawOpacity: 0 }],
    [110, { grow: 1, pan: 0, snap: 0.5, zoom: 0, blur: 0, jawOpacity: 0 }],
    [130, { grow: 1, pan: 0, snap: 1, zoom: 0, blur: 0, jawOpacity: 0 }],
    [192, { grow: 1, pan: 0, snap: 1, zoom: 0.62, blur: 0, jawOpacity: 0 }],
    [230, { grow: 1, pan: 0, snap: 1, zoom: 1, blur: 1, jawOpacity: 1 }],
  ])("maps %svh to swipe, snap, handoff and scrub", (scrollVh, expected) => {
    expect(mapClinicStoryMotion(scrollVh, "mobile")).toMatchObject(expected);
  });

  test.each([
    [230, { jawOpen: 0, jawSeparation: 0, interactive: false }],
    [320, { jawOpen: 0.5, jawSeparation: 0, interactive: false }],
    [410, { jawOpen: 1, jawSeparation: 0, interactive: false }],
    [500, { jawOpen: 1, jawSeparation: 0.5, interactive: false }],
    [590, { jawOpen: 1, jawSeparation: 1, interactive: true }],
    [750, { jawOpen: 1, jawSeparation: 1, interactive: true }],
  ])("maps mobile %svh jaw phases", (scrollVh, expected) => {
    expect(mapClinicStoryMotion(scrollVh, "mobile")).toMatchObject(expected);
  });

  test("reveals labels during the final two thirds of separation", () => {
    expect(mapClinicStoryMotion(470, "mobile").labelsOpacity).toBe(0);
    expect(mapClinicStoryMotion(530, "mobile").labelsOpacity).toBe(0.5);
    expect(mapClinicStoryMotion(590, "mobile").labelsOpacity).toBe(1);
  });

  test.each([
    [230, { globalTime: 0, finalOpacity: 0 }],
    [455, { globalTime: 4, finalOpacity: 0 }],
    [606.875, { globalTime: 6.7, finalOpacity: 0 }],
    [626.5625, { globalTime: 7.05, finalOpacity: 0.5 }],
    [646.25, { globalTime: 7.4, finalOpacity: 1 }],
    [680, { globalTime: 8, finalOpacity: 1 }],
    [750, { globalTime: 8, finalOpacity: 1 }],
  ])("retains the deprecated mobile video mapping at %svh", (scrollVh, expected) => {
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
