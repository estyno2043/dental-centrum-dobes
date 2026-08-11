import { describe, expect, test } from "vitest";
import {
  JAW_TRACKING_SAMPLE_COUNT,
  JAW_TRACKING_STEP,
  getJawTrackingModel,
  mapJawSourcePointToViewport,
} from "./jawTracking";

describe("mapJawSourcePointToViewport", () => {
  test("maps 1920×1080 source pixels directly into a 16:9 viewport", () => {
    expect(
      mapJawSourcePointToViewport(
        { x: 960, y: 540 },
        { width: 1920, height: 1080 },
        "desktop",
      ),
    ).toEqual({ x: 960, y: 540 });
  });

  test("applies exact object-fit cover crop on 1440×900 desktop", () => {
    expect(
      mapJawSourcePointToViewport(
        { x: 0, y: 0 },
        { width: 1440, height: 900 },
        "desktop",
      ),
    ).toEqual({ x: -80, y: 0 });
    expect(
      mapJawSourcePointToViewport(
        { x: 960, y: 540 },
        { width: 1440, height: 900 },
        "desktop",
      ),
    ).toEqual({ x: 720, y: 450 });
  });

  test("reproduces encoder crop and foreground placement in 720×1280 mobile asset", () => {
    expect(
      mapJawSourcePointToViewport(
        { x: 620, y: 0 },
        { width: 720, height: 1280 },
        "mobile",
      ),
    ).toEqual({ x: 0, y: 341 });
    expect(
      mapJawSourcePointToViewport(
        { x: 1270, y: 540 },
        { width: 720, height: 1280 },
        "mobile",
      ),
    ).toEqual({ x: 360, y: 640 });
    expect(
      mapJawSourcePointToViewport(
        { x: 1920, y: 1080 },
        { width: 720, height: 1280 },
        "mobile",
      ),
    ).toEqual({ x: 720, y: 939 });
  });

  test("then applies object-fit cover for a 375×812 phone viewport", () => {
    expect(
      mapJawSourcePointToViewport(
        { x: 1270, y: 540 },
        { width: 375, height: 812 },
        "mobile",
      ),
    ).toEqual({ x: 187.5, y: 406 });
  });
});

describe("jaw tracking calibration", () => {
  test("provides a sample every 0.2 seconds through the eight-second master", () => {
    expect(JAW_TRACKING_STEP).toBe(0.2);
    expect(JAW_TRACKING_SAMPLE_COUNT).toBe(41);

    for (const kind of ["bite", "tooth", "gum"] as const) {
      for (let index = 0; index < JAW_TRACKING_SAMPLE_COUNT; index += 1) {
        const model = getJawTrackingModel(kind, index * JAW_TRACKING_STEP, "desktop");
        expect(model.time).toBeCloseTo(index * JAW_TRACKING_STEP, 5);
        expect(model.target.x).toBeGreaterThanOrEqual(0);
        expect(model.target.x).toBeLessThanOrEqual(1920);
        expect(model.target.y).toBeGreaterThanOrEqual(0);
        expect(model.target.y).toBeLessThanOrEqual(1080);
        expect(model.profile).toBe("desktop");
      }
    }
  });

  test("clamps time and interpolates card safe-zone anchors", () => {
    expect(getJawTrackingModel("bite", -1, "mobile").time).toBe(0);
    expect(getJawTrackingModel("bite", 99, "mobile").time).toBe(8);
    expect(getJawTrackingModel("bite", 1, "mobile").cardAnchor).not.toEqual(
      getJawTrackingModel("bite", 6, "mobile").cardAnchor,
    );
  });
});
