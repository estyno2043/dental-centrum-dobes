import { describe, expect, test } from "vitest";
import { computeJawPose } from "./jawPose";

const bounds = { width: 10, height: 6, depth: 4 };

describe("computeJawPose", () => {
  test("returns the small closed arrival pose before jaw motion begins", () => {
    expect(computeJawPose({ jawOpen: 0, jawSeparation: 0 }, bounds)).toEqual({
      rootScale: 0.55,
      rootYaw: -0.16,
      rootPitch: 0,
      upperY: 0,
      lowerY: 0,
      premolarOffset: 0,
      molarOffset: 0,
      gumDepth: 0,
    });
  });

  test("opens and tilts the arches symmetrically before zones separate", () => {
    const pose = computeJawPose({ jawOpen: 1, jawSeparation: 0 }, bounds);

    expect(pose.rootScale).toBe(1);
    expect(pose.rootYaw).toBe(0);
    expect(pose.rootPitch).toBeCloseTo(-Math.PI / 10);
    expect(pose.upperY).toBeCloseTo(0.72);
    expect(pose.lowerY).toBeCloseTo(-0.72);
    expect(pose.premolarOffset).toBe(0);
    expect(pose.molarOffset).toBe(0);
    expect(pose.gumDepth).toBe(0);
  });

  test("interpolates the root and symmetric arches at half open", () => {
    const pose = computeJawPose({ jawOpen: 0.5, jawSeparation: 0 }, bounds);

    expect(pose.rootScale).toBeCloseTo(0.775);
    expect(pose.rootYaw).toBeCloseTo(-0.08);
    expect(pose.rootPitch).toBeCloseTo(-Math.PI / 20);
    expect(pose.upperY).toBeCloseTo(0.36);
    expect(pose.lowerY).toBeCloseTo(-0.36);
  });

  test("uses half the final offsets at half separation", () => {
    const pose = computeJawPose({ jawOpen: 1, jawSeparation: 0.5 }, bounds);

    expect(pose.premolarOffset).toBeCloseTo(0.4);
    expect(pose.molarOffset).toBeCloseTo(0.9);
    expect(pose.gumDepth).toBeCloseTo(0.06);
  });

  test("returns the final symmetric separation magnitudes", () => {
    const pose = computeJawPose({ jawOpen: 1, jawSeparation: 1 }, bounds);

    expect(pose.rootScale).toBe(1);
    expect(pose.rootPitch).toBeCloseTo(-Math.PI / 10);
    expect(pose.upperY).toBeCloseTo(0.72);
    expect(pose.lowerY).toBeCloseTo(-0.72);
    expect(pose.premolarOffset).toBeCloseTo(0.8);
    expect(pose.molarOffset).toBeCloseTo(1.8);
    expect(pose.gumDepth).toBeCloseTo(0.12);
  });

  test("clamps phase inputs before deriving transforms", () => {
    expect(computeJawPose({ jawOpen: -1, jawSeparation: -2 }, bounds)).toEqual(
      computeJawPose({ jawOpen: 0, jawSeparation: 0 }, bounds),
    );
    expect(computeJawPose({ jawOpen: 2, jawSeparation: 4 }, bounds)).toEqual(
      computeJawPose({ jawOpen: 1, jawSeparation: 1 }, bounds),
    );
  });

  test("reproduces an earlier pose exactly after evaluating a later pose", () => {
    const state = { jawOpen: 0.64, jawSeparation: 0.27 };
    const forward = computeJawPose(state, bounds);

    computeJawPose({ jawOpen: 1, jawSeparation: 1 }, bounds);

    expect(computeJawPose(state, bounds)).toEqual(forward);
  });
});
