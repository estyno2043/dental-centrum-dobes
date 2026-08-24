/**
 * The shared shape of the service photograph's morph.
 *
 * Deliberately in a module with no `"use client"` on it: these are imported by
 * both the client hook that runs the animation and the server component that
 * renders its destination, and a value exported from a client module reaches
 * the server as a client *reference* rather than as itself.
 *
 * The look of the destination backdrop lives here, not in the stylesheet, and
 * is applied inline by the page. That is what lets the flying clone land
 * *exactly* on the real thing: two copies of the same filter, one in CSS and
 * one in script, drift apart the first time either is touched, and the symptom
 * is a flicker at the end of the animation that nobody can explain.
 */

/** The card marks the box the morph starts from — the frame, not the picture. */
export const CARD_PHOTO_ATTRIBUTE = "data-service-photo";

/** The incoming page marks its backdrop, so the hook knows when it has landed. */
export const BACKDROP_ATTRIBUTE = "data-service-backdrop";

/** How long the photograph takes to grow into the page. */
export const MORPH_MS = 560;

/** The site's easing. */
export const MORPH_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/** What the photograph looks like once it is the page's background. */
export const BACKDROP_FILTER =
  "blur(9px) saturate(0.42) brightness(1.28) contrast(0.82)";

/** And the porcelain laid over it, so ink reads on any photograph. */
export const BACKDROP_SCRIM =
  "linear-gradient(to bottom, " +
  "rgb(250 249 246 / 92%) 0%, " +
  "rgb(250 249 246 / 82%) 30%, " +
  "rgb(250 249 246 / 84%) 66%, " +
  "rgb(250 249 246 / 94%) 100%)";
