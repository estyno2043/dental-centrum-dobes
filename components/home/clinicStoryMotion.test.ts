import { describe, expect, test } from "vitest";
import {
  DESKTOP_PHASES,
  DESKTOP_STORY_SCROLL_VH,
  MOBILE_PHASES,
  MOBILE_STORY_SCROLL_VH,
  mapClinicStoryMotion,
  stepCriticallyDamped,
  type ClinicStoryMotionState,
} from "./clinicStoryMotion";

const mapDesktop = (
  progressVh: number,
  overrides: Partial<{
    frameCount: number;
    exactEndDrawn: boolean;
    revealComplete: boolean;
  }> = {},
): ClinicStoryMotionState =>
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
): ClinicStoryMotionState =>
  mapClinicStoryMotion({
    progressVh,
    profile: "mobile",
    frameCount: overrides.frameCount ?? 60,
    exactEndDrawn: overrides.exactEndDrawn ?? false,
    revealComplete: overrides.revealComplete ?? false,
  });

describe("mapClinicStoryMotion gallery-first contract", () => {
  test("returns exact phase-driven public fields", () => {
    expect(Object.keys(mapDesktop(0)).sort()).toEqual(
      [
        "cueOpacity",
        "detail",
        "exit",
        "grow",
        "handoff",
        "interactive",
        "mapReveal",
        "pan",
        "phase",
        "sequenceProgress",
        "targetFrame",
        "teaseProgress",
        "zonesVisible",
      ].sort(),
    );
  });

  test("exports locked desktop and mobile boundaries", () => {
    expect(DESKTOP_PHASES).toEqual({
      galleryEnd: 370,
      detailEnd: 460,
      detailDwellEnd: 500,
      handoffEnd: 530,
      openingEnd: 630,
      teaseEnd: 660,
      mapEnd: 700,
      interactiveEnd: 860,
      storyEnd: 990,
    });
    expect(MOBILE_PHASES).toEqual({
      galleryEnd: 90,
      snapEnd: 130,
      detailDwellEnd: 170,
      handoffEnd: 200,
      openingEnd: 345,
      teaseEnd: 385,
      mapEnd: 430,
      interactiveEnd: 610,
      storyEnd: 710,
    });
    expect(Object.isFrozen(DESKTOP_PHASES)).toBe(true);
    expect(Object.isFrozen(MOBILE_PHASES)).toBe(true);
  });

  test.each([
    [0, "gallery", 0, 0, 0, 0],
    [84, "gallery", 1, 0, 0, 0],
    [370, "detail", 1, 1, 0, 0],
    [460, "detail", 1, 1, 1, 0],
    [499, "detail", 1, 1, 1, 0],
    [500, "handoff", 1, 1, 1, 0],
    [530, "opening", 1, 1, 1, 0],
    [580, "opening", 1, 1, 1, 0.5],
    [630, "tease", 1, 1, 1, 1],
    [660, "map", 1, 1, 1, 1],
    [700, "interactive", 1, 1, 1, 1],
    [860, "exit", 1, 1, 1, 1],
    [990, "exit", 1, 1, 1, 1],
  ])(
    "maps desktop %svh to %s",
    (progressVh, phase, grow, pan, detail, sequenceProgress) => {
      const state = mapDesktop(progressVh as number);
      expect(state.phase).toBe(phase);
      expect(state.grow).toBeCloseTo(grow as number, 4);
      expect(state.pan).toBeCloseTo(pan as number, 4);
      expect(state.detail).toBeCloseTo(detail as number, 4);
      expect(state.sequenceProgress).toBeCloseTo(sequenceProgress as number, 4);
    },
  );

  test("holds fullscreen detail before any handoff or jaw frame", () => {
    expect(mapDesktop(459.99)).toMatchObject({
      phase: "detail",
      detail: expect.closeTo(89.99 / 90, 6),
      handoff: 0,
      sequenceProgress: 0,
      targetFrame: 1,
    });
    expect(mapDesktop(499.99)).toMatchObject({
      phase: "detail",
      detail: 1,
      handoff: 0,
      sequenceProgress: 0,
      targetFrame: 1,
    });
    expect(mapDesktop(529.99).sequenceProgress).toBe(0);
  });

  test("shows Zóny bolesti cue only during opening", () => {
    expect(mapDesktop(534.99).cueOpacity).toBe(0);
    expect(mapDesktop(540).cueOpacity).toBeGreaterThan(0);
    expect(mapDesktop(550).cueOpacity).toBe(1);
    expect(mapDesktop(580).cueOpacity).toBe(1);
    expect(mapDesktop(612).cueOpacity).toBe(1);
    expect(mapDesktop(629).cueOpacity).toBeGreaterThan(0);
    expect(mapDesktop(630).cueOpacity).toBe(0);
  });

  test("sequences tease, map reveal, interaction, and gradient exit", () => {
    expect(mapDesktop(629.99)).toMatchObject({ teaseProgress: 0, mapReveal: 0, exit: 0 });
    expect(mapDesktop(645)).toMatchObject({ teaseProgress: 0.5, mapReveal: 0, exit: 0 });
    expect(mapDesktop(680)).toMatchObject({ teaseProgress: 1, mapReveal: 0.5, exit: 0 });
    expect(mapDesktop(859.99).exit).toBe(0);
    expect(mapDesktop(925).exit).toBe(0.5);
    expect(mapDesktop(990).exit).toBe(1);
  });

  test("gates interaction on map endpoint and reveal completion", () => {
    const ready = { exactEndDrawn: true, revealComplete: true };
    expect(mapDesktop(699.99, ready)).toMatchObject({ zonesVisible: true, interactive: false });
    expect(mapDesktop(700, { exactEndDrawn: false, revealComplete: true }).interactive).toBe(false);
    expect(mapDesktop(700, { exactEndDrawn: true, revealComplete: false }).interactive).toBe(false);
    expect(mapDesktop(700, ready)).toMatchObject({ zonesVisible: true, interactive: true });
    expect(mapDesktop(860, ready)).toMatchObject({ zonesVisible: true, interactive: false });
  });

  test("uses shorter desktop opening and one-based target frames", () => {
    expect(mapDesktop(529.99).targetFrame).toBe(1);
    expect(mapDesktop(580).sequenceProgress).toBe(0.5);
    expect(mapDesktop(580).targetFrame).toBe(37);
    expect(mapDesktop(630).targetFrame).toBe(72);
    expect(DESKTOP_PHASES.openingEnd - DESKTOP_PHASES.handoffEnd).toBeLessThan(360);
  });

  test("maps mobile snap, detail dwell, faster opening, map, and exit", () => {
    expect(mapMobile(89.99)).toMatchObject({ phase: "gallery", detail: 0, sequenceProgress: 0 });
    expect(mapMobile(110)).toMatchObject({ phase: "detail", detail: 0.5, sequenceProgress: 0 });
    expect(mapMobile(169.99)).toMatchObject({ phase: "detail", detail: 1, handoff: 0 });
    expect(mapMobile(200)).toMatchObject({ phase: "opening", handoff: 1, sequenceProgress: 0 });
    expect(mapMobile(272.5)).toMatchObject({ phase: "opening", sequenceProgress: 0.5, targetFrame: 31 });
    expect(mapMobile(385)).toMatchObject({ phase: "map", teaseProgress: 1, mapReveal: 0 });
    expect(mapMobile(430, { exactEndDrawn: true, revealComplete: true })).toMatchObject({
      phase: "interactive",
      interactive: true,
    });
    expect(mapMobile(610, { exactEndDrawn: true, revealComplete: true })).toMatchObject({
      phase: "exit",
      interactive: false,
    });
  });

  test("returns identical states during forward and reverse traversal", () => {
    const positions = [0, 84, 369.99, 370, 460, 499.99, 500, 530, 580, 630, 660, 700, 860, 990];
    const forward = new Map(positions.map((position) => [position, mapDesktop(position)]));
    for (const position of positions.toReversed()) {
      expect(mapDesktop(position)).toEqual(forward.get(position));
    }
  });

  test("closes interaction immediately on raw reverse threshold crossing", () => {
    const ready = { exactEndDrawn: true, revealComplete: true };
    expect(mapDesktop(700, ready).interactive).toBe(true);
    expect(mapDesktop(699.99, ready).interactive).toBe(false);
    expect(mapMobile(430, ready).interactive).toBe(true);
    expect(mapMobile(429.99, ready).interactive).toBe(false);
  });

  test("normalizes invalid frame counts and progress", () => {
    for (const frameCount of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(mapDesktop(600, { frameCount }).targetFrame).toBe(1);
    }
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
  test("settles coarse wheel jump without overshoot in about 180ms", () => {
    let state = { value: 0, velocity: 0 };
    for (let frame = 0; frame < 33; frame += 1) {
      state = stepCriticallyDamped(state, 1, 1 / 60, 0.18);
      expect(state.value).toBeGreaterThanOrEqual(0);
      expect(state.value).toBeLessThanOrEqual(1);
    }
    expect(state.value).toBeGreaterThan(0.98);
  });

  test("reverses immediately toward newer scroll target", () => {
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
