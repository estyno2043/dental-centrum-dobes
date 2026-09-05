import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const destroy = vi.fn();
const raf = vi.fn();
const construct = vi.fn();
const stop = vi.fn();
const start = vi.fn();

vi.mock("lenis", () => ({
  default: class {
    constructor(options: unknown) {
      construct(options);
    }
    raf = raf;
    destroy = destroy;
    stop = stop;
    start = start;
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
    stop.mockClear();
    start.mockClear();
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


  /*
   * Back and forward.
   *
   * The router restores the previous page's scroll position with an ordinary
   * programmatic scroll, and Lenis ignores those while it is mid-ease — its
   * `onNativeScroll` bails unless `isScrolling` is `false` or `"native"`. So
   * somebody who scrolled a service page and pressed back was carried to that
   * page's offset on the homepage rather than to the card they had opened it
   * from.
   *
   * `stop()` then `start()` is Lenis's reset through its public API: both run
   * the private `reset()`, which clears `isScrolling`, and `start()` leaves it
   * running. Order matters — `start()` returns early unless it is stopped, so
   * calling them the other way round does nothing at all.
   */
  it("makes Lenis receptive again when the reader goes back", () => {
    stubMedia();
    render(<SmoothScroll />);

    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(stop).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledTimes(1);
    expect(stop.mock.invocationCallOrder[0]).toBeLessThan(
      start.mock.invocationCallOrder[0]!,
    );
  });

  it("stops listening for history moves on unmount", () => {
    stubMedia();
    const { unmount } = render(<SmoothScroll />);

    unmount();
    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(stop).not.toHaveBeenCalled();
  });

  /*
   * Leaving by a link kills the ease outright, so no inertia left over from
   * the wheel carries into the page that opens and scrolls it to an offset
   * that belonged to the page before it.
   */
  it("drops its inertia when a link leaves the route", () => {
    stubMedia();
    render(<SmoothScroll />);

    expect(construct).toHaveBeenCalledWith(
      expect.objectContaining({ stopInertiaOnNavigate: true }),
    );
  });

  it("tears down its loop on unmount", () => {
    stubMedia();
    const { unmount } = render(<SmoothScroll />);

    unmount();
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
