"use client";

import { useCallback } from "react";

import {
  BACKDROP_SCRIM,
  MORPH_EASING,
  MORPH_MS,
  takeMorph,
} from "./serviceMorph";

/**
 * Closing a service page: the same morph as opening one, run backwards.
 *
 * The photograph shrinks out of the page and back into the card it grew from,
 * while the cream over it thins away and reveals the catalogue underneath.
 * Where the entry animation ends is where this one starts.
 *
 * It travels sharp for the same reason the entry does — animating towards a
 * full-screen blur means re-rendering a gaussian on every frame — and it can
 * start sharp without a visible jump because the cream sits over it at nearly
 * full strength for the first moments, which is most of what the blur was
 * doing.
 *
 * Returns a function that plays the animation and reports whether it did. When
 * it cannot — no remembered card, a resized window, motion unwelcome — the
 * caller simply navigates.
 */
export function useServiceExit() {
  return useCallback((): boolean => {
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return false;
    }

    const morph = takeMorph();
    if (!morph) return false;

    const flying = document.createElement("img");
    flying.src = morph.src;
    flying.alt = "";
    flying.setAttribute("aria-hidden", "true");
    flying.style.cssText = [
      "position:fixed",
      "z-index:9999",
      "margin:0",
      "left:0",
      "top:0",
      "width:100vw",
      "height:100vh",
      "object-fit:cover",
      "pointer-events:none",
      "will-change:left,top,width,height",
    ].join(";");

    const veil = document.createElement("div");
    veil.setAttribute("aria-hidden", "true");
    veil.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:9999",
      "pointer-events:none",
      `background:${BACKDROP_SCRIM}`,
    ].join(";");

    document.body.append(flying, veil);

    const timing: KeyframeAnimationOptions = {
      duration: MORPH_MS,
      easing: MORPH_EASING,
      fill: "both",
    };

    const shrink = flying.animate(
      [
        {
          left: "0px",
          top: "0px",
          width: "100vw",
          height: "100vh",
          borderRadius: "0px",
        },
        {
          left: `${morph.left}px`,
          top: `${morph.top}px`,
          width: `${morph.width}px`,
          height: `${morph.height}px`,
          borderRadius: morph.radius,
        },
      ],
      timing,
    );

    /* Thins away as the picture goes, so the catalogue arrives with it. */
    const fade = veil.animate([{ opacity: 1 }, { opacity: 0 }], timing);

    let cleared = false;
    const cleanup = () => {
      if (cleared) return;
      cleared = true;
      flying.remove();
      veil.remove();
    };

    Promise.all([
      shrink.finished.catch(() => undefined),
      fade.finished.catch(() => undefined),
    ]).then(cleanup);

    /*
     * The same backstop the entry has. A clone is an opaque thing covering the
     * screen, and every reason it might never be told to leave — a paused
     * clock, an animation the browser declines — ends with the page unusable
     * behind it.
     */
    setTimeout(cleanup, MORPH_MS + 1400);

    return true;
  }, []);
}
