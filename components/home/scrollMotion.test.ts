import { describe, expect, test } from "vitest";
import {
  mapExperienceMotion,
} from "./scrollMotion";

describe("mapExperienceMotion", () => {
  test("opens a 32px radiused photograph before revealing copy", () => {
    expect(mapExperienceMotion(0)).toMatchObject({
      clipPath: "inset(50% 50% 50% 50% round 32px)",
      cornerRadius: 32,
      copyOpacity: 0,
    });
    expect(mapExperienceMotion(0.15)).toMatchObject({
      clipPath: "inset(25% 25% 25% 25% round 16px)",
      cornerRadius: 16,
    });
    expect(mapExperienceMotion(0.3)).toMatchObject({
      clipPath: "inset(0% 0% 0% 0% round 0px)",
      cornerRadius: 0,
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
