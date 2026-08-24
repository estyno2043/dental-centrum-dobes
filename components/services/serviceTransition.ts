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
export const MORPH_MS = 680;

/** How long it then takes to settle into being a background. */
export const SETTLE_MS = 260;

/*
 * Gentler than the site's usual easing. `cubic-bezier(0.22, 1, 0.36, 1)` is
 * almost all deceleration — right for something arriving, wrong for something
 * growing, which leaps off the mark and then crawls. This one leaves slowly
 * and still lands softly.
 */
export const MORPH_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

/**
 * What the photograph looks like once it is the page's background.
 *
 * ⚠️ Never animate towards this. A full-screen `blur()` is re-rendered from
 * scratch every frame, and that alone is what made the morph stutter — the
 * clone flies sharp and the blur arrives afterwards, as a settle.
 */
export const BACKDROP_FILTER =
  "blur(9px) saturate(0.5) brightness(1.18) contrast(0.86)";

/**
 * The cream laid over it, so ink reads on any photograph.
 *
 * The clinic's own warm tone rather than porcelain: white washed the pictures
 * out until there was little point having them.
 */
export const BACKDROP_CREAM = "244 240 232";

export const BACKDROP_SCRIM =
  "linear-gradient(to bottom, " +
  `rgb(${BACKDROP_CREAM} / 88%) 0%, ` +
  `rgb(${BACKDROP_CREAM} / 72%) 30%, ` +
  `rgb(${BACKDROP_CREAM} / 76%) 66%, ` +
  `rgb(${BACKDROP_CREAM} / 92%) 100%)`;
