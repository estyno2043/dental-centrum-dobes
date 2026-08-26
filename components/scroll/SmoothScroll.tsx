"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { SCROLL_REQUEST, type ScrollRequest } from "./scrollToSection";

/**
 * Eased scrolling, site-wide.
 *
 * Renders nothing. Lenis in its default mode does not transform a wrapper —
 * it intercepts the wheel, eases towards a target, and performs a *real*
 * scroll every frame. That distinction is the whole reason this is safe here:
 * `getBoundingClientRect()`, `window.scrollY`, `scroll` events and the five
 * `position: sticky` scenes all keep reading exactly what they read before.
 * A transform-based library would have broken every one of them.
 *
 * What does change is that scroll position now trails the input slightly, and
 * everything driven off it inherits that. The jaw is the one place where that
 * is a judgement call rather than an improvement: it maps scroll position to a
 * frame index, so the sequence trails the finger. `lerp` is kept high (0.12
 * rather than the 0.05-ish of a showreel site) precisely to keep that short.
 *
 * ⚠️ Off entirely under `prefers-reduced-motion`, and it re-checks when that
 * setting changes rather than only at mount. Hijacking the wheel overrides
 * choices people have made at the level of their operating system, and for
 * some of them motion that continues after the gesture stops is a cause of
 * nausea, not polish. Native scrolling is the correct behaviour there, not a
 * degraded one.
 */
export function SmoothScroll() {
  useEffect(() => {
    const query = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;

    let lenis: Lenis | null = null;
    let frame = 0;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        lerp: 0.12,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
        /*
         * Touch is left alone. Phones and trackpads already have inertia of
         * their own, tuned by the platform; adding a second easing on top is
         * what makes a site feel like it is fighting your thumb.
         */
        syncTouch: false,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      lenis = null;
    };

    if (!query.matches) start();

    const onChange = () => (query.matches ? stop() : start());
    query.addEventListener("change", onChange);

    /*
     * The menu's travel requests land here, because this is the only place
     * that holds the instance. Cancelling the event is how the menu learns it
     * was taken; leaving it alone lets the browser jump as usual, which is
     * what should happen when there is no eased scrolling to do.
     *
     * The journey is timed by its own length. A fixed duration gets both ends
     * wrong — a short hop feels sluggish and the full-page haul feels hurried
     * — so scaling by distance keeps the pace even instead. The homepage is
     * some twenty thousand pixels tall, which is why the ceiling matters.
     */
    const onRequest = (event: Event) => {
      if (!lenis) return;
      const target = document.getElementById(
        (event as ScrollRequest).detail.id,
      );
      if (!target) return;

      event.preventDefault();
      const distance = Math.abs(target.getBoundingClientRect().top);
      lenis.scrollTo(target, {
        duration: Math.min(2.4, Math.max(0.85, distance / 2400)),
      });
    };
    window.addEventListener(SCROLL_REQUEST, onRequest);

    return () => {
      query.removeEventListener("change", onChange);
      window.removeEventListener(SCROLL_REQUEST, onRequest);
      stop();
    };
  }, []);

  return null;
}
