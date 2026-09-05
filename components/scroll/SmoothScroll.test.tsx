import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const destroy = vi.fn();
const raf = vi.fn();
const construct = vi.fn();
const stop = vi.fn();
const start = vi.fn();

let pathname = "/";

vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => pathname,
}));

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
    pathname = "/";
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
   * Lenis keeps its own idea of where the page is, and syncs it to the
   * document only while it is not mid-ease — `onNativeScroll` bails unless
   * `isScrolling` is `false` or `"native"`. The router moves the page with an
   * ordinary programmatic scroll, so across a navigation Lenis would keep
   * easing towards the offset of the page the reader had just left.
   *
   * `stop()` then `start()` is Lenis's reset through its public API: both run
   * the private `reset()`, which clears `isScrolling`, and `start()` leaves it
   * running. Order matters — `start()` returns early unless it is stopped, so
   * calling them the other way round does nothing at all.
   */
  const resets = () => {
    expect(stop).toHaveBeenCalledTimes(start.mock.calls.length);
    for (let i = 0; i < stop.mock.calls.length; i++) {
      expect(stop.mock.invocationCallOrder[i]).toBeLessThan(
        start.mock.invocationCallOrder[i]!,
      );
    }
    return stop.mock.calls.length;
  };

  /*
   * The one that was actually reported. A service page's close button is a
   * `<button>`, and with no history behind it it calls `router.push("/")` —
   * which fires no `popstate`, and which `stopInertiaOnNavigate` cannot see
   * either, since that only watches link clicks. The router scrolled the
   * homepage to the top and Lenis eased back down to the service page's
   * offset, landing the reader a couple of thousand pixels in.
   *
   * Keying on the pathname watches the outcome instead of enumerating the
   * triggers, so it covers links, `push` from a button, `back`, and the
   * browser's own arrows at once.
   */
  it("resets on any route change, however it was caused", () => {
    stubMedia();
    const { rerender } = render(<SmoothScroll />);
    const atMount = resets();

    pathname = "/sluzby/esteticka-stomatologia";
    rerender(<SmoothScroll />);

    expect(resets()).toBe(atMount + 1);
  });

  it("makes Lenis receptive again when the reader goes back", () => {
    stubMedia();
    render(<SmoothScroll />);
    const before = resets();

    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(resets()).toBe(before + 1);
  });

  it("stops listening for history moves on unmount", () => {
    stubMedia();
    const { unmount } = render(<SmoothScroll />);

    unmount();
    stop.mockClear();
    start.mockClear();
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
