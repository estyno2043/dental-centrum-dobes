"use client";

import { useEffect } from "react";

import { BACKDROP_ATTRIBUTE } from "./serviceMorph";

/**
 * Lets the service page's photograph go once the reader is past the intro.
 *
 * The backdrop is fixed behind the whole page, so its blurred, washed
 * photograph sat behind every section down to the booking form. The
 * 2026-09-26 audit found that it read as a smudge rather than an atmosphere
 * everywhere but the top. It now stays whole for the first tenth of a screen,
 * where the photograph has just grown out of its catalogue card, and fades to
 * the page's own ground over the next eight tenths.
 *
 * The exit morph builds its own full-screen clone and never reads the
 * backdrop, so a faded backdrop does not change the way back.
 *
 * One style write per scroll frame, on one element, and opacity only.
 */
export function BackdropFade(): null {
  useEffect(() => {
    const backdrop = document.querySelector<HTMLElement>(`[${BACKDROP_ATTRIBUTE}]`);
    if (!backdrop) return;

    const update = () => {
      const screen = window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, (window.scrollY - screen * 0.1) / (screen * 0.8)));
      backdrop.style.opacity = String(1 - progress);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      backdrop.style.opacity = "";
    };
  }, []);

  return null;
}
