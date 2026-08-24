"use client";

import { useRouter } from "next/navigation";
import { useCallback, type MouseEvent } from "react";

import {
  BACKDROP_ATTRIBUTE,
  BACKDROP_SCRIM,
  CARD_PHOTO_ATTRIBUTE,
  MORPH_EASING,
  MORPH_MS,
  SETTLE_MS,
} from "./serviceTransition";

/**
 * Opens a service page by growing its photograph out of the card that was
 * clicked until it fills the screen, landing exactly on the background the
 * new page renders.
 *
 * This was built on the View Transitions API first and that was a mistake. The
 * API skips itself whenever the document is not visible, needs the router's
 * DOM commit to land inside a callback that suppresses rendering, and reports
 * none of its own failures — three ways to end up with no animation and
 * nothing to read. What replaces it is a plain flying clone: an image
 * positioned over the card, animated to fill the viewport, removed once the
 * real page is behind it. It works in every browser, it does not care what the
 * router is doing, and every step of it can be measured.
 *
 * `prefers-reduced-motion` still turns it off — then the `Link` simply
 * navigates.
 */
export function useServiceTransition() {
  const router = useRouter();

  return useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      // Leave modified clicks alone: new tab, new window, download.
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const frame = event.currentTarget.querySelector<HTMLElement>(
        `[${CARD_PHOTO_ATTRIBUTE}]`,
      );
      const source = frame?.querySelector("img");
      if (!frame || !source) return;

      event.preventDefault();

      const from = frame.getBoundingClientRect();

      /*
       * The rounding comes off the card, not off the frame. The frame is the
       * image's container, inset to nothing inside the link and clipped by it,
       * so it has the right rectangle but no corners of its own — reading them
       * there starts the morph square when the card on screen is not.
       */
      const radius = getComputedStyle(event.currentTarget).borderRadius;

      /*
       * The picture itself. `left/top/width/height` are animated rather than a
       * transform: the image is `object-fit: cover` at both ends and the two
       * ends are different shapes, so scaling it would squash the crop on the
       * way. Animating the box keeps the crop honest at every frame, and one
       * element for half a second can afford the layout.
       */
      const flying = document.createElement("img");
      flying.src = source.currentSrc || source.src;
      flying.alt = "";
      flying.setAttribute("aria-hidden", "true");
      flying.style.cssText = [
        "position:fixed",
        "z-index:9999",
        "margin:0",
        "object-fit:cover",
        "pointer-events:none",
        // The box is what moves; telling the compositor so keeps it on its own
        // layer instead of repainting whatever it happens to be over.
        "will-change:left,top,width,height",
      ].join(";");

      /* The porcelain the destination lays over its photograph, arriving with
         it so the landing is not a step change in brightness. */
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

      /*
       * No `filter` in here, deliberately.
       *
       * Animating towards the backdrop's blur meant re-rendering a full-screen
       * gaussian on every frame, which is the single most expensive thing a
       * browser can be asked to do sixty times a second — and it was what made
       * the morph stutter. The clone flies sharp; the blur arrives afterwards,
       * when the clone fades out and the real backdrop shows through. Read as
       * a photograph settling into being a background rather than as a defect.
       */
      const morph = flying.animate(
        [
          {
            left: `${from.left}px`,
            top: `${from.top}px`,
            width: `${from.width}px`,
            height: `${from.height}px`,
            borderRadius: radius,
          },
          {
            left: "0px",
            top: "0px",
            width: "100vw",
            height: "100vh",
            borderRadius: "0px",
          },
        ],
        timing,
      );

      const fade = veil.animate([{ opacity: 0 }, { opacity: 1 }], timing);

      /*
       * The clone comes away only when the real backdrop is behind it. Taking
       * it off on the animation's own schedule shows whatever the router has
       * managed so far, which on a slow load is the old page.
       */
      const landed = new Promise<void>((resolve) => {
        const selector = `[${BACKDROP_ATTRIBUTE}]`;
        if (document.querySelector(selector)) {
          resolve();
          return;
        }
        const settle = () => {
          observer.disconnect();
          clearTimeout(timer);
          resolve();
        };
        const observer = new MutationObserver(() => {
          if (document.querySelector(selector)) settle();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        // However the navigation goes, the clone must not be left on screen.
        const timer = setTimeout(settle, 2000);
      });

      router.push(href);

      /*
       * Idempotent, and called from two places.
       *
       * Normally the clone comes away once the animation has run and the real
       * backdrop is behind it. But a clone is an opaque thing covering the
       * whole screen, and every reason it might never be told to leave —
       * a paused document clock, a rejected navigation, an animation the
       * browser declines to run — ends with the page unusable behind it. So
       * there is also a timer, and it does not ask anyone's permission.
       */
      let cleared = false;
      const cleanup = () => {
        if (cleared) return;
        cleared = true;
        flying.remove();
        veil.remove();
      };

      /*
       * The settle: once the clone has arrived and the real page is behind it,
       * it dissolves into the backdrop it is already sitting exactly on top of.
       * Opacity only, so this half costs the compositor almost nothing.
       */
      Promise.all([
        morph.finished.catch(() => undefined),
        fade.finished.catch(() => undefined),
        landed,
      ]).then(() => {
        if (cleared) return;
        const settle = flying.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: SETTLE_MS,
          easing: "linear",
          fill: "both",
        });
        veil.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: SETTLE_MS,
          easing: "linear",
          fill: "both",
        });
        settle.finished.catch(() => undefined).then(cleanup);
      });

      setTimeout(cleanup, MORPH_MS + SETTLE_MS + 1400);
    },
    [router],
  );
}
