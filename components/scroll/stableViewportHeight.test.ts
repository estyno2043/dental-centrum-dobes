import { afterEach, expect, test } from "vitest";
import {
  resetStableViewportHeight,
  stableViewportHeight,
} from "./stableViewportHeight";

function setViewport(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
}

afterEach(() => {
  resetStableViewportHeight();
});

test("ignores a height-only change, which is all a browser bar does", () => {
  setViewport(390, 844);
  const first = stableViewportHeight();

  /*
   * An iOS address bar retracting during the first flick of a scroll changes
   * nothing but the height. Progress measured against a value that moves then
   * steps at that moment, while the document is resizing for the same reason.
   */
  setViewport(390, 700);

  expect(stableViewportHeight()).toBe(first);
});

test("re-measures when the width changes, which is a rotation", () => {
  setViewport(390, 844);
  expect(stableViewportHeight()).toBe(844);

  setViewport(844, 390);

  expect(stableViewportHeight()).toBe(390);
});

test("never returns zero, so a progress divisor stays safe", () => {
  setViewport(390, 0);

  expect(stableViewportHeight()).toBeGreaterThan(0);
});
