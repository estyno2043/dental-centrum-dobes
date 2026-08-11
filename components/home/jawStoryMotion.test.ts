import { describe, expect, test } from "vitest";
import {
  JAW_STORY_END,
  JAW_STORY_START,
  mapJawStoryMotion,
  mapJawTarget,
  selectJawSegment,
  stepSmoothedProgress,
} from "./jawStoryMotion";

describe("selectJawSegment", () => {
  test.each([
    [0, 0, 0],
    [1.25, 0, 1.25],
    [2, 1, 0],
    [4.5, 2, 0.5],
    [8, 3, 2],
  ])(
    "maps global time %s to segment %s at local time %s",
    (globalTime, index, localTime) => {
      expect(selectJawSegment(globalTime)).toMatchObject({ index, localTime });
    },
  );

  test("clamps time outside the generated media", () => {
    expect(selectJawSegment(-1)).toMatchObject({ index: 0, localTime: 0 });
    expect(selectJawSegment(99)).toMatchObject({ index: 3, localTime: 2 });
  });
});

describe("mapJawStoryMotion", () => {
  test("keeps media at its first frame until the photo handoff begins", () => {
    expect(mapJawStoryMotion(0)).toMatchObject({
      blur: 1,
      jawOpacity: 0,
      globalTime: 0,
    });
    expect(mapJawStoryMotion(JAW_STORY_START).globalTime).toBe(0);
  });

  test("uses the full generated timeline before the final statement", () => {
    expect(mapJawStoryMotion(JAW_STORY_END)).toMatchObject({
      globalTime: 8,
      finalOpacity: 1,
    });
  });

  test("shows one annotation at a time", () => {
    expect(mapJawStoryMotion(0.28).callouts).toEqual({
      bite: 1,
      tooth: 0,
      gum: 0,
    });
    expect(mapJawStoryMotion(0.47).callouts).toEqual({
      bite: 0,
      tooth: 1,
      gum: 0,
    });
    expect(mapJawStoryMotion(0.66).callouts).toEqual({
      bite: 0,
      tooth: 0,
      gum: 1,
    });
  });
});

describe("mapJawTarget", () => {
  test("keeps every tracked target inside normalized video bounds", () => {
    for (const kind of ["bite", "tooth", "gum"] as const) {
      for (const time of [0, 2, 4, 6, 8]) {
        const point = mapJawTarget(kind, time);
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(1);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(1);
      }
    }
  });

  test("moves the target with the zooming jaw", () => {
    expect(mapJawTarget("bite", 1)).not.toEqual(mapJawTarget("bite", 6));
  });
});

describe("stepSmoothedProgress", () => {
  test("approaches coarse wheel jumps without overshooting", () => {
    const next = stepSmoothedProgress(0, 1, 1 / 60);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
  });

  test("reverses toward trackpad or wheel target", () => {
    const next = stepSmoothedProgress(0.8, 0.2, 1 / 60);
    expect(next).toBeGreaterThan(0.2);
    expect(next).toBeLessThan(0.8);
  });

  test("snaps tiny residual error to the exact target", () => {
    expect(stepSmoothedProgress(0.50005, 0.5, 1 / 60)).toBe(0.5);
  });
});
