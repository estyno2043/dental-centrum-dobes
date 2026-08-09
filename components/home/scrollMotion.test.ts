import { describe, expect, test } from "vitest";
import { mapExperienceMotion, mapPhotoStripMotion } from "./scrollMotion";

describe("mapExperienceMotion", () => {
  test("opens a square photograph before revealing copy", () => {
    expect(mapExperienceMotion(0)).toMatchObject({
      clipPath: "inset(50% 50% 50% 50% round 0px)",
      copyOpacity: 0,
    });
    expect(mapExperienceMotion(0.3)).toMatchObject({
      clipPath: "inset(0% 0% 0% 0% round 0px)",
      copyOpacity: 0,
    });
    expect(mapExperienceMotion(0.46).copyOpacity).toBe(1);
  });

  test("keeps copy still during its readable dwell", () => {
    expect(mapExperienceMotion(0.6)).toMatchObject({
      copyOpacity: 1,
      copyY: 0,
      veilOpacity: 0,
    });
  });

  test("covers the statement photograph with its own exit veil", () => {
    expect(mapExperienceMotion(0.72).veilOpacity).toBe(0);
    expect(mapExperienceMotion(0.9)).toMatchObject({
      veilOpacity: 1,
      storyScale: 0.98,
      copyOpacity: 0,
    });
  });

  test("clamps progress outside the scroll range", () => {
    expect(mapExperienceMotion(-1)).toEqual(mapExperienceMotion(0));
    expect(mapExperienceMotion(2)).toEqual(mapExperienceMotion(1));
  });
});

describe("mapPhotoStripMotion", () => {
  test.each([
    [0, 0, 0],
    [0.22, 1, 0],
    [0.61, 1, 0.5],
    [1, 1, 1],
  ])("maps progress %s to grow %s and pan %s", (progress, grow, pan) => {
    expect(mapPhotoStripMotion(progress)).toEqual({ grow, pan });
  });

  test("clamps progress outside the photo strip", () => {
    expect(mapPhotoStripMotion(-1)).toEqual({ grow: 0, pan: 0 });
    expect(mapPhotoStripMotion(2)).toEqual({ grow: 1, pan: 1 });
  });
});
