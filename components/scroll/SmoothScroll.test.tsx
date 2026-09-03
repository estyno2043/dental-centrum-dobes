import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const destroy = vi.fn();
const raf = vi.fn();
const construct = vi.fn();

vi.mock("lenis", () => ({
  default: class {
    constructor(options: unknown) {
      construct(options);
    }
    raf = raf;
    destroy = destroy;
  },
}));

import { SmoothScroll } from "./SmoothScroll";

/**
 * Minimal matchMedia stub that can flip and notify, like the real one.
 *
 * Answers both queries the component asks: the motion preference, which it
 * watches, and the pointer, which it only samples.
 */
function stubMedia({ reduce = false, coarse = false } = {}) {
  const listeners = new Set<() => void>();
  const motion = {
    matches: reduce,
    addEventListener: (_: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_: string, listener: () => void) => {
      listeners.delete(listener);
    },
  };
  const pointer = {
    matches: coarse,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn((q: string) => (q.includes("pointer") ? pointer : motion)),
  );
  return {
    set(next: boolean) {
      motion.matches = next;
      for (const listener of listeners) listener();
    },
  };
}

describe("SmoothScroll", () => {
  beforeEach(() => {
    construct.mockClear();
    destroy.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("eases the wheel when motion is welcome", () => {
    stubMedia();
    render(<SmoothScroll />);

    expect(construct).toHaveBeenCalledTimes(1);
  });

  /*
   * The one rule that is not a preference. Hijacking the wheel overrides a
   * choice made at the level of the operating system, and for some people
   * motion that continues after the gesture stops causes nausea. Native
   * scrolling is the correct behaviour there, not a degraded one.
   */
  it("never starts when reduced motion is asked for", () => {
    stubMedia({ reduce: true });
    render(<SmoothScroll />);

    expect(construct).not.toHaveBeenCalled();
  });

  it("stops and starts when the setting changes mid-session", () => {
    const media = stubMedia();
    render(<SmoothScroll />);
    expect(construct).toHaveBeenCalledTimes(1);

    media.set(true);
    expect(destroy).toHaveBeenCalledTimes(1);

    media.set(false);
    expect(construct).toHaveBeenCalledTimes(2);
  });

  /*
   * A phone gets nothing from this — `syncTouch` is off, so it eases nothing —
   * while still spending a rAF loop every frame against the jaw sequence's
   * canvas draws. It was reported as heavy stutter on a real device.
   */
  it("never starts on a touch device", () => {
    stubMedia({ coarse: true });
    render(<SmoothScroll />);

    expect(construct).not.toHaveBeenCalled();
  });

  it("tears down its loop on unmount", () => {
    stubMedia();
    const { unmount } = render(<SmoothScroll />);

    unmount();
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
