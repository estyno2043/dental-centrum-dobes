"use client";

import { useEffect } from "react";
import Lenis from "lenis";

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

    return () => {
      query.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  return null;
}
